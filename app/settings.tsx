import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { account } from "./_appwrite";

const ACCOUNT_CREATED = "January 2024"; 

export default function SettingsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              await account.deleteSession('current');
              await SecureStore.deleteItemAsync('session_active');
              router.replace('/login');
            } catch (error) {
              console.error("Logout failed:", error);
              // Force logout even if API fails
              await SecureStore.deleteItemAsync('session_active');
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  const handleSOS = () => {
      Alert.alert("Emergency SOS", "This will alert nearby nomads and emergency contacts. (Demo Only)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{width: 32}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.row}>
                <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="account-edit-outline" size={22} color="#4B5563" />
                    <Text style={styles.rowLabel}>Edit Profile</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
             <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
                <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="shield-check-outline" size={22} color="#4B5563" />
                    <Text style={styles.rowLabel}>Privacy & Security</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="bell-outline" size={22} color="#4B5563" />
                    <Text style={styles.rowLabel}>Push Notifications</Text>
                </View>
                <Switch 
                    value={pushEnabled} 
                    onValueChange={setPushEnabled}
                    trackColor={{ false: "#E5E7EB", true: "#111" }}
                    thumbColor="#FFF"
                />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="map-marker-outline" size={22} color="#4B5563" />
                    <Text style={styles.rowLabel}>Share Location</Text>
                </View>
                 <Switch 
                    value={locationEnabled} 
                    onValueChange={setLocationEnabled}
                    trackColor={{ false: "#E5E7EB", true: "#111" }}
                    thumbColor="#FFF"
                />
            </View>
             <View style={styles.divider} />
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="theme-light-dark" size={22} color="#4B5563" />
                    <Text style={styles.rowLabel}>Dark Mode</Text>
                </View>
                 <Switch 
                    value={darkMode} 
                    onValueChange={setDarkMode}
                    trackColor={{ false: "#E5E7EB", true: "#111" }}
                    thumbColor="#FFF"
                />
            </View>
        </View>

        <View style={styles.section}>
             <Text style={styles.sectionTitle}>Support</Text>
             <TouchableOpacity style={styles.row}>
                <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="help-circle-outline" size={22} color="#4B5563" />
                    <Text style={styles.rowLabel}>Help Center</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.divider} />
             <TouchableOpacity style={styles.row}>
                <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="file-document-outline" size={22} color="#4B5563" />
                    <Text style={styles.rowLabel}>Terms of Service</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </View>

        <View style={styles.footer}>
             <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                 <Text style={styles.logoutText}>Log Out</Text>
             </TouchableOpacity>
             
             <View style={styles.metaInfo}>
                 <Text style={styles.metaText}>Nomvia v1.0.0</Text>
                 <Text style={styles.metaText}>Joined {ACCOUNT_CREATED}</Text>
             </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  scrollContent: { padding: 20 },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  
  footer: { alignItems: 'center', marginTop: 10, paddingBottom: 40 },
  logoutBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
  
  metaInfo: { alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#9CA3AF' },
});
