import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    UIManager,
    View,
    Text,
    RefreshControl,
    Button
} from "react-native";
import { useFocusEffect } from "expo-router";
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
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
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      setError("Unable to load profile. Please check your connection.");
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

  if (loading && !refreshing) {
      return (
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color="#111" />
          </View>
      );
  }

  if (error) {
      return (
          <View style={[styles.container, styles.center, { padding: 20 }]}>
              <Text style={{ fontSize: 16, marginBottom: 10, textAlign: 'center' }}>{error}</Text>
              <Button title="Retry" onPress={() => fetchProfile()} />
          </View>
      );
  }

  const DATA = userProfile || DEFAULT_USER;

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ProfileHeader user={DATA} defaultUser={DEFAULT_USER} />

        <View style={styles.contentBody}>
            <StatsGrid snapshots={DATA.snapshot} />
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
});