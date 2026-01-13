import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { X, Layout, Zap, Scan, Printer, Truck, Cog } from 'lucide-react';
import { SecurityAlert } from '../../types';

// Mock TireNode to prevent build failure if missing
const TireNode = ({ index }: { index: number }) => (
    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 font-bold">
        {index}
    </div>
);

export const UnitDigitalTwin = ({
    unit = { plate_id: 'UNKNOWN' },
    tires = [],
    onClose = () => { },
    variant = 'full'
}: any) => {
    const [viewMode, setViewMode] = useState('schematic');
    const [xrayVariant, setXrayVariant] = useState('v1');
    const [selectedTire, setSelectedTire] = useState<any>(null);
    const unitHealth = 92;

    const handlePrint = () => window.print();

    const generatePhotoReport = async () => {
        const doc = new jsPDF();
        const unitId = unit.plate_id || 'SIN-ID';
        const dateStr = new Date().toLocaleDateString();

        // --- HEADER ---
        doc.setFillColor(0, 0, 0); // Black header
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text(`REPORTE FOTOGRÁFICO DE UNIDAD: ${unitId}`, 10, 13);
        doc.setFontSize(10);
        doc.text(`FECHA: ${dateStr} | ESTADO: ${unitHealth}%`, 150, 13);

        // --- FILTER TIRES WITH PHOTOS ---
        // Mock data logic or use actual tires if they have photos loaded
        // For debugging/demo if no photos exist, we might want to warn
        const tiresWithPhotos = tires.filter(t => t.last_photo_url);

        if (tiresWithPhotos.length === 0) {
            alert("No hay fotos registradas para esta unidad.");
            return;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Total de Fotos: ${tiresWithPhotos.length}`, 10, 28);

        // --- GRID CONFIG ---
        const startX = 10;
        const startY = 35;
        const imgWidth = 35;  // Approx 3.5cm width
        const imgHeight = 35; // Square crop preference for grid
        const gapX = 3;
        const gapY = 10; // Space for label below image
        const cols = 5;  // 5 columns fits ~190mm width (35*5 + 3*4 = 187)

        let x = startX;
        let y = startY;

        // --- LOAD IMAGES HELPER ---
        const loadImage = (url: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = url;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg'));
                };
                img.onerror = () => resolve(''); // Resolve empty on error to not break flow
            });
        };

        // --- RENDER GRID ---
        for (let i = 0; i < tiresWithPhotos.length; i++) {
            const tire = tiresWithPhotos[i];

            // Check page break
            if (y + imgHeight > 280) {
                doc.addPage();
                y = 20; // Reset Y
            }

            try {
                // Determine Status Color for Label
                // doc.setFillColor(...) logic if desired for background behind text

                // Load and Add Image
                if (tire.last_photo_url) {
                    const imgData = await loadImage(tire.last_photo_url);
                    if (imgData) {
                        doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
                    } else {
                        // Placeholer rect
                        doc.setDrawColor(200);
                        doc.rect(x, y, imgWidth, imgHeight);
                        doc.text("Err", x + 10, y + 20);
                    }
                }

                // Add Label
                doc.setFontSize(7);
                doc.setFont("helvetica", "bold");
                doc.text(`Pos: ${tire.position}`, x, y + imgHeight + 4);
                doc.setFont("helvetica", "normal");
                doc.text(`${tire.status} | ${tire.depth_mm}mm`, x, y + imgHeight + 8);

            } catch (err) {
                console.error("Error adding image to PDF", err);
            }

            // Move Cursor
            x += imgWidth + gapX;
            if ((i + 1) % cols === 0) {
                x = startX;
                y += imgHeight + gapY;
            }
        }

        doc.save(`Reporte_Fotos_${unitId}.pdf`);
    };

    return (
        <div className={`digital-twin-container ${variant === 'modal' ? 'fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4' : 'w-full h-full flex flex-col bg-black'} animate-in fade-in duration-300`}>
            {/* ... styles ... */}
            <style>{`
                /* ... existing styles ... */
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
                {/* TOOLBAR */}
                <div className="w-full bg-[#09090b] border-b border-white/10 p-4 flex items-center shrink-0 z-[100] shadow-xl relative pointer-events-auto min-h-[80px]">
                    {/* ... Title & Health ... */}
                    <div className="flex flex-col relative z-30 shrink-0 mr-8">
                        {/* ... (keep existing code) ... */}
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

                    {/* Right: Controls */}
                    <div className="flex items-center gap-4 relative z-[200] pointer-events-auto">
                        <div className="flex items-center gap-3 p-1 bg-zinc-900 rounded-xl border border-white/10">
                            {/* ... (keep view switcher) ... */}
                            {viewMode === 'xray' && (
                                <div className="flex items-center gap-1 pl-2 border-r border-white/10 pr-2 mr-1">
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase">IMG:</span>
                                    <button onClick={() => setXrayVariant('v1')} className={`px-2 py-1 rounded text-[10px] font-black transition-all ${xrayVariant === 'v1' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}>STD</button>
                                    <button onClick={() => setXrayVariant('v2')} className={`px-2 py-1 rounded text-[10px] font-black transition-all ${xrayVariant === 'v2' ? 'bg-brand text-white' : 'text-zinc-500 hover:text-white'}`}>PRO</button>
                                </div>
                            )}
                            <button onClick={() => setViewMode('schematic')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'schematic' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}> <Layout size={14} /> <span className="text-[10px] font-black uppercase">Esquema</span> </button>
                            <button onClick={() => setViewMode('xray')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'xray' ? 'bg-brand text-white shadow-lg shadow-brand/40' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}> <Zap size={14} /> <span className="text-[10px] font-black uppercase">X-Ray</span> </button>
                        </div>

                        {/* NEW PDF PHOTO BUTTON */}
                        <button
                            onClick={generatePhotoReport}
                            className="bg-zinc-800 border border-emerald-500/30 hover:bg-emerald-500/10 px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-400 transition-all shadow-xl active:scale-95 group hide-on-print"
                        >
                            <Scan size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-wider">FOTOS PDF</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="bg-zinc-800 border border-white/10 hover:bg-zinc-700 px-4 py-2 rounded-xl flex items-center gap-2 text-white transition-all shadow-xl active:scale-95 group hide-on-print"
                        >
                            <Printer size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-wider">IMP.</span>
                        </button>

                        {/* Legend */}
                        <div className="bg-zinc-900 border border-white/5 py-2 px-3 rounded-full flex items-center gap-4 shadow-xl">
                            <div className="flex items-center gap-1.5"> <div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">OK</span> </div>
                            <div className="flex items-center gap-1.5"> <div className="w-2 h-2 rounded-full bg-amber-400"></div> <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">PREVENCIÓN</span> </div>
                            <div className="flex items-center gap-1.5"> <div className="w-2 h-2 rounded-full bg-red-500"></div> <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">CRÍTICO</span> </div>
                        </div>
                    </div>
                </div>

                {/* REST OF CONTENT */}
                <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 bg-black">
                    {/* ... (rest of logic: schematic/xray views) ... */}
                    {viewMode === 'schematic' ? (
                        // ... existing schematic code ...
                        <>
                            <div className="w-full h-[calc(100%-24px)] mb-6 overflow-x-auto overflow-y-hidden flex items-center pt-8 pb-20 px-12 z-10 scroll-smooth relative pointer-events-auto touch-pan-x cursor-grab active:cursor-grabbing border-b border-white/5 custom-scrollbar">
                                <div className="flex items-center gap-8 min-w-max h-full relative pr-[50vw]">
                                    {/* ... Tractor/Trailer code blocks ... */}
                                    <div className="w-16 h-36 bg-zinc-800 rounded-l-[3rem] border-y-2 border-l-2 border-zinc-700/50 relative -mr-4 z-0 opacity-40"></div>
                                    <div className="relative bg-[#1a1a1e] border-2 border-zinc-700/50 rounded-[4rem] w-[500px] h-64 p-8 flex items-center justify-between z-10 shadow-3xl shrink-0 group/tractor">
                                        {/* ... Tractor content ... */}
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

                                    <div className="w-16 h-2 flex items-center justify-center -mx-6 z-0 shrink-0 opacity-50">
                                        <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-inner"></div>
                                        <div className="flex-1 h-1.5 bg-zinc-800 border-y border-zinc-700"></div>
                                    </div>

                                    <div className="relative bg-[#1a1a1e] border-2 border-zinc-700/50 rounded-[4rem] w-[580px] h-64 p-8 flex items-center justify-end z-10 shadow-3xl shrink-0 group/pipa1">
                                        {/* ... Trailer 1 content ... */}
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

                                    <div className="w-12 h-1 bg-zinc-800 -mx-2 z-0 opacity-40 shrink-0"></div>

                                    <div className="relative bg-[#1a1a1e] border-2 border-zinc-700/50 rounded-[4rem] w-[580px] h-64 p-8 flex items-center justify-end z-10 shadow-3xl shrink-0 group/pipa2">
                                        {/* ... Trailer 2 content ... */}
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
                            {/* ... XRay View Content ... */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent)] pointer-events-none"></div>
                            <div className="relative w-full max-w-6xl aspect-video flex items-center justify-center group overflow-hidden rounded-[3rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                                <img
                                    src={xrayVariant === 'v2' ? "/digital_twin_xray_v2.jpg" : "/digital_twin_xray.png"}
                                    className="w-full h-full object-contain filter saturate-150 brightness-110 animate-pulse-slow scale-110"
                                    alt="X-Ray View"
                                    onError={(e) => {
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

                {/* Photo Modal */}
                {selectedTire && (
                    // ... modal code ...
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-8 animate-in fade-in duration-300"
                        onClick={() => setSelectedTire(null)}
                    >
                        <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setSelectedTire(null)} className="absolute -top-4 -right-4 p-3 bg-brand rounded-full hover:bg-brand/80 transition-all hover:scale-110 active:scale-95 z-10 shadow-lg shadow-brand/50">
                                <X size={24} className="text-white" />
                            </button>
                            <div className="bg-zinc-900 rounded-3xl overflow-hidden border-2 border-brand/30 shadow-2xl shadow-brand/20">
                                {selectedTire.last_photo_url ? (
                                    <img src={selectedTire.last_photo_url} className="w-full h-auto max-h-[80vh] object-contain" alt={`Llanta ${selectedTire.position}`} />
                                ) : (
                                    <div className="w-full h-96 flex flex-col items-center justify-center"> <Truck className="text-zinc-700 mb-6" size={80} /> <span className="text-zinc-500 text-lg font-black uppercase tracking-wider">Sin Foto Disponible</span> </div>
                                )}
                                <div className="p-6 bg-gradient-to-t from-black to-transparent">
                                    <div className="flex items-center justify-between">
                                        <div> <h3 className="text-2xl font-black text-white uppercase">Llanta {selectedTire.position}</h3> <p className="text-zinc-400 text-sm mt-1">{selectedTire.brand} - {selectedTire.model}</p> </div>
                                        <div className="text-right"> <div className="text-4xl font-black text-white">{selectedTire.depth_mm}<span className="text-lg text-zinc-500 ml-1">mm</span></div> <div className={`mt-2 px-4 py-1 rounded-full text-xs font-black ${selectedTire.status === SecurityAlert.ROJA ? 'bg-red-500/30 border border-red-500 text-red-500' : selectedTire.status === SecurityAlert.AMARILLA ? 'bg-amber-500/30 border border-amber-500 text-amber-500' : 'bg-emerald-500/30 border border-emerald-500 text-emerald-400'}`}> {selectedTire.status} </div> </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
