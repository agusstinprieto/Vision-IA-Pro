
import { extractLicensePlate } from './gemini';

/**
 * OCR Service Wrapper
 * Now uses Gemini Vision API for superior accuracy compared to local Tesseract.js
 * Optimized for License Plates.
 */

export const ocrService = {
    async recognizePlate(imageSource: string): Promise<string | null> {
        try {
            console.log("OCR Request: Sending frame to Gemini 1.5 Flash Vision...");
            const plate = await extractLicensePlate(imageSource);

            if (plate) {
                console.log("OCR Success:", plate);
                return plate;
            }

            return null;
        } catch (error) {
            console.error("OCR Service Error:", error);
            // Fallback to null (continue scanning)
            return null;
        }
    }
};
