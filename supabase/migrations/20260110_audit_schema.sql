-- Baselines (Immutable, 1 per unit)
CREATE TABLE IF NOT EXISTS baselines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id TEXT NOT NULL UNIQUE,  -- "ABC-123" or "PIPA-01"
    unit_type TEXT CHECK (unit_type IN ('TRACTOR', 'TRAILER')),
    frame_data JSONB NOT NULL,     -- Array of tire metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by TEXT
);

-- Audits (Historical, many per unit)
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id TEXT NOT NULL,
    unit_type TEXT CHECK (unit_type IN ('TRACTOR', 'TRAILER')),
    frame_data JSONB NOT NULL,
    comparison_result JSONB,  -- {matched: 10, mismatched: 2}
    requires_justification BOOLEAN DEFAULT false,
    justification_photos TEXT[],
    justification_text TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Multi-Unit Inspections
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tractor_id TEXT,      -- "ABC-123"
    trailer_ids TEXT[],   -- ["PIPA-01", "PIPA-02"]
    audit_ids UUID[],     -- References to audits table
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_baselines_unit ON baselines(unit_id);
CREATE INDEX IF NOT EXISTS idx_audits_unit ON audits(unit_id);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
