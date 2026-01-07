import { GoogleGenerativeAI } from "@google/generative-ai";
import { ForensicAuditResult, SecurityAlert, InspectionType, SealIntegrity, CabinAuditResult, DriverStatus } from "../../types";

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

export const analyzeCabinIntegrity = async (imageBase64: string): Promise<CabinAuditResult> => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `ACTÚA COMO UN SISTEMA DMS (DRIVER MONITORING SYSTEM).
    Analiza la imagen de la cabina y detecta fatiga o peligro.
    RESPONDE SOLO JSON:
    {
      "estado_chofer": "ALERTA | FATIGA | DISTRACCION | PELIGRO",
      "nivel_riesgo": "VERDE | AMARILLA | ROJA",
      "hallazgos": {
        "ojos_cerrados": boolean,
        "bostezo_detectado": boolean,
        "celular_en_mano": boolean,
        "intruso_detectado": boolean,
        "descripcion": "resumen en español (máx 15 palabras)"
      },
      "recomendacion": "acción inmediata"
    }`;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : text) as CabinAuditResult;
    } catch (error: any) {
        console.error("DMS AI Error:", error);
        return {
            estado_chofer: DriverStatus.ALERTA,
            nivel_riesgo: SecurityAlert.AMARILLA,
            hallazgos: {
                ojos_cerrados: false,
                bostezo_detectado: false,
                celular_en_mano: false,
                intruso_detectado: false,
                descripcion: "Error en sensor IA"
            },
            recomendacion: "Verificar conexión de cámara"
        };
    }
};
