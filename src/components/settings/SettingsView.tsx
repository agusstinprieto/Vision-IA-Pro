
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../types';

interface SettingsViewProps {
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
    onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, onClose }) => {
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    const colors = [
        { name: 'SIMSA Orange', value: '#EA492E' },
        { name: 'Cyber Blue', value: '#00D1FF' },
        { name: 'Emerald Green', value: '#10B981' },
        { name: 'Luxury Gold', value: '#D4AF37' },
        { name: 'Pure White', value: '#FFFFFF' }
    ];

    return (
        <div className="flex flex-col h-full text-white animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">Configuración</h2>
                    <p className="text-zinc-500 font-mono text-xs mt-1">Personalización & Canales de Alerta</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-10 pb-10">
                {/* Branding Section */}
                <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 italic">Identidad Visual</h3>
                    <div className="grid grid-cols-5 gap-4">
                        {colors.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => setLocalSettings({ ...localSettings, primaryColor: c.value })}
                                className={`aspect-square rounded-2xl border-4 transition-all ${localSettings.primaryColor === c.value ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                                    }`}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </div>

                    {/* Custom Color Picker */}
                    <div className="flex items-center gap-4 mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white/20">
                            <input
                                type="color"
                                value={localSettings.primaryColor}
                                onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                                className="absolute inset-x-[-50%] inset-y-[-50%] w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Color Personalizado (Hex)</label>
                            <input
                                type="text"
                                value={localSettings.primaryColor}
                                onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                                className="w-full bg-transparent font-mono font-bold text-lg outline-none uppercase placeholder-zinc-700"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                </section>

                {/* Supervisor Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 italic">Contacto Supervisor (Alerta Inmediata)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 ml-2">Nombre Completo</label>
                            <input
                                type="text"
                                value={localSettings.supervisor.name}
                                onChange={(e) => setLocalSettings({ ...localSettings, supervisor: { ...localSettings.supervisor, name: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white/30 outline-none transition-all font-bold"
                                placeholder="Ej. Ing. Juan Pérez"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 ml-2">WhatsApp (Incluir +52)</label>
                            <input
                                type="text"
                                value={localSettings.supervisor.phone}
                                onChange={(e) => setLocalSettings({ ...localSettings, supervisor: { ...localSettings.supervisor, phone: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white/30 outline-none transition-all font-mono"
                                placeholder="+521234567890"
                            />
                        </div>
                    </div>
                </section>

                {/* Manager Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 italic">Gerencia de Transporte (Reportes PDF)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 ml-2">Nombre del Gerente</label>
                            <input
                                type="text"
                                value={localSettings.manager.name}
                                onChange={(e) => setLocalSettings({ ...localSettings, manager: { ...localSettings.manager, name: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white/30 outline-none transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 ml-2">Email de Reportes</label>
                            <input
                                type="email"
                                value={localSettings.manager.email}
                                onChange={(e) => setLocalSettings({ ...localSettings, manager: { ...localSettings.manager, email: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-white/30 outline-none transition-all font-mono"
                                placeholder="gerencia@simsa.com.mx"
                            />
                        </div>
                    </div>
                </section>

                {/* Data Management Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 italic">Gestión de Datos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => alert('Importar Base de Datos de UNIDADES desde Excel/CSV')}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all"
                        >
                            <div className="text-left">
                                <h4 className="font-bold text-sm uppercase">Importar Unidades</h4>
                                <p className="text-[10px] text-zinc-500">Cargar Excel / CSV</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                            </div>
                        </button>

                        <button
                            onClick={() => alert('Importar Base de Datos de OPERADORES desde Excel/CSV')}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all"
                        >
                            <div className="text-left">
                                <h4 className="font-bold text-sm uppercase">Importar Operadores</h4>
                                <p className="text-[10px] text-zinc-500">Cargar Excel / CSV</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                            </div>
                        </button>
                    </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-white/5 bg-black gap-4 flex flex-col md:flex-row shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
                <button
                    onClick={handleSave}
                    className="flex-1 py-5 rounded-3xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                    style={{ backgroundColor: localSettings.primaryColor, color: localSettings.primaryColor === '#FFFFFF' ? '#000' : '#FFF' }}
                >
                    Guardar Cambios
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 py-5 rounded-3xl bg-white/5 hover:bg-white/10 font-black uppercase tracking-widest transition-all"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};
