import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#000000',
    secondary: '#111111',
    background: '#FFFFFF',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right' 
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="login" />
          <Stack.Screen name="promise" />
          <Stack.Screen name="verify" />
          
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        </Stack>
      </View>
    </PaperProvider>
  );
}