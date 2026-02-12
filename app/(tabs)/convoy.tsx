import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../context/ThemeContext";
import { PostsService } from "../services/posts";
import PostCard from "../../components/PostCard";
import SkeletonPost from "../../components/SkeletonPost";
import { Post } from "../types";
import { calculateDistance, CURRENT_USER_LOCATION } from "../../app/utils/location";
import { events } from "../../app/utils/events";
import { account, databases } from "../../lib/appwrite";
import { APPWRITE_CONFIG } from "../../app/config/appwrite-schema";
import { useAuth } from "../../context/AuthContext";

import FeedHeader from "../../components/convoy/FeedHeader";
import AnimatedHeader from "../../components/convoy/AnimatedHeader";
import PostOptionsModal from "../../components/PostOptionsModal";
import { Alert } from "react-native";

export default function ConvoyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastId, setLastId] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 
  const [filterType, setFilterType] = useState<'all' | 'trending' | 'latest'>('all');

  const [postOptionsVisible, setPostOptionsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
      } catch (e) { console.log('Error getting user', e); }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUserInterests = async () => {
      try {
        const user = await account.get();
        const userDoc = await databases.getDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.USERS,
          user.$id
        );
        if (userDoc?.interests) {
          setUserInterests(userDoc.interests);
        }
      } catch (error) {
        console.log('Error fetching user interests', error);
      }
    };
    fetchUserInterests();
  }, []);

  const fetchPosts = useCallback(async (cursorId?: string, shouldReset = false) => {
    try {
      if (shouldReset) setLoading(true);
      
      const { posts: newPosts } = await PostsService.getPosts({
        lastId: cursorId,
        limit: 20,
        feedType: filterType,
        searchQuery,
        userInterests
      });

      if (shouldReset) {
        setPosts(newPosts);
        setLastId(newPosts.length > 0 ? newPosts[newPosts.length - 1].$id : undefined);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setLastId(newPosts.length > 0 ? newPosts[newPosts.length - 1].$id : undefined);
      }

      setHasMore(newPosts.length === 20);

    } catch (error: any) {
      console.error(error);
      if (error.code === 401) {
          logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filterType, userInterests]);

  useEffect(() => {
      const postUnsub = events.on('post_created', () => fetchPosts(undefined, true));
      return () => { postUnsub(); };
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts(undefined, true);
  }, [fetchPosts]); 

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1); 
    fetchPosts(undefined, true);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && lastId) {
      fetchPosts(lastId);
    }
  }, [loading, hasMore, lastId, fetchPosts]);

  const handleSearchSubmit = useCallback(() => {
      fetchPosts(undefined, true);
  }, [fetchPosts]);

  const handleMoreOptions = useCallback((postId: string) => {
      setSelectedPostId(postId);
      setPostOptionsVisible(true);
  }, []);

  const handleOptionSelect = async (option: 'share' | 'report' | 'block' | 'delete') => {
      setPostOptionsVisible(false);
      if (!selectedPostId) return;

      if (option === 'delete') {
          Alert.alert(
              "Delete Post",
              "Are you sure you want to delete this post?",
              [
                  { text: "Cancel", style: "cancel" },
                  { 
                      text: "Delete", 
                      style: "destructive", 
                      onPress: async () => {
                          try {
                              await PostsService.deletePost(selectedPostId);
                              setPosts(prev => prev.filter(p => p.$id !== selectedPostId));
                          } catch (e) {
                              Alert.alert("Error", "Failed to delete post.");
                          }
                      }
                  }
              ]
          );
      } else {
          setTimeout(() => {
              if (option === 'report') Alert.alert("Reported", "Thanks for keeping the convoy safe.");
              if (option === 'block') Alert.alert("Blocked", "You won't see posts from this user.");
          }, 500);
      }
  };

  const getDistanceString = useCallback((post: Post) => {
      if (post.latitude && post.longitude) {
          const dist = calculateDistance(
              CURRENT_USER_LOCATION.latitude, 
              CURRENT_USER_LOCATION.longitude, 
              post.latitude, 
              post.longitude
          );
          return dist < 1 ? "Nearby" : `${dist} km away`;
      }
      return undefined;
  }, []);

  const renderItem = useCallback(({ item }: { item: Post }) => (
    <PostCard 
        post={item} 
        distance={getDistanceString(item)}
        onOpen={(id) => router.push({ pathname: '/post/[id]', params: { id } })}
        onMoreOptions={() => handleMoreOptions(item.$id)}
    />
  ), [getDistanceString, handleMoreOptions]);

  const keyExtractor = useCallback((item: Post) => item.$id, []);


  const ListHeader = useMemo(() => (
      <FeedHeader 
          showSearch={showSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          refreshKey={refreshKey}
          filterType={filterType}
          setFilterType={setFilterType}
      />
  ), [showSearch, searchQuery, handleSearchSubmit, refreshKey, filterType]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[
          styles.header, 
          { 
              backgroundColor: colors.background, 
              borderBottomColor: colors.border,
              paddingTop: insets.top + 10 
          }
      ]}>
        <AnimatedHeader />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            style={[styles.iconBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
            accessibilityLabel="Toggle search"
            accessibilityRole="button"
          >
            <Feather name="search" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/create-post')} 
            style={[styles.iconBtn, { backgroundColor: colors.text }]}
            accessibilityLabel="Create Post"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="plus" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing && posts.length === 0 ? (
          <View style={{ padding: 16 }}>
              <SkeletonPost />
              <SkeletonPost />
              <SkeletonPost />
          </View>
      ) : (
          <FlatList
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.feed}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeader}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5} 
            removeClippedSubviews={true} 
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            ListFooterComponent={
                loading && !refreshing ? <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} /> : null
            }
            ListEmptyComponent={
                !loading ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="post-outline" size={48} color={colors.border} />
                        <Text style={{ color: colors.subtext, marginTop: 12 }}>No posts found nearby.</Text>
                        <TouchableOpacity onPress={onRefresh} style={{ marginTop: 16 }}>
                            <Text style={{ color: colors.primary, fontWeight: '700' }}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                ) : null
            }
          />
      )}

      <View style={styles.floatingContainer}>
        <TouchableOpacity
          style={[styles.mapPill, { backgroundColor: colors.text }]}
          activeOpacity={0.9}
          onPress={() => router.push('/map')}
          accessibilityRole="button"
          accessibilityLabel="Open Map View"
        >
          <Text style={[styles.mapPillText, { color: colors.background }]}>Map</Text>
          <MaterialCommunityIcons name="map-marker-multiple" size={16} color={colors.background} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      <PostOptionsModal 
        visible={postOptionsVisible}
        onClose={() => setPostOptionsVisible(false)}
        onSelect={handleOptionSelect}
        isOwner={currentUserId === posts.find(p => p.$id === selectedPostId)?.userId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },
  feed: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'box-none', 
  },
  mapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mapPillText: {
    fontWeight: '700',
    fontSize: 14,
  }
});
