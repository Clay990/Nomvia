import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hide top header (we build our own in screens)
        tabBarActiveTintColor: "#000000", // Jet Black (Active)
        tabBarInactiveTintColor: "#9CA3AF", // Cool Gray (Inactive)
        tabBarStyle: {
          height: Platform.OS === "android" ? 65 : 85, // Taller for modern look
          paddingBottom: Platform.OS === "android" ? 10 : 30,
          paddingTop: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          elevation: 0, // Remove shadow on Android for flat look
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* Tab 1: Convoy (Feed) */}
      <Tabs.Screen
        name="convoy"
        options={{
          title: "Convoy",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="van-utility" size={28} color={color} />
          ),
        }}
      />

      {/* Tab 2: Connect (Dating/Friends) */}
      <Tabs.Screen
        name="connect"
        options={{
          title: "Connect",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group" size={28} color={color} />
          ),
        }}
      />

      {/* Tab 3: Builders (Directory) */}
      <Tabs.Screen
        name="builders"
        options={{
          title: "Builders",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="hammer-wrench" size={28} color={color} />
          ),
        }}
      />

      {/* Tab 4: Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "You",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-circle" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}