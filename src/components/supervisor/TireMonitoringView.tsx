import React, { useState, useEffect } from 'react';
import { Camera, Layout, Shield, Activity, Maximize2, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CameraFeed {
    id: string;
    label: string;
    status: 'ONLINE' | 'OFFLINE' | 'ALERT';
    unitId: string;
    lastDetection: string;
}

export const TireMonitoringView = () => {
    const { t } = useLanguage();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const cameras: CameraFeed[] = [
        { id: 'CAM-L1', label: 'Tractor - Left Front', status: 'ONLINE', unitId: 'T-800', lastDetection: '2 mins ago' },
        { id: 'CAM-R1', label: 'Tractor - Right Front', status: 'ONLINE', unitId: 'T-800', lastDetection: 'Just now' },
        { id: 'CAM-L2', label: 'Trailer 1 - Left Axle 1', status: 'ONLINE', unitId: 'P-102', lastDetection: '5 mins ago' },
        { id: 'CAM-R2', label: 'Trailer 1 - Right Axle 1', status: 'ALERT', unitId: 'P-102', lastDetection: '1 min ago' },
        { id: 'CAM-L3', label: 'Trailer 1 - Left Axle 2', status: 'ONLINE', unitId: 'P-102', lastDetection: '8 mins ago' },
        { id: 'CAM-R3', label: 'Trailer 1 - Right Axle 2', status: 'ONLINE', unitId: 'P-102', lastDetection: 'Just now' },
    ];

    const refreshFeeds = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center border border-brand/20">
                            <Layout className="text-brand" size={24} />
                        </div>
                        CCTV Hub Monitoreo
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Monitoreo en tiempo real de cámaras térmicas de llantas</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={refreshFeeds}
                        className={`bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        Actualizar Feeds
                    </button>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Sistemas Operativos</span>
                    </div>
                </div>
            </header>

            {/* Camera Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.map((cam, idx) => (
                    <div key={cam.id} className="bg-zinc-900/50 border border-white/5 rounded-[2rem] overflow-hidden group hover:border-brand/30 transition-all relative">
                        {/* Feed Header */}
                        <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${cam.status === 'ONLINE' ? 'bg-emerald-500' : cam.status === 'ALERT' ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{cam.id}</span>
                            </div>
                            <button className="text-zinc-500 hover:text-white transition-colors">
                                <Maximize2 size={14} />
                            </button>
                        </div>

                        {/* Simulated Video Feed */}
                        <div className="aspect-video bg-black relative flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                            {/* Overlay info */}
                            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono text-white/70 border border-white/10 italic">
                                    {cam.label}
                                </div>
                                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono text-white/70 border border-white/10">
                                    UNIT: {cam.unitId}
                                </div>
                            </div>

                            {/* Scanline Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 bg-[length:100%_4px] animate-pulse pointer-events-none" />

                            {/* Visual Asset (Simulated) */}
                            <img
                                src={
                                    idx % 3 === 0 ? '/assets/demo/cctv_tire_steer_feed.png' :
                                        idx % 3 === 1 ? '/assets/demo/cctv_trailer_axle_feed.png' :
                                            '/assets/demo/cctv_wide_scan_feed.png'
                                }
                                className={`w-full h-full object-cover opacity-80 ${cam.status === 'ALERT' ? 'sepia hue-rotate-[320deg] saturate-200' : 'grayscale contrast-125'}`}
                                alt="Camera Feed"
                            />

                            {/* Alert Overlay */}
                            {cam.status === 'ALERT' && (
                                <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center animate-pulse">
                                    <div className="bg-red-500/80 p-2 rounded-full shadow-2xl">
                                        <AlertTriangle size={24} className="text-white" />
                                    </div>
                                </div>
                            )}

                            {/* Center Icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                <Activity className="text-brand w-12 h-12" />
                            </div>
                        </div>

                        {/* Feed Footer */}
                        <div className="p-4 bg-black/20 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Activity size={12} />
                                <span>{cam.lastDetection}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${cam.status === 'ALERT' ? 'text-red-500' : 'text-emerald-500'}`}>
                                {cam.status === 'ALERT' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                                <span>{cam.status === 'ALERT' ? 'Heat Warning' : 'Healthy'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend / System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                    <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Total Cámaras</h4>
                    <p className="text-4xl font-black">36</p>
                    <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand w-full" />
                    </div>
                </div>
                <div className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                    <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Alertas Activas</h4>
                    <p className="text-4xl font-black text-red-500">1</p>
                    <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-1/12" />
                    </div>
                </div>
                <div className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                    <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Integridad Red</h4>
                    <p className="text-4xl font-black text-emerald-500">98.2%</p>
                    <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[98%]" />
                    </div>
                </div>
            </div>
        </div>
    );
};
