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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STEPS = [
  { id: 'profile', title: 'Who are you?', icon: 'account-outline' },
  { id: 'role', title: 'Your Role', icon: 'badge-account-outline' },
  { id: 'interests', title: 'Interests', icon: 'heart-outline' },
  { id: 'rig', title: 'Your Rig', icon: 'van-utility' },
];

const ROLES = ["Nomad", "Builder", "Explorer", "Weekend Warrior"];
const INTERESTS = ["Nature", "Hiking", "Coding", "Surfing", "Photography", "Off-grid", "Cooking", "Climbing"];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    role: "",
    selectedInterests: [] as string[],
    rigName: "",
    rigType: "",
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/promise');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
            <Text style={styles.stepTitle}>Let's get to know you</Text>
            <Text style={styles.stepSub}>What should we call you on the road?</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. Alex Supertramp" 
                    value={formData.name}
                    onChangeText={t => setFormData({...formData, name: t})}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Short Bio</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Tell us a bit about your journey..." 
                    multiline
                    numberOfLines={4}
                    value={formData.bio}
                    onChangeText={t => setFormData({...formData, bio: t})}
                />
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your style?</Text>
            <Text style={styles.stepSub}>Select the role that fits you best.</Text>
            
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
             <Text style={styles.stepTitle}>What drives you?</Text>
             <Text style={styles.stepSub}>Pick a few interests to find your tribe.</Text>

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
      case 3:
        return (
           <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Tell us about your rig</Text>
              <Text style={styles.stepSub}>Your home on wheels deserves a spotlight.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rig Name (Optional)</Text>
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
                    placeholder="e.g. Sprinter Van, School Bus, SUV" 
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
          
          {/* Progress Header */}
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
              {currentStep > 0 && (
                  <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                      <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                  <Text style={styles.nextText}>{currentStep === STEPS.length - 1 ? "Finish" : "Next"}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
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
  stepSub: { fontSize: 16, color: '#6B7280', marginBottom: 32 },

  inputGroup: { marginBottom: 20 },
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
  textArea: { height: 120, textAlignVertical: 'top' },

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
