import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { PostsService } from "../../app/services/posts";
import { Post } from "../../app/types";
import { useTheme } from "../../context/ThemeContext";

export default function DiscussionsListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [discussions, setDiscussions] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
      try {
          const { posts } = await PostsService.getPosts({ category: 'Discussions', limit: 20 });
          setDiscussions(posts);
      } catch (error) {
          console.error("Failed to fetch discussions", error);
      } finally {
          setLoading(false);
      }
  };

  const getPostTitle = (item: Post) => {
      if (item.title) return item.title;
      
      const content = item.content;
      const firstLine = content.split('\n')[0];
      if (firstLine.startsWith('[TOPIC:')) {
          const parts = firstLine.replace('[TOPIC:', '').replace(']', '').split(' in ');
          return parts[0]?.trim() || 'Untitled Topic';
      }
      return content.substring(0, 30) + '...';
  };

  const filtered = discussions.filter(d => 
    d.content.toLowerCase().includes(search.toLowerCase()) || 
    (d.tag && d.tag.toLowerCase().includes(search.toLowerCase())) ||
    (d.title && d.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Forums</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.searchContainer}>
         <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.subtext} />
            <TextInput 
                style={[styles.input, { color: colors.text }]} 
                placeholder="Search topics..." 
                placeholderTextColor={colors.subtext}
                value={search}
                onChangeText={setSearch}
            />
         </View>
      </View>

      {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {filtered.length === 0 ? (
                <Text style={{ textAlign: 'center', color: colors.subtext, marginTop: 20 }}>No discussions found.</Text>
            ) : (
                filtered.map((item) => (
                    <TouchableOpacity 
                        key={item.$id} 
                        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => router.push(`/post/${item.$id}`)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.groupBadge, { backgroundColor: colors.primary + '20' }]}>
                                <Text style={[styles.groupText, { color: colors.primary }]}>{item.tag || 'General'}</Text>
                            </View>
                            {(item.likesCount || 0) > 5 && <MaterialCommunityIcons name="fire" size={16} color="#EF4444" />}
                        </View>
                        <Text style={[styles.topic, { color: colors.text }]} numberOfLines={2}>{getPostTitle(item)}</Text>
                        <View style={styles.meta}>
                            <Text style={[styles.metaText, { color: colors.subtext }]}>by {item.user_name}</Text>
                            <Text style={[styles.metaText, { color: colors.subtext }]}>• {item.commentsCount || 0} replies</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
          </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 4 },
  searchContainer: { padding: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 44, borderRadius: 12, borderWidth: 1, gap: 8 },
  input: { flex: 1, fontSize: 16 },
  list: { paddingHorizontal: 20, gap: 12 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  groupBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  groupText: { fontSize: 11, fontWeight: '700' },
  topic: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  meta: { flexDirection: 'row', gap: 6 },
  metaText: { fontSize: 12 }
});
