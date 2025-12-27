// lib/validation/podcast-schema.ts
// VERSIÓN: 3.1 (Enterprise Standard - Data Provenance & AI Governance)

import { z } from 'zod';

/**
 * CAPA DE SEGURIDAD: Limpieza de inyecciones maliciosas en inputs de texto.
 */
const sanitizeInput = (val: string | undefined) => {
  if (!val) return undefined;
  return val
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

const safeInputString = z.string()
  .max(10000, { message: "El texto excede el límite de seguridad (10,000 caracteres)." })
  .transform(sanitizeInput);

/**
 * Esquema de Fuente de Investigación (Transparency 360).
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es obligatorio."),
  url: z.string().url("Debe ser una URL válida."),
  snippet: z.string().optional(),
});

export const PodcastCreationSchema = z.object({
  // Identidad y Propósito
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle']),
  creation_mode: z.enum(['standard', 'remix']).default('standard'),
  
  // Metodología de Producción
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix']).optional(),
  
  // [GOBERNANZA]: agentName es el campo oficial sincronizado con la tabla ai_prompts.
  agentName: z.string().min(1, "El Agente de IA es obligatorio."),
  selectedAgent: z.string().optional(), // Mantenido para compatibilidad de UI.

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

  // --- GENEALOGÍA (Remixes) ---
  parent_id: z.number().optional().nullable(),
  root_id: z.number().optional().nullable(),
  user_reaction: z.string().optional(),
  quote_context: z.string().optional(),

  // --- OUTPUT DE PRODUCCIÓN ---
  final_title: z.string().min(1, "El título es necesario.").max(150).optional(),
  
  final_script: z.string()
    .max(40000, { message: "El guion excede la capacidad máxima de procesamiento." })
    .optional(),

  // CUSTODIA DE FUENTES: Registro bibliográfico de la investigación.
  sources: z.array(SourceSchema).default([]),

  // Configuración Técnica y de Voz
  duration: z.string().min(1, "Selecciona una duración."),
  narrativeDepth: z.string().min(1, "Define la profundidad."),
  selectedTone: z.string().optional(), 
  
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),

  tags: z.array(z.string()).optional().default([]),
  generateAudioDirectly: z.boolean().default(true),
})
.superRefine((data, ctx) => {
  // Validaciones lógicas por propósito
  if (data.purpose === 'learn' && (!data.solo_topic || data.solo_topic.length < 3)) {
    ctx.addIssue({ code: 'custom', message: 'Falta el tema a aprender.', path: ['solo_topic'] });
  }
  if (data.purpose === 'explore' && (!data.link_topicA || !data.link_topicB)) {
    ctx.addIssue({ code: 'custom', message: 'Se requieren dos temas para explorar.', path: ['link_topicA'] });
  }
});

export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;