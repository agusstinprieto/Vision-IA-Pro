
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
    Truck
} from 'lucide-react';

interface DashboardViewProps {
    onNavigate: (view: string) => void;
    brandColor: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, brandColor }) => {
    const kpis = [
        { label: 'Eficiencia de Auditoría', value: '98.4%', trend: '+2.1%', icon: <Zap size={20} />, color: 'emerald' },
        { label: 'Alertas Críticas (24h)', value: '03', trend: '-15%', icon: <AlertCircle size={20} />, color: 'red' },
        { label: 'Unidades en Ruta', value: '184', trend: 'Estable', icon: <Truck size={20} />, color: 'blue' },
        { label: 'Tire Life Index', value: '7.2', trend: '-0.3', icon: <Activity size={20} />, color: 'amber' },
    ];

    const recentAudits = [
        { id: 'TX-402', unit: 'GMS-01', type: 'LLANTAS', status: 'GREEN', time: 'hace 5 min' },
        { id: 'TX-405', unit: 'GMS-04', type: 'CABINA', status: 'RED', time: 'hace 12 min' },
        { id: 'TX-409', unit: 'GMS-09', type: 'LLANTAS', status: 'GREEN', time: 'hace 25 min' },
    ];

    return (
        <div className="p-8 lg:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">

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

            </div>

        </div>
    );
};
