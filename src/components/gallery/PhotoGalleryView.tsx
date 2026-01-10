
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/auth/supabase';
import { Shield, Lock, Search, Filter, Download, ExternalLink, Calendar, Truck, User, LayoutGrid, List, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

import { dbService } from '../../services/db/dbService';
import { Worker, Unit } from '../../types';
import simulatedTireImg from '../../assets/simulated_tire_damage.png';

interface Inspection {
    id: string;
    created_at: string;
    vehicle_id: string;
    status: string;
    ai_summary: string;
    image_url: string;
    inspection_type: string;
}

interface PhotoGalleryViewProps {
    onClose: () => void;
    userRole?: string;
}

export const PhotoGalleryView: React.FC<PhotoGalleryViewProps> = ({ onClose, userRole }) => {
    const { t } = useLanguage();
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortMode, setSortMode] = useState<'date' | 'severity'>('date');

    const [drivers, setDrivers] = useState<Worker[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);

    useEffect(() => {
        fetchInspections();
        fetchDrivers();
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        const data = await dbService.getUnits();
        if (data) setUnits(data);
    };

    const fetchDrivers = async () => {
        const data = await dbService.getWorkers();
        if (data) setDrivers(data);
    };

    const fetchInspections = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inspections')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Add High-Impact Realistic Forensic Assets
            const demoAssets: Inspection[] = [
                {
                    id: 'demo-laser-1',
                    created_at: new Date().toISOString(),
                    vehicle_id: 'SCANNER-PRO-01',
                    status: 'DAMAGE_DETECTED',
                    ai_summary: 'ANÁLISIS FORENSE: Ruptura severa en costado detectada. Profundidad de piso: 3.2mm. Riesgo de falla crítica: ALTO.',
                    image_url: 'C:/Users/aguss/.gemini/antigravity/brain/7a26fc71-7ed2-4fd6-94b1-b4612c50993b/tire_sidewall_damage_realistic_1768015939800.png',
                    inspection_type: 'TIRE'
                },
                {
                    id: 'demo-laser-2',
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    vehicle_id: 'FLOTA-OPT-01',
                    status: 'OPTIMAL',
                    ai_summary: 'ANÁLISIS DE RUTINA: Estado de la banda de rodamiento: ÓPTIMO. Profundidad: 14.5mm. Sin anomalías detectadas.',
                    image_url: 'C:/Users/aguss/.gemini/antigravity/brain/7a26fc71-7ed2-4fd6-94b1-b4612c50993b/tire_digital_red_tech_style_1768016317621.png',
                    inspection_type: 'TIRE'
                },
                {
                    id: 'demo-comugas-1',
                    created_at: new Date(Date.now() - 7200000).toISOString(),
                    vehicle_id: 'COMUGAS-TR-04',
                    status: 'OPTIMAL',
                    ai_summary: 'INSPECCIÓN DE UNIDAD DE CARGA: Trailer Comugas ingresando a planta. Verificación de sellos de seguridad intactos. Geocerca validada.',
                    image_url: 'C:/Users/aguss/.gemini/antigravity/brain/7a26fc71-7ed2-4fd6-94b1-b4612c50993b/trailer_comugas_entering_plant_1768016006923.png',
                    inspection_type: 'CABIN'
                },
                {
                    id: 'demo-comugas-2',
                    created_at: new Date(Date.now() - 10800000).toISOString(),
                    vehicle_id: 'SIMSA-FULL-09',
                    status: 'OPTIMAL',
                    ai_summary: 'CONFIGURACIÓN FULL (DOBLE REMOLQUE): Inspección completa. Ambos remolques verificados. Presión de neumáticos en rangos operativos. Sin daños estructurales visibles en conexión dolly.',
                    image_url: 'C:/Users/aguss/.gemini/antigravity/brain/7a26fc71-7ed2-4fd6-94b1-b4612c50993b/trailer_double_full_config_simsa_logo_1768016084173.png',
                    inspection_type: 'TIRE'
                }
            ];

            const combined = [...demoAssets, ...(data || [])];
            setInspections(combined);
            setFilteredInspections(combined);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    useEffect(() => {
        let result = [...inspections];

        // 0. Filter out invalid inspections (no image or invalid vehicle_id)
        result = result.filter(i =>
            i.image_url &&
            i.image_url.trim() !== '' &&
            i.image_url !== 'UNKNOWN' &&
            i.vehicle_id &&
            i.vehicle_id !== 'UNKNOWN'
        );

        // 1. Text Search
        if (filter) {
            const lower = filter.toLowerCase();
            result = result.filter(i =>
                (i.vehicle_id && i.vehicle_id.toLowerCase().includes(lower)) ||
                (i.ai_summary && i.ai_summary.toLowerCase().includes(lower)) ||
                (i.status && i.status.toLowerCase().includes(lower))
            );
        }

        // 2. Category Filter (Tire vs Cabin)
        if (filterType !== 'ALL') {
            result = result.filter(i => i.inspection_type === filterType);
        }

        // 3. Date Filter
        if (dateFilter) {
            result = result.filter(i => i.created_at.startsWith(dateFilter));
        }

        // 4. Driver Filter (Indirect via Unit)
        if (selectedDriver) {
            const driver = drivers.find(d => d.id === selectedDriver);
            if (driver && driver.unit_assigned) {
                result = result.filter(i => i.vehicle_id === driver.unit_assigned);
            }
        }

        // 5. Sorting
        if (sortMode === 'date') {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortMode === 'severity') {
            result.sort((a, b) => getScore(b.status) - getScore(a.status));
        }

        setFilteredInspections(result);
    }, [filter, inspections, filterType, dateFilter, selectedDriver, sortMode, drivers]);

    // Severity Sort: DAMAGE_DETECTED > ALL OTHERS
    const getScore = (status: string) => status === 'DAMAGE_DETECTED' ? 10 : 1;

    // Security Check
    if (userRole !== 'MASTER' && userRole !== 'MANAGER' && userRole !== 'DEVELOPER') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#0F1012] text-white p-6 text-center">
                <Shield size={64} className="text-[#EA492E] mb-6" />
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">{t('gallery.restricted_access')}</h2>
                <p className="text-zinc-500 max-w-md mb-8">
                    {t('gallery.restricted_desc')}
                </p>
                <button onClick={onClose} className="px-8 py-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs">
                    {t('gallery.return')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F1012] p-6 md:p-12 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-4">
                        <Lock size={32} className="text-brand" />
                        {t('sidebar.gallery').split(' ')[0]} <span className="text-brand">{t('sidebar.gallery').split(' ')[1] || 'Forense'}</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm max-w-2xl">
                        {t('dashboard.monitoring_desc')}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    {/* View Toggle */}
                    <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row flex-wrap gap-2 w-full md:w-auto">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full md:w-auto bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand/50"
                        >
                            <option value="ALL">{t('gallery.filter_type')}</option>
                            <option value="TIRE">Llantas</option>
                            <option value="CABIN">Cabina (Driver)</option>
                        </select>
                        <select
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            className="w-full md:w-auto bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand/50"
                        >
                            <option value="">{t('gallery.filter_driver')}</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.unit_assigned})</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full md:w-auto bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand/50"
                        />
                        <button
                            onClick={() => setSortMode(prev => prev === 'date' ? 'severity' : 'date')}
                            className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 transition-all text-xs font-bold uppercase tracking-wider whitespace-nowrap ${sortMode === 'severity' ? 'bg-brand text-white' : 'bg-[#121214] text-zinc-400 hover:text-white'}`}
                        >
                            {sortMode === 'severity' ? <ArrowDownWideNarrow size={16} /> : <Calendar size={16} />}
                            {sortMode === 'severity' ? 'Mayor Incidencia' : 'Más Recientes'}
                        </button>

                        {/* Simulation Button - Only for MASTER/DEVELOPER */}
                        {(userRole === 'MASTER' || userRole === 'DEVELOPER') && (
                            <button
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        // 1. Randomly Select a Realistic Asset
                                        const realisticAssets = [
                                            {
                                                path: 'C:/Users/aguss/.gemini/antigravity/brain/7a26fc71-7ed2-4fd6-94b1-b4612c50993b/tire_sidewall_damage_realistic_1768015939800.png',
                                                status: 'DAMAGE_DETECTED',
                                                summary: 'ANÁLISIS FORENSE: Ruptura severa en costado detectada. Profundidad de piso: 3.2mm. Riesgo de falla crítica: ALTO.'
                                            },
                                            {
                                                path: 'C:/Users/aguss/.gemini/antigravity/brain/7a26fc71-7ed2-4fd6-94b1-b4612c50993b/tire_optimal_tread_realistic_1768015969529.png',
                                                status: 'OPTIMAL',
                                                summary: 'ANÁLISIS DE RUTINA: Estado de la banda de rodamiento: ÓPTIMO. Profundidad: 14.5mm. Sin anomalías detectadas.'
                                            }
                                        ];
                                        const selectedAsset = realisticAssets[Math.floor(Math.random() * realisticAssets.length)];

                                        // 1. Convert local asset to Blob for real upload test
                                        // Note: In a browser environment, we can't fetch local absolute paths directly due to security.
                                        // However, since we are in a dev environment/electron context or if this is just logic testing:
                                        // If this fails (CORS/Security), we fallback to the imported one.
                                        let blob;
                                        try {
                                            const response = await fetch('file://' + selectedAsset.path);
                                            blob = await response.blob();
                                        } catch (e) {
                                            // Fallback to imported if local fetch fails (likely in pure browser)
                                            const response = await fetch(simulatedTireImg);
                                            blob = await response.blob();
                                        }

                                        // 2. FETCH REAL DATA (Mimic Production Logic)
                                        const freshDrivers = await dbService.getWorkers();
                                        const freshUnits = await dbService.getUnits();

                                        let validUnitId = "";

                                        // Priority 1: Use a Driver's assigned unit (Proven in CabinScanner)
                                        if (freshDrivers && freshDrivers.length > 0 && freshDrivers[0].unit_assigned) {
                                            validUnitId = freshDrivers[0].unit_assigned;
                                            console.log("Using Driver's Assigned Unit (Real):", validUnitId);
                                        }
                                        // Priority 2: Use a Unit's Plate ID directly
                                        else if (freshUnits && freshUnits.length > 0) {
                                            validUnitId = freshUnits[0].plate_id || freshUnits[0].pipe_number || freshUnits[0].id;
                                            console.log("Using Unit Plate (Fallback):", validUnitId);
                                        }
                                        else {
                                            alert("⚠️ Error: No hay datos reales (Choferes o Unidades) para asociar la inspección.\n\nEl sistema requiere un vehículo real registrado.");
                                            setLoading(false);
                                            return;
                                        }

                                        // 2.2 RESOLVE DATA (UUID for DB, Plate for Storage)
                                        let dbUUID = "";       // For 'inspections' table (Must be UUID)
                                        let storagePlate = ""; // For 'storage' buckets (Can be "PR-901")

                                        // Strategy:
                                        // 1. If we have units, use the first unit's real UUID and its Plate.
                                        // 2. This satisfies the FK constraint (UUID) AND keeps folder organization (Plate).

                                        if (freshUnits && freshUnits.length > 0) {
                                            dbUUID = freshUnits[0].id; // The UUID
                                            storagePlate = freshUnits[0].plate_id || "UNKNOWN_PLATE";
                                            console.log("✅ Using Real Unit:", { dbUUID, storagePlate });
                                        }
                                        else {
                                            alert("⚠️ Error: No hay unidades registradas en el sistema para simular.");
                                            setLoading(false);
                                            return;
                                        }

                                        // 3. Upload to Supabase Storage (Using Plate for Folder Name is fine/preferred)
                                        const publicUrl = await dbService.uploadEvidence(blob, 'llantas', storagePlate);

                                        // 4. Save Record
                                        await dbService.saveInspection({
                                            inspection_type: 'TIRE',
                                            created_at: new Date().toISOString(),
                                            status: selectedAsset.status,
                                            ai_summary: selectedAsset.summary,
                                            image_url: publicUrl,
                                            vehicle_id: dbUUID // <--- SENDING REAL UUID HERE
                                        });

                                        fetchInspections();
                                    } catch (e: any) {
                                        console.error("Simulation failed", e);
                                        alert(`Error simulando: ${e.message || JSON.stringify(e)}`);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="w-full md:w-auto px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl border border-red-500/20 text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                {t('gallery.simulate')}
                            </button>
                        )}

                        {/* HIGH IMPACT ASSETS - PINNED DEMO EVIDENCE */}
                        <div className="flex bg-brand/10 border border-brand/20 rounded-xl p-2 items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand/20 flex items-center justify-center text-brand">
                                <ExternalLink size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase text-brand tracking-widest">{t('gallery.demo_assets')}</p>
                                <p className="text-[8px] text-zinc-500 font-mono">{t('gallery.demo_sub')}</p>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-[#121214] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand/50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredInspections.map((item) => (
                        <div key={item.id} className="group bg-[#121214] border border-white/5 rounded-2xl overflow-hidden hover:border-brand/30 transition-all duration-300">
                            <div className="relative aspect-video bg-black overflow-hidden">
                                <img
                                    src={item.image_url}
                                    alt={`Evidencia ${item.vehicle_id}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%3E%3Crect%20fill%3D%22%232d2d2d%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                    }}
                                />
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${item.status === 'DAMAGE_DETECTED' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'
                                        }`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Truck size={14} className="text-zinc-500" />
                                            {item.vehicle_id || 'UNKNOWN'}
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-2">
                                            <Calendar size={10} />
                                            {new Date(item.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <User size={14} className="text-zinc-500" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Análisis IA</p>
                                        <p className="text-xs text-zinc-300 line-clamp-2">
                                            {item.ai_summary || 'Sin análisis registrado'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <span className="text-[10px] font-mono text-zinc-600">ID: {item.id.slice(0, 8)}</span>
                                        <button className="text-brand text-xs font-bold hover:underline flex items-center gap-1">
                                            <Download size={12} />
                                            {t('gallery.export')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                            <tr>
                                <th className="p-6">{t('gallery.evidence')}</th>
                                <th className="p-6">{t('gallery.date_time')}</th>
                                <th className="p-6">{t('gallery.unit')}</th>
                                <th className="p-6">{t('gallery.status')}</th>
                                <th className="p-6">{t('gallery.analysis')}</th>
                                <th className="p-6 text-right">{t('gallery.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredInspections.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="w-24 h-16 rounded-xl overflow-hidden border border-white/10 group-hover:border-brand/50 transition-colors">
                                            <img
                                                src={item.image_url}
                                                alt="Thumb"
                                                className="w-full h-full object-cover"
                                                onError={(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23fff%22%20font-size%3D%2212%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%3EError%3C%2Ftext%3E%3C%2Fsvg%3E'}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-white font-mono text-xs">
                                            <Calendar size={14} className="text-zinc-500" />
                                            {new Date(item.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-white/5 rounded-lg">
                                                <Truck size={16} className="text-zinc-400" />
                                            </div>
                                            <span className="font-bold text-white">{item.vehicle_id || 'UNKNOWN'}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${item.status === 'DAMAGE_DETECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            }`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs text-zinc-300 max-w-xs truncate" title={item.ai_summary}>
                                            {item.ai_summary || 'Sin datos'}
                                        </p>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
