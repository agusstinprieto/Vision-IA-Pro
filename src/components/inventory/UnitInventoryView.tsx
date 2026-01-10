import React, { useState, useEffect } from 'react';
import { Truck, Search, Filter, AlertTriangle, CheckCircle2, Scan } from 'lucide-react';
import { dbService } from '../../services/db/dbService';
import { Unit } from '../../types';
import { PlateScanner } from '../gate/PlateScanner';
import { useLanguage } from '../../context/LanguageContext';

export const UnitInventoryView = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'MAINTENANCE'>('ALL');
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const data = await dbService.getUnits();
                setUnits(data);
            } catch (error) {
                console.error('Error fetching units:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUnits();
    }, []);

    const filteredUnits = units.filter(unit => {
        const matchesSearch = unit.plate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.pipe_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' ? true :
            filter === 'ACTIVE' ? unit.is_active :
                !unit.is_active;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-zinc-500 font-black uppercase tracking-widest animate-pulse">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">{t('inventory.header_units')}</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{t('inventory.desc_units')}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex bg-[#121214] rounded-xl border border-white/10 p-1">
                        <button
                            onClick={() => setViewMode('GRID')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                        </button>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowScanner(true)}
                        className="flex items-center gap-2 bg-[#FFCC33] text-black px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#FFCC33]/80 transition-all shadow-lg active:scale-95"
                    >
                        <Scan size={18} />
                        <span className="hidden sm:inline">{t('inventory.scan_plate')}</span>
                    </button>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder={t('inventory.search_placeholder')}
                            className="bg-[#121214] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-white w-full sm:w-64 focus:border-brand/50 outline-none transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex p-1 bg-[#121214] rounded-xl border border-white/10">
                        {(['ALL', 'ACTIVE', 'MAINTENANCE'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {f === 'ALL' ? t('inventory.filter_all') : f === 'ACTIVE' ? t('inventory.filter_active') : t('inventory.filter_maintenance')}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content Render */}
            {viewMode === 'GRID' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredUnits.length > 0 ? (
                        filteredUnits.map(unit => (
                            <div key={unit.id} className="bg-[#121214] border border-white/5 rounded-3xl p-6 group hover:border-brand/30 transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand/5 to-transparent blur-2xl -z-0" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 text-zinc-400 group-hover:text-brand transition-colors">
                                        <Truck size={24} />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full border ${unit.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'} flex items-center gap-2`}>
                                        {unit.is_active ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">{unit.is_active ? t('inventory.status_operational') : t('inventory.status_workshop')}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">{t('inventory.unit')}</p>
                                        <h3 className="text-2xl font-black text-white tracking-tight">{unit.plate_id}</h3>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">{t('inventory.assigned_pipe')}</p>
                                        <p className="text-zinc-300 font-bold">{unit.pipe_number}</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{t('inventory.last_audit')}</p>
                                            <p className="text-xs font-mono text-zinc-400">{unit.last_audit || 'N/A'}</p>
                                        </div>
                                        <button className="text-xs font-black text-brand uppercase tracking-widest hover:underline">{t('inventory.view_history')} ↗</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <Truck size={48} className="mx-auto text-zinc-700 mb-4" />
                            <p className="text-zinc-500 font-bold">No se encontraron unidades.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900/50 text-xs font-black uppercase tracking-widest text-zinc-500 border-b border-white/5">
                                <tr>
                                    <th className="p-6">Unidad / Placa</th>
                                    <th className="p-6">Pipa</th>
                                    <th className="p-6">Estado</th>
                                    <th className="p-6">Última Auditoría</th>
                                    <th className="p-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUnits.length > 0 ? (
                                    filteredUnits.map(unit => (
                                        <tr key={unit.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/5 rounded-lg text-zinc-400">
                                                        <Truck size={16} />
                                                    </div>
                                                    <span className="font-bold text-white">{unit.plate_id}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-zinc-300 font-medium">{unit.pipe_number}</td>
                                            <td className="p-6">
                                                <div className={`inline-flex px-3 py-1 rounded-full border ${unit.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'} items-center gap-2`}>
                                                    {unit.is_active ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{unit.is_active ? 'OPERATIVO' : 'TALLER'}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 font-mono text-sm text-zinc-400">{unit.last_audit || 'N/A'}</td>
                                            <td className="p-6 text-right">
                                                <button className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">
                                                    Ver Historial
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-zinc-500 font-bold">No se encontraron resultados</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* ALPR Scanner Modal */}
            {showScanner && (
                <PlateScanner
                    onPlateDetected={(plate) => {
                        setSearchTerm(plate);
                        setShowScanner(false);
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};
