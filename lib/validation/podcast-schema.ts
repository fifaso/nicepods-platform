// lib/validation/podcast-schema.ts
// VERSIÓN: 8.0 (Master Integrity - Unified Multi-Flow Validation & Shield)

import { z } from 'zod';

/**
 * CAPA DE SEGURIDAD: Sanitización de inyecciones y limpieza de HTML.
 */
const sanitizeInput = (valor: string | undefined) => {
  if (!valor) return undefined;
  return valor
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Neutraliza scripts
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "") // Neutraliza iframes
    .replace(/<[^>]+>/g, "") // Elimina HTML residual
    .trim();
};

/**
 * Validador para entradas de texto de alta densidad.
 */
const safeInputString = z.string()
  .max(15000, { message: "El contenido excede el límite de seguridad (15,000 caracteres)." })
  .transform(sanitizeInput);

/**
 * Esquema de Fuente de Investigación (NKV & Web).
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es obligatorio."),
  url: z.string().url("Debe ser una dirección web válida."),
  snippet: z.string().optional(),
  origin: z.enum(['vault', 'web']).default('web'),
});

/**
 * Esquema de Recomendación Local (Madrid Resonance).
 */
const LocalRecommendationSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string(),
  has_specific_podcast: z.boolean().optional().default(false),
  action_url: z.string().optional(),
});

/**
 * Esquema del Dossier Situacional.
 */
const DiscoveryContextSchema = z.object({
  narrative_hook: z.string().optional(),
  recommendations: z.array(LocalRecommendationSchema).optional(),
  closing_thought: z.string().optional(),
  image_analysis_summary: z.string().optional(),
  // Soporte para datos técnicos de sensores
  weather: z.object({
    temp_c: z.number(),
    condition: z.string()
  }).optional()
});

/**
 * ESQUEMA MAESTRO DE CREACIÓN NICEPOD
 * Contrato único que gobierna los 5 flujos de la plataforma.
 */
export const PodcastCreationSchema = z.object({
  // Identificadores
  draft_id: z.number().optional().nullable(),
  parent_id: z.number().optional().nullable(),
  root_id: z.number().optional().nullable(),

  // Identidad del Flujo
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul', 'pulse']),
  creation_mode: z.enum(['standard', 'remix', 'situational', 'pulse', 'geo_mode']).default('standard'),
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix', 'local_concierge', 'briefing']).optional(),

  // Inteligencia Pulse & ADN
  agentName: z.string().min(1, "El Agente de IA debe estar definido."),
  pulse_source_ids: z.array(z.string()).max(5, "Máximo 5 fuentes permitidas.").default([]),
  dna_interview: safeInputString.optional(),
  expertise_level: z.number().min(1).max(10).default(5),
  is_sovereign_public: z.boolean().default(false),

  // Contexto Geoespacial
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    placeName: z.string().optional(),
    cityName: z.string().optional()
  }).optional(),
  imageContext: z.string().optional(), // Base64 del entorno
  discovery_context: DiscoveryContextSchema.optional().nullable(),

  // Inputs de Contenido (Semillas)
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),
  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),
  link_selectedNarrative: z.object({ title: z.string(), thesis: z.string() }).nullable().optional(),
  legacy_lesson: safeInputString.optional(),
  question_to_answer: safeInputString.optional(),
  user_reaction: z.string().optional(), // Para Remixes
  quote_context: z.string().optional(),

  // Datos de Producción Final
  final_title: z.string().min(1, "El título es obligatorio.").max(180).optional(),
  final_script: z.string().max(50000).optional(),
  sources: z.array(SourceSchema).default([]),

  // Configuración Técnica
  duration: z.string().min(1, "Selecciona una duración."),
  narrativeDepth: z.string().min(1, "Define el nivel de profundidad."),
  selectedTone: z.string().optional(),

  // Parámetros de Voz (Gemini TTS)
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),

  // Metadatos de Red
  tags: z.array(z.string()).default([]),
  generateAudioDirectly: z.boolean().default(true),
})
  .superRefine((data, ctx) => {
    // 1. VALIDACIÓN PULSE: Requiere fuentes del Radar
    if (data.purpose === 'pulse' && data.pulse_source_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona al menos una señal de valor en el Radar para continuar.',
        path: ['pulse_source_ids']
      });
    }

    // 2. VALIDACIÓN LOCAL SOUL: Requiere GPS Activo
    if (data.purpose === 'local_soul' && !data.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La sincronización GPS es obligatoria para anclar una memoria local.',
        path: ['location']
      });
    }

    // 3. VALIDACIÓN DE CALIDAD: Mínimo de palabras en temas de aprendizaje
    if (data.purpose === 'learn' && (!data.solo_topic || data.solo_topic.length < 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El tema de aprendizaje debe ser más descriptivo.',
        path: ['solo_topic']
      });
    }
  });

/**
 * TIPO DE DATOS INFERIDO
 */
export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;