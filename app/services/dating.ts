import { Query, ID, Permission, Role } from 'react-native-appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';
import { databases } from '../../lib/appwrite';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export interface DatingProfile {
    $id: string;
    name: string;
    age: number;
    verified: boolean;
    location: string;
    status: string;
    bio: string;
    image: string;
    vanImage: string;
    tags: string[];
    isMoving: boolean;
    pace?: string;
    style?: string;
}

export const DatingService = {
    async getPotentialMatches(currentUserId: string): Promise<DatingProfile[]> {
        try {
            const swipedDocs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.SWIPES,
                [
                    Query.equal('initiatorId', currentUserId),
                    Query.limit(100) 
                ]
            );
            const swipedIds = new Set(swipedDocs.documents.map(doc => doc.targetId));

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.USERS,
                [
                    Query.limit(50),
                    Query.orderDesc('$createdAt') 
                ]
            );

            const matches = response.documents
                .filter(doc => doc.$id !== currentUserId && !swipedIds.has(doc.$id))
                .map(doc => {
                    return {
                        $id: doc.$id,
                        name: doc.username || doc.name || "Nomad",
                        age: doc.age || 25, 
                        verified: doc.verified || false,
                        location: doc.location || "Unknown Location",
                        status: doc.status || "Exploring",
                        bio: doc.bio || "No bio yet.",
                        image: doc.avatar || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop",
                        vanImage: doc.rigImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
                        tags: doc.interests || [],
                        isMoving: doc.isMoving || false,
                        pace: doc.pace,
                        style: doc.style
                    };
                });
            
            return matches;
        } catch (error) {
            console.error('Error fetching matches:', error);
            return [];
        }
    },

    async recordSwipe(initiatorId: string, targetId: string, type: 'like' | 'pass') {
        try {
            const existingSwipes = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.SWIPES,
                [
                    Query.equal('initiatorId', initiatorId),
                    Query.equal('targetId', targetId)
                ]
            );

            if (existingSwipes.total > 0) {
                console.log("Swipe already exists");
                if (existingSwipes.documents[0].type === 'like' && type === 'like') {
                     const existingMatch = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.MATCHES,
                        [
                             Query.equal('userA', [initiatorId, targetId]),
                             Query.equal('userB', [initiatorId, targetId])
                        ]
                     );
                     const match = existingMatch.documents.find(d => 
                        (d.userA === initiatorId && d.userB === targetId) || 
                        (d.userA === targetId && d.userB === initiatorId)
                     );
                     
                     if (match) {
                         return { match: true, matchId: match.$id };
                     }
                }
                return { match: false };
            }

            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.SWIPES,
                ID.unique(),
                {
                    initiatorId,
                    targetId,
                    type,
                    timestamp: new Date().toISOString()
                }
            );

            if (type === 'pass') {
                return { match: false };
            }

            const reverseSwipe = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.SWIPES,
                [
                    Query.equal('initiatorId', targetId),
                    Query.equal('targetId', initiatorId),
                    Query.equal('type', 'like')
                ]
            );

            if (reverseSwipe.total > 0) {
                const existingMatch = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MATCHES,
                    [
                        Query.equal('userA', [initiatorId, targetId]),
                        Query.equal('userB', [initiatorId, targetId])
                    ]
                );

                const matchExists = existingMatch.documents.some(d => 
                    (d.userA === initiatorId && d.userB === targetId) || 
                    (d.userA === targetId && d.userB === initiatorId)
                );

                if (matchExists) {
                     return { match: true, matchId: existingMatch.documents[0].$id };
                }

                const matchDoc = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.MATCHES,
                    ID.unique(),
                    {
                        userA: initiatorId,
                        userB: targetId,
                        timestamp: new Date().toISOString()
                    },
                    [
                        Permission.read(Role.users())
                    ]
                );
                return { match: true, matchId: matchDoc.$id };
            }

            return { match: false };

        } catch (error) {
            console.error('Error recording swipe:', error);
            return { match: false };
        }
    },

    async getMatches(userId: string) {
        try {
            const matchesA = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.MATCHES,
                [Query.equal('userA', userId)]
            );
            const matchesB = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.MATCHES,
                [Query.equal('userB', userId)]
            );

            const allMatches = [...matchesA.documents, ...matchesB.documents];
            return allMatches;
        } catch (error) {
             console.error('Error getting matches', error);
             return [];
        }
    },

    async getUserProfile(userId: string): Promise<DatingProfile> {
        try {
            const doc = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                userId
            );

            return {
                $id: doc.$id,
                name: doc.username || doc.name || "Nomad",
                age: doc.age || 25,
                verified: doc.verified || false,
                location: doc.location || "Unknown Location",
                status: doc.status || "Exploring",
                bio: doc.bio || "No bio yet.",
                image: doc.avatar || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop",
                vanImage: doc.rigImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
                tags: doc.interests || [],
                isMoving: doc.isMoving || false,
                pace: doc.pace,
                style: doc.style
            };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }
};
