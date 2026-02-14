import { Query } from 'react-native-appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite-schema';
import { databases } from '../../lib/appwrite';
import { CURRENT_USER_LOCATION } from '../utils/location';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export interface BuilderItem {
    id: string;
    ownerId?: string;
    type: 'helper' | 'pro' | 'part' | 'service' | 'job';
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
    urgency?: 'low' | 'high' | 'critical';
    offer?: string;
    rating?: number;
    reviewCount?: number;
    hourlyRate?: string;
    isMock?: boolean;
    skills?: string[];
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

    getServiceImage(category: string): string {
        const images: {[key: string]: string} = {
            'mechanic': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400',
            'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400',
            'carpenter': 'https://images.unsplash.com/photo-1622325985068-d652c7929d2d?q=80&w=400',
            'solar': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=400',
            'towing': 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?q=80&w=400',
            'parts': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400',
            'default': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=400'
        };

        const key = Object.keys(images).find(k => category.toLowerCase().includes(k)) || 'default';
        return images[key];
    },

    async fetchRealWorldServices(lat: number, lon: number, category: string): Promise<BuilderItem[]> {
        console.log(`[OSM] Fetching services around Lat: ${lat}, Lon: ${lon} for category: ${category}`);

        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
            console.log("Invalid coordinates for OSM fetch");
            return [];
        }

        const radius = 50000;
        let queryBody = '';

        if (category === 'Mechanics') {
            queryBody = `node(around:${radius},${lat},${lon})["shop"~"car_repair|motorcycle_repair"];`;
        } else if (category === 'Electricians') {
            queryBody = `node(around:${radius},${lat},${lon})["craft"="electrician"];`;
        } else if (category === 'Parts') {
            queryBody = `node(around:${radius},${lat},${lon})["shop"~"hardware|car_parts|doityourself"];`;
        } else if (category === 'Towing') {
            queryBody = `node(around:${radius},${lat},${lon})["service"="vehicle:towing"];`;
        } else if (category === 'Solar') {
            queryBody = `node(around:${radius},${lat},${lon})["shop"~"electronics|solar"];`;
        } else {
            queryBody = `
                node(around:${radius},${lat},${lon})["shop"~"car_repair|hardware|car_parts|outdoor|camping|electronics|solar"];
                node(around:${radius},${lat},${lon})["craft"~"electrician|carpenter"];
                node(around:${radius},${lat},${lon})["service"="vehicle:towing"];
            `;
        }

        const query = `
            [out:json][timeout:25];
            (
              ${queryBody}
            );
            out body;
        `;
        
        console.log("OSM Query:", query);

        try {
            const response = await fetch('https://maps.mail.ru/osm/tools/overpass/api/interpreter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': 'https://nomvia.app'
                },
                body: `data=${encodeURIComponent(query)}`
            });

            const text = await response.text();
            
            if (!text.trim().startsWith('{')) {
                console.log("OSM Raw Response (First 500 chars):", text.substring(0, 500));
            }

            try {
                const data = JSON.parse(text);
                if (!data.elements) return [];

                return data.elements.slice(0, 20).map((el: any) => {
                    const dist = BuildersService.calculateDistance(lat, lon, el.lat, el.lon).toFixed(1);
                    const desc = el.tags['shop'] ? el.tags['shop'].replace('_', ' ') : (el.tags['craft'] || 'Service');
                    
                    return {
                        id: `osm_${el.id}`,
                        type: 'service',
                        name: el.tags.name || 'Local Service',
                        desc: desc,
                        dist: `${dist} km`,
                        verified: false,
                        coordinate: { latitude: el.lat, longitude: el.lon },
                        image: BuildersService.getServiceImage(category || desc) 
                    };
                });
            } catch (jsonError) {
                console.log("OSM JSON Parse Error. Response:", text.substring(0, 200));
                return [];
            }
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
            const [users, realServices] = await Promise.all([
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    [
                        Query.isNotNull('latitude'),
                        Query.isNotNull('longitude'),
                        Query.equal('isHelper', true),
                        Query.limit(50) 
                    ]
                ),
                BuildersService.fetchRealWorldServices(centerLat, centerLon, category)
            ]);

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
                        coordinate: { latitude: doc.latitude, longitude: doc.longitude },
                        rating: doc.rating || 4.5,
                        hourlyRate: doc.hourlyRate || '$25/hr',
                        skills: doc.skills || []
                    });
                }
            });

            items.push(...realServices);

        } catch (error) {
            console.error("Error fetching builder items", error);
        }

        if (items.length === 0) {
            return BuildersService.getMockData(category, centerLat, centerLon);
        }

        return items;
    },

    async getOpenJobs(lat: number, lon: number): Promise<BuilderItem[]> {
        try {
            // In a real geo-query, we would use geohash or bounding box.
            // For this hackathon scope, we fetch active requests and filter/sort in memory if needed.
            // Appwrite doesn't natively support "radius" queries easily without plugins, 
            // so we fetch 'open' requests and calculate distance.
            
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.REQUESTS,
                [
                    Query.equal('status', 'open'),
                    Query.limit(50),
                    Query.orderDesc('createdAt')
                ]
            );

            const jobs = response.documents.map((doc: any) => {
                const dist = BuildersService.calculateDistance(lat, lon, doc.latitude, doc.longitude).toFixed(1);
                
                // Only return jobs within 100km (or whatever meaningful radius)
                // if (parseFloat(dist) > 100) return null; 

                return {
                    id: doc.$id,
                    ownerId: doc.userId,
                    type: 'job',
                    name: doc.title, 
                    desc: doc.description,
                    dist: `${dist} km`,
                    image: doc.image || "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=200",
                    urgency: doc.urgency,
                    offer: doc.offer,
                    coordinate: { 
                        latitude: doc.latitude, 
                        longitude: doc.longitude 
                    }
                };
            }).filter(Boolean) as BuilderItem[];

            if (jobs.length > 0) return jobs;
            
            return BuildersService.getMockJobs(lat, lon);

        } catch (error) {
            console.error("Error fetching open jobs", error);
            return BuildersService.getMockJobs(lat, lon);
        }
    },

    getMockJobs(lat: number, lon: number): BuilderItem[] {
        return [
            {
                id: 'j1', ownerId: 'mock_user_1', type: 'job', name: 'Stuck in Mud', desc: 'Need a tow out of a muddy campsite near the river.', dist: '5.2 km',
                image: 'https://images.unsplash.com/photo-1628102491629-778571d893a3?q=80&w=400',
                urgency: 'critical', offer: '$150',
                coordinate: { latitude: lat + 0.02, longitude: lon + 0.02 }
            },
            {
                id: 'j2', ownerId: 'mock_user_2', type: 'job', name: 'Solar Install Help', desc: 'Need an extra pair of hands to lift panels onto roof.', dist: '12 km',
                image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=400',
                urgency: 'high', offer: '$50/hr',
                coordinate: { latitude: lat - 0.03, longitude: lon - 0.01 }
            },
            {
                id: 'j3', ownerId: 'mock_user_3', type: 'job', name: 'Leaking Roof Vent', desc: 'Rain coming in through MaxxAir fan, need sealant help.', dist: '8.5 km',
                image: 'https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?q=80&w=400',
                urgency: 'low', offer: 'Dinner & Beer',
                coordinate: { latitude: lat + 0.01, longitude: lon - 0.04 }
            }
        ];
    },

    getMockData(category: string, lat: number, lon: number): BuilderItem[] {
        const mocks: BuilderItem[] = [];
        
        if (category === 'All' || category === 'Mechanics') {
            mocks.push({
                id: 'm1', type: 'helper', name: 'Rajiv M.', desc: 'Diesel Engine Expert', dist: '2.5 km',
                image: BuildersService.getServiceImage('mechanic'), verified: true,
                coordinate: { latitude: lat + 0.01, longitude: lon + 0.01 },
                rating: 4.8, reviewCount: 24, hourlyRate: '$40/hr',
                isMock: true
            });
        }
        if (category === 'All' || category === 'Solar') {
             mocks.push({
                id: 'm2', type: 'helper', name: 'Sarah K.', desc: 'Solar Wiring Helper', dist: '3.0 km',
                image: BuildersService.getServiceImage('solar'), verified: true,
                coordinate: { latitude: lat - 0.01, longitude: lon - 0.005 },
                rating: 4.9, reviewCount: 15, hourlyRate: '$35/hr',
                isMock: true
            });
        }
        if (category === 'All' || category === 'Parts') {
             mocks.push({
                id: 'p1', type: 'part', name: 'Victron MPPT', desc: 'Unused charge controller', dist: '1.2 km', price: '₹8,000',
                image: BuildersService.getServiceImage('parts'),
                coordinate: { latitude: lat + 0.005, longitude: lon - 0.005 },
                isMock: true
            });
        }

        return mocks;
    }
};
