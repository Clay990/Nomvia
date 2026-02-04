import { Query, ID } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';
import { Post } from '../types';
import { account, databases, storage, APPWRITE_BUCKET_ID, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT } from '../../lib/appwrite'; 

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

const CACHE_KEY = 'posts_cache';

export const PostsService = {
    async getPosts({ 
        lastId, 
        limit = 10, 
        feedType = 'latest', 
        searchQuery = '',
        userInterests = []
    }: { 
        lastId?: string; 
        limit?: number; 
        feedType?: 'all' | 'trending' | 'latest'; 
        searchQuery?: string;
        userInterests?: string[];
    }) {
        try {
            const queries = [
                Query.limit(limit),
            ];

            if (searchQuery) {
                queries.push(Query.search('content', searchQuery));
            } 
            else {
                switch (feedType) {
                    case 'trending':
                        queries.push(Query.orderDesc('likesCount'));
                        break;
                    
                    case 'all':
                        queries.push(Query.orderDesc('timestamp'));
                        break;

                    case 'latest':
                    default:
                        queries.push(Query.orderDesc('timestamp'));
                        break;
                }
            }

            
            if (lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.POSTS,
                queries
            );

            const posts = response.documents as unknown as Post[];

            if (!lastId && feedType === 'latest' && !searchQuery) {
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(posts));
            }

            return {
                posts,
                total: response.total
            };
        } catch (error) {
            console.error('Error fetching posts:', error);
            
            if (!lastId && feedType === 'latest') {
                try {
                    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
                    if (cachedData) {
                        return { posts: JSON.parse(cachedData), total: 0 };
                    }
                } catch (cacheError) {
                    console.error('Cache error', cacheError);
                }
            }
            
            throw error;
        }
    },

    async getPostById(postId: string) {
        try {
            const post = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.POSTS,
                postId
            );
            return post as unknown as Post;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    },

    async createPost(postData: Partial<Post>) {
        try {
            const authUser = await account.get();
            
            let userName = authUser.name;
            let userAvatar = '';

            try {
                const userDoc = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    authUser.$id
                );
                
                if (userDoc) {
                    userName = userDoc.username || userDoc.name || authUser.name;
                    userAvatar = userDoc.avatar || ''; 
                }
            } catch (docError) {
                console.log("Could not fetch user profile doc, falling back to auth info", docError);
            }

            if (!userAvatar) {
                 userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
            }

            let uploadedImageUrl = null;
            if (postData.image) {
                try {
                    const file = {
                        name: `post_${ID.unique()}.jpg`,
                        type: 'image/jpeg',
                        uri: postData.image,
                        size: 1000 
                    };

                    const uploadedFile = await storage.createFile(
                        APPWRITE_BUCKET_ID,
                        ID.unique(),
                        file as any
                    );

                    uploadedImageUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${APPWRITE_PROJECT_ID}`;

                } catch (uploadError) {
                    console.error("Failed to upload image:", uploadError);
                }
            }

            const payload = {
                userId: authUser.$id,
                type: postData.type || 'none',
                content: postData.content,
                tag: postData.tag,
                from: postData.from,
                to: postData.to,
                isLive: postData.isLive || false,
                totalKm: postData.totalKm || 0,
                completedKm: postData.completedKm || 0,
                timestamp: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                privacy: postData.privacy || 'public',
                image: uploadedImageUrl,
                mediaUrls: uploadedImageUrl ? [uploadedImageUrl] : [], 
                likesCount: 0,
                commentsCount: 0,
                viewsCount: 0,
                isActive: true,
                user_name: userName, 
                user_avatar: userAvatar
            };

            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.POSTS,
                ID.unique(),
                payload
            );
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    async likePost(postId: string, currentLikes: number) {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.POSTS,
                postId,
                {
                    likesCount: currentLikes + 1
                }
            );
        } catch (error) {
            console.error('Error liking post:', error);
            throw error;
        }
    }
};