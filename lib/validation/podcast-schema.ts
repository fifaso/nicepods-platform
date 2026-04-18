/**
 * ARCHIVO: lib/validation/podcast-schema.ts
 * VERSIÓN: 12.0 (NicePod Schema Master - Structural Integrity & ZAP Edition)
 * PROTOCOLO: MADRID RESONANCE V8.0
 *
 * Misión: Gobernar la integridad de datos, sanitizar la entrada del Voyager y 
 * blindar el contrato de orígenes para la forja de capital intelectual.
 * [REFORMA V12.0]: Aplicación absoluta de la Zero Abbreviations Policy (ZAP). 
 * Sincronización nominal con 'CreationMetadataPayload' V12.0. 
 * Resolución de TS2345 mediante el sellado de valores por defecto en 'SourceSchema'.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { z } from 'zod';

/**
 * CAPA DE SEGURIDAD: sanitizeUserApplicationInput
 * Misión: Purgar etiquetas maliciosas y normalizar el texto para el procesamiento de IA.
 */
const sanitizeUserApplicationInput = (inputValue: string | undefined) => {
  if (!inputValue) return undefined;
  return inputValue
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

/**
 * TIPO: safeSovereignInputString
 * Validador de cadenas con protección perimetral contra desbordamiento y ataques XSS.
 */
const safeSovereignInputString = z.string()
  .max(15000, { message: "El contenido excede el límite de seguridad (15,000 caracteres)." })
  .transform(sanitizeUserApplicationInput);

/**
 * ESQUEMA: SourceSchema
 * [RESOLUCIÓN TS2345]: 'relevance' posee un valor por defecto obligatorio para 
 * asegurar que el tipo inferido sea 'number' y no 'number | undefined'.
 */
const SourceSchema = z.object({
  title: z.string().min(1, "El título de la fuente es obligatorio."),
  uniformResourceLocator: z.string().url("Dirección web no detectada o inválida."),
  contentTextBody: z.string().optional(),
  snippetContentText: z.string().optional(),
  origin: z.enum(['vault', 'web', 'fresh_research', 'pulse_selection']).default('web'),
  relevance: z.number().default(1.0),
});

/**
 * ESQUEMA: LocalRecommendationSchema
 */
const LocalRecommendationSchema = z.object({
  name: z.string(),
  category: z.string(),
  descriptionTextContent: z.string(),
  hasSpecificPodcastAttached: z.boolean(),
  linkedPodcastIdentification: z.union([z.string(), z.number()]).optional(),
  actionUniformResourceLocator: z.string().url().optional(),
  distanceInMeters: z.number().optional()
});

/**
 * ESQUEMA: DiscoveryContextDossierSchema
 */
const DiscoveryContextDossierSchema = z.object({
  narrativeHookText: z.string(),
  recommendationsCollection: z.array(LocalRecommendationSchema),
  closingThoughtText: z.string(),
  detectedPointOfInterestName: z.string().optional(),
  imageAnalysisSummaryContent: z.string().optional()
});

/**
 * ESQUEMA: GeoLocationSchema
 */
const GeoLocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()])
});

/**
 * ESQUEMA: PodcastScriptDossierSchema
 */
const PodcastScriptDossierSchema = z.object({
  scriptBodyContent: z.string(),
  scriptPlainContent: z.string(),
  legacyText: z.string().optional()
});

/**
 * ESQUEMA MAESTRO: PodcastCreationSchema
 * Misión: El espejo contractual que rige la terminal de forja.
 */
