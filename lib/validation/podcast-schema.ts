// lib/validation/podcast-schema.ts
// VERSIÓN: 10.0 (NicePod Schema Master - Thermal Control & Depth Edition)
// Misión: Gobernar la integridad de datos, sanitizar inputs y blindar el contrato de orígenes.
// [ESTABILIZACIÓN]: Restricción estricta de duraciones (Máx 5 min) para control térmico 
// y restauración de validación cruzada (superRefine) para densidad cognitiva.

import { z } from 'zod';

/**
 * CAPA DE SEGURIDAD: sanitizeInput
 * Neutraliza inyecciones de código y limpia rastro de etiquetas HTML residuales.
 * Vital para proteger la Bóveda de metadatos corruptos.
 */
const sanitizeInput = (valor: string | undefined) => {
  if (!valor) return undefined;
  return valor
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

/**
 * TIPO: safeInputString
 * Validador para entradas de texto con transformación de seguridad automática.
 */
const safeInputString = z.string()
  .max(15000, { message: "El contenido excede el límite de seguridad (15,000 caracteres)." })
  .transform(sanitizeInput);

/**
 * ESQUEMA: SourceSchema
 * Define el contrato de las fuentes de conocimiento, incluyendo los orígenes de IA.
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es obligatorio."),
  url: z.string().url("Dirección web no detectada o inválida."),
  content: z.string().optional(),
  snippet: z.string().optional(),
  origin: z.enum(['vault', 'web', 'fresh_research', 'pulse_selection']).default('web'),
  relevance: z.number().optional().default(1.0),
});

/**
 * ESQUEMA MAESTRO: PodcastCreationSchema
 * El contrato definitivo que orquesta los flujos de creación en NicePod V2.5.
 */
export const PodcastCreationSchema = z.object({
  // --- IDENTIFICADORES Y GENEALOGÍA ---
  draft_id: z.number().optional().nullable(),
  parent_id: z.number().optional().nullable(),
  root_id: z.number().optional().nullable(),

  // --- IDENTIDAD DEL FLUJO ---
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul', 'pulse']),
  creation_mode: z.enum(['standard', 'remix', 'situational', 'pulse', 'geo_mode']).default('standard'),
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix', 'local_concierge', 'briefing']).optional(),

  // --- INTELIGENCIA Y AGENTES ---
  agentName: z.string().min(1, "Selecciona un agente de inteligencia."),
  pulse_source_ids: z.array(z.string()).default([]),
  dna_interview: safeInputString.optional(),
  expertise_level: z.number().min(1).max(10).default(5),
  is_sovereign_public: z.boolean().default(false),

  // --- CONTEXTO GEOESPACIAL (Soberanía Admin) ---
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    placeName: z.string().optional(),
    cityName: z.string().optional()
  }).optional(),
  imageContext: z.string().optional(),
  discovery_context: z.any().optional().nullable(),

  // --- SEMILLAS DE CREACIÓN (Inputs de Usuario) ---
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),
  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),
  link_selectedNarrative: z.object({ title: z.string(), thesis: z.string() }).nullable().optional(),
  legacy_lesson: safeInputString.optional(),
  question_to_answer: safeInputString.optional(),
  user_reaction: z.string().optional(),
  quote_context: z.string().optional(),

  // --- ACTIVOS DE PRODUCCIÓN FINAL ---
  final_title: z.string().optional(),
  final_script: z.string().optional(),
  sources: z.array(SourceSchema).default([]),
  generateAudioDirectly: z.boolean().default(true),

  // --- CONFIGURACIÓN TÉCNICA (NUEVO ESTÁNDAR V10.0) ---
  // [FIX CRÍTICO]: Se fuerza el uso exclusivo de los 3 nuevos tramos de tiempo
  // para garantizar la estabilidad térmica de la Edge Function de Audio (OOM Prevention).
  duration: z.enum([
    'Menos de 1 minuto',
    'Entre 2 y 3 minutos',
    'Hasta 5 minutos'
  ], {
    required_error: "La duración es un parámetro obligatorio para la forja."
  }),

  // [FIX CRÍTICO]: Se estandariza la profundidad para evitar alucinaciones en el prompt de IA.
  narrativeDepth: z.enum([
    'Superficial',
    'Intermedia',
    'Profunda'
  ]),

  selectedTone: z.string().optional(),

  // --- PARÁMETROS ACÚSTICOS (Gemini TTS) ---
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),
})
  /**
   * REFINAMIENTO SOBERANO: Validaciones cruzadas de calidad (Restauración)
   */
  .superRefine((data, ctx) => {
    // 1. VALIDACIÓN DE SUSTANCIA COGNITIVA (Mínimo 10 palabras)
    // Garantiza que la IA reciba contexto suficiente para no "alucinar" contenido genérico.
    const contentToMeasure = data.solo_motivation || data.legacy_lesson || data.dna_interview || "";
    const words = contentToMeasure.trim().split(/\s+/).filter(w => w.length > 0);

    if (data.purpose !== 'pulse' && words.length > 0 && words.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sustancia insuficiente: Desarrolla tu idea con al menos 10 palabras para iniciar la forja.',
        path: ['solo_motivation'] // Se ancla al campo principal de intención
      });
    }

    // 2. VALIDACIÓN PULSE: Requiere fuentes del radar
    if (data.purpose === 'pulse' && data.pulse_source_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona al menos una señal de valor en el Radar de Actualidad.',
        path: ['pulse_source_ids']
      });
    }

    // 3. VALIDACIÓN LOCAL SOUL: Requiere GPS Activo
    if (data.purpose === 'local_soul' && !data.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La triangulación GPS es obligatoria para establecer resonancia local.',
        path: ['location']
      });
    }
  });

/**
 * TIPO DE DATOS INFERIDO: PodcastCreationData
 * Es la fuente de verdad tipificada para todos los formularios del sistema.
 */
export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Control de Densidad: La redefinición de 'duration' a un Enum estricto de máximo 
 *    5 minutos cierra la brecha de vulnerabilidad de las Edge Functions, asegurando 
 *    que el 'Master Stitcher' de audio nunca exceda los 150MB de RAM de Deno.
 * 2. Restauración de Integridad: La inyección de '.superRefine' recupera la barrera 
 *    de calidad ("Sustancia insuficiente") que se había perdido, exigiendo al curador 
 *    una intención clara antes de activar el consumo de tokens de IA.
 */