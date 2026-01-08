import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, AlertOctagon, Phone, UserX, Download, HeartPulse, Gauge, Eye, Zap, Award } from 'lucide-react';
import { dbService } from '../../services/db/dbService';
import { pdfService } from '../../services/reports/pdfService';
import { DriverStatus } from '../../types';
import { DriverScorecard } from './DriverScorecard';
import { BiometricMonitor } from './BiometricMonitor';


export const DriverHealthView = () => {
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBiometrics, setShowBiometrics] = useState(false);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const data = await dbService.getWorkers();
                setWorkers(data || []);
            } catch (error) {
                console.error('Error fetching workers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, []);

    // Sort drivers by Risk Score DESC
    const sortedDrivers = [...workers].sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand"></div>
            </div>
        );
    }

    const handleAction = (action: string, driverName: string) => {
        alert(`Acción "${action}" ejecutada para ${driverName}`);
    };

    const handleExportReport = () => {
        pdfService.generateDriverReport(workers);
    };

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorker, setNewWorker] = useState({
        id: '',
        name: '',
        phone: '',
        unit_assigned: ''
    });

    const handleCreateWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorker.id || !newWorker.name) return;

        try {
            await dbService.createWorker({
                ...newWorker,
                photo_url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60',
                risk_score: 0,
                status: DriverStatus.ALERTA, // Default
                metrics: {
                    fatigue: 0,
                    stress: 0,
                    heart_rate: 70,
                    alcohol_probability: 0,
                    drugs_probability: 0
                },
                last_check: 'Pendiente'
            });

            setShowCreateModal(false);
            setNewWorker({ id: '', name: '', phone: '', unit_assigned: '' });

            // Refresh list
            const data = await dbService.getWorkers();
            setWorkers(data || []);

            alert("Operador registrado exitosamente");
        } catch (error) {
            console.error("Error creating worker:", error);
            alert("Error al registrar operador. Verifique que el ID no esté duplicado.");
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <HeartPulse className="text-brand" size={32} />
                        Salud del Operador
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Biometría & Detección de Sustancias (IA)</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-zinc-700 transition-all hover:border-brand/50"
                    >
                        <UserX size={16} /> Nuevo Operador
                    </button>
                    <button
                        onClick={handleExportReport}
                        className="bg-brand text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(234,73,46,0.3)] hover:scale-105 transition-all"
                    >
                        <Download size={16} /> Reporte S.O.S.
                    </button>
                    <button
                        onClick={() => setShowBiometrics(true)}
                        className="bg-[#FFCC33] text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#FFCC33]/80 transition-all shadow-lg active:scale-95"
                    >
                        <Eye size={16} /> Monitoreo IA
                    </button>
                </div>
            </header>

            {/* High Priority Alerts Section */}
            {sortedDrivers.length > 0 && sortedDrivers[0].risk_score > 80 && (
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
                {sortedDrivers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <UserX size={48} className="text-zinc-600 mb-4" />
                        <h3 className="text-xl font-bold text-zinc-400 uppercase">Sin Operadores</h3>
                        <p className="text-sm text-zinc-600">No hay datos registrados en el sistema.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 text-brand hover:underline font-bold text-xs uppercase tracking-widest"
                        >
                            Registrar el primero
                        </button>
                    </div>
                ) : (
                    sortedDrivers.slice(1).map(driver => (
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
                                        <p className="text-[10px] text-zinc-500 font-bold mt-1 flex items-center gap-1">
                                            <Phone size={10} /> {driver.phone}
                                        </p>
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
                    ))
                )}
            </div>

            {/* Create Operator Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121214] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Nuevo Operador</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">
                                <UserX size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateWorker} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">ID (Nómina)</label>
                                <input
                                    type="text"
                                    required
                                    value={newWorker.id}
                                    onChange={e => setNewWorker({ ...newWorker, id: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-brand outline-none"
                                    placeholder="Ej: D-101"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={newWorker.name}
                                    onChange={e => setNewWorker({ ...newWorker, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-brand outline-none"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={newWorker.phone}
                                    onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-brand outline-none"
                                    placeholder="+52 871..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">Unidad Asignada</label>
                                <input
                                    type="text"
                                    value={newWorker.unit_assigned}
                                    onChange={e => setNewWorker({ ...newWorker, unit_assigned: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-brand outline-none"
                                    placeholder="Ej: GMS-01"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-brand text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-brand/90 transition-all mt-4"
                            >
                                Registrar Operador
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Scorecard Modal */}
            {selectedDriver && (
                <DriverScorecard
                    onClose={() => setSelectedDriver(null)}
                    stats={{
                        driverId: selectedDriver,
                        name: workers.find(d => d.id === selectedDriver)?.name || 'Unknown',
                        safetyScore: 100 - (workers.find(d => d.id === selectedDriver)?.risk_score || 0),
                        kmDriven: Math.floor(Math.random() * 10000) + 5000,
                        fatigueEvents: Math.floor((workers.find(d => d.id === selectedDriver)?.risk_score || 0) / 10),
                        perfectTrips: Math.floor(Math.random() * 50) + 10
                    }}
                />
            )}
            {/* Biometric Monitor Modal */}
            {showBiometrics && (
                <BiometricMonitor
                    onClose={() => setShowBiometrics(false)}
                />
            )}
        </div>
    );
};
