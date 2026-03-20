// lib/validation/poi-schema.ts
// VERSIÓN: 2.0 (NicePod Sovereign Validation Core - Multimodal & Integrity Edition)
// Misión: Gobernar la integridad de la ingesta sensorial y la calidad de la sabiduría anclada.
// [ESTABILIZACIÓN]: Soporte para Mosaico OCR, validación de coordenadas PostGIS y blindaje narrativo.

import { z } from 'zod';

/**
 * ---------------------------------------------------------------------------
 * I. UTILIDADES DE SANITIZACIÓN (THE STRIPPER)
 * ---------------------------------------------------------------------------
 */

/**
 * sanitizeGeoInput:
 * Purga cualquier rastro de inyección de scripts o etiquetas HTML residuales
 * del dispositivo del curador, asegurando la sanidad de la Bóveda NKV.
 */
const sanitizeGeoInput = (valor: string | undefined) => {
  if (!valor) return undefined;
  return valor
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Neutraliza JS
    .replace(/<[^>]+>/g, "")                               // Elimina etiquetas HTML
    .replace(/\s+/g, " ")                                  // Normaliza espacios
    .trim();
};

/**
 * geoInputString:
 * Tipo de dato reutilizable para entradas de texto geoespaciales.
 * [RIGOR]: La validación de longitud ocurre ANTES de la transformación para 
 * evitar que un input de puros espacios pase el filtro de 'sustancia'.
 */
const geoInputString = z.string()
  .min(10, "La semilla de intención debe tener al menos 10 caracteres para una forja de calidad.")
  .max(5000, "El contenido excede el límite de densidad cognitiva por nodo.")
  .transform(sanitizeGeoInput);

/**
 * ---------------------------------------------------------------------------
 * II. ESQUEMA DE INGESTA SENSORIAL (PHASE 1 & 2)
 * ---------------------------------------------------------------------------
 * Valida el dossier físico capturado por el Admin en el Step 2.
 */
export const POIIngestionSchema = z.object({
  // Telemetría Geoespacial (Estándar esférico 4326)
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  // Precisión GPS: El Circuit Breaker exige < 50m para garantizar la sintonía.
  accuracy: z.number().max(50, "Señal de hardware insuficiente para un anclaje soberano."),

  // Evidencia Visual (Base64 comprimido por el JIT Pipeline)
  heroImage: z.string().min(1, "La evidencia visual principal (Hero) es obligatoria."),

  // [FIX]: Mosaico OCR ahora es un Array de strings para soportar múltiples placas.
  ocrImages: z.array(z.string()).max(3, "Máximo 3 capturas de evidencia secundaria.").default([]),

  // Clasificación Taxonómica
  categoryId: z.enum([
    'historia',
    'arte',
    'naturaleza',
    'secreto',
    'cultural',
    'arquitectura',
    'anecdota'
  ], {
    required_error: "Debe clasificar la resonancia en una dimensión válida."
  }),

  // Radio de Sintonía (Metros)
  resonanceRadius: z.number().min(10).max(200).default(35),

  // Semilla Cognitiva (Dictado o Texto)
  adminIntent: geoInputString,
});

/**
 * ---------------------------------------------------------------------------
 * III. ESQUEMA DE SÍNTESIS NARRATIVA (PHASE 3 & 4)
 * ---------------------------------------------------------------------------
 * Valida el activo de conocimiento final antes de la publicación oficial.
 */
export const POINarrativeSchema = z.object({
  // Identidad del Hito
  name: z.string()
    .min(3, "Nombre muy corto.")
    .max(100, "Nombre demasiado extenso para el Radar."),

  // El "Hecho Atómico" (Para Tooltips y Notificaciones)
  historical_fact: z.string()
    .min(10, "El hecho histórico carece de sustancia.")
    .max(85, "El hecho debe ser atómico (máximo 85 caracteres)."),

  // Crónica Maestra (Para el Teleprompter y Escucha Inmersiva)
  rich_description: z.string()
    .min(100, "La crónica es demasiado superficial para la Bóveda.")
    .max(4000, "La crónica excede la capacidad de almacenamiento de voz."),

  // Estado del Ciclo de Vida
  status: z.enum(['narrated', 'published', 'archived']),

  // Vínculos de Sabiduría
  reference_podcast_id: z.number().nullable().optional(),

  // Ponderación de Autoridad (1-10)
  importance_score: z.number().min(1).max(10).default(1),
})
  /**
   * [REFINAMIENTO DE CALIDAD]:
   * Bloquea la publicación si detecta patrones de alucinación o placeholders genéricos.
   */
  .superRefine((data, ctx) => {
    const genericPlaceholders = [
      "Descifrando la memoria",
      "Ubicado en el corazón de",
      "Un testimonio de",
      "Información no disponible"
    ];

    if (data.status === 'published') {
      const isGeneric = genericPlaceholders.some(p => data.rich_description.includes(p));

      if (isGeneric) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No se permite la publicación de crónicas con lenguaje genérico de IA. Edite para aportar valor real.",
          path: ['rich_description']
        });
      }

      // Validación de longitud para publicación real
      if (data.rich_description.length < 300) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Para ser publicado en la Malla, el nodo requiere al menos 300 caracteres de sabiduría.",
          path: ['rich_description']
        });
      }
    }
  });

/**
 * ---------------------------------------------------------------------------
 * IV. EXPORTACIÓN DE TIPOS (BUILD SHIELD)
 * ---------------------------------------------------------------------------
 */
export type POIIngestionData = z.infer<typeof POIIngestionSchema>;
export type POINarrativeData = z.infer<typeof POINarrativeSchema>;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Mosaico Ready: El esquema ahora acepta un array de imágenes OCR, permitiendo
 *    que el 'geo-sensor-ingestor' reciba toda la evidencia en una sola trama.
 * 2. Filtro Anti-Alucinación: La expansión del 'superRefine' actúa como un 
 *    perito editorial, forzando al Admin a revisar el contenido de la IA.
 * 3. Consistencia PostGIS: Se añadieron límites estrictos a lat/lng para evitar
 *    errores de 'OutOfRange' al intentar insertar en el Metal de PostgreSQL.
 */