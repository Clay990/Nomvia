import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';
import { useFonts, YoungSerif_400Regular } from '@expo-google-fonts/young-serif';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useEffect } from "react";
import LoadingScreen from '../components/LoadingScreen';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://91650a087672a10c82c15d70f2ef7c70@o1032705.ingest.us.sentry.io/4510828451004416',
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
      maskAllVectors: true,
    }),
  ],
});



SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isDark, colors } = useTheme();
  const { loading, authMessage, authError, checkAuth } = useAuth();

  useEffect(() => {
    if (!loading || authError) {
      SplashScreen.hideAsync();
    }
  }, [loading, authError]);

  const paperTheme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: colors.primary,
      background: colors.background,
      surface: colors.card,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background }
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="login" />
          <Stack.Screen name="auth-callback" />
          <Stack.Screen name="promise" />
          <Stack.Screen name="verify" />
          
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        </Stack>

        {(loading || authError) && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
            <LoadingScreen 
              message={authError ? "Connection failed. Please check your internet." : authMessage} 
              onRetry={authError ? checkAuth : undefined} 
            />
          </View>
        )}
      </View>
    </PaperProvider>
  );
}

export default Sentry.wrap(function RootLayout() {
  const [fontsLoaded] = useFonts({
    YoungSerif_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <AppContent />
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
});