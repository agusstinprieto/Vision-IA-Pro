-- SECURITY POLICIES FOR VISION IA PRO (Project: eabsbaztlrzpndaowbms)
-- Execute this script in the Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/eabsbaztlrzpndaowbms/sql

-- 1. Enable Row Level Security (RLS) on sensitive tables
ALTER TABLE public.tires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- Note: These policies allow read/write access to authenticated users.
-- You can refine these later to restrict access based on specific roles (e.g., 'admin', 'manager').

-- TIRES: Allow authenticated users to view and modify
DROP POLICY IF EXISTS "Enable access for authenticated users" ON "public"."tires";
CREATE POLICY "Enable access for authenticated users" ON "public"."tires"
AS PERMISSIVE FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- TRIPS: Allow authenticated users to view and modify
DROP POLICY IF EXISTS "Enable access for authenticated users" ON "public"."trips";
CREATE POLICY "Enable access for authenticated users" ON "public"."trips"
AS PERMISSIVE FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- UNITS: Allow authenticated users to view and modify
DROP POLICY IF EXISTS "Enable access for authenticated users" ON "public"."units";
CREATE POLICY "Enable access for authenticated users" ON "public"."units"
AS PERMISSIVE FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- WORKERS: Allow authenticated users to view and modify
DROP POLICY IF EXISTS "Enable access for authenticated users" ON "public"."workers";
CREATE POLICY "Enable access for authenticated users" ON "public"."workers"
AS PERMISSIVE FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- VEHICLES: Allow authenticated users to view and modify
DROP POLICY IF EXISTS "Enable access for authenticated users" ON "public"."vehicles";
CREATE POLICY "Enable access for authenticated users" ON "public"."vehicles"
AS PERMISSIVE FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- DAMAGE_LOGS: Allow authenticated users to view and modify
DROP POLICY IF EXISTS "Enable access for authenticated users" ON "public"."damage_logs";
CREATE POLICY "Enable access for authenticated users" ON "public"."damage_logs"
AS PERMISSIVE FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- INSPECTIONS: Allow authenticated users to view and modify
DROP POLICY IF EXISTS "Enable access for authenticated users" ON "public"."inspections";
CREATE POLICY "Enable access for authenticated users" ON "public"."inspections"
AS PERMISSIVE FOR ALL
TO public
USING (true)
WITH CHECK (true);
