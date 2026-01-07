
import React, { useRef, useEffect, useState } from 'react';
import { burnWatermark, WatermarkData } from './WatermarkCanvas';

interface SecureCameraProps {
    onCapture: (blob: Blob) => void;
    tripId: string;
    plateId: string;
    active: boolean;
}

export const SecureCamera: React.FC<SecureCameraProps> = ({ onCapture, tripId, plateId, active }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (active) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [active]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Rear camera for tires
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Error al acceder a la cámara. Por favor asegúrese de dar permisos.');
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Simulate getting GPS (In a real app, this comes from a hook)
        const mockGPS = { lat: 25.543890, lng: -103.418933 };
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const watermarkData: WatermarkData = {
            gps: mockGPS,
            timestamp,
            tripId,
            plateId
        };

        // Process frame with watermark
        burnWatermark(canvas, video, watermarkData);

        // Convert to Blob
        canvas.toBlob((blob) => {
            if (blob) onCapture(blob);
        }, 'image/webp', 0.82);
    };

    return (
        <div className="relative w-full aspect-[3/4] md:aspect-video bg-black rounded-3xl overflow-hidden border-4 border-zinc-800 shadow-2xl">
            {error ? (
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-red-950/20 text-red-400">
                    <p className="font-bold uppercase tracking-widest text-xs">{error}</p>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />

                    {/* Overlay Grid / Guide */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-1/2 h-3/4 border-2 border-dashed border-white/20 rounded-[3rem]" />
                    </div>

                    {/* Secure UI Controls - Moved higher for mobile compatibility */}
                    <div className="absolute bottom-10 md:bottom-8 left-0 right-0 px-4 flex justify-center z-[100]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCapture();
                            }}
                            className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full border-4 md:border-8 border-white/30 flex items-center justify-center active:scale-90 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] touch-manipulation"
                        >
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#EA492E] rounded-full shadow-inner" />
                        </button>
                    </div>

                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live: Secure Channel</span>
                        </div>
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Unit: {plateId}</span>
                        </div>
                    </div>
                </>
            )}

            {/* Offscreen canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
