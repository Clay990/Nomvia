import { Query, ID } from 'react-native-appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';
import { Comment } from '../types';
import { account, databases } from '../../lib/appwrite';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export const CommentsService = {
    async listComments(postId: string, limit = 20, cursor?: string) {
        try {
            const queries = [
                Query.equal('postId', postId),
                Query.orderAsc('timestamp'), 
                Query.limit(limit)
            ];

            if (cursor) {
                queries.push(Query.cursorAfter(cursor));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMENTS,
                queries
            );

            return {
                comments: response.documents as unknown as Comment[],
                total: response.total
            };
        } catch (error) {
            console.error('Error listing comments:', error);
            throw error;
        }
    },

    async createComment(postId: string, content: string) {
        try {
            const user = await account.get();
            let userName = user.name;
            let userAvatar = '';
            
            try {
                const userDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, user.$id);
                userName = userDoc.username || user.name;
                userAvatar = userDoc.avatar;
            } catch (e) {
            }

            const payload = {
                postId,
                userId: user.$id,
                content,
                timestamp: new Date().toISOString(),
                likesCount: 0,
                user_name: userName,
                user_avatar: userAvatar
            };

            const comment = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.COMMENTS,
                ID.unique(),
                payload
            );
            try {
                const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.POSTS, postId);
                const currentCount = post.commentsCount || 0;
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.POSTS, postId, {
                    commentsCount: currentCount + 1
                });
            } catch (e) {
                console.error("Failed to increment comment count", e);
            }

            return comment as unknown as Comment;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    },

    async deleteComment(commentId: string, postId: string) {
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COMMENTS, commentId);
            
            try {
                const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.POSTS, postId);
                const currentCount = post.commentsCount || 0;
                if (currentCount > 0) {
                    await databases.updateDocument(DATABASE_ID, COLLECTIONS.POSTS, postId, {
                        commentsCount: currentCount - 1
                    });
                }
            } catch (e) {
                console.error("Failed to decrement comment count", e);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    async likeComment(commentId: string, currentLikes: number) {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.COMMENTS,
                commentId,
                {
                    likesCount: currentLikes + 1
                }
            );
        } catch (error) {
            console.error('Error liking comment:', error);
            throw error;
        }
    }
};
