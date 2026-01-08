
import { AppSettings, ForensicAuditResult, SecurityAlert } from "../../types";

export const sendWhatsAppAlert = (
    settings: AppSettings,
    unitId: string,
    results: { position: string, analysis: ForensicAuditResult }[]
) => {
    const isRed = results.some(r => r.analysis.alerta_seguridad === SecurityAlert.ROJA);
    const target = isRed ? settings.manager : settings.supervisor;

    if (!target.phone) return;

    const summary = results.map(r => `• ${r.position}: ${r.analysis.alerta_seguridad}`).join('%0A');
    const message = `🚨 *IA VISION PRO - ALERTA CRÍTICA*%0A%0A` +
        `*Unidad:* ${unitId}%0A` +
        `*Estado:* ${isRed ? '⛔ BLOQUEO' : '⚠️ REVISIÓN'}%0A%0A` +
        `*Resultados:*%0A${summary}%0A%0A` +
        `*Supervisor:* ${settings.supervisor.name}%0A` +
        `*Ver reporte completo:* [Link al PDF]%0A%0A` +
        `_Auditado por IA.AGUS Industrial Systems_`;

    const cleanPhone = target.phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${message}`;

    window.open(url, '_blank');
};

export const generateAuditPDF = () => {
    // For now, this is a mock. In a real scenario, we'd use jspdf
    alert("Generando Reporte PDF Profesional... (Simulación)");
};
