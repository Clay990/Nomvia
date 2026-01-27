import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { account, databases, storage, APPWRITE_DB_ID, APPWRITE_COLLECTION_USERS, APPWRITE_BUCKET_ID } from "./_appwrite";
import { ID } from "react-native-appwrite";

const STEPS = [
  { id: 'profile', title: 'Identity', icon: 'account-outline' },
  { id: 'role', title: 'Role', icon: 'badge-account-outline' },
  { id: 'style', title: 'Travel Style', icon: 'compass-outline' },
  { id: 'interests', title: 'Interests', icon: 'heart-outline' },
  { id: 'rig', title: 'The Rig', icon: 'van-utility' },
];

const ROLES = ["Nomad", "Builder", "Explorer", "Weekend Warrior"];
const INTERESTS = ["Nature", "Hiking", "Coding", "Surfing", "Photography", "Off-grid", "Cooking", "Climbing", "Pets"];
const PACES = ["Fast", "Steady", "Slow"];
const MODES = ["Solo", "Couple", "Family", "Convoy"];
const STYLES = ["Off-grid", "Campgrounds", "Mix"];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "On the Road",
    bio: "",
    avatarUri: null as string | null,
    role: "",
    pace: "Steady",
    mode: "Solo",
    style: "Mix",
    selectedInterests: [] as string[],
    rigName: "",
    rigType: "",
    rigImageUri: null as string | null,
    timeOnRoad: "",
  });

  const pickImage = async (field: 'avatarUri' | 'rigImageUri') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === 'avatarUri' ? [1, 1] : [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFormData({ ...formData, [field]: result.assets[0].uri });
    }
  };

  const uploadImage = async (uri: string) => {
    if (!uri) return null;
    try {
        const fileId = ID.unique();
        
        const file = {
            name: `${fileId}.jpg`,
            type: "image/jpeg",
            uri: uri,
            size: 1, 
        };

        const uploaded = await storage.createFile(APPWRITE_BUCKET_ID, fileId, file);
        
        const fileUrl = `${storage.client.config.endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${uploaded.$id}/view?project=${storage.client.config.project}`;
        return fileUrl;
    } catch (error) {
        console.error("Upload failed:", error);
        return null;
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!formData.role) return Alert.alert("Missing Info", "Please select a role.");
      
      setIsSubmitting(true);
      try {
        const user = await account.get();
        
        const avatarUrl = formData.avatarUri ? await uploadImage(formData.avatarUri) : null;
        const rigUrl = formData.rigImageUri ? await uploadImage(formData.rigImageUri) : null;

        await databases.createDocument(
            APPWRITE_DB_ID, 
            APPWRITE_COLLECTION_USERS,
            user.$id, 
            {
                username: formData.name || user.name,
                age: formData.age ? parseInt(formData.age) : 0,
                location: formData.location,
                bio: formData.bio,
                avatar: avatarUrl,
                role: formData.role,
                pace: formData.pace,
                mode: formData.mode,
                style: formData.style,
                interests: formData.selectedInterests,
                rigName: formData.rigName,
                rigSummary: formData.rigType,
                rigImage: rigUrl,
                verified: true,
                joined: new Date().toISOString(),
                timeOnRoad: formData.timeOnRoad,
            }
        );

        router.replace('/promise');
      } catch (error: any) {
        console.error("Onboarding Error:", error);
        Alert.alert("Error", "Could not save profile. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      const selected = prev.selectedInterests.includes(interest)
        ? prev.selectedInterests.filter(i => i !== interest)
        : [...prev.selectedInterests, interest];
      return { ...prev, selectedInterests: selected };
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: 
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Who are you?</Text>
            <Text style={styles.stepSub}>Your identity on the road.</Text>
            
            <View style={{alignItems: 'center', marginBottom: 20}}>
                <TouchableOpacity onPress={() => pickImage('avatarUri')} style={styles.avatarPicker}>
                    {formData.avatarUri ? (
                        <Image source={{ uri: formData.avatarUri }} style={styles.avatarImg} />
                    ) : (
                        <MaterialCommunityIcons name="camera-plus" size={32} color="#9CA3AF" />
                    )}
                </TouchableOpacity>
                <Text style={styles.miniLabel}>Tap to add photo</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. Alex Supertramp" 
                    value={formData.name}
                    onChangeText={t => setFormData({...formData, name: t})}
                />
            </View>

            <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, {flex: 1}]}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="25" 
                        keyboardType="number-pad"
                        value={formData.age}
                        onChangeText={t => setFormData({...formData, age: t})}
                    />
                </View>
                <View style={[styles.inputGroup, {flex: 1}]}>
                    <Text style={styles.label}>Time on Road</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. 2 years" 
                        value={formData.timeOnRoad}
                        onChangeText={t => setFormData({...formData, timeOnRoad: t})}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Location</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. Moab, Utah" 
                    value={formData.location}
                    onChangeText={t => setFormData({...formData, location: t})}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Tell us about your journey..." 
                    multiline
                    numberOfLines={3}
                    value={formData.bio}
                    onChangeText={t => setFormData({...formData, bio: t})}
                />
            </View>
          </View>
        );
      case 1: 
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your Role</Text>
            <Text style={styles.stepSub}>How do you identify?</Text>
            <View style={styles.grid}>
                {ROLES.map(role => (
                    <TouchableOpacity 
                        key={role} 
                        style={[styles.cardSelect, formData.role === role && styles.cardActive]}
                        onPress={() => setFormData({...formData, role})}
                    >
                        <MaterialCommunityIcons 
                            name={formData.role === role ? "check-circle" : "circle-outline"} 
                            size={24} 
                            color={formData.role === role ? "#FFF" : "#9CA3AF"} 
                        />
                        <Text style={[styles.cardText, formData.role === role && styles.cardTextActive]}>{role}</Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>
        );
      case 2: 
        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Travel Style</Text>
                <Text style={styles.stepSub}>Help us find your convoy.</Text>

                <View style={styles.section}>
                    <Text style={styles.label}>Pace</Text>
                    <View style={styles.pillRow}>
                        {PACES.map(p => (
                            <TouchableOpacity key={p} onPress={() => setFormData({...formData, pace: p})} style={[styles.pill, formData.pace === p && styles.pillActive]}>
                                <Text style={[styles.pillText, formData.pace === p && styles.pillTextActive]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Mode</Text>
                    <View style={styles.pillRow}>
                        {MODES.map(m => (
                            <TouchableOpacity key={m} onPress={() => setFormData({...formData, mode: m})} style={[styles.pill, formData.mode === m && styles.pillActive]}>
                                <Text style={[styles.pillText, formData.mode === m && styles.pillTextActive]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Style</Text>
                    <View style={styles.pillRow}>
                        {STYLES.map(s => (
                            <TouchableOpacity key={s} onPress={() => setFormData({...formData, style: s})} style={[styles.pill, formData.style === s && styles.pillActive]}>
                                <Text style={[styles.pillText, formData.style === s && styles.pillTextActive]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        );
      case 3: 
        return (
          <View style={styles.stepContainer}>
             <Text style={styles.stepTitle}>Interests</Text>
             <Text style={styles.stepSub}>Select at least 3.</Text>
             <View style={styles.chipGrid}>
                {INTERESTS.map(interest => {
                    const isActive = formData.selectedInterests.includes(interest);
                    return (
                        <TouchableOpacity 
                            key={interest} 
                            style={[styles.chip, isActive && styles.chipActive]}
                            onPress={() => toggleInterest(interest)}
                        >
                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{interest}</Text>
                        </TouchableOpacity>
                    );
                })}
             </View>
          </View>
        );
      case 4: 
        return (
           <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Your Rig</Text>
              <Text style={styles.stepSub}>Show off your home on wheels.</Text>

              <TouchableOpacity onPress={() => pickImage('rigImageUri')} style={styles.rigPicker}>
                    {formData.rigImageUri ? (
                        <Image source={{ uri: formData.rigImageUri }} style={styles.rigImg} />
                    ) : (
                        <View style={{alignItems: 'center'}}>
                            <MaterialCommunityIcons name="image-plus" size={40} color="#9CA3AF" />
                            <Text style={styles.miniLabel}>Upload Rig Photo</Text>
                        </View>
                    )}
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rig Name</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. The Millennium Falcon" 
                    value={formData.rigName}
                    onChangeText={t => setFormData({...formData, rigName: t})}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Type</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. Sprinter 144" 
                    value={formData.rigType}
                    onChangeText={t => setFormData({...formData, rigType: t})}
                />
            </View>
           </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          
          <View style={styles.header}>
              <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${((currentStep + 1) / STEPS.length) * 100}%` }]} />
              </View>
              <Text style={styles.stepIndicator}>Step {currentStep + 1} of {STEPS.length}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
             {renderStepContent()}
          </ScrollView>

          <View style={styles.footer}>
              {currentStep > 0 ? (
                  <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                      <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>
              ) : <View />}
              
              <TouchableOpacity 
                  style={[styles.nextBtn, isSubmitting && { opacity: 0.7 }]} 
                  onPress={handleNext}
                  disabled={isSubmitting}
              >
                  {isSubmitting ? (
                      <ActivityIndicator color="#FFF" />
                  ) : (
                      <>
                        <Text style={styles.nextText}>{currentStep === STEPS.length - 1 ? "Finish" : "Next"}</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                      </>
                  )}
              </TouchableOpacity>
          </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 24, paddingBottom: 10 },
  progressBar: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#111', borderRadius: 3 },
  stepIndicator: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', textAlign: 'right' },
  
  scrollContent: { padding: 24, paddingBottom: 100 },
  stepContainer: { gap: 8 },
  stepTitle: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 8 },
  stepSub: { fontSize: 16, color: '#6B7280', marginBottom: 24 },

  avatarPicker: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  miniLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },

  rigPicker: { width: '100%', height: 200, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  rigImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  inputGroup: { marginBottom: 20 },
  rowInputs: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: { 
      backgroundColor: '#F9FAFB', 
      borderWidth: 1, 
      borderColor: '#E5E7EB', 
      borderRadius: 12, 
      paddingHorizontal: 16, 
      paddingVertical: 14, 
      fontSize: 16, 
      color: '#111' 
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  grid: { gap: 12 },
  cardSelect: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 12, 
      padding: 16, 
      borderRadius: 16, 
      borderWidth: 1, 
      borderColor: '#E5E7EB', 
      backgroundColor: '#FFF' 
  },
  cardActive: { backgroundColor: '#111', borderColor: '#111' },
  cardText: { fontSize: 16, fontWeight: '600', color: '#111' },
  cardTextActive: { color: '#FFF' },

  section: { marginBottom: 24 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF' },
  pillActive: { backgroundColor: '#111', borderColor: '#111' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  pillTextActive: { color: '#FFF' },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { 
      paddingHorizontal: 20, 
      paddingVertical: 12, 
      borderRadius: 24, 
      backgroundColor: '#F3F4F6', 
      borderWidth: 1, 
      borderColor: '#F3F4F6' 
  },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  chipTextActive: { color: '#FFF' },

  footer: { 
      padding: 24, 
      borderTopWidth: 1, 
      borderTopColor: '#F3F4F6', 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
  },
  backBtn: { padding: 16 },
  backText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  nextBtn: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 8, 
      backgroundColor: '#111', 
      paddingHorizontal: 32, 
      paddingVertical: 16, 
      borderRadius: 16 
  },
  nextText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});