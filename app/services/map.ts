import { Query } from 'react-native-appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';
import { databases, account } from '../../lib/appwrite';
import { CURRENT_USER_LOCATION } from '../utils/location';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export interface MapItem {
    id: string;
    type: 'nomad' | 'event' | 'service' | 'sos';
    title: string;
    desc: string;
    lat: number;
    long: number;
    avatar?: string;
    heading?: number;
    icon?: string;
}

export const MapService = {
    async fetchRealWorldServices(lat: number, lon: number): Promise<MapItem[]> {
        const radius = 15000; // 15km
        const query = `
            [out:json];
            (
              node(around:${radius},${lat},${lon})["shop"="car_repair"];
              node(around:${radius},${lat},${lon})["amenity"="drinking_water"];
              node(around:${radius},${lat},${lon})["tourism"="camp_site"];
              node(around:${radius},${lat},${lon})["amenity"="fuel"];
              node(around:${radius},${lat},${lon})["amenity"="pharmacy"];
              node(around:${radius},${lat},${lon})["amenity"="hospital"];
              node(around:${radius},${lat},${lon})["shop"="supermarket"];
            );
            out body 20;
        `;

        try {
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });
            const data = await response.json();
            
            if (!data.elements) return [];

            return data.elements.map((el: any) => {
                let type = 'service';
                let icon = '📍';
                let desc = 'Service';

                if (el.tags.shop === 'car_repair') {
                    icon = '🔧';
                    desc = 'Mechanic';
                } else if (el.tags.amenity === 'drinking_water') {
                    icon = '💧';
                    desc = 'Water';
                } else if (el.tags.tourism === 'camp_site') {
                    icon = '⛺';
                    desc = 'Campsite';
                } else if (el.tags.amenity === 'fuel') {
                    icon = '⛽';
                    desc = 'Fuel';
                } else if (el.tags.amenity === 'pharmacy') {
                    icon = '💊';
                    desc = 'Pharmacy';
                } else if (el.tags.amenity === 'hospital') {
                    icon = '🏥';
                    desc = 'Hospital';
                } else if (el.tags.shop === 'supermarket') {
                    icon = '🛒';
                    desc = 'Supermarket';
                }

                return {
                    id: `osm_${el.id}`,
                    type: 'service',
                    title: el.tags.name || desc,
                    desc: desc,
                    lat: el.lat,
                    long: el.lon,
                    icon: icon
                };
            });
        } catch (error) {
            console.log("OSM Fetch Error", error);
            return [];
        }
    },

    async getMapItems(userLat?: number, userLon?: number): Promise<MapItem[]> {
        const items: MapItem[] = [];
        
        const centerLat = userLat || CURRENT_USER_LOCATION.latitude;
        const centerLon = userLon || CURRENT_USER_LOCATION.longitude;

        try {
            const users = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.USERS,
                [
                    Query.isNotNull('latitude'),
                    Query.isNotNull('longitude'),
                    Query.limit(50) 
                ]
            );

            users.documents.forEach((doc: any) => {
                items.push({
                    id: doc.$id,
                    type: 'nomad',
                    title: doc.username || doc.name || 'Nomad',
                    desc: doc.status || 'Exploring',
                    lat: doc.latitude,
                    long: doc.longitude,
                    avatar: doc.avatar || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop",
                    heading: 0 
                });
            });

            const meetups = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.POSTS,
                [
                    Query.equal('type', 'meetup'),
                    Query.isNotNull('latitude'),
                    Query.limit(20)
                ]
            );

            meetups.documents.forEach((doc: any) => {
                items.push({
                    id: doc.$id,
                    type: 'event',
                    title: doc.title || 'Meetup',
                    desc: doc.meetupTime || 'Coming soon',
                    lat: doc.latitude,
                    long: doc.longitude,
                    icon: '🔥'
                });
            });
            const realServices = await MapService.fetchRealWorldServices(centerLat, centerLon);
            
            items.push(...realServices);
            
        } catch (error) {
            console.error("Error fetching map items", error);
        }

        return items;
    },

    async updateUserLocation(latitude: number, longitude: number) {
        try {
            const user = await account.get();
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                user.$id,
                {
                    latitude,
                    longitude
                }
            );
        } catch (error) {
            console.error("Error updating location", error);
        }
    }
};
