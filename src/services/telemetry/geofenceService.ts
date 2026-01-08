export interface Geofence {
    id: string;
    name: string;
    center: { lat: number; lng: number };
    radius: number; // in meters
}

export const GEOFENCES: Geofence[] = [
    {
        id: 'mty-yard',
        name: 'Patio Monterrey',
        center: { lat: 25.6866, lng: -100.3161 },
        radius: 2000 // 2km
    },
    {
        id: 'laredo-border',
        name: 'Frontera Laredo',
        center: { lat: 27.5306, lng: -99.4803 },
        radius: 3000 // 3km
    }
];

export class GeofenceService {
    /**
     * Calculates the distance between two points in meters using Haversine formula
     */
    static getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // Earth radius in meters
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const deltaPhi = (lat2 - lat1) * Math.PI / 180;
        const deltaLambda = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    static checkGeofences(lat: number, lng: number): Geofence | null {
        for (const fence of GEOFENCES) {
            const distance = this.getDistance(lat, lng, fence.center.lat, fence.center.lng);
            if (distance <= fence.radius) {
                return fence;
            }
        }
        return null;
    }
}
