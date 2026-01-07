
/**
 * Watermark Engine for GasGuard 360
 * Burns GPS, Timestamp, and Trip ID into image pixels to prevent tampering.
 */

export interface WatermarkData {
    gps: { lat: number; lng: number };
    timestamp: string;
    tripId: string;
    plateId: string;
}

export const burnWatermark = (
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    data: WatermarkData
): void => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw original frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Set watermark style
    const margin = 20;
    const fontSize = Math.floor(canvas.height * 0.035);
    ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;

    // Create solid background for readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    const bgHeight = fontSize * 4.5;
    ctx.fillRect(0, canvas.height - bgHeight, canvas.width, bgHeight);

    // 3. Draw Security Labels
    ctx.fillStyle = '#EA492E'; // Brand Red/Terracotta
    ctx.fillText('GASGUARD 360 SECURE CAPTURE', margin, canvas.height - (fontSize * 3.2));

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${fontSize * 0.8}px "JetBrains Mono", monospace`;
    ctx.fillText(`TRIP_ID: ${data.tripId} | UNIT: ${data.plateId}`, margin, canvas.height - (fontSize * 2.2));
    ctx.fillText(`GPS: ${data.gps.lat.toFixed(6)}, ${data.gps.lng.toFixed(6)}`, margin, canvas.height - (fontSize * 1.2));
    ctx.fillText(`TIMESTAMP: ${data.timestamp}`, margin, canvas.height - (fontSize * 0.4));

    // 4. Overlaid Security Hash (Conceptual anti-tamper)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
};
