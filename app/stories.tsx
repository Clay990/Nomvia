import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { StoriesService } from '../app/services/stories';
import StoryModal from '../components/StoryModal';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 3;

export default function AllStoriesScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [stories, setStories] = useState<any[]>([]);
    
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerStories, setViewerStories] = useState<any[]>([]);
    const [initialIndex, setInitialIndex] = useState(0);

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        setLoading(true);
        try {
            const { stories: allStories } = await StoriesService.getStories({ limit: 50 });
            setStories(allStories);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openStory = (categoryStories: any[], index: number) => {
        setViewerStories(categoryStories);
        setInitialIndex(index);
        setViewerVisible(true);
    };


    const nearbyStories = stories.slice(0, 10);
    const worldStories = stories.slice(10, 20);
    const trendingStories = stories.slice(20, 35);
    
    const locationStories = [
        { title: 'Manali, India', data: stories.slice(0, 5) },
        { title: 'Goa, India', data: stories.slice(5, 10) },
    ].filter(g => g.data.length > 0);

    const renderStoryCircle = (story: any, index: number, sourceList: any[]) => (
        <TouchableOpacity 
            key={story.id} 
            style={styles.storyItem}
            onPress={() => openStory(sourceList, index)}
        >
            <View style={[styles.ring, { borderColor: colors.primary }]}>
                <Image source={{ uri: story.avatar }} style={styles.avatar} contentFit="cover" />
            </View>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{story.name}</Text>
        </TouchableOpacity>
    );

    const renderGridItem = (story: any, index: number, sourceList: any[]) => (
        <TouchableOpacity 
            key={story.id} 
            style={[styles.gridItem, { backgroundColor: colors.card }]}
            onPress={() => openStory(sourceList, index)}
        >
            <Image source={{ uri: story.storyImage }} style={styles.gridImage} contentFit="cover" />
            <View style={styles.gridOverlay}>
                <Text style={styles.gridName} numberOfLines={1}>{story.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Discover Stories</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {nearbyStories.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="map-marker-radius" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Now</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                                {nearbyStories.map((s, i) => renderStoryCircle(s, i, nearbyStories))}
                            </ScrollView>
                        </View>
                    )}

                    {worldStories.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="earth" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Around the World</Text>
                            </View>
                            <View style={styles.grid}>
                                {worldStories.map((s, i) => renderGridItem(s, i, worldStories))}
                            </View>
                        </View>
                    )}

                    {locationStories.map((group, idx) => (
                        <View key={idx} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="map-marker" size={20} color={colors.subtext} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>{group.title}</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                                {group.data.map((s, i) => renderStoryCircle(s, i, group.data))}
                            </ScrollView>
                        </View>
                    ))}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            <StoryModal 
                visible={viewerVisible}
                onClose={() => setViewerVisible(false)}
                stories={viewerStories}
                initialIndex={initialIndex}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 4 },
    title: { fontSize: 18, fontWeight: '700', fontFamily: 'YoungSerif_400Regular' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 40 },
    section: { marginBottom: 24, marginTop: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700' },
    row: { paddingHorizontal: 16, gap: 16 },
    storyItem: { alignItems: 'center', width: 70 },
    ring: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, padding: 3, marginBottom: 6 },
    avatar: { width: '100%', height: '100%', borderRadius: 30, backgroundColor: '#EEE' },
    name: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
    gridItem: { width: COLUMN_WIDTH, height: COLUMN_WIDTH * 1.5, borderRadius: 12, overflow: 'hidden' },
    gridImage: { width: '100%', height: '100%' },
    gridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)' },
    gridName: { color: '#FFF', fontSize: 10, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 }
});
