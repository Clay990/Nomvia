import React from "react";
import { View, StyleSheet } from "react-native";
import LoadingScreen from "../components/LoadingScreen";

export default function IndexScreen() {
  // This screen acts as the initial route.
  // It renders nothing (or a loading screen) while AuthContext determines the next step.
  // AuthContext will redirect to '/welcome' (if not logged in) or '/(tabs)/convoy' (if logged in).
  return <LoadingScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
