
import React, { useState } from 'react';
import { SecureCamera } from '../camera/SecureCamera';
import { ImageCategory } from '../../types';

interface TireScannerProps {
    tripId: string;
    plateId: string;
    tireCount: number;
    onComplete: (images: { position: string, blob: Blob }[]) => void;
}

export const TireScanner: React.FC<TireScannerProps> = ({ tripId, plateId, tireCount, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [capturedImages, setCapturedImages] = useState<{ position: string, blob: Blob }[]>([]);

    const positions = [
        'Front Left', 'Front Right',
        'Rear Left Outer', 'Rear Left Inner',
        'Rear Right Inner', 'Rear Right Outer',
        // ... add more based on tireCount
    ].slice(0, tireCount);

    const handleCapture = (blob: Blob) => {
        const newImage = { position: positions[currentStep], blob };
        const updatedImages = [...capturedImages, newImage];
        setCapturedImages(updatedImages);

        if (currentStep < positions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(updatedImages);
        }
    };

    const progress = ((currentStep + 1) / positions.length) * 100;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end mb-2 text-white">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">REVISIÓN DE NEUMÁTICOS</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">CANTIDAD A REVISAR: {positions.length} LLANTAS</p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-[#EA492E]">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
                <div
                    className="h-full bg-[#EA492E] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="relative">
                <SecureCamera
                    active={true}
                    tripId={tripId}
                    plateId={plateId}
                    onCapture={handleCapture}
                />

                {/* Driver Photography Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-12">
                    <div className="w-full h-full border-4 border-dashed border-[#EA492E]/30 rounded-[3rem] flex items-center justify-center">
                        <div className="text-center opacity-40">
                            <div className="w-24 h-40 border-2 border-[#EA492E] rounded-xl mx-auto mb-4 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full border border-[#EA492E]" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#EA492E]">Encuadre la Llanta Aquí</p>
                        </div>
                    </div>
                </div>

                <div className="absolute top-0 right-0 p-2 md:p-8 text-right pointer-events-none z-[60]">
                    <div className="bg-black/60 backdrop-blur-md p-3 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl">
                        <p className="text-[7px] md:text-[10px] text-[#EA492E] font-black uppercase tracking-widest mb-0.5">POSICIÓN ACTUAL</p>
                        <p className="text-sm md:text-2xl font-black text-white uppercase tracking-tighter mb-1 md:mb-4">{positions[currentStep]}</p>

                        <div className="hidden md:block space-y-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                            <p className="flex items-center gap-2"><span className="w-1 h-1 bg-[#EA492E] rounded-full" /> Distancia: 1 Metro</p>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 bg-[#EA492E] rounded-full" /> Ángulo: Perpendicular</p>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 bg-[#EA492E] rounded-full" /> Fondo: Nítido</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-6 gap-2 mt-4">
                {positions.map((pos, idx) => (
                    <div
                        key={idx}
                        className={`h-1 rounded-full ${idx <= currentStep ? 'bg-[#EA492E]' : 'bg-zinc-800'}`}
                    />
                ))}
            </div>
        </div>
    );
};
