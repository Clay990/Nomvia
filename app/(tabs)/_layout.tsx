import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  const ACTIVE_COLOR = isDark ? "#FFFFFF" : "#000000";
  const INACTIVE_COLOR = isDark ? "#6B7280" : "#999999"; 

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: Platform.OS === "android" ? 70 : 90,
          paddingBottom: Platform.OS === "android" ? 12 : 30,
          paddingTop: 12,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
          fontFamily: 'Inter_600SemiBold', 
        },
      }}
    >
      <Tabs.Screen
        name="convoy"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIconsWithFeatherFallback name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="connect"
        options={{
          title: "Dating",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIconsWithFeatherFallback name="heart" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: "Campfire",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIconsWithFeatherFallback name="users" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="builders"
        options={{
          title: "Services",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIconsWithFeatherFallback name="tool" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIconsWithFeatherFallback name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function MaterialCommunityIconsWithFeatherFallback({ name, size, color }: { name: any, size: number, color: string }) {
    return <Feather name={name} size={size} color={color} />;
}