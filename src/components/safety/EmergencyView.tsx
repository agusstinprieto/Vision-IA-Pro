
import React from 'react';
import { Phone, ShieldAlert, Ambulance, Download, ExternalLink } from 'lucide-react';

export const EmergencyView = () => {
    const contacts = [
        { id: 1, name: 'Centro de Control VISION IA PRO', role: 'Interno', phone: '800-IA-AGUS-SOS', type: 'INTERNAL' },
        { id: 2, name: 'Soporte Técnico IA', role: 'Sistemas', phone: '55-1234-5678', type: 'INTERNAL' },
        { id: 3, name: 'Policía Federal de Caminos', role: 'Autoridad', phone: '911', type: 'AUTHORITY' },
        { id: 4, name: 'Cruz Roja Mexicana', role: 'Médico', phone: '065', type: 'MEDICAL' },
    ];

    return (
        <div className="p-8 lg:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-red-500 flex items-center gap-3">
                        <ShieldAlert size={32} />
                        Centro de Emergencias
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Protocolos de Seguridad & Respuesta Inmediata</p>
                </div>

                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all animate-pulse">
                    <Download size={16} /> Generar Reporte de Incidente Crítico
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map(contact => (
                    <div key={contact.id} className="bg-[#121214] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] -z-0 ${contact.type === 'INTERNAL' ? 'bg-brand/10' :
                            contact.type === 'AUTHORITY' ? 'bg-blue-500/10' :
                                'bg-red-500/10'
                            }`} />

                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${contact.type === 'INTERNAL' ? 'bg-brand/10 text-brand' :
                                contact.type === 'AUTHORITY' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-red-500/10 text-red-500'
                                }`}>
                                {contact.type === 'MEDICAL' ? <Ambulance size={24} /> : <Phone size={24} />}
                            </div>

                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{contact.name}</h3>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">{contact.role}</p>

                            <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-2xl font-black text-white hover:text-brand transition-colors">
                                {contact.phone} <ExternalLink size={16} className="opacity-50" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl">
                <h3 className="text-lg font-black uppercase tracking-widest mb-4 text-white">Protocolo de Evacuación VISION IA PRO</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    En caso de detección de amenaza confirmada por la IA (Nivel Rojo), el sistema bloqueará automáticamente los accesos
                    perimetrales y notificará a las autoridades locales con la geolocalización exacta de la unidad comprometida.
                </p>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="w-1/3 h-full bg-emerald-500" />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    <span>Nivel 1: Alerta</span>
                    <span>Nivel 2: Contención</span>
                    <span>Nivel 3: Bloqueo Total</span>
                </div>
            </div>
        </div>
    );
};
