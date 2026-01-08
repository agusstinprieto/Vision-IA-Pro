// Driver Scoring Service
// Calculates driver performance scores based on biometric analysis

import { BiometricResult } from './biometrics';

export interface DriverEvaluation {
    // Session Info
    sessionStart: Date;
    sessionEnd: Date;
    durationMinutes: number;
    framesAnalyzed: number;

    // Scores (0-100)
    attentionScore: number;
    alertnessScore: number;
    emotionalScore: number;
    safetyScore: number;
    driverScore: number;
    classification: 'Excelente' | 'Bueno' | 'Regular' | 'Crítico';

    // Metrics
    avgFatigueLevel: number;
    avgStressLevel: number;
    maxFatigueLevel: number;
    maxStressLevel: number;

    // Alerts
    totalAlerts: number;
    fatigueAlerts: number;
    stressAlerts: number;
    criticalAlerts: number;

    // Additional
    dominantEmotions: Record<string, number>;
}

class DriverScoringService {
    /**
     * Calculate driver evaluation from biometric results
     */
    calculateEvaluation(
        results: BiometricResult[],
        sessionStart: Date,
        sessionEnd: Date
    ): DriverEvaluation {
        if (results.length === 0) {
            return this.getDefaultEvaluation(sessionStart, sessionEnd);
        }

        // Calculate basic metrics
        const avgFatigue = Math.round(
            results.reduce((sum, r) => sum + r.fatigueLevel, 0) / results.length
        );
        const avgStress = Math.round(
            results.reduce((sum, r) => sum + r.stressLevel, 0) / results.length
        );
        const maxFatigue = Math.max(...results.map(r => r.fatigueLevel));
        const maxStress = Math.max(...results.map(r => r.stressLevel));

        // Count alerts
        const fatigueAlerts = results.filter(r => r.fatigueLevel > 30).length;
        const stressAlerts = results.filter(r => r.stressLevel > 40).length;
        const criticalAlerts = results.filter(
            r => r.fatigueLevel > 60 || r.stressLevel > 60
        ).length;
        const totalAlerts = fatigueAlerts + stressAlerts;

        // Calculate dominant emotions
        const emotionCounts: Record<string, number> = {};
        results.forEach(r => {
            emotionCounts[r.dominantEmotion] = (emotionCounts[r.dominantEmotion] || 0) + 1;
        });

        // Calculate individual scores
        const attentionScore = this.calculateAttentionScore(results, avgStress);
        const alertnessScore = this.calculateAlertnessScore(avgFatigue, maxFatigue, fatigueAlerts);
        const emotionalScore = this.calculateEmotionalScore(avgStress, maxStress, emotionCounts);
        const safetyScore = this.calculateSafetyScore(criticalAlerts, totalAlerts, results.length);

        // Calculate final driver score (weighted average)
        const driverScore = Math.round(
            attentionScore * 0.35 +
            alertnessScore * 0.30 +
            emotionalScore * 0.20 +
            safetyScore * 0.15
        );

        // Determine classification
        const classification = this.getClassification(driverScore);

        const durationMinutes = Math.round(
            (sessionEnd.getTime() - sessionStart.getTime()) / 60000
        );

        return {
            sessionStart,
            sessionEnd,
            durationMinutes,
            framesAnalyzed: results.length,
            attentionScore,
            alertnessScore,
            emotionalScore,
            safetyScore,
            driverScore,
            classification,
            avgFatigueLevel: avgFatigue,
            avgStressLevel: avgStress,
            maxFatigueLevel: maxFatigue,
            maxStressLevel: maxStress,
            totalAlerts,
            fatigueAlerts,
            stressAlerts,
            criticalAlerts,
            dominantEmotions: emotionCounts
        };
    }

    /**
     * Calculate Attention Score (0-100)
     * Based on stress levels and distractions
     */
    private calculateAttentionScore(results: BiometricResult[], avgStress: number): number {
        // Lower stress = better attention
        // Penalize high stress moments
        const highStressCount = results.filter(r => r.stressLevel > 50).length;
        const highStressRatio = highStressCount / results.length;

        let score = 100;
        score -= avgStress * 0.5; // Penalize average stress
        score -= highStressRatio * 30; // Penalize high stress moments

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Calculate Alertness Score (0-100)
     * Based on fatigue levels and microsleep episodes
     */
    private calculateAlertnessScore(
        avgFatigue: number,
        maxFatigue: number,
        fatigueAlerts: number
    ): number {
        let score = 100;
        score -= avgFatigue * 0.6; // Penalize average fatigue
        score -= (maxFatigue - avgFatigue) * 0.3; // Penalize fatigue spikes
        score -= fatigueAlerts * 2; // Penalize each fatigue alert

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Calculate Emotional Control Score (0-100)
     * Based on stress and emotional stability
     */
    private calculateEmotionalScore(
        avgStress: number,
        maxStress: number,
        emotions: Record<string, number>
    ): number {
        let score = 100;
        score -= avgStress * 0.5;
        score -= (maxStress - avgStress) * 0.3;

        // Penalize negative emotions
        const angryCount = emotions['angry'] || 0;
        const fearfulCount = emotions['fearful'] || 0;
        const totalFrames = Object.values(emotions).reduce((sum, count) => sum + count, 0);

        if (totalFrames > 0) {
            const negativeRatio = (angryCount + fearfulCount) / totalFrames;
            score -= negativeRatio * 40;
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Calculate Safety Compliance Score (0-100)
     * Based on critical alerts and violations
     */
    private calculateSafetyScore(
        criticalAlerts: number,
        totalAlerts: number,
        totalFrames: number
    ): number {
        let score = 100;

        // Penalize critical alerts heavily
        score -= criticalAlerts * 5;

        // Penalize alert frequency
        const alertRatio = totalAlerts / totalFrames;
        score -= alertRatio * 50;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Get classification based on driver score
     */
    private getClassification(score: number): 'Excelente' | 'Bueno' | 'Regular' | 'Crítico' {
        if (score >= 90) return 'Excelente';
        if (score >= 75) return 'Bueno';
        if (score >= 60) return 'Regular';
        return 'Crítico';
    }

    /**
     * Get default evaluation when no data available
     */
    private getDefaultEvaluation(sessionStart: Date, sessionEnd: Date): DriverEvaluation {
        return {
            sessionStart,
            sessionEnd,
            durationMinutes: 0,
            framesAnalyzed: 0,
            attentionScore: 0,
            alertnessScore: 0,
            emotionalScore: 0,
            safetyScore: 0,
            driverScore: 0,
            classification: 'Crítico',
            avgFatigueLevel: 0,
            avgStressLevel: 0,
            maxFatigueLevel: 0,
            maxStressLevel: 0,
            totalAlerts: 0,
            fatigueAlerts: 0,
            stressAlerts: 0,
            criticalAlerts: 0,
            dominantEmotions: {}
        };
    }
}

export const driverScoringService = new DriverScoringService();
