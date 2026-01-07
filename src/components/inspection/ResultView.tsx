
import React from 'react';
import { ForensicAuditResult } from '../../types';

interface ResultViewProps {
    results: {
        position: string;
        currentImage: string; // Blob URL
        previousImage: string; // URL from MockDB
        analysis: ForensicAuditResult;
    }[];
    onClose: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ results, onClose }) => {

    // Calculate overall status
    const criticalIssues = results.filter(r => r.analysis.alerta_seguridad === 'ROJA').length;
    const warnings = results.filter(r => r.analysis.alerta_seguridad === 'AMARILLA').length;

    const overallStatus = criticalIssues > 0 ? 'CRITICAL' : warnings > 0 ? 'WARNING' : 'PASSED';
    const statusColor = criticalIssues > 0 ? 'red-500' : warnings > 0 ? 'yellow' : 'emerald-500';

    return (
        <div className="flex flex-col h-full">
            {/* Header Result */}
            <div className={`bg-${statusColor}/10 border border-${statusColor}/20 p-8 rounded-[2.5rem] mb-8 text-center`}>
                <h2 className={`text-4xl font-black text-${statusColor} uppercase tracking-tighter mb-2`}>
                    {overallStatus === 'CRITICAL' ? 'ALERTA DE SEGURIDAD' : overallStatus === 'WARNING' ? 'REVISIÓN REQUERIDA' : 'AUDITORÍA APROBADA'}
                </h2>
                <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
                    {criticalIssues} Anomalías Críticas Detectadas
                </p>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pb-20">
                {results.map((res, idx) => (
                    <div key={idx} className="bg-[#121214] border border-white/10 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-black uppercase tracking-tighter">{res.position}</h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${res.analysis.alerta_seguridad === 'ROJA' ? 'red-500' :
                                res.analysis.alerta_seguridad === 'AMARILLA' ? 'yellow' : 'emerald-500'
                                }/20 text-${res.analysis.alerta_seguridad === 'ROJA' ? 'red-500' :
                                    res.analysis.alerta_seguridad === 'AMARILLA' ? 'yellow' : 'emerald-500'
                                }`}>
                                {res.analysis.alerta_seguridad}
                            </span>
                        </div>

                        {/* Comparison - Enlarged for better visibility */}
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="relative group overflow-hidden rounded-2xl border border-white/5">
                                <img src={res.previousImage} className="w-full h-64 md:h-80 object-cover opacity-70 hover:opacity-100 transition-opacity" />
                                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Referencia (Base)</span>
                                </div>
                            </div>
                            <div className="relative group overflow-hidden rounded-2xl border-2 border-[#EA492E]/30">
                                <img src={res.currentImage} className="w-full h-64 md:h-80 object-cover" />
                                <div className="absolute top-4 left-4 bg-[#EA492E] px-3 py-1.5 rounded-lg shadow-lg">
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Actual (Captura Gate)</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Findings */}
                        <div className="bg-black/40 p-4 rounded-xl">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Análisis Forense IA</p>
                            <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                                "{res.analysis.razonamiento_forense}"
                            </p>
                            {res.analysis.hallazgos.marca_amarilla_detectada !== undefined && (
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full bg-${res.analysis.hallazgos.marca_amarilla_detectada ? 'emerald-500' : 'red-500'}`}></span>
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold">
                                        Marca Amarilla: {res.analysis.hallazgos.marca_amarilla_detectada ? 'DETECTADA' : 'NO VISIBLE'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={onClose} className="bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors mt-auto">
                Finalizar Auditoría
            </button>
        </div>
    );
}
