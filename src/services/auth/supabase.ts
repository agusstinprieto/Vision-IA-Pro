import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eabsbaztlrzpndaowbms.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Check .env.local');
}

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey || 'anon-key-placeholder'
);

export interface InspectionRecord {
    id?: string;
    vehicle_id?: string;
    inspection_type: 'ENTRY' | 'EXIT';
    status: 'CLEAN' | 'DAMAGE_DETECTED' | 'MAINTENANCE_REQ';
    ai_summary: string;
    image_url?: string;
    location?: string;
    created_at?: string;
}

export const saveInspection = async (record: InspectionRecord) => {
    const { data, error } = await supabase
        .from('inspections')
        .insert([record])
        .select();

    if (error) throw error;
    return data;
};
