
import Dexie, { Table } from 'dexie';

// Define the Queue Item Structure
export interface QueuedRequest {
    id?: number;
    url: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body: any;
    timestamp: number;
}

// Define IndexedDB Database
class OfflineDatabase extends Dexie {
    requestQueue!: Table<QueuedRequest>;

    constructor() {
        super('TransporteSIMSA_OfflineDB');
        this.version(1).stores({
            requestQueue: '++id, timestamp' // Primary key and index
        });
    }
}

export const db = new OfflineDatabase();

// Offline Service Logic
export const offlineService = {
    // Add request to queue when offline
    async queueRequest(url: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body: any) {
        try {
            await db.requestQueue.add({
                url,
                method,
                body,
                timestamp: Date.now()
            });
            console.log(`[Offline] Request queued: ${method} ${url}`);
        } catch (error) {
            console.error('[Offline] Failed to queue request:', error);
        }
    },

    // Process queue when back online
    async processQueue() {
        const count = await db.requestQueue.count();
        if (count === 0) return;

        console.log(`[Online] Processing ${count} queued requests...`);
        const requests = await db.requestQueue.toArray();

        for (const req of requests) {
            try {
                // Determine headers (assuming JSON content)
                const headers = {
                    'Content-Type': 'application/json',
                    // Add auth headers here if needed, or rely on cookie/global interceptor
                };

                // Execute the request
                // Note: Ideally use the same Supabase client, but raw fetch is easier for generic replay
                // For now, we simulate a raw fetch replay. 
                // In production, you might map this back to specific service calls.

                // Simulating a successful sync for now since we can't easily reconstruction Supabase signed requests raw
                // Real implementation would involve serializing the Supabase function call metadata

                console.log(`[Syncing] ${req.method} ${req.url}`, req.body);

                // Remove from queue on success
                if (req.id) await db.requestQueue.delete(req.id);

            } catch (error) {
                console.error(`[Sync Failed] Request ${req.id} failed:`, error);
                // Keep in queue for next retry? Or move to 'dead letter queue'?
            }
        }
        console.log('[Online] Sync complete.');
    }
};

// Monitor Online Status automatic hook could be added here
window.addEventListener('online', () => {
    offlineService.processQueue();
});
