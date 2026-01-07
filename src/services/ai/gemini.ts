import { GoogleGenerativeAI } from "@google/generative-ai";
import { ForensicAuditResult, SecurityAlert, InspectionType, SealIntegrity } from "../../types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

/**
 * AI Delta Analysis Service
 * Optimized for speed and mobile latency.
 */
export const analyzeInspectionDelta = async (
    beforeImageBase64: string,
    afterImageBase64: string,
    category: 'TIRE' | 'SEAL' | 'GAUGE'
): Promise<ForensicAuditResult> => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `ANALIZA FOTO 1 (BASE) vs FOTO 2 (ACTUAL). ¿Es el mismo neumático?
    RESPONDE SOLO JSON:
    {
      "tipo_inspeccion": "TIRE_MATCH",
      "alerta_seguridad": "ROJA | AMARILLA | VERDE",
      "hallazgos": { "identidad_confirmada": boolean, "coincidencia_id": "TOTAL|PARCIAL|NULA" },
      "razonamiento_forense": "explicación corta"
    }`;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: beforeImageBase64 } },
            { inlineData: { mimeType: "image/jpeg", data: afterImageBase64 } }
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr) as ForensicAuditResult;

    } catch (error) {
        console.error("AI Audit Error:", error);
        return {
            tipo_inspeccion: InspectionType.CHECK_OUT,
            alerta_seguridad: SecurityAlert.AMARILLA,
            hallazgos: {
                identidad_confirmada: false,
                integridad_sellos: SealIntegrity.NO_VISIBLES,
                lectura_medidor: "ERROR",
                descripcion_anomalia: "Error técnico."
            },
            razonamiento_forense: "Error de comunicación."
        };
    }
};
