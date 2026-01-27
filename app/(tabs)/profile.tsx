import React, { useCallback, useState, useEffect } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    UIManager,
    View,
    Text,
    RefreshControl,
    Button,
    TouchableOpacity,
    Alert
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { account, APPWRITE_COLLECTION_USERS, APPWRITE_DB_ID, databases } from "../_appwrite";

import ProfileHeader from '../../components/profile/ProfileHeader';
import StatsGrid from '../../components/profile/StatsGrid';
import BioSection from '../../components/profile/BioSection';
import RigCard from '../../components/profile/RigCard';
import MapWidget from '../../components/profile/MapWidget';
import ServiceCard from '../../components/profile/ServiceCard';
import ActionFooter from '../../components/profile/ActionFooter';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const PROFILE_CACHE_KEY = 'cached_user_profile';

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchProfile = async (isRefresh = false) => {
    if (!isRefresh && !userProfile) setLoading(true);
    setError(null);
    setIsOffline(false);

    if (!isRefresh) {
        try {
            const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
            if (cached) {
                setUserProfile(JSON.parse(cached));
                setLoading(false); 
            }
        } catch (e) {
            console.log("Cache load failed", e);
        }
    }

    try {
      const user = await account.get();
      const doc = await databases.getDocument(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_USERS,
        user.$id
      );
      
      const profileData = {
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
      };

      setUserProfile(profileData);
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileData));

    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      if (userProfile) {
          setIsOffline(true);
      } else {
          setError("Unable to load profile. Please check your connection.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile(true);
  }, []);

  const DATA = userProfile || DEFAULT_USER;

  if (loading && !refreshing && !userProfile) {
      return (
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color="#111" />
          </View>
      );
  }

  if (error && !userProfile) {
      return (
          <View style={[styles.container, styles.center, { padding: 20 }]}>
              <Text style={{ fontSize: 16, marginBottom: 10, textAlign: 'center' }}>{error}</Text>
              <Button title="Retry" onPress={() => fetchProfile(true)} />
          </View>
      );
  }

  return (
    <View style={styles.container}>
      {isOffline && (
          <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>Offline Mode: Showing cached profile</Text>
          </View>
      )}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ProfileHeader user={DATA} defaultUser={DEFAULT_USER} />

        <View style={styles.contentBody}>
            <View style={styles.matchingSection}>
                <View style={styles.matchingHeader}>
                    <MaterialCommunityIcons name="account-group" size={20} color="#3B82F6" />
                    <Text style={styles.matchingTitle}>Community Vibes</Text>
                </View>
                <Text style={styles.matchingText}>
                    You have <Text style={{fontWeight: 'bold'}}>5 common interests</Text> with nearby nomads!
                </Text>
                <View style={styles.interestTags}>
                    {['Hiking', 'VanBuild', 'Coffee'].map(tag => (
                        <View key={tag} style={styles.miniTag}>
                            <Text style={styles.miniTagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <StatsGrid snapshots={DATA.snapshot} />

            <View style={styles.detailsNav}>
                <TouchableOpacity 
                    style={styles.navCard} 
                    onPress={() => router.push('/profile-details/stats')}
                >
                    <View style={[styles.navIcon, { backgroundColor: '#E0F2FE' }]}>
                        <MaterialCommunityIcons name="chart-bar" size={24} color="#0284C7" />
                    </View>
                    <Text style={styles.navTitle}>Stats</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navCard} 
                    onPress={() => router.push('/profile-details/timeline')}
                >
                    <View style={[styles.navIcon, { backgroundColor: '#FCE7F3' }]}>
                        <MaterialCommunityIcons name="timeline-clock-outline" size={24} color="#DB2777" />
                    </View>
                    <Text style={styles.navTitle}>Timeline</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navCard} 
                    onPress={() => router.push('/profile-details/portfolio')}
                >
                    <View style={[styles.navIcon, { backgroundColor: '#DCFCE7' }]}>
                        <MaterialCommunityIcons name="tools" size={24} color="#16A34A" />
                    </View>
                    <Text style={styles.navTitle}>Portfolio</Text>
                </TouchableOpacity>
            </View>

            <BioSection bio={DATA.bio} interests={DATA.interests} />
            <RigCard rig={DATA.rig} />
            <MapWidget location={DATA.location} />
            <ServiceCard 
                initialIsHelper={DATA.isHelper} 
                builder={DATA.builder} 
                skills={DATA.skills} 
            />
            <ActionFooter joinedDate={DATA.joined} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { justifyContent: 'center', alignItems: 'center' },
  contentBody: { paddingHorizontal: 20, marginTop: -10 },
  offlineBanner: { backgroundColor: '#F59E0B', padding: 8, alignItems: 'center' },
  offlineText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  
  matchingSection: {
      backgroundColor: '#EFF6FF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#DBEAFE'
  },
  matchingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  matchingTitle: { fontSize: 14, fontWeight: '700', color: '#1E40AF' },
  matchingText: { fontSize: 13, color: '#3B82F6', marginBottom: 12 },
  interestTags: { flexDirection: 'row', gap: 8 },
  miniTag: { backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  miniTagText: { fontSize: 10, fontWeight: '600', color: '#2563EB' },

  detailsNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  navCard: { 
      flex: 1, 
      backgroundColor: '#FFF', 
      padding: 12, 
      borderRadius: 16, 
      alignItems: 'center', 
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
  },
  navIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
});