import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, FlatList } from "react-native";
import { CirclesService } from "../../app/services/circles";
import { PostsService } from "../../app/services/posts";
import { useTheme } from "../../context/ThemeContext";
import PostCard from "../../components/PostCard";
import { Post, Circle } from "../../app/types";
import Toast from 'react-native-toast-message';

const CircleHeader = ({ 
    circle, 
    colors, 
    onChatPress, 
    onNewPostPress,
    postCount
}: { 
    circle: Circle; 
    colors: any; 
    onChatPress: () => void;
    onNewPostPress: () => void;
    postCount: number;
}) => {
    return (
        <>
            <Image source={{ uri: circle.image || 'https://via.placeholder.com/400x200' }} style={styles.cover} />
            
            <View style={[styles.content, { backgroundColor: colors.card }]}>
                <Text style={[styles.title, { color: colors.text }]}>{circle.name}</Text>
                <Text style={[styles.stats, { color: colors.subtext }]}>
                    {circle.members} Members • {circle.isPrivate ? 'Private' : 'Public'} Group
                </Text>
                
                <View style={styles.actionButtons}>
                    {circle.isPrivate ? (
                        <>
                            <TouchableOpacity 
                                style={[styles.joinBtn, { backgroundColor: colors.primary, flex: 1 }]}
                                onPress={onChatPress}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="chat-processing-outline" size={20} color="#FFF" />
                                <Text style={styles.joinBtnText}>Chat</Text>
                            </TouchableOpacity>

                            <View style={[styles.joinedBadge, { borderColor: colors.border }]}>
                                 <Text style={[styles.joinBtnText, { color: colors.text }]}>Joined</Text>
                                 <MaterialCommunityIcons name="check" size={16} color={colors.text} />
                            </View>
                        </>
                    ) : (
                        <View style={[styles.joinedBadge, { borderColor: colors.border, flex: 1 }]}>
                            <Text style={[styles.joinBtnText, { color: colors.text }]}>Joined</Text>
                            <MaterialCommunityIcons name="check" size={20} color={colors.text} />
                        </View>
                    )}

                    <TouchableOpacity style={[styles.iconBtn, { borderColor: 'transparent', width: 40 }]}>
                        <MaterialCommunityIcons name="share-variant" size={24} color={colors.subtext} />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
                    <Text style={{ color: colors.subtext, lineHeight: 24, fontSize: 15 }}>
                        {circle.description || "No description provided."}
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.membersHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Members</Text>
                        <TouchableOpacity>
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.membersList}>
                        {[1, 2, 3, 4, 5].map((i, index) => (
                             <View 
                                key={i} 
                                style={[
                                    styles.memberAvatar, 
                                    { 
                                        borderColor: colors.card,
                                        marginLeft: index === 0 ? 0 : -15,
                                        backgroundColor: '#E5E7EB' 
                                    }
                                ]} 
                            />
                        ))}
                        <View style={[
                            styles.memberAvatar, 
                            { 
                                backgroundColor: colors.border, 
                                borderColor: colors.card, 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                marginLeft: -15
                            }
                        ]}>
                             <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text }}>
                                +{Math.max((circle.members || 0) - 5, 0)}
                             </Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Discussion Feed</Text>
                
                {postCount === 0 && (
                    <View style={[styles.emptyState, { borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="campfire" size={56} color={colors.primary} style={{ opacity: 0.8 }} />
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 16 }}>Start the Campfire!</Text>
                        <Text style={{ color: colors.subtext, marginTop: 4, marginBottom: 20 }}>Be the first to say hello.</Text>
                        <TouchableOpacity 
                            style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}
                            onPress={onNewPostPress}
                        >
                            <Text style={{ color: '#FFF', fontWeight: '700' }}>New Post</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </>
    );
};

export default function CircleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [circle, setCircle] = useState<Circle | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
        const circleData = await CirclesService.getCircleById(id as string);
        // Ensure circleData fits Circle interface, handle potential type mismatch if service returns different structure
        setCircle(circleData as unknown as Circle);

        if (circleData?.name) {
            const { posts: circlePosts } = await PostsService.getPosts({ 
                category: circleData.name, 
                circleId: circleData.id,
                limit: 10 
            });
            setPosts(circlePosts);
        }
    } catch (error) {
        console.error(error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load circle details' });
        router.back();
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  }, [id, router]);

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  const onRefresh = () => {
      setRefreshing(true);
      fetchData();
  };

  const handleChatPress = () => {
      if (circle?.id) {
        router.push(`/circles/chat/${circle.id}`);
      }
  };

  const handleNewPostPress = () => {
      if (circle) {
        router.push({ 
            pathname: '/create-campfire-post', 
            params: { 
                initialGroup: circle.name, 
                circleId: circle.id,
                isPrivate: circle.isPrivate ? 'true' : 'false' 
            } 
        });
      }
  };

  if (loading) {
      return (
          <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      );
  }

  if (!circle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Circle not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
            data={posts}
            renderItem={({ item }) => <View style={{ paddingHorizontal: 20 }}><PostCard post={item} /></View>}
            keyExtractor={item => item.$id}
            ListHeaderComponent={
                <CircleHeader 
                    circle={circle} 
                    colors={colors} 
                    onChatPress={handleChatPress} 
                    onNewPostPress={handleNewPostPress}
                    postCount={posts.length}
                />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
        />
        
        <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={handleNewPostPress}
            activeOpacity={0.8}
        >
            <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cover: { width: '100%', height: 280 },
  headerOverlay: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  backBtn: { 
      width: 40, height: 40, borderRadius: 20, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      justifyContent: 'center', alignItems: 'center', 
      padding: 0 
  },
  content: { 
      padding: 24, marginTop: -32, 
      borderTopLeftRadius: 30, borderTopRightRadius: 30 
  },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  stats: { fontSize: 14, marginBottom: 20 },
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 24, alignItems: 'center' },
  joinBtn: { 
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
      gap: 8, padding: 12, borderRadius: 16 
  },
  joinedBadge: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, paddingHorizontal: 16, paddingVertical: 12,
      borderRadius: 16, borderWidth: 1, backgroundColor: 'transparent'
  },
  joinBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  iconBtn: { 
      width: 48, height: 48, borderRadius: 16, borderWidth: 1, 
      alignItems: 'center', justifyContent: 'center' 
  },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  membersHeader: { 
      flexDirection: 'row', justifyContent: 'space-between', 
      alignItems: 'center', marginBottom: 12 
  },
  membersList: { flexDirection: 'row', alignItems: 'center' },
  memberAvatar: {
      width: 40, height: 40, borderRadius: 20,
      borderWidth: 2
  },
  emptyState: { 
      padding: 40, alignItems: 'center', justifyContent: 'center', 
      borderStyle: 'dashed', borderWidth: 2, borderRadius: 20 
  },
  fab: {
      position: 'absolute', bottom: 30, right: 20,
      width: 56, height: 56, borderRadius: 28,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
      zIndex: 20
  }
});