/**
 * ARCHIVO: lib/validation/poi-schema.ts
 * VERSIÓN: 5.0 (NicePod Sovereign Validation Core - Madrid Resonance Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gobernar la integridad de la ingesta sensorial y la calidad de la 
 * sabiduría anclada, protegiendo a la Bóveda NKV de datos asimétricos.
 * [MANDATO]: Zero Abbreviations Policy (ZAP) y Nominal Mirroring (camelCase).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { z } from 'zod';

/**
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE SANITIZACIÓN (THE STRIPPER)
 * ---------------------------------------------------------------------------
 */

/**
 * sanitizeGeographicInput:
 * Purga cualquier rastro de inyección de scripts o etiquetas HTML residuales
 * del dispositivo del curador, asegurando la sanidad de la Bóveda NKV.
 */
const sanitizeGeographicInput = (valor: string | undefined) => {
  if (!valor) return undefined;
  return valor
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Neutraliza JavaScript
    .replace(/<[^>]+>/g, "")                               // Elimina etiquetas HTML
    .replace(/\s+/g, " ")                                  // Normaliza espacios en blanco
    .trim();
};

/**
 * geographicInputString:
 * Tipo de dato reutilizable para entradas de texto geoespaciales.
 */
const geographicInputString = z.string()
  .min(10, "La semilla de intención debe tener al menos 10 caracteres para una forja de calidad.")
  .max(5000, "El contenido excede el límite de densidad cognitiva por nodo.")
  .transform(sanitizeGeographicInput);

/**
 * ---------------------------------------------------------------------------
 * II. ESQUEMA DE ANÁLISIS DE INTELIGENCIA (ORACLE OUTPUT SHIELD)
 * ---------------------------------------------------------------------------
 */
export const IntelligenceAgencyAnalysisSchema = z.object({
  historicalDossier: z.string().min(20, "El peritaje histórico devuelto por la Inteligencia Artificial es insuficiente."),
  architectureStyle: z.string().optional(),
  atmosphere: z.string().optional(),
  detectedElements: z.array(z.string()).default([]),
  detectedOfficialName: z.string().optional(),
  groundingVerification: z.string().min(10, "La verificación de veracidad del hito es obligatoria."),
  authorityConfidenceScore: z.number().min(0).max(10).default(5)
});

/**
 * ---------------------------------------------------------------------------
 * III. ESQUEMA DE INGESTA SENSORIAL (PHASE 1 & 2)
 * ---------------------------------------------------------------------------
 * [MANDATO V5.0]: Purificación nominal absoluta según la Zero Abbreviations Policy.
 */
export const PointOfInterestIngestionSchema = z.object({
  // A. Telemetría Geoespacial (Estándar esférico 4326)
  latitudeCoordinate: z.number().min(-90).max(90),
  longitudeCoordinate: z.number().min(-180).max(180),
  accuracyMeters: z.number().max(50, "Señal de hardware insuficiente para un anclaje soberano."),
  resonanceRadiusMeters: z.number().min(10).max(200).default(35),

  // B. Evidencia Visual
  heroImageStoragePath: z.string().min(1, "La evidencia visual principal (Hero) es obligatoria."),
  opticalCharacterRecognitionImagePaths: z.array(z.string()).max(3, "Máximo 3 capturas de evidencia secundaria.").default([]),

  // C. Clasificación Taxonómica
  categoryMission: z.enum([
    'infraestructura_vital',
    'memoria_soberana',
    'capital_intelectual',
    'resonancia_sensorial'
  ], {
    required_error: "Debe clasificar el cuadrante funcional del hito."
  }),
  
  categoryEntity: z.enum([
    'aseo_premium', 'nodo_hidratacion', 'refugio_climatico', 'terminal_energia', 'zona_segura',
    'monumento_nacional', 'placa_sintonia', 'yacimiento_ruina', 'leyenda_urbana', 'arquitectura_epoca',
    'museo_sabiduria', 'atelier_galeria', 'libreria_autor', 'centro_innovacion', 'intervencion_plastica',
    'mirador_estrategico', 'paisaje_sonoro', 'pasaje_secreto', 'mercado_origen', 'obrador_tradicion'
  ], {
    required_error: "Debe definir la entidad física específica del hito."
  }),

  // D. Coordenada Temporal
  historicalEpoch: z.enum([
    'origen_geologico',
    'pre_industrial',
    'siglo_de_oro',
    'ilustracion_borbonica',
    'modernismo_expansion',
    'contemporaneo',
    'futuro_especulativo',
    'atemporal'
  ], {
    required_error: "La temporalidad es obligatoria para sintonizar el lenguaje del Oráculo."
  }),

  // E. Capital Cognitivo
  administratorIntent: geographicInputString,

  // F. Puente de Sabiduría
  referenceUniformResourceLocator: z.string()
    .url("El enlace de referencia debe ser una dirección URL válida.")
    .refine((url) => url.startsWith('https://'), {
      message: "Por seguridad, solo se admiten fuentes de verdad mediante protocolo seguro (HTTPS)."
    })
    .optional()
    .or(z.literal('')), 
});

/**
 * ---------------------------------------------------------------------------
 * IV. ESQUEMA DE SÍNTESIS NARRATIVA (PHASE 3 & 4)
 * ---------------------------------------------------------------------------
 */
export const PointOfInterestNarrativeSchema = z.object({
  name: z.string()
    .min(3, "Nombre de hito demasiado corto.")
    .max(100, "Nombre demasiado extenso para el Radar."),

  historicalFact: z.string()
    .min(10, "El hecho histórico carece de sustancia pericial.")
    .max(85, "El hecho debe ser atómico (máximo 85 caracteres)."),

  richDescription: z.string()
    .min(100, "La crónica es demasiado superficial para la Bóveda.")
    .max(4000, "La crónica excede la capacidad de almacenamiento de voz neuronal."),

  status: z.enum(['narrated', 'published', 'archived']),

  referencePodcastIdentification: z.number().nullable().optional(),

  importanceScore: z.number().min(1).max(10).default(1),
})
  .superRefine((data, ctx) => {
    const forbiddenGenericPatterns = [
      "Descifrando la memoria",
      "Ubicado en el corazón de",
      "Un testimonio de",
      "Información no disponible",
      "No se ha podido determinar"
    ];

    if (data.status === 'published') {
      const containsGenericContent = forbiddenGenericPatterns.some(pattern => data.richDescription.includes(pattern));

      if (containsGenericContent) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No se permite la publicación de crónicas con lenguaje genérico de Inteligencia Artificial. Edite para aportar valor real.",
          path: ['richDescription']
        });
      }

      if (data.richDescription.length < 300) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Para ser publicado en la Malla, el nodo requiere al menos 300 caracteres de sabiduría técnica.",
          path: ['richDescription']
        });
      }
    }
  });

/**
 * ---------------------------------------------------------------------------
 * V. EXPORTACIÓN DE TIPOS E INFERENCIA SOBERANA (BUILD SHIELD)
 * ---------------------------------------------------------------------------
 */
export type IntelligenceAgencyAnalysisData = z.infer<typeof IntelligenceAgencyAnalysisSchema>;
export type PointOfInterestIngestionData = z.infer<typeof PointOfInterestIngestionSchema>;
export type PointOfInterestNarrativeData = z.infer<typeof PointOfInterestNarrativeSchema>;
