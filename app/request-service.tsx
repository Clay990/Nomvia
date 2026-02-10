import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ID } from 'react-native-appwrite';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import { databases, account } from '../lib/appwrite';
import { APPWRITE_CONFIG } from './config/appwrite-schema';

const CATEGORIES = [
  { id: 'mechanic', label: 'Mechanic', icon: 'wrench' },
  { id: 'electrician', label: 'Electrician', icon: 'lightning-bolt' },
  { id: 'towing', label: 'Towing', icon: 'tow-truck' },
  { id: 'parts', label: 'Spare Parts', icon: 'cogs' },
  { id: 'other', label: 'Other Help', icon: 'hand-heart' },
];

const URGENCY_LEVELS = [
  { id: 'low', label: 'Low', color: '#10B981' },
  { id: 'high', label: 'High', color: '#F59E0B' },
  { id: 'critical', label: 'Critical', color: '#EF4444' },
];

export default function RequestServiceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { location } = useLocation();
  
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [urgency, setUrgency] = useState(URGENCY_LEVELS[0].id);
  const [description, setDescription] = useState('');
  const [offer, setOffer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = getStyles(colors);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Missing Information", "Please describe your issue.");
      return;
    }

    if (!location) {
        Alert.alert("Location Required", "We need your location to find helpers nearby.");
        return;
    }

    setIsSubmitting(true);
    
    try {
        const user = await account.get();
        const payload = {
            userId: user.$id,
            type: category,
            title: CATEGORIES.find(c => c.id === category)?.label || 'Help Request',
            description: description,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            urgency: urgency,
            status: 'open',
            offer: offer || undefined,
            createdAt: new Date().toISOString()
        };

        await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.REQUESTS,
            ID.unique(),
            payload
        );

        Alert.alert("Request Posted", "Help is on the way! Nearby helpers have been notified.", [
            { text: "OK", onPress: () => router.back() }
        ]);

    } catch (error: any) {
        console.error("Failed to post request", error);
        Alert.alert("Error", "Could not post request. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Assistance</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionLabel}>WHAT DO YOU NEED?</Text>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryCard, 
                category === cat.id && styles.activeCategoryCard
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <MaterialCommunityIcons 
                name={cat.icon as any} 
                size={28} 
                color={category === cat.id ? '#FFF' : colors.text} 
              />
              <Text style={[
                styles.categoryText, 
                category === cat.id && styles.activeCategoryText
              ]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>URGENCY</Text>
        <View style={styles.urgencyRow}>
          {URGENCY_LEVELS.map((level) => (
            <TouchableOpacity 
              key={level.id}
              style={[
                styles.urgencyChip,
                urgency === level.id && { backgroundColor: level.color, borderColor: level.color }
              ]}
              onPress={() => setUrgency(level.id)}
            >
              <Text style={[
                styles.urgencyText,
                urgency === level.id && { color: '#FFF' }
              ]}>{level.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>DETAILS</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the problem... (e.g. Flat tire on highway 44, need a jack)"
            placeholderTextColor={colors.subtext}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Text style={styles.sectionLabel}>OFFER (OPTIONAL)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g. ₹500 or Dinner"
            placeholderTextColor={colors.subtext}
            value={offer}
            onChangeText={setOffer}
          />
        </View>

        <View style={styles.locationCard}>
          <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location ? `Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}` : "Locating..."}
          </Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Post Request</Text>
              <MaterialCommunityIcons name="send" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'YoungSerif_400Regular' },
  closeBtn: { padding: 8 },
  
  scrollContent: { padding: 20 },
  
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: colors.subtext, 
    marginBottom: 12, 
    marginTop: 8,
    letterSpacing: 0.5 
  },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  activeCategoryCard: { backgroundColor: colors.text, borderColor: colors.text },
  categoryText: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
  activeCategoryText: { color: colors.background },

  urgencyRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  urgencyChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  urgencyText: { fontWeight: '700', fontSize: 14, color: colors.subtext },

  inputContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  textArea: { fontSize: 16, color: colors.text, minHeight: 80, textAlignVertical: 'top' },
  input: { fontSize: 16, color: colors.text },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  locationText: { color: colors.primary, fontWeight: '600', fontSize: 14, flex: 1 },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
