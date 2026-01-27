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

### 2. Posts (`posts`)
**Collection ID:** `posts`
**Permissions:** Read: Any, Write: Users.

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `userId` | String | 36 | Yes | No | Relationship to User ID |
| `type` | String | 32 | Yes | No | 'none', 'map', 'image' |
| `content` | String | 5000 | Yes | No | Post body/description |
| `image` | Url | - | No | No | Post image URL |
| `tag` | String | 64 | No | No | Context tag (e.g. "VAN LIFE") |
| `from` | String | 128 | No | No | Journey start point |
| `to` | String | 128 | No | No | Journey destination |
| `isLive` | Boolean | - | No | No | Is this an active journey? |
| `totalKm` | Integer | - | No | No | Total distance |
| `completedKm` | Integer | - | No | No | Distance covered |
| `user_avatar` | Url | - | No | No | Cached avatar to reduce joins |
| `user_name` | String | 128 | No | No | Cached name to reduce joins |

### 3. Matches (`matches`)
**Collection ID:** `matches`
**Permissions:** Read: Users involved, Write: Users involved.

| Attribute Name | Type | Size | Required | Array | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `senderId` | String | 36 | Yes | No | User who swiped right |
| `receiverId` | String | 36 | Yes | No | User who was liked |
| `status` | String | 32 | Yes | No | 'pending', 'accepted', 'rejected' |

## Setup Instructions

To apply this schema to your Appwrite instance:
1.  Ensure `node-appwrite` is installed: `npm install node-appwrite`.
2.  Set `APPWRITE_API_KEY` in your `.env` file (needs to be a secret API key with `collections.write` and `attributes.write` scopes).
3.  Run the sync script (to be created).
