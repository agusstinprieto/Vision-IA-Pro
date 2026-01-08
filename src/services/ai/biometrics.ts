
import * as faceapi from 'face-api.js';

// Configuration
const MODELS_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

export interface BiometricResult {
    stressLevel: number; // 0-100
    fatigueLevel: number; // 0-100
    dominantEmotion: string;
    expressions: faceapi.FaceExpressions;
    timestamp: number;
}

class BiometricsService {
    private isModelLoaded = false;

    async loadModels() {
        if (this.isModelLoaded) return;

        try {
            console.log("Loading FaceAPI models...");
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODELS_URL)
            ]);
            this.isModelLoaded = true;
            console.log("FaceAPI models loaded successfully");
        } catch (error) {
            console.error("Error loading FaceAPI models:", error);
            throw new Error("Failed to load AI models");
        }
    }

    async analyzeFrame(video: HTMLVideoElement): Promise<BiometricResult | null> {
        if (!this.isModelLoaded || video.paused || video.ended) return null;

        try {
            // Detect face with lightweight detector for speed
            const detection = await faceapi.detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions()
            )
                .withFaceLandmarks()
                .withFaceExpressions();

            if (!detection) return null;

            // Calculate Driver Health Metrics
            const expressions = detection.expressions;

            // Heuristic: Stress = (Anger + Fear + Disgusted) * 100
            const stressRaw = (expressions.angry + expressions.fearful + expressions.disgusted) * 100;
            const stressLevel = Math.min(100, Math.round(stressRaw));

            // Heuristic: Fatigue = (Sad + Neutral * 0.2) + Blink Rate (Not implemented here, needs state)
            const fatigueRaw = (expressions.sad + (expressions.neutral * 0.1)) * 100;
            const fatigueLevel = Math.min(100, Math.round(fatigueRaw));

            // Find dominant emotion
            const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
            const dominantEmotion = sorted[0][0];

            return {
                stressLevel,
                fatigueLevel,
                dominantEmotion,
                expressions,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error("Biometric analysis error:", error);
            return null;
        }
    }
}

export const biometricsService = new BiometricsService();
