export type Language = 'es' | 'en';

export const translations = {
    es: {
        sidebar: {
            dashboard: 'Dashboard Inteligente',
            capture_tires: 'Captura de Llantas',
            capture_cabin: 'Safety Cabín',
            driver_health: 'Salud Operador',
            unit_inventory: 'Unidades / Pipas',
            tire_inventory: 'Inventario Llantas',
            map: 'Mapa Logístico',
            emergency: 'Emergencias',
            settings: 'Configuración',
            logout: 'CERRAR SESIÓN',
            category_core: 'Operaciones IA',
            category_inventory: 'Inventario',
            category_logistics: 'Logística',
            category_support: 'Soporte'
        },
        dashboard: {
            control_tower: 'Control Tower',
            fixed_gate: 'Fixed Gate IA',
            monitoring_desc: 'Monitoreo automático de arcos perimetrales. Captura desatendida SIN intervención del chofer.',
            simulate_scan: 'Simular Escaneo',
            gate_status: 'Estado Arcos',
            safety_cabin: 'Safety Cabín',
            protocol_desc: 'Protocolo de Fatiga & Asalto',
            active: 'Activo',
            activity_log: 'Actividad',
            view_history: 'Ver todo el historial',
            utilization: 'Utilización Promedio',
            tire_alerts: 'Alertas Llantas',
            traffic_24h: 'Tráfico 24h'
        },
        common: {
            coming_soon: 'Próximamente...'
        }
    },
    en: {
        sidebar: {
            dashboard: 'Smart Dashboard',
            capture_tires: 'Tire Capture',
            capture_cabin: 'Safety Cabin',
            driver_health: 'Driver Health',
            unit_inventory: 'Units / Tankers',
            tire_inventory: 'Tire Inventory',
            map: 'Logistics Map',
            emergency: 'Emergency',
            settings: 'Settings',
            logout: 'LOGOUT',
            category_core: 'AI Operations',
            category_inventory: 'Inventory',
            category_logistics: 'Logistics',
            category_support: 'Support'
        },
        dashboard: {
            control_tower: 'Control Tower',
            fixed_gate: 'Fixed Gate AI',
            monitoring_desc: 'Automated perimeter gate monitoring. Unattended capture WITHOUT driver intervention.',
            simulate_scan: 'Simulate Scan',
            gate_status: 'Gate Status',
            safety_cabin: 'Safety Cabin',
            protocol_desc: 'Fatigue & Assault Protocol',
            active: 'Active',
            activity_log: 'Activity',
            view_history: 'View Full History',
            utilization: 'Avg Utilization',
            tire_alerts: 'Tire Alerts',
            traffic_24h: '24h Traffic'
        },
        common: {
            coming_soon: 'Coming Soon...'
        }
    }
};

export type TranslationKey =
    | 'sidebar.dashboard' | 'sidebar.capture_tires' | 'sidebar.capture_cabin' | 'sidebar.driver_health'
    | 'sidebar.unit_inventory' | 'sidebar.tire_inventory' | 'sidebar.map' | 'sidebar.emergency'
    | 'sidebar.settings' | 'sidebar.logout'
    | 'sidebar.category_core' | 'sidebar.category_inventory' | 'sidebar.category_logistics' | 'sidebar.category_support'
    | 'dashboard.control_tower' | 'dashboard.fixed_gate' | 'dashboard.monitoring_desc' | 'dashboard.simulate_scan'
    | 'dashboard.gate_status' | 'dashboard.safety_cabin' | 'dashboard.protocol_desc' | 'dashboard.active'
    | 'dashboard.activity_log' | 'dashboard.view_history' | 'dashboard.utilization' | 'dashboard.tire_alerts' | 'dashboard.traffic_24h';
