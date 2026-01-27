import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";
import { account, APPWRITE_COLLECTION_USERS, APPWRITE_DB_ID, databases } from "../_appwrite";

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const DEFAULT_USER = {
  name: "Nomad",
  age: 0,
  role: "Explorer",
  verified: false,
  avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
  location: "On the Road",
  bio: "Just started my journey...",
  interests: [],
  joined: "",
  rigName: "My Rig",
  rigSummary: "No vehicle details",
  rigImage: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop",
  skills: [],
  isHelper: false,
};

export default function ProfileScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [rigExpanded, setRigExpanded] = useState(false);
  const [isHappyToHelp, setIsHappyToHelp] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const user = await account.get();
      const doc = await databases.getDocument(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_USERS,
        user.$id
      );
      
      setUserProfile({
        ...DEFAULT_USER,
        ...doc,
        name: doc.username || DEFAULT_USER.name,
        rig: {
            name: doc.rigName || DEFAULT_USER.rigName,
            summary: doc.rigSummary || DEFAULT_USER.rigSummary,
            image: doc.rigImage || DEFAULT_USER.rigImage,
            tech: doc.rigTech || []
        },
        builder: {
             summary: "Builder Profile",
             specialty: "General",
             portfolio: "No Portfolio"
        },
        snapshot: [
            { label: doc.timeOnRoad || "0y", icon: "road-variant" },
            { label: doc.pace || "Steady", icon: "tortoise" },
            { label: doc.style || "Nature", icon: "pine-tree" },
            { label: doc.mode || "Solo", icon: "paw" }
        ]
      });
      setIsHappyToHelp(doc.isHelper || false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (setter: any, value: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(!value);
  };

  const handleSOS = () => {
    alert("Emergency SOS Activated: Notifying nearby nomads and emergency contacts.");
  };

  const handleHelperToggle = async (value: boolean) => {
      setIsHappyToHelp(value);
      try {
          const user = await account.get();
          await databases.updateDocument(
              APPWRITE_DB_ID,
              APPWRITE_COLLECTION_USERS,
              user.$id,
              { isHelper: value }
          );
      } catch (error) {
          console.error("Failed to update helper status:", error);
          setIsHappyToHelp(!value);
      }
  };

  if (loading) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#111" />
          </View>
      );
  }

  const DATA = userProfile || DEFAULT_USER;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerWrapper}>
          <Image source={{ uri: DATA.coverImage || DEFAULT_USER.coverImage }} style={styles.headerImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', '#F8F9FA']}
            style={styles.headerGradient}
          />
          
          <View style={styles.topBar}>
             <View style={styles.locationTag}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#FFF" />
                <Text style={styles.locationText}>{DATA.location || "Unknown"}</Text>
             </View>
             <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/messages')}>
                   <MaterialCommunityIcons name="chat-processing-outline" size={20} color="#FFF" />
                   <View style={styles.notificationDot} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
                   <MaterialCommunityIcons name="cog-outline" size={20} color="#FFF" />
                </TouchableOpacity>
             </View>
          </View>

          <View style={styles.identityOverlay}>
             <View style={styles.avatarRow}>
                <Image source={{ uri: DATA.avatar || DEFAULT_USER.avatar }} style={styles.avatar} />
                <View style={styles.identityText}>
                   <Text style={styles.heroName}>{DATA.name}</Text>
                   <View style={styles.badgeRow}>
                      <View style={styles.roleBadge}>
                         <Text style={styles.roleText}>{DATA.role}</Text>
                      </View>
                      {DATA.verified && (
                        <MaterialCommunityIcons name="check-decagram" size={20} color="#3B82F6" />
                      )}
                   </View>
                </View>
             </View>
          </View>
        </View>

        <View style={styles.contentBody}>
            <View style={styles.statsGrid}>
                {DATA.snapshot && DATA.snapshot.map((snap: any, i: number) => (
                    <View key={i} style={styles.statItem}>
                        <View style={styles.statIconBox}>
                            <MaterialCommunityIcons name={snap.icon as any} size={20} color="#111" />
                        </View>
                        <Text style={styles.statLabel}>{snap.label}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>The Journey</Text>
                <Text style={styles.bioText}>{DATA.bio || "No bio yet."}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
                    {DATA.interests && DATA.interests.map((tag: string) => (
                        <Text key={tag} style={styles.hashTag}>#{tag}</Text>
                    ))}
                </ScrollView>
            </View>

            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => toggleSection(setRigExpanded, rigExpanded)}
                style={styles.rigCard}
            >
                <Image source={{ uri: DATA.rig.image }} style={styles.rigBg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.rigOverlay}>
                    <View>
                        <View style={styles.rigHeader}>
                            <MaterialCommunityIcons name="van-utility" size={24} color="#FFF" />
                            <Text style={styles.rigTitle}>{DATA.rig.name}</Text>
                        </View>
                        <Text style={styles.rigSub}>{DATA.rig.summary}</Text>
                        {rigExpanded && (
                            <View style={styles.rigExpandedContent}>
                                <View style={styles.techStack}>
                                    {DATA.rig.tech.map((t: string) => (
                                        <View key={t} style={styles.techPill}>
                                            <Text style={styles.techText}>{t}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                    <MaterialCommunityIcons 
                        name={rigExpanded ? "chevron-up" : "chevron-down"} 
                        size={24} 
                        color="#FFF" 
                    />
                </LinearGradient>
            </TouchableOpacity>

            <View style={styles.mapWidget}>
                <View style={styles.mapHeader}>
                    <Text style={styles.widgetTitle}>Current Location</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>View Map</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.mapVisual}>
                    <Image 
                        source={{ uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" }} 
                        style={styles.mapImg}
                    />
                    <View style={styles.pulseMarker}>
                         <View style={styles.pulseCore} />
                         <View style={styles.pulseRing} />
                    </View>
                    <View style={styles.locBadge}>
                         <Text style={styles.locBadgeText}>{DATA.location || "Unknown"}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                    <View style={styles.serviceIcon}>
                            <MaterialCommunityIcons name="hammer-wrench" size={20} color="#FFF" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.serviceTitle}>Skills & Services</Text>
                        <Text style={styles.serviceSub}>Open to work / help</Text>
                    </View>
                    <Switch
                        value={isHappyToHelp}
                        onValueChange={handleHelperToggle}
                        trackColor={{ false: "#E5E7EB", true: "#111" }}
                        thumbColor="#FFF"
                    />
                </View>
                <View style={styles.divider} />
                <View style={styles.serviceDetails}>
                        <Text style={styles.specLabel}>SPECIALTY</Text>
                        <Text style={styles.specText}>{DATA.builder.specialty}</Text>
                        <View style={styles.skillsRow}>
                        {DATA.skills && DATA.skills.map((skill: string) => (
                            <Text key={skill} style={styles.skillSimple}>• {skill}</Text>
                        ))}
                        {(!DATA.skills || DATA.skills.length === 0) && (
                            <Text style={styles.skillSimple}>No skills listed yet.</Text>
                        )}
                        </View>
                </View>
            </View>

            <View style={styles.actionFooter}>
                 <View style={styles.socialRow}>
                     <TouchableOpacity style={styles.socialCircle}>
                        <MaterialCommunityIcons name="instagram" size={20} color="#111" />
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.socialCircle}>
                        <MaterialCommunityIcons name="youtube" size={20} color="#111" />
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.socialCircle}>
                        <MaterialCommunityIcons name="web" size={20} color="#111" />
                     </TouchableOpacity>
                 </View>

                 <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
                    <MaterialCommunityIcons name="alert-circle" size={22} color="#FFF" />
                    <Text style={styles.sosText}>Emergency SOS</Text>
                 </TouchableOpacity>

                 <Text style={styles.joinedText}>Joined {DATA.joined ? new Date(DATA.joined).toLocaleDateString() : "Recently"}</Text>
            </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerWrapper: { height: 280, position: 'relative' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  headerGradient: { position: 'absolute', width: '100%', height: '100%', top: 0 },
  
  topBar: {
     position: 'absolute',
     top: 50,
     left: 20,
     right: 20,
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     zIndex: 10
  },
  locationTag: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: 'rgba(0,0,0,0.5)',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 20,
     gap: 4
  },
  locationText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFF'
  },

  identityOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  avatar: { 
     width: 100, 
     height: 100, 
     borderRadius: 20, 
     borderWidth: 4, 
     borderColor: '#FFF',
  },
  identityText: { flex: 1, paddingBottom: 8 },
  heroName: { fontSize: 32, fontWeight: '900', color: '#111', letterSpacing: -1, textShadowColor: 'rgba(255,255,255,0.5)', textShadowRadius: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleBadge: { backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  roleText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  contentBody: { paddingHorizontal: 20, marginTop: -10 },
  
  statsGrid: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     backgroundColor: '#FFF',
     padding: 16,
     borderRadius: 16,
     marginBottom: 20,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.05,
     shadowRadius: 8,
     elevation: 2,
  },
  statItem: { alignItems: 'center', gap: 6 },
  statIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#4B5563' },

  cardSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 8 },
  bioText: { fontSize: 15, color: '#4B5563', lineHeight: 24, marginBottom: 12 },
  tagsScroll: { flexDirection: 'row' },
  hashTag: { fontSize: 13, fontWeight: '600', color: '#3B82F6', marginRight: 12 },

  rigCard: {
     height: 220,
     borderRadius: 24,
     overflow: 'hidden',
     marginBottom: 24,
     backgroundColor: '#000',
     position: 'relative'
  },
  rigBg: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.8 },
  rigOverlay: { 
     position: 'absolute', 
     bottom: 0, left: 0, right: 0, top: 0,
     justifyContent: 'space-between',
     padding: 20
  },
  rigHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto', marginBottom: 4 },
  rigTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  rigSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  rigExpandedContent: { marginTop: 16 },
  techStack: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  techText: { color: '#FFF', fontSize: 11, fontWeight: '600' },

  mapWidget: {
     backgroundColor: '#FFF',
     borderRadius: 20,
     padding: 6,
     marginBottom: 24,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.05,
     shadowRadius: 8,
     elevation: 2,
  },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 10, paddingBottom: 10 },
  widgetTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  seeAllText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  mapVisual: { height: 140, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  mapImg: { width: '100%', height: '100%' },
  pulseMarker: { position: 'absolute', top: '50%', left: '50%', alignItems: 'center', justifyContent: 'center' },
  pulseCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6', zIndex: 2 },
  pulseRing: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(59, 130, 246, 0.3)' },
  locBadge: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  locBadgeText: { fontSize: 11, fontWeight: '700', color: '#111' },

  serviceCard: {
      backgroundColor: '#1F2937',
      borderRadius: 20,
      padding: 20,
      marginBottom: 30
  },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  serviceIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  serviceTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  serviceSub: { color: '#9CA3AF', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#374151', marginBottom: 16 },
  serviceDetails: {},
  specLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', marginBottom: 4, letterSpacing: 1 },
  specText: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  skillSimple: { color: '#D1D5DB', fontSize: 13 },

  actionFooter: { alignItems: 'center', marginBottom: 60, marginTop: 10 },
  socialRow: { flexDirection: 'row', gap: 16, marginBottom: 30 },
  socialCircle: { 
     width: 50, 
     height: 50, 
     borderRadius: 25, 
     backgroundColor: '#FFF', 
     justifyContent: 'center', 
     alignItems: 'center',
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.05,
     shadowRadius: 4,
     elevation: 2,
     borderWidth: 1,
     borderColor: '#F3F4F6'
  },
  sosButton: { 
     flexDirection: 'row', 
     alignItems: 'center', 
     gap: 8, 
     backgroundColor: '#EF4444', 
     paddingHorizontal: 30, 
     paddingVertical: 16, 
     borderRadius: 30, 
     marginBottom: 16,
     shadowColor: "#EF4444",
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 10,
     elevation: 5
  },
  sosText: { color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  joinedText: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },

});