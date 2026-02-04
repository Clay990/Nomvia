import React, { createContext, useContext, useState, useEffect } from 'react';
import { Models } from 'react-native-appwrite';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from "expo-web-browser";
import { OAuthProvider } from "react-native-appwrite";
import { account, databases, APPWRITE_DB_ID, APPWRITE_COLLECTION_USERS } from '../lib/appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  userData: Models.Document | null;
  loading: boolean;
  authMessage: string;
  authError?: boolean;
  setIsLoading: (loading: boolean, message?: string) => void;
  checkAuth: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  authMessage: '',
  setIsLoading: () => {},
  checkAuth: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [userData, setUserData] = useState<Models.Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(false); 
  const router = useRouter();
  const segments = useSegments();

  const setIsLoading = (val: boolean, message: string = '') => {
      setLoading(val);
      setAuthMessage(message);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const redirectUri = "appwrite-callback-6973457f000e977ae601://auth-callback";

      const authUrl = await account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUri,
        redirectUri
      );

      if (!authUrl) {
        throw new Error("Failed to generate OAuth URL");
      }

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        redirectUri
      );

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const secret = url.searchParams.get('secret');
        const userId = url.searchParams.get('userId');
        const error = url.searchParams.get('error');

        if (error) {
           const errorString = JSON.stringify(error);
           if (errorString.includes("access_denied") || errorString.includes("user_oauth2_provider_error")) {
             throw new Error("Google sign-in was cancelled.");
           }
           throw new Error(`Google Login failed: ${error}`);
        }

        if (secret && userId) {
          await account.createSession(userId, secret);
          await SecureStore.setItemAsync('session_active', 'true');
          await checkAuth(); 
        } else {
           throw new Error("Login failed: missing secret in callback");
        }
      } else {
          setLoading(false);
      }
    } catch (error) {
        setLoading(false);
        throw error;
    }
  };

  const checkAuth = async () => {
    setLoading(true);
    setAuthError(false);
    try {
      const currentUser = await account.get();
      let nextUserData: Models.Document | null = null;
      try {
        const userDoc = await databases.getDocument(
          APPWRITE_DB_ID,
          APPWRITE_COLLECTION_USERS,
          currentUser.$id
        );
        nextUserData = userDoc;
      } catch (error: any) {
        if (error.code === 404) {
          console.log("No user document found");
          nextUserData = null;
        } else {
          console.error("Error fetching user document:", error);
           // If it's a network error during doc fetch, we might want to retry rather than assume no doc.
           // But for now, we assume if we have a user but no doc, we treat as new user unless it's strictly a 404.
           // To be safe for prod, strict 404 check is good.
           // If it's NOT 404 (e.g. 500), we probably shouldn't redirect to onboarding yet.
           if (error.code >= 500 || error.message?.includes('Network')) {
               throw error; // Let main catch handle it
           }
        }
      }
      setUser(currentUser);
      setUserData(nextUserData);
      await SecureStore.setItemAsync('session_active', 'true'); 
    } catch (error: any) {
      if (error.code === 401 || error.code === 403) {
          console.log("Not logged in (401/403)");
          setUser(null);
          setUserData(null);
          await SecureStore.deleteItemAsync('session_active');
      } else {
          console.error("Auth Check Failed (System Error):", error);
          // If network error, we don't want to log them out, just show retry
          setAuthError(true);
          // Don't clear user state here if we want to persist "maybe logged in" UI,
          // but usually cleaner to block until we know.
      }
    } finally {
      setAuthChecked(true);
      // We don't set loading false here if we know we're logged in 
      // and likely need to redirect from an auth page.
      // The useEffect will handle setting loading to false 
      // once it's satisfied with the current route.
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSession('current');
      await SecureStore.deleteItemAsync('session_active');
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setUser(null);
      setUserData(null);
      setLoading(false);
    }
  };

  // ... (Keep handleDeepLink removal from previous turn)

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    const currentSegment = (segments[0] ?? 'index') as string;
    const publicSegments = ['welcome', 'login', 'signup', 'verify', 'auth-callback', 'onboarding', 'promise'];

    if (user) {
      if (!userData) {
        if (currentSegment !== 'onboarding') {
          setLoading(true);
          router.replace('/onboarding');
        } else {
          setLoading(false);
        }
      } else if (!(userData as any).completedOnboarding) {
        if (currentSegment !== 'promise') {
          setLoading(true);
          router.replace('/promise');
        } else {
          setLoading(false);
        }
      } else {
        // Authenticated & Complete
        // If on index (boot) or public auth pages, go to home
        if (currentSegment === 'index' || publicSegments.includes(currentSegment)) {
          setLoading(true);
          router.replace('/(tabs)/convoy');
        } else {
          setLoading(false);
        }
      }
    } else {
      if (currentSegment === 'index') {
        setLoading(true);
        router.replace('/welcome');
      } else if (!publicSegments.includes(currentSegment)) {
        setLoading(true);
        router.replace('/welcome');
      } else {
        setLoading(false);
      }
    }
  }, [authChecked, user, userData, segments]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, authMessage, authError, setIsLoading, checkAuth, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
