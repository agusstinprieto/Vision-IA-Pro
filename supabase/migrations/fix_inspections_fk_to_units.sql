-- Migration: Fix inspections FK to reference units instead of vehicles
-- Reason: The application uses the 'units' table as the source of truth for vehicles,
--         but the 'inspections' table was pointing to an empty 'vehicles' table.

-- Step 1: Drop the existing FK constraint
ALTER TABLE public.inspections 
DROP CONSTRAINT IF EXISTS inspections_vehicle_id_fkey;

-- Step 2: Add new FK constraint pointing to units.id
ALTER TABLE public.inspections 
ADD CONSTRAINT inspections_vehicle_id_fkey 
FOREIGN KEY (vehicle_id) 
REFERENCES public.units(id) 
ON DELETE CASCADE;

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle_id 
ON public.inspections(vehicle_id);
