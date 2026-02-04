import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LockdownOverlay() {
  const message = "This tab is currently under development and will be released soon.";

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={20} style={styles.absolute} tint="light" />
      ) : (
        <View style={[styles.absolute, styles.androidOverlay]} />
      )}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="cone" size={32} color="#F59E0B" />
        </View>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
  androidOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 12
  },
  iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#FEF3C7',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  }
});
