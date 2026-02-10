import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ChatService } from "../services/chat";
import { account } from "../../lib/appwrite";

export default function MessagesListScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      fetchConversations();
  }, []);

  const fetchConversations = async () => {
      try {
          const user = await account.get();
          const data = await ChatService.getConversations(user.$id);
          setChats(data);
      } catch (e) {
          console.log("Error loading chats", e);
      } finally {
          setLoading(false);
      }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => router.push(`/messages/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.user}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      {item.unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={fetchConversations}>
            <Feather name="refresh-cw" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
          <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      ) : (
          <FlatList
            data={chats}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
                <View style={{padding: 40, alignItems: 'center'}}>
                    <Text style={{color: colors.subtext}}>No messages yet.</Text>
                </View>
            }
          />
      )}
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: { padding: 4 },
  iconBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  listContent: { paddingVertical: 10 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.secondary },
  content: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  time: { fontSize: 12, color: colors.subtext },
  message: { fontSize: 14, color: colors.subtext },
  badge: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 86 },
});