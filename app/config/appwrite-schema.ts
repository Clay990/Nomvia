export const APPWRITE_CONFIG = {
    ENDPOINT: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 'nomvia_test',
    DATABASE_ID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'nomvia_db',
    COLLECTIONS: {
        USERS: 'users',
        POSTS: 'posts',
        COMMENTS: 'comments',
        LIKES: 'likes',
        MATCHES: 'matches',
        SWIPES: 'swipes',
        FOLLOWERS: 'followers',
        REQUESTS: 'requests',
        MESSAGES: 'messages',
        CIRCLES: 'circles',
        MEMBERSHIPS: 'memberships',
        STORIES: 'stories'
    },
    STORAGE: {
        MEDIA_BUCKET: 'media'
    }
};
