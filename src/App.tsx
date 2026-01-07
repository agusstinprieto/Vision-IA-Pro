
import React, { useState } from 'react';
import { TireScanner } from './components/inspection/TireScanner';
import { ResultView } from './components/inspection/ResultView'; // NEW
import { SecurityAlert, TripData, ForensicAuditResult } from './types';
import { getPreviousTripData } from './services/db/mockDB'; // NEW
import { analyzeInspectionDelta } from './services/ai/gemini'; // NEW

// Industrial Color Palette
const COLORS = {
  brand: '#EA492E',
  bg: '#0A0A0B',
  surface: '#121214',
  border: '#1E1E21',
  textMuted: '#636366'
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'qr-scan' | 'inspection' | 'results'>('dashboard');
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]); // NEW
  const [isAnalyzing, setIsAnalyzing] = useState(false); // NEW

  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    { id: 'EV-901', unit: 'GMS-01', event: 'ENTRY', gate: 'GATE-01 (Torreón)', utilization: '8.5h', status: 'PASSED', time: '10:30 AM' },
    { id: 'EV-902', unit: 'GMS-04', event: 'EXIT', gate: 'GATE-02 (Matriz)', status: 'PASSED', time: '11:45 AM' },
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-['Inter'] selection:bg-[#EA492E] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#EA492E] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,73,46,0.3)]">
              <span className="text-xl font-black">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">SIMSA <span className="opacity-40 text-[#EA492E]">VISION IA</span></h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">IA Industrial Audit & Logistics</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#121214] border border-[#1E1E21] px-6 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">System: Online</span>
            </div>
          </div>
        </header>

        {view === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Action Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#121214] border border-[#1E1E21] rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA492E]/5 blur-[100px] -z-10 group-hover:bg-[#EA492E]/10 transition-all" />

                <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-tight">Control Tower <br /><span className="text-blue-500">Fixed Gate IA</span></h2>
                <p className="text-zinc-500 text-lg mb-10 max-w-sm font-medium">Monitoreo automático de arcos perimetrales. Captura desatendida SIN intervención del chofer.</p>

                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => setView('qr-scan')}
                    className="bg-[#EA492E] hover:bg-[#EA492E]/80 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(234,73,46,0.3)] hover:shadow-[0_0_50px_rgba(234,73,46,0.5)] flex items-center gap-3"
                  >
                    <span>Simular Escaneo</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </button>
                  <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl hidden xl:block">
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Estado Arcos</p>
                    <p className="text-white font-black">12/12 ONLINE</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Utilización Promedio', val: '84%', color: 'blue-500' },
                  { label: 'Alertas Llantas', val: '03', color: 'red-500' },
                  { label: 'Tráfico 24h', val: '128', color: 'zinc' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#121214] border border-[#1E1E21] p-8 rounded-[2rem]">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-4">{stat.label}</p>
                    <p className={`text-4xl font-black text-${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar / Audit Log */}
            <div className="bg-[#121214] border border-[#1E1E21] rounded-[2.5rem] p-10 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-black uppercase tracking-widest">Actividad</h3>
                <span className="text-[10px] bg-zinc-800 px-3 py-1 rounded-full text-zinc-400 font-bold">LIVE</span>
              </div>

              <div className="space-y-6 flex-1">
                {auditLog.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group">
                    <div className={`w-2 h-12 rounded-full ${item.status === 'PASSED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1 group-hover:text-[#EA492E] transition-colors">{item.type}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">UNIT: {item.unit}</p>
                      <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-8 text-xs font-black uppercase tracking-widest text-[#EA492E] hover:opacity-80 transition-opacity">Ver todo el historial ↗</button>
            </div>

          </div>
        ) : view === 'qr-scan' ? (
          <div className="max-w-3xl mx-auto text-center">
            <button
              onClick={() => setView('dashboard')}
              className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-12 hover:text-white transition-colors block mx-auto"
            >
              ← Cancelar
            </button>
            <div className="bg-[#121214] border border-[#1E1E21] p-12 rounded-[3rem] space-y-8">
              <div className="w-24 h-24 bg-yellow/10 rounded-3xl flex items-center justify-center mx-auto text-yellow border border-yellow/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h.01" /><path d="M7 12h.01" /><path d="M7 17h.01" /><path d="M12 7h.01" /><path d="M12 12h.01" /><path d="M12 17h.01" /><path d="M17 7h.01" /><path d="M17 12h.01" /><path d="M17 17h.01" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Escanee el QR de la Unidad</h3>
                <p className="text-zinc-500 text-sm font-medium">Capture la placa de metal grabada cerca de la puerta del conductor.</p>
              </div>
              <div className="aspect-square w-64 mx-auto bg-black rounded-3xl border-4 border-zinc-800 relative overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => {
                setActiveTrip({
                  id: 'TRP-' + Math.floor(Math.random() * 10000),
                  truck_id: 'TRK-402',
                  driver_id: 'USR-01',
                  status: 'IN_PROGRESS',
                  start_time: new Date().toISOString(),
                  alert_level: SecurityAlert.VERDE
                });
                setView('inspection');
              }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#EA492E]/20 to-transparent animate-scan" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Simular Escaneo</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setView('dashboard')}
              className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-12 hover:text-white transition-colors"
            >
              ← Volver al Dashboard
            </button>

            <TireScanner
              tripId={activeTrip?.id || ''}
              plateId={activeTrip?.truck_id || 'SIM-4022'}
              tireCount={2} // Reduced for demo speed (was 6)
              onComplete={async (imgs) => {
                console.log('Inspection Complete:', imgs);
                setIsAnalyzing(true);

                // 1. Fetch Previous Data
                const previousData = await getPreviousTripData('TRK-402'); // Mocked ID

                // 2. Run AI Analysis for each image
                const results = await Promise.all(imgs.map(async (img) => {
                  // Helper to convert Blob to Base64
                  const reader = new FileReader();
                  const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      resolve(base64.split(',')[1]); // Remove header
                    };
                    reader.readAsDataURL(img.blob);
                  });
                  const currentBase64 = await base64Promise;

                  // Get Previous Image URL (Mocked)
                  const prevImgUrl = previousData?.images.find(p => p.position === img.position)?.url || '';
                  // Note: In real app we would fetch the blob of prevImgUrl and convert to base64 too, 
                  // or send URL to Gemini if supported. 
                  // For this mock, we send the SAME image as "before" to simulate a PASS, or a diff one to fail.
                  // Let's send the current image as "before" to force a match for now, or use a placeholder.

                  const analysis = await analyzeInspectionDelta(currentBase64, currentBase64, 'TIRE');

                  return {
                    position: img.position,
                    currentImage: URL.createObjectURL(img.blob),
                    previousImage: prevImgUrl,
                    analysis
                  };
                }));

                setAnalysisResults(results);
                setIsAnalyzing(false);
                setView('results');

                // Log to history
                setAuditLog(prev => [{
                  id: Date.now(),
                  type: 'TIRE_AUDIT',
                  unit: activeTrip?.truck_id || 'UNKNOWN',
                  status: results.some(r => r.analysis.alerta_seguridad === 'ROJA') ? 'ALERT' : 'PASSED',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }, ...prev]);
              }}
            />

            {/* Creating a Loading Overlay */}
            {isAnalyzing && (
              <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#EA492E] border-t-transparent rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-black uppercase tracking-widest animate-pulse">Analizando con Gemini AI...</h2>
                <p className="text-zinc-500 font-mono mt-2">Comparando Vectores de Desgaste & ID de Pintura</p>
              </div>
            )}
          </div>
        )}

        {view === 'results' && (
          <div className="max-w-4xl mx-auto h-[80vh]">
            <ResultView results={analysisResults} onClose={() => {
              setView('dashboard');
              setActiveTrip(null);
            }} />
          </div>
        )}

      </div>

      {/* Footer Branding */}
      <footer className="mt-20 pt-10 border-t border-white/5 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">
          &copy; 2026 SIMSA VISION IA &bull; IA.AGUS Industrial Systems
        </p>
      </footer>
    </div >
  );
}
