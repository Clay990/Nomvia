import { ID, Query, Permission, Role } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { databases, client, account } from '../../lib/appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';
import { Message } from '../types';
import { globalNetworkState } from '../../context/NetworkContext';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export const ChatService = {
    async getCircleMessages(circleId: string, limit = 50) {
        const cacheKey = `messages_${circleId}`;
        
        if (!globalNetworkState.isInternetReachable) {
            try {
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) return JSON.parse(cached);
            } catch (e) { console.error(e); }
            return [];
        }

        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.MESSAGES,
                [
                    Query.equal('circleId', circleId),
                    Query.orderDesc('createdAt'),
                    Query.limit(limit)
                ]
            );
            const msgs = response.documents as unknown as Message[];
            AsyncStorage.setItem(cacheKey, JSON.stringify(msgs)).catch(e => console.error(e));
            return msgs;
        } catch (error) {
            console.error("Error fetching messages", error);
            try {
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) return JSON.parse(cached);
            } catch (e) {}
            return [];
        }
    },

    async getDirectMessages(currentUserId: string, partnerId: string) {

        
        try {
            const [sentByMe, sentByThem] = await Promise.all([
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MESSAGES,
                    [
                        Query.equal('userId', currentUserId),
                        Query.equal('receiverId', partnerId),
                        Query.limit(50)
                    ]
                ),
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MESSAGES,
                    [
                        Query.equal('userId', partnerId),
                        Query.equal('receiverId', currentUserId),
                        Query.limit(50)
                    ]
                )
            ]);

            const allMessages = [...sentByMe.documents, ...sentByThem.documents] as unknown as Message[];
            allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            
            return allMessages;
        } catch (error) {
            console.error("Error fetching direct messages", error);
            return [];
        }
    },

    async sendMessage({ circleId, receiverId, content, type = 'text' }: { circleId?: string, receiverId?: string, content: string, type?: 'text' | 'image' }) {
        if (!globalNetworkState.isInternetReachable) {
            throw new Error("Offline. Message not sent.");
        }
        try {
            const user = await account.get();
            
            let userName = user.name;
            let userAvatar = '';
            
             try {
                const userDoc = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    user.$id
                );
                if (userDoc) {
                    userName = userDoc.username || userDoc.name || user.name;
                    userAvatar = userDoc.avatar || '';
                }
            } catch (e) {}

            const data: any = {
                userId: user.$id,
                content,
                type,
                user_name: userName,
                user_avatar: userAvatar,
                createdAt: new Date().toISOString()
            };

            let permissions: string[] = [];

            if (circleId) {
                data.circleId = circleId;
                // Circle messages usually readable by anyone or circle members. 
                // For now assuming public circles or handle permissions elsewhere?
                // If private circle, we should probably set permissions. 
                // But for DMs (below), permissions are critical.
            }

            if (receiverId) {
                data.receiverId = receiverId;
                // Important: Set Read permissions for both Sender and Receiver
                // MVP Workaround: Client cannot grant 'user:other' permission. 
                // We use Role.users() so the receiver can read it. 
                // In production, use an Appwrite Function to set tight permissions.
                permissions = [
                    Permission.read(Role.users())
                ];
            }

            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.MESSAGES,
                ID.unique(),
                data,
                permissions.length > 0 ? permissions : undefined
            );
        } catch (error) {
            console.error("Error sending message", error);
            throw error;
        }
    },

    subscribeToCircle(circleId: string, callback: (message: Message) => void) {
        if (!globalNetworkState.isConnected) return () => {};

        const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`;
        
        try {
            return client.subscribe(channel, (response) => {
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    const payload = response.payload as Message;
                    if (payload.circleId === circleId) {
                        callback(payload);
                    }
                }
            });
        } catch (e) {
            console.log("Subscription failed", e);
            return () => {};
        }
    },

    subscribeToDirectMessages(currentUserId: string, partnerId: string, callback: (message: Message) => void) {
        if (!globalNetworkState.isConnected) return () => {};

        const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`;

        try {
            return client.subscribe(channel, (response) => {
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    const payload = response.payload as Message;
                    const isRelevant = 
                        (payload.userId === partnerId && payload.receiverId === currentUserId) ||
                        (payload.userId === currentUserId && payload.receiverId === partnerId);
                    
                    if (isRelevant) {
                        callback(payload);
                    }
                }
            });
        } catch (e) {
             console.log("DM Subscription failed", e);
             return () => {};
        }
    }
};