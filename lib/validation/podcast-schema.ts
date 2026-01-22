// lib/validation/podcast-schema.ts
// VERSIÓN: 6.0 (Pulse Master - Cognitive DNA & Sovereign Curation Support)

import { z } from 'zod';

/**
 * CAPA DE SEGURIDAD: Limpieza de inyecciones maliciosas y sanitización de texto.
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
 * Validador robusto para entradas de texto de alta densidad.
 */
const safeInputString = z.string()
  .max(15000, { message: "El contenido excede el límite de seguridad (15,000 caracteres)." })
  .transform(sanitizeInput);

/**
 * Esquema de Fuente de Investigación para Transparencia 360 y NKV.
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es obligatorio."),
  url: z.string().url("Debe ser una dirección web válida."),
  snippet: z.string().optional(),
  origin: z.enum(['vault', 'web']).default('web'),
});

/**
 * Esquema de Recomendación Local (Points of Interest).
 */
const LocalRecommendationSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string(),
  has_specific_podcast: z.boolean().optional().default(false),
  action_url: z.string().optional(),
});

/**
 * Esquema del Dossier de Descubrimiento (Situational Intelligence).
 */
const DiscoveryContextSchema = z.object({
  narrative_hook: z.string().optional(),
  recommendations: z.array(LocalRecommendationSchema).optional(),
  closing_thought: z.string().optional(),
  image_analysis_summary: z.string().optional(),
});

/**
 * ESQUEMA MAESTRO DE CREACIÓN
 * Contrato único para flujos de Aprendizaje, Legado y Actualidad (Pulse).
 */
export const PodcastCreationSchema = z.object({
  // Identificador de persistencia
  draft_id: z.number().optional().nullable(),

  // Identidad y Propósito
  // [ACTUALIZACIÓN 6.0]: 'pulse' es ahora el motor de actualidad personalizada.
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul', 'pulse']),
  creation_mode: z.enum(['standard', 'remix', 'situational', 'pulse']).default('standard'),

  // Metodología de Producción
  // [ACTUALIZACIÓN 6.0]: 'briefing' identifica las píldoras estratégicas cortas.
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix', 'local_concierge', 'briefing']).optional(),

  // GOBERNANZA DE IA
  agentName: z.string().min(1, "El Agente de IA debe estar definido."),

  // --- BLOQUE PULSE: ACTUALIDAD Y ADN ---
  // Fuentes seleccionadas desde el radar (Top 20 -> Seleccionadas 1-5)
  pulse_source_ids: z.array(z.string()).max(5, "Máximo 5 fuentes por píldora.").optional(),
  // Texto de la entrevista inicial o misión profesional para el ADN Cognitivo
  dna_interview: safeInputString.optional(),
  // Nivel de especialización técnica (1-10)
  expertise_level: z.number().min(1).max(10).default(5),
  // Control de Curaduría Soberana
  is_sovereign_public: z.boolean().default(false),

  // --- CONTEXTO SITUACIONAL ---
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    placeName: z.string().optional(),
    cityName: z.string().optional()
  }).optional(),

  imageContext: z.string().optional(),

  discovery_context: DiscoveryContextSchema.optional().nullable(),

  // --- INPUTS SEMILLA ---
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),

  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),

  link_selectedNarrative: z.object({
    title: z.string(),
    thesis: z.string()
  }).nullable().optional(),

  selectedArchetype: z.string().optional(),
  archetype_topic: z.string().optional(),
  archetype_goal: z.string().optional(),

  legacy_lesson: z.string().optional(),
  question_to_answer: z.string().optional(),

  // --- GENEALOGÍA ---
  parent_id: z.number().optional().nullable(),
  root_id: z.number().optional().nullable(),
  user_reaction: z.string().optional(),
  quote_context: z.string().optional(),

  // --- DATOS DE PRODUCCIÓN FINAL ---
  final_title: z.string().min(1, "El título es obligatorio.").max(180).optional(),
  final_script: z.string().max(50000).optional(),

  sources: z.array(SourceSchema).default([]),

  // Configuración Técnica
  duration: z.string().min(1, "Selecciona una duración."),
  narrativeDepth: z.string().min(1, "Define el nivel de profundidad."),
  selectedTone: z.string().optional(),

  // Parámetros de Voz
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),

  tags: z.array(z.string()).default([]),
  generateAudioDirectly: z.boolean().default(true),
})
  .superRefine((data, ctx) => {
    // 1. Validación para "Pulse" (Actualidad)
    if (data.purpose === 'pulse' && (!data.pulse_source_ids || data.pulse_source_ids.length === 0)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Activa tu radar y selecciona al menos una fuente para tu actualidad.',
        path: ['pulse_source_ids']
      });
    }

    // 2. Validación para flujos de aprendizaje
    if (data.purpose === 'learn' && (!data.solo_topic || data.solo_topic.length < 3)) {
      ctx.addIssue({ code: 'custom', message: 'Indica qué tema deseas aprender.', path: ['solo_topic'] });
    }

    // 3. Validación de Remixes
    if (data.creation_mode === 'remix' && !data.user_reaction) {
      ctx.addIssue({ code: 'custom', message: 'La reacción de voz es necesaria.', path: ['user_reaction'] });
    }
  });

export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;