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
    },

    async getConversations(currentUserId: string) {
        try {
            // Fetch messages where user is sender or receiver
            // This is not efficient for scaling but works for MVP. 
            // Better approach: Maintain a 'conversations' collection.
            
            const [sent, received] = await Promise.all([
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MESSAGES,
                    [
                        Query.equal('userId', currentUserId),
                        Query.isNotNull('receiverId'),
                        Query.limit(100),
                        Query.orderDesc('createdAt')
                    ]
                ),
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MESSAGES,
                    [
                        Query.equal('receiverId', currentUserId),
                        Query.limit(100),
                        Query.orderDesc('createdAt')
                    ]
                )
            ]);

            const partnerMap = new Map<string, Message>();

            sent.documents.forEach((msg: any) => {
                const partnerId = msg.receiverId;
                if (!partnerMap.has(partnerId)) {
                    partnerMap.set(partnerId, msg);
                }
            });

            received.documents.forEach((msg: any) => {
                const partnerId = msg.userId;
                if (partnerMap.has(partnerId)) {
                    const existing = partnerMap.get(partnerId);
                    if (new Date(msg.createdAt) > new Date(existing!.createdAt)) {
                        partnerMap.set(partnerId, msg);
                    }
                } else {
                    partnerMap.set(partnerId, msg);
                }
            });

            const conversations = await Promise.all(Array.from(partnerMap.entries()).map(async ([partnerId, lastMsg]) => {
                try {
                    // Try to fetch partner details
                    // Assuming we have a way to fetch user by ID, or just using msg details if available
                    // For now, let's try to fetch user doc if we can, otherwise fallback
                    let partnerName = 'User';
                    let partnerAvatar = '';

                    // Optimization: The message might already have user_name/user_avatar
                    // If I am the receiver, the msg.user_name is the partner.
                    // If I am the sender, the msg doesn't have receiver's name stored typically (unless we add it).
                    // So we usually need to fetch the profile.
                    
                    if (lastMsg.userId === partnerId) {
                        partnerName = lastMsg.user_name || 'User';
                        partnerAvatar = lastMsg.user_avatar || '';
                    } else {
                        const userDoc = await databases.getDocument(
                            DATABASE_ID,
                            COLLECTIONS.USERS,
                            partnerId
                        );
                        partnerName = userDoc.username || userDoc.name || 'User';
                        partnerAvatar = userDoc.avatar || '';
                    }

                    return {
                        id: partnerId,
                        user: partnerName,
                        avatar: partnerAvatar || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200",
                        lastMessage: lastMsg.content,
                        time: new Date(lastMsg.createdAt).toLocaleDateString(), // Simple format
                        unread: 0 
                    };
                } catch (e) {
                    return null;
                }
            }));

            return conversations.filter(Boolean);

        } catch (error) {
            console.error("Error fetching conversations", error);
            return [];
        }
    }
};