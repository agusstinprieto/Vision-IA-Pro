
import Tesseract from 'tesseract.js';

// Regex for standard License Plate patterns (adjust as needed for specific country)
// Example: AAA-123 or ABC-1234
const PLATE_REGEX = /[A-Z0-9]{3}-?[0-9]{3,4}/g;

/**
 * Pre-process image to improve OCR accuracy
 * (Conceptual - browser canvas manipulation would happen here if we received a canvas/blob)
 */

export const ocrService = {
    async recognizePlate(imageSource: string): Promise<string | null> {
        try {
            const result = await Tesseract.recognize(
                imageSource,
                'eng',
                {
                    logger: m => console.debug(m),
                    // Tesseract.js specific configuration for better accuracy on block text
                    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
                }
            );

            const text = result.data.text.toUpperCase();
            console.log("OCR Raw Text:", text);

            // Find all matches
            const matches = text.match(PLATE_REGEX);

            if (matches && matches.length > 0) {
                // Return the first valid match, cleaning any whitespace
                return matches[0].replace(/\s/g, '');
            }

            return null;
        } catch (error) {
            console.error("OCR Error:", error);
            throw error;
        }
    }
};
