-- Migration: Multi-Level Audit System
-- Description: Adds support for 3-level tire audit system with automatic vehicle identification
-- Date: 2026-01-09

-- ============================================
-- PHASE 1: Modify existing baselines table
-- ============================================

-- Add unit_type column to track if baseline is for TRACTOR or TRAILER
ALTER TABLE baselines ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'UNKNOWN';

-- Add created_by column to track who registered the baseline
ALTER TABLE baselines ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ============================================
-- PHASE 2: Create audits table
-- ============================================

-- Historical record of all tire inspections
-- Comparison is ALWAYS against original baseline, not previous audits
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id TEXT NOT NULL,
    unit_type TEXT NOT NULL,  -- 'TRACTOR' or 'TRAILER'
    frame_data JSONB NOT NULL,  -- Array of tire metadata from inspection
    comparison_result JSONB,  -- {matched: 10, mismatched: 2, total: 12}
    requires_justification BOOLEAN DEFAULT false,  -- True if any mismatches detected
    justification_photos TEXT[],  -- URLs to photos of damaged/new tires
    justification_text TEXT,  -- Driver explanation
    approved_by TEXT,  -- Supervisor who approved the change
    approved_at TIMESTAMP,  -- When supervisor approved
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PHASE 3: Create inspections table
-- ============================================

-- Multi-unit association (1 tractor + 1-2 trailers)
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tractor_id TEXT,  -- License plate (e.g., "ABC-123")
    trailer_ids TEXT[],  -- Array of trailer numbers (e.g., ["PIPA-01", "PIPA-02"])
    audit_ids UUID[],  -- References to audits table
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PHASE 4: Create indexes for performance
-- ============================================

-- Index for fast lookup of audits by unit
CREATE INDEX IF NOT EXISTS idx_audits_unit_id ON audits(unit_id);

-- Index for chronological audit queries
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);

-- Index for tractor-based inspection lookup
CREATE INDEX IF NOT EXISTS idx_inspections_tractor_id ON inspections(tractor_id);

-- ============================================
-- PHASE 5: Create tire_disposals table
-- ============================================

-- Track tire decommissioning (punctures, wear, damage, theft)
CREATE TABLE IF NOT EXISTS tire_disposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id TEXT NOT NULL,
    tire_position TEXT,  -- "Llanta 3", "Eje 2 - Derecha"
    tire_metadata JSONB,  -- {brand, model, serial_number, depth_mm} of disposed tire
    reason TEXT NOT NULL,  -- 'PUNCTURE', 'WEAR', 'DAMAGE', 'THEFT'
    photo_url TEXT NOT NULL,  -- Photo of damaged tire (evidence)
    comments TEXT,
    disposed_by TEXT,  -- User who initiated disposal
    approved_by TEXT,  -- Supervisor who approved
    approved_at TIMESTAMP,
    status TEXT DEFAULT 'PENDING',  -- 'PENDING', 'APPROVED', 'REJECTED'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for disposal history lookup
CREATE INDEX IF NOT EXISTS idx_tire_disposals_unit_id ON tire_disposals(unit_id);
CREATE INDEX IF NOT EXISTS idx_tire_disposals_status ON tire_disposals(status);
CREATE INDEX IF NOT EXISTS idx_tire_disposals_created_at ON tire_disposals(created_at DESC);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify baselines table has new columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'baselines';

-- Verify audits table created
-- SELECT * FROM audits LIMIT 1;

-- Verify inspections table created
-- SELECT * FROM inspections LIMIT 1;

-- Verify indexes created
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('audits', 'inspections');
