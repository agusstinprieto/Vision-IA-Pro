
import React from 'react';
import {
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    BarChart3,
    Activity,
    Zap,
    ShieldCheck,
    ShieldCheck,
    Truck,
    HeartPulse, // [NEW] Icon
    Disc // [NEW] Icon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_TIRES, MOCK_DRIVERS } from '../../services/db/mockDB';
import { SecurityAlert, DriverStatus } from '../../types';

interface DashboardViewProps {
    onNavigate: (view: string) => void;
    brandColor: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, brandColor }) => {
    const { t } = useLanguage();

    // --- Statistics Calculations ---

    // 1. Tire Stats
    const totalTires = MOCK_TIRES.length;
    const criticalTires = MOCK_TIRES.filter(t => t.status === SecurityAlert.ROJA).length;
    const warningTires = MOCK_TIRES.filter(t => t.status === SecurityAlert.AMARILLA).length;
    const avgDepth = (MOCK_TIRES.reduce((acc, t) => acc + t.depth_mm, 0) / totalTires).toFixed(1);
    const tireHealthPercentage = Math.round((MOCK_TIRES.reduce((acc, t) => acc + t.depth_mm, 0) / (totalTires * 20)) * 100); // Assuming 20mm is new

    // 2. Driver Stats
    const totalDrivers = MOCK_DRIVERS.length;
    const alertDrivers = MOCK_DRIVERS.filter(d => d.risk_score > 50 || d.metrics.alcohol_probability > 0 || d.metrics.fatigue > 50).length;
    const criticalDrivers = MOCK_DRIVERS.filter(d => d.status === DriverStatus.PELIGRO || d.status === DriverStatus.FATIGA).length;

    const kpis = [
        { label: 'Eficiencia de Auditoría', value: '98.4%', trend: '+2.1%', icon: <Zap size={20} />, color: 'emerald' },
        { label: 'Alertas Críticas (24h)', value: '03', trend: '-15%', icon: <AlertCircle size={20} />, color: 'red' },
        { label: 'Unidades en Ruta', value: '184', trend: 'Estable', icon: <Truck size={20} />, color: 'blue' },
        { label: 'Tire Life Index', value: `${avgDepth}mm`, trend: `${tireHealthPercentage}% Vida`, icon: <Activity size={20} />, color: 'amber' },
    ];

    const recentAudits = [
        { id: 'TX-402', unit: 'GMS-01', type: 'LLANTAS', status: 'GREEN', time: 'hace 5 min' },
        { id: 'TX-405', unit: 'GMS-04', type: 'CABINA', status: 'RED', time: 'hace 12 min' },
        { id: 'TX-409', unit: 'GMS-09', type: 'LLANTAS', status: 'GREEN', time: 'hace 25 min' },
    ];

    return (
        <div className="p-8 lg:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">

            {/* Welcome Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
                        Torre de <span className="text-brand">Control IA</span>
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Ecosistema Integrado de Logs & Biometría</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => onNavigate('capture-tires')}
                        className="px-6 py-3 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand/20 hover:scale-105 transition-all"
                    >
                        Nueva Auditoría
                    </button>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-[#121214] border border-white/5 p-8 rounded-[2.5rem] group hover:border-brand/20 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/5 rounded-2xl text-zinc-400 group-hover:scale-110 transition-transform">
                                {kpi.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${kpi.trend.includes('+') ? 'text-emerald-500' : kpi.trend.includes('-') ? 'text-red-500' : 'text-zinc-500'
                                }`}>
                                {kpi.trend}
                            </span>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                        <p className="text-4xl font-black tracking-tighter">{kpi.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Intelligence Panel */}
                <div className="lg:col-span-2 bg-[#121214] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 blur-[100px] pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <ShieldCheck className="text-brand" size={24} />
                                Estado de la Flota (Real-time)
                            </h3>
                            <button className="bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-colors">
                                Semanal ▾
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Bar Chart Visualization (CSS) */}
                            <div className="flex items-end justify-between h-32 gap-2">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => {
                                    // Simulated values for chart
                                    const h = [40, 65, 45, 80, 55, 30, 20][i];
                                    return (
                                        <div key={day} className="flex flex-col items-center gap-2 group w-full">
                                            <div className="w-full bg-zinc-800 rounded-t-xl relative h-full flex items-end overflow-hidden group-hover:bg-zinc-700 transition-colors">
                                                <div
                                                    style={{ height: `${h}%` }}
                                                    className={`w-full ${h > 70 ? 'bg-brand' : 'bg-zinc-600 group-hover:bg-zinc-500'} transition-all relative`}
                                                >
                                                    {h > 70 && <div className="absolute top-0 w-full h-1 bg-white/50" />}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-600 uppercase">{day}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Desgaste Promedio</p>
                                    <p className="text-2xl font-black text-white">4.2mm <span className="text-emerald-500 text-sm">(-0.1)</span></p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Auditorías 24h</p>
                                    <p className="text-2xl font-black text-white">184 <span className="text-zinc-600 text-sm">Total</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Feed */}
                <div className="bg-[#121214] border border-white/5 rounded-[3rem] p-10 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-black uppercase tracking-widest">Actividad Live</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-zinc-600">LIVE FEED</span>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto">
                        {recentAudits.map((audit, i) => (
                            <div key={i} className="flex gap-4 group p-4 rounded-3xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all">
                                <div className={`w-1 lg:w-2 h-12 rounded-full ${audit.status === 'RED' ? 'bg-red-500 shadow-[0_0_10px_#EF4444]' : 'bg-emerald-500 shadow-[0_0_10px_#10B981]'}`} />
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-tighter mb-0.5 group-hover:text-brand transition-colors">Audit ID: {audit.id}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Unit: {audit.unit} | {audit.type}</p>
                                    <p className="text-[9px] text-zinc-600 italic">{audit.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => onNavigate('tire-inventory')}
                        className="mt-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                    >
                        Explorar Historial Full ↗
                    </button>
                </div>

                {/* --- NEW SECTION: ANALYTICS WIDGETS --- */}

                {/* Tire Health Card (Expanded) */}
                <div className="lg:col-span-2 bg-[#121214] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-brand/20 transition-all relative overflow-hidden shadow-2xl shadow-brand/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] pointer-events-none" />

                    <div className="relative z-10 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3 mb-1">
                                    <Disc className="text-brand" size={28} /> Estado de Llantas
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">ANÁLISIS PREDICTIVO DE DESGASTE POR IA</p>
                            </div>
                            <span className="text-xs font-black text-zinc-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">{totalTires} Llantas Auditadas</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Vida Útil Restante (Flota)</span>
                                        <span className="text-3xl font-black text-brand">{tireHealthPercentage}%</span>
                                    </div>
                                    <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-1000"
                                            style={{ width: `${tireHealthPercentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                                        <span>Reemplazo</span>
                                        <span>Óptimo</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-red-500/5 p-4 rounded-3xl border border-red-500/10 hover:bg-red-500/10 transition-colors">
                                        <p className="text-3xl font-black text-red-500">{criticalTires}</p>
                                        <p className="text-[10px] uppercase font-black text-red-400/60 leading-tight">Alerta Crítica<br />(Urgente)</p>
                                    </div>
                                    <div className="bg-amber-500/5 p-4 rounded-3xl border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                                        <p className="text-3xl font-black text-amber-500">{warningTires}</p>
                                        <p className="text-[10px] uppercase font-black text-amber-400/60 leading-tight">Atención<br />Requerida</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Desgaste Promedio</p>
                                        <p className="text-xl font-black text-white">{avgDepth}mm</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">En Buen Estado</p>
                                        <p className="text-xl font-black text-white">{totalTires - criticalTires - warningTires}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onNavigate('tire-inventory')}
                                    className="mt-2 w-full py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand/10 hover:scale-[1.02] transition-all"
                                >
                                    Abrir Inventario Completo ↗
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Driver Health Card */}
                <div className="bg-[#121214] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-brand/20 transition-all">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                <HeartPulse className="text-brand" size={24} /> Salud Operadores
                            </h3>
                            <span className="text-xs font-black text-zinc-500 bg-white/5 px-2 py-1 rounded-lg">{totalDrivers} Activos</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-center py-4 relative">
                                {/* Simple Visualization Circle using border */}
                                <div className="w-32 h-32 rounded-full border-8 border-zinc-800 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-8 border-l-red-500 border-t-transparent border-r-transparent border-b-transparent rotate-45" />
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-white">{alertDrivers}</p>
                                        <p className="text-[8px] uppercase font-bold text-zinc-500">Alertas</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs font-bold border-t border-white/5 pt-4">
                                <span className="text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {criticalDrivers} Críticos</span>
                                <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> {totalDrivers - alertDrivers} Aptos</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('driver-health')}
                        className="mt-6 w-full py-3 bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                    >
                        Monitorear Salud
                    </button>
                </div>

            </div>

        </div>
    );
};
