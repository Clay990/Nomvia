import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform, 
    ActivityIndicator,
    Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useTheme } from '../../context/ThemeContext';
import { PostsService } from '../../app/services/posts';
import { CommentsService } from '../../app/services/comments';
import { Post, Comment } from '../../app/types';
import CommentItem from '../../components/CommentItem';
import { useAuth } from '../../context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { user, userData } = useAuth();
    const insets = useSafeAreaInsets();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (id) fetchPostAndComments();
    }, [id]);

    const fetchPostAndComments = async () => {
        try {
            setLoading(true);
            const [postData, commentsData] = await Promise.all([
                PostsService.getPostById(id as string),
                CommentsService.listComments(id as string)
            ]);
            setPost(postData);
            setComments(commentsData.comments);
        } catch (error) {
            Alert.alert("Error", "Failed to load post.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = async () => {
        if (!commentText.trim()) return;
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSending(true);
        try {
            const newComment = await CommentsService.createComment(id as string, commentText);
            setComments(prev => [...prev, newComment]);
            setCommentText('');
        } catch (error) {
            Alert.alert("Error", "Could not post comment.");
        } finally {
            setSending(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        Alert.alert("Delete Comment", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        await CommentsService.deleteComment(commentId, id as string);
                        setComments(prev => prev.filter(c => c.$id !== commentId));
                    } catch (e) {
                        Alert.alert("Error", "Failed to delete.");
                    }
                } 
            }
        ]);
    };

    const headerComponent = useMemo(() => {
        if (!post) return null;
        return (
            <View style={styles.postContainer}>
                <View style={styles.headerRow}>
                    <Image source={post.user_avatar || 'https://i.pravatar.cc/150'} style={styles.avatar} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.userName, { color: colors.text }]}>{post.user_name}</Text>
                        <Text style={[styles.timestamp, { color: colors.subtext }]}>
                            {new Date(post.timestamp!).toLocaleString()}
                        </Text>
                    </View>
                    <TouchableOpacity>
                        <MaterialCommunityIcons name="dots-horizontal" size={24} color={colors.subtext} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>

                {(post.image || post.mediaUrls?.[0]) && (
                    <Image 
                        source={post.image || post.mediaUrls?.[0]} 
                        style={styles.postImage} 
                        contentFit="cover"
                    />
                )}

                <View style={[styles.statsRow, { borderColor: colors.border }]}>
                    <View style={styles.stat}>
                        <Text style={[styles.statVal, { color: colors.text }]}>{post.likesCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.subtext }]}>Likes</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={[styles.statVal, { color: colors.text }]}>{post.commentsCount || comments.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.subtext }]}>Comments</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={[styles.statVal, { color: colors.text }]}>{post.viewsCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.subtext }]}>Views</Text>
                    </View>
                </View>
            </View>
        );
    }, [post, comments.length, colors]);

    const renderItem = useCallback(({ item }: { item: Comment }) => (
        <CommentItem 
            comment={item} 
            isOwner={item.userId === user?.$id}
            onDelete={handleDeleteComment}
        />
    ), [user?.$id]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!post) return null;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <Stack.Screen 
                options={{
                    headerTitle: "Post",
                    headerTintColor: colors.text,
                    headerStyle: { backgroundColor: colors.background },
                }} 
            />

            <FlatList
                data={comments}
                renderItem={renderItem}
                keyExtractor={item => item.$id}
                ListHeaderComponent={headerComponent}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            <View style={[
                styles.composer, 
                { 
                    backgroundColor: colors.card, 
                    borderTopColor: colors.border,
                    paddingBottom: Math.max(insets.bottom, 12) 
                }
            ]}>
                <Image 
                    source={(userData as any)?.avatar || 'https://i.pravatar.cc/100'} 
                    style={styles.composerAvatar} 
                />
                <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.subtext}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                />
                <TouchableOpacity 
                    onPress={handleSendComment} 
                    disabled={sending || !commentText.trim()}
                    style={[styles.sendBtn, { opacity: !commentText.trim() ? 0.5 : 1 }]}
                >
                    {sending ? <ActivityIndicator color={colors.primary} /> : <Feather name="send" size={20} color={colors.primary} />}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    postContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        fontWeight: '700',
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    postImage: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    stat: {
        alignItems: 'center',
    },
    statVal: {
        fontWeight: '700',
        fontSize: 14,
    },
    statLabel: {
        fontSize: 12,
    },
    composer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        gap: 12,
    },
    composerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    input: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 16,
        borderWidth: 1,
    },
    sendBtn: {
        padding: 8,
    }
});