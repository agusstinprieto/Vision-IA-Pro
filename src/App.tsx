
import React, { useState, useEffect } from 'react';
import { TireScanner } from './components/inspection/TireScanner';
import { PhotoGalleryView } from './components/gallery/PhotoGalleryView';
import { ResultView } from './components/inspection/ResultView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';
import { CabinScanner } from './components/safety/CabinScanner';
import { SecurityAlert, TripData, AppSettings, CabinAuditResult, UserRole, Company } from './types';
// [REMOVED MOCK IMPORTS]
import { analyzeInspectionDelta } from './services/ai/gemini';
import { dbService } from './services/db/dbService';
import { LogOut, Settings as SettingsIcon, MenuIcon } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalAlerts } from './components/common/GlobalAlerts';
import { useLanguage } from './context/LanguageContext';

import { sendWhatsAppAlert } from './services/reports/alertService';
import { UnitInventoryView } from './components/inventory/UnitInventoryView';
import { TireInventoryView } from './components/inventory/TireInventoryView';
import { SmartMapView } from './components/logistics/SmartMapView';
import { EmergencyView } from './components/safety/EmergencyView';
import { DriverHealthView } from './components/safety/DriverHealthView';
import { MobileCapture } from './components/scan/MobileCapture';
import { CommandCenterView } from './components/safety/CommandCenterView';
import { LanguageToggle } from './components/common/LanguageToggle';
import { DashboardView } from './components/dashboard/DashboardView';
import { KnowledgeHub } from './components/docs/KnowledgeHub';
import { SupervisorApprovalsView } from './components/supervisor/SupervisorApprovalsView';
import { TireMonitoringView } from './components/supervisor/TireMonitoringView';
import { SuperAdminView } from './components/admin/SuperAdminView';
import { DigitalTwinView } from './components/digital-twin/DigitalTwinView';

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
  businessName: 'SIMSA', // Default set to SIMSA
  supervisor: { name: '', phone: '', email: '' },
  manager: { name: '', phone: '', email: '' }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('EMPLOYEE');
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [view, setView] = useState<string>('dashboard');
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    { id: 'EV-901', type: 'ENTRY', unit: 'GMS-01', status: 'PASSED', time: '10:30 AM' },
    { id: 'EV-902', type: 'EXIT', unit: 'GMS-04', status: 'PASSED', time: '11:45 AM' },
  ]);

  // Load persistence logic
  useEffect(() => {
    const savedSession = localStorage.getItem('simsa_session');
    const savedRole = localStorage.getItem('simsa_role') as UserRole;
    const savedCompany = localStorage.getItem('simsa_company');

    if (savedSession) {
      setIsLoggedIn(true);
      setCurrentUser(savedSession);
      if (savedRole) setUserRole(savedRole);
      if (savedCompany) {
        try {
          const company = JSON.parse(savedCompany);
          setCurrentCompany(company);
          dbService.setCompanyId(company.id);
        } catch (e) { console.error("Company parse error", e); }
      }
    }

    const savedSettings = localStorage.getItem('simsa_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to ensure new fields (like businessName) exist
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        applyTheme(parsed.primaryColor || DEFAULT_SETTINGS.primaryColor);
      } catch (e) {
        console.error("Settings parse error, resetting", e);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      applyTheme(DEFAULT_SETTINGS.primaryColor);
    }
  }, []);

  const applyTheme = (color: string) => {
    document.documentElement.style.setProperty('--brand-color', color);
  };

  const handleLogin = (user: string, role: UserRole, company: Company) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setUserRole(role);
    setCurrentCompany(company);

    // Inject company context into DB Service
    dbService.setCompanyId(company.id);

    // Update settings name if it's the default
    if (settings.businessName === 'SIMSA' || settings.businessName === 'VISION IA PRO') {
      const newSettings = { ...settings, businessName: company.name };
      setSettings(newSettings);
      localStorage.setItem('simsa_settings', JSON.stringify(newSettings));
    }

    localStorage.setItem('simsa_session', user);
    localStorage.setItem('simsa_role', role);
    localStorage.setItem('simsa_company', JSON.stringify(company));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setCurrentCompany(null);
    dbService.setCompanyId('');
    localStorage.removeItem('simsa_session');
    localStorage.removeItem('simsa_company');
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
    <div className="flex min-h-screen bg-[#0A0A0B] text-white font-['Inter'] selection:bg-brand transition-all duration-700">
      <GlobalAlerts />

      {/* Sidebar Navigation */}
      <Sidebar
        activeView={view}
        onNavigate={setView}
        businessName={settings.businessName || 'VISION IA PRO'}
        brandColor={settings.primaryColor}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Top Header Bar */}
        <header className="flex justify-between items-center px-6 py-3 lg:px-10 lg:py-4 border-b border-white/5 bg-[#0A0A0B]/90 backdrop-blur-sm z-30 sticky top-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-zinc-500 hover:text-white"
          >
            <MenuIcon size={24} />
          </button>

          <div className="flex items-center gap-4">
            <LanguageToggle />

            <button
              onClick={() => setView('settings')}
              className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all group"
              title={t('sidebar.settings')}
            >
              <SettingsIcon xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-90 transition-transform" size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 p-3 rounded-2xl border border-red-500/10 text-red-500 transition-all group"
              title={t('sidebar.logout')}
            >
              <LogOut size={20} />
            </button>
            <div className="hidden sm:flex bg-[#121214] border border-[#1E1E21] px-6 py-3 rounded-2xl items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Panel: {currentUser} ({userRole})</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto scrollbar-hide p-2 lg:p-4 pb-20`}>
          <div className="max-w-7xl mx-auto">
            {view === 'dashboard' ? (
              <DashboardView
                onNavigate={setView}
                brandColor={settings.primaryColor}
              />
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
              <div className="max-w-4xl mx-auto min-h-screen">
                <SettingsView settings={settings} onSave={handleSaveSettings} onClose={() => setView('dashboard')} />
              </div>
            ) : view === 'capture-cabin' || view === 'cabin' ? (
              <div className="max-w-4xl mx-auto">
                <CabinScanner
                  onClose={() => setView('dashboard')}
                  onAlert={(result) => {
                    console.log("CRITICAL CABIN ALERT:", result);
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
            ) : view === 'unit-inventory' ? (
              <UnitInventoryView />
            ) : view === 'tire-inventory' ? (
              <TireInventoryView userRole={userRole} />
            ) : view === 'map' ? (
              <SmartMapView />
            ) : view === 'emergency' ? (
              <EmergencyView />
            ) : view === 'driver-health' ? (
              <DriverHealthView />
            ) : view === 'mobile-scan' ? (
              <MobileCapture />
            ) : view === 'command-center' ? (
              <CommandCenterView brandColor={settings.primaryColor} />
            ) : view === 'gallery' ? (
              <PhotoGalleryView onClose={() => setView('dashboard')} userRole={userRole} />
            ) : view === 'supervisor-approvals' ? (
              <SupervisorApprovalsView />
            ) : view === 'tire-monitoring' ? (
              <TireMonitoringView />
            ) : view === 'capture-tires' || view === 'inspection' ? (
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
                      await dbService.saveInspection({
                        inspection_type: 'ENTRY',
                        status: isAlert ? 'DAMAGE_DETECTED' : 'CLEAN',
                        ai_summary: results.map(r => `${r.position}: ${r.analysis.alerta_seguridad}`).join(' | '),
                        image_url: results[0]?.currentImage || '',
                        vehicle_id: activeTrip?.truck_id
                      });
                    } catch (err) {
                      console.error('Supabase Save Error:', err);
                    }

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
            ) : view === 'results' ? (
              <div className="max-w-4xl mx-auto h-[80vh]">
                <ResultView results={analysisResults} onClose={() => {
                  setView('dashboard');
                  setActiveTrip(null);
                }} />
              </div>
            ) : view === 'knowledge-hub' ? (
              <KnowledgeHub />
            ) : view === 'super-admin' ? (
              <SuperAdminView />
            ) : view === 'digital-twin' ? (
              <DigitalTwinView />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
