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
import { DatingService } from "../services/dating";

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
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const user = await account.get();
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
    } catch (error) {
      console.log("Error loading matches", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
      setRefreshing(true);
      loadMatches();
  };

  const renderItem = ({ item }: { item: MatchItem }) => (
    <TouchableOpacity 
        style={styles.matchItem} 
        onPress={() => router.push(`/messages/${item.partnerId}`)}
    >
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.message}>{item.lastMessage}</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
             <Feather name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Matches</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
          <View style={styles.center}>
              <ActivityIndicator size="large" color="#1A2E05" />
          </View>
      ) : (
          <FlatList
            data={matches}
            renderItem={renderItem}
            keyExtractor={item => item.$id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Feather name="heart" size={48} color="#CCC" />
                    <Text style={styles.emptyText}>No matches yet. Keep swiping!</Text>
                </View>
            }
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
      color: '#6B7280',
      fontWeight: '500'
  }
});
