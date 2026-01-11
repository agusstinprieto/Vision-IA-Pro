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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `ACTÚA COMO UN EXPERTO FORENSE EN ACTIVOS.
    Analiza la imagen de la llanta y el rin para crear un perfil de identidad y condición.

    REGLAS DE IDENTIFICACIÓN (Anti-Robo):
    1. MARCA REAL: Lee el texto del costado (Continental, Bridgestone, etc).
    2. SERIAL/DOT (CRÍTICO): Busca específicamente la palabra "DOT" seguida de un código de 10-12 caracteres (ej: DOT A3BD...). Si no ves "DOT", busca cualquier serie de números y letras grabada en bajorrelieve cerca del rin.
    3. DISEÑO: Identifica el diseño del rin.

    REGLAS DE CONDICIÓN (Mantenimiento):
    1. DAÑOS: Detecta cortes, chipotes o desgaste irregular.
    2. ESTADO DEL RIN: Detecta golpes o dobleces.

    RESPONDE SOLO EL SIGUIENTE JSON:
    {
        "marca": "string (Marca detectada)",
        "modelo": "string o null",
        "serial_number": "string o null (DOT)",
        "profundidad_huella_mm": number,
        "estado_rin": "Bueno | Doblado | Oxidado | Dañado",
        "descripcion_rin_seguridad": "Características fijas del rin para su identificación",
        "reporte_daños_llanta": "Estado actual de la goma (cortes, etc)",
        "alerta_mantenimiento": "VERDE | AMARILLA | ROJA (Basado SOLO en el daño físico)"
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

        const prompt = `ACTÚA COMO UN PERITO FORENSE DE ACTIVOS.
        Comparas una IMAGEN BASE (Original) con una IMAGEN ACTUAL (Auditoría).
        
        OBJETIVO: Detectar ROBO (Cambio de llanta/rin) y evaluar DAÑOS (Mantenimiento).
        
        REGLAS DE SEGURIDAD (ANTI-ROBO):
        1. IDENTIDAD: Si el DOT/Serial o la Marca NO coinciden -> ALERTA_SEGURIDAD = ROJA.
        2. RIN: Si el diseño estructural del rin es diferente -> ALERTA_SEGURIDAD = ROJA.
        
        REGLAS DE MANTENIMIENTO:
        1. DAÑOS NUEVOS: Si ves un nuevo golpe en el rin o corte en la llanta que NO estaba en la base -> ALERTA_MANTENIMIENTO = ROJA o AMARILLA.
        2. NOTA CRÍTICA: Un nuevo daño NO significa un robo si el Serial/DOT coincide. Indica esto claramente.
        
        RESPONDE SOLO JSON:
        {
          "tipo_inspeccion": "TIRE_MATCH",
          "alerta_seguridad": "VERDE | ROJA",
          "alerta_mantenimiento": "VERDE | AMARILLA | ROJA",
          "hallazgos": { 
                "identidad_confirmada": boolean, 
                "coincidencia_id": "TOTAL|PARCIAL|NULA",
                "reporte_forense_daños": "Descripción de daños nuevos si existen",
                "detalles": "Explicación técnica del match"
          },
          "razonamiento_forense": "Resumen para el supervisor"
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
            isAnomaly: parsed.alerta_seguridad === 'ROJA' || parsed.alerta_mantenimiento === 'ROJA',
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
