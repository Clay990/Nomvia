import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="login" />
        <Stack.Screen name="promise" />
        <Stack.Screen name="verify" />
        
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </View>
  );
}