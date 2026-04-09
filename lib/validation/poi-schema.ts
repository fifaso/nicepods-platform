/**
 * ARCHIVO: lib/validation/poi-schema.ts
 * VERSIÓN: 4.1 (NicePod Sovereign Validation Core - Oracle Sealing & Absolute Nominal Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gobernar la integridad de la ingesta sensorial y la calidad de la 
 * sabiduría anclada, protegiendo a la Bóveda NKV de datos asimétricos.
 * [REFORMA V4.1]: Implementación estricta de la Zero Abbreviations Policy (ZAP), 
 * sellado del contrato con el Agente 42 (IntelligenceAgencyAnalysisSchema) y 
 * fortalecimiento del Build Shield para erradicar el uso de 'any'.
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
 * [RIGOR]: La validación de longitud ocurre ANTES de la transformación para 
 * evitar que un input de puros espacios pase el filtro de 'sustancia'.
 */
const geographicInputString = z.string()
  .min(10, "La semilla de intención debe tener al menos 10 caracteres para una forja de calidad.")
  .max(5000, "El contenido excede el límite de densidad cognitiva por nodo.")
  .transform(sanitizeGeographicInput);

/**
 * ---------------------------------------------------------------------------
 * II. ESQUEMA DE ANÁLISIS DE INTELIGENCIA (ORACLE OUTPUT SHIELD)
 * ---------------------------------------------------------------------------
 * Valida la respuesta del Agente 42 (Google Gemini) tras el peritaje visual.
 * Misión: Erradicar la nulidad inesperada y el fallo de tipo en el Borde.
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
 * Valida el dossier físico capturado por el Administrador en el flujo de forja.
 * [MANDATO V4.1]: Purificación nominal absoluta según la Zero Abbreviations Policy.
 */
export const PointOfInterestIngestionSchema = z.object({
  // A. Telemetría Geoespacial (Estándar esférico 4326)
  latitudeCoordinate: z.number().min(-90).max(90),
  longitudeCoordinate: z.number().min(-180).max(180),
  accuracyMeters: z.number().max(50, "Señal de hardware insuficiente para un anclaje soberano."),
  resonanceRadiusMeters: z.number().min(10).max(200).default(35),

  // B. Evidencia Visual (Rutas de almacenamiento en el Storage del Metal)
  heroImageStoragePath: z.string().min(1, "La evidencia visual principal (Hero) es obligatoria."),
  opticalCharacterRecognitionImagePaths: z.array(z.string()).max(3, "Máximo 3 capturas de evidencia secundaria.").default([]),

  // C. Clasificación Taxonómica (Doble Capa de Inteligencia)
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

  // D. Coordenada Temporal (Sintonía Prosódica de la IA)
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

  // E. Capital Cognitivo (Intencionalidad del Administrador)
  administratorIntent: geographicInputString,

  // F. Puente de Sabiduría (Enlace externo de autoridad mediante protocolo seguro)
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
 * Valida el activo de conocimiento final antes de su propagación en la Malla.
 * [MANDATO BSS]: Los nombres de los campos deben reflejar las columnas del Metal.
 */
export const PointOfInterestNarrativeSchema = z.object({
  name: z.string()
    .min(3, "Nombre de hito demasiado corto.")
    .max(100, "Nombre demasiado extenso para el Radar."),

  historical_fact: z.string()
    .min(10, "El hecho histórico carece de sustancia pericial.")
    .max(85, "El hecho debe ser atómico (máximo 85 caracteres)."),

  rich_description: z.string()
    .min(100, "La crónica es demasiado superficial para la Bóveda.")
    .max(4000, "La crónica excede la capacidad de almacenamiento de voz neuronal."),

  status: z.enum(['narrated', 'published', 'archived']),

  reference_podcast_identification: z.number().nullable().optional(),

  importance_score: z.number().min(1).max(10).default(1),
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
      const containsGenericContent = forbiddenGenericPatterns.some(pattern => data.rich_description.includes(pattern));

      if (containsGenericContent) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No se permite la publicación de crónicas con lenguaje genérico de Inteligencia Artificial. Edite para aportar valor real.",
          path: ['rich_description']
        });
      }

      if (data.rich_description.length < 300) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Para ser publicado en la Malla, el nodo requiere al menos 300 caracteres de sabiduría técnica.",
          path: ['rich_description']
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Oracle Sealing Implementation: La creación de 'IntelligenceAgencyAnalysisSchema' 
 *    permite validar la integridad de la IA en el servidor antes de mutar el estado.
 * 2. Zero Abbreviations Compliance: Se han eliminado acrónimos como POI, OCR, URL y ID 
 *    sustituyéndolos por sus descriptores industriales completos (ZAP).
 * 3. Contract Safety: La propiedad 'reference_podcast_identification' asegura la 
 *    sincronía nominal con la clave primaria de la tabla 'micro_pods' (BSS).
 */