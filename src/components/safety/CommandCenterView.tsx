import React, { useState, useRef, useEffect } from 'react';
import { Truck, Activity, Gauge, Droplet, Thermometer, Battery, MapPin, AlertTriangle, Eye, Play, Pause } from 'lucide-react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { telemetrySimulation, VehicleTelemetry } from '../../services/telemetry/simulation';
import { GeofenceService } from '../../services/telemetry/geofenceService';
import { BiometricMonitor } from './BiometricMonitor';
import { CabinScanner } from './CabinScanner';

interface CommandCenterViewProps {
    brandColor?: string;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({ brandColor = '#FFCC33' }) => {
    const [telemetry, setTelemetry] = useState<VehicleTelemetry | null>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showBiometrics, setShowBiometrics] = useState(false);
    const [showCabinAudit, setShowCabinAudit] = useState(false);
    const [camerasActive, setCamerasActive] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [currentZone, setCurrentZone] = useState<string>('En Ruta');
    const [selectedVehicle, setSelectedVehicle] = useState({
        unitId: 'T-800',
        driver: 'J. Pérez',
        driverId: 'USR-01',
        route: 'Monterrey → Laredo',
        status: 'En Ruta'
    });

    // Mock data - en producción vendría de Supabase
    const availableVehicles = [
        { unitId: 'T-800', driver: 'J. Pérez', driverId: 'USR-01', route: 'Monterrey → Laredo', status: 'En Ruta' },
        { unitId: 'T-750', driver: 'M. García', driverId: 'USR-02', route: 'Guadalajara → CDMX', status: 'En Ruta' },
        { unitId: 'T-650', driver: 'L. Rodríguez', driverId: 'USR-03', route: 'Querétaro → Puebla', status: 'Detenido' },
        { unitId: 'T-900', driver: 'C. Hernández', driverId: 'USR-04', route: 'Tijuana → Mexicali', status: 'En Ruta' },
    ];

