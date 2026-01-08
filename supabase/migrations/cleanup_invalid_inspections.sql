-- Clean up invalid inspection records
-- This removes inspections that have:
-- 1. No image URL (NULL or empty string)
-- 2. NULL vehicle_id (UUID field, so we only check for NULL)

-- Delete inspections without valid images
DELETE FROM public.inspections 
WHERE image_url IS NULL 
   OR image_url = '' 
   OR image_url = 'UNKNOWN';

-- Delete inspections with NULL vehicle_id
DELETE FROM public.inspections 
WHERE vehicle_id IS NULL;

-- Verify remaining records
SELECT COUNT(*) as total_inspections FROM public.inspections;
SELECT COUNT(*) as inspections_with_images FROM public.inspections WHERE image_url IS NOT NULL AND image_url != '';