// components/create-flow/shared/vocal-director-map.ts
// VERSIÓN: 1.0 (Frontend Mirror - Golden Setups for Audio V3.0)

export type PersonalityType = 'narrador' | 'esceptico' | 'mentor' | 'amigo' | 'rebelde' | 'minimalista';
export type VoicePace = 'Lento' | 'Moderado' | 'Rápido';
export type VoiceStyle = 'Calmado' | 'Energético' | 'Profesional' | 'Inspirador';

export const PERSONALITY_PERFECT_SETUPS: Record<PersonalityType, { pace: VoicePace, style: VoiceStyle }> = {
    narrador: { pace: 'Moderado', style: 'Inspirador' },
    esceptico: { pace: 'Moderado', style: 'Profesional' },
    mentor: { pace: 'Lento', style: 'Profesional' },
    amigo: { pace: 'Moderado', style: 'Calmado' },
    rebelde: { pace: 'Rápido', style: 'Energético' },
    minimalista: { pace: 'Moderado', style: 'Profesional' }
};