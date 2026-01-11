import React, { useState, useEffect } from 'react';
import { Search, Truck, ArrowRight, LayoutGrid, ListFilter } from 'lucide-react';
import { Unit } from '../../types';
import { dbService } from '../../services/db/dbService';
import { UnitDigitalTwin } from '../inventory/UnitDigitalTwin';

export const DigitalTwinView = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUnits();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredUnits(units);
        } else {
            const lower = search.toLowerCase();
            setFilteredUnits(units.filter(u =>
                u.plate_id.toLowerCase().includes(lower) ||
                (u.pipe_number && u.pipe_number.toLowerCase().includes(lower))
            ));
        }
    }, [search, units]);

    const loadUnits = async () => {
        try {
            const data = await dbService.getUnits();
            setUnits(data);
            setFilteredUnits(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center bg-black p-2 overflow-hidden min-h-0">
            <div className="flex w-full max-w-[1700px] h-full min-h-[700px] bg-black overflow-hidden relative rounded-[2.5rem] border border-white/5 shadow-2xl shadow-brand/5">
                {/* Left Panel: Unit List */}
                <div className="w-64 border-r border-white/5 bg-[#121214] flex flex-col h-full z-10 shrink-0">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-3">
                            <LayoutGrid className="text-brand" size={24} />
                            Digital Twin Hub
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar unidad..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand/50 placeholder:text-zinc-600 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {loading ? (
                            <div className="text-center py-10 text-zinc-500 text-sm">Cargando flota...</div>
                        ) : filteredUnits.map(unit => (
                            <button
                                key={unit.id}
                                onClick={() => setSelectedUnit(unit)}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-200 group relative border ${selectedUnit?.id === unit.id
                                    ? 'bg-white/10 border-brand/50 shadow-lg shadow-brand/10'
                                    : 'hover:bg-white/5 border-transparent hover:border-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-black tracking-tight ${selectedUnit?.id === unit.id ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                                        {unit.plate_id}
                                    </span>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${unit.status === 'ACTIVO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                                        }`}>
                                        {unit.status}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Truck size={12} />
                                    <span>{unit.type}</span>
                                    {unit.pipe_number && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                            <span className="text-zinc-400 font-mono">{unit.pipe_number}</span>
                                        </>
                                    )}
                                </div>

                                {/* Arrow Indicator */}
                                {selectedUnit?.id === unit.id && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand animate-in slide-in-from-left-2 fade-in">
                                        <ArrowRight size={16} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-zinc-900/50">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500 font-bold">TOTAL UNIDADES</span>
                            <span className="text-white font-mono font-bold bg-white/10 px-2 py-0.5 rounded">{units.length}</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Visualization */}
                <div className="flex-1 bg-black relative">
                    {selectedUnit ? (
                        <div className="w-full h-full animate-in fade-in duration-500">
                            {/* Embed the Digital Twin Component */}
                            <UnitDigitalTwin unit={selectedUnit} onClose={() => setSelectedUnit(null)} variant="embedded" />
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800 select-none">
                            <Truck size={120} strokeWidth={1} className="mb-6 opacity-20" />
                            <h2 className="text-2xl font-black uppercase tracking-widest opacity-40">Seleccione una Unidad</h2>
                            <p className="text-zinc-700 font-medium text-sm mt-2">Visualización en tiempo real del estado de llantas</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
