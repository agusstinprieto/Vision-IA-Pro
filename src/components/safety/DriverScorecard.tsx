
import React from 'react';
import { Award, Shield, Zap, TrendingUp, Star } from 'lucide-react';

interface DriverStats {
    driverId: string;
    name: string;
    safetyScore: number; // 0-100
    kmDriven: number;
    fatigueEvents: number;
    perfectTrips: number;
}

interface DriverScorecardProps {
    stats: DriverStats;
    onClose: () => void;
}

export const DriverScorecard: React.FC<DriverScorecardProps> = ({ stats, onClose }) => {
    // Gamification Logic
    const getBadge = (score: number) => {
        if (score >= 95) return { label: 'LEYENDA', color: 'text-yellow', bg: 'bg-yellow/10', icon: <Star fill="currentColor" /> };
        if (score >= 85) return { label: 'ELITE', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: <Award /> };
        if (score >= 70) return { label: 'PRO', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <Shield /> };
        return { label: 'ROOKIE', color: 'text-zinc-500', bg: 'bg-zinc-800', icon: <Zap /> };
    };

    const badge = getBadge(stats.safetyScore);

    return (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <div className="relative w-full max-w-2xl bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(234,73,46,0.1)]">

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 p-8 border-b border-white/5 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">Driver Scorecard</h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Evaluación de Rendimiento & Seguridad</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Main Stats Content */}
                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center gap-12">

                        {/* Score Circle */}
                        <div className="relative group">
                            <div className="w-48 h-48 rounded-full border-8 border-zinc-900 flex items-center justify-center relative z-10 bg-[#0A0A0B]">
                                <div className="text-center">
                                    <span className={`text-6xl font-black tracking-tighter block ${stats.safetyScore > 80 ? 'text-white' : 'text-red-500'}`}>
                                        {stats.safetyScore}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Safety Score</span>
                                </div>
                            </div>
                            {/* Progress Ring (Simulated with absolute div for now, or use svg) */}
                            <svg className="absolute top-0 left-0 w-48 h-48 -rotate-90 pointer-events-none">
                                <circle cx="96" cy="96" r="92" stroke="#18181b" strokeWidth="8" fill="none" />
                                <circle
                                    cx="96" cy="96" r="92"
                                    stroke={stats.safetyScore > 90 ? '#EAB308' : stats.safetyScore > 80 ? '#10B981' : '#EF4444'}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={578}
                                    strokeDashoffset={578 - (578 * stats.safetyScore) / 100}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            {/* Glow */}
                            <div className={`absolute inset-0 blur-3xl opacity-20 ${badge.bg}`} />
                        </div>

                        {/* Stats & Badge */}
                        <div className="flex-1 space-y-8 w-full">

                            {/* Badge Display */}
                            <div className={`flex items-center gap-4 p-4 rounded-2xl border border-white/5 ${badge.bg}`}>
                                <div className={`p-3 rounded-xl bg-black/20 ${badge.color}`}>
                                    {badge.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Nivel Actual</p>
                                    <h3 className={`text-2xl font-black uppercase tracking-tight ${badge.color}`}>{badge.label}</h3>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                        <TrendingUp size={14} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">KM Totales</span>
                                    </div>
                                    <p className="text-xl font-black text-white">{stats.kmDriven.toLocaleString()} KM</p>
                                </div>
                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                        <Award size={14} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Viajes Perfectos</span>
                                    </div>
                                    <p className="text-xl font-black text-white">{stats.perfectTrips}</p>
                                </div>
                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 col-span-2">
                                    <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                        <Zap size={14} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Eventos de Fatiga (Mes)</span>
                                    </div>
                                    <p className={`text-xl font-black ${stats.fatigueEvents === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {stats.fatigueEvents} <span className="text-xs text-zinc-600 font-bold ml-2">EVENTOS</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white/5 border-t border-white/5 text-center">
                    <p className="text-[10px] text-zinc-500 font-mono">IA Vision PRO &bull; Gamification Engine v1.0</p>
                </div>
            </div>
        </div>
    );
};
