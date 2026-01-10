# VISION IA PRO - Tire Audit System Documentation

## 3-Level Security Architecture

### Level 1: Baseline Original (Immutable)
- **Purpose:** Factory fingerprint, registered ONCE when trailer enters fleet
- **Table:** `baselines`
- **Constraint:** `unit_id UNIQUE` (1 baseline per unit)
- **Update Policy:** Supervisor approval required with full justification

### Level 2: Daily Audits (Historical)
- **Purpose:** Historical record of every inspection
- **Table:** `audits`
- **Comparison Logic:** ALWAYS compare against Level 1 (baseline original), NOT previous audits
- **Result:** 🔴 MISMATCH or 🟢 MATCH

### Level 3: Authorized Updates
- **Trigger:** Legitimate tire change (blowout, damage)
- **Requirements:**
  - Photo of damaged tire
  - Photo of new tire installed
  - Written justification
  - Supervisor approval
- **Action:** Updates baseline original

---

## Audit Workflow

```
1. DEPARTURE (Automatic Inspection)
   ↓
   Compare with BASELINE ORIGINAL
   ↓
   Match?
   ├─ YES → 🟢 Authorized to depart
   └─ NO → 🔴 ALERT
       ↓
       Driver justification required
       ↓
       Driver takes photo: damaged tire + new tire
       ↓
       Supervisor reviews and approves
       ↓
       System updates BASELINE ORIGINAL
       ↓
       🟢 Authorized to depart

2. RETURN (Automatic Inspection)
   ↓
   Compare with BASELINE ORIGINAL
   ↓
   Match?
   ├─ YES → 🟢 All OK
   └─ NO → 🔴 ALERT (possible theft)
```

---

## Dual Tire Detection Strategy

### Problem
Interior tires in dual configurations cannot be captured by standard lateral cameras, creating a security gap.

### Solutions

#### ✅ Solution 1: Pattern Detection (ACTIVE)
- **Logic:** Dual tires ALWAYS come in pairs. System assumes interior = exterior in baseline.
- **Detection:** If exterior changed → Alert (both likely stolen)
- **Cost:** $0
- **Accuracy:** ~70%

#### ✅ Solution 2: Manual Verification (ACTIVE)
- **Trigger:** Exterior mismatch detected
- **Action:** Driver must photograph interior tires with mobile device
- **Processing:** AI analyzes uploaded photos
- **Accuracy:** ~90%

#### ⏳ Solution 3: Low-Angle Camera (FUTURE)
- **Setup:** Additional camera at ground level (30-45° angle) to capture space between dual tires
- **Cost:** $500-1000 per installation
- **Accuracy:** ~95%
- **Status:** Pending evaluation after 1 month

#### ⏳ Solution 4: TPMS Sensors (FUTURE)
- **Technology:** Tire Pressure Monitoring System with unique sensor IDs
- **Cost:** $50 per tire (~$2000 per trailer)
- **Accuracy:** 100%
- **Status:** Long-term consideration

---

## Automatic Vehicle Identification System

### Challenge
A single inspection may involve multiple units: 1 tractor + 1-2 trailers. System must automatically identify and associate tires with the correct unit.

### Multi-Unit Association

#### 1. Tractor Identification (License Plate)
- **Input:** Video frame with license plate
- **Processing:** OCR extraction (Tesseract.js or Gemini Vision) → "ABC-123"
- **Association:** Tires 1-6 → Tractor ABC-123
- **Latency:** < 500ms

#### 2. Trailer Identification (Unit Number)
- **Input:** Video frame with trailer number (painted/stenciled "PIPA-01", "PIPA-02")
- **Processing:** OCR/AI extraction → "PIPA-01"
- **Association:** 
  - Tires 7-18 → Trailer PIPA-01
  - Tires 19-30 → Trailer PIPA-02

