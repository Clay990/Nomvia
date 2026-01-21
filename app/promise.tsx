import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PromiseScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* TITLE */}
        <Text style={styles.title}>Community Promise</Text>
        <Text style={styles.subtitle}>
            Nomvia is an invite-only space. We ask every member to agree to our core values.
        </Text>

        {/* PROMISE LIST */}
        <View style={styles.listContainer}>
          
          {/* Item 1 */}
          <View style={styles.itemRow}>
            <View style={styles.iconBox}>
               <MaterialCommunityIcons name="shield-check" size={24} color="#000" />
            </View>
            <View style={styles.textColumn}>
                <Text style={styles.itemTitle}>Verified nomads</Text>
                <Text style={styles.itemDesc}>
                    Connect with real people verified for trust. No bots, no tourists.
                </Text>
            </View>
          </View>

          {/* Item 2 */}
          <View style={styles.itemRow}>
            <View style={styles.iconBox}>
               <MaterialCommunityIcons name="hand-heart" size={24} color="#000" />
            </View>
            <View style={styles.textColumn}>
                <Text style={styles.itemTitle}>Respect & safety</Text>
                <Text style={styles.itemDesc}>
                    A harassment-free zone built on mutual respect. Zero tolerance for creepiness.
                </Text>
            </View>
          </View>

          {/* Item 3 */}
          <View style={styles.itemRow}>
            <View style={styles.iconBox}>
               <MaterialCommunityIcons name="compass-outline" size={24} color="#000" />
            </View>
            <View style={styles.textColumn}>
                <Text style={styles.itemTitle}>Movement-focused</Text>
                <Text style={styles.itemDesc}>
                    Tools designed for life on the road, not for staying still.
                </Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8}
          onPress={() => router.push('/verify')} // Navigates to Verification
        >
          <Text style={styles.buttonText}>I'm In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- V3 STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure White 
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 100, // Space for footer
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    lineHeight: 24,
  },
  listContainer: {
    gap: 32, // Space between items
  },
  itemRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6', // Subtle gray circle behind icon
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  itemDesc: {
    fontSize: 15,
    color: '#6B7280', // Cool Gray 
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  button: {
    height: 56,
    backgroundColor: '#000000', // Jet Black 
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
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