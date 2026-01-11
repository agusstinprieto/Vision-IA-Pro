import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, Filter, AlertTriangle, Eye, ArrowRight, ShieldAlert } from 'lucide-react';
import { dbService } from '../../services/db/dbService';
import { Audit } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface PendingDisposal {
    id: string;
    unit_id: string;
    tire_position: string;
    tire_metadata: any;
    reason: string;
    photo_url: string;
    comments: string;
    disposed_by: string;
    status: string;
    created_at: string;
}

export const SupervisorApprovalsView: React.FC = () => {
    const { t } = useLanguage();
    const [disposals, setDisposals] = useState<PendingDisposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'DISPOSALS' | 'AUDITS'>('DISPOSALS');
    const [selectedDisposal, setSelectedDisposal] = useState<PendingDisposal | null>(null);
    const [audits, setAudits] = useState<Audit[]>([]);
    const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await dbService.getPendingDisposals();
            const auditsData = await dbService.getPendingAudits();
            setDisposals(data || []);
            setAudits(auditsData || []);
        } catch (error) {
            console.error('Error fetching pending disposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dbService.approveDisposal(id, 'SUPERVISOR_ADMIN');
            alert('Baja aprobada correctamente');
            fetchData();
            setSelectedDisposal(null);
        } catch (error) {
            console.error('Error approving disposal:', error);
            alert('Error al aprobar');
        }
    };

    const handleApproveAudit = async (audit: Audit) => {
        try {
            // Approve using the frame data as the new baseline
            await dbService.updateBaselineWithApproval(audit.unit_id, audit.frame_data, 'SUPERVISOR_ADMIN', audit.id);
            alert('Cambio de llantas autorizado. Baseline actualizado.');
            fetchData();
            setSelectedAudit(null);
        } catch (error) {
            console.error('Error approving audit:', error);
            alert('Error al actualizar baseline');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase">{t('approvals.header_title')}</h1>
                <p className="text-zinc-500 font-medium">{t('approvals.header_desc')}</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/5 pb-px">
                <button
                    onClick={() => setActiveTab('DISPOSALS')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'DISPOSALS' ? 'text-brand' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    {t('approvals.tab_disposals')}
                    {disposals.length > 0 && (
                        <span className="ml-2 bg-brand text-white text-[10px] px-2 py-0.5 rounded-full">{disposals.length}</span>
                    )}
                    {activeTab === 'DISPOSALS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('AUDITS')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'AUDITS' ? 'text-brand' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    {t('approvals.tab_audits')}
                    {activeTab === 'AUDITS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-t-full" />}
                </button>
            </div>

            {activeTab === 'DISPOSALS' ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* List */}
                    <div className="xl:col-span-2 space-y-4">
                        {disposals.length === 0 ? (
                            <div className="bg-[#121214] border border-white/5 rounded-3xl p-12 text-center">
                                <CheckCircle className="text-emerald-500 mx-auto mb-4" size={48} />
                                <h3 className="text-xl font-bold text-white uppercase">Sin pendientes</h3>
                                <p className="text-zinc-500">Todo el inventario está al día.</p>
                            </div>
                        ) : (
                            disposals.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedDisposal(item)}
                                    className={`bg-[#121214] border rounded-[2rem] p-6 transition-all cursor-pointer group flex items-center gap-6 ${selectedDisposal?.id === item.id ? 'border-brand ring-4 ring-brand/10' : 'border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden flex-shrink-0">
                                        <img src={item.photo_url} alt="Evidencia" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-black text-white">{item.unit_id} &bull; {item.tire_position}</h4>
                                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">
                                                {item.reason}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 line-clamp-1 italic">"{item.comments}"</p>
                                        <div className="flex items-center gap-4 mt-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(item.created_at).toLocaleString()}</span>
                                            <span className="flex items-center gap-1"><Search size={12} /> Solicitado por: {item.disposed_by}</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={24} className={`text-zinc-700 group-hover:text-brand transition-colors ${selectedDisposal?.id === item.id ? 'text-brand' : ''}`} />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Details Panel */}
                    <div className="xl:col-span-1">
                        {selectedDisposal ? (
                            <div className="bg-[#121214] border border-white/10 rounded-[2.5rem] p-8 sticky top-8 space-y-8 animate-in slide-in-from-right duration-300">
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Revisión de Baja</h3>
                                    <p className="text-zinc-500 text-sm">Verifique la evidencia antes de aprobar el cambio en el inventario.</p>
                                </div>

                                {/* Comparison / Meta */}
                                <div className="space-y-4">
                                    <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-4">Datos de la Llanta</p>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] text-zinc-600 font-bold uppercase">Marca</p>
                                                <p className="text-sm font-black text-white">{selectedDisposal.tire_metadata.brand}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-600 font-bold uppercase">Modelo</p>
                                                <p className="text-sm font-black text-white">{selectedDisposal.tire_metadata.model}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-600 font-bold uppercase">Serie/DOT</p>
                                                <p className="text-sm font-black text-brand font-mono">{selectedDisposal.tire_metadata.serial_number || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-600 font-bold uppercase">Profundidad</p>
                                                <p className="text-sm font-black text-white">{selectedDisposal.tire_metadata.depth_mm} mm</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Photo */}
                                <div>
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-3">Evidencia Fotográfica</p>
                                    <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 relative group">
                                        <img src={selectedDisposal.photo_url} alt="Large Evidence" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="bg-brand text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                <Eye size={16} /> Ver Pantalla Completa
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div>
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2">Comentarios del Operador</p>
                                    <div className="bg-zinc-900/50 p-4 rounded-2xl border-l-4 border-brand italic text-zinc-300 text-sm">
                                        "{selectedDisposal.comments}"
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setSelectedDisposal(null)}
                                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Rechazar
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedDisposal.id)}
                                        className="flex-1 bg-brand hover:scale-105 active:scale-95 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(234,73,46,0.3)]"
                                    >
                                        <CheckCircle size={18} /> Aprobar Baja
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#121214] border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center h-[600px] flex flex-col items-center justify-center opacity-40">
                                <AlertTriangle size={64} className="mb-6" />
                                <h3 className="text-xl font-bold uppercase">Sin selección</h3>
                                <p className="text-sm max-w-[200px] mt-2">Seleccione una solicitud de la lista para ver los detalles y evidencia.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* List */}
                    <div className="xl:col-span-2 space-y-4">
                        {audits.length === 0 ? (
                            <div className="bg-[#121214] border border-white/5 rounded-3xl p-12 text-center">
                                <CheckCircle className="text-emerald-500 mx-auto mb-4" size={48} />
                                <h3 className="text-xl font-bold text-white uppercase">Sin Alertas</h3>
                                <p className="text-zinc-500">Todas las auditorías coinciden con el baseline.</p>
                            </div>
                        ) : (
                            audits.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedAudit(item)}
                                    className={`bg-[#121214] border rounded-[2rem] p-6 transition-all cursor-pointer group flex items-center gap-6 ${selectedAudit?.id === item.id ? 'border-brand ring-4 ring-brand/10' : 'border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                                        <AlertTriangle className="text-brand" size={32} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-black text-white">{item.unit_id} &bull; {item.unit_type}</h4>
                                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">
                                                MISMATCH
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 line-clamp-1 italic">"{item.justification_text || 'Sin justificación'}"</p>
                                        <div className="flex items-center gap-4 mt-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(item.created_at).toLocaleString()}</span>
                                            <span className="flex items-center gap-1 text-red-500"><XCircle size={12} /> Diferencias: {item.comparison_result?.mismatched || 0}</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={24} className={`text-zinc-700 group-hover:text-brand transition-colors ${selectedAudit?.id === item.id ? 'text-brand' : ''}`} />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Details Panel */}
                    <div className="xl:col-span-1">
                        {selectedAudit ? (
                            <div className="bg-[#121214] border border-white/10 rounded-[2.5rem] p-8 sticky top-8 space-y-8 animate-in slide-in-from-right duration-300">
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Autorizar Cambio</h3>
                                    <p className="text-zinc-500 text-sm">Cambio de llantas detectado. Si aprueba, este se convertirá en el nuevo Baseline.</p>
                                </div>

                                {/* Justification */}
                                <div>
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2">Justificación del Operador</p>
                                    <div className="bg-zinc-900/50 p-4 rounded-2xl border-l-4 border-brand italic text-zinc-300 text-sm">
                                        "{selectedAudit.justification_text}"
                                    </div>
                                    {selectedAudit.justification_photos && selectedAudit.justification_photos.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            {selectedAudit.justification_photos.map((url, i) => (
                                                <img key={i} src={url} className="rounded-xl border border-white/10" alt="Justification" />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Comparison Stats */}
                                <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Coincidencias</span>
                                        <span className="text-emerald-500 font-black">{selectedAudit.comparison_result?.matched}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Diferencias</span>
                                        <span className="text-red-500 font-black text-xl">{selectedAudit.comparison_result?.mismatched}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setSelectedAudit(null)}
                                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleApproveAudit(selectedAudit)}
                                        className="flex-1 bg-brand hover:scale-105 active:scale-95 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(234,73,46,0.3)]"
                                    >
                                        <CheckCircle size={18} /> Validar Nuevo Baseline
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#121214] border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center h-[600px] flex flex-col items-center justify-center opacity-40">
                                <AlertTriangle size={64} className="mb-6" />
                                <h3 className="text-xl font-bold uppercase">Sin selección</h3>
                                <p className="text-sm max-w-[200px] mt-2">Seleccione una alerta de la lista.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