#### 3. Spatial Segmentation (AI)
- **Detection:** AI analyzes video timeline to detect unit transitions
- **Logic:**
  - Frames 1-6 → Tractor (6 tires)
  - Frames 7-18 → Trailer 1 (12 tires)
  - Frames 19-30 → Trailer 2 (12 tires)
- **Fallback:** Manual unit selection if AI fails

---

## Enhanced Database Schema

```sql
-- Baselines (Immutable, 1 per unit)
CREATE TABLE baselines (
    id UUID PRIMARY KEY,
    unit_id TEXT UNIQUE,  -- "ABC-123" or "PIPA-01"
    unit_type TEXT,       -- "TRACTOR" or "TRAILER"
    frame_data JSONB,     -- Array of tire metadata
    created_at TIMESTAMP,
    created_by TEXT
);

-- Audits (Historical, many per unit)
CREATE TABLE audits (
    id UUID PRIMARY KEY,
    unit_id TEXT,
    unit_type TEXT,
    frame_data JSONB,
    comparison_result JSONB,  -- {matched: 10, mismatched: 2}
    requires_justification BOOLEAN,
    justification_photos TEXT[],
    justification_text TEXT,
    approved_by TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Multi-Unit Inspections
CREATE TABLE inspections (
    id UUID PRIMARY KEY,
    tractor_id TEXT,      -- "ABC-123"
    trailer_ids TEXT[],   -- ["PIPA-01", "PIPA-02"]
    audit_ids UUID[],     -- References to audits table
    created_at TIMESTAMP
);
```

---

## Implementation Status

| Feature | Status | Priority |
|---------|--------|----------|
| 3-Level Baseline System | ✅ Documented | HIGH |
| Metadata Comparison Logic | ✅ Implemented | HIGH |
| Dual Tire Pattern Detection | ✅ Documented | HIGH |
| Manual Interior Verification | 📋 Planned | HIGH |
| License Plate OCR | 📋 Planned | HIGH |
| Trailer Number OCR | 📋 Planned | HIGH |
| Spatial Segmentation | 📋 Planned | MEDIUM |
| Low-Angle Camera | ⏳ Future | LOW |
| TPMS Sensors | ⏳ Future | LOW |

---

## Next Steps

1. **Implement Database Schema** (audits table, inspections table)
2. **Add License Plate OCR** (Gemini Vision API)
3. **Add Trailer Number OCR** (Gemini Vision API)
4. **Build Supervisor Approval Interface**
5. **Implement Manual Interior Tire Upload**
6. **Test Multi-Unit Association Logic**

---

## Automated Capture Strategy (Best Shot)

### 1. Initial Registration Strategy (Onboarding)
When units pass through the arch for the first time:
1.  **Identification**: Arc detects unit ID (LPR/RFID).
2.  **Configuration Inference**: System queries fleet DB (e.g., knows "T3-S2-R4" configuration implies 34 tires).
3.  **Golden Record Creation**: System maps detected tires against expected configuration to create the initial **Level 1 Baseline**.

### 2. Capture Method: Intelligent Frame Extraction
**Core Principle**: Use High-Speed Video (60FPS+), NOT Single Photos.

1.  **Presence Detection**: Laser/Floor sensors trigger recording.
2.  **Continuous Streaming**: Cameras capture high-shutter speed video buffer.
3.  **Edge AI Processing**:
    *   **YOLO Object Detection**: Scans video stream for wheels.
    *   **Best Shot Selection**: Algorithm scores frames based on centering, focus, and lighting.
    *   **Extraction**: Only the highest-scored frame for each tire is saved.

### 3. Positional Mapping (Time-Series)
System assigns tire positions (1-36) based on temporal sequence:
1.  **Tractor Axle 1 (Steer)**: First detection event.
2.  **Tractor Axle 2/3 (Drive)**: Second cluster of detections.
3.  **Trailer Axles**: Subsequent detection clusters separated by "gap" timing.
*   **Interior Tires**: Captured via dedicated low-angle ground cameras or angled pit cameras.
