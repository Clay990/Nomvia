import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    LayoutAnimation,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";
import { ID, Query } from 'react-native-appwrite';
import { useTheme } from "../../context/ThemeContext";
import { account, APPWRITE_COLLECTION_FOLLOWERS, APPWRITE_COLLECTION_POSTS, APPWRITE_COLLECTION_USERS, APPWRITE_DB_ID, databases } from "../../lib/appwrite";

import SafeImage from '../../components/SafeImage';
import ActionFooter from '../../components/profile/ActionFooter';
import BioSection from '../../components/profile/BioSection';
import MapWidget from '../../components/profile/MapWidget';
import RigCard from '../../components/profile/RigCard';
import ServiceCard from '../../components/profile/ServiceCard';
import StatsGrid from '../../components/profile/StatsGrid';

const HEADER_HEIGHT = 320;

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type SnapshotItem = { label: string; icon: string };

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
  skills: [],
  isHelper: false,
  snapshot: [] as SnapshotItem[],
  builder: {
      summary: "Builder Profile",
      specialty: "General",
      portfolio: "No Portfolio"
  },
  rig: {
      name: "My Rig",
      summary: "No vehicle details",
      image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop",
      tech: []
  }
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [followDocId, setFollowDocId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const currentAccount = await account.get();
      setCurrentUserId(currentAccount.$id);
      
      if (currentAccount.$id === id) {
          setIsCurrentUser(true);
      }

      const doc = await databases.getDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_USERS, id as string);
      
      const profileData = { ...DEFAULT_USER, ...doc, name: doc.username || DEFAULT_USER.name };
      
      if (doc.rigName) profileData.rig = { name: doc.rigName, summary: doc.rigSummary, image: doc.rigImage, tech: doc.rigTech || [] };
      if (!profileData.rig) profileData.rig = DEFAULT_USER.rig;

      profileData.snapshot = [
            { label: doc.timeOnRoad || "0y", icon: "map" },
            { label: doc.pace || "Steady", icon: "clock" },
            { label: doc.style || "Nature", icon: "sun" },
            { label: doc.mode || "Solo", icon: "user" }
      ] as SnapshotItem[];

      setUserProfile(profileData);

      const followersRes = await databases.listDocuments(
          APPWRITE_DB_ID, 
          APPWRITE_COLLECTION_FOLLOWERS, 
          [Query.equal('followingId', id as string)]
      );
      setFollowerCount(followersRes.total);

      const followingRes = await databases.listDocuments(
          APPWRITE_DB_ID, 
          APPWRITE_COLLECTION_FOLLOWERS, 
          [Query.equal('followerId', id as string)]
      );
      setFollowingCount(followingRes.total);

      const postsRes = await databases.listDocuments(
          APPWRITE_DB_ID,
          APPWRITE_COLLECTION_POSTS,
          [Query.equal('userId', id as string)]
      );
      setPostCount(postsRes.total);

      if (currentAccount.$id !== id) {
          const amIFollowing = await databases.listDocuments(
              APPWRITE_DB_ID,
              APPWRITE_COLLECTION_FOLLOWERS,
              [
                  Query.equal('followerId', currentAccount.$id),
                  Query.equal('followingId', id as string)
              ]
          );
          
          if (amIFollowing.total > 0) {
              setIsFollowing(true);
              setFollowDocId(amIFollowing.documents[0].$id);
          } else {
              setIsFollowing(false);
              setFollowDocId(null);
          }
      }

    } catch (err) {
      console.log("Profile Load Error", err);
    } finally {
      setLoading(false);
    }
  };

  const DATA = userProfile || DEFAULT_USER;

  const imageTranslate = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
    outputRange: [HEADER_HEIGHT / 2, 0, -HEADER_HEIGHT / 3],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolate: 'clamp',
  });

  const handleTabPress = (tab: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveTab(tab);
  };

  const handleFollow = async () => {
      if (!currentUserId || loading) return;

      const previousState = isFollowing;
      setIsFollowing(!isFollowing);
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);

      try {
          if (previousState) {
              if (followDocId) {
                  await databases.deleteDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_FOLLOWERS, followDocId);
                  setFollowDocId(null);
              }
          } else {
              const newDoc = await databases.createDocument(
                  APPWRITE_DB_ID, 
                  APPWRITE_COLLECTION_FOLLOWERS, 
                  ID.unique(), 
                  {
                      followerId: currentUserId,
                      followingId: id,
                      timestamp: new Date().toISOString()
                  }
              );
              setFollowDocId(newDoc.$id);
          }
      } catch (error) {
          console.error('Follow action failed', error);
          setIsFollowing(previousState);
          setFollowerCount(prev => previousState ? prev + 1 : prev - 1);
      }
  };

  if (loading && !userProfile) {
      return <View style={styles.center}><ActivityIndicator size="large" color={colors.text} /></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" translucent />

      <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
      >
          <Feather name="arrow-left" size={24} color="#FFF" />
      </TouchableOpacity>

      <Animated.View style={[styles.headerBackground, { transform: [{ translateY: imageTranslate }, { scale: imageScale }] }]}>
         <SafeImage 
            source={{ uri: DATA.coverImage || DEFAULT_USER.coverImage }} 
            style={styles.headerImage} 
            resizeMode="cover"
         />
         <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', colors.background]}
            style={styles.headerGradient}
         />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 250, paddingBottom: 80 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.profileInfoContainer}>
             <View style={styles.avatarContainer}>
                <SafeImage 
                    source={{ uri: DATA.avatar || DEFAULT_USER.avatar }} 
                    style={styles.avatar}
                    resizeMode="cover"
                />
             </View>
             
             <Text style={styles.name}>{DATA.name}</Text>
             <Text style={styles.handle}>@{DATA.name.toLowerCase().replace(/\s/g, '')} • {DATA.role}</Text>
             
             <View style={styles.statsRow}>
                 <View style={styles.stat}><Text style={styles.statNum}>{followerCount}</Text><Text style={styles.statLabel}>Followers</Text></View>
                 <View style={styles.divider} />
                 <View style={styles.stat}><Text style={styles.statNum}>{followingCount}</Text><Text style={styles.statLabel}>Following</Text></View>
                 <View style={styles.divider} />
                 <View style={styles.stat}><Text style={styles.statNum}>{postCount}</Text><Text style={styles.statLabel}>Posts</Text></View>
             </View>

             <View style={styles.actionRow}>
                 {isCurrentUser ? (
                     <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
                         <Text style={styles.editBtnText}>Edit Profile</Text>
                     </TouchableOpacity>
                 ) : (
                    <>
                        <TouchableOpacity 
                            style={[styles.editBtn, { backgroundColor: isFollowing ? colors.card : colors.primary, borderColor: isFollowing ? colors.border : colors.primary }]} 
                            onPress={handleFollow}
                        >
                            <Text style={[styles.editBtnText, { color: isFollowing ? colors.text : '#FFF' }]}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.iconActionBtn} onPress={() => router.push(`/messages/${id}`)}>
                            <Feather name="message-square" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </>
                 )}
             </View>
        </View>

        <View style={styles.tabContainer}>
            {['Overview', 'Journey', 'Garage'].map((tab) => (
                <TouchableOpacity 
                    key={tab} 
                    style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                    onPress={() => handleTabPress(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.contentBody}>
            {activeTab === 'Overview' && (
                <View style={styles.fadeIn}>
                     <View style={styles.reputationCard}>
                         <View style={styles.repRow}>
                             <View>
                                 <Text style={styles.repTitle}>Reputation</Text>
                                 <Text style={styles.repValue}>Top 5% Guide</Text>
                             </View>
                             <View style={styles.repBadge}>
                                <Feather name="award" size={20} color="#FBBF24" />
                             </View>
                         </View>
                         <View style={styles.repBarBg}><View style={[styles.repBarFill, { width: '85%' }]} /></View>
                     </View>

                     <StatsGrid snapshots={DATA.snapshot} />
                     <BioSection bio={DATA.bio} interests={DATA.interests} />
                     <ServiceCard 
                        initialIsHelper={DATA.isHelper} 
                        builder={DATA.builder} 
                        skills={DATA.skills} 
                        onPress={() => isCurrentUser ? router.push('/edit-profile') : null}
                     />
                </View>
            )}

            {activeTab === 'Journey' && (
                <View style={styles.fadeIn}>
                    <MapWidget location={DATA.location} />
                </View>
            )}

            {activeTab === 'Garage' && (
                <View style={styles.fadeIn}>
                    <RigCard rig={DATA.rig || DEFAULT_USER.rig} />
                    <View style={styles.garageExtras}>
                        <Text style={styles.sectionHeader}>Build Specs</Text>
                        <View style={styles.specGrid}>
                            <View style={styles.specItem}>
                                <Feather name="sun" size={24} color={colors.subtext} />
                                <Text style={styles.specLabel}>600W Solar</Text>
                            </View>
                            <View style={styles.specItem}>
                                <Feather name="droplet" size={24} color={colors.subtext} />
                                <Text style={styles.specLabel}>40 Gal H2O</Text>
                            </View>
                            <View style={styles.specItem}>
                                <Feather name="wifi" size={24} color={colors.subtext} />
                                <Text style={styles.specLabel}>Starlink</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            <ActionFooter joinedDate={DATA.joined} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  
  backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },

  headerBackground: {
      position: 'absolute', left: 0, right: 0, height: HEADER_HEIGHT + 2, 
      top: -1, 
      zIndex: 0,
      backgroundColor: colors.background
  },
  headerImage: { width: '100%', height: '100%' },
  headerGradient: { ...StyleSheet.absoluteFillObject },

  profileInfoContainer: {
      alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24
  },
  avatarContainer: {
      marginBottom: 12, 
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.15, 
      shadowRadius: 10, 
      elevation: 5
  },
  avatar: { width: 100, height: 100, borderRadius: 30, borderWidth: 3, borderColor: "white", backgroundColor: colors.card },
  name: { 
    fontSize: 32, 
    fontWeight: '400', 
    fontFamily: 'YoungSerif_400Regular',
    color: 'rgba(255, 255, 255, 0.95)', 
    letterSpacing: 0.5, 
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: 0, height: 2 }, 
    textShadowRadius: 6 
  },
  handle: { fontSize: 14, color: colors.subtext, marginBottom: 20, fontWeight: '600' },
  
  statsRow: { 
      flexDirection: 'row', alignItems: 'center', 
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : colors.card, 
      borderRadius: 20, paddingVertical: 12, paddingHorizontal: 24, 
      borderWidth: 1, borderColor: colors.border,
      shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 4
  },
  stat: { alignItems: 'center' },
  statNum: { color: colors.text, fontWeight: '800', fontSize: 16 },
  statLabel: { color: colors.subtext, fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  divider: { width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 16 },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  editBtn: { 
      flex: 1, height: 44, backgroundColor: colors.card, borderRadius: 14, 
      justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border 
  },
  editBtnText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  iconActionBtn: { 
      width: 44, height: 44, backgroundColor: colors.card, borderRadius: 14, 
      justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border 
  },

  tabContainer: {
      flexDirection: 'row', marginHorizontal: 20, marginBottom: 20,
      backgroundColor: colors.card, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: colors.border
  },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTabItem: { backgroundColor: colors.primary }, 
  tabText: { color: colors.subtext, fontWeight: '600', fontSize: 13 },
  activeTabText: { color: isDark ? '#000000' : '#FFFFFF' },

  contentBody: { paddingHorizontal: 20, paddingBottom: 40 },
  fadeIn: { opacity: 1 },
  
  reputationCard: {
      backgroundColor: colors.card, padding: 20, borderRadius: 20, marginBottom: 20,
      borderWidth: 1, borderColor: colors.border
  },
  repRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  repTitle: { color: colors.subtext, fontSize: 12, textTransform: 'uppercase', fontWeight: '700' },
  repValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  repBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(251, 191, 36, 0.1)', justifyContent: 'center', alignItems: 'center' },
  repBarBg: { height: 6, backgroundColor: isDark ? '#2C2C2E' : colors.border, borderRadius: 3 },
  repBarFill: { height: '100%', backgroundColor: '#FBBF24', borderRadius: 3 },

  timelinePreview: { marginTop: 10 },
  sectionHeader: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  linkText: { color: colors.primary, fontWeight: '600' },
  timelineSnippet: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingLeft: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 12 },
  snippetText: { color: colors.subtext, fontSize: 14, flex: 1 },
  snippetDate: { color: colors.subtext, fontSize: 12 },

  garageExtras: { marginTop: 24 },
  specGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  specItem: { width: '30%', backgroundColor: colors.card, padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 },
  specLabel: { color: colors.subtext, fontSize: 11, fontWeight: '600' }
});
