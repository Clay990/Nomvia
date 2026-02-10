import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  FlatList
} from "react-native";
import { Snackbar } from 'react-native-paper';
import { PostsService } from '../services/posts';
import { CirclesService } from '../services/circles';
import { Post } from '../types';
import PostCard from '../../components/PostCard';
import SkeletonPost from '../../components/SkeletonPost';
import { events } from '../utils/events';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = ['All', 'Meetups', 'Discussions', 'Wiki', 'Van Life', 'Help Needed', 'Convoy'];

export default function CommunityScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [recentMeetups, setRecentMeetups] = useState<Post[]>([]);
  const [hotDiscussions, setHotDiscussions] = useState<Post[]>([]);
  const [myCircles, setMyCircles] = useState<any[]>([]);

  const [category, setCategory] = useState('All');
  const [sortOption, setSortOption] = useState<'Latest' | 'Trending'>('Latest');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showToast = (msg: string) => {
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
  };

  const fetchAuxData = async () => {
      try {
          const [meetups, discussions, circles] = await Promise.all([
              PostsService.getRecentMeetups(),
              PostsService.getHotDiscussions(),
              CirclesService.getMyCircles()
          ]);
          setRecentMeetups(meetups);
          setHotDiscussions(discussions);
          setMyCircles(circles);
      } catch (e) {
          console.error("Failed to load aux data", e);
      }
  };

  const fetchPosts = async () => {
    try {
      if (!refreshing) setLoading(true);
      const { posts: newPosts } = await PostsService.getPosts({ 
          feedType: sortOption === 'Trending' ? 'trending' : 'latest', 
          limit: 20,
          category: category
      });
      setPosts(newPosts);
            if (category === 'All') {
          fetchAuxData();
      }

    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [category, sortOption]);

  useEffect(() => {
    fetchPosts();
  }, [category, sortOption]);

  useEffect(() => {
    const unsubscribe = events.on('post_created', () => {
        setRefreshing(true);
        fetchPosts();
    });
    return () => { unsubscribe(); };
  }, []);

  const handleReport = (postId: string) => {
      Alert.alert(
          "Report Content", 
          "Why are you reporting this?",
          [
              { text: "Spam", onPress: () => showToast("Reported. We will review this.") },
              { text: "Inappropriate", onPress: () => showToast("Reported. We will review this.") },
              { text: "Cancel", style: "cancel" }
          ]
      );
  };

  const toggleSort = () => {
      setSortOption(prev => prev === 'Latest' ? 'Trending' : 'Latest');
  };

  const getPostTitle = (item: Post, type: string) => {
      if (item.title) return item.title;

      const content = item.content;
      const firstLine = content.split('\n')[0];
      if (firstLine.startsWith('[EVENT:')) {
          const parts = firstLine.replace('[EVENT:', '').replace(']', '').split('@');
          return parts[0]?.trim() || 'Untitled Event';
      }
      if (firstLine.startsWith('[TOPIC:')) {
          const parts = firstLine.replace('[TOPIC:', '').replace(']', '').split(' in ');
          return parts[0]?.trim() || 'Untitled Topic';
      }
      if (firstLine.startsWith('[QUESTION:')) {
            return firstLine.replace('[QUESTION:', '').replace(']', '').trim();
      }
      return content.substring(0, 30) + '...';
  };

  const getEventTime = (item: Post) => {
      if (item.meetupTime) return item.meetupTime;

      const content = item.content;
      const firstLine = content.split('\n')[0];
      if (firstLine.includes('@')) {
          const parts = firstLine.split('@')[1].split(' in ');
          return parts[0]?.trim();
      }
      return 'TBD';
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={{ paddingHorizontal: 16 }}>
        <PostCard 
            post={item} 
            onLike={async (id) => {
                try { await PostsService.likePost(id, item.likesCount || 0); } catch(e) {}
            }}
            onMoreOptions={() => handleReport(item.$id)}
        />
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={{ paddingVertical: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
              {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    onPress={() => setCategory(cat)}
                    style={[
                        styles.catPill, 
                        { 
                            backgroundColor: category === cat ? colors.text : colors.card,
                            borderColor: category === cat ? colors.text : colors.border
                        }
                    ]}
                  >
                      <Text style={{ 
                          color: category === cat ? colors.background : colors.subtext, 
                          fontWeight: '600', 
                          fontSize: 13 
                      }}>{cat}</Text>
                  </TouchableOpacity>
              ))}
          </ScrollView>
      </View>


      {category === 'All' && (
            <>
                <View style={styles.sectionHeader}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Happening Nearby</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/map')}><Text style={styles.seeAllText}>View Map</Text></TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                    {recentMeetups.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center', width: 300 }}>
                            <Text style={{ color: colors.subtext }}>No upcoming meetups.</Text>
                        </View>
                    ) : (
                        recentMeetups.map((event) => (
                            <TouchableOpacity key={event.$id} style={styles.eventCard} activeOpacity={0.9} onPress={() => router.push(`/post/${event.$id}`)}>
                                <Image source={{ uri: event.image || 'https://via.placeholder.com/400x300?text=Meetup' }} style={styles.eventImage} />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.eventOverlay}>
                                    <View style={styles.dateBadge}>
                                        <Text style={styles.dateText}>{getEventTime(event)}</Text>
                                    </View>
                                    <Text style={styles.eventTitle} numberOfLines={1}>{getPostTitle(event, 'meetup')}</Text>
                                    <View style={styles.eventMetaRow}>
                                        <MaterialCommunityIcons name="map-marker" size={12} color="#FFF" />
                                        <Text style={styles.eventMeta} numberOfLines={1}>{event.location || 'Location TBD'}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Circles</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                    <TouchableOpacity style={styles.addCircleCard} onPress={() => router.push('/create-circle')}>
                        <View style={styles.addIconCircle}>
                            <MaterialCommunityIcons name="lock-plus" size={24} color={colors.text} />
                        </View>
                        <Text style={styles.addCardText}>Join Private Circle</Text>
                    </TouchableOpacity>
                    {myCircles.map((circle) => (
                        <TouchableOpacity key={circle.id} style={styles.circleContainer} onPress={() => router.push(`/circles/${circle.id}`)}>
                            <Image source={{ uri: circle.image || 'https://via.placeholder.com/150' }} style={styles.circleAvatar} />
                            {circle.notification > 0 && (
                                <View style={styles.notifBadge}>
                                    <Text style={styles.notifText}>{circle.notification}</Text>
                                </View>
                            )}
                            <Text style={[styles.circleLabel, { color: colors.text }]} numberOfLines={1}>{circle.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Hot Topics</Text>
                    <TouchableOpacity onPress={() => router.push('/discussions')}><Text style={styles.seeAllText}>Browse Forums</Text></TouchableOpacity>
                </View>
                <View style={styles.discussionList}>
                    {hotDiscussions.length === 0 ? (
                        <Text style={{ color: colors.subtext, fontStyle: 'italic' }}>No active discussions yet.</Text>
                    ) : (
                        hotDiscussions.map((item) => (
                            <TouchableOpacity key={item.$id} style={styles.topicCard} onPress={() => router.push(`/post/${item.$id}`)}>
                                <View style={styles.topicLeft}>
                                    <View style={styles.topicIcon}>
                                        <MaterialCommunityIcons name="comment-text-outline" size={20} color={colors.subtext} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.topicTitle} numberOfLines={1}>{getPostTitle(item, 'discussion')}</Text>
                                        <Text style={styles.topicSub}>in {item.tag || 'General'} • by {item.user_name}</Text>
                                    </View>
                                </View>
                                <View style={styles.topicRight}>
                                    <View style={styles.replyBadge}>
                                        <Text style={styles.replyText}>{item.commentsCount || 0}</Text>
                                    </View>
                                    {(item.likesCount || 0) > 5 && <MaterialCommunityIcons name="fire" size={14} color="#EF4444" style={{marginTop: 4}} />} 
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </>
      )}

        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{category === 'All' ? 'Recent Activity' : `${category} Feed`}</Text>
        </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>The Campfire</Text>
                <Text style={[styles.headerSub, { color: colors.subtext }]}>Connect, discuss, and meet up.</Text>
            </View>
        </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity 
                  onPress={() => router.push('/messages')} 
                  style={{ 
                    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, 
                    borderWidth: 1, borderColor: colors.border,
                    justifyContent: 'center', alignItems: 'center'
                  }}
                  accessibilityLabel="Messages"
                  accessibilityRole="button"
                >
                  <Feather name="message-square" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={() => router.push('/create-campfire-post')}>
                    <MaterialCommunityIcons name="fire" size={24} color={colors.background} />
                </TouchableOpacity>
              </View>
            </View>
      <FlatList 
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item.$id}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        ListFooterComponent={
            loading && !refreshing ? (
                <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
                    <SkeletonPost />
                    <SkeletonPost />
                    <SkeletonPost />
                </View>
            ) : (
                <View style={{ height: 100 }} />
            )
        }
        ListEmptyComponent={
            !loading && posts.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 100 }}>
                    <MaterialCommunityIcons name="fire-off" size={48} color={colors.border} />
                    <Text style={{ textAlign: 'center', color: colors.subtext, marginTop: 12 }}>No posts found in {category}.</Text>
                    <TouchableOpacity onPress={() => setCategory('All')} style={{ marginTop: 12 }}>
                        <Text style={{ color: colors.primary, fontWeight: '700' }}>View All</Text>
                    </TouchableOpacity>
                </View>
            ) : null
        }
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: colors.text, marginBottom: 80 }} 
      >
        <Text style={{ color: colors.background, fontWeight: '600' }}>{snackbarMessage}</Text>
      </Snackbar>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },
  createButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  catPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
  },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, marginTop: 20, marginBottom: 16 
  },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  seeAllText: { fontSize: 12, fontWeight: '600', color: colors.subtext },
  horizontalScroll: { paddingHorizontal: 24, gap: 12 },
  eventCard: { width: 200, height: 140, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.secondary },
  eventImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  eventOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', justifyContent: 'flex-end', padding: 12 },
  dateBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: colors.card, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dateText: { fontSize: 10, fontWeight: '800', color: colors.text },
  eventTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '500' },
  addCircleCard: { 
    width: 80, alignItems: 'center', gap: 8, justifyContent: 'flex-start'
  },
  addIconCircle: { 
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.card, 
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center' 
  },
  addCardText: { fontSize: 10, color: colors.subtext, textAlign: 'center', fontWeight: '600' },
  circleContainer: { width: 70, alignItems: 'center', gap: 8 },
  circleAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.secondary },
  circleLabel: { fontSize: 11, fontWeight: '600', color: colors.text, textAlign: 'center', width: '100%' },
  notifBadge: { 
    position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', 
    minWidth: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#FFF',
    justifyContent: 'center', alignItems: 'center' 
  },
  notifText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  discussionList: { paddingHorizontal: 24, gap: 12 },
  topicCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 16, backgroundColor: colors.card, 
    borderWidth: 1, borderColor: colors.border 
  },
  topicLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  topicIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  topicTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  topicSub: { fontSize: 11, color: colors.subtext },
  topicRight: { alignItems: 'center' },
  replyBadge: { backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  replyText: { fontSize: 10, fontWeight: '700', color: colors.subtext },
  exploreBox: { 
    margin: 24, padding: 20, backgroundColor: colors.primary, borderRadius: 20, 
    alignItems: 'center', gap: 8 
  },
  exploreTitle: { color: colors.background, fontSize: 18, fontWeight: '800' },
  exploreSub: { color: colors.subtext, fontSize: 13, marginBottom: 8 },
  exploreBtn: { backgroundColor: colors.background, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  exploreBtnText: { color: colors.text, fontWeight: '700', fontSize: 13 }
});