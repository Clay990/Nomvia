import React, { useEffect, useRef, useState } from "react";
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
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { account } from "./_appwrite";

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const hasSession = await SecureStore.getItemAsync('session_active');
        
        if (hasSession === 'true') {
          router.replace('/(tabs)/convoy');
          setTimeout(() => {
            SplashScreen.hideAsync();
          }, 200);
          return;
        }

        await account.get();
        await SecureStore.setItemAsync('session_active', 'true');
        router.replace('/(tabs)/convoy');
        setTimeout(() => {
            SplashScreen.hideAsync();
        }, 200);

      } catch (error) {
        setIsReady(true);
        await SplashScreen.hideAsync();
        startAnimation();
      }
    };
    checkSession();
  }, []);

  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  if (!isReady) {
    return null;
  }

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