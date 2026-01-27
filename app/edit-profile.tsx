import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { ID } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import { account, APPWRITE_BUCKET_ID, APPWRITE_COLLECTION_USERS, APPWRITE_DB_ID, databases, storage } from "./_appwrite";

const ROLES = ["Nomad", "Builder", "Explorer", "Weekend Warrior"];
const PACES = ["Fast", "Steady", "Slow"];
const MODES = ["Solo", "Couple", "Family", "Convoy"];
const STYLES = ["Off-grid", "Campgrounds", "Mix"];
const TIME_OPTIONS = ["<1y", "1y", "2y", "3y", "4y", "5y", "6y", "7y", "8y", "9y", "10y+"];

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    location: "",
    role: "",
    pace: "",
    mode: "",
    style: "",
    avatar: null as string | null,
    coverImage: null as string | null,
    rigName: "",
    rigSummary: "",
    rigImage: null as string | null,
    instagram: "",
    youtube: "",
    website: "",
    skills: "",
    timeOnRoad: ""
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await account.get();
      setUserId(user.$id);
      
      const doc = await databases.getDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_USERS, user.$id);
      
      setFormData({
        username: doc.username || "",
        bio: doc.bio || "",
        location: doc.location || "",
        role: doc.role || "",
        pace: doc.pace || "",
        mode: doc.mode || "",
        style: doc.style || "",
        avatar: doc.avatar || null,
        coverImage: doc.coverImage || null,
        rigName: doc.rigName || "",
        rigSummary: doc.rigSummary || "", 
        rigImage: doc.rigImage || null,
        instagram: doc.instagram || "",
        youtube: doc.youtube || "",
        website: doc.website || "",
        skills: doc.skills ? doc.skills.join(", ") : "",
        timeOnRoad: doc.timeOnRoad || ""
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (field: 'avatar' | 'coverImage' | 'rigImage') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === 'coverImage' ? [16, 9] : (field === 'rigImage' ? [4, 3] : [1, 1]),
      quality: 0.5,
    });

    if (!result.canceled) {
      setFormData({ ...formData, [field]: result.assets[0].uri });
    }
  };

  const uploadImage = async (uri: string) => {
    if (!uri || uri.startsWith('http')) return uri;
    try {
        const fileId = ID.unique();
        const file = {
            name: `${fileId}.jpg`,
            type: "image/jpeg",
            uri: uri,
            size: 1,
        };

        const uploaded = await storage.createFile(APPWRITE_BUCKET_ID, fileId, file);
        return `${storage.client.config.endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${uploaded.$id}/view?project=${storage.client.config.project}`;
    } catch (error) {
        console.error("Upload failed:", error);
        return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        const avatarUrl = await uploadImage(formData.avatar || "");
        const coverUrl = await uploadImage(formData.coverImage || "");
        const rigUrl = await uploadImage(formData.rigImage || "");

        const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s.length > 0);

        const sanitizeUrl = (url: string | null) => url && url.trim().length > 0 ? url : null;

        await databases.updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_USERS,
            userId,
            {
                username: formData.username,
                bio: formData.bio,
                location: formData.location,
                role: formData.role,
                pace: formData.pace,
                mode: formData.mode,
                style: formData.style,
                avatar: sanitizeUrl(avatarUrl),
                coverImage: sanitizeUrl(coverUrl),
                rigName: formData.rigName,
                rigSummary: formData.rigSummary,
                rigImage: sanitizeUrl(rigUrl),
                instagram: sanitizeUrl(formData.instagram),
                youtube: sanitizeUrl(formData.youtube),
                website: sanitizeUrl(formData.website),
                skills: skillsArray,
                timeOnRoad: formData.timeOnRoad
            }
        );
        
        Alert.alert("Success", "Profile updated!");
        router.back();
    } catch (error: any) {
        console.error("Save error:", error);
        Alert.alert("Error", "Failed to update profile");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#111" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#111" /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Visuals */}
            <Text style={styles.sectionTitle}>Visuals</Text>
            <TouchableOpacity style={styles.coverPicker} onPress={() => pickImage('coverImage')}>
                {formData.coverImage ? (
                    <Image source={{ uri: formData.coverImage }} style={styles.coverImg} />
                ) : (
                    <View style={styles.placeholder}>
                        <MaterialCommunityIcons name="image-area" size={32} color="#9CA3AF" />
                        <Text style={styles.phText}>Cover Image</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={{alignItems: 'center', marginTop: -40, marginBottom: 20}}>
                <TouchableOpacity style={styles.avatarPicker} onPress={() => pickImage('avatar')}>
                    {formData.avatar ? (
                        <Image source={{ uri: formData.avatar }} style={styles.avatarImg} />
                    ) : (
                        <View style={styles.placeholder}>
                            <MaterialCommunityIcons name="camera" size={24} color="#9CA3AF" />
                        </View>
                    )}
                </TouchableOpacity>
                <Text style={styles.miniLabel}>Change Avatar</Text>
            </View>

            {/* Basic Info */}
            <Text style={styles.sectionTitle}>Basics</Text>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput style={styles.input} value={formData.username} onChangeText={t => setFormData({...formData, username: t})} />
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput style={styles.input} value={formData.location} onChangeText={t => setFormData({...formData, location: t})} />
            </View>

            <View style={styles.selectorGroup}>
                <Text style={styles.label}>Time on Road</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                    {TIME_OPTIONS.map(t => (
                        <TouchableOpacity key={t} onPress={() => setFormData({...formData, timeOnRoad: t})} style={[styles.pill, formData.timeOnRoad === t && styles.pillActive]}>
                            <Text style={[styles.pillText, formData.timeOnRoad === t && styles.pillTextActive]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={3} value={formData.bio} onChangeText={t => setFormData({...formData, bio: t})} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Skills</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. Solar, Mechanic, Cooking (comma separated)" 
                    value={formData.skills} 
                    onChangeText={t => setFormData({...formData, skills: t})} 
                />
            </View>

            {/* Identity */}
            <Text style={styles.sectionTitle}>Identity</Text>
            
            <View style={styles.selectorGroup}>
                <View style={styles.selectorHeader}>
                    <MaterialCommunityIcons name="badge-account-outline" size={18} color="#4B5563" />
                    <Text style={styles.selectorLabel}>Role</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                    {ROLES.map(r => (
                        <TouchableOpacity key={r} onPress={() => setFormData({...formData, role: r})} style={[styles.pill, formData.role === r && styles.pillActive]}>
                            <Text style={[styles.pillText, formData.role === r && styles.pillTextActive]}>{r}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.selectorGroup}>
                <View style={styles.selectorHeader}>
                    <MaterialCommunityIcons name="speedometer" size={18} color="#4B5563" />
                    <Text style={styles.selectorLabel}>Pace</Text>
                </View>
                <View style={styles.pillRow}>
                    {PACES.map(p => (
                        <TouchableOpacity key={p} onPress={() => setFormData({...formData, pace: p})} style={[styles.pill, formData.pace === p && styles.pillActive]}>
                            <Text style={[styles.pillText, formData.pace === p && styles.pillTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.selectorGroup}>
                <View style={styles.selectorHeader}>
                    <MaterialCommunityIcons name="account-group-outline" size={18} color="#4B5563" />
                    <Text style={styles.selectorLabel}>Mode</Text>
                </View>
                <View style={styles.pillRow}>
                    {MODES.map(m => (
                        <TouchableOpacity key={m} onPress={() => setFormData({...formData, mode: m})} style={[styles.pill, formData.mode === m && styles.pillActive]}>
                            <Text style={[styles.pillText, formData.mode === m && styles.pillTextActive]}>{m}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.selectorGroup}>
                <View style={styles.selectorHeader}>
                    <MaterialCommunityIcons name="tent" size={18} color="#4B5563" />
                    <Text style={styles.selectorLabel}>Style</Text>
                </View>
                <View style={styles.pillRow}>
                    {STYLES.map(s => (
                        <TouchableOpacity key={s} onPress={() => setFormData({...formData, style: s})} style={[styles.pill, formData.style === s && styles.pillActive]}>
                            <Text style={[styles.pillText, formData.style === s && styles.pillTextActive]}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Rig */}
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <TouchableOpacity style={styles.rigPicker} onPress={() => pickImage('rigImage')}>
                {formData.rigImage ? (
                    <Image source={{ uri: formData.rigImage }} style={styles.rigImg} />
                ) : (
                    <View style={styles.placeholderRow}>
                        <MaterialCommunityIcons name="van-utility" size={24} color="#9CA3AF" />
                        <Text style={styles.phText}>Add Rig Photo</Text>
                    </View>
                )}
            </TouchableOpacity>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Rig Name</Text>
                <TextInput style={styles.input} value={formData.rigName} onChangeText={t => setFormData({...formData, rigName: t})} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Model / Type</Text>
                <TextInput style={styles.input} value={formData.rigSummary} onChangeText={t => setFormData({...formData, rigSummary: t})} />
            </View>

            {/* Socials */}
            <Text style={styles.sectionTitle}>Social Links</Text>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Instagram</Text>
                <TextInput style={styles.input} placeholder="@username" value={formData.instagram} onChangeText={t => setFormData({...formData, instagram: t})} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>YouTube</Text>
                <TextInput style={styles.input} placeholder="Channel URL" value={formData.youtube} onChangeText={t => setFormData({...formData, youtube: t})} />
            </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  saveText: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  
  scrollContent: { padding: 20, paddingBottom: 50 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginTop: 24, marginBottom: 12 },
  
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 15, color: '#111' },
  textArea: { height: 80, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', gap: 12 },

  coverPicker: { height: 140, backgroundColor: '#F3F4F6', borderRadius: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  coverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarPicker: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  miniLabel: { fontSize: 12, color: '#3B82F6', fontWeight: '600', marginTop: 4 },
  
  rigPicker: { height: 180, backgroundColor: '#F3F4F6', borderRadius: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  rigImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  placeholder: { alignItems: 'center', gap: 4 },
  placeholderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phText: { color: '#9CA3AF', fontWeight: '500' },

  selectorGroup: { marginBottom: 20 },
  selectorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  selectorLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  pillScroll: { flexDirection: 'row' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF', marginRight: 8 },
  pillActive: { backgroundColor: '#111', borderColor: '#111' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  pillTextActive: { color: '#FFF' },
});
