import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ID } from "react-native-appwrite";
import * as SecureStore from 'expo-secure-store';
import { account } from "./_appwrite";

export default function VerifyScreen() {
  const router = useRouter();
  const { userId, email } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit code sent to your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await account.createSession(
        Array.isArray(userId) ? userId[0] : userId,
        otp
      );

      await SecureStore.setItemAsync('session_active', 'true');

      Alert.alert("Success", "Email verified! Welcome to Nomvia.");
      router.replace('/onboarding');
    } catch (error) {
      console.error(error);
      Alert.alert("Verification Failed", "Invalid code or expired. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      const emailStr = Array.isArray(email) ? email[0] : email;
      await account.createEmailToken(ID.unique(), emailStr);
      Alert.alert("Code Sent", `A new code has been sent to ${emailStr}`);
    } catch (error) {
      Alert.alert("Error", "Could not resend code. Please try again later.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="email-check-outline" size={64} color="#000" />
          </View>

          <Text style={styles.title}>Check your Inbox</Text>

          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#E5E7EB"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus
              editable={!isSubmitting}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            activeOpacity={0.8}
            onPress={handleVerify}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
                 <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={styles.buttonText}>Verify & Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendLink} onPress={handleResend}>
            <Text style={styles.resendText}>
              Didn't receive the code? <Text style={styles.resendBold}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    marginBottom: 24,
    width: 100,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  emailHighlight: {
    color: '#111',
    fontWeight: '600',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  otpInput: {
    height: 64,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#111',
    backgroundColor: '#F9FAFB',
  },
  button: {
    width: '100%',
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendLink: {
    padding: 10,
  },
  resendText: {
    color: '#6B7280',
    fontSize: 14,
  },
  resendBold: {
    color: '#000',
    fontWeight: '700',
    textDecorationLine: 'underline',
  }
});