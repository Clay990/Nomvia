# Nomvia Database Blueprint

This file serves as the source of truth for the Appwrite Database schema.

**Database Name:** `nomvia_db`
**Database ID:** `nomvia_db`

## Collections

### 1. Users (`users`)
**Collection ID:** `users`
**Permissions:** Document Level Permissions (User can read/write own, others can read public fields).

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `username` | String | 128 | Yes | No | Display name |
| `bio` | String | 1000 | No | No | User biography |
| `location` | String | 255 | No | No | Current location (e.g., "Ladakh, India") |
| `avatar` | Url | - | No | No | Profile picture URL |
| `coverImage` | Url | - | No | No | Cover photo URL |
| `age` | Integer | - | No | No | User age |
| `role` | String | 32 | Yes | No | 'Traveler', 'Builder', 'Guide' |
| `verified` | Boolean | - | No | No | Verification status |
| `pace` | String | 32 | No | No | 'Fast', 'Slow', 'Steady' |
| `mode` | String | 32 | No | No | 'Solo', 'Couple', 'Family', 'Convoy' |
| `style` | String | 32 | No | No | 'Off-grid', 'Campgrounds', 'Mix' |
| `interests` | String | 64 | No | Yes | Array of interest tags |
| `skills` | String | 64 | No | Yes | Array of skills |
| `isHelper` | Boolean | - | No | No | "Happy to help" toggle |
| `rigName` | String | 128 | No | No | Name of the vehicle/rig |
| `rigImage` | Url | - | No | No | Photo of the rig |
| `rigSummary` | String | 255 | No | No | Short rig description |
| `rigTech` | String | 64 | No | Yes | Tech specs (e.g., "400W Solar") |
| `instagram` | Url | - | No | No | Social link |
| `youtube` | Url | - | No | No | Social link |
| `website` | Url | - | No | No | Social link |
| `completedOnboarding` | Boolean | - | No | No | Has user finished setup? |

### 2. Posts (`posts`)
**Collection ID:** `posts`
**Permissions:** Read: Any, Write: Users.

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `userId` | String | 36 | Yes | No | Relationship to User ID |
| `type` | String | 32 | Yes | No | 'none', 'map', 'image' |
| `title` | String | 128 | No | No | Post title |
| `content` | String | 5000 | Yes | No | Post body/description |
| `link` | Url | - | No | No | External link for resources |
| `meetupTime` | String | 128 | No | No | Date/Time string for meetups |
| `image` | Url | - | No | No | Post image URL (Legacy, prefer mediaUrls) |
| `tag` | String | 64 | No | No | Context tag (e.g. "VAN LIFE") |
| `from` | String | 128 | No | No | Journey start point |
| `to` | String | 128 | No | No | Journey destination |
| `isLive` | Boolean | - | No | No | Is this an active journey? |
| `totalKm` | Integer | - | No | No | Total distance |
| `completedKm` | Integer | - | No | No | Distance covered |
| `user_avatar` | Url | - | No | No | Cached avatar to reduce joins |
| `user_name` | String | 128 | No | No | Cached name to reduce joins |
| `timestamp` | Datetime | - | Yes | No | When the post was created |
| `lastUpdated` | Datetime | - | No | No | When the post was last modified |
| `latitude` | Float | - | No | No | Geolocation latitude |
| `longitude` | Float | - | No | No | Geolocation longitude |
| `address` | String | 255 | No | No | Text address location |
| `mediaUrls` | Url | - | No | Yes | Array of image/video URLs |
| `likesCount` | Integer | - | No | No | Number of likes |
| `commentsCount` | Integer | - | No | No | Number of comments |
| `viewsCount` | Integer | - | No | No | Number of views |
| `isActive` | Boolean | - | No | No | Whether the post is still active |
| `expiresAt` | Datetime | - | No | No | When the post expires |
| `privacy` | String | 32 | No | No | 'public', 'friends', 'private' |
| `engagementScore` | Float | - | No | No | Algorithmic score for relevance |

### 3. Matches (`matches`)
**Collection ID:** `matches`
**Permissions:** Read: Users involved, Write: System/Function (or Users for MVP).

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `userA` | String | 36 | Yes | No | First user ID |
| `userB` | String | 36 | Yes | No | Second user ID |
| `timestamp` | Datetime | - | Yes | No | Match creation time |

### 12. Swipes (`swipes`)
**Collection ID:** `swipes`
**Permissions:** Read: Users, Write: Users.

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `initiatorId` | String | 36 | Yes | No | User who swiped |
| `targetId` | String | 36 | Yes | No | User being swiped on |
| `type` | String | 32 | Yes | No | 'like', 'pass' |
| `timestamp` | Datetime | - | Yes | No | Swipe time |

### 4. Comments (`comments`)
**Collection ID:** `comments`
**Permissions:** Read: Public, Write: Owner

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `postId` | String | 36 | Yes | No | Post ID relationship |
| `userId` | String | 36 | Yes | No | Comment author ID |
| `content` | String | 1000 | Yes | No | Comment text |
| `timestamp` | Datetime | - | Yes | No | Creation time |
| `likesCount` | Integer | - | No | No | Number of likes on comment |

### 5. Likes (`likes`)
**Collection ID:** `likes`
**Permissions:** Read: Public, Write: Owner

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `targetId` | String | 36 | Yes | No | Post or Comment ID |
| `userId` | String | 36 | Yes | No | User who liked |
| `type` | String | 32 | Yes | No | 'post' or 'comment' |
| `timestamp` | Datetime | - | Yes | No | Time of like |

