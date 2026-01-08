import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, AlertTriangle, Eye, Activity, Truck, Maximize2 } from 'lucide-react';

export const SimulationView = () => {
    const roadVideoRef = useRef<HTMLVideoElement>(null);
    const cabinVideoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fatigueScore, setFatigueScore] = useState(0);
    const [speed, setSpeed] = useState(85);

    // Simulated metrics update
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            // Fluctuate speed between 80-95 km/h
            setSpeed(prev => {
                const change = (Math.random() - 0.5) * 2;
                const newSpeed = Math.min(95, Math.max(80, prev + change));
                return Number(newSpeed.toFixed(0));
            });

            // Fluctuate fatigue slightly
            setFatigueScore(prev => {
                const change = (Math.random() - 0.5) * 5;
                const newScore = Math.min(100, Math.max(0, prev + change));
                return Number(newScore.toFixed(0));
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying]);

    const togglePlayback = () => {
        if (roadVideoRef.current && cabinVideoRef.current) {
            if (isPlaying) {
                roadVideoRef.current.pause();
                cabinVideoRef.current.pause();
            } else {
                roadVideoRef.current.play();
                cabinVideoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="h-full bg-black/95 p-6 flex flex-col gap-6 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Activity className="text-blue-500 w-8 h-8" />
                        Centro de Monitoreo <span className="text-blue-500">En Vivo</span>
                    </h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest pl-11">Unidad: T-800 • Operador: Juan Pérez</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-black">Velocidad</p>
                        <p className="text-3xl font-black text-white font-mono">{speed} <span className="text-sm text-zinc-600">km/h</span></p>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-black">Nivel Fatiga</p>
                        <p className={`text-3xl font-black font-mono ${fatigueScore > 70 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {fatigueScore}%
                        </p>
                    </div>
                    <button
                        onClick={togglePlayback}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </button>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">

                {/* Road View (ADAS) */}
                <div className="relative bg-black rounded-3xl overflow-hidden border border-white/10 group">
                    <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">ADAS Frontal</span>
                    </div>

                    <video
                        ref={roadVideoRef}
                        src="/demo/road.mp4"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        loop
                        muted
                        playsInline
                    />

                    {/* AI Overlay Layer (Simulated) */}
                    {isPlaying && (
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Lane Lines */}
                            <div className="absolute bottom-0 left-[20%] w-[10%] h-[40%] border-r-2 border-emerald-500/50 skew-x-[40deg]"></div>
                            <div className="absolute bottom-0 right-[20%] w-[10%] h-[40%] border-l-2 border-emerald-500/50 -skew-x-[40deg]"></div>

                            {/* Vehicle Detection Box */}
                            <div className="absolute top-[40%] left-[45%] w-[10%] h-[10%] border-2 border-yellow-400/70 rounded-lg">
                                <div className="absolute -top-4 left-0 bg-yellow-400 text-black text-[8px] font-bold px-1">VEHICLE 98%</div>
                            </div>
                        </div>
                    )}

                    {/* Placeholder Message if no video */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="text-center">
                            <Truck className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                            <p className="text-zinc-600 text-xs uppercase font-bold">Sin señal de video (Road)</p>
                            <p className="text-zinc-700 text-[10px]">Cargar /public/demo/road.mp4</p>
                        </div>
                    </div>
                </div>

                {/* Cabin View (DMS) */}
                <div className="relative bg-black rounded-3xl overflow-hidden border border-white/10 group">
                    <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">DMS Cabina</span>
                    </div>

                    <video
                        ref={cabinVideoRef}
                        src="/demo/cabin.mp4"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale-[30%] sepia-[20%]" // Infrared look
                        loop
                        muted
                        playsInline
                    />

                    {/* AI Overlay Layer (Simulated) */}
                    {isPlaying && (
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Face Detection Box */}
                            <div className="absolute top-[30%] left-[40%] w-[20%] h-[30%] border-2 border-blue-500/50 rounded-lg">
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500/20">
                                    <div className="h-full bg-blue-500/80 w-[80%] animate-pulse"></div>
                                </div>
                                {/* Landmarks */}
                                <div className="absolute top-[30%] left-[30%] w-2 h-2 bg-green-400/80 rounded-full"></div>
                                <div className="absolute top-[30%] right-[30%] w-2 h-2 bg-green-400/80 rounded-full"></div>
                            </div>

                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-[10px] text-green-400 font-mono">
                                    EYES: OPEN
                                </div>
                                <div className="bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-[10px] text-green-400 font-mono">
                                    GAZE: CENTER
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Placeholder Message if no video */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="text-center">
                            <Eye className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                            <p className="text-zinc-600 text-xs uppercase font-bold">Sin señal de video (DMS)</p>
                            <p className="text-zinc-700 text-[10px]">Cargar /public/demo/cabin.mp4</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
