
import React from 'react';
import { 
  Navigation, 
  Map as MapIcon, 
  Search, 
  Layers, 
  Crosshair,
  Wifi,
  Truck
} from 'lucide-react';

interface MapViewProps {
  brandColor: string;
}

export const MapView: React.FC<MapViewProps> = ({ brandColor }) => {
  const activeUnits = [
    { id: 'GMS-01', x: '45%', y: '30%', status: 'MOVING' },
    { id: 'GMS-04', x: '60%', y: '55%', status: 'IDLE' },
    { id: 'SIM-101', x: '25%', y: '70%', status: 'MOVING' },
  ];

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-700">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
            Rastreo <span className="text-brand">Logístico IA</span>
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Geolocalización en Tiempo Real • Malla Digital</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-[#121214] border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500">12 Unidades Conectadas</span>
           </div>
        </div>
      </header>

      {/* Map Content Area */}
      <div className="flex-1 min-h-[500px] bg-[#0A0A0B] border border-white/5 rounded-[3rem] relative overflow-hidden group">
        
        {/* Radar/Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)',
               backgroundSize: '40px 40px'
             }} />
        
        {/* Decorative Scanned Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-white/5 rounded-full pointer-events-none" />
        
        {/* Scanning Sweep Effect */}
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-brand/10 to-transparent -translate-x-1/2 -translate-y-1/2 origin-center animate-scan-radar pointer-events-none" />

        {/* Units on Radar */}
        {activeUnits.map(unit => (
          <div 
            key={unit.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group/unit cursor-pointer"
            style={{ left: unit.x, top: unit.y }}
          >
            <div className="relative">
              {/* Pulsing ring */}
              <div className={`absolute inset-0 scale-[3] blur-xl rounded-full opacity-20 group-hover/unit:opacity-40 transition-opacity ${unit.status === 'MOVING' ? 'bg-brand' : 'bg-blue-500'}`} />
              
              {/* Unit Marker */}
              <div className={`w-3 h-3 rounded-full border-2 border-white shadow-2xl relative z-10 ${unit.status === 'MOVING' ? 'bg-brand' : 'bg-blue-500'}`} />
              
              {/* Label */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl opacity-0 translate-y-2 group-hover/unit:opacity-100 group-hover/unit:translate-y-0 transition-all duration-300">
                 <p className="text-[10px] font-black text-white uppercase tracking-widest">{unit.id}</p>
                 <p className={`text-[8px] font-bold uppercase ${unit.status === 'MOVING' ? 'text-brand' : 'text-blue-500'}`}>{unit.status}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Floating Controls */}
        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
           <div className="space-y-4">
              <button className="flex items-center gap-3 px-6 py-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                <Layers size={18} />
                Capas de Red
              </button>
              <button className="flex items-center gap-3 px-6 py-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                <Search size={18} />
                Buscar Unidad
              </button>
           </div>

           <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] w-80 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <Navigation className="text-brand" size={20} />
                 <h4 className="text-sm font-black uppercase tracking-widest">Coordenadas de Flota</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-zinc-500">Center Lat</span>
                    <span className="text-white">25.5439° N</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-zinc-500">Center Lng</span>
                    <span className="text-white">103.4006° W</span>
                 </div>
                 <div className="pt-4 border-t border-white/5">
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">Mostrando proyección Digital en Torreón, Coahuila.</p>
                 </div>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};
