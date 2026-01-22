import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#111111",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarShowLabel: true,
        tabBarStyle: {
          height: Platform.OS === "android" ? 70 : 90,
          paddingBottom: Platform.OS === "android" ? 12 : 30,
          paddingTop: 12,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="convoy"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "home" : "home-outline"} size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="connect"
        options={{
          title: "Dating",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "heart" : "heart-outline"} size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: "Campfire",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "account-group" : "account-group-outline"} size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="builders"
        options={{
          title: "Services",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "hammer-wrench" : "hammer-wrench"} size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "account-circle" : "account-circle-outline"} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}