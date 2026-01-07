import { GoogleGenerativeAI } from "@google/generative-ai";
import { ForensicAuditResult, SecurityAlert, InspectionType, SealIntegrity } from "../../types";

/**
 * AI Delta Analysis Service
 * Resilient version with auto-fallback for quota management.
 */
export const analyzeInspectionDelta = async (
    beforeImageBase64: string,
    afterImageBase64: string,
    category: 'TIRE' | 'SEAL' | 'GAUGE'
): Promise<ForensicAuditResult> => {

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Helper function for the actual call
    const callGemini = async (modelName: string) => {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `ANALIZA FOTO 1 (BASE) vs FOTO 2 (ACTUAL). ¿Es el mismo neumático?
        RESPONDE SOLO JSON:
        {
          "tipo_inspeccion": "TIRE_MATCH",
          "alerta_seguridad": "ROJA | AMARILLA | VERDE",
          "hallazgos": { "identidad_confirmada": boolean, "coincidencia_id": "TOTAL|PARCIAL|NULA" },
          "razonamiento_forense": "explicación corta en español"
        }`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: beforeImageBase64 } },
            { inlineData: { mimeType: "image/jpeg", data: afterImageBase64 } }
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        return JSON.parse(jsonStr) as ForensicAuditResult;
    };

    try {
        if (!apiKey) {
            throw new Error("Missing VITE_GEMINI_API_KEY");
        }

        try {
            // First attempt: Gemini 2.0 Flash (Fastest/Best)
            return await callGemini("gemini-2.0-flash-exp");
        } catch (error: any) {
            if (error.message?.includes("429") || error.message?.includes("quota")) {
                console.warn("Gemini 2.0 Quota exceeded, falling back to 1.5 Flash...");
                // Second attempt: Gemini 1.5 Flash (Reliable fallback)
                return await callGemini("gemini-1.5-flash");
            }
            throw error;
        }

    } catch (error: any) {
        console.error("AI Audit Error:", error);
        const errorMessage = error.message || "Error Desconocido";

        return {
            tipo_inspeccion: InspectionType.CHECK_OUT,
            alerta_seguridad: SecurityAlert.AMARILLA,
            hallazgos: {
                identidad_confirmada: false,
                integridad_sellos: SealIntegrity.NO_VISIBLES,
                lectura_medidor: "ERROR",
                descripcion_anomalia: `Falla: ${errorMessage}`
            },
            razonamiento_forense: `NOTA: ${errorMessage}. Intenta de nuevo en 30 segundos.`
        };
    }
};
