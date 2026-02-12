import { Query, ID } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';
import { Post } from '../types';
import { account, databases, storage, APPWRITE_BUCKET_ID, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT } from '../../lib/appwrite'; 
import { globalNetworkState } from '../../context/NetworkContext';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export const PostsService = {
    async getPosts({ 
        lastId, 
        limit = 10, 
        feedType = 'latest', 
        searchQuery = '',
        category = 'All',
        userInterests = []
    }: { 
        lastId?: string; 
        limit?: number; 
        feedType?: 'all' | 'trending' | 'latest'; 
        searchQuery?: string;
        category?: string;
        userInterests?: string[];
    }) {
        const cacheKey = `posts_cache_${category}_${feedType}`;
        
        if (!globalNetworkState.isInternetReachable) {
            console.log(`[PostsService] Offline, returning cached posts for ${cacheKey}.`);
            if (!lastId && !searchQuery) {
                try {
                    const cachedData = await AsyncStorage.getItem(cacheKey);
                    if (cachedData) {
                        return { posts: JSON.parse(cachedData), total: 0 };
                    }
                } catch (cacheError) { console.error('Cache error', cacheError); }
            }
            return { posts: [], total: 0 };
        }

        try {
            const queries = [
                Query.limit(limit),
            ];

            if (searchQuery) {
                queries.push(Query.search('content', searchQuery));
                queries.push(Query.equal('privacy', 'public'));
            } 
            else {
                if (category && category !== 'All') {
                    if (category === 'Meetups') {
                        queries.push(Query.equal('type', 'meetup'));
                        queries.push(Query.equal('privacy', 'public'));
                    } else if (category === 'Discussions') {
                        queries.push(Query.equal('type', 'discussion'));
                        queries.push(Query.equal('privacy', 'public'));
                    } else {
                        queries.push(Query.equal('tag', category.toUpperCase()));
                    }
                } else {
                    queries.push(Query.equal('privacy', 'public'));
                }

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

            if (!lastId && !searchQuery) {
                await AsyncStorage.setItem(cacheKey, JSON.stringify(posts));
            }

            return {
                posts,
                total: response.total
            };
        } catch (error) {
            console.error('Error fetching posts:', error);
            
            if (!lastId && !searchQuery) {
                try {
                    const cachedData = await AsyncStorage.getItem(cacheKey);
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
                title: postData.title,
                content: postData.content,
                tag: postData.tag,
                link: postData.link,
                meetupTime: postData.meetupTime,
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

    async deletePost(postId: string) {
        try {
            return await databases.deleteDocument(
                DATABASE_ID,
                COLLECTIONS.POSTS,
                postId
            );
        } catch (error) {
            console.error('Error deleting post:', error);
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
    },

    async getRecentMeetups(limit = 5) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.POSTS,
                [
                    Query.equal('type', 'meetup'),
                    Query.orderDesc('timestamp'),
                    Query.limit(limit)
                ]
            );
            return response.documents as unknown as Post[];
        } catch (error) {
            console.error('Error fetching meetups:', error);
            return [];
        }
    },

    async getHotDiscussions(limit = 5) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.POSTS,
                [
                    Query.equal('type', 'discussion'),
                    Query.orderDesc('likesCount'), 
                    Query.limit(limit)
                ]
            );
            return response.documents as unknown as Post[];
        } catch (error) {
            console.error('Error fetching discussions:', error);
            return [];
        }
    }
};