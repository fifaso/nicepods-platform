// lib/validation/podcast-schema.ts
// VERSIÓN: 5.1 (Master Standard - Draft ID & Persistence Support)

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
 * Esquema de Fuente de Investigación para Transparencia 360.
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es obligatorio."),
  url: z.string().url("Debe ser una dirección web válida."),
  snippet: z.string().optional(),
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
 * Este es el contrato único entre el Formulario y el Backend de NicePod.
 */
export const PodcastCreationSchema = z.object({
  // [NUEVO]: Identificador de persistencia para el sistema de hidratación y promoción.
  // Permite al Backend actualizar un registro 'draft' en lugar de crear uno nuevo.
  draft_id: z.number().optional().nullable(),

  // Identidad y Propósito
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul']),
  creation_mode: z.enum(['standard', 'remix', 'situational']).default('standard'),

  // Metodología de Producción
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix', 'local_concierge']).optional(),

  // GOBERNANZA DE IA: agentName es el campo oficial sincronizado con la DB.
  agentName: z.string().min(1, "El Agente de IA debe estar definido."),
  selectedAgent: z.string().optional(), // Mantenido por compatibilidad legacy.

  // --- CONTEXTO SITUACIONAL ---
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    placeName: z.string().optional(),
    cityName: z.string().optional()
  }).optional(),

  imageContext: z.string().optional(), // Base64 de la captura visual.

  // [BLOQUE CRÍTICO]: Dossier de resultados de la fase de descubrimiento.
  discovery_context: DiscoveryContextSchema.optional().nullable(),

  // --- INPUTS SEMILLA (MATERIA PRIMA) ---
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),

  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),

  link_selectedNarrative: z.object({
    title: z.string(),
    thesis: z.string()
  }).nullable().optional(),

  link_selectedTone: z.string().optional(),

  selectedArchetype: z.string().optional(),
  archetype_topic: z.string().optional(),
  archetype_goal: z.string().optional(),

  legacy_lesson: z.string().optional(),
  question_to_answer: z.string().optional(),

  // --- GENEALOGÍA (Remixes / Threads) ---
  parent_id: z.number().optional().nullable(),
  root_id: z.number().optional().nullable(),
  user_reaction: z.string().optional(),
  quote_context: z.string().optional(),

  // --- DATOS DE PRODUCCIÓN FINAL ---
  final_title: z.string().min(1, "El título es obligatorio.").max(180).optional(),
  final_script: z.string().max(50000).optional(),

  // CUSTODIA DE FUENTES: Bibliografía recolectada por IA/Tavily.
  sources: z.array(SourceSchema).default([]),

  // Configuración Técnica
  duration: z.string().min(1, "Selecciona una duración."),
  narrativeDepth: z.string().min(1, "Define el nivel de profundidad."),
  selectedTone: z.string().optional(),

  // Parámetros del Motor de Voz (Neural2)
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),

  // Metadatos de Red
  tags: z.array(z.string()).default([]),
  generateAudioDirectly: z.boolean().default(true),
})
  .superRefine((data, ctx) => {
    // 1. Validación para "Vivir lo Local"
    if (data.purpose === 'local_soul' && !data.location && !data.imageContext && !data.solo_topic) {
      ctx.addIssue({
        code: 'custom',
        message: 'Indica un lugar, usa el GPS o captura una foto para vivir lo local.',
        path: ['solo_topic']
      });
    }

    // 2. Validación para flujos de aprendizaje (Mínimo 3 caracteres para tema)
    if (data.purpose === 'learn' && (!data.solo_topic || data.solo_topic.length < 3)) {
      ctx.addIssue({ code: 'custom', message: 'Indica qué tema deseas aprender.', path: ['solo_topic'] });
    }

    // 3. Validación de Remixes
    if (data.creation_mode === 'remix' && !data.user_reaction) {
      ctx.addIssue({ code: 'custom', message: 'La reacción de voz es necesaria.', path: ['user_reaction'] });
    }
  });

/**
 * TIPO DE DATOS INFERIDO
 * Fuente de verdad para todos los componentes de la plataforma.
 */
export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;