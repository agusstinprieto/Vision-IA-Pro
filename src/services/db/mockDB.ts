
import { TripData, SecurityAlert, Unit, InventoryTire, DriverStatus } from '../../types';

export const getPreviousTripData = async (tripId: string): Promise<TripData | null> => {
    // Mock simulation
    return {
        id: tripId,
        truck_id: 'TRK-402',
        driver_id: 'USR-01',
        status: 'IN_TRANSIT',
        start_time: '2025-01-02T10:00:00Z',
        alert_level: SecurityAlert.VERDE
    };
};

export const MOCK_UNITS: Unit[] = [
    { id: '1', plate_id: 'GMS-01', pipe_number: 'P-104', is_active: true, last_audit: '2025-01-05', location: { lat: 0, lng: 0 } },
    { id: '2', plate_id: 'GMS-04', pipe_number: 'P-108', is_active: true, last_audit: '2025-01-06', location: { lat: 0, lng: 0 } },
    { id: '3', plate_id: 'GMS-09', pipe_number: 'P-112', is_active: false, last_audit: '2024-12-30', location: { lat: 0, lng: 0 } },
    { id: '4', plate_id: 'GMS-15', pipe_number: 'P-120', is_active: true, last_audit: '2025-01-07', location: { lat: 0, lng: 0 } },
    { id: '5', plate_id: 'TRK-201', pipe_number: 'T-500', is_active: true, last_audit: '2025-01-04', location: { lat: 0, lng: 0 } },
    { id: '6', plate_id: 'TRK-202', pipe_number: 'T-501', is_active: true, last_audit: '2025-01-04', location: { lat: 0, lng: 0 } },
];

export const MOCK_TIRES: InventoryTire[] = [
    {
        id: 'T-101',
        unit_id: 'GMS-01',
        position: 'Front Left',
        brand: 'Michelin',
        model: 'X Multi Z',
        depth_mm: 12.5,
        status: SecurityAlert.VERDE,
        last_photo_url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=300',
        history: []
    },
    {
        id: 'T-102',
        unit_id: 'GMS-01',
        position: 'Front Right',
        brand: 'Michelin',
        model: 'X Multi Z',
        depth_mm: 12.2,
        status: SecurityAlert.VERDE,
        last_photo_url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=300',
        history: []
    },
    {
        id: 'T-103',
        unit_id: 'GMS-01',
        position: 'Rear Left Outer',
        brand: 'Bridgestone',
        model: 'M726 EL',
        depth_mm: 4.5,
        status: SecurityAlert.ROJA,
        last_photo_url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=300',
        history: []
    },
    {
        id: 'T-104',
        unit_id: 'GMS-04',
        position: 'Front Left',
        brand: 'Continental',
        model: 'HSR2',
        depth_mm: 8.0,
        status: SecurityAlert.AMARILLA,
        last_photo_url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=300',
        history: []
    }
];

export interface MockDriver {
    id: string;
    name: string;
    unit_assigned: string;
    photo_url: string;
    risk_score: number; // 0-100
    status: DriverStatus; // ALERTA, FATIGA, DISTRACCION, PELIGRO, NORMAL (Need to check types)
    metrics: {
        fatigue: number; // 0-100
        stress: number; // 0-100
        alcohol_probability: number; // 0-100
        drugs_probability: number; // 0-100
        heart_rate: number;
    };
    last_check: string;
}

export const MOCK_DRIVERS: MockDriver[] = [
    {
        id: 'D-01',
        name: 'Roberto Sanchez',
        unit_assigned: 'PR-901',
        photo_url: 'https://randomuser.me/api/portraits/men/32.jpg',
        risk_score: 92,
        status: DriverStatus.PELIGRO,
        metrics: {
            fatigue: 45,
            stress: 88,
            alcohol_probability: 85, // High probability
            drugs_probability: 12,
            heart_rate: 110
        },
        last_check: 'hace 5 min'
    },
    {
        id: 'D-02',
        name: 'Carlos Mendez',
        unit_assigned: 'PR-904',
        photo_url: 'https://randomuser.me/api/portraits/men/45.jpg',
        risk_score: 75,
        status: DriverStatus.FATIGA,
        metrics: {
            fatigue: 82, // Microsleeps detected
            stress: 30,
            alcohol_probability: 2,
            drugs_probability: 5,
            heart_rate: 72
        },
        last_check: 'hace 12 min'
    },
    {
        id: 'D-03',
        name: 'Luis Hernandez',
        unit_assigned: 'PR-910',
        photo_url: 'https://randomuser.me/api/portraits/men/22.jpg',
        risk_score: 15,
        status: DriverStatus.ALERTA, // Actually Alert/Good
        metrics: {
            fatigue: 10,
            stress: 12,
            alcohol_probability: 0,
            drugs_probability: 0,
            heart_rate: 65
        },
        last_check: 'hace 2 min'
    }
];
