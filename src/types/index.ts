
export enum InspectionType {
    CHECK_IN = 'CHECK_IN',
    CHECK_OUT = 'CHECK_OUT',
    SPOT_CHECK = 'SPOT_CHECK'
}

export enum SecurityAlert {
    ROJA = 'ROJA',
    AMARILLA = 'AMARILLA',
    VERDE = 'VERDE'
}

export enum SealIntegrity {
    INTACTOS = 'INTACTOS',
    VIOLADOS = 'VIOLADOS',
    NO_VISIBLES = 'NO_VISIBLES'
}

export enum ImageCategory {
    TIRE = 'TIRE',
    SEAL = 'SEAL',
    GAUGE = 'GAUGE'
}

export interface GPSLocation {
    lat: number;
    lng: number;
}

export interface TruckConfig {
    id: string;
    plate_id: string;
    qr_code: string;
    tire_count: number;
}

export interface TripData {
    id: string;
    truck_id: string;
    driver_id: string;
    status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'FLAGGED';
    start_time: string;
    end_time?: string;
    alert_level: SecurityAlert;
}

export interface InspectionImage {
    id: string;
    inspection_id: string;
    category: ImageCategory;
    image_url: string;
    metadata: {
        tire_position?: string;
        ai_confidence?: number;
        gps: GPSLocation;
        timestamp: string;
    };
    ai_status: 'PENDING' | 'PASSED' | 'FAILED';
    ai_remarks?: string;
}

export interface ForensicAuditResult {
    tipo_inspeccion: InspectionType;
    alerta_seguridad: SecurityAlert;
    hallazgos: {
        identidad_confirmada: boolean;
        integridad_sellos: SealIntegrity;
        lectura_medidor: string;
        descripcion_anomalia: string;
    };
    razonamiento_forense: string;
}

export interface AppSettings {
    primaryColor: string;
    supervisor: {
        name: string;
        phone: string;
        email: string;
    };
    manager: {
        name: string;
        phone: string;
        email: string;
    };
}

export enum DriverStatus {
    ALERTA = 'ALERTA',
    FATIGA = 'FATIGA',
    DISTRACCION = 'DISTRACCION',
    PELIGRO = 'PELIGRO'
}

export interface CabinAuditResult {
    estado_chofer: DriverStatus;
    nivel_riesgo: SecurityAlert;
    hallazgos: {
        ojos_cerrados: boolean;
        bostezo_detectado: boolean;
        celular_en_mano: boolean;
        intruso_detectado: boolean;
        descripcion: string;
    };
    recomendacion: string;
}
