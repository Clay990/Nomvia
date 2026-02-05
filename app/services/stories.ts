import { ID, Query, ImageFormat } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage, account, databases, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '../../lib/appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';
import { globalNetworkState } from '../../context/NetworkContext';

const BUCKET_ID = 'stories';
const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;
const STORY_COLLECTION_ID = COLLECTIONS.STORIES;
const CACHE_KEY = 'stories_cache';

export const StoriesService = {
    async getStories({ lastId, limit = 10 }: { lastId?: string; limit?: number } = {}) {
        console.log('[StoriesService] getStories called', { lastId, limit });
        
        if (!globalNetworkState.isInternetReachable) {
            console.log('[StoriesService] Offline, returning cached stories.');
            try {
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    return { stories: JSON.parse(cached), total: 0, lastId: undefined };
                }
            } catch (e) {}
            return { stories: [], total: 0, lastId: undefined };
        }

        try {
            const now = new Date().toISOString();
            const queries = [
                Query.orderDesc('createdAt'),
                Query.greaterThan('expiresAt', now), 
                Query.limit(limit)
            ];

            if (lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            console.log('[StoriesService] Querying database:', { databaseId: DATABASE_ID, collectionId: STORY_COLLECTION_ID, queries: queries.map(q => q.toString()) });

            const response = await databases.listDocuments(
                DATABASE_ID,
                STORY_COLLECTION_ID,
                queries
            );
            
            console.log('[StoriesService] Database response:', { total: response.total, documentsCount: response.documents.length });

            const stories = response.documents.map((doc: any) => {
                let imageUrl = '';
                if (doc.fileId) {
                    try {
                        imageUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${doc.fileId}/view?project=${APPWRITE_PROJECT_ID}`;
                        
                        /* 
                        // Previous logic preserved for reference but overridden by manual construction
                        const result = storage.getFileView(BUCKET_ID, doc.fileId);
                        if (typeof result === 'string') {
                            imageUrl = result;
                        } 
                        */
                    } catch (e) {
                        console.warn('[StoriesService] Error constructing image URL:', e);
                    }
                }

                console.log('[StoriesService] Processed story:', { id: doc.$id, fileId: doc.fileId, imageUrl });

                return {
                    id: doc.$id as string,
                    userId: doc.userId as string,
                    name: doc.user_name || 'Nomad',
                    avatar: doc.user_avatar || 'https://i.pravatar.cc/150',
                    storyImage: imageUrl,
                    distance: 'Nearby',
                    type: doc.type || 'image',
                    duration: doc.duration || 5000,
                    views: doc.views || 0
                };
            });

            console.log('[StoriesService] Returning stories:', { count: stories.length, lastId: stories.length > 0 ? stories[stories.length - 1].id : undefined });

            if (!lastId) {
                AsyncStorage.setItem(CACHE_KEY, JSON.stringify(stories)).catch(e => console.log('Failed to cache stories', e));
            }

            return {
                stories,
                total: response.total,
                lastId: stories.length > 0 ? stories[stories.length - 1].id : undefined
            };
        } catch (error: any) {
            console.error('Error fetching stories:', error);
            if (!lastId) {
                try {
                    const cached = await AsyncStorage.getItem(CACHE_KEY);
                    if (cached) {
                        return { stories: JSON.parse(cached), total: 0, lastId: undefined };
                    }
                } catch (e) { console.log('Cache retrieval failed', e); }
            }
            if (error.code === 404) {
                 console.warn("Stories collection might not exist yet or permissions issue.");
            }
            return { stories: [], total: 0, lastId: undefined };
        }
    },

    async uploadStory(uri: string, mimeType: string = 'image/jpeg', duration: number = 5000) {
        try {
            const user = await account.get();
            let userName = user.name || 'Anonymous';
            
            let userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
            try {
                 const userDoc = await databases.getDocument(DATABASE_ID, 'users', user.$id);
                 if (userDoc?.avatar) userAvatar = userDoc.avatar;
                 if (userDoc?.username) userName = userDoc.username;
            } catch(_) {}

            const filePayload = {
                name: `story_${Date.now()}.${mimeType.split('/')[1]}`,
                type: mimeType,
                uri: uri,
                size: 1 
            };

            console.log("Uploading file to bucket:", BUCKET_ID);
            const file = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                filePayload
            );
            console.log("File uploaded, ID:", file.$id);

            const now = new Date();
            const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);


            const doc = await databases.createDocument(
                DATABASE_ID,
                STORY_COLLECTION_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    fileId: file.$id, 
                    user_name: userName,
                    user_avatar: userAvatar,
                    createdAt: now.toISOString(),
                    expiresAt: expiresAt.toISOString(),
                    type: mimeType.startsWith('video') ? 'video' : 'image',
                    duration: duration,
                    views: 0
                }
            );
            console.log("Story document created:", doc.$id);
            return doc;

        } catch (error) {
            console.error('Error uploading story:', error);
            throw error;
        }
    },

    async viewStory(storyId: string) {
        try {
            const doc = await databases.getDocument(DATABASE_ID, STORY_COLLECTION_ID, storyId);
            await databases.updateDocument(DATABASE_ID, STORY_COLLECTION_ID, storyId, {
                views: (doc.views || 0) + 1
            });
        } catch (error) {
            console.log('Error updating view count:', error);
        }
    }
};
