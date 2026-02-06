import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Platform, StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStoryMedia, prefetchStory } from '../app/utils/cache';
import { StoriesService } from '../app/services/stories';

const { width } = Dimensions.get('window');
const DEFAULT_DURATION = 5000;

interface Story {
    id: string;
    name: string;
    avatar: string;
    storyImage?: string;
    distance?: string;
    type?: 'image' | 'video';
    duration?: number;
}

interface StoryModalProps {
    visible: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex: number;
    onStoryViewed?: (storyId: string) => void;
}

export default function StoryModal({ visible, onClose, stories, initialIndex, onStoryViewed }: StoryModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [mediaUri, setMediaUri] = useState<string>("");
    const [isPaused, setIsPaused] = useState(false);
    const [liked, setLiked] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isContentReady, setIsContentReady] = useState(false);
    const progress = useRef(new Animated.Value(0)).current;
    const currentStory = stories[currentIndex];

    useEffect(() => {
        setLiked(false);
        setReplyText('');
    }, [currentIndex]);

    const handleLike = async () => {
        if (!liked) {
            setLiked(true);
            await StoriesService.likeStory(currentStory.id);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        
        handlePause(); 
        const text = replyText;
        setReplyText(''); 
        
        await StoriesService.replyToStory(currentStory.id, text);
        handleResume();
    };

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
        }
    }, [visible, initialIndex]);

    useEffect(() => {
        const loadMedia = async () => {
            if (currentStory?.storyImage) {
                setIsContentReady(false);
                const uri = await getStoryMedia(currentStory.storyImage, currentStory.id);
                setMediaUri(uri);
            }
        };
        loadMedia();

        if (currentIndex < stories.length - 1) {
            const next = stories[currentIndex + 1];
            if (next?.storyImage) prefetchStory(next.storyImage, next.id);
        }
        if (currentIndex < stories.length - 2) {
            const nextNext = stories[currentIndex + 2];
            if (nextNext?.storyImage) prefetchStory(nextNext.storyImage, nextNext.id);
        }
    }, [currentIndex, stories]);

    const handleNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    const runAnimation = useCallback(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: remainingTimeRef.current,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                handleNext();
            }
        });
    }, [progress, handleNext]);

    const handleContentLoad = useCallback(() => {
        setIsContentReady(true);
        runAnimation();
    }, [runAnimation]);

    const handlePause = useCallback(() => {
        setIsPaused(true);
        progress.stopAnimation((value) => {
            const totalDuration = currentStory?.duration || DEFAULT_DURATION;
            remainingTimeRef.current = totalDuration * (1 - value);
        });
    }, [progress, currentStory?.duration]);

    const handleResume = useCallback(() => {
        setIsPaused(false);
        if (remainingTimeRef.current > 0 && isContentReady) {
            runAnimation();
        }
    }, [runAnimation, isContentReady]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            progress.setValue(0);
            remainingTimeRef.current = currentStory?.duration || DEFAULT_DURATION;
            if (isContentReady) runAnimation();
        }
    }, [currentIndex, progress, currentStory?.duration, runAnimation, isContentReady]);

    useEffect(() => {
        if (visible && currentStory && onStoryViewed) {
            onStoryViewed(currentStory.id);
        }
    }, [currentIndex, visible, currentStory, onStoryViewed]);

    const remainingTimeRef = useRef<number>(DEFAULT_DURATION);
    
    useEffect(() => {
        if (!visible) {
            progress.setValue(0);
            setIsContentReady(false);
            return;
        }
        setLiked(false);
        progress.setValue(0);
        setIsContentReady(false);
        remainingTimeRef.current = currentStory?.duration || DEFAULT_DURATION;
        return () => progress.stopAnimation();
    }, [currentIndex, visible, currentStory, progress]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                handlePause();
            },
            onPanResponderRelease: (evt, gestureState) => {
                handleResume();
                if (gestureState.dy > 50) {
                    onClose();
                    return;
                }
                if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
                    const tapX = evt.nativeEvent.locationX;
                    if (tapX < width / 3) {
                        handlePrev();
                    } else {
                        handleNext();
                    }
                }
            }
        })
    ).current;

    if (!visible || !currentStory) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.container} {...panResponder.panHandlers}>
                <StatusBar hidden />
                <View style={styles.mediaContainer}>
                    {!isContentReady && (
                        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 1 }]}>
                            <ActivityIndicator size="large" color="#FFD700" />
                        </View>
                    )}
                    {currentStory.type === 'video' ? (
                        <Video
                            source={{ uri: mediaUri || currentStory.storyImage || "" }}
                            style={styles.image}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={!isPaused && isContentReady}
                            isLooping={false}
                            isMuted={false}
                            onLoadStart={() => {}}
                            onLoad={handleContentLoad}
                            onError={(e) => {}}
                        />
                    ) : (
                        <Image 
                            source={mediaUri ? { uri: mediaUri } : { uri: currentStory.storyImage }} 
                            style={styles.image} 
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            onLoadStart={() => {}}
                            onLoad={handleContentLoad}
                            onError={(e) => {}}
                        />
                    )}
                </View>
                <SafeAreaView style={styles.overlay}>
                    <View>
                        <View style={styles.progressContainer}>
                            {stories.map((_, index) => (
                                <View key={index} style={styles.progressBarBg}>
                                    {index === currentIndex ? (
                                        <Animated.View 
                                            style={[
                                                styles.progressBarFill, 
                                                { 
                                                    width: progress.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ['0%', '100%']
                                                    }) 
                                                }
                                            ]} 
                                        />
                                    ) : (
                                        <View style={[styles.progressBarFill, { width: index < currentIndex ? '100%' : '0%' }]} />
                                    )}
                                </View>
                            ))}
                        </View>
                        <View style={styles.header}>
                            <View style={styles.travelTag}>
                                <Image source={{ uri: currentStory.avatar }} style={styles.avatar} />
                                <View>
                                    <Text style={styles.username}>{currentStory.name}</Text>
                                    <View style={styles.locationRow}>
                                        <MaterialCommunityIcons name="map-marker" size={12} color="#FFD700" />
                                        <Text style={styles.time}>{currentStory.distance || 'Unknown Location'}</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close story">
                                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <View style={styles.replyBubble}>
                            <TextInput 
                                placeholder="Reply to journey..." 
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                style={styles.replyInput}
                                value={replyText}
                                onChangeText={setReplyText}
                                onSubmitEditing={handleReply}
                                onFocus={handlePause}
                                onBlur={handleResume}
                            />
                            <TouchableOpacity onPress={handleReply}>
                                <MaterialCommunityIcons name="send" size={20} color="#FFD700" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                            onPress={handleLike} 
                            style={[styles.fab, liked && { backgroundColor: 'rgba(255, 68, 68, 0.2)' }]}
                            accessibilityLabel="Like story"
                        >
                            <MaterialCommunityIcons 
                                name={liked ? "heart" : "heart-outline"} 
                                size={28} 
                                color={liked ? "#FF4444" : "#FFF"} 
                            />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mediaContainer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        overflow: 'hidden',
        margin: 0,
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a1a',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 10,
    },
    travelTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        paddingRight: 16,
        borderRadius: 30,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: '#FFD700',
    },
    username: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    time: {
        color: '#FFD700',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    replyBubble: {
        flex: 1,
        height: 50,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    replyInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 14,
        marginRight: 10,
    },
    fab: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 4,
        height: 4,
        marginBottom: 8,
    },
    progressBarBg: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFD700',
    },
});
