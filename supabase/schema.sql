-- SIMSA VISION IA - Database Schema
-- Execute this in the Supabase SQL Editor

-- 1. Units Table (Fleet)
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_id TEXT UNIQUE NOT NULL,
    pipe_number TEXT,
    is_active BOOLEAN DEFAULT true,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    last_audit TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tires Table (Inventory)
CREATE TABLE IF NOT EXISTS public.tires (
    id TEXT PRIMARY KEY, -- e.g. T-101
    unit_id TEXT REFERENCES public.units(plate_id) ON DELETE CASCADE,
    position TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    depth_mm DOUBLE PRECISION,
    status TEXT DEFAULT 'VERDE', -- ROJA, AMARILLA, VERDE
    last_photo_url TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Workers Table (Operators Health)
CREATE TABLE IF NOT EXISTS public.workers (
    id TEXT PRIMARY KEY, -- e.g. D-01
    name TEXT NOT NULL,
    phone TEXT,
    unit_assigned TEXT,
    photo_url TEXT,
    risk_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'NORMAL',
    metrics JSONB DEFAULT '{}'::jsonb,
    last_check TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Trips/Audits Table
CREATE TABLE IF NOT EXISTS public.trips (
    id TEXT PRIMARY KEY, -- e.g. TRP-1234
    truck_id TEXT,
    driver_id TEXT,
    status TEXT DEFAULT 'PENDING',
    start_time TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Inspections Table (Generic Audit Records)
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id TEXT,
    inspection_type TEXT CHECK (inspection_type IN ('ENTRY', 'EXIT')),
    status TEXT,
    ai_summary TEXT,
    image_url TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
泛

-- Enable Realtime for Dashboard Updates
ALTER PUBLICATION supabase_realtime ADD TABLE units, tires, workers, trips, inspections;

-- Disable RLS for now to facilitate initial connection (User can enable later)
ALTER TABLE public.units DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tires DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections DISABLE ROW LEVEL SECURITY;

-- Insert Mock Seed Data (Optional)
INSERT INTO public.units (plate_id, pipe_number, is_active) VALUES 
('GMS-01', 'P-104', true),
('GMS-04', 'P-108', true),
('GMS-09', 'P-112', false);

INSERT INTO public.workers (id, name, phone, unit_assigned, risk_score, status) VALUES 
('D-01', 'Roberto Sanchez', '+52 871 123 4567', 'PR-901', 92, 'PELIGRO'),
('D-02', 'Carlos Mendez', '+52 871 987 6543', 'PR-904', 75, 'FATIGA');
