
import { InventoryTire } from '../../types';

interface PredictionResult {
    daysRemaining: number;
    predictedReplacementDate: Date;
    wearRatePerDay: number; // mm per day
    confidence: number;
    status: 'GOOD' | 'WARNING' | 'CRITICAL';
}

const MIN_TREAD_DEPTH = 1.6; // mm (Legal limit)

export const predictTireLife = (history: InventoryTire['history']): PredictionResult | null => {
    if (history.length < 2) return null;

    // Sort history by date ascending
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate time span and wear
    const first = sortedHistory[0];
    const last = sortedHistory[sortedHistory.length - 1];

    const firstDate = new Date(first.date).getTime();
    const lastDate = new Date(last.date).getTime();
    const timeDiffDefault = 1000 * 60 * 60 * 24; // 1 day in ms

    const daysDiff = (lastDate - firstDate) / timeDiffDefault;

    if (daysDiff === 0) return null;

    const wearAmount = first.depth - last.depth;

    // Safety check: if wear is negative (tread grew?) or zero, we can't predict wear.
    // Assume minimal wear if zero for safety or return null.
    if (wearAmount <= 0) return {
        daysRemaining: 999,
        predictedReplacementDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        wearRatePerDay: 0,
        confidence: 0,
        status: 'GOOD'
    };

    const wearRate = wearAmount / daysDiff; // mm/day

    const currentDepth = last.depth;
    const remainingDepth = currentDepth - MIN_TREAD_DEPTH;

    if (remainingDepth <= 0) {
        return {
            daysRemaining: 0,
            predictedReplacementDate: new Date(),
            wearRatePerDay: wearRate,
            confidence: 1,
            status: 'CRITICAL'
        };
    }

    const daysRemaining = Math.floor(remainingDepth / wearRate);
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysRemaining);

    // Status logic
    let status: 'GOOD' | 'WARNING' | 'CRITICAL' = 'GOOD';
    if (daysRemaining < 30) status = 'CRITICAL';
    else if (daysRemaining < 90) status = 'WARNING';

    return {
        daysRemaining,
        predictedReplacementDate: predictedDate,
        wearRatePerDay: wearRate,
        confidence: 0.85, // Mock confidence
        status
    };
};

export const getTireHealthProjection = (currentDepth: number, predictedDate: Date): number[] => {
    // Generate data points for a graph: from now until predicted date
    const points: number[] = [];
    // ... logic for graph generation could go here
    return points;
};
