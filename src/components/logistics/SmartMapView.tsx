
import React, { useState } from 'react';
import { Map as MapIcon, Truck, AlertTriangle, Navigation, Locate } from 'lucide-react';
import { MOCK_UNITS } from '../../services/db/mockDB';

export const SmartMapView = () => {
    const [filterAlerts, setFilterAlerts] = useState(false);

    // Filter logic
    const visibleUnits = MOCK_UNITS.filter(u => !filterAlerts || !u.is_active); // Mock "alert" as inactive for now

    return (
        <div className="p-8 lg:p-12 h-screen flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <MapIcon className="text-brand" size={32} />
                        Mapa Logístico
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Rastreo Satelital & Geocercas</p>
                </div>

                <button
                    onClick={() => setFilterAlerts(!filterAlerts)}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border transition-all ${filterAlerts ? 'bg-red-500 text-white border-red-500' : 'bg-[#121214] text-zinc-500 border-white/10 hover:text-white'
                        }`}
                >
                    <AlertTriangle size={16} /> {filterAlerts ? 'Mostrando Alertas' : 'Filtrar Alertas'}
                </button>
            </header>

            {/* Map Container */}
            <div className="flex-1 bg-[#121214] border border-white/5 rounded-[3rem] overflow-hidden relative group">
                {/* Mock Map Background - dark styled map */}
                <div className="absolute inset-0 bg-[#0A0A0B] opacity-80"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Decorative Map Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/5 rounded-full animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] border border-white/5 rounded-full" />

                {/* Units on Map (Random positioning simulation) */}
                {visibleUnits.map((unit, i) => {
                    // Seed random positions for consistency
                    const top = 20 + (i * 15) % 60;
                    const left = 20 + (i * 25) % 60;

                    return (
                        <div
                            key={unit.id}
                            className="absolute group/pin cursor-pointer transition-all hover:z-50"
                            style={{ top: `${top}%`, left: `${left}%` }}
                        >
                            <div className={`relative flex flex-col items-center ml-6 mt-6`}>
                                <div className={`w-4 h-4 rounded-full border-2 border-[#121214] shadow-lg ${unit.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-bounce'}`} />
                                <div className="absolute top-6 opacity-0 group-hover/pin:opacity-100 transition-opacity bg-[#121214] border border-white/10 p-3 rounded-xl shadow-xl whitespace-nowrap z-10 flex flex-col items-center">
                                    <span className="text-xs font-black text-white">{unit.plate_id}</span>
                                    <span className="text-[10px] text-zinc-500 font-bold">{unit.pipe_number}</span>
                                    <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded mt-1 ${unit.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {unit.is_active ? 'En Ruta' : 'Detenido'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Map Controls */}
                <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                    <button className="bg-[#121214] p-3 rounded-xl text-white border border-white/10 hover:bg-white/5"><Locate size={20} /></button>
                    <button className="bg-[#121214] p-3 rounded-xl text-white border border-white/10 hover:bg-white/5"><Navigation size={20} /></button>
                </div>
            </div>
        </div>
    );
};
