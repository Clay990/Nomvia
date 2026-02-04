import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoadingScreen from '../components/LoadingScreen';

export default function AuthCallbackScreen() {
  return (
    <View style={styles.container}>
      <LoadingScreen message="Finalizing login..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});