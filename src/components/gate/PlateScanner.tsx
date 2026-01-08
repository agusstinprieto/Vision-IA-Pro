import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';
import { ocrService } from '../../services/ai/ocr';

interface PlateScannerProps {
    onPlateDetected: (plate: string) => void;
    onClose: () => void;
}

export const PlateScanner: React.FC<PlateScannerProps> = ({ onPlateDetected, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [scannedText, setScannedText] = useState<string | null>(null);

    // Camera setup
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera Error:", err);
                alert("No se pudo acceder a la cámara. Verifique permisos.");
                onClose();
            }
        };

        if (isScanning) {
            startCamera();
        }

        return () => {
            // Cleanup: Stop all tracks
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isScanning, onClose]);

    // OCR Scanning Loop
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const scanFrame = async () => {
            if (!videoRef.current || !canvasRef.current || !isScanning) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) return;

            // Draw current video frame to canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to base64
            const dataUrl = canvas.toDataURL('image/jpeg');

            try {
                const plate = await ocrService.recognizePlate(dataUrl);
                if (plate) {
                    setScannedText(plate);
                    setIsScanning(false); // Stop scanning on first match

                    // Small delay to show user the result before closing
                    setTimeout(() => {
                        onPlateDetected(plate);
                    }, 1500);
                }
            } catch (e) {
                // Ignore errors and keep scanning
            }
        };

        if (isScanning) {
            // Scan every 2 seconds to avoid freezing UI
            intervalId = setInterval(scanFrame, 2000);
        }

        return () => clearInterval(intervalId);
    }, [isScanning, onPlateDetected]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-50"
            >
                <X size={32} />
            </button>

            {/* Overlay UI */}
            <div className="absolute top-0 w-full p-8 text-center z-40 bg-gradient-to-b from-black/80 to-transparent">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Escáner de <span className="text-[#FFCC33]">Placas</span>
                </h2>
                <p className="text-zinc-400 text-sm mt-2">Apunte la cámara a la matrícula del vehículo</p>
            </div>

            {/* Video Feed */}
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover opacity-80"
                />

                {/* Visual Guide Box */}
                <div className="absolute w-[80%] max-w-sm aspect-[3/1] border-4 border-[#FFCC33] rounded-xl shadow-[0_0_50px_rgba(255,204,51,0.3)] anim-pulse-border flex items-center justify-center">
                    {!isScanning && scannedText && (
                        <div className="bg-black/80 px-4 py-2 rounded-lg">
                            <span className="text-2xl font-black text-white uppercase tracking-widest font-mono">
                                {scannedText}
                            </span>
                        </div>
                    )}
                    {isScanning && (
                        <div className="w-full h-0.5 bg-red-500 absolute top-1/2 animate-scan-line"></div>
                    )}
                </div>
            </div>

            {/* Hidden Canvas for OCR */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Footer Status */}
            <div className="absolute bottom-12 w-full text-center">
                {isScanning ? (
                    <div className="flex items-center justify-center gap-2 text-zinc-400 animate-pulse">
                        <RefreshCw className="animate-spin" size={20} />
                        <span className="uppercase text-xs font-bold tracking-widest">Escaneando Inteligente...</span>
                    </div>
                ) : (
                    <div className="text-[#FFCC33] font-black uppercase tracking-widest text-lg">
                        ¡Placa Detectada!
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scan-line {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan-line {
                    animation: scan-line 2s linear infinite;
                }
            `}</style>
        </div>
    );
};
