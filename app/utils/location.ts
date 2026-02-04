export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d);
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

export function calculateETA(distanceKm: number): string {
    const speed = 50; 
    const hours = distanceKm / speed;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    
    if (h > 24) {
        const days = Math.floor(h / 24);
        return `${days}d ${h % 24}h`;
    }
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export const CURRENT_USER_LOCATION = {
    latitude: 32.2432,
    longitude: 77.1892
};