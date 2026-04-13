/**
 * ARCHIVO: lib/validation/podcast-schema.ts
 * VERSIÓN: 11.0 (NicePod Schema Master - Thermal Control & Depth Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 *
 * Misión: Gobernar la integridad de datos, sanitizar inputs y blindar el contrato de orígenes.
 * [MANDATO]: Zero Abbreviations Policy (ZAP) y Nominal Mirroring (camelCase).
 */

import { z } from 'zod';

/**
 * CAPA DE SEGURIDAD: sanitizeInput
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
 */
const safeInputString = z.string()
  .max(15000, { message: "El contenido excede el límite de seguridad (15,000 caracteres)." })
  .transform(sanitizeInput);

/**
 * ESQUEMA: SourceSchema
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es obligatorio."),
  uniformResourceLocator: z.string().url("Dirección web no detectada o inválida."),
  content: z.string().optional(),
  snippet: z.string().optional(),
  origin: z.enum(['vault', 'web', 'fresh_research', 'pulse_selection']).default('web'),
  relevance: z.number().optional().default(1.0),
});

/**
 * ESQUEMA MAESTRO: PodcastCreationSchema
 */
export const PodcastCreationSchema = z.object({
  // --- IDENTIFICADORES Y GENEALOGÍA ---
  draftIdentification: z.number().optional().nullable(),
  parentIdentification: z.number().optional().nullable(),
  rootIdentification: z.number().optional().nullable(),

  // --- IDENTIDAD DEL FLUJO ---
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul', 'pulse']),
  creationMode: z.enum(['standard', 'remix', 'situational', 'pulse', 'geo_mode']).default('standard'),
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix', 'local_concierge', 'briefing']).optional(),

  // --- INTELIGENCIA Y AGENTES ---
  agentName: z.string().min(1, "Selecciona un agente de inteligencia."),
  pulseSourceIdentifications: z.array(z.string()).default([]),
  deoxyribonucleicAcidInterview: safeInputString.optional(),
  expertiseLevel: z.number().min(1).max(10).default(5),
  isSovereignPublic: z.boolean().default(false),

  // --- CONTEXTO GEOESPACIAL ---
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    placeName: z.string().optional(),
    cityName: z.string().optional()
  }).optional(),
  imageContext: z.string().optional(),
  discoveryContext: z.any().optional().nullable(),

  // --- SEMILLAS DE CREACIÓN ---
  soloTopic: safeInputString.optional(),
  soloMotivation: safeInputString.optional(),
  linkTopicA: safeInputString.optional(),
  linkTopicB: safeInputString.optional(),
  linkCatalyst: safeInputString.optional(),
  linkSelectedNarrative: z.object({ title: z.string(), thesis: z.string() }).nullable().optional(),
  legacyLesson: safeInputString.optional(),
  questionToAnswer: safeInputString.optional(),
  userReaction: z.string().optional(),
  quoteContext: z.string().optional(),

  // --- ACTIVOS DE PRODUCCIÓN FINAL ---
  finalTitle: z.string().optional(),
  finalScript: z.string().optional(),
  sources: z.array(SourceSchema).default([]),
  generateAudioDirectly: z.boolean().default(true),

  // --- CONFIGURACIÓN TÉCNICA ---
  duration: z.enum([
    'Menos de 1 minuto',
    'Entre 2 y 3 minutos',
    'Hasta 5 minutos'
  ], {
    required_error: "La duración es un parámetro obligatorio para la forja."
  }),

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
  .superRefine((data, ctx) => {
    const contentToMeasure = data.soloMotivation || data.legacyLesson || data.deoxyribonucleicAcidInterview || "";
    const words = contentToMeasure.trim().split(/\s+/).filter(w => w.length > 0);

    if (data.purpose !== 'pulse' && words.length > 0 && words.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sustancia insuficiente: Desarrolla tu idea con al menos 10 palabras para iniciar la forja.',
        path: ['soloMotivation']
      });
    }

    if (data.purpose === 'pulse' && data.pulseSourceIdentifications.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona al menos una señal de valor en el Radar de Actualidad.',
        path: ['pulseSourceIdentifications']
      });
    }

    if (data.purpose === 'local_soul' && !data.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La triangulación GPS es obligatoria para establecer resonancia local.',
        path: ['location']
      });
    }
  });

export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;
