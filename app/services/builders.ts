import { Query } from 'react-native-appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';
import { databases } from '../../lib/appwrite';
import { CURRENT_USER_LOCATION } from '../utils/location';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export interface BuilderItem {
    id: string;
    type: 'helper' | 'pro' | 'part' | 'service';
    name: string; 
    desc: string; 
    dist?: string;
    price?: string;
    image?: string;
    verified?: boolean;
    coordinate: {
        latitude: number;
        longitude: number;
    };
    contact?: string;
}

export const BuildersService = {
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; 
    },

    async fetchRealWorldServices(lat: number, lon: number, category: string): Promise<BuilderItem[]> {
        const radius = 20000; 
        let osmTag = '';

        if (category === 'Mechanics') osmTag = '["shop"="car_repair"]';
        else if (category === 'Electricians') osmTag = '["craft"="electrician"]'; 
        else if (category === 'Parts') osmTag = '["shop"~"hardware|car_parts|doityourself"]';
        else if (category === 'Towing') osmTag = '["service"="vehicle:towing"]'; 
        else if (category === 'Solar') osmTag = '["shop"="electronics"]'; 
        else osmTag = '["shop"~"car_repair|hardware|car_parts"]'; 

        const query = `
            [out:json];
            (
              node(around:${radius},${lat},${lon})${osmTag};
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
                const dist = BuildersService.calculateDistance(lat, lon, el.lat, el.lon).toFixed(1);
                return {
                    id: `osm_${el.id}`,
                    type: 'service',
                    name: el.tags.name || 'Local Service',
                    desc: el.tags['shop'] ? el.tags['shop'].replace('_', ' ') : 'Service',
                    dist: `${dist} km`,
                    verified: false,
                    coordinate: { latitude: el.lat, longitude: el.lon },
                    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=200' 
                };
            });
        } catch (error) {
            console.log("OSM Builders Fetch Error", error);
            return [];
        }
    },

    async getBuildersAndHelpers(userLat?: number, userLon?: number, category: string = 'All'): Promise<BuilderItem[]> {
        const items: BuilderItem[] = [];
        const centerLat = userLat || CURRENT_USER_LOCATION.latitude;
        const centerLon = userLon || CURRENT_USER_LOCATION.longitude;

        try {
            const users = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.USERS,
                [
                    Query.isNotNull('latitude'),
                    Query.isNotNull('longitude'),
                    Query.equal('isHelper', true),
                    Query.limit(50) 
                ]
            );

            users.documents.forEach((doc: any) => {
                const isRelevant = category === 'All' || (doc.skills && doc.skills.includes(category));
                
                if (isRelevant) {
                    const dist = BuildersService.calculateDistance(centerLat, centerLon, doc.latitude, doc.longitude).toFixed(1);
                    items.push({
                        id: doc.$id,
                        type: 'helper',
                        name: doc.username || doc.name || 'Nomad Helper',
                        desc: doc.bio ? doc.bio.substring(0, 30) + '...' : 'Community Helper',
                        dist: `${dist} km`,
                        image: doc.avatar || "https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=200",
                        verified: doc.verified || false,
                        coordinate: { latitude: doc.latitude, longitude: doc.longitude }
                    });
                }
            });

            const realServices = await BuildersService.fetchRealWorldServices(centerLat, centerLon, category);
            items.push(...realServices);

        } catch (error) {
            console.error("Error fetching builder items", error);
        }

        if (items.length === 0) {
            return BuildersService.getMockData(category, centerLat, centerLon);
        }

        return items;
    },

    getMockData(category: string, lat: number, lon: number): BuilderItem[] {
        const mocks: BuilderItem[] = [];
        
        if (category === 'All' || category === 'Mechanics') {
            mocks.push({
                id: 'm1', type: 'helper', name: 'Rajiv M.', desc: 'Diesel Engine Expert', dist: '2.5 km',
                image: "https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=400", verified: true,
                coordinate: { latitude: lat + 0.01, longitude: lon + 0.01 }
            });
        }
        if (category === 'All' || category === 'Solar') {
             mocks.push({
                id: 'm2', type: 'helper', name: 'Sarah K.', desc: 'Solar Wiring Helper', dist: '3.0 km',
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400", verified: true,
                coordinate: { latitude: lat - 0.01, longitude: lon - 0.005 }
            });
        }
        if (category === 'All' || category === 'Parts') {
             mocks.push({
                id: 'p1', type: 'part', name: 'Victron MPPT', desc: 'Unused charge controller', dist: '1.2 km', price: '₹8,000',
                image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=200",
                coordinate: { latitude: lat + 0.005, longitude: lon - 0.005 }
            });
        }

        return mocks;
    }
};
