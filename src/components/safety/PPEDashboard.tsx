import React, { useState, useEffect } from 'react';
import { LayoutGrid, Map as MapIcon, Shield, Users, Activity, Bell, Maximize2, GitGraph } from 'lucide-react';
import { StatCard, AlertRow, PPEAlert, ZoneIndicator, ZoneStatus } from './PPEComponents';
import { SimulationView } from './SimulationView'; // Reusing the connection to existing simulation logic if needed, but for now we build a new view.

export const PPEDashboard = () => {
    const [activeTab, setActiveTab] = useState<'live' | 'map'>('live');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Mock Data
    const [alerts, setAlerts] = useState<PPEAlert[]>([
        { id: '1', time: '10:42:15', zone: 'Zone A - Welding', type: 'missing_helmet', severity: 'high' },
        { id: '2', time: '10:41:05', zone: 'Zone B - Assembly', type: 'missing_vest', severity: 'medium' },
        { id: '3', time: '10:35:50', zone: 'Zone C - Logistics', type: 'unauthorized_zone', severity: 'low' },
    ]);

    const [zones, setZones] = useState<ZoneStatus[]>([
        { id: '1', name: 'Welding Sector', compliance: 85, workers: 12, status: 'warning' },
        { id: '2', name: 'Assembly Line', compliance: 98, workers: 45, status: 'secure' },
        { id: '3', name: 'Logistics Dock', compliance: 92, workers: 8, status: 'secure' },
        { id: '4', name: 'Chemical Storage', compliance: 100, workers: 3, status: 'secure' },
    ]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-screen w-full bg-black text-white overflow-hidden flex flex-col font-sans selection:bg-blue-500/30">
            {/* TOP BAR / HUD */}
            <header className="h-14 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-blue-500">
                        <Shield className="w-6 h-6" />
                        <h1 className="text-xl font-black tracking-tighter uppercase italic">
                            SENTINEL <span className="text-white not-italic font-light">VISION</span>
                        </h1>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <nav className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setActiveTab('live')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'live' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <LayoutGrid size={14} /> Live Monitor
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <MapIcon size={14} /> Geo-Map
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">System Status</p>
                        <div className="flex items-center justify-end gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-emerald-400">ONLINE • 99.9% UPTIME</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="text-right">
                        <p className="text-2xl font-mono font-black leading-none">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase text-right">{currentTime.toLocaleDateString()}</p>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 p-4 grid grid-cols-12 gap-4 min-h-0 overflow-hidden relative">

                {/* BACKGROUND DECORATIONS */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-blue-900/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

                {/* LEFT COLUMN: STATS (3 cols) */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="h-32 shrink-0">
                        <StatCard
                            title="Overall Compliance"
                            value="94.2%"
                            subtext="+2.4% vs last week"
                            icon={Shield}
                            trend="up"
                        />
                    </div>
                    <div className="h-32 shrink-0">
                        <StatCard
                            title="Active Workers"
                            value="142"
                            subtext="Shift B • Full Capacity"
                            icon={Users}
                            trend="up"
                        />
                    </div>

                    {/* ZONE STATUS LIST */}
                    <div className="flex-1 bg-zinc-900/40 backdrop-blur border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <GitGraph size={14} /> Zone Status
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {zones.map(zone => (
                                <ZoneIndicator key={zone.id} zone={zone} />
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5">
                            <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-3 rounded-lg border border-blue-500/20">
                                <p className="text-[10px] text-blue-300 font-mono mb-1">AI INSIGHT</p>
                                <p className="text-xs text-blue-100 leading-relaxed">
                                    Helmet compliance in <strong>Welding Sector</strong> has dropped by 5% in the last hour. Recommend supervisor inspection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE COLUMN: MAIN VIEW (6 cols) */}
                <div className="col-span-6 flex flex-col gap-4 relative">
                    {/* MAIN VIEWPORT FRAME */}
                    <div className="flex-1 bg-black rounded-2xl border border-white/10 relative overflow-hidden group shadow-2xl">

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-blue-500 rounded-tl-lg z-20"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-blue-500 rounded-tr-lg z-20"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-blue-500 rounded-bl-lg z-20"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-blue-500 rounded-br-lg z-20"></div>

                        {/* CONTENT SWITCHER */}
                        {activeTab === 'live' ? (
                            <div className="w-full h-full relative p-1 bg-zinc-900/50">
                                {/* 2x2 GRID OF CAMERAS */}
                                <div className="grid grid-cols-2 h-full gap-1">
                                    {/* SIMULATED FEED 1 */}
                                    <div className="relative bg-black overflow-hidden rounded-lg group/cam">
                                        <img src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover/cam:opacity-80 transition-opacity" alt="Factory 1" />
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[9px] font-mono text-white border border-white/10">CAM-01 • WELDING</div>

                                        {/* AI OVERLAY BOX (Fake) */}
                                        <div className="absolute top-[30%] left-[40%] w-[100px] h-[150px] border border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                            <div className="absolute -top-4 left-0 bg-emerald-500 text-black text-[8px] font-bold px-1">HELMET: OK (99%)</div>
                                        </div>
                                    </div>

                                    {/* SIMULATED FEED 2 */}
                                    <div className="relative bg-black overflow-hidden rounded-lg group/cam">
                                        <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover/cam:opacity-80 transition-opacity" alt="Factory 2" />
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[9px] font-mono text-white border border-white/10">CAM-02 • ASSEMBLY</div>
                                        <div className="absolute top-[40%] right-[30%] w-[120px] h-[180px] border border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse">
                                            <div className="absolute -top-4 left-0 bg-red-500 text-white text-[8px] font-bold px-1">VEST: MISSING</div>
                                        </div>
                                    </div>

                                    {/* SIMULATED FEED 3 */}
                                    <div className="relative bg-black overflow-hidden rounded-lg group/cam">
                                        <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover/cam:opacity-80 transition-opacity" alt="Factory 3" />
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[9px] font-mono text-white border border-white/10">CAM-03 • LOGISTICS</div>
                                    </div>

                                    {/* SIMULATED FEED 4 */}
                                    <div className="relative bg-black overflow-hidden rounded-lg group/cam">
                                        <img src="https://images.unsplash.com/photo-1531297461136-82lw9z0b0q9s?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover/cam:opacity-80 transition-opacity" alt="Factory 4" />
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[9px] font-mono text-white border border-white/10">CAM-04 • STORAGE</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative">
                                {/* Placeholder Map */}
                                <div className="w-[90%] h-[90%] border border-white/10 rounded-xl relative opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert grayscale opacity-20"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-zinc-500 font-mono text-sm">INTERACTIVE MAP MODULE</p>
                                </div>

                                {/* Map Pins */}
                                <div className="absolute top-[30%] left-[30%] w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-ping"></div>
                                <div className="absolute top-[30%] left-[30%] w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>

                                <div className="absolute bottom-[40%] right-[35%] w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse"></div>
                                <div className="absolute bottom-[40%] right-[35%] w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: ALERTS & NOTIFICATIONS (3 cols) */}
                <div className="col-span-3 flex flex-col gap-4">
                    <div className="flex-1 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-xl flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <Bell size={14} className="text-blue-500" /> Live Violations
                            </h3>
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{alerts.length}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                            {alerts.map(alert => (
                                <AlertRow key={alert.id} alert={alert} />
                            ))}
                            {alerts.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                                    <CheckCircle size={32} className="mb-2 opacity-50" />
                                    <p className="text-xs">All Clear</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="h-48 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-xl p-4">
                        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg text-xs font-bold transition-colors">
                                Broadcast Alert
                            </button>
                            <button className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg text-xs font-bold transition-colors">
                                Export Report
                            </button>
                            <button className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg text-xs font-bold transition-colors col-span-2 flex items-center justify-center gap-2">
                                <Maximize2 size={12} /> Full Screen Mode
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
