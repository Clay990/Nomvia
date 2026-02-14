import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Query } from "react-native-appwrite";
import { APPWRITE_CONFIG } from "./config/appwrite-schema";
import { account, databases } from "../lib/appwrite";
import { useTheme } from "../context/ThemeContext";
import { format } from "date-fns";
import Toast from 'react-native-toast-message';

interface RequestItem {
    $id: string;
    title: string;
    description: string;
    status: 'open' | 'resolved';
    createdAt: string;
    urgency: string;
}

export default function MyRequestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const user = await account.get();
      const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.REQUESTS,
          [
              Query.equal('userId', user.$id),
              Query.orderDesc('createdAt')
          ]
      );
      
      setRequests(response.documents.map((doc: any) => ({
          $id: doc.$id,
          title: doc.title,
          description: doc.description,
          status: doc.status,
          createdAt: doc.createdAt,
          urgency: doc.urgency
      })));
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleResolve = async (id: string) => {
      Alert.alert(
          "Resolve Request",
          "Has this issue been sorted out? This will remove it from the map.",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Yes, Resolved", onPress: async () => {
                  try {
                      await databases.updateDocument(
                          APPWRITE_CONFIG.DATABASE_ID, 
                          APPWRITE_CONFIG.COLLECTIONS.REQUESTS, 
                          id, 
                          { status: 'resolved', resolvedAt: new Date().toISOString() }
                      );
                      
                      fetchRequests();
                  } catch (e) {
                      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not update request.' });
                  }
              }}
          ]
      );
  };

  const renderItem = ({ item }: { item: RequestItem }) => (
      <View style={styles.card}>
          <View style={styles.cardHeader}>
              <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: item.status === 'open' ? '#10B981' : '#6B7280' }]} />
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.dateText}>{format(new Date(item.createdAt), 'MMM d, yyyy')}</Text>
          </View>
          
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          
          {item.status === 'open' && (
              <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item.$id)}>
                      <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFF" />
                      <Text style={styles.resolveText}>Mark Resolved</Text>
                  </TouchableOpacity>
              </View>
          )}
      </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <View style={{width: 40}} />
      </View>

      {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
          <FlatList
            data={requests}
            renderItem={renderItem}
            keyExtractor={item => item.$id}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} />}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={colors.border} />
                    <Text style={styles.emptyText}>You haven&apos;t posted any help requests yet.</Text>
                </View>
            }
          />
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
      paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16, 
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  backBtn: { padding: 8 },
  listContent: { padding: 16 },
  card: { 
      backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12,
      borderWidth: 1, borderColor: colors.border
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700', color: colors.subtext },
  dateText: { fontSize: 12, color: colors.subtext },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  desc: { fontSize: 14, color: colors.subtext, marginBottom: 12 },
  actionRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  resolveBtn: { 
      backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: 10, borderRadius: 8, gap: 8
  },
  resolveText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: colors.subtext, marginTop: 16, fontSize: 16 }
});
