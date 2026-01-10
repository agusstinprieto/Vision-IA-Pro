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

    // 2. Tires (Inventory) - Read from baselines
    async getTires(page = 0, pageSize = 10): Promise<{ tires: InventoryTire[], hasMore: boolean }> {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from('baselines')
            .select('unit_id, frame_data, updated_at', { count: 'exact' })
            .order('updated_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        const tires: InventoryTire[] = [];
        data?.forEach((baseline: any) => {
            const frames = baseline.frame_data || [];
            frames.forEach((frame: any, index: number) => {
                if (frame.metadata && Object.keys(frame.metadata).length > 0) {
                    const brand = frame.metadata.brand;
                    if (brand && brand !== 'Desconocido' && brand !== '') {
                        tires.push({
                            id: `${baseline.unit_id}-tire-${index + 1}`,
                            unit_id: baseline.unit_id,
                            position: `Llanta ${index + 1}`,
                            brand: brand,
                            model: frame.metadata.model || 'N/A',
                            depth_mm: frame.metadata.depth_mm || 0,
                            rim_condition: frame.metadata.rim_condition || 'N/A',
                            serial_number: frame.metadata.serial_number || null,
                            last_photo_url: frame.url,
                            status: frame.metadata.depth_mm < 5 ? SecurityAlert.ROJA :
                                frame.metadata.depth_mm < 9 ? SecurityAlert.AMARILLA :
                                    SecurityAlert.VERDE,
                            history: []
                        });
                    }
                }
            });
        });

        const hasMore = count ? (to + 1) < count : false;
        return { tires, hasMore };
    },

    async getTireStats() {
        // Fetch all baselines but only minimal data for stats
        const { data, error } = await supabase
            .from('baselines')
            .select('frame_data')
            .not('frame_data', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(50); // Fetch last 50 fleet snapshots for dashboard health

        if (error) throw error;

        let total = 0;
        let critical = 0;
        let warning = 0;
        let totalDepth = 0;

        data?.forEach((baseline: any) => {
            const frames = baseline.frame_data || [];
            frames.forEach((frame: any) => {
                if (frame.metadata && frame.metadata.brand) {
                    const depth = frame.metadata.depth_mm || 0;
                    total++;
                    totalDepth += depth;
                    if (depth < 5) critical++;
                    else if (depth < 9) warning++;
                }
            });
        });

        return {
            total,
            critical,
            warning,
            avgDepth: total > 0 ? (totalDepth / total).toFixed(1) : "0",
            healthPercentage: total > 0 ? Math.round((totalDepth / (total * 20)) * 100) : 0
        };
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
    async getTrips(limit = 20): Promise<TripData[]> {
        const { data, error } = await supabase
            .from('trips')
            .select('*')
            .order('start_time', { ascending: false })
            .limit(limit);

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
    },

    // 8. Forensic Baselines (New)
    async saveBaseline(unitId: string, frames: any[]) {
        // Prepare payload: verify if we can store big JSON or need storage references
        // For this demo, we store the base64/urls directly in a JSONB column 'frame_data'
        const { data, error } = await supabase
            .from('baselines')
            .upsert({
                unit_id: unitId,
                frame_data: frames,
                updated_at: new Date().toISOString()
            }, { onConflict: 'unit_id' })
            .select();

        if (error) throw error;
        return data[0];
    },

    async getBaseline(unitId: string) {
        const { data, error } = await supabase
            .from('baselines')
            .select('*')
            .eq('unit_id', unitId)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (error || !data || data.length === 0) {
            console.warn("Baseline not found:", error);
            return null;
        }
        return data[0]?.frame_data as { id: number, url: string, metadata?: any }[];
    },

    // 9. Audit System (Multi-Level)

    /**
     * Save audit result (historical inspection)
     * Always compares against original baseline, not previous audits
     */
    async saveAudit(audit: {
        unit_id: string;
        unit_type: string;
        frame_data: any[];
        comparison_result: { matched: number; mismatched: number; total: number };
        requires_justification: boolean;
    }) {
        const { data, error } = await supabase
            .from('audits')
            .insert([audit])
            .select();

        if (error) throw error;
        return data[0];
    },

    /**
     * Get audit history for a unit
     * Returns all historical inspections ordered by date (newest first)
     */
    async getAuditHistory(unitId: string) {
        const { data, error } = await supabase
            .from('audits')
            .select('*')
            .eq('unit_id', unitId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Update baseline (supervisor approval required)
     * Only called after supervisor approves a tire change justification
     */
    async updateBaselineWithApproval(
        unitId: string,
        frameData: any[],
        approvedBy: string,
        auditId: string
    ) {
        // Update baseline
        const { data: baselineData, error: baselineError } = await supabase
            .from('baselines')
            .update({
                frame_data: frameData,
                updated_at: new Date().toISOString()
            })
            .eq('unit_id', unitId)
            .select();

        if (baselineError) throw baselineError;

        // Mark audit as approved
        const { error: auditError } = await supabase
            .from('audits')
            .update({
                approved_by: approvedBy,
                approved_at: new Date().toISOString()
            })
            .eq('id', auditId);

        if (auditError) throw auditError;

        return baselineData[0];
    },

    /**
     * Save multi-unit inspection (tractor + trailers)
     * Associates all audit IDs with detected vehicle IDs
     */
    async saveInspection(inspection: {
        tractor_id: string | null;
        trailer_ids: string[];
        audit_ids: string[];
    }) {
        const { data, error } = await supabase
            .from('inspections')
            .insert([inspection])
            .select();

        if (error) throw error;
        return data[0];
    },

    /**
     * Add justification to existing audit
     * Called when driver uploads photos and explanation
     */
    async addAuditJustification(
        auditId: string,
        photos: string[],
        text: string
    ) {
        const { data, error } = await supabase
            .from('audits')
            .update({
                justification_photos: photos,
                justification_text: text
            })
            .eq('id', auditId)
            .select();

        if (error) throw error;
        return data[0];
    },

    // 10. Tire Disposal System

    /**
     * Create tire disposal request
     * Called when user marks a tire for decommissioning
     */
    async createTireDisposal(disposal: {
        unit_id: string;
        tire_position: string;
        tire_metadata: any;
        reason: 'PUNCTURE' | 'WEAR' | 'DAMAGE' | 'THEFT';
        photo_url: string;
        comments?: string;
        disposed_by: string;
    }) {
        const { data, error } = await supabase
            .from('tire_disposals')
            .insert([{ ...disposal, status: 'PENDING' }])
            .select();

        if (error) throw error;
        return data[0];
    },

    /**
     * Get pending tire disposals (for supervisor approval)
     */
    async getPendingDisposals() {
        const { data, error } = await supabase
            .from('tire_disposals')
            .select('*')
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Approve tire disposal (supervisor only)
     */
    async approveDisposal(disposalId: string, approvedBy: string) {
        const { data, error } = await supabase
            .from('tire_disposals')
            .update({
                status: 'APPROVED',
                approved_by: approvedBy,
                approved_at: new Date().toISOString()
            })
            .eq('id', disposalId)
            .select();

        if (error) throw error;
        return data[0];
    },

    /**
     * Get disposal history for a unit
     */
    async getDisposalHistory(unitId: string) {
        const { data, error } = await supabase
            .from('tire_disposals')
            .select('*')
            .eq('unit_id', unitId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
