import React, { useState, useEffect } from 'react';
import { X, Disc, Save, AlertCircle, Truck } from 'lucide-react';
import { dbService } from '../../services/db/dbService';
import { Unit } from '../../types';

interface AddTireModalProps {
    onClose: () => void;
    onTireAdded: () => void;
}

export const AddTireModal: React.FC<AddTireModalProps> = ({ onClose, onTireAdded }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [units, setUnits] = useState<Unit[]>([]);

    // Form State
    const [unitId, setUnitId] = useState('');
    const [positionIndex, setPositionIndex] = useState<number>(1);
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [depth, setDepth] = useState<string>('');
    const [serial, setSerial] = useState('');

    // Fetch units for dropdown
    useEffect(() => {
        dbService.getUnits().then(setUnits).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!unitId || !brand || !depth) {
            setError('Unidad, Marca y Profundidad son obligatorios');
            setLoading(false);
            return;
        }

        try {
            await dbService.mountTire({
                unit_id: unitId,
                position_index: positionIndex,
                brand: brand.toUpperCase(),
                model: model.toUpperCase(),
                depth_mm: parseFloat(depth),
                serial_number: serial.toUpperCase()
            });
            onTireAdded();
            onClose();
        } catch (err: any) {
            console.error("Error mounting tire:", err);
            setError(`Error: ${err.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand/10 rounded-xl text-brand">
                            <Disc size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Alta de Llanta</h3>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Montaje Manual / Reemplazo</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                            <AlertCircle size={20} />
                            <span className="text-xs font-bold">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Unit Selection */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Unidad</label>
                            <div className="relative">
                                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <select
                                    value={unitId}
                                    onChange={(e) => setUnitId(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold appearance-none focus:border-brand outline-none transition-colors"
                                >
                                    <option value="">Seleccionar Unidad</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.plate_id}>{u.plate_id} ({u.pipe_number})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Position */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Posición (1-18)</label>
                            <input
                                type="number"
                                min="1"
                                max="22"
                                value={positionIndex}
                                onChange={(e) => setPositionIndex(parseInt(e.target.value))}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 text-white font-bold focus:border-brand outline-none"
                            />
                        </div>

                        {/* Brand */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Marca</label>
                            <input
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value.toUpperCase())}
                                placeholder="MICHELIN"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 text-white font-bold focus:border-brand outline-none"
                            />
                        </div>

                        {/* Model */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Modelo</label>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value.toUpperCase())}
                                placeholder="X MULTI"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 text-white font-bold focus:border-brand outline-none"
                            />
                        </div>

                        {/* Depth */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Profundidad (mm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={depth}
                                onChange={(e) => setDepth(e.target.value)}
                                placeholder="15.0"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 text-white font-bold focus:border-brand outline-none"
                            />
                        </div>

                        {/* Serial (Optional) */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">N. Serie (Opcional)</label>
                            <input
                                type="text"
                                value={serial}
                                onChange={(e) => setSerial(e.target.value.toUpperCase())}
                                placeholder="XXX-000-YYY"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 text-white font-bold focus:border-brand outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs border border-white/10 hover:bg-white/5 transition-colors text-zinc-400"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-4 bg-brand hover:bg-brand/90 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={16} />
                                    Guardar Llanta
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
