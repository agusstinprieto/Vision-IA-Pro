import React, { useRef, useEffect, useState } from 'react';
import { biometricsService, BiometricResult } from '../../services/ai/biometrics';
import { Activity, Brain, AlertTriangle } from 'lucide-react';

interface BiometricMonitorProps {
    onClose: () => void;
}

export const BiometricMonitor: React.FC<BiometricMonitorProps> = ({ onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [metrics, setMetrics] = useState<BiometricResult | null>(null);
    const [modelLoading, setModelLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                await biometricsService.loadModels();
                setModelLoading(false);
                startCamera();
            } catch (e) {
                console.error("Initialization error", e);
                alert("Error cargando modelos de IA biometría");
                onClose();
            }
        };
        init();

        return () => {
            // Cleanup camera tracks
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onClose]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsAnalyzing(true);
            }
        } catch (err) {
            console.error("Camera access denied", err);
        }
    };

    // Analysis Loop
    useEffect(() => {
        let animationFrameId: number;

        const loop = async () => {
            if (isAnalyzing && videoRef.current) {
                const result = await biometricsService.analyzeFrame(videoRef.current);
                if (result) {
                    setMetrics(result);
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        if (isAnalyzing) {
            loop();
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isAnalyzing]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-50 backdrop-blur-md"
            >
                ✕
            </button>

            {/* Video Feed */}
            <div className="relative w-full h-full">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                />

                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">

                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Brain className="text-brand" /> Biometría Activa
                            </h2>
                            {modelLoading ? (
                                <p className="text-zinc-400 text-xs animate-pulse">Cargando Redes Neuronales...</p>
                            ) : (
                                <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">
                                    ● Monitoreo en Tiempo Real
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Center Reticle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/20 rounded-full flex items-center justify-center">
                        <div className="w-60 h-60 border border-white/10 rounded-full animate-ping opacity-20"></div>
                        <div className="w-1 h-1 bg-brand rounded-full"></div>
                    </div>

                    {/* Metrics Footer */}
                    {metrics && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                            <div>
                                <p className="text-[10px] uppercase font-black text-zinc-500 mb-1">Estrés</p>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${metrics.stressLevel > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${metrics.stressLevel}%` }}
                                    ></div>
                                </div>
                                <p className="text-white font-mono text-xl font-bold mt-1">{metrics.stressLevel}%</p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase font-black text-zinc-500 mb-1">Fatiga</p>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${metrics.fatigueLevel > 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                        style={{ width: `${metrics.fatigueLevel}%` }}
                                    ></div>
                                </div>
                                <p className="text-white font-mono text-xl font-bold mt-1">{metrics.fatigueLevel}%</p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase font-black text-zinc-500 mb-1">Emoción Dominante</p>
                                <p className="text-white text-xl font-black uppercase">{metrics.dominantEmotion}</p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase font-black text-zinc-500 mb-1">Estado</p>
                                {(metrics.stressLevel > 70 || metrics.fatigueLevel > 70) ? (
                                    <div className="flex items-center gap-2 text-red-500 font-black uppercase animate-pulse">
                                        <AlertTriangle size={20} /> ALERTA
                                    </div>
                                ) : (
                                    <div className="text-emerald-500 font-black uppercase">NORMAL</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
