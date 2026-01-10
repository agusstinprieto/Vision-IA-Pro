import React, { useState, useRef, useEffect } from 'react';
import { Upload, Smartphone, Zap, CheckCircle2, AlertTriangle, Play, Pause, Save, Search, AlertOctagon } from 'lucide-react';
import { dbService } from '../../services/db/dbService';
import { analyzeInspectionDelta, extractTireMetadata, extractLicensePlate, extractTrailerNumber } from '../../services/ai/gemini';
import { TireDisposalModal } from '../inventory/TireDisposalModal';
import { InventoryTire, SecurityAlert } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ScannedFrame {
    id: number;
    url: string;
    status: 'ANALYZING' | 'CLEAN' | 'ISSUE';
    confidence: number;
    timestamp: string;
    metadata?: {
        brand?: string;
        model?: string;
        serial_number?: string;
        depth_mm?: number;
    };
}

// Memoized Frame Card for performance
const FrameCard = React.memo(({
    frame,
    onJustify
}: {
    frame: ScannedFrame,
    onJustify: (f: ScannedFrame) => void
}) => {
    return (
        <div
            className={`
                group relative aspect-square bg-black rounded-xl overflow-hidden border-2 transition-all duration-300
                ${frame.status === 'ANALYZING' ? 'border-zinc-800' :
                    frame.status === 'ISSUE' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                        'border-green-500/50'}
             `}
        >
            <img src={frame.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={`Frame ${frame.id}`} />

            {/* Overlay Info */}
            <div className="absolute top-1 left-1 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-mono text-white border border-white/10">
                CAM-{String(frame.id).padStart(2, '0')}
            </div>

            {/* Status Indicator */}
            {frame.status !== 'ANALYZING' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-[2px] z-10">
                    {frame.status === 'ISSUE' ? (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                            <div className="bg-red-500 text-white p-2 rounded-full shadow-lg transform scale-110 mb-2">
                                <AlertTriangle size={20} />
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onJustify(frame);
                                }}
                                className="bg-white text-red-600 px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter hover:bg-zinc-200 transition-colors shadow-xl"
                            >
                                Justificar Cambio
                            </button>
                        </div>
                    ) : (
                        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg mb-2">
                            <CheckCircle2 size={20} />
                        </div>
                    )}

                    {/* Metadata Display */}
                    {frame.metadata && (
                        <div className="text-center px-1 animate-in slide-in-from-bottom-2">
                            <p className="text-[10px] font-black uppercase text-white tracking-wider truncate px-2">
                                {frame.metadata.brand || 'Marca Desc.'}
                            </p>
                            <p className="text-[9px] text-zinc-300 font-mono">
                                {frame.metadata.depth_mm}mm
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export const MobileCapture = () => {
    const { t } = useLanguage();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [frames, setFrames] = useState<ScannedFrame[]>([]);
    const [isReadyToAnalyze, setIsReadyToAnalyze] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedFrame, setSelectedFrame] = useState<ScannedFrame | null>(null);
    const [justificationModalOpen, setJustificationModalOpen] = useState(false);

    // Real DB Integration State
    const [unitId, setUnitId] = useState('');
    const [mode, setMode] = useState<'REGISTER' | 'AUDIT'>('REGISTER');
    const [dbStatus, setDbStatus] = useState<'IDLE' | 'SAVING' | 'FETCHING' | 'SUCCESS' | 'ERROR'>('IDLE');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const steps = ['Upload', 'Extract', 'Process', 'Results'];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setFrames([]);
            setProgress(0);
            setCurrentStep(0);
            setIsReadyToAnalyze(false);
            setDbStatus('IDLE');
        }
    };

    const [isIdentifyingUnit, setIsIdentifyingUnit] = useState(false);

    const handleAutoIdentify = async () => {
        if (frames.length === 0) {
            alert("Primero genera los fotogramas del video");
            return;
        }

        setIsIdentifyingUnit(true);
        try {
            const firstFrame = frames[0].url;
            const plate = await extractLicensePlate(firstFrame);
            if (plate) {
                setUnitId(plate);
                return;
            }

            const midFrame = frames[Math.floor(frames.length / 2)].url;
            const trailer = await extractTrailerNumber(midFrame);
            if (trailer) {
                setUnitId(trailer);
                return;
            }

            alert("No se pudo detectar identificación automática. Por favor ingrese el ID manualmente.");
        } catch (error) {
            console.error("Auto-ID Error:", error);
        } finally {
            setIsIdentifyingUnit(false);
        }
    };

    const extractFrames = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsProcessing(true);
        setCurrentStep(1);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        if (video.readyState < 2) {
            await new Promise(r => video.onloadeddata = r);
        }

        const duration = video.duration;
        const captureCount = 18;
        const interval = duration / captureCount;
        const newFrames: ScannedFrame[] = [];

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        for (let i = 0; i < captureCount; i++) {
            video.currentTime = i * interval;
            await new Promise(r => video.onseeked = r);

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const factor = 1.5;
            for (let j = 0; j < data.length; j += 4) {
                data[j] = Math.min(255, ((data[j] - 128) * factor) + 128);
                data[j + 1] = Math.min(255, ((data[j + 1] - 128) * factor) + 128);
                data[j + 2] = Math.min(255, ((data[j + 2] - 128) * factor) + 128);
            }
            ctx.putImageData(imageData, 0, 0);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

            newFrames.push({
                id: i + 1,
                url: dataUrl,
                status: 'ANALYZING',
                confidence: 0,
                timestamp: new Date().toISOString()
            });

            setFrames([...newFrames]);
            setProgress(Math.round(((i + 1) / captureCount) * 100));
        }

        setIsProcessing(false);
        setIsReadyToAnalyze(true);
    };

    const handleRegisterBaseline = async () => {
        if (!unitId) {
            alert("Por favor ingrese un ID de Unidad");
            return;
        }

        setIsProcessing(true);
        setDbStatus('SAVING');
        const enrichedFrames = [...frames];

        try {
            for (let i = 0; i < enrichedFrames.length; i++) {
                const frame = enrichedFrames[i];
                const metadata = await extractTireMetadata(frame.url);

                enrichedFrames[i] = {
                    ...frame,
                    status: 'CLEAN',
                    confidence: 1.0,
                    metadata: {
                        brand: metadata.marca || undefined,
                        model: metadata.modelo || undefined,
                        serial_number: metadata.serial_number || undefined,
                        depth_mm: metadata.profundidad_huella_mm || undefined
                    }
                };

                setFrames([...enrichedFrames]);
                setProgress(Math.round(((i + 1) / enrichedFrames.length) * 100));
                await new Promise(r => setTimeout(r, 4000));
            }

            const framesToSave = enrichedFrames
                .filter(f => f.metadata?.brand && f.metadata.brand !== 'Desconocido')
                .map(f => ({
                    id: f.id,
                    url: f.url,
                    metadata: f.metadata
                }));

            await dbService.saveBaseline(unitId, framesToSave);
            setDbStatus('SUCCESS');
            setIsProcessing(false);
            alert(`Huella Digital ENRIQUECIDA registrada para Unidad: ${unitId}`);

        } catch (error: any) {
            console.error("Registration Error:", error);
            setDbStatus('ERROR');
            setIsProcessing(false);
            alert("Error al registrar: " + error.message);
        }
    };

    const handleAuditAnalysis = async () => {
        if (!unitId) {
            alert("Por favor ingrese un ID de Unidad");
            return;
        }

        setIsProcessing(true);
        setCurrentStep(2);
        setProgress(0);
        setDbStatus('FETCHING');

        try {
            const baseline = await dbService.getBaseline(unitId);
            if (!baseline) {
                alert("No se encontró registro para esta unidad.");
                setIsProcessing(false);
                setDbStatus('ERROR');
                return;
            }

            const updatedFrames = [...frames];
            for (let i = 0; i < updatedFrames.length; i++) {
                const currentFrame = updatedFrames[i];
                const currentMetadata = await extractTireMetadata(currentFrame.url);
                const baselineFrame = baseline[i];

                if (baselineFrame && baselineFrame.metadata) {
                    const baselineBrand = baselineFrame.metadata.brand?.toUpperCase() || '';
                    const baselineModel = baselineFrame.metadata.model?.toUpperCase() || '';
                    const currentBrand = currentMetadata.marca?.toUpperCase() || '';
                    const currentModel = currentMetadata.modelo?.toUpperCase() || '';

                    const isMatch = (baselineBrand === currentBrand) && (baselineModel === currentModel);

                    updatedFrames[i] = {
                        ...currentFrame,
                        status: isMatch ? 'CLEAN' : 'ISSUE',
                        confidence: isMatch ? 1.0 : 0.0,
                        metadata: {
                            brand: currentMetadata.marca,
                            model: currentMetadata.modelo,
                            serial_number: currentMetadata.serial_number,
                            depth_mm: currentMetadata.profundidad_huella_mm
                        }
                    };
                } else {
                    updatedFrames[i] = {
                        ...currentFrame,
                        status: 'CLEAN',
                        confidence: 0,
                        metadata: {
                            brand: currentMetadata.marca,
                            model: currentMetadata.modelo,
                            serial_number: currentMetadata.serial_number,
                            depth_mm: currentMetadata.profundidad_huella_mm
                        }
                    };
                }

                setFrames([...updatedFrames]);
                setProgress(Math.round(((i + 1) / updatedFrames.length) * 100));
                await new Promise(r => setTimeout(r, 4000));
            }

            setDbStatus('SUCCESS');
            setIsProcessing(false);
            setCurrentStep(3);

        } catch (error) {
            console.error("Audit Error:", error);
            setIsProcessing(false);
            setDbStatus('ERROR');
            alert("Error durante la auditoría IA");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                        Arco <span className="text-brand">{t('sidebar.mobile_scan')}</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">{t('dashboard.monitoring_desc')}</p>
                </div>
                <div className="flex gap-2">
                    {steps.map((step, idx) => (
                        <div key={idx} className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${currentStep === idx
                            ? 'bg-brand/20 border-brand text-brand'
                            : currentStep > idx
                                ? 'bg-green-500/20 border-green-500 text-green-500'
                                : 'bg-zinc-900 border-white/5 text-zinc-600'
                            }`}>
                            <span>0{idx + 1}</span>
                            <span className="hidden md:inline">{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                <div className="flex-1">
                    <label className="text-xs font-black uppercase text-zinc-500 mb-1 block">ID de Unidad</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            className="w-full bg-black text-white pl-10 pr-24 p-2.5 rounded-lg border border-zinc-700 font-mono focus:border-brand outline-none"
                            placeholder="Ej. VISION-001"
                            value={unitId}
                            onChange={e => setUnitId(e.target.value)}
                        />
                        <button
                            onClick={handleAutoIdentify}
                            disabled={isIdentifyingUnit || frames.length === 0}
                            className="absolute right-1 top-1 bottom-1 px-3 bg-brand/10 hover:bg-brand/20 text-brand text-[10px] font-black uppercase tracking-widest rounded-md border border-brand/20 transition-all disabled:opacity-50"
                        >
                            {isIdentifyingUnit ? 'Buscando...' : 'Auto-ID'}
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    <label className="text-xs font-black uppercase text-zinc-500 mb-1 block">Modo Operativo</label>
                    <div className="flex bg-black p-1 rounded-lg border border-zinc-700">
                        <button
                            onClick={() => setMode('REGISTER')}
                            className={`flex-1 py-1.5 rounded font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors ${mode === 'REGISTER' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <Save size={14} /> Registrar Huella
                        </button>
                        <button
                            onClick={() => setMode('AUDIT')}
                            className={`flex-1 py-1.5 rounded font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors ${mode === 'AUDIT' ? 'bg-brand text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <AlertOctagon size={14} /> Auditoría
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${videoFile ? 'border-brand/50 bg-black' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-500'}`}>
                        <input type="file" accept="video/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                        {videoFile ? (
                            <div className="relative z-10">
                                <video ref={videoRef} src={videoUrl || ''} className="w-full aspect-video object-cover" controls={false} muted />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                                <Upload className="w-10 h-10 text-zinc-500 mb-6" />
                                <h3 className="text-xl font-black text-white uppercase mb-2">Sube tu Video</h3>
                            </div>
                        )}
                    </div>

                    {videoFile && !isProcessing && !isReadyToAnalyze && progress === 0 && (
                        <button onClick={extractFrames} className="w-full py-4 bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors flex items-center justify-center gap-3">
                            <Play className="fill-current w-4 h-4" /> Generar Fotogramas
                        </button>
                    )}

                    {isReadyToAnalyze && !isProcessing && (
                        <button onClick={mode === 'REGISTER' ? handleRegisterBaseline : handleAuditAnalysis} className={`w-full py-4 text-white rounded-xl font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3 shadow-lg ${mode === 'REGISTER' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand hover:bg-brand-dark animate-pulse'}`}>
                            {mode === 'REGISTER' ? <Save /> : <Zap />}
                            {mode === 'REGISTER' ? 'Guardar Huella Digital' : 'Ejecutar Auditoría Forense'}
                        </button>
                    )}

                    {(isProcessing || progress > 0) && (
                        <div className="bg-[#121214] border border-white/5 p-6 rounded-2xl space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black uppercase text-zinc-500">Progreso</span>
                                <span className="text-2xl font-black text-white">{progress}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-brand transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl p-6 h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white uppercase italic">Matriz de Inspección</h3>
                            <div className="flex gap-4 text-xs font-bold uppercase">
                                <span className="text-green-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Match</span>
                                <span className="text-red-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Mismatch</span>
                            </div>
                        </div>

                        {frames.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4 opacity-50">
                                <Smartphone className="w-24 h-24" />
                                <p className="font-black uppercase tracking-widest">Esperando video...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {frames.map(frame => (
                                    <FrameCard
                                        key={frame.id}
                                        frame={frame}
                                        onJustify={(f) => {
                                            setSelectedFrame(f);
                                            setJustificationModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedFrame && (
                <TireDisposalModal
                    isOpen={justificationModalOpen}
                    onClose={() => {
                        setJustificationModalOpen(false);
                        setSelectedFrame(null);
                    }}
                    tire={{
                        id: `audit-${unitId}-${selectedFrame.id}`,
                        unit_id: unitId,
                        position: `Llanta ${selectedFrame.id}`,
                        brand: selectedFrame.metadata?.brand || 'Desconocido',
                        model: selectedFrame.metadata?.model || 'Desconocido',
                        depth_mm: selectedFrame.metadata?.depth_mm || 0,
                        rim_condition: 'Auditoría',
                        serial_number: selectedFrame.metadata?.serial_number || '',
                        last_photo_url: selectedFrame.url,
                        status: SecurityAlert.ROJA,
                        history: []
                    } as InventoryTire}
                    onSuccess={async () => {
                        setFrames(prev => prev.map(f => f.id === selectedFrame.id ? { ...f, status: 'CLEAN' } : f));
                    }}
                />
            )}
        </div>
    );
};
