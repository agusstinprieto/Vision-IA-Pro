
import React, { useState, useRef } from 'react';
import { SecureCamera } from '../camera/SecureCamera';
import { analyzeCabinIntegrity } from '../../services/ai/gemini';
import { CabinAuditResult, SecurityAlert, DriverStatus } from '../../types';
import { MOCK_DRIVERS } from '../../services/db/mockDB';

interface CabinScannerProps {
    onClose: () => void;
    onAlert: (result: CabinAuditResult) => void;
}

export const CabinScanner: React.FC<CabinScannerProps> = ({ onClose, onAlert }) => {
    const [mode, setMode] = useState<'START' | 'MONITOR' | 'SOS' | 'RESULT'>('START');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastResult, setLastResult] = useState<CabinAuditResult | null>(null);
    const [selectedDriverName, setSelectedDriverName] = useState<string>('');

    const handleCabinCapture = async (blob: Blob) => {
        setIsAnalyzing(true);

        try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    resolve(base64.split(',')[1]);
                };
                reader.readAsDataURL(blob);
            });
            const base64 = await base64Promise;

            const result = await analyzeCabinIntegrity(base64);
            setLastResult(result);
            setMode('RESULT');

            if (result.nivel_riesgo === SecurityAlert.ROJA) {
                onAlert(result);
            }
        } catch (error) {
            console.error("Cabin Analysis Error:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col relative bg-black rounded-[3rem] overflow-hidden border border-white/5 border-t-0 shadow-2xl">
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Safety Cabín <span className="text-brand">IA</span>
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Driver Monitoring System v2.0</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative overflow-hidden bg-[#050505]">
                {/* Background Ambient Glow */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${lastResult?.nivel_riesgo === SecurityAlert.ROJA ? 'bg-red-500/5 opacity-100' :
                    lastResult?.nivel_riesgo === SecurityAlert.AMARILLA ? 'bg-yellow/5 opacity-100' : 'bg-brand/5 opacity-50'
                    }`} />

                {mode === 'START' ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 min-h-[500px]">
                        <div className="w-32 h-32 bg-brand/10 rounded-[3rem] flex items-center justify-center text-brand border-2 border-brand/20 shadow-[0_0_50px_rgba(234,73,46,0.1)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <div className="max-w-sm">
                            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">LISTO PARA AUDITORÍA</h3>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs leading-relaxed">
                                SELECCIONE UN OPERADOR EN LA SIGUIENTE PESTAÑA O PRESIONE INICIAR PARA ACTIVAR EL CANAL SEGURO DE VIDEO.
                            </p>
                        </div>

                        <div className="w-full max-w-md space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left">
                                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">OPERADOR DETECTADO</p>
                                <select
                                    className="w-full bg-transparent border-none text-white font-black uppercase outline-none appearance-none"
                                    onChange={(e) => setSelectedDriverName(e.target.value)}
                                    value={selectedDriverName}
                                >
                                    <option value="">Seleccionar Operador...</option>
                                    {MOCK_DRIVERS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={() => setMode('MONITOR')}
                                disabled={!selectedDriverName}
                                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all ${selectedDriverName
                                    ? 'bg-brand text-white shadow-[0_20px_40px_rgba(234,73,46,0.2)] hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                INICIAR AUDITORÍA IA
                            </button>
                        </div>
                    </div>
                ) : mode === 'MONITOR' || mode === 'SOS' ? (
                    <div className="flex flex-col">
                        <div className="relative aspect-video lg:aspect-square max-h-[600px]">
                            <SecureCamera
                                active={true}
                                onCapture={handleCabinCapture}
                                tripId="DMS-SESSION"
                                plateId={selectedDriverName || "DRIVER-CAB"}
                            />

                            {/* --- PREMIUM HUD OVERLAY --- */}
                            <div className="absolute inset-x-8 inset-y-12 pointer-events-none">
                                {/* Corner Brackets (Animated Reticle) */}
                                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-brand/40 rounded-tl-3xl animate-pulse" />
                                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-brand/40 rounded-tr-3xl animate-pulse" />
                                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-brand/40 rounded-bl-3xl animate-pulse" />
                                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-brand/40 rounded-br-3xl animate-pulse" />

                                {/* Central Focus Frame */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-96 border border-white/10 rounded-[4rem] flex flex-col items-center justify-center bg-white/[0.02] backdrop-blur-[2px]">
                                    <div className="w-24 h-5 border-b-2 border-white/10 rounded-full mb-32 opacity-10" />
                                    <div className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] animate-pulse">Scanning Biometrics</div>
                                </div>
                            </div>

                            {/* Status Indicators */}
                            <div className="absolute top-8 left-8 space-y-3">
                                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-5 py-3 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_15px_#10B981] animate-pulse" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-white">ID: {selectedDriverName}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/5">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 italic">Encryption: AES-256</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="p-10 bg-gradient-to-t from-black via-black/90 to-transparent backdrop-blur-3xl border-t border-white/5 flex gap-6">
                            <button
                                onClick={() => setMode('SOS')}
                                className="group flex-[2] py-6 bg-red-600 rounded-[2rem] font-black uppercase tracking-widest shadow-[0_0_50px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                                SOS ASALTO
                            </button>
                            <button
                                className="flex-1 py-6 bg-white/5 border border-white/10 rounded-[2rem] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 transition-colors"
                            >
                                LOGS
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full p-8 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                        {/* Premium Result Card */}
                        <div className="w-full max-w-lg bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex flex-col items-center shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                            <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl transition-transform duration-1000 hover:rotate-6 ${lastResult?.nivel_riesgo === SecurityAlert.ROJA ? 'bg-red-500 shadow-red-500/20' :
                                lastResult?.nivel_riesgo === SecurityAlert.AMARILLA ? 'bg-yellow shadow-yellow/20 text-black' :
                                    'bg-emerald-500 shadow-emerald-500/20 text-white'
                                }`}>
                                {lastResult?.nivel_riesgo === SecurityAlert.ROJA ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                            </div>

                            <div className="text-center mb-10">
                                <h3 className="text-4xl font-black uppercase tracking-tighter mb-2 text-white italic">{lastResult?.estado_chofer}</h3>
                                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest leading-relaxed px-10">
                                    "{lastResult?.hallazgos.descripcion}"
                                </p>
                            </div>

                            {/* Medical / Wellness Dashboard */}
                            <div className="w-full bg-black/40 border border-white/5 rounded-3xl p-8 space-y-6 mb-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Nivel de Estrés Cortisol-IA</span>
                                        <span className={`text-xl font-black ${(lastResult?.hallazgos.stress_level || 0) > 7 ? 'text-red-500' :
                                            (lastResult?.hallazgos.stress_level || 0) > 4 ? 'text-yellow' : 'text-emerald-500'
                                            }`}>{lastResult?.hallazgos.stress_level}/10</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-[2px]">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)] ${(lastResult?.hallazgos.stress_level || 0) > 7 ? 'bg-red-500' :
                                                (lastResult?.hallazgos.stress_level || 0) > 4 ? 'bg-yellow' : 'bg-emerald-500'
                                                }`}
                                            style={{ width: `${(lastResult?.hallazgos.stress_level || 0) * 10}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest block mb-2">Salud Física</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-sm font-bold text-white uppercase truncate">{lastResult?.hallazgos.salud_fisica || 'Óptima'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest block mb-2">Salud Mental</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                            <span className="text-sm font-bold text-white uppercase truncate">{lastResult?.hallazgos.salud_mental || 'Estable'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-brand/10 border border-brand/20 rounded-2xl flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-brand tracking-widest mb-1 italic">Protocolo Médica-IA</p>
                                        <p className="text-white text-[11px] font-bold leading-relaxed">{lastResult?.recomendacion}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setMode('MONITOR')}
                                className="w-full bg-brand text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(234,73,46,0.2)]"
                            >
                                Re-activar Monitoreo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Loading Overlay */}
            {isAnalyzing && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mb-8" />
                    <h2 className="text-2xl font-black uppercase tracking-widest animate-pulse">Analizando Cabina...</h2>
                    <p className="text-zinc-500 font-mono mt-2 italic">Escaneando Biometría & Entorno</p>
                </div>
            )}
        </div>
    );
};
