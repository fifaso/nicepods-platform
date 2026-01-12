// supabase/functions/_shared/vocal-director-map.ts
// VERSIÓN: 1.0 (Master Standard - Performance Intelligence & Spanish Prosody)

/**
 * DEFINICIÓN DE TIPOS ESTRICTOS
 * Garantiza la integridad de datos en toda la tubería de audio.
 */
export type PersonalityType = 'narrador' | 'esceptico' | 'mentor' | 'amigo' | 'rebelde' | 'minimalista';
export type VoicePace = 'Lento' | 'Moderado' | 'Rápido';
export type VoiceStyle = 'Calmado' | 'Energético' | 'Profesional' | 'Inspirador';
export type VoiceGender = 'Masculino' | 'Femenino';

export interface PerfectSetup {
    pace: VoicePace;
    style: VoiceStyle;
}

/**
 * 🎯 CONFIGURACIONES ÁUREAS (PERFECT SETUPS)
 * Fuente de verdad para el Frontend. 
 * Define la combinación que maximiza el potencial de cada personalidad.
 */
export const PERSONALITY_PERFECT_SETUPS: Record<PersonalityType, PerfectSetup> = {
    narrador: {
        pace: 'Moderado',
        style: 'Inspirador'
    },
    esceptico: {
        pace: 'Moderado',
        style: 'Profesional'
    },
    mentor: {
        pace: 'Lento',
        style: 'Profesional'
    },
    amigo: {
        pace: 'Moderado',
        style: 'Calmado'
    },
    rebelde: {
        pace: 'Rápido',
        style: 'Energético'
    },
    minimalista: {
        pace: 'Moderado',
        style: 'Profesional'
    }
};

/**
 * 🎭 MAPA DE DIRECCIÓN VOCAL (ACTING NOTES)
 * Instrucciones en prosa de alta densidad para el razonamiento de Gemini.
 */
export const VOCAL_PROMPTS = {
    personalities: {
        narrador: "Interpreta con matices literarios. Usa pausas dramáticas intencionales de 1 segundo antes de frases clave. Tu entonación debe evocar misterio y asombro.",
        esceptico: "Voz analítica y ligeramente inquisitiva. Cada palabra debe sonar pesada y calculada. Énfasis en datos. Evita el entusiasmo innecesario.",
        mentor: "Resonancia profunda y autoridad serena. Cadencia pausada que transmite seguridad. Habla desde la experiencia, con tono protector y sabio.",
        amigo: "Voz cálida y empática. Uso de inflexiones naturales del habla cotidiana (colocación media). Debe sonar como una confidencia entre personas cercanas.",
        rebelde: "Ataque directo y rítmico. Tono disruptivo con finales de frase descendentes que denotan seguridad desafiante. Energía cruda y sin filtros.",
        minimalista: "Voz seca, clara y eficiente. Cero adornos emocionales. Diction impecable con enfoque absoluto en la transmisión del dato puro."
    },
    styles: {
        Calmado: "Textura vocal aterciopelada. Volumen moderado-bajo con respiraciones suaves audibles para maximizar el realismo humano.",
        Energético: "Proyección vibrante. Brillo vocal alto. Ritmo ascendente que busca motivar e impulsar al oyente.",
        Profesional: "Estabilidad tonal absoluta. Registro equilibrado. Diction quirúrgica, ideal para contextos corporativos o científicos.",
        Inspirador: "Crescendo emocional sutil. Uso de pausas de 'aire' al final de las ideas principales para invitar a la reflexión profunda."
    },
    paces: {
        Lento: "Pausas de 1.2s en puntos seguidos. Habla espaciada que permite procesar conceptos complejos.",
        Moderado: "Ritmo de conversación natural. Flujo constante y balanceado.",
        Rápido: "Cadencia ágil y dinámica. Transmite urgencia intelectual y fluidez de ideas inmediata."
    }
};

/**
 * generateDirectorNote
 * Compila todas las variables en una instrucción de actuación final 
 * para el modelo Gemini 2.5 Pro Audio.
 */
export function generateDirectorNote(
    personality: PersonalityType,
    gender: VoiceGender,
    style: VoiceStyle,
    pace: VoicePace
): string {
    const pBase = VOCAL_PROMPTS.personalities[personality];
    const sBase = VOCAL_PROMPTS.styles[style];
    const rBase = VOCAL_PROMPTS.paces[pace];
    const gBase = gender === 'Masculino'
        ? "Registro de voz masculino, profundidad barítona."
        : "Registro de voz femenino, claridad soprano media.";

    return `
    [VOCAL PERFORMANCE PROTOCOL]
    ROLE: Eres un actor de voz de élite interpretando a un ${personality.toUpperCase()}.
    GENDER_PROFILE: ${gBase}
    PERSONALITY_DIRECTION: ${pBase}
    EMOTIONAL_TONE: ${sBase}
    RHYTHM_PACE: ${rBase}
    
    [PHONETIC RULES]
    1. IDIOMA: Español Neutro (Global).
    2. ACENTUACIÓN: Respeta estrictamente la métrica del español, evitando acentos anglosajones.
    3. ÉNFASIS: Identifica las palabras de valor en el guion y dales un mayor relieve tonal.
    4. NATURALIDAD: Incluye micro-pausas de pensamiento donde el texto sugiera complejidad.
    
    IMPORTANTE: No te limites a leer. INTERPRETA la intención detrás de cada párrafo.
    `.trim();
}