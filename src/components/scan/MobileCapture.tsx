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
            // Try to find plate in first few frames
            const firstFrame = frames[0].url;
            console.log("🔍 Intentando identificar unidad desde fotograma 1...");

            const plate = await extractLicensePlate(firstFrame);
            if (plate) {
                setUnitId(plate);
                console.log("✅ Placa detectada:", plate);
                return;
            }

            // If no plate, try trailer number in mid frames
            const midFrame = frames[Math.floor(frames.length / 2)].url;
            console.log("🔍 Intentando identificar remolque desde fotograma medio...");
            const trailer = await extractTrailerNumber(midFrame);
            if (trailer) {
                setUnitId(trailer);
                console.log("✅ Remolque detectado:", trailer);
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
        const captureCount = 18; // One frame per tire (18-wheeler)
        const interval = duration / captureCount;
        const newFrames: ScannedFrame[] = [];

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        for (let i = 0; i < captureCount; i++) {
            video.currentTime = i * interval;
            await new Promise(r => video.onseeked = r);

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Enhance contrast for better OCR (tire sidewall text)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const factor = 1.5; // Contrast multiplier
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, ((data[i] - 128) * factor) + 128);     // R
                data[i + 1] = Math.min(255, ((data[i + 1] - 128) * factor) + 128); // G
                data[i + 2] = Math.min(255, ((data[i + 2] - 128) * factor) + 128); // B
            }
            ctx.putImageData(imageData, 0, 0);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Higher quality

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

        // Start AI Enrichment Process
        setIsProcessing(true);
        setDbStatus('SAVING');
        const total = frames.length;
        const enrichedFrames = [...frames];

        try {
            for (let i = 0; i < total; i++) {
                const frame = enrichedFrames[i];

                // Call AI to get Brand/DOT/Wear
                const metadata = await extractTireMetadata(frame.url);

                enrichedFrames[i] = {
                    ...frame,
                    status: 'CLEAN',
                    confidence: 1.0,
                    metadata: {
                        brand: metadata.marca || undefined,
                        model: metadata.modelo || undefined,
                        serial_number: metadata.serial_number || undefined,
                        depth_mm: metadata.profundidad_huella_mm || undefined,
                        rim_condition: metadata.estado_rin || undefined
                    }
                };

                // Update UI visually
                setFrames([...enrichedFrames]);
                setProgress(Math.round(((i + 1) / total) * 100));

                // Throttle for Free Tier (Reduced to 4s for testing)
                await new Promise(r => setTimeout(r, 4000));
            }

            // Save to DB (only frames with valid tire data)
            const framesToSave = enrichedFrames
                .filter(f => f.metadata?.brand && f.metadata.brand !== 'Desconocido')
                .map(f => ({
                    id: f.id,
                    url: f.url,
                    metadata: f.metadata
                }));

            console.log(`💾 Saving ${framesToSave.length} tires (filtered from ${enrichedFrames.length} frames)`);
            console.log("PAYLOAD INSPECTION:", JSON.stringify(framesToSave[0]?.metadata, null, 2)); // DEBUG
            await dbService.saveBaseline(unitId, framesToSave);
            setDbStatus('SUCCESS');
            setIsProcessing(false);
            alert(`Huella Digital ENRIQUECIDA registrada para Unidad: ${unitId}\n${framesToSave.length} llantas detectadas`);

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
            // 1. Get Baseline
            const baseline = await dbService.getBaseline(unitId);
            if (!baseline) {
                alert("No se encontró registro (Huella Digital) para esta unidad. Por favor regístrela primero.");
                setIsProcessing(false);
                setDbStatus('ERROR');
                return;
            }

            // 2. Analyze Delta (Current Frames vs Baseline Metadata)
            const updatedFrames = [...frames];
            const total = frames.length;

            for (let i = 0; i < total; i++) {
                const currentFrame = frames[i];

                // Extract metadata from current frame
                const currentMetadata = await extractTireMetadata(currentFrame.url);

                // Find matching baseline frame by position (same index)
                const baselineFrame = baseline[i];

                if (baselineFrame && baselineFrame.metadata) {
                    // Compare metadata (brand and model)
                    const baselineBrand = baselineFrame.metadata.brand?.toUpperCase() || '';
                    const baselineModel = baselineFrame.metadata.model?.toUpperCase() || '';
                    const currentBrand = currentMetadata.marca?.toUpperCase() || '';
                    const currentModel = currentMetadata.modelo?.toUpperCase() || '';

                    const brandMatch = baselineBrand === currentBrand;
                    const modelMatch = baselineModel === currentModel;
                    const isMatch = brandMatch && modelMatch;

                    console.log(`🔍 Frame ${i + 1}: Baseline(${baselineBrand} ${baselineModel}) vs Current(${currentBrand} ${currentModel}) = ${isMatch ? '✅ MATCH' : '🔴 MISMATCH'}`);

                    updatedFrames[i] = {
                        ...currentFrame,
                        status: isMatch ? 'CLEAN' : 'ISSUE',
                        confidence: (brandMatch && modelMatch) ? 1.0 : 0.0,
                        metadata: {
                            brand: currentMetadata.marca,
                            model: currentMetadata.modelo,
                            serial_number: currentMetadata.serial_number,
                            depth_mm: currentMetadata.profundidad_huella_mm,
                            rim_condition: currentMetadata.estado_rin
                        }
                    };
                } else {
                    // No baseline metadata to compare
                    updatedFrames[i] = {
                        ...currentFrame,
                        status: 'CLEAN',
                        confidence: 0,
                        metadata: {
                            brand: currentMetadata.marca,
                            model: currentMetadata.modelo,
                            serial_number: currentMetadata.serial_number,
                            depth_mm: currentMetadata.profundidad_huella_mm,
                            rim_condition: currentMetadata.estado_rin
                        }
                    };
                }

                setFrames([...updatedFrames]);
                setProgress(Math.round(((i + 1) / total) * 100));

                // Add delay to avoid Rate Limits
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
                    <p className="text-zinc-500 font-medium">
                        {t('dashboard.monitoring_desc')}
                    </p>
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

            {/* Controls - Unit ID & Mode */}
            <div className="flex flex-col md:flex-row gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                <div className="flex-1">
                    <label className="text-xs font-black uppercase text-zinc-500 mb-1 block">ID de Unidad (Placa/Económico)</label>
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

            {/* Upload / Video Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    {/* Upload Card */}
                    <div className={`
                        relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300
                        ${videoFile ? 'border-brand/50 bg-black' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-500'}
                     `}>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />

                        {videoFile ? (
                            <div className="relative z-10">
                                <video
                                    ref={videoRef}
                                    src={videoUrl || ''}
                                    className="w-full aspect-video object-cover"
                                    controls={false}
                                    muted
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                    <p className="text-white font-black uppercase">Cambiar Video</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                    <Upload className="w-10 h-10 text-zinc-500" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase mb-2">Sube tu Video</h3>
                                <p className="text-sm text-zinc-500 max-w-xs">
                                    Arrastra un archivo MP4 o MOV aquí, o haz clic para seleccionar desde tu dispositivo.
                                </p>
                            </div>
                        )}
                    </div>

                    {videoFile && !isProcessing && !isReadyToAnalyze && progress === 0 && (
                        <button
                            onClick={extractFrames}
                            className="w-full py-4 bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors flex items-center justify-center gap-3"
                        >
                            <Play className="fill-current w-4 h-4" />
                            Generar Fotogramas
                        </button>
                    )}

                    {isReadyToAnalyze && !isProcessing && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            {mode === 'REGISTER' ? (
                                <button
                                    onClick={handleRegisterBaseline}
                                    disabled={dbStatus === 'SUCCESS'}
                                    className={`w-full py-4 text-white rounded-xl font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3 shadow-lg ${dbStatus === 'SUCCESS' ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {dbStatus === 'SUCCESS' ? <CheckCircle2 /> : <Save />}
                                    {dbStatus === 'SUCCESS' ? 'Huella Guardada' : 'Guardar Huella Digital'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleAuditAnalysis}
                                    className="w-full py-4 bg-brand text-white rounded-xl font-black uppercase tracking-widest hover:bg-brand-dark transition-colors flex items-center justify-center gap-3 shadow-lg shadow-brand/20 animate-pulse"
                                >
                                    <Zap className="fill-current" />
                                    Ejecutar Auditoría Forense
                                </button>
                            )}
                        </div>
                    )}

                    {(isProcessing || progress > 0) && (
                        <div className="bg-[#121214] border border-white/5 p-6 rounded-2xl space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black uppercase text-zinc-500">Progreso del Sistema</span>
                                <span className="text-2xl font-black text-white">{progress}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand transition-all duration-300 ease-out relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]" />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-400 font-mono">
                                {currentStep === 1 ? 'Extrayendo cuadros clave...' :
                                    mode === 'REGISTER' ? 'Guardando en Base de Datos...' : 'Comparando con Huella Digital (Gemini AI)...'}
                            </p>
                        </div>
                    )}

                    {/* Hidden Canvas for Processing */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Output Grid */}
                <div className="lg:col-span-2">
                    <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl p-6 h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white uppercase italic">
                                Matriz de Inspección <span className="text-zinc-600 text-sm not-italic ml-2">(36 Puntos)</span>
                            </h3>
                            <div className="flex gap-4 text-xs font-bold uppercase">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <div className="w-2 h-2 rounded-full bg-zinc-700" /> Pendiente
                                </div>
                                <div className="flex items-center gap-2 text-green-500">
                                    <div className="w-2 h-2 rounded-full bg-green-500" /> Match
                                </div>
                                <div className="flex items-center gap-2 text-red-500">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Mismatch
                                </div>
                            </div>
                        </div>

                        {frames.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4 opacity-50">
                                <Smartphone className="w-24 h-24" />
                                <p className="font-black uppercase tracking-widest">Esperando entrada de video...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {frames.map((frame) => (
                                    <div
                                        key={frame.id}
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
                                                                setSelectedFrame(frame);
                                                                setJustificationModalOpen(true);
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
                                                        <p className="text-[10px] font-black uppercase text-white tracking-wider">
                                                            {frame.metadata.brand || 'Marca Desc.'}
                                                        </p>
                                                        <p className="text-[9px] text-zinc-300 font-mono">
                                                            {frame.metadata.model}
                                                        </p>
                                                        {frame.metadata.serial_number && (
                                                            <p className="text-[8px] text-yellow-400 font-mono tracking-tighter mt-0.5">
                                                                DOT: {frame.metadata.serial_number}
                                                            </p>
                                                        )}
                                                        {frame.metadata.depth_mm && (
                                                            <div className="mt-1 inline-block bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-brand-400 border border-brand/20">
                                                                {frame.metadata.depth_mm}mm
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Justification Modal (Reusing TireDisposalModal) */}
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
                        // Mark frame as justified visually
                        setFrames(prev => prev.map(f =>
                            f.id === selectedFrame.id ? { ...f, status: 'CLEAN' } : f
                        ));
                    }}
                />
            )}
        </div>
    );
};
