import React, { useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions 
} from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native"; 

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../assets/campervan.json')}
          autoPlay
          loop
          style={styles.lottie}
          resizeMode="contain"
        />
      </View>

      <Animated.View style={[styles.textArea, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Nomvia</Text>
        <Text style={styles.tagline}>Meet people who move.</Text>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  animationContainer: {
    flex: 2, 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40, 
  },
  lottie: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', 
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#111111', 
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF', 
    fontSize: 16,
    fontWeight: '700',
  }
});