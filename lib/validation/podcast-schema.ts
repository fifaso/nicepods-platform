// lib/validation/podcast-schema.ts
// VERSIÓN: 7
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
  .max(15000, { message: "Contenido demasiado largo." })
  .transform(sanitizeInput);

const SourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  snippet: z.string().optional(),
  origin: z.enum(['vault', 'web']).default('web'),
});

const LocalRecommendationSchema = z.object({
  name: z.string(),
  category: z.string(),
  description: z.string(),
  has_specific_podcast: z.boolean().optional().default(false),
  action_url: z.string().optional(),
});

const DiscoveryContextSchema = z.object({
  narrative_hook: z.string().optional(),
  recommendations: z.array(LocalRecommendationSchema).optional(),
  closing_thought: z.string().optional(),
  image_analysis_summary: z.string().optional(),
});

export const PodcastCreationSchema = z.object({
  draft_id: z.number().optional().nullable(),
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul', 'pulse']),
  // [ACTUALIZACIÓN]: 'geo_mode' añadido para compatibilidad con Madrid Resonance
  creation_mode: z.enum(['standard', 'remix', 'situational', 'pulse', 'geo_mode']).default('standard'),
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix', 'local_concierge', 'briefing']).optional(),
  agentName: z.string().min(1),
  pulse_source_ids: z.array(z.string()).max(5).optional(),
  dna_interview: safeInputString.optional(),
  expertise_level: z.number().min(1).max(10).default(5),
  is_sovereign_public: z.boolean().default(false),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    placeName: z.string().optional(),
    cityName: z.string().optional()
  }).optional(),
  imageContext: z.string().optional(),
  discovery_context: DiscoveryContextSchema.optional().nullable(),
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),
  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),
  link_selectedNarrative: z.object({ title: z.string(), thesis: z.string() }).nullable().optional(),
  selectedArchetype: z.string().optional(),
  archetype_topic: z.string().optional(),
  archetype_goal: z.string().optional(),
  legacy_lesson: z.string().optional(),
  question_to_answer: z.string().optional(),
  parent_id: z.number().optional().nullable(),
  root_id: z.number().optional().nullable(),
  user_reaction: z.string().optional(),
  quote_context: z.string().optional(),
  final_title: z.string().min(1).max(180).optional(),
  final_script: z.string().max(50000).optional(),
  sources: z.array(SourceSchema).default([]),
  duration: z.string().min(1),
  narrativeDepth: z.string().min(1),
  selectedTone: z.string().optional(),
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),
  tags: z.array(z.string()).default([]),
  generateAudioDirectly: z.boolean().default(true),
});

export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;