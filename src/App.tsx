
import React, { useState, useEffect } from 'react';
import { TireScanner } from './components/inspection/TireScanner';
import { ResultView } from './components/inspection/ResultView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';
import { CabinScanner } from './components/safety/CabinScanner';
import { SecurityAlert, TripData, AppSettings, CabinAuditResult } from './types';
import { getPreviousTripData } from './services/db/mockDB';
import { analyzeInspectionDelta } from './services/ai/gemini';
import { saveInspection } from './services/auth/supabase';
import { sendWhatsAppAlert } from './services/reports/alertService';

// Standard Audit Entry Type
interface AuditEntry {
  id: string | number;
  type: string;
  unit: string;
  status: 'PASSED' | 'ALERT';
  time: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  primaryColor: '#EA492E',
  supervisor: { name: '', phone: '', email: '' },
  manager: { name: '', phone: '', email: '' }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [view, setView] = useState<'dashboard' | 'qr-scan' | 'inspection' | 'results' | 'settings' | 'cabin'>('dashboard');
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    { id: 'EV-901', type: 'ENTRY', unit: 'GMS-01', status: 'PASSED', time: '10:30 AM' },
    { id: 'EV-902', type: 'EXIT', unit: 'GMS-04', status: 'PASSED', time: '11:45 AM' },
  ]);

  // Load persistence logic
  useEffect(() => {
    const savedSession = localStorage.getItem('simsa_session');
    if (savedSession) {
      setIsLoggedIn(true);
      setCurrentUser(savedSession);
    }

    const savedSettings = localStorage.getItem('simsa_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applyTheme(parsed.primaryColor);
    } else {
      applyTheme(DEFAULT_SETTINGS.primaryColor);
    }
  }, []);

  const applyTheme = (color: string) => {
    document.documentElement.style.setProperty('--brand-color', color);
  };

  const handleLogin = (user: string) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem('simsa_session', user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    localStorage.removeItem('simsa_session');
    setView('dashboard');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('simsa_settings', JSON.stringify(newSettings));
    applyTheme(newSettings.primaryColor);
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-['Inter'] selection:bg-brand p-6 lg:p-12 transition-all duration-700">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-[0_0_20px_var(--brand-color)] transition-all">
              <span className={`text-xl font-black ${settings.primaryColor === '#FFFFFF' ? 'text-black' : 'text-white'}`}>S</span>
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">
                SIMSA <span className="opacity-40 text-brand">VISION IA</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">IA Industrial Audit & Logistics</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setView('settings')}
              className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-90 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            <div className="bg-[#121214] border border-[#1E1E21] px-6 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Panel: {currentUser}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded-2xl border border-red-500/10 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </header>

        {view === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Action Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#121214] border border-[#1E1E21] rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] -z-10 group-hover:bg-brand/10 transition-all" />

                <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-tight">Control Tower <br /><span className="text-blue-500">Fixed Gate IA</span></h2>
                <p className="text-zinc-500 text-lg mb-10 max-w-sm font-medium">Monitoreo automático de arcos perimetrales. Captura desatendida SIN intervención del chofer.</p>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <button
                    onClick={() => setView('qr-scan')}
                    className="w-full md:w-auto bg-brand hover:scale-[1.02] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_var(--brand-color)] flex items-center justify-center gap-3"
                    style={{ color: settings.primaryColor === '#FFFFFF' ? '#000' : '#FFF' }}
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

              {/* Safety Cabin Card [NEW] */}
              <div
                onClick={() => setView('cabin')}
                className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between group cursor-pointer hover:border-brand/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[50px]" />
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand border border-brand/20 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Safety Cabín <span className="text-brand">IA</span></h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Protocolo de Fatiga & Asalto</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Activo</span>
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

              <div className="space-y-6 flex-1 overflow-y-auto">
                {auditLog.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group">
                    <div className={`w-2 h-12 rounded-full ${item.status === 'PASSED' ? 'bg-emerald-500' : 'bg-brand'}`} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1 group-hover:text-brand transition-colors tracking-tighter">{item.type}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">UNIT: {item.unit}</p>
                      <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-8 text-xs font-black uppercase tracking-widest text-brand hover:opacity-80 transition-opacity">Ver todo el historial ↗</button>
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
            <div className="bg-[#121214] border border-[#1E1E21] p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] space-y-8 flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-brand/10 rounded-3xl flex items-center justify-center text-brand border border-brand/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h.01" /><path d="M7 12h.01" /><path d="M7 17h.01" /><path d="M12 7h.01" /><path d="M12 12h.01" /><path d="M12 17h.01" /><path d="M17 7h.01" /><path d="M17 12h.01" /><path d="M17 17h.01" /></svg>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2 text-center text-white">Escanee el QR de la Unidad</h3>
                <p className="text-zinc-500 text-sm font-medium text-center">Capture la placa de metal grabada cerca de la puerta del conductor.</p>
              </div>
              <div className="aspect-square w-full max-w-[240px] bg-black rounded-3xl border-4 border-zinc-800 relative overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => {
                setActiveTrip({
                  id: 'TRP-' + Math.floor(Math.random() * 10000),
                  truck_id: 'TRK-402',
                  driver_id: 'USR-01',
                  status: 'IN_TRANSIT',
                  start_time: new Date().toISOString(),
                  alert_level: SecurityAlert.VERDE
                });
                setView('inspection');
              }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/20 to-transparent animate-scan" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Simular Escaneo</span>
              </div>
            </div>
          </div>
        ) : view === 'settings' ? (
          <div className="max-w-4xl mx-auto h-[80vh]">
            <SettingsView settings={settings} onSave={handleSaveSettings} onClose={() => setView('dashboard')} />
          </div>
        ) : view === 'cabin' ? (
          <div className="max-w-4xl mx-auto h-[80vh]">
            <CabinScanner
              onClose={() => setView('dashboard')}
              onAlert={(result) => {
                // Critical Alert Logic for Cabin
                console.log("CRITICAL CABIN ALERT:", result);
                // We could reuse sendWhatsAppAlert but with different formatting
                // For now, let's log it.
                setAuditLog(prev => [{
                  id: Date.now(),
                  type: 'CABIN_DANGER',
                  unit: 'CABIN-01',
                  status: 'ALERT',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }, ...prev]);
              }}
            />
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
              tireCount={2}
              onComplete={async (imgs) => {
                setIsAnalyzing(true);
                const results = await Promise.all(imgs.map(async (img) => {
                  const reader = new FileReader();
                  const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      resolve(base64.split(',')[1]);
                    };
                    reader.readAsDataURL(img.blob);
                  });
                  const currentBase64 = await base64Promise;
                  const analysis = await analyzeInspectionDelta(currentBase64, currentBase64, 'TIRE');

                  return {
                    position: img.position,
                    currentImage: URL.createObjectURL(img.blob),
                    previousImage: '',
                    analysis
                  };
                }));

                const isAlert = results.some(r => r.analysis.alerta_seguridad === 'ROJA');

                try {
                  await saveInspection({
                    inspection_type: 'ENTRY',
                    status: isAlert ? 'DAMAGE_DETECTED' : 'CLEAN',
                    ai_summary: results.map(r => `${r.position}: ${r.analysis.alerta_seguridad}`).join(' | '),
                    image_url: results[0]?.currentImage || '',
                    vehicle_id: activeTrip?.truck_id
                  });
                } catch (err) {
                  console.error('Supabase Save Error:', err);
                }

                // 4. Trigger WhatsApp Alert
                sendWhatsAppAlert(settings, activeTrip?.truck_id || 'UNKNOWN', results);

                setAnalysisResults(results);
                setIsAnalyzing(false);
                setView('results');

                setAuditLog(prev => [{
                  id: Date.now(),
                  type: 'TIRE_AUDIT',
                  unit: activeTrip?.truck_id || 'UNKNOWN',
                  status: isAlert ? 'ALERT' : 'PASSED',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }, ...prev]);
              }}
            />

            {isAnalyzing && (
              <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-black uppercase tracking-widest animate-pulse">Analizando con Gemini AI...</h2>
                <p className="text-zinc-500 font-mono mt-2 italic">Comparando Vectores de Desgaste & ID de Pintura</p>
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
