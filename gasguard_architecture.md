# GasGuard 360: Project Structure

```text
gasguard-360-pro/
├── public/
│   ├── assets/
│   │   ├── icons/          # Dashboard & Alert icons
│   │   └── models/         # TFLite or local AI models
│   └── sw.js               # Service Worker for Offline-First
├── src/
│   ├── components/
│   │   ├── camera/
│   │   │   ├── SecureCamera.tsx      # Multi-platform camera lock
│   │   │   └── WatermarkCanvas.ts    # GPS/Time pixel burn logic
│   │   ├── inspection/
│   │   │   ├── TireScanner.tsx       # 360 workflow
│   │   │   └── SealValidator.tsx     # Valve/Seal check
│   │   └── common/
│   │       ├── NetworkIndicator.tsx  # Sync status
│   │       └── Card.tsx              # Industrial UI design
│   ├── services/
│   │   ├── ai/
│   │   │   ├── gemini.ts             # AI Studio integration
│   │   │   └── ocr.ts                # Rotogauge extraction
│   │   ├── db/
│   │   │   ├── schema.sql            # Supabase definition
│   │   │   └── offline.ts            # IndexedDB synchronization
│   │   └── auth/
│   │       └── supabase.ts           # Supabase client
│   ├── types/
│   │   └── index.ts                  # Shared TS definitions
│   ├── hooks/
│   │   └── useSync.ts                # Background sync hook
│   ├── App.tsx                       # Main entry & Navigation
│   └── index.tsx                     # React hydration
├── .env.example
├── package.json
└── tsconfig.json
```

# Schema Sugerido (Supabase/Postgres)

```sql
-- Gestión de Camiones y Flotas
CREATE TABLE trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_id TEXT UNIQUE NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    tire_count INTEGER DEFAULT 6,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Viajes y Logística
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_id UUID REFERENCES trucks(id),
    driver_id UUID REFERENCES auth.users(id),
    status TEXT CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'FLAGGED')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    alert_level TEXT DEFAULT 'GREEN'
);

-- Inspecciones (Múltiples por viaje: Inicio/Parada/Fin)
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id),
    type TEXT CHECK (type IN ('CHECK_IN', 'CHECK_OUT', 'SPOT_CHECK')),
    gps_lat DOUBLE PRECISION,
    gps_long DOUBLE PRECISION,
    rotogauge_value DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Imágenes de Inspección (Almacenamiento y Análisis IA)
CREATE TABLE inspection_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES inspections(id),
    category TEXT CHECK (category IN ('TIRE', 'SEAL', 'GAUGE')),
    image_url TEXT NOT NULL,
    metadata JSONB, -- {tire_position: 'rear_left_1', ai_confidence: 0.98}
    ai_status TEXT DEFAULT 'PENDING', -- PENDING, PASSED, FAILED
    ai_remarks TEXT
);
```

# Controlador de Cámara Seguro (Pseudocódigo TypeScript)

```typescript
/**
 * GasGuard SecureCamera Controller
 * Constraints:
 * 1. Disallows Gallery Picker (no <input type="file">)
 * 2. Mandatory Real-time Watermarking
 * 3. EXIF Validation
 */

interface CaptureMetadata {
  gps: { lat: number; lng: number };
  timestamp: string;
  tripId: string;
}

export class SecureCamera {
  private videoStream: MediaStream | null = null;

  async initialize(videoElement: HTMLVideoElement) {
    // Only Live Stream - No Gallery
    this.videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 1280, height: 720 },
      audio: false
    });
    videoElement.srcObject = this.videoStream;
    videoElement.play();
  }

  async captureWithWatermark(canvas: HTMLCanvasElement, metadata: CaptureMetadata): Promise<Blob> {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context failed");

    // 1. Draw frame from Video Stream
    ctx.drawImage(videoElement, 0, 0);

    // 2. Burn Metadata into Pixels (Anti-tamper layer)
    ctx.font = '24px JetBrains Mono';
    ctx.fillStyle = 'rgba(255, 73, 46, 0.8)'; // Brand Red
    ctx.fillText(`TRIP_${metadata.tripId}`, 20, 40);
    ctx.fillText(metadata.timestamp, 20, 80);
    ctx.fillText(`${metadata.gps.lat}, ${metadata.gps.lng}`, 20, 120);

    // 3. Return as Compressed WebP
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.8);
    });
  }
}
```
