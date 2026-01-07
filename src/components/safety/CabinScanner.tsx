
import React, { useState, useRef } from 'react';
import { SecureCamera } from '../camera/SecureCamera';
import { analyzeCabinIntegrity } from '../../services/ai/gemini';
import { CabinAuditResult, SecurityAlert, DriverStatus } from '../../types';

interface CabinScannerProps {
    onClose: () => void;
    onAlert: (result: CabinAuditResult) => void;
}

export const CabinScanner: React.FC<CabinScannerProps> = ({ onClose, onAlert }) => {
    const [mode, setMode] = useState<'MONITOR' | 'SOS' | 'RESULT'>('MONITOR');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastResult, setLastResult] = useState<CabinAuditResult | null>(null);

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
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
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
            <div className="flex-1 relative overflow-hidden">
                {mode === 'MONITOR' || mode === 'SOS' ? (
                    <div className="h-full flex flex-col">
                        <div className="flex-1 relative">
                            <SecureCamera
                                onCapture={handleCabinCapture}
                                tripId="DMS-SESSION"
                                plateId="DRIVER-CAB"
                            />

                            {/* DMS Overlays */}
                            <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent border-t-white/5 border-b-white/5 border-l-white/5 border-r-white/5">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border border-white/20 rounded-[4rem] flex flex-col items-center justify-center">
                                    <div className="w-20 h-10 border-b-2 border-white/20 rounded-full mb-20 opacity-20" />
                                    <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Enfoque Rostro</div>
                                </div>
                            </div>

                            {/* Status Indicators */}
                            <div className="absolute top-10 left-10 space-y-2">
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10B981]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Gaze Track: OK</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="p-8 bg-black/80 backdrop-blur-3xl border-t border-white/5 flex gap-4">
                            <button
                                onClick={() => setMode('SOS')}
                                className="flex-1 py-5 bg-red-600 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 animate-pulse"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3Z" /><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z" /><path d="m2 2 5 5" /><path d="m9.5 9.5 1 1" /></svg>
                                SOS ASALTO
                            </button>
                            <button
                                className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-zinc-400"
                            >
                                HISTORIAL
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl ${lastResult?.nivel_riesgo === SecurityAlert.ROJA ? 'bg-red-500 shadow-red-500/20' :
                                lastResult?.nivel_riesgo === SecurityAlert.AMARILLA ? 'bg-yellow shadow-yellow/20 text-black' :
                                    'bg-emerald-500 shadow-emerald-500/20'
                            }`}>
                            {lastResult?.nivel_riesgo === SecurityAlert.ROJA ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            )}
                        </div>

                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{lastResult?.estado_chofer}</h3>
                        <p className="text-zinc-500 font-mono text-sm max-w-xs mb-10 italic">
                            "{lastResult?.hallazgos.descripcion}"
                        </p>

                        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 text-left space-y-4 mb-10">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ojos Cerrados</span>
                                <span className={lastResult?.hallazgos.ojos_cerrados ? 'text-red-500 font-black' : 'text-emerald-500 font-black'}>
                                    {lastResult?.hallazgos.ojos_cerrados ? 'SÍ' : 'NO'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Bostezo</span>
                                <span className={lastResult?.hallazgos.bostezo_detectado ? 'text-amber-500 font-black' : 'text-emerald-500 font-black'}>
                                    {lastResult?.hallazgos.bostezo_detectado ? 'SÍ' : 'NO'}
                                </span>
                            </div>
                            <div className="p-4 bg-brand/10 border border-brand/20 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-brand tracking-widest mb-1 italic">Recomendación IA</p>
                                <p className="text-white text-xs font-bold">{lastResult?.recomendacion}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setMode('MONITOR')}
                            className="bg-white text-black py-5 px-12 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            Continuar Vigilancia
                        </button>
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
