export type Language = 'es' | 'en';

export const translations = {
    es: {
        sidebar: {
            dashboard: 'Dashboard Inteligente',
            command_center: 'Centro de Mando',
            approvals: 'Aprobaciones',
            gallery: 'Evidencia Forense',
            capture_tires: 'Arco de Llantas',
            capture_cabin: 'Safety Cabín',
            driver_health: 'Salud Operador',
            unit_inventory: 'Unidades / Pipas',
            tire_inventory: 'Inventario Llantas',
            map: 'Mapa Logístico',
            mobile_scan: 'Escaneo Móvil',
            emergency: 'Emergencias',
            knowledge_hub: 'Biblioteca Técnica',
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
            traffic_24h: 'Tráfico 24h',
            system_status: 'Estado del Sistema',
            forensic_audit: 'Auditoría Forense',
            efficiency: 'Eficiencia de Auditoría'
        },
        command: {
            header: 'Centro de Mando',
            status: 'Estado:',
            zone: 'Zona Actual:',
            en_route: 'En Ruta',
            stopped: 'Detenido',
            open_sector: 'Sector Abierto',
            pause: 'PAUSAR',
            play: 'REPRODUCIR',
            activate: 'ACTIVAR',
            deactivate: 'DESACTIVAR',
            ia_monitoring: 'MONITOREO IA',
            ia_audit: 'AUDITORÍA IA',
            fatigue_stress: 'Fatiga y Estrés',
            cabin_integrity: 'Integridad Cabina',
            speed: 'Velocidad',
            rpm: 'RPM',
            fuel: 'Combustible',
            temp_motor: 'Temp. Motor',
            gps_location: 'Ubicación GPS',
            odometer: 'Odómetro',
            electrical: 'Sistema Eléctrico',
            recent_alerts: 'Alertas Recientes'
        },
        approvals: {
            header_title: 'Módulo de Aprobaciones',
            header_desc: 'Gestión de bajas y cambios estructurales en la flota',
            tab_disposals: 'Bajas de Llantas',
            tab_audits: 'Auditorías (Justificaciones)',
            audit_module_title: 'Módulo de Auditorías',
            audit_module_desc: 'Aquí se procesarán los mismatches detectados por la IA que requieren justificación del operador y validación de firma.',
            approve: 'Aprobar',
            reject: 'Rechazar',
            view_evidence: 'Ver Evidencia',
            no_pending: 'No hay solicitudes pendientes'
        },
        knowledge: {
            header: 'Biblioteca Técnica',
            desc: 'Repositorio de Ingeniería IA.AGUS',
            search_placeholder: 'Buscar marcas, modelos o medidas...',
            fleet_config: 'Configuración de Flota',
            tire_catalog: 'Catálogo de Llantas',
            view_specs: 'Ver Ficha Técnica',
            download_specs: 'Descargar Ficha Técnica',
            axles: 'Ejes',
            length: 'Longitud',
            capacity: 'Capacidad',
            tires: 'Llantas',
            est_price: 'Precio Est.',
            standard_title: 'Estándar Global VISION IA PRO',
            standard_desc: 'La configuración definitiva para larga distancia. Optimización de combustible, durabilidad térmica y tracción superior.'
        },
        inventory: {
            header_units: 'Inventario de Unidades',
            desc_units: 'Gestión de Flota & Pipas',
            header_tires: 'Inventario de Llantas',
            desc_tires: 'Estado Global & Historial Forense',
            scan_plate: 'Escanear Placa',
            search_placeholder: 'Buscar Placa / Pipa...',
            filter_all: 'Todos',
            filter_active: 'Activos',
            filter_maintenance: 'Manto.',
            status_operational: 'OPERATIVO',
            status_workshop: 'TALLER',
            unit: 'Unidad',
            assigned_pipe: 'Pipa Asignada',
            last_audit: 'Última Auditoría',
            view_history: 'Ver Historial'
        },
        scan: {
            header: 'Escaneo de Unidad',
            desc: 'Captura de Identidad & Auditoría Visual'
        },
        common: {
            coming_soon: 'Próximamente...',
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            cancel: 'Cancelar',
            save: 'Guardar',
            back: 'Volver',
            search: 'Buscar'
        }
    },
    en: {
        sidebar: {
            dashboard: 'Smart Dashboard',
            command_center: 'Command Center',
            approvals: 'Approvals',
            gallery: 'Forensic Evidence',
            capture_tires: 'Tire Arch',
            capture_cabin: 'Safety Cabin',
            driver_health: 'Driver Health',
            unit_inventory: 'Units / Tankers',
            tire_inventory: 'Tire Inventory',
            map: 'Logistics Map',
            mobile_scan: 'Mobile Scan',
            emergency: 'Emergency',
            knowledge_hub: 'Technical Library',
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
            traffic_24h: '24h Traffic',
            system_status: 'System Status',
            forensic_audit: 'Forensic Audit',
            efficiency: 'Audit Efficiency'
        },
        command: {
            header: 'Command Center',
            status: 'Status:',
            zone: 'Current Zone:',
            en_route: 'En Route',
            stopped: 'Stopped',
            open_sector: 'Open Sector',
            pause: 'PAUSE',
            play: 'PLAY',
            activate: 'ACTIVATE',
            deactivate: 'DEACTIVATE',
            ia_monitoring: 'AI MONITORING',
            ia_audit: 'AI AUDIT',
            fatigue_stress: 'Fatigue & Stress',
            cabin_integrity: 'Cabin Integrity',
            speed: 'Speed',
            rpm: 'RPM',
            fuel: 'Fuel',
            temp_motor: 'Engine Temp',
            gps_location: 'GPS Location',
            odometer: 'Odometer',
            electrical: 'Electrical System',
            recent_alerts: 'Recent Alerts'
        },
        approvals: {
            header_title: 'Approval Module',
            header_desc: 'Management of disposals and structural changes in the fleet',
            tab_disposals: 'Tire Disposals',
            tab_audits: 'Audits (Justifications)',
            audit_module_title: 'Audits Module',
            audit_module_desc: 'AI-detected mismatches requiring operator justification and signature validation will be processed here.',
            approve: 'Approve',
            reject: 'Reject',
            view_evidence: 'View Evidence',
            no_pending: 'No pending requests'
        },
        knowledge: {
            header: 'Knowledge Hub',
            desc: 'IA.AGUS Technical Library',
            search_placeholder: 'Search brands, models or sizes...',
            fleet_config: 'Fleet Configuration',
            tire_catalog: 'Tire Catalog',
            view_specs: 'View Technical Sheet',
            download_specs: 'Download Tech Sheet',
            axles: 'Axles',
            length: 'Length',
            capacity: 'Capacity',
            tires: 'Tires',
            est_price: 'Est. Price',
            standard_title: 'VISION IA PRO Global Standard',
            standard_desc: 'The definitive long-distance setup. Fuel optimization, thermal durability and superior traction.'
        },
        inventory: {
            header_units: 'Unit Inventory',
            desc_units: 'Fleet & Tanker Management',
            header_tires: 'Tire Inventory',
            desc_tires: 'Global Status & Forensic History',
            scan_plate: 'Scan Plate',
            search_placeholder: 'Search Plate / Tanker...',
            filter_all: 'All',
            filter_active: 'Active',
            filter_maintenance: 'Maint.',
            status_operational: 'OPERATIONAL',
            status_workshop: 'WORKSHOP',
            unit: 'Unit',
            assigned_pipe: 'Assigned Tanker',
            last_audit: 'Last Audit',
            view_history: 'View History'
        },
        scan: {
            header: 'Unit Scanning',
            desc: 'Identity Capture & Visual Audit'
        },
        common: {
            coming_soon: 'Coming Soon...',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            save: 'Save',
            back: 'Back',
            search: 'Search'
        }
    }
};

