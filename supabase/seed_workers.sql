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

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE workers;

-- Disable RLS (for demo purposes)
ALTER TABLE public.workers DISABLE ROW LEVEL SECURITY;

-- Clear existing data to avoid duplicates if re-running
DELETE FROM public.workers;

-- Insert Mock Seed Data
INSERT INTO public.workers (id, name, phone, unit_assigned, risk_score, status, photo_url, metrics) VALUES 
('D-01', 'Roberto Sanchez', '+52 871 123 4567', 'PR-901', 92, 'PELIGRO', 'https://randomuser.me/api/portraits/men/32.jpg', '{"heart_rate": 110, "fatigue": 85, "stress": 90, "alcohol_probability": 65, "drugs_probability": 10}'),
('D-02', 'Carlos Mendez', '+52 871 987 6543', 'PR-904', 75, 'FATIGA', 'https://randomuser.me/api/portraits/men/45.jpg', '{"heart_rate": 85, "fatigue": 75, "stress": 60, "alcohol_probability": 0, "drugs_probability": 0}'),
('D-03', 'Luis Ramirez', '+52 871 555 9999', 'PR-908', 12, 'NORMAL', 'https://randomuser.me/api/portraits/men/22.jpg', '{"heart_rate": 72, "fatigue": 10, "stress": 15, "alcohol_probability": 0, "drugs_probability": 0}');
