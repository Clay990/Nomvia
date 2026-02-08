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
    View,
    FlatList,
    KeyboardAvoidingView,
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStoryMedia, prefetchStory } from '../app/utils/cache';
import { StoriesService } from '../app/services/stories';
import { CommentsService } from '../app/services/comments';
import CommentItem from './CommentItem';
import { Comment } from '../app/types';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const DEFAULT_DURATION = 5000;

interface Story {
    id: string;
    name: string;
    avatar: string;
    storyImage?: string;
    distance?: string;
    type?: 'image' | 'video';
    duration?: number;
    likesCount?: number;
    commentsCount?: number;
}

interface StoryModalProps {
    visible: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex: number;
    onStoryViewed?: (storyId: string) => void;
}

export default function StoryModal({ visible, onClose, stories, initialIndex, onStoryViewed }: StoryModalProps) {
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [mediaUri, setMediaUri] = useState<string>("");
    const [isPaused, setIsPaused] = useState(false);
    const [liked, setLiked] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isContentReady, setIsContentReady] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    
    const [localLikesCount, setLocalLikesCount] = useState(0);
    const [localCommentsCount, setLocalCommentsCount] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const progress = useRef(new Animated.Value(0)).current;
    const currentStory = stories[currentIndex];

    useEffect(() => {
        if (currentStory) {
            setLiked(false);
            setReplyText('');
            setLocalLikesCount(currentStory.likesCount || 0);
            setLocalCommentsCount(currentStory.commentsCount || 0);
            setShowComments(false);
            setComments([]);
        }
    }, [currentIndex, currentStory]);

    const handleLike = async () => {
        if (!liked) {
            setLiked(true);
            setLocalLikesCount(prev => prev + 1);
            await StoriesService.likeStory(currentStory.id);
        }
    };

    const fetchComments = async () => {
        if (!currentStory) return;
        setLoadingComments(true);
        try {
            const result = await CommentsService.listComments(currentStory.id);
            setComments(result.comments);
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const toggleComments = () => {
        const willShow = !showComments;
        setShowComments(willShow);
        if (willShow) {
            handlePause();
            fetchComments();
        } else {
            handleResume();
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        
        if (!showComments) handlePause(); 
        
        const text = replyText;
        setReplyText(''); 
        
        try {
            if (showComments) {
                const tempComment: any = {
                    $id: 'temp-' + Date.now(),
                    content: text,
                    user_name: 'Me',
                    timestamp: new Date().toISOString(),
                    user_avatar: undefined 
                };
                setComments(prev => [tempComment, ...prev]);
            }

            const success = await StoriesService.replyToStory(currentStory.id, text);
            
            if (success) {
                setLocalCommentsCount(prev => prev + 1);
                if (showComments) fetchComments(); 
            }
        } catch (e) {
            console.error("Reply failed", e);
        }
        
        if (!showComments) handleResume();
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
        if (showComments || isBuffering) return; 

        Animated.timing(progress, {
            toValue: 1,
            duration: remainingTimeRef.current,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                handleNext();
            }
        });
    }, [progress, handleNext, showComments, isBuffering]);

    useEffect(() => {
        if (isBuffering) {
            progress.stopAnimation((value) => {
                const totalDuration = currentStory?.duration || DEFAULT_DURATION;
                remainingTimeRef.current = totalDuration * (1 - value);
            });
        } else {
            if (isContentReady && !isPaused && !showComments) {
                runAnimation();
            }
        }
    }, [isBuffering, isContentReady, isPaused, showComments, runAnimation, progress, currentStory?.duration]);

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
        if (showComments) return; 
        
        setIsPaused(false);
        if (remainingTimeRef.current > 0 && isContentReady) {
            runAnimation();
        }
    }, [runAnimation, isContentReady, showComments]);

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
            onStartShouldSetPanResponder: () => !showComments, 
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
            <View style={styles.container}>
                <StatusBar hidden />
                
                <View style={styles.storyLayer} {...panResponder.panHandlers}>
                <View style={styles.mediaContainer}>
                    {(!isContentReady || isBuffering) && (
                        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 1 }]}>
                            <ActivityIndicator size="large" color="#FFD700" />
                        </View>
                    )}
                    {currentStory.type === 'video' ? (
                        <Video
                            source={{ uri: mediaUri || currentStory.storyImage || "" }}
                            style={styles.image}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={!isPaused && isContentReady && !showComments}
                            isLooping={false}
                            isMuted={false}
                            onLoad={handleContentLoad}
                            progressUpdateIntervalMillis={200}
                            onPlaybackStatusUpdate={status => {
                                if (!status.isLoaded) return;
                                if (status.isBuffering !== isBuffering) {
                                    setIsBuffering(status.isBuffering);
                                }
                            }}
                        />
                    ) : (
                            <Image 
                                source={mediaUri ? { uri: mediaUri } : { uri: currentStory.storyImage }} 
                                style={styles.image} 
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                onLoad={handleContentLoad}
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

                        {!showComments && (
                            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
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
                                        style={styles.actionButton}
                                    >
                                        <MaterialCommunityIcons 
                                            name={liked ? "heart" : "heart-outline"} 
                                            size={28} 
                                            color={liked ? "#FF4444" : "#FFF"} 
                                        />
                                        {localLikesCount > 0 && <Text style={styles.actionCount}>{localLikesCount}</Text>}
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        onPress={toggleComments} 
                                        style={styles.actionButton}
                                    >
                                        <MaterialCommunityIcons 
                                            name="message-outline"
                                            size={26} 
                                            color="#FFF" 
                                        />
                                        {localCommentsCount > 0 && <Text style={styles.actionCount}>{localCommentsCount}</Text>}
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        )}
                    </SafeAreaView>
                </View>

                {showComments && (
                     <View style={[styles.commentsSheet, { backgroundColor: colors.card }]}>
                        <View style={[styles.commentsHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.commentsTitle, { color: colors.text }]}>Comments ({localCommentsCount})</Text>
                            <TouchableOpacity onPress={toggleComments} style={styles.closeCommentsBtn}>
                                <MaterialCommunityIcons name="close" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        
                        {loadingComments ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator color="#FFD700" />
                            </View>
                        ) : (
                            <FlatList
                                data={comments}
                                keyExtractor={item => item.$id}
                                renderItem={({ item }) => (
                                    <CommentItem 
                                        comment={item} 
                                        isOwner={false} 
                                    />
                                )}
                                contentContainerStyle={styles.commentsList}
                                ListEmptyComponent={
                                    <Text style={[styles.emptyText, { color: colors.subtext }]}>No comments yet. Be the first!</Text>
                                }
                            />
                        )}

                        <KeyboardAvoidingView 
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                        >
                            <View style={[styles.commentInputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                                <TextInput
                                    placeholder="Add a comment..."
                                    placeholderTextColor={colors.subtext}
                                    style={[styles.commentInput, { backgroundColor: colors.secondary, color: colors.text }]}
                                    value={replyText}
                                    onChangeText={setReplyText}
                                    returnKeyType="send"
                                    onSubmitEditing={handleReply}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={handleReply} style={styles.sendCommentBtn}>
                                    <MaterialCommunityIcons name="arrow-up" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                     </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    storyLayer: {
        flex: 1,
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
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        gap: 2
    },
    actionCount: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
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
    
    commentsSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.65,
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
        zIndex: 20,
    },
    commentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    commentsTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    closeCommentsBtn: {
        padding: 4,
    },
    commentsList: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        textAlign: 'center',
        marginTop: 40,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
        backgroundColor: '#1E1E1E',
        gap: 12
    },
    commentInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 16,
        color: '#FFF',
    },
    sendCommentBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