export type TranslationKey =
    | 'sidebar.dashboard' | 'sidebar.command_center' | 'sidebar.approvals' | 'sidebar.gallery'
    | 'sidebar.capture_tires' | 'sidebar.capture_cabin' | 'sidebar.driver_health'
    | 'sidebar.unit_inventory' | 'sidebar.tire_inventory' | 'sidebar.map' | 'sidebar.mobile_scan'
    | 'sidebar.emergency' | 'sidebar.knowledge_hub' | 'sidebar.settings' | 'sidebar.logout'
    | 'sidebar.category_core' | 'sidebar.category_inventory' | 'sidebar.category_logistics' | 'sidebar.category_support'
    | 'dashboard.control_tower' | 'dashboard.fixed_gate' | 'dashboard.monitoring_desc' | 'dashboard.simulate_scan'
    | 'dashboard.gate_status' | 'dashboard.safety_cabin' | 'dashboard.protocol_desc' | 'dashboard.active'
    | 'dashboard.activity_log' | 'dashboard.view_history' | 'dashboard.utilization' | 'dashboard.tire_alerts' | 'dashboard.traffic_24h'
    | 'dashboard.system_status' | 'dashboard.forensic_audit' | 'dashboard.efficiency'
    | 'command.header' | 'command.status' | 'command.zone' | 'command.en_route' | 'command.stopped' | 'command.open_sector'
    | 'command.pause' | 'command.play' | 'command.activate' | 'command.deactivate'
    | 'command.ia_monitoring' | 'command.ia_audit' | 'command.fatigue_stress' | 'command.cabin_integrity'
    | 'command.speed' | 'command.rpm' | 'command.fuel' | 'command.temp_motor' | 'command.gps_location' | 'command.odometer' | 'command.electrical' | 'command.recent_alerts'
    | 'approvals.header_title' | 'approvals.header_desc' | 'approvals.tab_disposals' | 'approvals.tab_audits' | 'approvals.audit_module_title' | 'approvals.audit_module_desc' | 'approvals.approve' | 'approvals.reject' | 'approvals.view_evidence' | 'approvals.no_pending'
    | 'scan.header' | 'scan.desc'
    | 'knowledge.header' | 'knowledge.desc' | 'knowledge.search_placeholder' | 'knowledge.fleet_config' | 'knowledge.tire_catalog' | 'knowledge.view_specs' | 'knowledge.download_specs' | 'knowledge.axles' | 'knowledge.length' | 'knowledge.capacity' | 'knowledge.tires' | 'knowledge.est_price' | 'knowledge.standard_title' | 'knowledge.standard_desc'
    | 'inventory.header_units' | 'inventory.desc_units' | 'inventory.header_tires' | 'inventory.desc_tires'
    | 'inventory.scan_plate' | 'inventory.search_placeholder' | 'inventory.filter_all' | 'inventory.filter_active' | 'inventory.filter_maintenance'
    | 'inventory.status_operational' | 'inventory.status_workshop' | 'inventory.unit' | 'inventory.assigned_pipe' | 'inventory.last_audit' | 'inventory.view_history'
    | 'common.coming_soon' | 'common.loading' | 'common.error' | 'common.success' | 'common.cancel' | 'common.save' | 'common.back' | 'common.search';
