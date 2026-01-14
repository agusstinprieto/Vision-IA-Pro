
import { dbService } from '../db/dbService';

export interface GateEvent {
    id: string;
    timestamp: string;
    vehicle_id?: string;
    cameras: {
        id: string;
        type: 'FACE' | 'TIRE' | 'CABIN' | 'SAFETY';
        status: 'ONLINE' | 'OFFLINE';
        imageUrl: string;
        ai_result?: string;
    }[];
}

class GateService {
    private isSimulated = true;

    // Simulated Assets (using Unsplash for now, will swap with local MP4s if needed)
    private MOCK_ASSETS = {
        DRIVER: 'https://images.unsplash.com/photo-1632276536839-84cad7fd03b0?q=80&w=1000&auto=format&fit=crop',
        PASSENGER: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=2918&auto=format&fit=crop',
        TIRES: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?q=80&w=1000&auto=format&fit=crop',
        CABIN: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1000&auto=format&fit=crop'
    };

    /**
     * Triggers a full scan cycle of the gate.
     * In PROD: This sends a signal to the Edge Server to capture frames.
     * In DEV: This simulates the delay and returns mock images.
     */
    async triggerScan(): Promise<GateEvent> {
        console.log(`[GateService] Initiating Scan... (Mode: ${this.isSimulated ? 'SIMULATION' : 'LIVE'})`);

        // Simulate Network/Processing Delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        const inspectionId = `GATE-${Date.now()}`;

        // Construct the Event Object
        const event: GateEvent = {
            id: inspectionId,
            timestamp: new Date().toISOString(),
            vehicle_id: 'GMS-402',
            cameras: [
                { id: 'CAM-01', type: 'FACE', status: 'ONLINE', imageUrl: this.MOCK_ASSETS.DRIVER },
                { id: 'CAM-02', type: 'SAFETY', status: 'ONLINE', imageUrl: this.MOCK_ASSETS.PASSENGER },
                { id: 'CAM-03', type: 'TIRE', status: 'ONLINE', imageUrl: this.MOCK_ASSETS.TIRES },
                { id: 'CAM-04', type: 'CABIN', status: 'ONLINE', imageUrl: this.MOCK_ASSETS.CABIN }
            ]
        };

        // Persist to DB immediately (Audit Trail)
        await this.logEventToDB(event);

        return event;
    }

    private async logEventToDB(event: GateEvent) {
        try {
            await dbService.saveInspection({
                id: event.id,
                inspection_type: 'GATE_ENTRY',
                status: 'PROCESSING', // AI will update this later
                ai_summary: 'Gate Scan Initiated',
                image_url: event.cameras[0].imageUrl,
                vehicle_id: event.vehicle_id || 'UNKNOWN',
                created_at: event.timestamp
            });
            console.log(`[GateService] Event ${event.id} logged to DB.`);
        } catch (error) {
            console.error('[GateService] DB Log Error:', error);
            // Don't throw, we still want to return the event to UI
        }
    }
}

export const gateService = new GateService();
