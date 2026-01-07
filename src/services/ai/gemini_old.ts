
import { GoogleGenAI, Type } from "@google/genai";
import { InspectionType } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeEvidence = async (
  mode: InspectionType,
  currentImageBase64: string,
  referenceImageBase64: string
) => {
  const prompt = `
    Eres "GuardianAI", un auditor forense experto en seguridad logística y transporte de materiales peligrosos (Gas LP/Combustibles).
    Analiza las siguientes dos imágenes: una FOTO ACTUAL (evidencia) y una FOTO DE REFERENCIA (base).

    ZONA DE INSPECCIÓN: ${mode === InspectionType.LLANTA ? 'MODO A - LLANTAS' : 'MODO B - COMBUSTIBLE/VÁLVULAS'}

    ${mode === InspectionType.LLANTA ? `
    INSTRUCCIONES MODO A (LLANTAS):
    1. Verificación de Identidad: Busca el ID único (QR/Texto pintado) y compara imperfecciones únicas en el rin (rasguños, manchas de óxido).
    2. Estado: Evalúa profundidad del dibujo y busca cortes.
    3. Veredicto: ¿Es la misma llanta? (Confianza 0-100%).
    ` : `
    INSTRUCCIONES MODO B (COMBUSTIBLE/VÁLVULAS):
    1. Integridad de Precintos: Compara los sellos de seguridad. Busca signos de estrés, pegamento, cortes o cambios de color.
    2. Lectura de Medidores: Extrae el número exacto del medidor de flujo o porcentaje del rotogauge. Si es borroso, usa "ILEGIBLE".
    3. Detección de Anomalías: Busca mangueras, conexiones T o llaves ajenas.
    `}

    REGLAS CRÍTICAS:
    - Si un precinto parece intacto pero tiene un tono de color ligeramente distinto al de referencia, marca ALERTA AMARILLA.
    - Si detectas manipulación evidente o cambio de pieza, marca ALERTA ROJA.
    - Si todo coincide perfectamente, marca ALERTA VERDE.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: currentImageBase64, mimeType: "image/jpeg" } },
          { inlineData: { data: referenceImageBase64, mimeType: "image/jpeg" } },
          { text: "Proporciona la salida estrictamente en formato JSON." }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tipo_inspeccion: { type: Type.STRING },
          alerta_seguridad: { type: Type.STRING },
          hallazgos: {
            type: Type.OBJECT,
            properties: {
              identidad_confirmada: { type: Type.BOOLEAN },
              integridad_sellos: { type: Type.STRING },
              lectura_medidor: { type: Type.STRING },
              descripcion_anomalia: { type: Type.STRING }
            },
            required: ["identidad_confirmada", "integridad_sellos", "lectura_medidor", "descripcion_anomalia"]
          },
          razonamiento_forense: { type: Type.STRING }
        },
        required: ["tipo_inspeccion", "alerta_seguridad", "hallazgos", "razonamiento_forense"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
