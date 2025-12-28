// lib/validation/podcast-schema.ts
// VERSIÓN: 4.0 (Enterprise Standard - Spatial & Vision Support)

import { z } from 'zod';

/**
 * CAPA DE SEGURIDAD: Limpieza de entradas de texto contra ataques XSS e inyecciones de código.
 */
const sanitizeInput = (valor: string | undefined) => {
  if (!valor) return undefined;
  return valor
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Neutraliza scripts
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "") // Neutraliza iframes
    .replace(/<[^>]+>/g, "") // Elimina cualquier etiqueta HTML residual
    .trim();
};

/**
 * Validador robusto para strings de largo aliento (guiones y descripciones).
 */
const safeInputString = z.string()
  .max(15000, { message: "El contenido excede el límite de seguridad de 15,000 caracteres." })
  .transform(sanitizeInput);

/**
 * Esquema de Fuente de Investigación para Transparencia 360.
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es obligatorio."),
  url: z.string().url("URL de investigación inválida."),
  snippet: z.string().optional(),
});

/**
 * ESQUEMA MAESTRO DE CREACIÓN
 * Define todas las ramas posibles de creación: desde monólogos hasta Turismo Local.
 */
export const PodcastCreationSchema = z.object({
  // Propósito e Intencionalidad del usuario
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul']),
  
  // Modo de creación (Estándar o Respuesta/Remix)
  creation_mode: z.enum(['standard', 'remix']).default('standard'),
  
  // Metodología Técnica (estilo de guion)
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix', 'local_concierge']).optional(),
  
  // Identidad técnica del Agente AI a invocar
  agentName: z.string().min(1, "El Agente de IA debe estar definido."),
  selectedAgent: z.string().optional(), // Compatibilidad con componentes legacy

  // --- DATOS SENSORIALES (NUEVO: VIVIR LO LOCAL) ---
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    placeName: z.string().optional(),
    cityName: z.string().optional()
  }).optional(),

  // Contexto visual (Base64 de la cámara o upload)
  imageContext: z.string().optional(),

  // --- INPUTS DE MATERIA PRIMA (SEMILLA) ---
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
  final_title: z.string().min(1, "Título obligatorio").max(180).optional(),
  final_script: z.string().max(50000).optional(),

  // CUSTODIA DE FUENTES (Transparency Hub)
  sources: z.array(SourceSchema).default([]),

  // Configuración de Producción Técnica
  duration: z.string().min(1, "Duración requerida"),
  narrativeDepth: z.string().min(1, "Profundidad requerida"),
  selectedTone: z.string().optional(), 
  
  // Parámetros del Motor de Voz
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),

  // Metadatos de Red
  tags: z.array(z.string()).default([]),
  generateAudioDirectly: z.boolean().default(true),
})
.superRefine((data, ctx) => {
  // Validación de seguridad para "Vivir lo Local"
  if (data.purpose === 'local_soul' && !data.location && !data.imageContext) {
    ctx.addIssue({
      code: 'custom',
      message: 'Para vivir lo local, NicePod necesita tu ubicación o una fotografía de tu entorno.',
      path: ['purpose']
    });
  }

  // Validación para el flujo de aprendizaje
  if (data.purpose === 'learn' && !data.solo_topic) {
    ctx.addIssue({ code: 'custom', message: 'Indica qué deseas aprender hoy.', path: ['solo_topic'] });
  }
});

/**
 * TIPO DE DATOS INFERIDO
 * Objeto central que fluye por todo el formulario y componentes de UI.
 */
export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;