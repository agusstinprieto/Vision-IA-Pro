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
    }
};
