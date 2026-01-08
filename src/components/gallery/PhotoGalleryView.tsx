
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/auth/supabase';
import { Shield, Lock, Search, Filter, Download, ExternalLink, Calendar, Truck, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
    userRole: string; // 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
}

export const PhotoGalleryView: React.FC<PhotoGalleryViewProps> = ({ onClose, userRole }) => {
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        fetchInspections();
    }, []);

    const fetchInspections = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inspections')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Initial batch

            if (error) throw error;
            setInspections(data || []);
        } catch (err) {
            console.error('Error fetching inspections:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredInspections = inspections.filter(i =>
        i.vehicle_id?.toLowerCase().includes(filter.toLowerCase()) ||
        i.ai_summary?.toLowerCase().includes(filter.toLowerCase()) ||
        i.status?.toLowerCase().includes(filter.toLowerCase())
    );

    // Security Check (Frontend Level)
    if (userRole !== 'MASTER' && userRole !== 'MANAGER' && userRole !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <Lock size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Acceso Restringido</h2>
                <p className="text-zinc-500 max-w-md">
                    Esta vista contiene evidencia forense sensible. Solo personal autorizado (Gerencia y Administración) tiene acceso a la galería de evidencia.
                </p>
                <button
                    onClick={onClose}
                    className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest transition-all"
                >
                    Volver al Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <Shield className="text-brand" />
                        Galería Forense
                    </h1>
                    <p className="text-zinc-500 mt-2 font-mono text-sm">
                        VISION IA PRO / EVIDENCE VAULT / v1.0
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar unidad, estatus..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full bg-[#121214] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand/50"
                        />
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
                        <span className="sr-only">Cerrar</span>
                        <ExternalLink size={18} className="rotate-180" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
            ) : (
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
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
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
                                            EXPORTAR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
