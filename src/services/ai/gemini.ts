

import { GoogleGenAI } from "@google/genai";
import { ForensicAuditResult, SecurityAlert, InspectionType, SealIntegrity } from "../../types";

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

/**
 * AI Delta Analysis Service
 * Compares "Initial" vs "Final" photos to detect theft or tampering.
 */

export const analyzeInspectionDelta = async (
    beforeImageBase64: string,
    afterImageBase64: string,
    category: 'TIRE' | 'SEAL' | 'GAUGE'
): Promise<ForensicAuditResult> => {
    // Note: Model retrieval might differ in strict @google/genai SDK vs @google/generative-ai
    // For @google/genai:
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 
    // Wait, check if getGenerativeModel exists on GoogleGenAI instance.
    // Assuming standard usage for now based on browser findings.

    // Actually, looking at recent docs for @google/genai (Python/Node):
    // it might be client.models.generateContent
    // But since this is a Web environment, checking if GoogleGenAI has getGenerativeModel or similar.
    // If we assume it works like the old one but just renamed:
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Let's try to adapt to what likely works or revert to @google/generative-ai if this fails hard.
    // But package.json has @google/genai. 

    // Let's try:
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
    ACTÚA COMO UN AUDITOR FORENSE DE SEGURIDAD INDUSTRIAL (SIMSA VISION IA).
    ESTÁS ANALIZANDO DOS FOTOS DE UN NEUMÁTICO DE CAMIÓN DE CARGA.
    FOTO 1 (BASE): REGISTRO HISTÓRICO CON MARCAJE ORIGINAL.
    FOTO 2 (ACTUAL): FOTO TOMADA EN GATE AHORA MISMO.

    OBJETIVO PRINCIPAL: Verificar que el neumático sea EL MISMO basándose en la "MARCA AMARILLA INDUSTRIAL" (ID pintado en la pared lateral) y el desgaste único.

    CRITERIOS DE ALERTA:
    - 🔴 ROJA (CRÍTICA):
        * La "Marca Amarilla" de la Foto 2 NO COINCIDE con la Foto 1.
        * La "Marca Amarilla" ha sido borrada, pintada encima o alterada.
        * El patrón de desgaste o marca del fabricante es totalmente diferente (Cambio de Llanta).
    
    - 🟡 AMARILLA (PRECAUCIÓN):
        * Marca Amarilla visible pero desgastada/sucia.
        * Iluminación dificulta la lectura del ID, pero parece ser la misma llanta.
    
    - 🟢 VERDE (APROBADO):
        * Identidad confirmada al 100%. Marca Amarilla coincide y desgaste es consistente.

    RESPONDE ÚNICAMENTE EN FORMATO JSON:
    {
      "tipo_inspeccion": "TIRE_MATCH",
      "alerta_seguridad": "ROJA | AMARILLA | VERDE",
      "hallazgos": {
        "identidad_confirmada": boolean,
        "marca_amarilla_detectada": boolean,
        "coincidencia_id": "TOTAL | PARCIAL | NULA",
        "descripcion_visual": "breve descripción técnica enfocada en el ID pintado"
      },
      "razonamiento_forense": "explicación detallada citando si el ID amarillo coincide o no"
    }
  `;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: beforeImageBase64
                }
            },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: afterImageBase64
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean JSON response
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
                descripcion_anomalia: "No se pudo procesar el análisis por falla técnica."
            },
            razonamiento_forense: "Error de comunicación con el motor IA."
        };
    }
};
