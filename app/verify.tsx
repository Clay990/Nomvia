import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Animated, 
  Alert 
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

export default function VerifyScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.delay(1000) 
      ])
    ).start();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission needed", "We need access to your photos to verify your van.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleVerify = () => {
    if (!image) {
        Alert.alert(
            "Skip Verification?", 
            "You can join without verifying, but you won't get the 'Verified Nomad' badge.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Join Anyway", onPress: () => router.push('/(tabs)/convoy') }
            ]
        );
        return;
    }
    
    Alert.alert("Sent for Verification", "We will review your rig shortly. Welcome to Nomvia!", [
      { text: "Enter App", onPress: () => router.push('/(tabs)/convoy') } 
    ]);
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Journey</Text>
        
        <Text style={styles.subtitle}>
          Nomvia is open for all, but safety comes first. Verify your account to get the <Text style={{fontWeight: '700', color: '#111'}}>Verified Nomad</Text> badge.
        </Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.8}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
              <MaterialCommunityIcons name="camera-plus" size={48} color="#000" />
              <Text style={styles.uploadText}>Upload Van Setup or Peace Sign ✌️</Text>
            </Animated.View>
          )}
        </TouchableOpacity>

        <View style={styles.statusContainer}>
            <MaterialCommunityIcons 
              name={image ? "shield-check" : "shield-outline"} 
              size={20} 
              color={image ? "#000" : "#6B7280"} 
            />
            <Text style={styles.statusText}>
              Status: <Text style={{fontWeight: '700', color: image ? '#000' : '#F59E0B'}}>
                {image ? "Ready to Submit" : "Verification Pending"}
              </Text>
            </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8}
          onPress={handleVerify}
        >
          <Text style={styles.buttonText}>
            {image ? "Submit & Enter" : "Skip for Now"}
          </Text>
          {image && <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 40,
  },
  uploadBox: {
    width: '100%',
    height: 250,
    backgroundColor: '#F3F4F6', 
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});