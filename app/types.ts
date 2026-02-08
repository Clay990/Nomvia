export interface Post {
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    userId: string;
    type: 'none' | 'map' | 'image' | 'meetup' | 'discussion' | 'qa' | 'resource';
    content: string;
    title?: string;
    meetupTime?: string;
    image?: string; 
    link?: string;
    tag?: string;
    from?: string;
    to?: string;
    isLive?: boolean;
    totalKm?: number;
    completedKm?: number;
    user_avatar?: string;
    user_name?: string;
    timestamp?: string;
    createdAt?: string;
    mediaUrls?: string[];
    likesCount?: number;
    commentsCount?: number;
    viewsCount?: number;
    location?: string;
    latitude?: number;
    longitude?: number;
    mutualConnections?: number;
    privacy?: 'public' | 'friends' | 'private';
    isActive?: boolean;
    expiresAt?: string;
    engagementScore?: number;
    isSensitive?: boolean; 
}

export interface Comment {
    $id: string;
    postId: string;
    userId: string;
    content: string;
    timestamp: string;
    likesCount?: number;
    user_name?: string;
    user_avatar?: string;
}

export interface User {
    $id: string;
    username: string;
    avatar?: string;
    coverImage?: string;
    bio?: string;
    location?: string;
    role: 'Traveler' | 'Builder' | 'Guide';
    verified?: boolean;
    pace?: 'Fast' | 'Slow' | 'Steady';
    mode?: 'Solo' | 'Couple' | 'Family' | 'Convoy';
    style?: 'Off-grid' | 'Campgrounds' | 'Mix';
    interests?: string[];
    skills?: string[];
    isHelper?: boolean;
    rigName?: string;
    rigImage?: string;
    rigSummary?: string;
    rigTech?: string[];
    instagram?: string;
    youtube?: string;
    website?: string;
}

export interface Message {
    $id: string;
    circleId?: string;
    receiverId?: string;
    userId: string;
    content: string;
    type: 'text' | 'image' | 'system';
    user_name?: string;
    user_avatar?: string;
    createdAt: string;
}