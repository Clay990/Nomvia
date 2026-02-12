import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { account } from "../../lib/appwrite";
import { DatingService, DatingProfile } from "../services/dating";
import { useRevenueCat } from "../../context/RevenueCatContext";
import { useTheme } from "../../context/ThemeContext";

type MatchItem = {
    $id: string; 
    partnerId: string;
    name: string;
    image: string;
    timestamp: string;
    lastMessage?: string;
};

export default function MatchesScreen() {
  const router = useRouter();
  const { isPro, presentPaywall } = useRevenueCat();
  const { colors } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'matches' | 'likes'>('matches');
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [likes, setLikes] = useState<DatingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await account.get();
      
      // Load Matches
      const matchDocs = await DatingService.getMatches(user.$id);
      const formattedMatches = await Promise.all(matchDocs.map(async (doc: any) => {
          const partnerId = doc.userA === user.$id ? doc.userB : doc.userA;
          const partnerProfile = await DatingService.getUserProfile(partnerId);
          
          return {
              $id: doc.$id,
              partnerId: partnerId,
              name: partnerProfile.name,
              image: partnerProfile.image,
              timestamp: doc.timestamp,
              lastMessage: "Start the conversation!" 
          };
      }));
      setMatches(formattedMatches);

      const pendingLikes = await DatingService.getPendingLikes(user.$id);
      setLikes(pendingLikes);

    } catch (error) {
      console.log("Error loading data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
      setRefreshing(true);
      loadData();
  };

  const renderMatchItem = ({ item }: { item: MatchItem }) => (
    <TouchableOpacity 
        style={[styles.matchItem, { backgroundColor: colors.card }]} 
        onPress={() => router.push(`/messages/${item.partnerId}`)}
    >
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={styles.message}>{item.lastMessage}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.subtext} />
    </TouchableOpacity>
  );

  const renderLikeItem = ({ item }: { item: DatingProfile }) => (
    <TouchableOpacity 
        style={[styles.matchItem, { backgroundColor: colors.card, opacity: isPro ? 1 : 0.8 }]} 
        onPress={() => {
            if (!isPro) {
                presentPaywall();
            } else {
                 router.push(`/user/${item.$id}`);
            }
        }}
    >
        <Image 
            source={{ uri: item.image }} 
            style={[styles.avatar, !isPro && { opacity: 0.1 }]} 
            blurRadius={!isPro ? 10 : 0}
        />
        <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>
                {isPro ? item.name : "Someone likes you"}
            </Text>
            <Text style={styles.message}>
                {isPro ? "Tap to view profile" : "Upgrade to see who"}
            </Text>
        </View>
        {!isPro && <Feather name="lock" size={20} color="#F59E0B" />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
             <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Connections</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'matches' && { borderBottomColor: colors.primary }]} 
            onPress={() => setActiveTab('matches')}
          >
              <Text style={[styles.tabText, activeTab === 'matches' ? { color: colors.primary } : { color: colors.subtext }]}>Matches</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'likes' && { borderBottomColor: colors.primary }]} 
            onPress={() => setActiveTab('likes')}
          >
              <Text style={[styles.tabText, activeTab === 'likes' ? { color: colors.primary } : { color: colors.subtext }]}>Likes You</Text>
              {!isPro && likes.length > 0 && (
                  <View style={styles.badge}>
                      <Text style={styles.badgeText}>{likes.length}</Text>
                  </View>
              )}
          </TouchableOpacity>
      </View>

      {loading ? (
          <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      ) : activeTab === 'matches' ? (
          <FlatList
            data={matches}
            renderItem={renderMatchItem}
            keyExtractor={item => item.$id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Feather name="heart" size={48} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.subtext }]}>No matches yet. Keep swiping!</Text>
                </View>
            }
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          />
      ) : (
          <FlatList
            data={likes}
            renderItem={renderLikeItem}
            keyExtractor={item => item.$id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Feather name="users" size={48} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.subtext }]}>No new likes yet.</Text>
                </View>
            }
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: {
      padding: 4
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  listContent: {
      padding: 16
  },
  matchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2
  },
  avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#F3F4F6'
  },
  info: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'center'
  },
  name: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111',
      marginBottom: 4
  },
  message: {
      fontSize: 14,
      color: '#6B7280'
  },
  emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 100,
      opacity: 0.6
  },
  emptyText: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: '500'
  },
  tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 2,
      borderColor: 'transparent',
      position: 'relative'
  },
  tabText: {
      fontWeight: '600',
      fontSize: 14
  },
  badge: {
      position: 'absolute',
      top: 8,
      right: '25%',
      backgroundColor: '#EF4444',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2
  },
  badgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: '700'
  }
});