export const PodcastCreationSchema = z.object({
  // --- I. IDENTIFICADORES Y GENEALOGÍA TÉCNICA ---
  draftIdentification: z.number().optional().nullable(),
  parentPodcastIdentification: z.number().optional().nullable(),
  rootPodcastIdentification: z.number().optional().nullable(),

  // --- II. IDENTIDAD DEL FLUJO Y MODO OPERATIVO ---
  purpose: z.enum(['learn', 'inspire', 'explore', 'reflect', 'answer', 'freestyle', 'local_soul', 'pulse']),
  creationMode: z.enum(['standard', 'remix', 'situational', 'pulse', 'geo_mode']).default('standard'),
  styleSelection: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa', 'remix', 'local_concierge', 'briefing']).optional(),

  // --- III. INTELIGENCIA, AGENTES Y SEGURIDAD ---
  agentName: z.string().min(1, "Selecciona un agente de inteligencia."),
  pulseSourceIdentificationsCollection: z.array(z.string()).default([]),
  deoxyribonucleicAcidInterviewContent: safeSovereignInputString.optional(),
  expertiseLevelMagnitude: z.number().min(1).max(10).default(5),
  isSovereignPublicStatus: z.boolean().default(false),

  // --- IV. CONTEXTO GEOESPACIAL (PROTOCOLO T0) ---
  location: z.object({
    latitudeCoordinate: z.number(),
    longitudeCoordinate: z.number(),
    placeNameReference: z.string().optional(),
    cityNameReference: z.string().optional()
  }).optional(),
  visualEnvironmentalImageContext: z.string().optional(),
  discoveryContextDossier: DiscoveryContextDossierSchema.optional().nullable(),

  // --- V. SEMILLAS DE CREACIÓN NARRATIVA ---
  soloTopicSelection: safeSovereignInputString.optional(),
  soloMotivationContentText: safeSovereignInputString.optional(),
  linkTopicPrimary: safeSovereignInputString.optional(),
  linkTopicSecondary: safeSovereignInputString.optional(),
  linkCatalystElement: safeSovereignInputString.optional(),
  linkSelectedNarrativeOption: z.object({ 
    title: z.string(), 
    thesis: z.string() 
  }).nullable().optional(),
  legacyLessonContentText: safeSovereignInputString.optional(),
  questionToAnswerText: safeSovereignInputString.optional(),
  userEmotionalReactionContent: z.string().optional(),
  narrativeQuoteContextReference: z.string().optional(),

  // --- VI. ACTIVOS DE PRODUCCIÓN Y SÍNTESIS FINAL ---
  finalTitle: z.string().optional(),
  finalScriptContent: z.string().optional(),
  sourcesCollection: z.array(SourceSchema).default([]),
  generateAudioDirectlyStatus: z.boolean().default(true),

  // --- VII. CONFIGURACIÓN TÉCNICA INDUSTRIAL ---
  durationSelection: z.enum([
    'Menos de 1 minuto',
    'Entre 2 y 3 minutos',
    'Hasta 5 minutos'
  ], {
    required_error: "La duración es un parámetro obligatorio para la forja."
  }),

  narrativeDepthLevel: z.enum([
    'Superficial',
    'Intermedia',
    'Profunda'
  ]),

  selectedToneIdentifier: z.string().optional(),

  // --- VIII. PARÁMETROS ACÚSTICOS (MOTOR NEURONAL GEMINI) ---
  voiceGenderSelection: z.enum(['Masculino', 'Femenino']).default('Masculino'),
  voiceStyleSelection: z.enum(['Calmado', 'Energético', 'Profesional', 'Inspirador']).default('Profesional'),
  voicePaceSelection: z.string().default('Moderado'),
  speakingRateMagnitude: z.number().default(1.0),
})
  .superRefine((data, context) => {
    /**
     * REGLA DE AUDITORÍA 1: SUSTANCIA INTELECTUAL MÍNIMA
     */
    const contentToMeasure = 
      data.soloMotivationContentText || 
      data.legacyLessonContentText || 
      data.deoxyribonucleicAcidInterviewContent || "";
      
    const wordsCollection = contentToMeasure.trim().split(/\s+/).filter(word => word.length > 0);

    if (data.purpose !== 'pulse' && wordsCollection.length > 0 && wordsCollection.length < 10) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sustancia insuficiente: Desarrolla tu idea con al menos 10 palabras para iniciar la forja.',
        path: ['soloMotivationContentText']
      });
    }

    /**
     * REGLA DE AUDITORÍA 2: VALIDACIÓN DE SEÑALES PULSE
     */
    if (data.purpose === 'pulse' && data.pulseSourceIdentificationsCollection.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona al menos una señal de valor en el Radar de Actualidad.',
        path: ['pulseSourceIdentificationsCollection']
      });
    }

    /**
     * REGLA DE AUDITORÍA 3: INTEGRIDAD GEODÉSICA SITUACIONAL
     */
    if (data.purpose === 'local_soul' && !data.location) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La triangulación GPS es obligatoria para establecer resonancia local.',
        path: ['location']
      });
    }
  });

/**
 * EXPORTACIÓN TÉCNICA: PodcastCreationData
 * Misión: Ingerir el tipo inferido para el Build Shield Sovereignty.
 */
export type PodcastCreationData = z.infer<typeof PodcastCreationSchema>;

/**
 * ESQUEMA: SovereignPodcastSchema
 * Misión: Validar la integridad de la entidad Podcast tras la transformación soberana.
 */
export const SovereignPodcastSchema = z.object({
  identification: z.number(),
  authorUserIdentification: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  audio_url: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  duration_seconds: z.number().nullable(),
  created_at: z.string(),
  status: z.string(),

  // CAMPOS ZAP (CRISTAL)
  artificialIntelligenceTagsCollection: z.array(z.string()).nullable(),
  geographicLocationPoint: GeoLocationSchema.nullable(),
  podcastScriptDossier: PodcastScriptDossierSchema.nullable(),

  // CAMPOS METAL (BACKWARD COMPATIBILITY)
  ai_tags: z.array(z.string()).nullable(),
  geo_location: z.any().nullable(),
  script_text: z.any().nullable(),
});
