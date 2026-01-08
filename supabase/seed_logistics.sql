-- Execute this script in your Supabase SQL Editor to populate the Logistics dashboard

-- 1. Create Tables if they don't exist
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

CREATE TABLE IF NOT EXISTS public.tires (
    id TEXT PRIMARY KEY,
    unit_id TEXT REFERENCES public.units(plate_id) ON DELETE CASCADE,
    position TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    depth_mm DOUBLE PRECISION,
    status TEXT DEFAULT 'VERDE',
    last_photo_url TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trips (
    id TEXT PRIMARY KEY,
    truck_id TEXT,
    driver_id TEXT,
    status TEXT DEFAULT 'PENDING',
    alert_level TEXT DEFAULT 'NORMAL', -- 'NORMAL', 'ROJA', 'AMARILLA'
    start_time TIMESTAMPTZ DEFAULT now(),
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Disable RLS for easy access
ALTER TABLE public.units DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tires DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips DISABLE ROW LEVEL SECURITY;

-- 3. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE units, tires, trips;

-- 5. Insert Mock Data: Units
INSERT INTO public.units (plate_id, pipe_number, location_lat, location_lng) VALUES
('GMS-01', 'P-104', 25.5428, -103.4068),
('GMS-04', 'P-108', 25.5328, -103.4168),
('GMS-09', 'P-112', 25.5528, -103.3968)
ON CONFLICT (plate_id) DO NOTHING;

-- 6. Insert Mock Data: Tires
INSERT INTO public.tires (id, unit_id, position, brand, model, depth_mm, status) VALUES
('T-101', 'GMS-01', 'LI-1', 'Michelin', 'X Multi', 12.5, 'VERDE'),
('T-102', 'GMS-01', 'RI-1', 'Michelin', 'X Multi', 3.2, 'ROJA'),
('T-103', 'GMS-04', 'LI-1', 'Bridgestone', 'M726', 8.5, 'VERDE'),
('T-104', 'GMS-04', 'RI-1', 'Bridgestone', 'M726', 5.1, 'AMARILLA')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Mock Data: Trips (Audits)
INSERT INTO public.trips (id, truck_id, driver_id, status, alert_level) VALUES
('TRP-1001', 'GMS-01', 'D-01', 'COMPLETED', 'ROJA'),
('TRP-1002', 'GMS-04', 'D-02', 'IN_PROGRESS', 'NORMAL'),
('TRP-1003', 'GMS-09', 'D-03', 'COMPLETED', 'NORMAL')
ON CONFLICT (id) DO NOTHING;
