import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { createURL } from "expo-linking";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ID, OAuthProvider } from "react-native-appwrite";
import { account } from "./_appwrite";

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTextChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    if (errorMsg) setErrorMsg("");
  };

  const handleSignup = async () => {
    setErrorMsg("");
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await account.create(ID.unique(), email, password, name);
      
      await account.createEmailToken(ID.unique(), email);

      router.push({
        pathname: '/verify',
        params: { userId: user.$id, email: email }
      });
    } catch (error: any) {
      const isConflict = 
        error.code == 409 || 
        (error.message && error.message.toLowerCase().includes("user with the same id")) ||
        (error.message && error.message.includes("processing your request")); 
      
      if (isConflict) {
        console.log("Signup failed: Account likely exists (409 or generic)");
        setErrorMsg("This email is already taken. Did you sign up with Google?");
      } else {
        console.error("Signup error:", error);
        Alert.alert("Signup Failed", error.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectUri = "appwrite-callback-6973457f000e977ae601://";
      
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
             Alert.alert("Cancelled", "Google sign-in was cancelled.");
             return; 
           }
           throw new Error(`Google Signup failed: ${error}`);
        }

        if (secret && userId) {
          await account.createSession(userId, secret);
          router.replace('/(tabs)/convoy');
        } else {
           throw new Error("Signup failed: missing secret in callback");
        }
      }
    } catch (error: any) {
      console.error("Google signup error:", error);
      Alert.alert("Google Signup Failed", error.message || "An error occurred.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.contentContainer}>

          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join the community of movers.</Text>
          </View>

          <View style={styles.form}>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Quin Gable"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                value={name}
                onChangeText={(val) => handleTextChange(setName, val)}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="quin@nomvia.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(val) => handleTextChange(setEmail, val)}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={(val) => handleTextChange(setPassword, val)}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={confirmPassword}
                onChangeText={(val) => handleTextChange(setConfirmPassword, val)}
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleSignup}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                 <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Sign Up</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>

            {errorMsg ? (
              <Text style={styles.errorMessage}>{errorMsg}</Text>
            ) : null}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.socialButton} 
              activeOpacity={0.7}
              onPress={handleGoogleLogin}
            >
              <MaterialCommunityIcons name="google" size={20} color="#111" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </View>

      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center', 
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    gap: 12, 
    marginBottom: 24,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontSize: 13, 
    fontWeight: '600',
    color: '#374151',
    marginLeft: 2,
  },
  input: {
    height: 48, 
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#F9FAFB',
  },
  primaryButton: {
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  socialButton: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 4,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  }
});