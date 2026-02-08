import { ID, Query } from 'react-native-appwrite';
import { databases, account, storage, APPWRITE_BUCKET_ID, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT } from '../../lib/appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export const CirclesService = {
    async createCircle(data: { name: string; description: string; isPrivate: boolean; image?: string }) {
        try {
            const user = await account.get();
            const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            let uploadedImageUrl = null;
            if (data.image) {
                try {
                    const file = {
                        name: `circle_${ID.unique()}.jpg`,
                        type: 'image/jpeg',
                        uri: data.image,
                        size: 1000 
                    };

                    const uploadedFile = await storage.createFile(
                        APPWRITE_BUCKET_ID,
                        ID.unique(),
                        file as any
                    );

                    uploadedImageUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${APPWRITE_PROJECT_ID}`;
                } catch (uploadError) {
                    console.error("Failed to upload circle image:", uploadError);
                }
            }

            const circle = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.CIRCLES,
                ID.unique(),
                {
                    name: data.name,
                    description: data.description,
                    isPrivate: data.isPrivate,
                    image: uploadedImageUrl,
                    inviteCode: inviteCode,
                    membersCount: 1,
                    ownerId: user.$id,
                    createdAt: new Date().toISOString()
                }
            );

            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.MEMBERSHIPS,
                ID.unique(),
                {
                    circleId: circle.$id,
                    userId: user.$id,
                    role: 'admin',
                    joinedAt: new Date().toISOString()
                }
            );

            return circle;
        } catch (error) {
            console.error("Error creating circle", error);
            throw error;
        }
    },

    async joinCircle(inviteCode: string) {
        try {
            const user = await account.get();

            const circles = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.CIRCLES,
                [Query.equal('inviteCode', inviteCode)]
            );

            if (circles.total === 0) throw new Error("Invalid invite code");
            const circle = circles.documents[0];

            const membership = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.MEMBERSHIPS,
                [
                    Query.equal('circleId', circle.$id),
                    Query.equal('userId', user.$id)
                ]
            );

            if (membership.total > 0) throw new Error("Already a member");

            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.MEMBERSHIPS,
                ID.unique(),
                {
                    circleId: circle.$id,
                    userId: user.$id,
                    role: 'member',
                    joinedAt: new Date().toISOString()
                }
            );

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.CIRCLES,
                circle.$id,
                {
                    membersCount: (circle.membersCount || 0) + 1
                }
            );

            return circle;
        } catch (error) {
            console.error("Error joining circle", error);
            throw error;
        }
    },

    async getMyCircles() {
        try {
            const user = await account.get();
            
            const memberships = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.MEMBERSHIPS,
                [Query.equal('userId', user.$id)]
            );

            if (memberships.total === 0) return [];

            const circleIds = memberships.documents.map(m => m.circleId);

            const circles = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.CIRCLES,
                [Query.equal('$id', circleIds)]
            );

            return circles.documents.map(doc => ({
                id: doc.$id,
                name: doc.name,
                image: doc.image,
                members: doc.membersCount || 0,
                notification: 0 
            }));

        } catch (error) {
            console.error("Error fetching circles", error);
            return [];
        }
    },

    async getCircleById(circleId: string) {
        try {
            const circle = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.CIRCLES,
                circleId
            );
            return {
                id: circle.$id,
                name: circle.name,
                image: circle.image,
                members: circle.membersCount || 0,
                description: circle.description,
                isPrivate: circle.isPrivate,
            };
        } catch (error) {
            console.error("Error fetching circle details", error);
            throw error;
        }
    }
};
