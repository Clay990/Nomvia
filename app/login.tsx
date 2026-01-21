import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    router.replace('/(tabs)/convoy');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        
        <View style={styles.contentContainer}>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Let's get you back on the road.</Text>
          </View>

          <View style={styles.form}>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="quin@nomvia.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* BLACK CTA BUTTON */}
            <TouchableOpacity 
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleLogin} 
            >
              <Text style={styles.primaryButtonText}>Log In</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* --- SOCIAL / FOOTER --- */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="google" size={20} color="#111" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/signup')}>
              <Text style={styles.loginText}>
                Don't have an account? <Text style={{fontWeight: '700', textDecorationLine: 'underline'}}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </View>

      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

// --- STYLES (Matched to Signup) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center', // Vertically Center Everything
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111', 
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    gap: 16, // Slightly more gap than signup since there are fewer fields
    marginBottom: 30,
  },
  inputContainer: {
    gap: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#F9FAFB',
  },
  primaryButton: {
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  socialButton: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 4,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  }
});