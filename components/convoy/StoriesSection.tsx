import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { StoriesService } from '../../app/services/stories';
import { events } from '../../app/utils/events';
import StoryModal from '../StoryModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoriesSectionProps {
    refreshKey?: number; 
}

export default function StoriesSection({ refreshKey }: StoriesSectionProps) {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    
    const [stories, setStories] = useState<any[]>([]);
    
    const loadingStoriesRef = useRef(false);
    const hasMoreStoriesRef = useRef(true);
    const storiesLastIdRef = useRef<string | undefined>(undefined);

    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(-1);
    const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
    const [isUploadingStory, setIsUploadingStory] = useState(false);

    const { uniqueUsers, sortedStories } = React.useMemo(() => {
        const userMap = new Map();
        
        stories.forEach(story => {
            const userId = story.userId || story.name; 
            if (!userMap.has(userId)) {
                userMap.set(userId, {
                    ...story, 
                    userStories: []
                });
            }
            userMap.get(userId).userStories.push(story);
        });

        const uniqueUsers = Array.from(userMap.values());
        
        const sortedStories = uniqueUsers.flatMap(u => u.userStories);

        return { uniqueUsers, sortedStories };
    }, [stories]);

    useEffect(() => {
        AsyncStorage.getItem('viewed_stories').then((json: string | null) => {
           if (json) {
               try {
                   setViewedStories(new Set(JSON.parse(json)));
               } catch (e) {
                   console.log("Error parsing viewed stories", e);
               }
           }
        });
    }, []);
    
    const handleUserPress = (user: any) => {
        const index = sortedStories.findIndex(s => s.id === user.userStories[0].id);
        if (index !== -1) {
            setSelectedStoryIndex(index);
        }
    };

    const fetchStories = useCallback(async (cursorId?: string, shouldReset = false) => {
        console.log('[StoriesSection] fetchStories triggered', { cursorId, shouldReset, hasMore: hasMoreStoriesRef.current, loading: loadingStoriesRef.current });
        
        if (!hasMoreStoriesRef.current && !shouldReset) return;
        if (loadingStoriesRef.current && !shouldReset) return;
  
        try {
            loadingStoriesRef.current = true;
            
            const { stories: newStories, lastId: newLastId } = await StoriesService.getStories({
                lastId: shouldReset ? undefined : cursorId,
                limit: 10
            });

            console.log('[StoriesSection] Fetched stories result:', { newStoriesCount: newStories.length, newLastId });
  
            if (shouldReset) {
                setStories(newStories);
            } else {
                setStories(prev => [...prev, ...newStories]);
            }
            
            storiesLastIdRef.current = newLastId;
            
            const hasMore = newStories.length === 10;
            hasMoreStoriesRef.current = hasMore;
            
        } catch (error) {
            console.error("[StoriesSection] Failed to fetch stories", error);
        } finally {
            loadingStoriesRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchStories(undefined, true);
        
        const storyUnsub = events.on('story_created', () => fetchStories(undefined, true));
        return () => { storyUnsub(); };
    }, [fetchStories, refreshKey]);

    const handleAddStory = () => {
        setIsUploadingStory(true);
        router.push('/create-story');
        setTimeout(() => setIsUploadingStory(false), 1000); 
    };

    const handleStoryViewed = useCallback(async (storyId: string) => {
        StoriesService.viewStory(storyId);
        setViewedStories(prev => {
            if (!prev.has(storyId)) {
                const newSet = new Set(prev).add(storyId);
                AsyncStorage.setItem('viewed_stories', JSON.stringify(Array.from(newSet)));
                return newSet;
            }
            return prev;
        });
    }, []);

    return (
        <View style={{ paddingVertical: 16 }}>
            <StoryModal 
                visible={selectedStoryIndex >= 0}
                onClose={() => setSelectedStoryIndex(-1)}
                stories={sortedStories} 
                initialIndex={selectedStoryIndex}
                onStoryViewed={handleStoryViewed}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Nearby Now</Text>
                <TouchableOpacity onPress={() => router.push('/stories')}>
                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>See all</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={uniqueUsers} 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
                keyExtractor={(item) => item.userId || item.id}
                onEndReached={() => {
                    if (hasMoreStoriesRef.current && !loadingStoriesRef.current && storiesLastIdRef.current) {
                        fetchStories(storiesLastIdRef.current);
                    }
                }}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    <TouchableOpacity style={{ alignItems: 'center', gap: 6, marginRight: 16 }} onPress={handleAddStory} disabled={isUploadingStory}>
                        <View style={{ position: 'relative' }}>
                             <View style={{ 
                                 width: 56, 
                                 height: 56, 
                                 borderRadius: 28, 
                                 borderWidth: 2, 
                                 borderColor: colors.card,
                                 backgroundColor: colors.border,
                                 justifyContent: 'center',
                                 alignItems: 'center'
                             }}>
                                 {isUploadingStory ? <ActivityIndicator color={colors.primary} /> : <MaterialCommunityIcons name="account" size={32} color={colors.subtext} />}
                             </View>
                             <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.background }}>
                                 <MaterialCommunityIcons name="plus" size={12} color={isDark ? "#111" : "#FFF"} />
                             </View>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>Your Story</Text>
                            <Text style={{ fontSize: 10, color: colors.subtext }}>Tap to add</Text>
                        </View>
                    </TouchableOpacity>
                }
                renderItem={({ item: user }) => {
                    const allViewed = user.userStories.every((s: any) => viewedStories.has(s.id));
                    
                    return (
                        <TouchableOpacity 
                            style={{ alignItems: 'center', gap: 6 }} 
                            onPress={() => handleUserPress(user)}
                            accessibilityLabel={`View story by ${user.name}`}
                            accessibilityHint="Double tap to view story"
                        >
                            <View style={{ 
                                borderWidth: 2, 
                                borderColor: allViewed ? colors.border : colors.primary, 
                                borderRadius: 30, 
                                padding: 3,
                                borderStyle: 'solid'
                             }}>
                                <Image 
                                    source={{ uri: user.avatar }} 
                                    style={{ width: 56, height: 56, borderRadius: 28 }} 
                                    contentFit="cover"
                                    transition={200}
                                    cachePolicy="memory-disk"
                                />
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, fontWeight: allViewed ? '400' : '700', color: colors.text }}>{user.name}</Text>
                                <Text style={{ fontSize: 10, color: colors.subtext }}>{user.distance}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}
