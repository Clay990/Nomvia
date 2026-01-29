import { Feather } from "@expo/vector-icons";
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
import { useTheme } from "../context/ThemeContext";

const ACCOUNT_CREATED = "January 2024"; 

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const styles = getStyles(colors, isDark);

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
              await SecureStore.deleteItemAsync('session_active');
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{width: 32}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Account Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.row} onPress={() => router.push('/edit-profile')}>
                <View style={styles.rowLeft}>
                    <Feather name="user" size={22} color={colors.icon} />
                    <Text style={styles.rowLabel}>Edit Profile</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.subtext} />
            </TouchableOpacity>
             <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
                <View style={styles.rowLeft}>
                    <Feather name="shield" size={22} color={colors.icon} />
                    <Text style={styles.rowLabel}>Privacy & Security</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.subtext} />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <Feather name="bell" size={22} color={colors.icon} />
                    <Text style={styles.rowLabel}>Push Notifications</Text>
                </View>
                <Switch 
                    value={pushEnabled} 
                    onValueChange={setPushEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <Feather name="map-pin" size={22} color={colors.icon} />
                    <Text style={styles.rowLabel}>Share Location</Text>
                </View>
                 <Switch 
                    value={locationEnabled} 
                    onValueChange={setLocationEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                />
            </View>
             <View style={styles.divider} />
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <Feather name={isDark ? "sun" : "moon"} size={22} color={colors.icon} />
                    <Text style={styles.rowLabel}>Dark Mode</Text>
                </View>
                 <Switch 
                    value={isDark} 
                    onValueChange={toggleTheme}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                />
            </View>
        </View>

        <View style={styles.section}>
             <Text style={styles.sectionTitle}>Support</Text>
             <TouchableOpacity style={styles.row}>
                <View style={styles.rowLeft}>
                    <Feather name="help-circle" size={22} color={colors.icon} />
                    <Text style={styles.rowLabel}>Help Center</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.subtext} />
            </TouchableOpacity>
            <View style={styles.divider} />
             <TouchableOpacity style={styles.row}>
                <View style={styles.rowLeft}>
                    <Feather name="file-text" size={22} color={colors.icon} />
                    <Text style={styles.rowLabel}>Terms of Service</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.subtext} />
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

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  scrollContent: { padding: 20 },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subtext,
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
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  
  footer: { alignItems: 'center', marginTop: 10, paddingBottom: 40 },
  logoutBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
  
  metaInfo: { alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.subtext },
});
