import { GoogleGenerativeAI } from "@google/generative-ai";
import { ForensicAuditResult, SecurityAlert, InspectionType, SealIntegrity, CabinAuditResult, DriverStatus } from "../../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Helper to strip data URI prefix if present
const cleanBase64 = (str: string) => str.replace(/^data:image\/\w+;base64,/, '');

/**
 * Extracts specific tire metadata (Brand, Model, DOT) from a single image.
 */
export const extractTireMetadata = async (imageBase64: string, retries = 0): Promise<any> => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    // Using Gemini 2.5 Flash (2026 model, should be available)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `ACTÚA COMO UN PERITO FORENSE DE NEUMÁTICOS.
    Analiza esta ÚNICA imagen de una llanta.
    
    OBJETIVO: Extraer TODA la información de identidad visible.
    
    Busca Específicamente:
    1. MARCA (Brand)
    2. MODELO (Model)
    3. NÚMERO DE SERIE / DOT (Serial Number) - ¡CRÍTICO! Busca patrón de 4-13 caracteres, a veces termina en 4 dígitos (fecha).
    4. DESGASTE ESTIMADO (mm).
    5. ESTADO DEL RIN (Rim Condition) - "Bueno", "Doblado", "Oxidado", "Quebrado".

    RESPONDE SOLO JSON:
    {
        "marca": "string o null",
        "modelo": "string o null",
        "serial_number": "string o null",
        "profundidad_huella_mm": number (0-20),
        "estado_rin": "string o null"
    }`;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64(imageBase64) } }
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;

        return JSON.parse(jsonStr);

    } catch (error: any) {
        // Retry logic for 429 (Max 2 retries)
        if ((error.message?.includes("429") || error.message?.includes("quota") || error.status === 429) && retries < 2) {
            console.warn(`⚠️ Rate Limit Hit (Metadata). Waiting 12s... (Attempt ${retries + 1}/2)`);
            await new Promise(resolve => setTimeout(resolve, 12000));
            return extractTireMetadata(imageBase64, retries + 1);
        }
        console.error("Metadata Extraction Error:", error);
        return { marca: null, modelo: null, serial_number: null, profundidad_huella_mm: null };
    }
};

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

        const prompt = `ACTÚA COMO UN PERITO FORENSE DE NEUMÁTICOS.
        Comparas una IMAGEN BASE (Original) con una IMAGEN ACTUAL (Auditoría).
        
        OBJETIVO: Detectar si han CAMBIADO el neumático (Gato por Liebre).
        Busca diferencias en:
        1. Diseño de los RINES (golpes, rasguños, diseño). ¡ESTO ES CLAVE!
        2. Texto lateral (Marca, Modelo, DOT).
        3. Diseño de la huella (si es visible).
        
        SI EL RIN ES DIFERENTE O LA MARCA CAMBIA -> ALERTA ROJA.
        
        SI HAY DUDAS O DIFERENCIAS VISIBLES, MARCA COMO "ROJA".
        
        RESPONDE SOLO JSON:
        {
          "tipo_inspeccion": "TIRE_MATCH",
          "alerta_seguridad": "ROJA | AMARILLA | VERDE",
          "hallazgos": { 
                "identidad_confirmada": boolean, 
                "coincidencia_id": "TOTAL|PARCIAL|NULA",
                "detalles": "diferencias encontradas"
          },
          "razonamiento_forense": "explicación corta en español"
        }`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64(beforeImageBase64) } },
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64(afterImageBase64) } }
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;

        const parsed = JSON.parse(jsonStr);

        // Map to expected UI format
        return {
            ...parsed,
            isAnomaly: parsed.alerta_seguridad === 'ROJA' || parsed.alerta_seguridad === 'AMARILLA' || !parsed.hallazgos.identidad_confirmada,
            confidenceScore: parsed.hallazgos.identidad_confirmada ? 0.95 : 0.10
        } as ForensicAuditResult;
    };

    try {
        if (!apiKey) {
            throw new Error("Missing VITE_GEMINI_API_KEY");
        }

        // Use stable Gemini 2.5 Flash Preview model specific version
        return await callGemini("gemini-2.5-flash-preview-09-2025");

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
                descripcion_anomalia: `Falla: ${errorMessage}`,
                coincidencia_id: "NULA",
                detalles: errorMessage
            },
            razonamiento_forense: `NOTA: ${errorMessage}. Intenta de nuevo en 30 segundos.`,
            isAnomaly: true,
            confidenceScore: 0
        };
    }
};

export const analyzeCabinIntegrity = async (imageBase64: string): Promise<CabinAuditResult> => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    // Use stable model here too
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

    const prompt = `ACTÚA COMO UN SISTEMA DMS (DRIVER MONITORING SYSTEM) Y WELLNESS IA.
    Analiza la imagen de la cabina y detecta fatiga, peligro, estrés y estado de salud.
    RESPONDE SOLO JSON:
    {
      "estado_chofer": "ALERTA | FATIGA | DISTRACCION | PELIGRO",
      "nivel_riesgo": "VERDE | AMARILLA | ROJA",
      "hallazgos": {
        "ojos_cerrados": boolean,
        "bostezo_detectado": boolean,
        "celular_en_mano": boolean,
        "intruso_detectado": boolean,
        "stress_level": number, (0-10 basado en micro-expresiones y tensión facial)
        "salud_fisica": "ej: Normal, Palidez, Sudoración, Respiración Pesada",
        "salud_mental": "ej: Estable, Ansiedad, Irritabilidad, Agotamiento",
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
                stress_level: 0,
                salud_fisica: "Error lectura",
                salud_mental: "Error lectura",
                descripcion: "Error en sensor IA"
            },
            recomendacion: "Verificar conexión de cámara"
        };
    }
};

/**
 * Extracts license plate number from an image.
 */
export const extractLicensePlate = async (imageBase64: string): Promise<string | null> => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

    const prompt = `Analiza esta imagen de un vehículo y extrae ÚNICAMENTE el número de placa (LICENSE PLATE).
    Busca formatos comunes de México y USA.
    Responde solo con el texto de la placa, sin espacios ni guiones.
    Si no hay placa visible, responde "NULL".`;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64(imageBase64) } }
        ]);
        const text = (await result.response).text().trim().replace(/['"]/g, '').replace(/[\r\n]/g, '');
        return text === "NULL" ? null : text;
    } catch (e) {
        console.error("Plate OCR Error:", e);
        return null;
    }
};

/**
 * Extracts trailer number/ID from an image.
 */
export const extractTrailerNumber = async (imageBase64: string): Promise<string | null> => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

    const prompt = `Analiza esta imagen de un remolque/trailer y extrae ÚNICAMENTE el número económico o identificación del remolque.
    Suelen ser números de 3-6 dígitos pintados en los costados o la parte trasera.
    Responde solo con el número, sin letras ni espacios.
    Si no hay número visible, responde "NULL".`;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64(imageBase64) } }
        ]);
        const text = (await result.response).text().trim().replace(/['"]/g, '').replace(/[\r\n]/g, '');
        return text === "NULL" ? null : text;
    } catch (e) {
        console.error("Trailer OCR Error:", e);
        return null;
    }
};
