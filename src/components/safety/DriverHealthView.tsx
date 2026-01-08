
import React, { useState } from 'react';
import { Activity, AlertTriangle, AlertOctagon, Phone, UserX, Download, HeartPulse, Gauge, Eye, Zap, Award } from 'lucide-react';
import { MOCK_DRIVERS } from '../../services/db/mockDB';
import { DriverStatus } from '../../types';
import { DriverScorecard } from './DriverScorecard';

export const DriverHealthView = () => {
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

    // Sort drivers by Risk Score DESC
    const sortedDrivers = [...MOCK_DRIVERS].sort((a, b) => b.risk_score - a.risk_score);

    const handleAction = (action: string, driverName: string) => {
        alert(`Acción "${action}" ejecutada para ${driverName}`);
    };

    const handleExportReport = () => {
        alert("Generando Reporte Forense de Salud (PDF)...");
    };

    return (
        <div className="p-8 lg:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <HeartPulse className="text-brand" size={32} />
                        Salud del Operador
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Biometría & Detección de Sustancias (IA)</p>
                </div>

                <button
                    onClick={handleExportReport}
                    className="bg-brand text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(234,73,46,0.3)] hover:scale-105 transition-all"
                >
                    <Download size={16} /> Reporte S.O.S.
                </button>
            </header>

            {/* High Priority Alerts Section */}
            {sortedDrivers[0].risk_score > 80 && (
                <div className="bg-red-500/10 border border-red-500 rounded-[2rem] p-8 relative overflow-hidden animate-pulse-slow">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-red-500 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                <img src={sortedDrivers[0].photo_url} alt="Driver" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap">
                                Riesgo Crítico
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight">{sortedDrivers[0].name}</h3>
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">Unidad: {sortedDrivers[0].unit_assigned}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                {sortedDrivers[0].metrics.alcohol_probability > 50 && (
                                    <span className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle size={14} /> Posible Ebriedad ({sortedDrivers[0].metrics.alcohol_probability}%)
                                    </span>
                                )}
                                {sortedDrivers[0].metrics.drugs_probability > 50 && (
                                    <span className="px-4 py-2 bg-purple-500 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        <Eye size={14} /> Pupila Dilatada
                                    </span>
                                )}
                                {sortedDrivers[0].metrics.fatigue > 70 && (
                                    <span className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        <Zap size={14} /> Microsueños Detectados
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button
                                onClick={() => handleAction('GROUND', sortedDrivers[0].name)}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors"
                            >
                                <UserX size={20} /> Bloquear Salida
                            </button>
                            <button
                                onClick={() => handleAction('MEDICAL', sortedDrivers[0].name)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors border border-white/10"
                            >
                                <Phone size={20} /> Contactar Médico
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedDrivers.slice(1).map(driver => (
                    <div key={driver.id} className="bg-[#121214] border border-white/5 rounded-3xl p-6 group hover:border-brand/20 transition-all">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                                    <img src={driver.photo_url} alt={driver.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                </div>
                                <div>
                                    <h4 className="font-black text-lg text-white leading-tight">{driver.name}</h4>
                                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md ${driver.risk_score > 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                        Riesgo: {driver.risk_score}%
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Unidad</p>
                                <p className="text-white font-mono font-bold">{driver.unit_assigned}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                <Activity size={16} className="mx-auto mb-2 text-zinc-500" />
                                <p className="text-xl font-black text-white">{driver.metrics.heart_rate}</p>
                                <p className="text-[8px] text-zinc-600 font-black uppercase">BPM</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                <Eye size={16} className="mx-auto mb-2 text-zinc-500" />
                                <p className={`text-xl font-black ${driver.metrics.fatigue > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>{driver.metrics.fatigue}%</p>
                                <p className="text-[8px] text-zinc-600 font-black uppercase">Fatiga</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                <Gauge size={16} className="mx-auto mb-2 text-zinc-500" />
                                <p className="text-xl font-black text-white">{driver.metrics.stress}%</p>
                                <p className="text-[8px] text-zinc-600 font-black uppercase">Estrés</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-[10px] text-zinc-600 font-bold">Ult. Chequeo: {driver.last_check}</span>
                            <button
                                onClick={() => setSelectedDriver(driver.id)}
                                className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline flex items-center gap-1"
                            >
                                <Award size={12} /> Ver Scorecard
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scorecard Modal */}
            {selectedDriver && (
                <DriverScorecard
                    onClose={() => setSelectedDriver(null)}
                    stats={{
                        driverId: selectedDriver,
                        name: MOCK_DRIVERS.find(d => d.id === selectedDriver)?.name || 'Unknown',
                        safetyScore: 100 - (MOCK_DRIVERS.find(d => d.id === selectedDriver)?.risk_score || 0),
                        kmDriven: Math.floor(Math.random() * 10000) + 5000,
                        fatigueEvents: Math.floor((MOCK_DRIVERS.find(d => d.id === selectedDriver)?.risk_score || 0) / 10),
                        perfectTrips: Math.floor(Math.random() * 50) + 10
                    }}
                />
            )}
        </div>
    );
};
