import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Extract license plate number from image using Gemini Vision API
 * @param imageBase64 Base64 encoded image
 * @returns License plate number or null if not found
 */
export const extractLicensePlate = async (imageBase64: string): Promise<string | null> => {
    try {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Extract the license plate number from this image.
        
Rules:
- Return ONLY the plate number (e.g., "ABC-123", "XYZ-789")
- If no plate visible, return exactly "null"
- Remove spaces and normalize format
- Keep hyphens if present
- Return uppercase letters

Response format: Just the plate number or the word null (nothing else)`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } }
        ]);

        const text = result.response.text().trim().toUpperCase();

        // Return null if AI couldn't find a plate
        if (text === 'NULL' || text === '' || text.length < 3) {
            return null;
        }

        console.log(`🚗 License Plate Detected: ${text}`);
        return text;
    } catch (error) {
        console.error('License plate detection error:', error);
        return null;
    }
};

/**
 * Extract trailer identification number from image
 * @param imageBase64 Base64 encoded image
 * @returns Trailer number or null if not found
 */
export const extractTrailerNumber = async (imageBase64: string): Promise<string | null> => {
    try {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Extract the trailer identification number from this image.
        
Look for:
- Painted or stenciled numbers like "PIPA-01", "PIPA-02"
- Unit numbers on the side of the trailer
- Format usually: "PIPA-XX" or similar
- May also be "TRAILER-01", "REMOLQUE-01", etc.

Rules:
- Return ONLY the trailer number
- If no number visible, return exactly "null"
- Keep the format as shown (e.g., "PIPA-01")
- Return uppercase

Response format: Just the trailer number or the word null (nothing else)`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } }
        ]);

        const text = result.response.text().trim().toUpperCase();

        // Return null if AI couldn't find a trailer number
        if (text === 'NULL' || text === '' || text.length < 3) {
            return null;
        }

        console.log(`🚛 Trailer Number Detected: ${text}`);
        return text;
    } catch (error) {
        console.error('Trailer number detection error:', error);
        return null;
    }
};
