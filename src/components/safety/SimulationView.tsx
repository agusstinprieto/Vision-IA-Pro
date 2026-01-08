import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, AlertTriangle, Activity, Truck, Eye } from 'lucide-react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { BiometricMonitor } from './BiometricMonitor';

export const SimulationView = () => {
    const roadPlayerRef = useRef<any>(null);
    const cabinPlayerRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [fatigueScore, setFatigueScore] = useState(0);
    const [speed, setSpeed] = useState(85);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [videoError, setVideoError] = useState<{ road: boolean, cabin: boolean }>({ road: false, cabin: false });
    const [camerasActive, setCamerasActive] = useState(false);
    const [useLocalVideos, setUseLocalVideos] = useState(false); // Fallback to local videos if YouTube fails
    const [showBiometrics, setShowBiometrics] = useState(false);

    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);

    // Simulated metrics update
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            // Fluctuate speed between 80-95 km/h
            setSpeed(prev => {
                const change = (Math.random() - 0.5) * 2;
                const newSpeed = Math.min(95, Math.max(80, prev + change));
                return Number(newSpeed.toFixed(0));
            });

            // Fluctuate fatigue slightly
            setFatigueScore(prev => {
                const change = (Math.random() - 0.5) * 5;
                const newScore = Math.min(100, Math.max(0, prev + change));
                return Number(newScore.toFixed(0));
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying]);

    const togglePlayback = () => {
        if (useLocalVideos) {
            // Control HTML5 video elements
            if (roadPlayerRef.current && cabinPlayerRef.current) {
                if (isPlaying) {
                    roadPlayerRef.current.pause();
                    cabinPlayerRef.current.pause();
                } else {
                    roadPlayerRef.current.play();
                    cabinPlayerRef.current.play();
                }
                setIsPlaying(!isPlaying);
            }
        } else {
            // Control YouTube players
            if (roadPlayerRef.current && cabinPlayerRef.current) {
                if (isPlaying) {
                    roadPlayerRef.current.pauseVideo();
                    cabinPlayerRef.current.pauseVideo();
                } else {
                    roadPlayerRef.current.playVideo();
                    cabinPlayerRef.current.playVideo();
                }
                setIsPlaying(!isPlaying);
            }
        }
    };

    const toggleCameras = async () => {
        if (camerasActive) {
            // Deactivate cameras
            if (videoRef1.current?.srcObject) {
                const stream = videoRef1.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef1.current.srcObject = null;
            }
            if (videoRef2.current?.srcObject) {
                const stream = videoRef2.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef2.current.srcObject = null;
            }
            setCamerasActive(false);
            setCameraError(null);
        } else {
            // Activate cameras
            setCameraError(null);
            try {
                console.log("Requesting camera access...");
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());

                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                console.log("Found cameras:", videoDevices.length);

                if (videoDevices.length === 0) {
                    setCameraError("No webcams found.");
                    return;
                }

                if (videoRef1.current) {
                    try {
                        const s1 = await navigator.mediaDevices.getUserMedia({
                            video: { deviceId: videoDevices[0].deviceId ? { exact: videoDevices[0].deviceId } : undefined }
                        });
                        videoRef1.current.srcObject = s1;
                    } catch (e) {
                        console.error("Error accessing Cam 1", e);
                    }
                }

                if (videoRef2.current) {
                    try {
                        if (videoDevices.length > 1) {
                            const s2 = await navigator.mediaDevices.getUserMedia({
                                video: { deviceId: { exact: videoDevices[1].deviceId } }
                            });
                            videoRef2.current.srcObject = s2;
                        } else {
                            const s1_reuse = await navigator.mediaDevices.getUserMedia({
                                video: { deviceId: videoDevices[0].deviceId ? { exact: videoDevices[0].deviceId } : undefined }
                            });
                            videoRef2.current.srcObject = s1_reuse;
                        }
                    } catch (e) {
                        console.error("Error accessing Cam 2", e);
                    }
                }

                setCamerasActive(true);
            } catch (err: any) {
                console.error("Camera Error:", err);
                setCameraError("Acceso denegado. Revise permisos.");
            }
        }
    };

    useEffect(() => {
        // Auto-start cameras on mount
        toggleCameras();
    }, []);

    // YouTube player options
    const youtubeOpts: YouTubeProps['opts'] = {
        width: '100%',
        height: '100%',
        playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            disablekb: 1,
        },
    };

    const onRoadReady = (event: any) => {
        roadPlayerRef.current = event.target;
        event.target.playVideo();
    };

    const onCabinReady = (event: any) => {
        cabinPlayerRef.current = event.target;
        event.target.playVideo();
    };

    const onRoadEnd = (event: any) => {
        event.target.playVideo(); // Loop manually
    };

    const onCabinEnd = (event: any) => {
        event.target.playVideo(); // Loop manually
    };

    return (
        <div className="h-full bg-black p-1 flex flex-col gap-1 overflow-hidden">
            {/* Compact Header */}
            <div className="flex justify-between items-center bg-zinc-900/80 px-4 py-2 rounded-lg border border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <Activity className="text-blue-500 w-5 h-5" />
                        CENTRO DE <span className="text-blue-500">CONTROL IA</span>
                    </h2>
                    <div className="h-4 w-px bg-white/20"></div>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest hidden sm:block">T-800 • J. Pérez</p>

                    <button
                        onClick={toggleCameras}
                        className={`ml-4 text-xs text-white px-3 py-1 rounded border transition-colors flex items-center gap-2 ${camerasActive
                            ? 'bg-red-600 hover:bg-red-700 border-red-500/30'
                            : 'bg-zinc-800 hover:bg-zinc-700 border-white/10'
                            }`}
                        title={camerasActive ? "Desactivar cámaras" : "Activar cámaras"}
                    >
                        {camerasActive ? '🔴 Desactivar' : '📸 Activar'}
                    </button>
                    <button
                        onClick={() => setShowBiometrics(true)}
                        disabled={!camerasActive}
                        className={`ml-2 text-xs text-black px-3 py-1 rounded border transition-all flex items-center gap-2 font-bold ${camerasActive
                            ? 'bg-[#FFCC33] hover:bg-[#FFCC33]/80 border-[#FFCC33] shadow-lg active:scale-95'
                            : 'bg-zinc-700 border-zinc-600 cursor-not-allowed opacity-50'
                            }`}
                        title={camerasActive ? "Iniciar Monitoreo de Fatiga y Estrés" : "Activa las cámaras primero"}
                    >
                        <Eye size={14} /> MONITOREO BIOMÉTRICO
                    </button>
                    <button
                        onClick={() => {
                            const event = new CustomEvent('show-cabin-audit');
                            window.dispatchEvent(event);
                        }}
                        title="Ejecutar Auditoría Profunda con Google Gemini"
                        className="ml-2 text-xs text-white px-3 py-1 rounded border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 transition-all flex items-center gap-2 font-bold"
                    >
                        <Shield size={14} /> AUDITORÍA IA (GEMINI)
                    </button>
                    {cameraError && <span className="text-red-500 text-[10px] font-bold animate-pulse">{cameraError}</span>}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-md border border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Velocidad</span>
                        <span className="text-xl font-black text-white font-mono leading-none">{speed} <span className="text-[10px] text-zinc-600">km/h</span></span>
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-md border border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Fatiga</span>
                        <span className={`text-xl font-black font-mono leading-none ${fatigueScore > 70 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {fatigueScore}%
                        </span>
                    </div>

                    <button
                        onClick={togglePlayback}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                    >
                        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>
                </div>
            </div>

            {/* Video Grid 2x2 - Maximized */}
            <div className="grid grid-cols-2 grid-rows-2 gap-1 flex-1 min-h-0">

                {/* 1. Road View (Video File) */}
                <div className="relative bg-black rounded-lg overflow-hidden border border-white/10 group h-full w-full">
                    <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">ADAS Frontal</span>
                    </div>

                    {videoError.road && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 space-y-2 p-2">
                            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                            <p className="text-red-500 text-[10px] font-mono">VIDEO ERROR</p>
                            <p className="text-zinc-500 text-[9px]">/demo/road.mp4</p>
                            <button
                                onClick={() => setVideoError(prev => ({ ...prev, road: false }))}
                                className="mt-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    <div className={`absolute inset-0 flex items-center justify-center bg-zinc-900/50 -z-10 ${videoError.road ? 'hidden' : 'animate-pulse'}`}>
                        <span className="text-[10px] text-zinc-600">Cargando...</span>
                    </div>

                    {!useLocalVideos ? (
                        <YouTube
                            videoId="uONUfAWVoCY"
                            opts={youtubeOpts}
                            onReady={onRoadReady}
                            onEnd={onRoadEnd}
                            onError={() => {
                                console.log("YouTube failed, switching to local video");
                                setUseLocalVideos(true);
                            }}
                            className="w-full h-full"
                            iframeClassName="w-full h-full object-cover opacity-90"
                        />
                    ) : (
                        <video
                            ref={roadPlayerRef}
                            src="/demo/road.mp4"
                            className="w-full h-full object-cover opacity-90"
                            loop
                            muted
                            autoPlay
                            playsInline
                            onError={() => setVideoError(prev => ({ ...prev, road: true }))}
                        />
                    )}
                    {isPlaying && !videoError.road && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute bottom-0 left-[20%] w-[10%] h-[40%] border-r-2 border-emerald-500/50 skew-x-[40deg]"></div>
                            <div className="absolute bottom-0 right-[20%] w-[10%] h-[40%] border-l-2 border-emerald-500/50 -skew-x-[40deg]"></div>
                            <div className="absolute top-[40%] left-[45%] w-[10%] h-[10%] border-2 border-yellow-400/70 rounded-lg">
                                <div className="absolute -top-3 left-0 bg-yellow-400 text-black text-[7px] font-bold px-1">VEHICLE 98%</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Cabin View (Video File) */}
                <div className="relative bg-black rounded-lg overflow-hidden border border-white/10 group h-full w-full">
                    <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">DMS Cabina</span>
                    </div>

                    {videoError.cabin && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 space-y-2 p-2">
                            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                            <p className="text-red-500 text-[10px] font-mono">VIDEO ERROR</p>
                            <p className="text-zinc-500 text-[9px]">/demo/cabin.mp4</p>
                            <button
                                onClick={() => setVideoError(prev => ({ ...prev, cabin: false }))}
                                className="mt-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {!useLocalVideos ? (
                        <YouTube
                            videoId="Q48qPTncX-E"
                            opts={youtubeOpts}
                            onReady={onCabinReady}
                            onEnd={onCabinEnd}
                            onError={() => {
                                console.log("YouTube failed, switching to local video");
                                setUseLocalVideos(true);
                            }}
                            className="w-full h-full"
                            iframeClassName="w-full h-full object-cover opacity-90 grayscale-[30%] sepia-[20%]"
                        />
                    ) : (
                        <video
                            ref={cabinPlayerRef}
                            src="/demo/cabin.mp4"
                            className="w-full h-full object-cover opacity-90 grayscale-[30%] sepia-[20%]"
                            loop
                            muted
                            autoPlay
                            playsInline
                            onError={() => setVideoError(prev => ({ ...prev, cabin: true }))}
                        />
                    )}
                    {isPlaying && !videoError.cabin && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-[30%] left-[40%] w-[20%] h-[30%] border-2 border-blue-500/50 rounded-lg">
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500/20">
                                    <div className="h-full bg-blue-500/80 w-[80%] animate-pulse"></div>
                                </div>
                                <div className="absolute top-[30%] left-[30%] w-1.5 h-1.5 bg-green-400/80 rounded-full"></div>
                                <div className="absolute top-[30%] right-[30%] w-1.5 h-1.5 bg-green-400/80 rounded-full"></div>
                            </div>
                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                                <div className="bg-black/50 backdrop-blur px-2 py-0.5 rounded border border-white/10 text-[9px] text-green-400 font-mono">EYES: OPEN</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Live Laptop Cam 1 */}
                <div className="relative bg-black rounded-lg overflow-hidden border border-white/10 group h-full w-full">
                    <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Cam A (J. Pérez)</span>
                    </div>
                    <video ref={videoRef1} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>

                {/* 4. Live Laptop Cam 2 */}
                <div className="relative bg-black rounded-lg overflow-hidden border border-white/10 group h-full w-full">
                    <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Cam B (Cabina)</span>
                    </div>
                    <video ref={videoRef2} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                </div>

            </div>

            {/* Biometric Monitor Modal */}
            {showBiometrics && (
                <BiometricMonitor
                    onClose={() => setShowBiometrics(false)}
                    externalStream={videoRef1.current?.srcObject as MediaStream | undefined}
                />
            )}
        </div>
    );
};