### 6. Media (`media`)
**Collection ID:** `media`
**Permissions:** Read: Public, Write: Owner

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `uploaderId` | String | 36 | Yes | No | User ID |
| `url` | Url | - | Yes | No | File URL |
| `type` | String | 32 | Yes | No | 'image', 'video' |
| `size` | Integer | - | No | No | File size in bytes |
| `mimeType` | String | 64 | No | No | MIME type |

### 7. Journeys (`journeys`)
**Collection ID:** `journeys`
**Permissions:** Read: Public, Write: Owner

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `userId` | String | 36 | Yes | No | Owner of journey |
| `title` | String | 128 | Yes | No | Name of trip |
| `startDate` | Datetime | - | Yes | No | Start date |
| `endDate` | Datetime | - | No | No | End date |
| `waypoints` | String | 5000 | No | No | JSON string of lat/long points |
| `status` | String | 32 | Yes | No | 'planned', 'active', 'completed' |

### 8. Stories (`stories`)
**Collection ID:** `stories`
**Permissions:** Read: Public, Write: Owner

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `userId` | String | 36 | Yes | No | User ID |
| `fileId` | String | 36 | Yes | No | Storage File ID |
| `user_name` | String | 128 | No | No | Cached User Name |
| `user_avatar` | Url | - | No | No | Cached User Avatar |
| `createdAt` | Datetime | - | Yes | No | Creation time |
| `expiresAt` | Datetime | - | Yes | No | Expiration time (24h) |
| `likes` | Integer | - | No | No | Number of likes |
| `views` | Integer | - | No | No | Number of views |

### 9. Circles (`circles`)
**Collection ID:** `circles`
**Permissions:** Read: Any, Write: Owner

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `name` | String | 128 | Yes | No | Name of the circle |
| `description` | String | 1000 | No | No | Description |
| `image` | Url | - | No | No | Cover image |
| `isPrivate` | Boolean | - | Yes | No | Is invite only? |
| `inviteCode` | String | 16 | No | No | Code for joining |
| `membersCount` | Integer | - | No | No | Count of members |
| `ownerId` | String | 36 | Yes | No | Creator ID |
| `createdAt` | Datetime | - | Yes | No | Creation time |

### 10. Memberships (`memberships`)
**Collection ID:** `memberships`
**Permissions:** Read: Any, Write: Users

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `circleId` | String | 36 | Yes | No | Circle ID |
| `userId` | String | 36 | Yes | No | User ID |
| `role` | String | 32 | Yes | No | 'admin', 'member' |
| `joinedAt` | Datetime | - | Yes | No | Join time |

### 11. Messages (`messages`)
**Collection ID:** `messages`
**Permissions:** Read: Members (for circles) or Receiver/Sender (for DMs), Write: Users

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `circleId` | String | 36 | No | No | Target Circle ID (Group Chat) |
| `receiverId` | String | 36 | No | No | Target User ID (Direct Message) |
| `userId` | String | 36 | Yes | No | Sender ID |
| `content` | String | 5000 | Yes | No | Message content |
| `type` | String | 32 | Yes | No | 'text', 'image', 'system' |
| `user_name` | String | 128 | No | No | Cached Sender Name |
| `user_avatar` | Url | - | No | No | Cached Sender Avatar |
| `createdAt` | Datetime | - | Yes | No | Creation time |

### 13. Requests (`requests`)
**Collection ID:** `requests`
**Permissions:** Read: Any, Write: Owner (Create/Update/Delete).

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `userId` | String | 36 | Yes | No | Requester ID |
| `type` | String | 32 | Yes | No | 'mechanic', 'towing', 'parts', 'helper', 'other' |
| `title` | String | 128 | Yes | No | Short title |
| `description` | String | 1000 | Yes | No | Detailed description |
| `latitude` | Float | - | Yes | No | Location Lat |
| `longitude` | Float | - | Yes | No | Location Lon |
| `urgency` | String | 32 | Yes | No | 'low', 'high', 'critical' |
| `status` | String | 32 | Yes | No | 'open', 'in_progress', 'resolved', 'cancelled' |
| `image` | Url | - | No | No | Photo of the issue |
| `offer` | String | 128 | No | No | Payment or barter offer |
| `createdAt` | Datetime | - | Yes | No | Creation time |
| `resolvedAt` | Datetime | - | No | No | Resolution time |

## Indexing Strategy

### Frequently Queried Indexes
1.  **Posts - Feed:**
    *   Key: `feed_index`
    *   Attributes: `timestamp` (DESC), `isActive`
2.  **Posts - User Profile:**
    *   Key: `user_posts`
    *   Attributes: `userId`, `timestamp` (DESC)
3.  **Posts - Geospatial:**
    *   Key: `geo_posts`
    *   Attributes: `latitude`, `longitude` (Using spatial queries if supported, or bounding box logic)
4.  **Matches - Status:**
    *   Key: `match_status`
    *   Attributes: `senderId`, `receiverId`, `status`
5.  **Stories - Feed:**
    *   Key: `active_stories`
    *   Attributes: `expiresAt` (DESC)

### Compound Indexes
1.  **Trending Posts:** `engagementScore` (DESC), `timestamp` (DESC)
2.  **Live Journeys:** `isLive`, `timestamp` (DESC)

## Setup Instructions

To apply this schema to your Appwrite instance:
1.  Ensure `node-appwrite` is installed: `npm install node-appwrite`.
2.  Set `APPWRITE_API_KEY` in your `.env` file (needs to be a secret API key with `collections.write` and `attributes.write` scopes).
3.  Run the sync script (to be created).
