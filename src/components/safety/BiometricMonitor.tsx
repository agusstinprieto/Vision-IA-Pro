import React, { useRef, useEffect, useState } from 'react';
import { biometricsService, BiometricResult } from '../../services/ai/biometrics';
import { driverScoringService } from '../../services/ai/driverScoring';
import { Activity, Brain, AlertTriangle } from 'lucide-react';

interface BiometricMonitorProps {
    onClose: () => void;
    externalStream?: MediaStream;
}

export const BiometricMonitor: React.FC<BiometricMonitorProps> = ({ onClose, externalStream }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [metrics, setMetrics] = useState<BiometricResult | null>(null);
    const [modelLoading, setModelLoading] = useState(true);
    const [savedResults, setSavedResults] = useState<BiometricResult[]>([]);
    const [sessionStart] = useState<Date>(new Date());
    const [messages, setMessages] = useState<Array<{ time: string; type: 'info' | 'warning' | 'error' | 'success'; text: string }>>([]);

    const addMessage = (type: 'info' | 'warning' | 'error' | 'success', text: string) => {
        const time = new Date().toLocaleTimeString();
        setMessages(prev => [{ time, type, text }, ...prev].slice(0, 50)); // Keep last 50 messages
    };

    useEffect(() => {
        const init = async () => {
            try {
                addMessage('info', '🔄 Cargando modelos de IA...');
                await biometricsService.loadModels();
                setModelLoading(false);
                addMessage('success', '✅ Modelos de IA cargados correctamente');
                startCamera();
            } catch (e) {
                console.error("Initialization error", e);
                addMessage('error', '❌ Error cargando modelos de IA');
                alert("Error cargando modelos de IA biometría");
                onClose();
            }
        };
        init();

        return () => {
            // Only cleanup camera tracks if we requested them (not using external stream)
            if (!externalStream && videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onClose]);

    const startCamera = async () => {
        try {
            // Use external stream if provided (from SimulationView)
            if (externalStream) {
                if (videoRef.current) {
                    videoRef.current.srcObject = externalStream;
                    setIsAnalyzing(true);
                    addMessage('success', '📹 Cámara conectada - Stream externo');
                    addMessage('info', '🔍 Iniciando análisis biométrico...');
                }
            } else {
                // Otherwise request camera access
                const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsAnalyzing(true);
                    addMessage('success', '📹 Cámara activada correctamente');
                    addMessage('info', '🔍 Iniciando análisis biométrico...');
                }
            }
        } catch (err) {
            console.error("Camera access denied", err);
            addMessage('error', '❌ Error al acceder a la cámara');
        }
    };

    // Analysis Loop
    useEffect(() => {
        let animationFrameId: number;
        let frameCount = 0;

        const loop = async () => {
            if (isAnalyzing && videoRef.current) {
                const result = await biometricsService.analyzeFrame(videoRef.current);
                if (result) {
                    setMetrics(result);
                    // Save results for later database storage
                    setSavedResults(prev => [...prev, result]);

                    frameCount++;

                    // Log every 30 frames (~1 second)
                    if (frameCount % 30 === 0) {
                        addMessage('info', `📊 Frame ${frameCount}: Fatiga ${result.fatigueLevel}% | Estrés ${result.stressLevel}%`);
                    }

                    // Alert on high fatigue
                    if (result.fatigueLevel > 60 && frameCount % 60 === 0) {
                        addMessage('warning', `⚠️ ALERTA: Fatiga elevada detectada (${result.fatigueLevel}%)`);
                    }

                    // Alert on high stress
                    if (result.stressLevel > 60 && frameCount % 60 === 0) {
                        addMessage('warning', `⚠️ ALERTA: Estrés elevado detectado (${result.stressLevel}%)`);
                    }

                    // Critical alert
                    if ((result.fatigueLevel > 80 || result.stressLevel > 80) && frameCount % 60 === 0) {
                        addMessage('error', `🚨 ALERTA CRÍTICA: Detener vehículo inmediatamente`);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        if (isAnalyzing) {
            loop();
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isAnalyzing]);

    const handleClose = () => {
        const sessionEnd = new Date();

        // Calculate driver evaluation
        const evaluation = driverScoringService.calculateEvaluation(
            savedResults,
            sessionStart,
            sessionEnd
        );

        console.log('📊 EVALUACIÓN DEL CONDUCTOR:', {
            'Score Final': `${evaluation.driverScore}/100`,
            'Clasificación': evaluation.classification,
            'Duración': `${evaluation.durationMinutes} minutos`,
            'Frames Analizados': evaluation.framesAnalyzed,
            'Atención': `${evaluation.attentionScore}/100`,
            'Estado de Alerta': `${evaluation.alertnessScore}/100`,
            'Control Emocional': `${evaluation.emotionalScore}/100`,
            'Cumplimiento Seguridad': `${evaluation.safetyScore}/100`,
            'Fatiga Promedio': `${evaluation.avgFatigueLevel}%`,
            'Fatiga Máxima': `${evaluation.maxFatigueLevel}%`,
            'Estrés Promedio': `${evaluation.avgStressLevel}%`,
            'Estrés Máximo': `${evaluation.maxStressLevel}%`,
            'Total Alertas': evaluation.totalAlerts,
            'Alertas Fatiga': evaluation.fatigueAlerts,
            'Alertas Estrés': evaluation.stressAlerts,
            'Alertas Críticas': evaluation.criticalAlerts,
            'Emociones': evaluation.dominantEmotions
        });

        // TODO: Save to Supabase
        // await dbService.saveDriverEvaluation(evaluation);

        // Show alert with score
        alert(`🎯 EVALUACIÓN COMPLETADA\n\nScore del Conductor: ${evaluation.driverScore}/100\nClasificación: ${evaluation.classification}\n\nRevisa la consola (F12) para ver el desglose completo.`);

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex">
            {/* Close Button */}
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-3 bg-red-600 hover:bg-red-700 rounded-full text-white z-50 shadow-2xl transition-all"
            >
                ✕
            </button>

            {/* Left Column - Video Feed */}
            <div className="w-1/2 p-6 flex flex-col">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                    <Brain className="text-[#FFCC33]" size={28} />
                    Análisis Biométrico
                </h2>

                {/* Video Container */}
                <div className="relative flex-1 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />

                    {/* Overlay Alerts */}
                    <div className="absolute top-4 left-4 right-4 space-y-2 z-10">
                        {/* DEBUG Banner */}
                        {metrics && (
                            <div className="bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-xl border border-blue-400/30 shadow-lg">
                                <p className="text-white text-xs font-mono">
                                    DEBUG: Fatiga={metrics.fatigueLevel}% | Estrés={metrics.stressLevel}% | Emoción={metrics.dominantEmotion}
                                </p>
                            </div>
                        )}

                        {/* Fatigue Alert */}
                        {metrics && metrics.fatigueLevel > 30 && (
                            <div className="bg-red-500/90 backdrop-blur-md px-4 py-3 rounded-xl border border-red-400/30 shadow-lg animate-pulse">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={24} className="text-white" />
                                    <div>
                                        <p className="text-white font-black text-lg uppercase tracking-tight">⚠️ FATIGA DETECTADA</p>
                                        <p className="text-red-100 text-xs font-bold">Nivel de fatiga: {metrics.fatigueLevel}% - Posible microsueño</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stress Alert */}
                        {metrics && metrics.stressLevel > 40 && (
                            <div className="bg-amber-500/90 backdrop-blur-md px-4 py-3 rounded-xl border border-amber-400/30 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <Activity size={24} className="text-white" />
                                    <div>
                                        <p className="text-white font-black text-lg uppercase tracking-tight">⚠️ ESTRÉS ELEVADO</p>
                                        <p className="text-amber-100 text-xs font-bold">Nivel de estrés: {metrics.stressLevel}%</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Critical Alert */}
                        {metrics && (metrics.fatigueLevel > 60 || metrics.stressLevel > 60) && (
                            <div className="bg-black/90 backdrop-blur-md px-4 py-3 rounded-xl border-2 border-red-500 shadow-2xl animate-pulse">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={28} className="text-red-500" />
                                    <div>
                                        <p className="text-red-500 font-black text-xl uppercase tracking-tight">🚨 ALERTA CRÍTICA - DETENER VEHÍCULO</p>
                                        <p className="text-red-300 text-sm font-bold">Conductor en estado peligroso</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metrics Overlay */}
                    {metrics && (
                        <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                            <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
                                <p className="text-zinc-400 text-xs font-bold uppercase">Fatiga</p>
                                <p className="text-white text-2xl font-black">{metrics.fatigueLevel}%</p>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
                                <p className="text-zinc-400 text-xs font-bold uppercase">Estrés</p>
                                <p className="text-white text-2xl font-black">{metrics.stressLevel}%</p>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
                                <p className="text-zinc-400 text-xs font-bold uppercase">Emoción</p>
                                <p className="text-white text-lg font-black capitalize">{metrics.dominantEmotion}</p>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {modelLoading && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-[#FFCC33] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-white text-lg font-bold">Cargando modelos de IA...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Messages Panel */}
            <div className="w-1/2 p-6 flex flex-col border-l border-white/10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                    <Activity className="text-emerald-500" size={28} />
                    Registro en Tiempo Real
                </h2>

                {/* Messages Feed */}
                <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-white/10 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-zinc-500">
                            <p className="text-sm">Esperando mensajes...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-lg border ${msg.type === 'error'
                                            ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                            : msg.type === 'warning'
                                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                                : msg.type === 'success'
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                    : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-mono opacity-60 mt-0.5">{msg.time}</span>
                                        <p className="text-sm font-medium flex-1">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-3">
                        <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Frames Analizados</p>
                        <p className="text-white text-2xl font-black">{savedResults.length}</p>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-3">
                        <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Mensajes</p>
                        <p className="text-white text-2xl font-black">{messages.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
