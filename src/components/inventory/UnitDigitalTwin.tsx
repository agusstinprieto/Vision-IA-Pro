import React, { useEffect, useState } from 'react';
import { X, Cog, Info, ArrowRight, Minimize2, Maximize2, Printer, Zap, Layout, Truck, Scan, ScanLine } from 'lucide-react';
import { Unit, InventoryTire, SecurityAlert } from '../../types';
import { dbService } from '../../services/db/dbService';

interface UnitDigitalTwinProps {
    unit: Unit;
    onClose?: () => void;
    variant?: 'modal' | 'embedded';
}

export const UnitDigitalTwin: React.FC<UnitDigitalTwinProps> = ({ unit, onClose, variant = 'modal' }) => {
    const [tires, setTires] = useState<InventoryTire[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTire, setSelectedTire] = useState<InventoryTire | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'schematic' | 'xray'>('schematic');
    const [xrayVariant, setXrayVariant] = useState<'v1' | 'v2'>('v2');

    const unitHealth = React.useMemo(() => {
        if (!tires || tires.length === 0) return 0;
        const totalLife = tires.reduce((acc, t) => {
            const lifePercent = Math.min(100, Math.max(0, (t.depth_mm / 20) * 100));
            return acc + lifePercent;
        }, 0);
        return Math.round(totalLife / tires.length);
    }, [tires]);

    const handlePrint = () => {
        const originalTitle = document.title;
        const unitId = unit.plate_id || 'Sin-ID';
        document.title = `${unitId} - Estado actual de llantas`;
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
        }, 500);
    };

    useEffect(() => {
        const loadTires = async () => {
            setLoading(true);
            try {
                // FALLBACK STRATEGY: Try fetching by Plate ID if database stores it that way
                let data = await dbService.getUnitTires(unit.id);

                if ((!data || data.length === 0) && unit.plate_id) {
                    console.warn(`[UnitDigitalTwin] No tires found for ID ${unit.id}, trying Plate ID ${unit.plate_id}`);
                    const dataByPlate = await dbService.getUnitTires(unit.plate_id);
                    if (dataByPlate && dataByPlate.length > 0) {
                        data = dataByPlate;
                    }
                }

                console.log("[UnitDigitalTwin] Tires loaded:", data?.length);
                setTires(data || []);
            } catch (error) {
                console.error("[UnitDigitalTwin] Error loading tires:", error);
            } finally {
                setLoading(false);
            }
        };
        loadTires();
    }, [unit.id, unit.plate_id]);

    useEffect(() => {
        if (selectedTire) {
            setIsSidebarOpen(true);
        }
    }, [selectedTire]);

    const getTireByPosition = (posIndex: number) => {
        if (!tires) return undefined;
        const exactMatch = tires.find(t => t.position === `Llanta ${posIndex}` || t.position === `${posIndex}`);
        if (exactMatch) return exactMatch;
        return tires.length >= posIndex ? tires[posIndex - 1] : undefined;
    };

    const TireNode = ({ index }: { index: number }) => {
        const tire = getTireByPosition(index);
        const isSelected = selectedTire?.id === tire?.id && tire !== undefined;
        const lifePercent = tire ? Math.round(Math.min(100, Math.max(0, (tire.depth_mm / 20) * 100))) : 0;

        const handleClick = (e: React.MouseEvent) => {
            if (tire) {
                e.stopPropagation();
                setSelectedTire(tire);
            }
        };

        const statusColor = !tire ? 'bg-zinc-800/20 border-zinc-700/30 opacity-20 border-2 border-dashed' :
            lifePercent < 40 ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' :
                lifePercent < 75 ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]' :
                    'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]';

        const borderColor = !tire ? 'border-transparent' :
            lifePercent < 40 ? 'border-red-400' :
                lifePercent < 75 ? 'border-amber-300' :
                    'border-emerald-400';

        return (
            <div
                onClick={handleClick}
                className={`tire-node relative group transition-all duration-300 ${tire ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'} ${isSelected ? 'scale-110 z-20' : ''}`}
            >
                <div className={`w-20 h-10 rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all ${statusColor} ${borderColor} ${isSelected ? 'ring-2 ring-white scale-110' : ''}`}>
                    <div className="flex items-center gap-1.5 w-full justify-center">
                        <span className="text-[10px] font-black">{index}</span>
                        {tire && <span className="text-[8px] font-black truncate uppercase tracking-tighter w-12 text-center opacity-80">{tire.brand?.split(' ')[0]}</span>}
                    </div>
                    {tire && (
                        <div className="flex flex-col items-center -mt-0.5 leading-none">
                            <span className="text-[11px] font-black tracking-tighter">{lifePercent}%</span>
                            <span className="text-[6px] font-black uppercase opacity-60 tracking-widest leading-none mt-0.5">{tire.serial_number?.slice(-4) || '----'}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`digital-twin-container ${variant === 'modal' ? 'fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4' : 'w-full h-full flex flex-col bg-black'} animate-in fade-in duration-300`}>
            <style>{`
                @media print {
                    @page { size: landscape; margin: 0; }
                    body * { visibility: hidden; }
                    .digital-twin-container, .digital-twin-container * { visibility: visible; }
                    .digital-twin-container {
                        position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
                        background: white !important; color: black !important;
                        z-index: 9999; padding: 0; align-items: flex-start; overflow: visible;
                    }
                    .hide-on-print { display: none !important; }
                    .bg-zinc-900, .bg-zinc-800, .bg-[#121214], .bg-[#0A0A0B] {
                        background-color: white !important; border: 2px solid black !important; box-shadow: none !important;
                    }
                    .tire-node div {
                        background-color: white !important; border: 1px solid black !important;
                        color: black !important; box-shadow: none !important;
                    }
                    .text-brand { color: black !important; font-weight: bold; }
                    .absolute.top-6.right-6 { display: none !important; }
                }

                .custom-scrollbar::-webkit-scrollbar { height: 16px; width: 16px; } /* Even thicker */
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(234, 73, 46, 0.1);
                    border-radius: 20px;
                    margin: 0 20px;
                    border: 1px solid rgba(234, 73, 46, 0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(234, 73, 46, 0.8); /* Much more visible */
                    border-radius: 20px;
                    border: 2px solid #121214;
                    box-shadow: 0 0 10px rgba(234, 73, 46, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background: rgba(234, 73, 46, 1);
                    box-shadow: 0 0 20px rgba(234, 73, 46, 0.8);
                }

                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(500%); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.8; filter: saturate(1.5) brightness(1.1); }
                    50% { opacity: 1; filter: saturate(2) brightness(1.3); }
                }
                .animate-scan-slow { animation: scan 4s linear infinite; }
                .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
            `}</style>

            {variant === 'modal' && onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50 text-white"
                >
                    <X size={24} />
                </button>
            )}

            <div className={`w-full ${variant === 'modal' ? 'max-w-[98vw] h-full max-h-[90vh]' : 'h-full flex flex-col relative'}`}>
                {/* ROBUST TOOLBAR HEADER - SIMPLIFIED & DEBUG MODE */}
                <div className="w-full bg-[#09090b] border-b border-white/10 p-4 flex items-center shrink-0 z-[100] shadow-xl relative pointer-events-auto min-h-[80px]">

                    {/* Left: Title & Health */}
                    <div className="flex flex-col relative z-30 shrink-0 mr-8">
                        <h2 className="text-xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 flex items-center gap-3">
                            <span className="text-brand">UNIDAD: {unit.plate_id || 'SIN ID'}</span>
                            {unit.plate_id && unit.plate_id.includes('PRUEBA') && <span className="bg-white/10 text-zinc-400 text-[10px] px-2 py-0.5 rounded">TEST MODE</span>}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest border-l-2 border-brand pl-2 italic">Gemelo Digital Activo</span>
                            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                                <div className={`h-1.5 w-16 bg-white/10 rounded-full overflow-hidden`}>
                                    <div
                                        className={`h-full transition-all duration-1000 ${unitHealth < 40 ? 'bg-red-500' : unitHealth < 75 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                        style={{ width: `${unitHealth}%` }}
                                    ></div>
                                </div>
                                <span className={`text-[10px] font-black ${unitHealth < 40 ? 'text-red-500' : unitHealth < 75 ? 'text-amber-400' : 'text-emerald-500'}`}>
                                    HEALTH: {unitHealth}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Controls - MOVED BESIDE TITLE - CLEAN LAYOUT */}
                    <div className="flex items-center gap-4 relative z-[200] pointer-events-auto">
                        <div className="flex items-center gap-3 p-1 bg-zinc-900 rounded-xl border border-white/10">
                            {viewMode === 'xray' && (
                                <div className="flex items-center gap-1 pl-2 border-r border-white/10 pr-2 mr-1">
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase">IMG:</span>
                                    <button
                                        onClick={() => setXrayVariant('v1')}
                                        className={`px-2 py-1 rounded text-[10px] font-black transition-all ${xrayVariant === 'v1' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        STD
                                    </button>
                                    <button
                                        onClick={() => setXrayVariant('v2')}
                                        className={`px-2 py-1 rounded text-[10px] font-black transition-all ${xrayVariant === 'v2' ? 'bg-brand text-white' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        PRO
                                    </button>
                                </div>
                            )}

                            {/* View Switcher buttons - Explicit Colors */}
                            <button
                                onClick={() => setViewMode('schematic')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'schematic' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Layout size={14} />
                                <span className="text-[10px] font-black uppercase">Esquema</span>
                            </button>
                            <button
                                onClick={() => setViewMode('xray')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'xray' ? 'bg-brand text-white shadow-lg shadow-brand/40' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Zap size={14} />
                                <span className="text-[10px] font-black uppercase">X-Ray</span>
                            </button>
                        </div>

                        <button
                            onClick={handlePrint}
                            className="bg-zinc-800 border border-white/10 hover:bg-zinc-700 px-4 py-2 rounded-xl flex items-center gap-2 text-white transition-all shadow-xl active:scale-95 group hide-on-print"
                        >
                            <Printer size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-wider">PDF</span>
                        </button>

                        {/* Legend - Always Visible */}
                        <div className="bg-zinc-900 border border-white/5 py-2 px-3 rounded-full flex items-center gap-4 shadow-xl">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">OK</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">PREVENCIÓN</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">CRÍTICO</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 bg-black">
                    {viewMode === 'schematic' ? (
                        <>
                            {/* Scroll Hint Indicator */}
                            <div className="absolute bottom-8 right-1/2 translate-x-1/2 z-50 pointer-events-none animate-bounce">
                                <div className="bg-brand/90 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/20 shadow-lg shadow-brand/50">
                                    <div className="flex items-center gap-3">
                                        <ArrowRight className="w-5 h-5 text-white animate-pulse" />
                                        <span className="text-white font-black text-xs uppercase tracking-wider">Desliza para ver Pipa 2</span>
                                        <ArrowRight className="w-5 h-5 text-white animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-[calc(100%-24px)] mb-6 overflow-x-auto overflow-y-hidden flex items-center pt-8 pb-20 px-12 z-10 scroll-smooth relative pointer-events-auto touch-pan-x cursor-grab active:cursor-grabbing border-b border-white/5 custom-scrollbar">
                                <div className="flex items-center gap-8 min-w-max h-full relative pr-[50vw]">
                                    {/* CABIN NOSE */}
                                    <div className="w-16 h-36 bg-zinc-800 rounded-l-[3rem] border-y-2 border-l-2 border-zinc-700/50 relative -mr-4 z-0 opacity-40"></div>

                                    {/* TRACTOR */}
                                    <div className="relative bg-[#1a1a1e] border-2 border-zinc-700/50 rounded-[4rem] w-[500px] h-64 p-8 flex items-center justify-between z-10 shadow-3xl shrink-0 group/tractor">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-800 px-6 py-1 rounded-full text-[10px] font-black uppercase text-zinc-500 border border-zinc-700 tracking-[0.3em] shadow-lg group-hover/tractor:text-brand transition-colors">TRACTOR</div>

                                        <div className="flex flex-col justify-between h-full border-r border-dashed border-zinc-800/80 pr-8">
                                            <div className="text-[8px] text-zinc-600 font-bold uppercase mb-2 text-center">Dir.</div>
                                            <TireNode index={1} />
                                            <div className="flex-1 w-px bg-zinc-800/50 mx-auto my-3"></div>
                                            <TireNode index={2} />
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-center opacity-10 group-hover/tractor:opacity-20 transition-all duration-700">
                                            <Cog size={72} className="text-zinc-500 animate-spin-slow mb-4" />
                                            <div className="text-[12px] font-black tracking-[0.4em] text-white uppercase italic leading-none">Chassis-A1</div>
                                        </div>

                                        <div className="flex gap-6 border-l border-dashed border-zinc-800/80 pl-8 h-full">
                                            <div className="flex flex-col justify-between h-full">
                                                <div className="text-[8px] text-zinc-600 font-bold uppercase mb-2 text-center">Tracc. 1</div>
                                                <div className="flex flex-col gap-3"><TireNode index={3} /><TireNode index={4} /></div>
                                                <div className="flex-1 w-full border-r border-zinc-800/50 mx-auto my-2"></div>
                                                <div className="flex flex-col gap-3"><TireNode index={5} /><TireNode index={6} /></div>
                                            </div>
                                            <div className="flex flex-col justify-between h-full">
                                                <div className="text-[8px] text-zinc-600 font-bold uppercase mb-2 text-center">Tracc. 2</div>
                                                <div className="flex flex-col gap-3"><TireNode index={7} /><TireNode index={8} /></div>
                                                <div className="flex-1 w-full border-r border-zinc-800/50 mx-auto my-2"></div>
                                                <div className="flex flex-col gap-3"><TireNode index={9} /><TireNode index={10} /></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FIFTH WHEEL CONNECTION */}
                                    <div className="w-16 h-2 flex items-center justify-center -mx-6 z-0 shrink-0 opacity-50">
                                        <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-inner"></div>
                                        <div className="flex-1 h-1.5 bg-zinc-800 border-y border-zinc-700"></div>
                                    </div>

                                    {/* TRAILER 1 */}
                                    <div className="relative bg-[#1a1a1e] border-2 border-zinc-700/50 rounded-[4rem] w-[580px] h-64 p-8 flex items-center justify-end z-10 shadow-3xl shrink-0 group/pipa1">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-800 px-6 py-1 rounded-full text-[10px] font-black uppercase text-zinc-500 border border-zinc-700 tracking-[0.3em] shadow-lg group-hover/pipa1:text-brand transition-colors">PIPA 1</div>
                                        <div className="absolute top-1/2 left-16 -translate-y-1/2 text-[10rem] font-black text-zinc-800/20 opacity-5 select-none group-hover/pipa1:opacity-10 transition-opacity">01</div>

                                        <div className="flex gap-6 h-full pl-12 border-l border-dashed border-zinc-800/30">
                                            <div className="flex flex-col justify-between h-full">
                                                <div className="text-[8px] text-zinc-600 font-bold uppercase mb-2 text-center">Eje 1</div>
                                                <div className="flex flex-col gap-3"><TireNode index={11} /><TireNode index={12} /></div>
                                                <div className="flex-1 w-full border-r border-zinc-800/50 mx-auto my-2"></div>
                                                <div className="flex flex-col gap-3"><TireNode index={13} /><TireNode index={14} /></div>
                                            </div>
                                            <div className="flex flex-col justify-between h-full">
                                                <div className="text-[8px] text-zinc-600 font-bold uppercase mb-2 text-center">Eje 2</div>
                                                <div className="flex flex-col gap-3"><TireNode index={15} /><TireNode index={16} /></div>
                                                <div className="flex-1 w-full border-r border-zinc-800/50 mx-auto my-2"></div>
                                                <div className="flex flex-col gap-3"><TireNode index={17} /><TireNode index={18} /></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONNECTOR 2 */}
                                    <div className="w-12 h-1 bg-zinc-800 -mx-2 z-0 opacity-40 shrink-0"></div>

                                    {/* TRAILER 2 */}
                                    <div className="relative bg-[#1a1a1e] border-2 border-zinc-700/50 rounded-[4rem] w-[580px] h-64 p-8 flex items-center justify-end z-10 shadow-3xl shrink-0 group/pipa2">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-800 px-6 py-1 rounded-full text-[10px] font-black uppercase text-zinc-500 border border-zinc-700 tracking-[0.3em] shadow-lg group-hover/pipa2:text-brand transition-colors">PIPA 2</div>
                                        <div className="absolute top-1/2 left-16 -translate-y-1/2 text-[10rem] font-black text-zinc-800/20 opacity-5 select-none group-hover/pipa2:opacity-10 transition-opacity">02</div>

                                        <div className="flex gap-6 h-full pl-12 border-l border-dashed border-zinc-800/30">
                                            <div className="flex flex-col justify-between h-full">
                                                <div className="text-[8px] text-zinc-600 font-bold uppercase mb-2 text-center">Eje 3</div>
                                                <div className="flex flex-col gap-3"><TireNode index={19} /><TireNode index={20} /></div>
                                                <div className="flex-1 w-full border-r border-zinc-800/50 mx-auto my-2"></div>
                                                <div className="flex flex-col gap-3"><TireNode index={21} /><TireNode index={22} /></div>
                                            </div>
                                            <div className="flex flex-col justify-between h-full">
                                                <div className="text-[8px] text-zinc-600 font-bold uppercase mb-2 text-center">Eje 4</div>
                                                <div className="flex flex-col gap-3"><TireNode index={23} /><TireNode index={24} /></div>
                                                <div className="flex-1 w-full border-r border-zinc-800/50 mx-auto my-2"></div>
                                                <div className="flex flex-col gap-3"><TireNode index={25} /><TireNode index={26} /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 relative flex items-center justify-center overflow-hidden p-12 animate-in zoom-in-95 duration-1000">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent)] pointer-events-none"></div>
                            <div className="relative w-full max-w-6xl aspect-video flex items-center justify-center group overflow-hidden rounded-[3rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                                <img
                                    src={xrayVariant === 'v2' ? "/digital_twin_xray_v2.jpg" : "/digital_twin_xray.png"}
                                    className="w-full h-full object-contain filter saturate-150 brightness-110 animate-pulse-slow scale-110"
                                    alt="X-Ray View"
                                    onError={(e) => {
                                        // Fallback to original if v2 doesn't exist
                                        if (xrayVariant === 'v2') (e.target as HTMLImageElement).src = '/digital_twin_xray.png';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-40 w-full animate-scan-slow opacity-60"></div>

                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <div className="bg-black/80 backdrop-blur-2xl border border-cyan-500/40 px-10 py-5 rounded-[2.5rem] flex flex-col items-center shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.6em] mb-3">Deep Forensic Audit Module</span>
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-3 border-r border-white/10 pr-8">
                                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b6d4]"></div>
                                                <span className="text-[10px] font-black text-white uppercase italic tracking-widest">Neural Link Est.</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-2">
                                                CORE STATUS: <span className="text-emerald-400 font-black">100% NOMINAL</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating Details Drawer */}
                <div
                    className={`absolute top-0 right-0 h-full w-[440px] bg-[#141416]/98 backdrop-blur-3xl border-l border-white/10 p-10 flex flex-col z-50 shadow-[-30px_0_60px_rgba(0,0,0,0.6)] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen && selectedTire ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
                >
                    {selectedTire && (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="bg-brand text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-brand/20">Audit Report</span>
                                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{selectedTire.id.slice(-10).toUpperCase()}</span>
                                    </div>
                                    <h3 className="text-4xl font-black text-white uppercase tracking-tight">Pos. {selectedTire.position}</h3>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all text-zinc-500 hover:text-white border border-white/5 active:scale-90"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-10 pr-4">
                                <div className="aspect-[16/10] bg-zinc-900 rounded-[3rem] overflow-hidden border border-white/10 relative group shrink-0 shadow-3xl">
                                    {selectedTire.last_photo_url ? (
                                        <img src={selectedTire.last_photo_url} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" alt="Tire" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                            <Truck className="text-zinc-800 mb-4 opacity-20" size={64} />
                                            <span className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">NO VISUAL LOG</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/30 to-transparent">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">Current Tread Depth</div>
                                                <div className="text-5xl font-black text-white leading-none">{selectedTire.depth_mm}<span className="text-xl text-zinc-500 ml-2 italic tracking-tighter">mm</span></div>
                                            </div>
                                            <div className={`px-5 py-2 rounded-full text-[10px] font-black border backdrop-blur-md uppercase tracking-[0.1em] ${selectedTire.status === SecurityAlert.ROJA ? 'bg-red-500/30 border-red-500 text-red-500 animate-pulse' :
                                                selectedTire.status === SecurityAlert.AMARILLA ? 'bg-amber-500/30 border-amber-500 text-amber-500' :
                                                    'bg-emerald-500/30 border-emerald-500 text-emerald-400'
                                                }`}>
                                                Status: {selectedTire.status}
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${selectedTire.status === SecurityAlert.ROJA ? 'bg-red-500' : selectedTire.status === SecurityAlert.AMARILLA ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(100, (selectedTire.depth_mm / 20) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="bg-[#1c1c1f] p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm group hover:border-brand/30 transition-all duration-500 shadow-xl">
                                        <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-2">Manufacturer</div>
                                        <div className="text-lg font-black text-white truncate group-hover:text-brand transition-colors">{selectedTire.brand}</div>
                                    </div>
                                    <div className="bg-[#1c1c1f] p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm group hover:border-brand/30 transition-all duration-500 shadow-xl">
                                        <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-2">Model Design</div>
                                        <div className="text-lg font-black text-white truncate group-hover:text-brand transition-colors">{selectedTire.model}</div>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden shadow-inner">
                                    <div className="absolute -top-10 -right-10 p-4 opacity-[0.03]">
                                        <Info size={160} />
                                    </div>
                                    <div className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3 italic">
                                        <div className="w-6 h-px bg-brand"></div>
                                        Wear Intelligence Log
                                    </div>
                                    <div className="space-y-6">
                                        {selectedTire.history?.length > 0 ? selectedTire.history.map((h, i) => (
                                            <div key={i} className="flex justify-between items-center group/row p-1 rounded-xl hover:bg-white/5 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{new Date(h.date).toLocaleDateString()}</span>
                                                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">REF# {h.id?.slice(-8).toUpperCase() || 'SYS-LOG'}</span>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className={`text-base font-black italic tracking-tighter ${h.depth_mm < 5 ? 'text-red-500' : 'text-zinc-300'}`}>{h.depth_mm} mm</span>
                                                    <div className={`w-12 h-1.5 rounded-full overflow-hidden bg-white/5 border border-white/5`}>
                                                        <div className={`h-full ${h.depth_mm < 5 ? 'bg-red-500' : 'bg-zinc-700'}`} style={{ width: `${(h.depth_mm / 20) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center py-12 text-zinc-800">
                                                <Minimize2 size={40} strokeWidth={1} className="mb-4 opacity-10" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.5em] italic opacity-30 text-center">Initial Baseline Entry Only</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-8">
                                <button className="w-full bg-brand text-white font-black uppercase tracking-[0.2em] py-5 rounded-[2rem] shadow-[0_20px_40px_rgba(234,73,46,0.2)] hover:bg-brand/90 active:scale-[0.97] transition-all flex items-center justify-center gap-3">
                                    <Scan size={20} className="animate-pulse" />
                                    Launch New Audit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
