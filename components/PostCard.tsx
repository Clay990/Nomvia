import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, Share, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, Linking } from 'react-native';
import { Post } from '../app/types';
import { calculateETA } from '../app/utils/location';
import { useTheme } from '../context/ThemeContext';

interface PostCardProps {
    post: Post;
    onLike?: (id: string) => void;
    onComment?: (id: string) => void;
    onOpen?: (id: string) => void;
    onMoreOptions?: () => void;
    distance?: string;
}

const BLUR_HASH = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PostCard({ post, onLike, onComment, onOpen, onMoreOptions, distance }: PostCardProps) {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likesCount || 0);
    const [bookmarked, setBookmarked] = useState(false);
    
    const [pollVote, setPollVote] = useState<number | null>(null);
    const [isGoing, setIsGoing] = useState(false);
    const [attendees, setAttendees] = useState(post.likesCount || 0);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const heartScale = useRef(new Animated.Value(0)).current;

    const lastTap = useRef<number | null>(null);
    const isNavigating = useRef(false);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, []);

    const parsePoll = (text: string) => {
        if (!text) return { cleanContent: '', pollData: null };
        const parts = text.split('///POLL///');
        if (parts.length > 1) {
            try {
                return { cleanContent: parts[0].trim(), pollData: JSON.parse(parts[1]) };
            } catch (e) {
                return { cleanContent: text, pollData: null };
            }
        }
        return { cleanContent: text, pollData: null };
    };

    const { cleanContent, pollData } = parsePoll(post.content);

    let displayTitle = post.title;
    let displayType = post.tag || 'POST';
    let displayBody = cleanContent;
    let displayTime = post.meetupTime;

    if (!displayTitle) {
        const firstLine = cleanContent.split('\n')[0];
        if (firstLine.startsWith('[EVENT:')) {
            const parts = firstLine.replace('[EVENT:', '').replace(']', '').split('@');
            displayTitle = parts[0]?.trim();
            if (parts[1]) {
                const timeLoc = parts[1].split(' in ');
                displayTime = timeLoc[0]?.trim();
            }
            displayType = 'MEETUP';
            displayBody = cleanContent.substring(firstLine.length).trim();
        } else if (firstLine.startsWith('[QUESTION:')) {
            displayTitle = firstLine.replace('[QUESTION:', '').replace(']', '').trim();
            displayType = 'Q&A';
            displayBody = cleanContent.substring(firstLine.length).trim();
        } else if (firstLine.startsWith('[RESOURCE:')) {
            displayTitle = firstLine.replace('[RESOURCE:', '').replace(']', '').trim();
            displayType = 'RESOURCE';
            displayBody = cleanContent.substring(firstLine.length).trim();
        } else if (firstLine.startsWith('[TOPIC:')) {
            const parts = firstLine.replace('[TOPIC:', '').replace(']', '').split(' in ');
            displayTitle = parts[0]?.trim();
            if (parts[1]) displayType = parts[1].trim().toUpperCase();
            displayBody = cleanContent.substring(firstLine.length).trim();
        }
    }

    const renderStyledText = (text: string) => {
        const words = text.split(/(\s+)/); 
        return (
            <Text style={[styles.description, { color: colors.text }]}>
                {words.map((word, index) => {
                    if (word.startsWith('@')) {
                        return <Text key={index} style={{ color: colors.primary, fontWeight: '700' }}>{word}</Text>;
                    } else if (word.startsWith('#')) {
                        return <Text key={index} style={{ color: colors.primary, fontWeight: '700' }}>{word}</Text>;
                    }
                    return <Text key={index}>{word}</Text>;
                })}
            </Text>
        );
    };

    const handleLinkPress = async () => {
        if (post.link) {
            Haptics.selectionAsync();
            try {
                await Linking.openURL(post.link);
            } catch (e) {
                Alert.alert("Error", "Could not open link.");
            }
        }
    };

    const handleRSVP = () => {
        Haptics.selectionAsync();
        if (isGoing) {
            setAttendees(prev => prev - 1);
            setIsGoing(false);
        } else {
            setAttendees(prev => prev + 1);
            setIsGoing(true);
            Alert.alert("You're in!", "See you at the meetup.");
        }
    };

    const progressPercent = (post.isLive && post.totalKm && post.completedKm)
        ? (post.completedKm / post.totalKm) * 100
        : 0;
    
    let etaString = '';
    if (post.isLive && post.totalKm && post.completedKm) {
        const remaining = post.totalKm - post.completedKm;
        if (remaining > 0) {
            etaString = calculateETA(remaining);
        }
    }

    const triggerLikeAnimation = () => {
        setLiked(true);
        setLikeCount(prev => prev + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Animated.sequence([
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, friction: 5 }),
            Animated.delay(500),
            Animated.timing(heartScale, { toValue: 0, duration: 200, useNativeDriver: true })
        ]).start();

        if (onLike) onLike(post.$id);
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;
        if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
            if (!liked) triggerLikeAnimation();
        } else {
            lastTap.current = now;
        }
    };

    const handleOpen = () => {
        if (isNavigating.current) return;
        isNavigating.current = true;
        onOpen?.(post.$id);
        setTimeout(() => {
            isNavigating.current = false;
        }, 1000);
    };

    const handleLikePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (liked) {
            setLiked(false);
            setLikeCount(prev => prev - 1);
        } else {
            triggerLikeAnimation();
        }
    };

    const handleBookmark = () => {
        Haptics.selectionAsync();
        setBookmarked(!bookmarked);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${post.user_name || 'this nomad'}'s journey on Nomvia: ${post.content}`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleMoreOptions = () => {
        Haptics.selectionAsync();
        if (onMoreOptions) {
            onMoreOptions();
        } else {
            Alert.alert("Post Options", undefined, [
                { text: 'Report Content', style: 'destructive', onPress: () => {} },
                { text: 'Cancel', style: 'cancel' }
            ]);
        }
    };

    const goToProfile = () => {
        Haptics.selectionAsync();
        router.push({ pathname: '/user/[id]', params: { id: post.userId } });
    };

    return (
        <AnimatedPressable 
            onPress={handleOpen}
            style={[
                styles.card, 
                { 
                    backgroundColor: colors.card, 
                    borderColor: isDark ? '#333' : '#F3F4F6',
                    opacity: fadeAnim,
                }
            ]}
            accessible={true}
            accessibilityLabel={`Post by ${post.user_name || 'Anonymous'}`}
        >
            {(post.image || post.mediaUrls?.[0]) && (
                <TouchableWithoutFeedback onPress={handleDoubleTap}>
                    <View style={styles.mediaContainer}>
                        <Image 
                            source={post.image || post.mediaUrls?.[0]} 
                            style={styles.cardImage}
                            placeholder={BLUR_HASH}
                            contentFit="cover"
                            transition={500}
                            accessibilityLabel="Post image"
                        />
                        {post.tag && (
                            <View style={styles.tagBadge}>
                                <Text style={styles.tagText}>{post.tag}</Text>
                            </View>
                        )}
                        <Animated.View style={[styles.heartOverlay, { transform: [{ scale: heartScale }] }]}>
                            <MaterialCommunityIcons name="heart" size={80} color="#FFF" />
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            )}

            <View style={styles.cardContent}>
                <View style={styles.userRow}>
                    <TouchableOpacity onPress={goToProfile}>
                        <Image 
                            source={post.user_avatar || 'https://i.pravatar.cc/150'} 
                            style={styles.avatar} 
                            contentFit="cover"
                            accessibilityLabel={`${post.user_name}'s avatar`}
                        />
                    </TouchableOpacity>
                    
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={goToProfile} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.userName, { color: colors.text }]}>{post.user_name || 'Anonymous'}</Text>
                            <MaterialCommunityIcons name="check-decagram" size={14} color={colors.primary} />
                            <View style={{ backgroundColor: isDark ? '#333' : '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.subtext }}>
                                    Lvl {Math.max(1, (post.user_name?.length || 0) % 10)}
                                </Text>
                            </View>
                            {!post.image && displayType && (
                                <View style={{ backgroundColor: isDark ? '#333' : '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text }}>{displayType}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                             <Text style={[styles.timestamp, { color: colors.subtext }]}>
                                {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Just now'}
                            </Text>
                            
                            {distance && (
                                <>
                                    <View style={styles.dotSeparator} />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <MaterialCommunityIcons name="map-marker-radius" size={10} color={colors.subtext} />
                                        <Text style={{ fontSize: 11, color: colors.subtext }}>{distance}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                    
                    <TouchableOpacity onPress={handleMoreOptions} style={{ padding: 4 }}>
                        <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.subtext} />
                    </TouchableOpacity>
                </View>

                {(post.from || post.to) && (
                    <View style={styles.routeSection} accessible={true} accessibilityLabel={`Route from ${post.from} to ${post.to}`}>
                        <View style={styles.routeHeader}>
                            <Text style={[styles.locationText, { color: colors.text }]}>{post.from}</Text>
                            {!post.isLive ?
                                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.subtext} /> : null}
                            {post.to && <Text style={[styles.locationText, { color: colors.text }]}>{post.to}</Text>}
                        </View>
                        
                        {post.isLive && (
                            <View style={[styles.progressBarContainer, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]}>
                                <View style={[styles.fill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
                                <View style={[styles.vanIconMarker, { left: `${progressPercent}%` }]}>
                                    <View style={[styles.vanCircle, { backgroundColor: colors.primary, borderColor: colors.card, shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 4 }]}>
                                        <MaterialCommunityIcons name="van-utility" size={10} color="#FFF" />
                                    </View>
                                </View>
                            </View>
                        )}
                        {post.isLive && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                                <Text style={{ fontSize: 10, color: colors.subtext }}>
                                    {Math.round(progressPercent)}% completed
                                </Text>
                                {etaString ? (
                                    <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>
                                        ETA: {etaString}
                                    </Text>
                                ) : null}
                            </View>
                        )}
                    </View>
                )}

                {displayTitle && (
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
                        {displayTitle}
                    </Text>
                )}
                {displayTime && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <MaterialCommunityIcons name="calendar-clock" size={16} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{displayTime}</Text>
                    </View>
                )}

                {renderStyledText(displayBody)}

                {post.link && (
                    <TouchableOpacity 
                        onPress={handleLinkPress}
                        style={{ 
                            marginTop: 12, 
                            padding: 12, 
                            backgroundColor: isDark ? '#333' : '#F3F4F6', 
                            borderRadius: 12, 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            gap: 8 
                        }}
                    >
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="link-variant" size={18} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '600', color: colors.text, fontSize: 13 }}>Visit Resource</Text>
                            <Text style={{ color: colors.subtext, fontSize: 11 }} numberOfLines={1}>{post.link}</Text>
                        </View>
                        <MaterialCommunityIcons name="open-in-new" size={16} color={colors.subtext} />
                    </TouchableOpacity>
                )}

                {pollData && pollData.options && (
                    <View style={{ marginTop: 12, gap: 8 }}>
                        {pollData.options.map((opt: any, idx: number) => {
                            const isSelected = pollVote === idx;
                            const votePercent = Math.floor(Math.random() * 100); 
                            return (
                                <TouchableOpacity 
                                    key={idx} 
                                    onPress={() => { Haptics.selectionAsync(); setPollVote(idx); }}
                                    style={{ 
                                        padding: 12, 
                                        borderRadius: 12, 
                                        borderWidth: 1, 
                                        borderColor: isSelected ? colors.primary : colors.border,
                                        backgroundColor: isSelected ? 'rgba(0,0,0,0.02)' : 'transparent',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {pollVote !== null && (
                                         <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${votePercent}%`, backgroundColor: isSelected ? 'rgba(26, 46, 5, 0.1)' : 'rgba(0,0,0,0.03)' }} />
                                    )}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ color: colors.text, fontWeight: isSelected ? '700' : '400' }}>{opt.text}</Text>
                                        {pollVote !== null && <Text style={{ color: colors.subtext, fontSize: 12 }}>{votePercent}%</Text>}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        <Text style={{ fontSize: 11, color: colors.subtext, textAlign: 'right', marginTop: 4 }}>
                            {pollVote !== null ? '124 votes • Ends in 2 days' : 'Select an option to vote'}
                        </Text>
                    </View>
                )}

                {post.type === 'meetup' && (
                    <View style={{ marginTop: 12, padding: 12, backgroundColor: isDark ? '#333' : '#F3F4F6', borderRadius: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <View>
                                <Text style={{ fontWeight: '700', color: colors.text, fontSize: 14 }}>📅 Event RSVP</Text>
                                <Text style={{ color: colors.subtext, fontSize: 12 }}>{attendees} nomads attending</Text>
                            </View>
                            <View style={{ flexDirection: 'row', paddingLeft: 8 }}>
                                {[1,2,3].map(i => (
                                    <View key={i} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border, borderWidth: 2, borderColor: colors.card, marginLeft: -8 }} />
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity 
                            onPress={handleRSVP}
                            style={{ 
                                backgroundColor: isGoing ? colors.text : colors.card, 
                                paddingVertical: 10, 
                                borderRadius: 8, 
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: colors.text
                            }}
                        >
                            <Text style={{ color: isGoing ? colors.background : colors.text, fontWeight: '700' }}>
                                {isGoing ? "✓ You're Going" : "I'm Going"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.actionRow, { borderTopColor: isDark ? '#333' : '#F3F4F6' }]}>
                    <TouchableOpacity 
                        style={styles.actionBtn} 
                        onPress={handleLikePress}
                        accessibilityLabel={`Like post. Currently ${likeCount} likes.`}
                        accessibilityRole="button"
                    >
                        <MaterialCommunityIcons 
                            name={liked ? "heart" : "heart-outline"} 
                            size={22} 
                            color={liked ? colors.danger : colors.subtext} 
                        />
                        <Text style={[styles.actionText, { color: colors.subtext }]}>{likeCount > 0 ? likeCount : ''}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionBtn} 
                        onPress={() => onOpen?.(post.$id)}
                        accessibilityLabel={`Comment on post. Currently ${post.commentsCount || 0} comments.`}
                        accessibilityRole="button"
                    >
                        <MaterialCommunityIcons name="comment-outline" size={20} color={colors.subtext} />
                        <Text style={[styles.actionText, { color: colors.subtext }]}>{(post.commentsCount || 0) > 0 ? post.commentsCount : ''}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionBtn} 
                        onPress={handleShare}
                        accessibilityLabel="Share post"
                        accessibilityRole="button"
                    >
                        <MaterialCommunityIcons name="share-variant-outline" size={20} color={colors.subtext} />
                    </TouchableOpacity>
                    
                     <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 16 }}>
                        <TouchableOpacity 
                            onPress={handleBookmark}
                            accessibilityLabel={bookmarked ? "Remove bookmark" : "Bookmark post"}
                            accessibilityRole="button"
                        >
                            <MaterialCommunityIcons 
                                name={bookmarked ? "bookmark" : "bookmark-outline"} 
                                size={20} 
                                color={bookmarked ? colors.primary : colors.subtext} 
                            />
                        </TouchableOpacity>
                     </View>
                </View>

            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  mediaContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heartOverlay: {
      position: 'absolute',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
  },
  cardContent: {
    padding: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEE'
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 11,
  },
  dotSeparator: {
      width: 3, 
      height: 3, 
      borderRadius: 1.5, 
      backgroundColor: '#9CA3AF'
  },
  routeSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'visible',
    justifyContent: 'center',
    marginTop: 8,
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  vanIconMarker: {
    position: 'absolute',
    marginLeft: -10,
  },
  vanCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: '400',
  },
  actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingTop: 16,
      borderTopWidth: 1,
  },
  actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      padding: 4,
  },
  actionText: {
      fontSize: 13,
      fontWeight: '600',
  }
});