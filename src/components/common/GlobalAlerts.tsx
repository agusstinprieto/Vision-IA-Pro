
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/auth/supabase';
import { AlertTriangle, X } from 'lucide-react';

interface AlertToast {
    id: string;
    title: string;
    message: string;
    type: 'dANGER' | 'WARNING';
}

export const GlobalAlerts = () => {
    const [alerts, setAlerts] = useState<AlertToast[]>([]);

    useEffect(() => {
        // Subscribe to real-time INSERTs on 'inspections' table
        const subscription = supabase
            .channel('public:inspections')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inspections' }, (payload) => {
                const newRecord = payload.new;

                // Only alert on High/Critical Risk
                if (newRecord.risk_level === 'HIGH' || newRecord.risk_level === 'CRITICAL' || newRecord.result === 'FAIL') {
                    addAlert({
                        id: Date.now().toString(),
                        title: '⚠️ ALERTA SOS DE SEGURIDAD',
                        message: `Inspección Fallida o Riesgo Detectado en Unidad ${newRecord.unit_id || 'Unknown'}`,
                        type: 'dANGER'
                    });

                    // Optional: Play Sound
                    const audio = new Audio('/sounds/alert.mp3'); // Ensure this file exists or use a data URI
                    audio.play().catch(() => { });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const addAlert = (alert: AlertToast) => {
        setAlerts(prev => [...prev, alert]);
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            removeAlert(alert.id);
        }, 8000);
    };

    const removeAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className="pointer-events-auto bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 w-80 animate-in slide-in-from-right duration-300"
                >
                    <AlertTriangle className="shrink-0 animate-pulse" size={24} />
                    <div className="flex-1">
                        <h4 className="font-black uppercase tracking-widest text-sm">{alert.title}</h4>
                        <p className="text-xs font-bold text-red-100 mt-1">{alert.message}</p>
                    </div>
                    <button onClick={() => removeAlert(alert.id)} className="text-white/50 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
