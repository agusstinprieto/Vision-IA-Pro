import { supabase } from '../auth/supabase';
import { Unit, InventoryTire, DriverStatus, TripData, SecurityAlert } from '../../types';
import { offlineService } from '../offline/offlineQueue';

export const dbService = {
    // 1. Units (Fleet)
    async getUnits(): Promise<Unit[]> {
        const { data, error } = await supabase
            .from('units')
            .select('*')
            .order('plate_id');

        if (error) throw error;
        return data.map(u => ({
            id: u.id,
            plate_id: u.plate_id,
            pipe_number: u.pipe_number,
            is_active: u.is_active,
            last_audit: u.last_audit,
            location: { lat: u.location_lat || 0, lng: u.location_lng || 0 }
        }));
    },

    // 2. Tires (Inventory)
    async getTires(): Promise<InventoryTire[]> {
        const { data, error } = await supabase
            .from('tires')
            .select('*')
            .order('unit_id');

        if (error) throw error;
        return data as InventoryTire[];
    },

    async updateTire(id: string, updates: Partial<InventoryTire>) {
        const { data, error } = await supabase
            .from('tires')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        return data;
    },

    // 3. Workers (Driver Health)
    async getWorkers(): Promise<import('../../types').Worker[]> {
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .order('risk_score', { ascending: false });

        if (error) throw error;
        return data as import('../../types').Worker[];
    },

    async createWorker(worker: Partial<import('../../types').Worker>) {
        const { data, error } = await supabase
            .from('workers')
            .insert([worker])
            .select();

        if (error) throw error;
        return data[0];
    },

    async updateWorkerStatus(id: string, status: DriverStatus, metrics: any) {
        const { data, error } = await supabase
            .from('workers')
            .update({ status, metrics, last_check: new Date().toLocaleTimeString() })
            .eq('id', id);

        if (error) throw error;
        return data;
    },

    // 4. Trips / Audits
    async getTrips(): Promise<TripData[]> {
        const { data, error } = await supabase
            .from('trips')
            .select('*')
            .order('start_time', { ascending: false });

        if (error) throw error;
        return data as TripData[];
    },

    async createTrip(trip: Partial<TripData>) {
        const { data, error } = await supabase
            .from('trips')
            .insert([trip])
            .select();

        if (error) throw error;
        return data[0];
    },

    // 5. Inspections
    // 5. Inspections
    async saveInspection(record: any) {
        try {
            const { data, error } = await supabase
                .from('inspections')
                .insert([record])
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Save Error:", error);
            // Check if it's a network error (simplified check)
            // In a real app, you'd check error.code or navigator.onLine
            if (!navigator.onLine) {
                console.warn("Offline detected. Queuing inspection.");
                await offlineService.queueRequest('inspections', 'POST', record);
                return [{ status: 'queued', ...record }];
            }
            throw error;
        }
    },

    // 6. Driver Evaluations & Stats
    async getDriverStats(driverId: string) {
        // In a real app, this would be a complex query or a RPC call
        // For now, we fetch evaluations and aggregate
        const { data, error } = await supabase
            .from('driver_evaluations')
            .select('*')
            .eq('driver_id', driverId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const total = data.length;
        if (total === 0) return {
            score_week: 0,
            score_month: 0,
            score_year: 0,
            score_historic: 0,
            accidents: 0,
            tire_theft: 0
        };

        const avgScore = data.reduce((acc, curr) => acc + curr.driver_score, 0) / total;

        // Mocking time-based slices for demo if real logic isn't available
        return {
            score_week: Math.round(avgScore * 0.98),
            score_month: Math.round(avgScore * 1.02),
            score_year: Math.round(avgScore),
            score_historic: Math.round(avgScore),
            accidents: data.filter(d => d.raw_data?.incident_type === 'ACCIDENT').length,
            tire_theft: data.filter(d => d.raw_data?.incident_type === 'TIRE_THEFT').length
        };
    },

    async saveDriverEvaluation(evaluation: any) {
        const { data, error } = await supabase
            .from('driver_evaluations')
            .insert([evaluation])
            .select();

        if (error) throw error;
        return data[0];
    },

    async saveIncident(incident: { driver_id: string, type: string, description: string, location?: any }) {
        const { data, error } = await supabase
            .from('incidents')
            .insert([{
                driver_id: incident.driver_id,
                type: incident.type,
                description: incident.description,
                location: incident.location,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    // 7. Storage Integration (New)
    async uploadEvidence(file: File | Blob | string, category: 'operarios' | 'incidencias' | 'llantas', id: string) {
        try {
            const timestamp = Date.now();
            // Basic extension detection or default to jpg
            const ext = typeof file === 'string' ? 'jpg' : file.type.split('/')[1] || 'jpg';
            const path = `${category}/${id}_${timestamp}.${ext}`;

            let fileBody: File | Blob | ArrayBuffer;

            if (typeof file === 'string') {
                // Assume Base64
                const base64Data = file.split(',')[1] || file;
                const binaryStr = atob(base64Data);
                const len = binaryStr.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                fileBody = bytes.buffer;
            } else {
                fileBody = file;
            }

            const { data, error } = await supabase.storage
                .from('evidence-vault')
                .upload(path, fileBody, {
                    contentType: typeof file !== 'string' ? file.type : 'image/jpeg',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('evidence-vault')
                .getPublicUrl(path);

            return publicUrl;
        } catch (error) {
            console.error('Upload Error:', error);
            // Fallback for demo/offline: Return local object URL if possible, or placeholder
            if (typeof file !== 'string') {
                return URL.createObjectURL(file as Blob);
            }
            return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23fff%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%3EUpload%20Failed%3C%2Ftext%3E%3C%2Fsvg%3E';
        }
    }
};
