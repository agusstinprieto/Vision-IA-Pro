import { GoogleGenerativeAI } from "@google/generative-ai";
import { ForensicAuditResult, SecurityAlert, InspectionType, SealIntegrity } from "../../types";

/**
 * AI Delta Analysis Service
 * Stable version for Gemini 2.0 Flash with internal initialization.
 */
export const analyzeInspectionDelta = async (
    beforeImageBase64: string,
    afterImageBase64: string,
    category: 'TIRE' | 'SEAL' | 'GAUGE'
): Promise<ForensicAuditResult> => {

    // Direct access to environment variables to avoid caching issues
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
        if (!apiKey) {
            throw new Error("Missing VITE_GEMINI_API_KEY in environment");
        }

        // Initialize inside the function for fresh state every call
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

        // Robust JSON cleaning
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;

        return JSON.parse(jsonStr) as ForensicAuditResult;

    } catch (error: any) {
        console.error("AI Audit Error Details:", error);
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
            razonamiento_forense: `ERROR TÉCNICO: ${errorMessage}. Si dice 'Missing Key', revisa Vercel Settings. Si dice 'API Key not valid', la llave está mal.`
        };
    }
};
