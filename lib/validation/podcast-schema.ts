// lib/validation/podcast-schema.ts
// VERSIÓN: 9.0 (Master Integrity - Unified Multi-Flow Shield)
// Misión: Gobernar la integridad de datos, sanitizar inputs y blindar el contrato de orígenes.
// [ESTABILIZACIÓN]: Sincronización de orígenes de investigación (AI Origins) y validación de densidad cognitiva.

import { z } from 'zod';

/**
 * CAPA DE SEGURIDAD: sanitizeInput
 * Neutraliza inyecciones de código y limpia rastro de etiquetas HTML residuales.
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
 * [FIX CRÍTICO]: Se han añadido los orígenes 'fresh_research' y 'pulse_selection'.
 * Sin estos valores, Zod descartaba las fuentes generadas por la IA durante la hidratación.
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es obligatorio."),
  url: z.string().url("Dirección web no detectada o inválida."),
  content: z.string().optional(), // Contenido extraído por Tavily/NKV
  snippet: z.string().optional(), // Fragmento para previsualización
  origin: z.enum(['vault', 'web', 'fresh_research', 'pulse_selection']).default('web'),
  relevance: z.number().optional().default(1.0),
});

/**
 * ESQUEMA: DiscoveryContextSchema
 * Dossier técnico generado para el modo Local Soul (Madrid Resonance).
 */
const DiscoveryContextSchema = z.object({
  narrative_hook: z.string().optional(),
  recommendations: z.array(z.any()).optional(), // Se delega el tipado interno a types/podcast.ts
  closing_thought: z.string().optional(),
  image_analysis_summary: z.string().optional(),
});

/**
 * ESQUEMA MAESTRO: PodcastCreationSchema
 * El contrato definitivo que orquesta los 5 flujos de NicePod V2.5.
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
  discovery_context: DiscoveryContextSchema.optional().nullable(),

  // --- SEMILLAS DE CREACIÓN (Inputs de Usuario) ---
  solo_topic: safeInputString.optional(),
  solo_motivation: safeInputString.optional(),
  link_topicA: safeInputString.optional(),
  link_topicB: safeInputString.optional(),
  link_catalyst: safeInputString.optional(),
  legacy_lesson: safeInputString.optional(),
  question_to_answer: safeInputString.optional(),
  user_reaction: z.string().optional(), 
  quote_context: z.string().optional(),

  // --- ACTIVOS DE PRODUCCIÓN FINAL ---
  final_title: z.string().min(1, "El título es obligatorio.").max(180).optional(),
  final_script: z.string().max(50000).optional(),
  sources: z.array(SourceSchema).default([]),

  // --- CONFIGURACIÓN TÉCNICA ---
  duration: z.string().min(1, "Define la duración."),
  narrativeDepth: z.string().min(1, "Define la profundidad."),
  selectedTone: z.string().optional(),

  // --- PARÁMETROS ACÚSTICOS (Gemini TTS) ---
  voiceGender: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyle: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePace: z.string().default('Moderado'),
  speakingRate: z.number().default(1.0),
})
/**
 * REFINAMIENTO SOBERANO: Validaciones cruzadas de calidad.
 */
.superRefine((data, ctx) => {
  // 1. VALIDACIÓN DE SUSTANCIA COGNITIVA (Mínimo 10 palabras)
  // Trasladamos esta lógica del UI al Schema para una protección total.
  const contentToMeasure = data.solo_motivation || data.legacy_lesson || data.dna_interview || "";
  const words = contentToMeasure.trim().split(/\s+/).filter(w => w.length > 0);
  
  if (data.purpose !== 'pulse' && words.length > 0 && words.length < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Sustancia insuficiente: Se requieren al menos 10 palabras para iniciar la forja.',
      path: ['solo_motivation']
    });
  }

  // 2. VALIDACIÓN PULSE: Requiere fuentes del radar
  if (data.purpose === 'pulse' && data.pulse_source_ids.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona al menos una señal de valor en el Radar.',
      path: ['pulse_source_ids']
    });
  }

  // 3. VALIDACIÓN LOCAL SOUL: Requiere GPS Activo (RBAC: Admin Faculty)
  if (data.purpose === 'local_soul' && !data.location) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La sincronización GPS es obligatoria para este flujo.',
      path: ['location']
    });
  }
});

/**
 * TIPO DE DATOS INFERIDO
 */
export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución del Bug de Fuentes: Al expandir el Enum de orígenes en 'SourceSchema', 
 *    el formulario deja de filtrar silenciosamente las fuentes inyectadas por la 
 *    Edge Function, permitiendo que el Editor de Guiones las visualice.
 * 2. Centralización de Calidad: La regla de las 10 palabras en el 'superRefine' 
 *    asegura que Gemini reciba suficiente contexto para generar una síntesis digna.
 * 3. Sanitización Transparente: El transform 'sanitizeInput' garantiza que los 
 *    datos persistan limpios en PostgreSQL, reduciendo el riesgo de ataques XSS 
 *    en la vista del podcast.
 */