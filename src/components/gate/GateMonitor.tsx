
import React, { useState, useEffect } from 'react';
import { Shield, Zap, AlertTriangle, Truck, Video, Activity, Wifi } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { gateService } from '../../services/gate/gateService';

export const GateMonitor = () => {
    const { t } = useLanguage();
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'PROCESSING' | 'ALERT'>('IDLE');
    const [scanProgress, setScanProgress] = useState(0);
    const [lastEvent, setLastEvent] = useState<any>(null);

    // Initial Camera Configs
    const [cameras, setCameras] = useState([
        { id: 'CAM-01', name: 'Lado Conductor', type: 'FACE/SAFETY', status: 'ONLINE', imageUrl: '' },
        { id: 'CAM-02', name: 'Lado Pasajero', type: 'SAFETY', status: 'ONLINE', imageUrl: '' },
        { id: 'CAM-03', name: 'Neumáticos (Eje 1-2)', type: 'TIRE', status: 'ONLINE', imageUrl: '' },
        { id: 'CAM-04', name: 'Cabina / Carga', type: 'CABIN', status: 'ONLINE', imageUrl: '' }
    ]);

    const handleSimulateEntry = async () => {
        setIsActive(true);
        setStatus('SCANNING');
        setScanProgress(0);

        // 1. Simulate Hardware Trigger (Visual Feedback)
        const scanInterval = setInterval(() => {
            setScanProgress(prev => Math.min(prev + 5, 90));
        }, 100);

        try {
            // 2. Call Edge Server (via Service)
            const event = await gateService.triggerScan();

            clearInterval(scanInterval);
            setScanProgress(100);
            setStatus('PROCESSING');
            setLastEvent(event);

            // Update UI with captured images
            setCameras(prev => prev.map(cam => {
                const match = event.cameras.find(c => c.id === cam.id);
                return match ? { ...cam, imageUrl: match.imageUrl } : cam;
            }));

            // 3. Fake little processing delay for UX
            await new Promise(r => setTimeout(r, 1000));
            setStatus('IDLE');

            // Notification would be better as a toast, but alert works for dev
            // alert(`Inspección de Arco Completada: ${event.id}`);

        } catch (error) {
            console.error("Gate Error:", error);
            alert("Error en comunicación con Edge Server");
            setStatus('IDLE');
        } finally {
            setIsActive(false);
            setScanProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-4 lg:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className={`w-3 h-3 rounded-full ${status === 'IDLE' ? 'bg-green-500' : 'bg-brand animate-pulse'}`} />
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                            MONITOR DE ARCO <span className="text-brand">4-CAM</span>
                        </h1>
                    </div>
                    <p className="text-zinc-500 font-mono text-xs">GATE CONTROLLER: ACTIVE | ETH-LINK: 1GBPS</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                        <ZoomIndicator label="CPU" value="12%" />
                        <ZoomIndicator label="MEM" value="4.2GB" />
                        <ZoomIndicator label="GPU" value="38%" />
                        <ZoomIndicator label="TEMP" value="45°C" />
                    </div>
                    <button
                        onClick={handleSimulateEntry}
                        disabled={status !== 'IDLE'}
                        className="bg-brand hover:bg-brand-dark disabled:opacity-50 text-white px-6 py-2 rounded-lg font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                        <Zap size={18} className={status !== 'IDLE' ? 'animate-bounce' : ''} />
                        {status === 'IDLE' ? 'Simular Paso' : 'Escaneando...'}
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[70vh]">
                {cameras.map((cam, idx) => (
                    <div key={cam.id} className="relative group bg-black rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
                        {/* Camera Stream Placeholder */}
                        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                            {/* Use abstract gradients or placeholders if no video is available yet */}
                            {cam.imageUrl ? (
                                <img src={cam.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={cam.name} />
                            ) : (
                                <div className="w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=2918&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700" />
                            )}

                            {/* Simulated Scan Line */}
                            {status === 'SCANNING' && (
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/10 to-transparent animate-scan z-10" />
                            )}

                            {!cam.imageUrl && <Video className="text-zinc-700 w-16 h-16 opacity-50 absolute" />}
                        </div>

                        {/* Overlay GUI */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none z-20">
                            {/* Top Bar */}
                            <div className="flex justify-between items-start">
                                <div className="bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10">
                                    <span className="text-brand font-black text-xs uppercase tracking-widest">{cam.id}</span>
                                    <span className="text-white font-bold text-xs ml-2">{cam.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 border ${cam.status === 'ONLINE' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}>
                                        <Wifi size={10} /> {cam.status}
                                    </span>
                                </div>
                            </div>

                            {/* Bottom Bar */}
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="text-[9px] font-mono text-zinc-400 bg-black/40 px-1 rounded">RES: 4K HDR</div>
                                    <div className="text-[9px] font-mono text-zinc-400 bg-black/40 px-1 rounded">FPS: 60</div>
                                </div>
                                {status === 'SCANNING' && (
                                    <div className="bg-brand text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest animate-pulse">
                                        Detecting...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats / Telemetry Footer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <StatCard label="Vehículos Hoy" value="43" icon={<Truck />} />
                <StatCard label="Alertas Activas" value="0" icon={<AlertTriangle />} color="text-green-500" />
                <StatCard label="Velocidad Promedio" value="5 km/h" icon={<Activity />} />
                <StatCard label="Estado del Sistema" value="100% OPERATIVO" icon={<Shield />} color="text-brand" />
            </div>
        </div>
    );
};

const ZoomIndicator = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col items-center border-r last:border-0 border-white/10 pr-3 last:pr-0">
        <span className="text-[8px] font-bold text-zinc-500 uppercase">{label}</span>
        <span className="text-[10px] font-mono font-bold text-zinc-300">{value}</span>
    </div>
);

const StatCard = ({ label, value, icon, color = "text-white" }: any) => (
    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
        <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
        </div>
        <div className="text-zinc-600 opacity-50">{icon}</div>
    </div>
);
