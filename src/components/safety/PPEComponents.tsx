import React from 'react';
import { AlertTriangle, CheckCircle, Smartphone, HardHat, Eye } from 'lucide-react';

// --- Types ---
export interface PPEAlert {
    id: string;
    time: string;
    zone: string;
    type: 'missing_helmet' | 'missing_vest' | 'unauthorized_zone';
    severity: 'low' | 'medium' | 'high';
    imageUrl?: string;
}

export interface ZoneStatus {
    id: string;
    name: string;
    compliance: number;
    workers: number;
    status: 'secure' | 'warning' | 'critical';
}

// --- Components ---

export const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex flex-col justify-between h-full relative group overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-blue-500/20"></div>

        <div className="flex justify-between items-start z-10">
            <div>
                <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
                <div className="text-3xl font-black text-white font-mono">{value}</div>
            </div>
            <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                <Icon size={20} />
            </div>
        </div>

        <div className="mt-4 flex items-center gap-2 z-10">
            <div className={`h-1 flex-1 rounded-full ${trend === 'up' ? 'bg-emerald-900' : 'bg-red-900'}`}>
                <div className={`h-full rounded-full ${trend === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: '70%' }}></div>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">{subtext}</span>
        </div>
    </div>
);

export const AlertRow = ({ alert }: { alert: PPEAlert }) => {
    const colors = {
        low: 'border-l-blue-500 bg-blue-500/5',
        medium: 'border-l-amber-500 bg-amber-500/5',
        high: 'border-l-red-500 bg-red-500/10'
    };

    const icons = {
        missing_helmet: <HardHat size={14} />,
        missing_vest: <AlertTriangle size={14} />,
        unauthorized_zone: <Smartphone size={14} /> // approximating distraction/phone
    };

    return (
        <div className={`flex items-center gap-3 p-3 border-l-2 ${colors[alert.severity]} border-t border-b border-r border-white/5 rounded-r-lg mb-2 hover:bg-white/5 transition-colors cursor-pointer`}>
            <div className={`p-2 rounded-full bg-black/40 border border-white/10 ${alert.severity === 'high' ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`}>
                {icons[alert.type]}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <span className="text-white text-sm font-bold truncate">
                        {alert.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{alert.time}</span>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-zinc-400 text-xs truncate">Zone: {alert.zone}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        {alert.severity}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const ZoneIndicator = ({ zone }: { zone: ZoneStatus }) => (
    <div className="group relative flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${zone.status === 'secure' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'}`}></div>
        <div className="flex flex-col">
            <span className="text-white text-xs font-bold tracking-wide group-hover:text-blue-400 transition-colors">{zone.name}</span>
            <span className="text-[9px] text-zinc-500 font-mono">PPE: {zone.compliance}% • {zone.workers} Workers</span>
        </div>
    </div>
);
