import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  onRetry?: () => void;
}

export default function LoadingScreen({ message, onRetry }: LoadingScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LottieView
        source={require('../assets/campervan.json')}
        autoPlay
        loop
        style={styles.lottie}
        resizeMode="contain"
      />
      {message ? (
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      ) : null}
      
      {onRetry && (
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.text }]} 
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={[styles.retryText, { color: colors.background }]}>Retry Connection</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  lottie: {
    width: width * 0.5,
    height: width * 0.5,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 10,
  },
  retryText: {
      fontWeight: '700',
      fontSize: 14,
  }
});
