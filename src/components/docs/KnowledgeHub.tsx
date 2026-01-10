import React, { useState } from 'react';
import { Search, Truck, Disc, FileText, ChevronRight, Download, Tag, Info } from 'lucide-react';

interface VehicleConfig {
    id: string;
    name: string;
    type: string;
    tags: string[];
    tires: number;
    price: string;
    image_url: string;
    specs: {
        axles: number;
        length: string;
        capacity: string;
    };
}

interface TireProduct {
    id: string;
    size: string;
    brand: string;
    model: string;
    price: string;
    type: string;
    image_url: string;
    features: string[];
}

export const KnowledgeHub = () => {
    const [activeTab, setActiveTab] = useState<'FLEET' | 'TIRES'>('FLEET');
    const [searchTerm, setSearchTerm] = useState('');

    const vehicles: VehicleConfig[] = [
        {
            id: 'FULL-01',
            name: 'Full Trailer (Doble Remolque)',
            type: 'Heavy Duty',
            tags: ['T3-S2-R4', 'IA.AGUS'],
            tires: 34,
            price: '$1,250,000 MXN',
            image_url: '/assets/demo/trailer_full_scanner.jpg',
            specs: { axles: 9, length: '31m', capacity: '60 Ton' }
        },
        {
            id: 'PIPA-01',
            name: 'Pipa 42K (Combugas)',
            type: 'Hazardous Mat',
            tags: ['T3-S3', 'Clean Energy', 'Fuel'],
            tires: 18,
            price: '$980,000 MXN',
            image_url: '/assets/demo/trailer_combugas_clean.png',
            specs: { axles: 6, length: '18m', capacity: '42,000 L' }
        },
        {
            id: 'SEMI-01',
            name: 'Sencillo (Caja Seca)',
            type: 'Standard',
            tags: ['T3-S3', 'Logística'],
            tires: 18,
            price: '$650,000 MXN',
            image_url: '/assets/demo/trailer_sencillo_clean.png',
            specs: { axles: 6, length: '18m', capacity: '30 Ton' }
        }
    ];

    const tireCatalog: TireProduct[] = [
        {
            id: 'T-295',
            size: '295/80R22.5',
            brand: 'RED-TECH',
            model: 'RT-Pro Haul',
            price: '$8,450 MXN',
            type: 'Direccional / Tracción',
            image_url: '/assets/demo/tire_3d_laser.png',
            features: ['Heavy Duty Construction', 'Smart RFID Ready', 'Cool Running Compound']
        },
        {
            id: 'T-11R22',
            size: '11R22.5',
            brand: 'MICHELIN',
            model: 'X Multi Energy Z',
            price: '$9,200 MXN',
            type: 'Toda Posición',
            image_url: '/assets/demo/tire_catalog.png',
            features: ['Baja Resistencia al Rodamiento', 'Carcasa Renovable', 'Kilometraje Extendido']
        },
        {
            id: 'T-11R24',
            size: '11R24.5',
            brand: 'BRIDGESTONE',
            model: 'M726 EL',
            price: '$10,100 MXN',
            type: 'Tracción Profunda',
            image_url: '/assets/demo/tire_optimal.png',
            features: ['32/32 Profundidad', 'Stone Ejectors', 'Bloques Sólidos']
        },
        {
            id: 'T-315',
            size: '315/80R22.5',
            brand: 'CONTINENTAL',
            model: 'Conti Coach',
            price: '$11,500 MXN',
            type: 'Autobús / Carga',
            image_url: '/assets/demo/tire_red_tech_315.png',
            features: ['Confort de Marcha', 'Agarre en Mojado', 'Sensores TPMS']
        }
    ];

    return (
        <div className="p-6 h-full flex flex-col space-y-8 animate-in fade-in zoom-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand/10 border border-brand/20 rounded-xl">
                            <FileText className="text-brand w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                                Knowledge <span className="text-brand">Hub</span>
                            </h1>
                            <p className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase">
                                Biblioteca Técnica IA.AGUS v3.1
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-96 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar marcas, modelos o medidas..."
                        className="w-full bg-[#121214] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 focus:border-brand/50 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/5 pb-1">
                <button
                    onClick={() => setActiveTab('FLEET')}
                    className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'FLEET' ? 'text-brand' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Configuración de Flota
                    </div>
                    {activeTab === 'FLEET' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand shadow-[0_0_10px_rgba(234,73,46,0.5)]" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('TIRES')}
                    className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'TIRES' ? 'text-brand' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Disc className="w-4 h-4" />
                        Catálogo de Llantas
                    </div>
                    {activeTab === 'TIRES' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand shadow-[0_0_10px_rgba(234,73,46,0.5)]" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'FLEET' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} className="group relative bg-[#121214] border border-white/5 rounded-[2rem] overflow-hidden hover:border-brand/30 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Truck className="w-32 h-32 text-white" />
                                </div>

                                <div className="p-8 relative z-10">
                                    <div className="flex gap-3 mb-6 flex-wrap">
                                        {vehicle.tags.map(tag => (
                                            <span key={tag} className="bg-brand text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {tag}
                                            </span>
                                        ))}
                                        <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">
                                            {vehicle.tires} Llantas
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-black italic uppercase text-white mb-2 leading-none">
                                        {vehicle.name}
                                    </h3>
                                    <div className="text-brand font-black text-xl mb-6">
                                        {vehicle.price} <span className="text-xs text-zinc-500 font-medium align-middle">MXN (Est.)</span>
                                    </div>

                                    <div className="h-48 w-full mb-8 bg-black/50 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors overflow-hidden relative">
                                        <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="block text-[9px] text-zinc-500 font-black uppercase tracking-wider mb-1">Ejes</span>
                                            <span className="text-lg font-bold text-white">{vehicle.specs.axles}</span>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="block text-[9px] text-zinc-500 font-black uppercase tracking-wider mb-1">Longitud</span>
                                            <span className="text-lg font-bold text-white">{vehicle.specs.length}</span>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="block text-[9px] text-zinc-500 font-black uppercase tracking-wider mb-1">Capacidad</span>
                                            <span className="text-lg font-bold text-white">{vehicle.specs.capacity}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 flex justify-between items-center group-hover:bg-brand/10 transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-brand transition-colors">
                                        Ver Ficha Técnica
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-brand transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Featured Tire Spec */}
                        <div className="w-full bg-gradient-to-r from-zinc-900 to-black border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-2/3 h-full bg-brand/5 blur-3xl -skew-x-12 translate-x-1/2" />

                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 mb-6">
                                        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                                        <span className="text-brand font-black text-xs uppercase tracking-[0.2em]">Estándar Global VISION IA PRO</span>
                                    </div>

                                    <h2 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter mb-4 shadow-brand drop-shadow-[0_0_15px_rgba(234,73,46,0.3)]">
                                        295<span className="text-3xl text-zinc-600">/</span>80<span className="text-3xl text-zinc-500">R22.5</span>
                                    </h2>

                                    <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-8 max-w-md">
                                        La configuración definitiva para larga distancia. Optimización de combustible, durabilidad térmica y tracción superior en condiciones extremas.
                                    </p>

                                    <div className="mt-8 flex gap-4">
                                        <button
                                            onClick={() => {
                                                pdfService.generateTechnicalSpec({
                                                    size: '295/80R22.5',
                                                    brand: 'RED-TECH',
                                                    model: 'RT-Pro Haul',
                                                    type: 'Larga Distancia',
                                                    features: ['Optimización de combustible', 'Durabilidad térmica', 'Tracción superior']
                                                });
                                            }}
                                            className="bg-brand text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-brand-dark transition-all transform hover:scale-105 shadow-xl shadow-brand/20">
                                            Descargar Ficha Técnica
                                        </button>
                                    </div>
                                </div>

                                <div className="relative h-[300px] flex items-center justify-center">
                                    <div className="absolute inset-0 bg-brand/20 blur-[100px] rounded-full" />
                                    <img
                                        src="/assets/demo/tire_3d_laser.png"
                                        alt="295/80R22.5 Spec"
                                        className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-1000 slide-in-from-right-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tire Catalog Grid */}
                        <div className="pt-8">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                <Tag className="text-brand" /> Medidas y Especificaciones Técnicas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {tireCatalog.map(tire => (
                                    <div key={tire.id} className="bg-[#121214] border border-white/5 rounded-3xl p-6 group hover:border-brand/30 transition-all">
                                        <div className="aspect-square bg-black/40 rounded-2xl mb-4 p-4 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/10 transition-colors" />
                                            <img src={tire.image_url} alt={tire.size} className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                        </div>

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-[10px] font-black text-brand uppercase tracking-widest">{tire.brand}</p>
                                                <h4 className="text-xl font-bold text-white">{tire.size}</h4>
                                            </div>
                                            <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold text-zinc-300">
                                                {tire.type}
                                            </div>
                                        </div>

                                        <p className="text-sm text-zinc-500 font-medium mb-4">{tire.model}</p>

                                        <ul className="space-y-1 mb-6">
                                            {tire.features.map((feat, i) => (
                                                <li key={i} className="text-[10px] text-zinc-400 flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-brand rounded-full" /> {feat}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                            <span className="text-lg font-black text-white">{tire.price}</span>
                                            <button className="p-2 rounded-lg bg-white/5 hover:bg-brand hover:text-white transition-all text-zinc-500">
                                                <Info size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
