
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
    const fileInputRef = useRef<HTMLInputElement>(null);
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

        // Convert to Blob as JPEG for better AI compatibility
        canvas.toBlob((blob) => {
            if (blob) onCapture(blob);
        }, 'image/jpeg', 0.85);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create an image object to draw into canvas for watermarking
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                if (!canvasRef.current) return;
                const canvas = canvasRef.current;
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.drawImage(img, 0, 0);

                const mockGPS = { lat: 25.543890, lng: -103.418933 };
                const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
                const watermarkData: WatermarkData = {
                    gps: mockGPS,
                    timestamp,
                    tripId,
                    plateId
                };

                burnWatermark(canvas, img, watermarkData);
                canvas.toBlob((blob) => {
                    if (blob) onCapture(blob);
                }, 'image/jpeg', 0.85);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);

        // Reset input value so the same file can be selected again if needed
        e.target.value = '';
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
                    <div className="absolute bottom-10 md:bottom-8 left-0 right-0 px-8 flex justify-center items-center gap-6 z-[100]">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-12 h-12 md:w-14 md:h-14 bg-black/40 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all"
                            title="Subir Foto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCapture();
                            }}
                            className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full border-4 md:border-8 border-white/30 flex items-center justify-center active:scale-90 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] touch-manipulation"
                        >
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#EA492E] rounded-full shadow-inner" />
                        </button>

                        <div className="w-12 h-12 md:w-14 md:h-14" /> {/* Spacer to keep capture centered */}
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