    const roadPlayerRef = useRef<any>(null);
    const cabinPlayerRef = useRef<any>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);

    // Update telemetry and check geofence
    useEffect(() => {
        const interval = setInterval(() => {
            const data = telemetrySimulation.generateTelemetry();
            setTelemetry(data);

            // Check Geofence
            const fence = GeofenceService.checkGeofences(data.gps.lat, data.gps.lng);
            if (fence) {
                setCurrentZone(fence.name);
            } else {
                setCurrentZone('Sector Abierto');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Assign stream to video element when it becomes available
    useEffect(() => {
        if (camerasActive && cameraStream && videoRef2.current) {
            console.log('✅ Asignando stream a video element');
            videoRef2.current.srcObject = cameraStream;
            videoRef2.current.play().then(() => {
                console.log('▶️ Video playing');
            }).catch(err => {
                console.error('❌ Error playing video:', err);
            });
        }
    }, [camerasActive, cameraStream]);

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
            origin: window.location.origin, // Fix CORS issues
        },
    };

    const onRoadReady = (event: any) => {
        roadPlayerRef.current = event.target;
        if (isPlaying) event.target.playVideo();
    };

    const onCabinReady = (event: any) => {
        cabinPlayerRef.current = event.target;
        if (isPlaying) event.target.playVideo();
    };

    const togglePlayback = () => {
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
    };

    const toggleCameras = async () => {
        if (!camerasActive) {
            try {
                console.log('🎥 Solicitando acceso a cámara...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                console.log('✅ Stream obtenido:', stream);
                console.log('📹 Tracks de video:', stream.getVideoTracks());

                setCameraStream(stream);
                setCamerasActive(true);
                setCameraError('');
            } catch (err) {
                console.error('❌ Error al acceder a la cámara:', err);
                setCameraError('Error al acceder a la cámara');
            }
        } else {
            console.log('🛑 Desactivando cámaras...');
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => {
                    console.log('⏹️ Deteniendo track:', track.label);
                    track.stop();
                });
            }
            setCameraStream(null);
            setCamerasActive(false);
        }
    };

    const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
        if (value <= thresholds.good) return 'text-emerald-500';
        if (value <= thresholds.warning) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <Truck style={{ color: brandColor }} size={32} />
                            Command Center
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            {/* Vehicle Selector Dropdown */}
                            <div className="relative group">
                                <select
                                    value={selectedVehicle.unitId}
                                    onChange={(e) => {
                                        const vehicle = availableVehicles.find(v => v.unitId === e.target.value);
                                        if (vehicle) setSelectedVehicle(vehicle);
                                    }}
                                    style={{ color: brandColor, borderColor: `${brandColor}4D` }}
                                    className="appearance-none bg-zinc-900 pl-3 pr-8 py-2 rounded-xl border text-sm font-black uppercase tracking-tighter hover:border-white/30 transition-all cursor-pointer outline-none shadow-lg"
                                >
                                    {availableVehicles.map(v => (
                                        <option key={v.unitId} value={v.unitId} className="bg-zinc-900 text-white">
                                            {v.unitId} - {v.driver}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: brandColor }}>
                                    ▼
                                </div>
                            </div>

                            <span className="text-zinc-700">|</span>

                            <div className="flex items-center gap-2">
                                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Estado:</p>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${selectedVehicle.status === 'En Ruta'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${selectedVehicle.status === 'En Ruta' ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`} />
                                    {selectedVehicle.status}
                                </div>
                            </div>

                            <span className="text-zinc-700">|</span>

                            <div className="flex items-center gap-2">
                                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Zona Actual:</p>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider">
                                    <MapPin size={10} />
                                    {currentZone}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlayback}
                        className="h-9 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-white/5 flex items-center gap-2 transition-all text-xs font-bold shadow-lg"
                    >
                        {isPlaying ? <Pause size={14} style={{ color: brandColor }} /> : <Play size={14} style={{ color: brandColor }} />}
                        {isPlaying ? 'PAUSAR' : 'REPRODUCIR'}
                    </button>

                    <button
                        onClick={toggleCameras}
                        className={`h-9 px-4 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold shadow-lg ${camerasActive
                            ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
                            : 'bg-zinc-800 hover:bg-zinc-700 border-white/5 text-white'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${camerasActive ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`} />
                        {camerasActive ? 'DESACTIVAR' : 'ACTIVAR'}
                    </button>

                    <button
                        onClick={() => setShowBiometrics(true)}
                        disabled={!camerasActive}
                        className={`h-9 px-4 rounded-xl border transition-all flex items-center gap-2 text-xs font-black tracking-wider shadow-lg ${camerasActive
                            ? 'text-black hover:scale-[1.02] active:scale-95'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                        style={camerasActive ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                    >
                        <Eye size={14} />
                        MONITOREO IA
                    </button>

                    <button
                        onClick={() => setShowCabinAudit(true)}
                        disabled={!camerasActive}
                        className={`h-9 px-4 rounded-xl border transition-all flex items-center gap-2 text-xs font-black tracking-wider shadow-lg ${camerasActive
                            ? 'bg-zinc-900 border-white/10 text-white hover:bg-zinc-800'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                    >
                        <Activity size={14} style={{ color: brandColor }} />
                        AUDITORÍA IA
                    </button>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* ADAS - Road View */}
                <div className="relative bg-black rounded-xl overflow-hidden border border-white/10 aspect-video">
                    <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30">
                        <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">ADAS - Vista Frontal</span>
                    </div>
                    <YouTube
                        videoId="uONUfAWVoCY"
                        opts={youtubeOpts}
                        onReady={onRoadReady}
                        className="w-full h-full"
                        iframeClassName="w-full h-full object-cover"
                    />
                </div>

                {/* DMS - Driver View */}
                <div className="relative bg-black rounded-xl overflow-hidden border border-white/10 aspect-video">
                    <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/30">
                        <span className="text-blue-500 text-xs font-black uppercase tracking-widest">DMS - Conductor {camerasActive ? '🔴 LIVE' : ''}</span>
                    </div>
                    {camerasActive ? (
                        <video
                            ref={videoRef2}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                    ) : (
                        <YouTube
                            videoId="Q48qPTncX-E"
                            opts={youtubeOpts}
                            onReady={onCabinReady}
                            className="w-full h-full"
                            iframeClassName="w-full h-full object-cover grayscale-[30%]"
                        />
                    )}
                </div>
            </div>

            {/* Telemetry Dashboard */}
            {telemetry && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {/* Speed */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Gauge className="text-[#FFCC33]" size={20} />
                            <span className="text-zinc-400 text-xs font-bold uppercase">Velocidad</span>
                        </div>
                        <p className="text-3xl font-black text-white">{telemetry.speed}</p>
                        <p className="text-zinc-500 text-xs mt-1">km/h | Marcha {telemetry.gear}</p>
                    </div>

                    {/* RPM */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="text-emerald-500" size={20} />
                            <span className="text-zinc-400 text-xs font-bold uppercase">RPM</span>
                        </div>
                        <p className="text-3xl font-black text-white">{telemetry.rpm}</p>
                        <p className="text-zinc-500 text-xs mt-1">revoluciones/min</p>
                    </div>

                    {/* Fuel */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Droplet className={getStatusColor(100 - telemetry.fuelLevel, { good: 50, warning: 75 })} size={20} />
                            <span className="text-zinc-400 text-xs font-bold uppercase">Combustible</span>
                        </div>
                        <p className="text-3xl font-black text-white">{telemetry.fuelLevel}%</p>
                        <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${telemetry.fuelLevel}%` }}></div>
                        </div>
                    </div>

                    {/* Engine Temp */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Thermometer className={getStatusColor(telemetry.engineTemp, { good: 90, warning: 95 })} size={20} />
                            <span className="text-zinc-400 text-xs font-bold uppercase">Temp. Motor</span>
                        </div>
                        <p className="text-3xl font-black text-white">{telemetry.engineTemp}°C</p>
                        <p className="text-zinc-500 text-xs mt-1">Carga: {telemetry.cargoTemp}°C</p>
                    </div>
                </div>
            )}

            {/* Secondary Metrics */}
            {telemetry && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Ubicación GPS</p>
                                <p className="text-white font-mono text-sm">{telemetry.gps.lat.toFixed(4)}, {telemetry.gps.lng.toFixed(4)}</p>
                                <p className="text-zinc-500 text-xs mt-1">Rumbo: {telemetry.gps.heading}° | Alt: {Math.round(telemetry.gps.altitude)}m</p>
                            </div>
                            <MapPin className="text-blue-500" size={24} />
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Odómetro</p>
                                <p className="text-white font-mono text-lg font-bold">{telemetry.odometer.toLocaleString()} km</p>
                                <p className="text-zinc-500 text-xs mt-1">Viaje: {telemetry.tripDistance.toFixed(1)} km</p>
                            </div>
                            <Truck className="text-[#FFCC33]" size={24} />
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-xs font-bold uppercase mb-1">Sistema Eléctrico</p>
                                <p className="text-white font-mono text-lg font-bold">{telemetry.batteryVoltage}V</p>
                                <p className="text-zinc-500 text-xs mt-1">Presión aceite: {telemetry.oilPressure.toFixed(1)} PSI</p>
                            </div>
                            <Battery className="text-emerald-500" size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* Alerts Feed */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-black uppercase text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="text-[#FFCC33]" size={18} />
                    Alertas Recientes
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-500 font-mono text-xs">{new Date().toLocaleTimeString()}</span>
                        <span className="text-emerald-500">✓</span>
                        <span className="text-zinc-300">Sistema iniciado correctamente</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-zinc-500 font-mono text-xs">{new Date(Date.now() - 60000).toLocaleTimeString()}</span>
                        <span className="text-blue-500">ℹ</span>
                        <span className="text-zinc-300">Telemetría en tiempo real activa</span>
                    </div>
                    {camerasActive && (
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-zinc-500 font-mono text-xs">{new Date().toLocaleTimeString()}</span>
                            <span className="text-[#FFCC33]">●</span>
                            <span className="text-zinc-300">Cámaras de monitoreo activadas</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Biometric Monitor Modal */}
            {showBiometrics && (
                <BiometricMonitor
                    onClose={() => setShowBiometrics(false)}
                    externalStream={cameraStream || undefined}
                />
            )}

            {/* Cabin Audit Modal */}
            {showCabinAudit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <CabinScanner
                            onClose={() => setShowCabinAudit(false)}
                            onAlert={(result) => console.log("Alert from Command Center Audit:", result)}
                            preselectedDriver={{
                                id: selectedVehicle.driverId,
                                name: selectedVehicle.driver,
                                unit_assigned: selectedVehicle.unitId
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
