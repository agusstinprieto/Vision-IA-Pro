import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle2, History, AlertOctagon, Download, Trash2 } from 'lucide-react';
import { dbService } from '../../services/db/dbService';
import { pdfService } from '../../services/reports/pdfService';
import { SecurityAlert, InventoryTire, UserRole } from '../../types';
import { predictTireLife } from '../../services/ai/predictive';
import { TireDisposalModal } from './TireDisposalModal';
import { AddTireModal } from './AddTireModal';
import { useLanguage } from '../../context/LanguageContext';

interface TireInventoryViewProps {
    userRole?: UserRole;
}
// ... (existing imports)

export const TireInventoryView: React.FC<TireInventoryViewProps> = ({ userRole = 'EMPLOYEE' }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'GOOD'>('ALL');
    const [tires, setTires] = useState<InventoryTire[]>([]);
    const [loading, setLoading] = useState(true);
    const [disposalModalOpen, setDisposalModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedTire, setSelectedTire] = useState<InventoryTire | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Skeleton Component
    const TireSkeleton = () => (
        <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-full bg-zinc-800" />
                <div className="w-6 h-6 rounded bg-zinc-800" />
            </div>
            <div className="space-y-2">
                <div className="h-6 bg-zinc-800 rounded w-1/2" />
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
            </div>
            <div className="h-20 bg-black/40 rounded-xl border border-white/5" />
        </div>
    );

    // Memoized Tire Card for performance
    const TireCard = React.memo(({ tire, onDisposal }: { tire: InventoryTire, onDisposal: (t: InventoryTire) => void }) => {
        const { t } = useLanguage();
        return (
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 group hover:border-brand/30 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4">
                    {tire.status === SecurityAlert.ROJA && <AlertOctagon className="text-red-500 animate-pulse" size={24} />}
                    {tire.status === SecurityAlert.AMARILLA && <AlertTriangle className="text-amber-500" size={24} />}
                    {tire.status === SecurityAlert.VERDE && <CheckCircle2 className="text-emerald-500" size={24} />}
                </div>

                <div className="mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 mb-4 bg-zinc-900 flex items-center justify-center">
                        <img
                            src={tire.last_photo_url}
                            alt="Tire"
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%3E%3Crect%20fill%3D%22%23222%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23444%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%3ENO%20IMG%3C%2Ftext%3E%3C%2Fsvg%3E';
                            }}
                        />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">{tire.brand} <span className="text-zinc-500 text-sm font-medium">{tire.model}</span></h3>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Unidad: {tire.unit_id} &bull; {tire.position}</p>
                </div>

                <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Profundidad</span>
                        <span className={`text-lg font-black ${tire.depth_mm < 5 ? 'text-red-500' : tire.depth_mm < 9 ? 'text-amber-500' : 'text-white'
                            }`}>{tire.depth_mm} mm</span>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-brand tracking-widest uppercase">Forensic ID (DOT)</p>
                        <p className="text-xs font-mono text-zinc-300 bg-white/5 p-1 px-2 rounded border border-white/5 truncate">{tire.serial_number || 'N/A'}</p>
                    </div>

                    {tire.tire_damage && tire.tire_damage !== 'Ninguno' && (
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <AlertTriangle size={10} /> Daños Críticos
                            </p>
                            <p className="text-[10px] text-zinc-400 leading-tight">{tire.tire_damage}</p>
                        </div>
                    )}

                    {tire.rim_fingerprint && (
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Huella Digital del Rin</p>
                            <p className="text-[10px] text-zinc-400 italic line-clamp-2">{tire.rim_fingerprint}</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[9px] font-black uppercase text-brand tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse"></span>
                            Vision IA Pro Brain Prediction
                        </p>
                        {(() => {
                            const prediction = predictTireLife(tire.history);
                            if (!prediction) return <p className="text-[10px] text-zinc-600 italic">Insuficientes datos históricos</p>;

                            const lifePercent = Math.max(0, Math.min(100, (prediction.daysRemaining / 365) * 100));

                            return (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-bold text-zinc-400">Reemplazo Est.</span>
                                        <span className={`text-xs font-black ${prediction.status === 'CRITICAL' ? 'text-red-500' : prediction.status === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            {prediction.daysRemaining} Días
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${prediction.status === 'CRITICAL' ? 'bg-red-500' : prediction.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${lifePercent}%` }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-zinc-600 font-mono text-right">{prediction.predictedReplacementDate.toLocaleDateString()}</p>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center gap-2">
                    <button className="text-xs font-black text-brand uppercase tracking-widest hover:underline flex items-center gap-1">
                        <History size={12} /> {t('inventory.view_history')}
                    </button>
                    <button
                        onClick={() => onDisposal(tire)}
                        className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Baja
                    </button>
                </div>
            </div>
        );
    });

    useEffect(() => {
        const fetchInitialTires = async () => {
            try {
                const { tires: data, hasMore: more } = await dbService.getTires(0, 12);
                setTires(data);
                setHasMore(more);
            } catch (error) {
                console.error('Error fetching tires:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialTires();
    }, []);

    const fetchMoreTires = async () => {
        if (!hasMore || isFetchingMore) return;
        setIsFetchingMore(true);
        try {
            const nextPage = page + 1;
            const { tires: newData, hasMore: more } = await dbService.getTires(nextPage, 12);
            setTires(prev => [...prev, ...newData]);
            setPage(nextPage);
            setHasMore(more);
        } catch (error) {
            console.error('Error fetching more tires:', error);
        } finally {
            setIsFetchingMore(false);
        }
    };

    const filteredTires = React.useMemo(() => {
        return tires.filter(tire => {
            const matchesSearch = tire.unit_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tire.brand.toLowerCase().includes(searchTerm.toLowerCase());

            const statusMatch = statusFilter === 'ALL' ? true :
                statusFilter === 'CRITICAL' ? tire.status === SecurityAlert.ROJA :
                    statusFilter === 'WARNING' ? tire.status === SecurityAlert.AMARILLA :
                        tire.status === SecurityAlert.VERDE;

            return matchesSearch && statusMatch;
        });
    }, [tires, searchTerm, statusFilter]);

    if (loading) {
        return (
            <div className="p-4 lg:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <TireSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    const handleExportPDF = async () => {
        try {
            // Units are not strictly needed for this report version
            pdfService.generateTireReport(filteredTires);
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Show more detailed error if possible
            const msg = error instanceof Error ? error.message : 'Unknown error';
            alert(`Error al generar el reporte PDF: ${msg}`);
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">{t('inventory.header_tires')}</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{t('inventory.desc_tires')}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                    <button
                        onClick={handleExportPDF}
                        className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all"
                    >
                        <Download size={16} /> Exportar Reporte
                    </button>

                    {userRole !== 'EMPLOYEE' && (
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="bg-brand hover:bg-brand/90 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all"
                        >
                            <span className="text-lg leading-none">+</span> Alta Manual
                        </button>
                    )}

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
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['ALL', 'CRITICAL', 'WARNING', 'GOOD'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${statusFilter === f
                            ? f === 'CRITICAL' ? 'bg-red-500/10 border-red-500 text-red-500'
                                : f === 'WARNING' ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                    : f === 'GOOD' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                                        : 'bg-zinc-800 border-zinc-700 text-white'
                            : 'border-transparent text-zinc-500 hover:text-white'
                            }`}
                    >
                        {f === 'ALL' ? t('inventory.filter_all') : f === 'CRITICAL' ? t('dashboard.tire_alerts') : f === 'WARNING' ? 'Warning' : 'OK'}
                    </button>
                ))}
            </div>

            {viewMode === 'GRID' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredTires.map(tire => (
                        <TireCard
                            key={tire.id}
                            tire={tire}
                            onDisposal={(t) => {
                                setSelectedTire(t);
                                setDisposalModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900/50 text-xs font-black uppercase tracking-widest text-zinc-500 border-b border-white/5">
                                <tr>
                                    <th className="p-6">Unidad</th>
                                    <th className="p-6">Posición</th>
                                    <th className="p-6">Marca / Modelo</th>
                                    <th className="p-6">Profundidad</th>
                                    <th className="p-6">Predicción Vida</th>
                                    <th className="p-6">Estado</th>
                                    <th className="p-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredTires.map(tire => (
                                    <tr key={tire.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6 font-bold text-white">{tire.unit_id}</td>
                                        <td className="p-6 text-zinc-400 font-medium text-xs uppercase tracking-widest">{tire.position}</td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                                                    <img src={tire.last_photo_url} alt="Tire" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{tire.brand}</p>
                                                    <p className="text-[10px] text-zinc-500">{tire.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`text-sm font-black ${tire.depth_mm < 5 ? 'text-red-500' : tire.depth_mm < 9 ? 'text-amber-500' : 'text-white'}`}>{tire.depth_mm} mm</span>
                                        </td>
                                        <td className="p-6">
                                            {(() => {
                                                const prediction = predictTireLife(tire.history);
                                                if (!prediction) return <span className="text-[10px] text-zinc-600 italic">N/A</span>;
                                                return (
                                                    <span className={`text-xs font-black ${prediction.status === 'CRITICAL' ? 'text-red-500' : prediction.status === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                        {prediction.daysRemaining} Días
                                                    </span>
                                                )
                                            })()}
                                        </td>
                                        <td className="p-6">
                                            {tire.status === SecurityAlert.ROJA && <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest"><AlertOctagon size={12} /> CRÍTICO</span>}
                                            {tire.status === SecurityAlert.AMARILLA && <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest"><AlertTriangle size={12} /> WARNING</span>}
                                            {tire.status === SecurityAlert.VERDE && <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest"><CheckCircle2 size={12} /> OK</span>}
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">
                                                VER
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTire(tire);
                                                    setDisposalModalOpen(true);
                                                }}
                                                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline inline-flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> BAJA
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center pt-8 pb-12">
                    <button
                        onClick={fetchMoreTires}
                        disabled={isFetchingMore}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5 transition-all shadow-xl disabled:opacity-50"
                    >
                        {isFetchingMore ? t('common.loading') : 'Cargar Más Llantas'}
                    </button>
                </div>
            )}

            {/* Disposal Modal */}
            {selectedTire && (
                <TireDisposalModal
                    isOpen={disposalModalOpen}
                    onClose={() => {
                        setDisposalModalOpen(false);
                        setSelectedTire(null);
                    }}
                    tire={selectedTire}
                    onSuccess={async () => {
                        // Refresh tire list (reset to page 0)
                        setLoading(true);
                        const { tires: data, hasMore: more } = await dbService.getTires(0, 12);
                        setTires(data);
                        setPage(0);
                        setHasMore(more);
                        setLoading(false);
                    }}
                />
            )}

            {/* Add Tire Modal */}
            {addModalOpen && (
                <AddTireModal
                    onClose={() => setAddModalOpen(false)}
                    onTireAdded={async () => {
                        // Refresh tire list
                        setLoading(true);
                        const { tires: data, hasMore: more } = await dbService.getTires(0, 12);
                        setTires(data);
                        setPage(0);
                        setHasMore(more);
                        setLoading(false);
                    }}
                />
            )}
        </div>
    );
};
