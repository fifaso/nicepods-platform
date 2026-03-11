// lib/validation/podcast-schema.ts
// VERSIÓN: 9.1 (Master Integrity - Full Field Support)
// [REPARACIÓN]: Inyección de campos imageContext, generateAudioDirectly y link_selectedNarrative.

import { z } from 'zod';

const sanitizeInput = (valor: string | undefined) => {
  if (!valor) return undefined;
  return valor
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") 
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "") 
    .replace(/<[^>]+>/g, "") 
    .trim();
};

const safeInputString = z.string()
  .max(15000, { message: "Excede el límite de seguridad." })
  .transform(sanitizeInput);

const SourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  content: z.string().optional(),
  snippet: z.string().optional(),
  origin: z.enum(['vault', 'web', 'fresh_research', 'pulse_selection']).default('web'),
  relevance: z.number().optional().default(1.0),
});

export const PodcastCreationSchema = z.object({
  draft_id: z.number().optional().nullable(),
  parent_id: z.number().optional().nullable(),
  root_id: z.number().optional().nullable(),
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul', 'pulse']),
  creation_mode: z.enum(['standard', 'remix', 'situational', 'pulse', 'geo_mode']).default('standard'),
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix', 'local_concierge', 'briefing']).optional(),
  agentName: z.string().min(1),
  pulse_source_ids: z.array(z.string()).default([]),
  dna_interview: safeInputString.optional(),
  expertise_level: z.number().min(1).max(10).default(5),
  is_sovereign_public: z.boolean().default(false),
  
  // [RESTAURACIÓN]: Contexto Geoespacial y Visión
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    placeName: z.string().optional(),
    cityName: z.string().optional()
  }).optional(),
  imageContext: z.string().optional(), // <--- CAMPO RESTAURADO
  discovery_context: z.any().optional().nullable(),

  // [RESTAURACIÓN]: Semillas de Creación
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),
  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),
  link_selectedNarrative: z.object({ title: z.string(), thesis: z.string() }).nullable().optional(), // <--- CAMPO RESTAURADO
  legacy_lesson: safeInputString.optional(),
  question_to_answer: safeInputString.optional(),
  user_reaction: z.string().optional(), 
  quote_context: z.string().optional(),

  // [RESTAURACIÓN]: Producción Final
  final_title: z.string().optional(),
  final_script: z.string().optional(),
  sources: z.array(SourceSchema).default([]),
  generateAudioDirectly: z.boolean().default(true), // <--- CAMPO RESTAURADO

  duration: z.string().min(1),
  narrativeDepth: z.string().min(1),
  selectedTone: z.string().optional(),
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),
});

export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;