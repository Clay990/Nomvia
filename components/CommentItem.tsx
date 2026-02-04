import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from '../context/ThemeContext';
import { Comment } from '../app/types';
import * as Haptics from 'expo-haptics';

interface CommentItemProps {
    comment: Comment;
    onLike?: (id: string) => void;
    onDelete?: (id: string) => void;
    isOwner?: boolean;
}

export default function CommentItem({ comment, onLike, onDelete, isOwner }: CommentItemProps) {
    const { colors } = useTheme();

    const handleLike = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onLike?.(comment.$id);
    };

    const handleDelete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onDelete?.(comment.$id);
    };

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d`;
    };

    return (
        <View style={styles.container}>
            <Image 
                source={comment.user_avatar || 'https://i.pravatar.cc/100'} 
                style={styles.avatar} 
                contentFit="cover"
            />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.username, { color: colors.text }]}>{comment.user_name || 'User'}</Text>
                    <Text style={[styles.time, { color: colors.subtext }]}>{timeAgo(comment.timestamp)}</Text>
                </View>
                <Text style={[styles.text, { color: colors.text }]}>{comment.content}</Text>
                
                {/* Actions Row */}
                <View style={styles.actions}>
                    <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
                        <Text style={[styles.actionText, { color: colors.subtext }]}>Like</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={[styles.actionText, { color: colors.subtext }]}>Reply</Text>
                    </TouchableOpacity>
                    {isOwner && (
                        <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
                            <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            <TouchableOpacity onPress={handleLike} style={styles.likeBtn}>
                <MaterialCommunityIcons name="heart-outline" size={14} color={colors.subtext} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
        backgroundColor: '#EEE',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 4,
    },
    username: {
        fontSize: 13,
        fontWeight: '700',
    },
    time: {
        fontSize: 11,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionBtn: {
        paddingVertical: 2,
    },
    actionText: {
        fontSize: 11,
        fontWeight: '600',
    },
    likeBtn: {
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
