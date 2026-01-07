
// Simulated Database for "Previous Trips"
// In production, this would fetch from Supabase/PostgreSQL

export interface PreviousInspectionData {
    unitId: string;
    timestamp: string;
    images: {
        position: string;
        url: string; // URL to the 'perfect state' reference image
    }[];
}

// We use placeholder images for the "Before" state
// Ideally these should be photos of tires with Yellow Paint Markings
const MOCK_DB: Record<string, PreviousInspectionData> = {
    'TRK-402': {
        unitId: 'TRK-402',
        timestamp: '2026-01-01T08:00:00Z',
        images: [
            { position: 'Front Left', url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?q=80&w=1000&auto=format&fit=crop' },
            { position: 'Front Right', url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?q=80&w=1000&auto=format&fit=crop' },
            { position: 'Rear Left Outer', url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?q=80&w=1000&auto=format&fit=crop' },
            { position: 'Rear Left Inner', url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?q=80&w=1000&auto=format&fit=crop' },
            { position: 'Rear Right Inner', url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?q=80&w=1000&auto=format&fit=crop' },
            { position: 'Rear Right Outer', url: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?q=80&w=1000&auto=format&fit=crop' }
        ]
    }
};

export const getPreviousTripData = async (unitId: string): Promise<PreviousInspectionData | null> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_DB[unitId] || null;
};
