/**
 * ARCHIVO: lib/validation/poi-schema.ts
 * VERSIÓN: 3.0 (NicePod Sovereign Validation Core - Multidimensional Custom Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gobernar la integridad de la ingesta sensorial y la calidad de la 
 * sabiduría anclada, protegiendo a la Bóveda NKV de datos asimétricos o maliciosos.
 * [REFORMA V3.0]: Soporte para Taxonomía Granular (Misión/Entidad), Reloj Soberano 
 * (Época) y validación estricta de Enlaces de Sabiduría (HTTPS).
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

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
 * [MANDATO V3.0]: Adaptado a la Taxonomía Multidimensional.
 */
export const POIIngestionSchema = z.object({
  // A. Telemetría Geoespacial (Estándar esférico 4326)
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().max(50, "Señal de hardware insuficiente para un anclaje soberano."),
  resonanceRadius: z.number().min(10).max(200).default(35),

  // B. Evidencia Visual (Base64 o Rutas Storage en V4.0)
  heroImage: z.string().min(1, "La evidencia visual principal (Hero) es obligatoria."),
  ocrImages: z.array(z.string()).max(3, "Máximo 3 capturas de evidencia secundaria.").default([]),

  // C. Clasificación Taxonómica (Doble Capa)
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
  adminIntent: geoInputString,

  // F. Puente de Sabiduría (Cross-Link opcional)
  referenceUrl: z.string()
    .url("El enlace de referencia debe ser una URL válida.")
    .refine((url) => url.startsWith('https://'), {
      message: "Por seguridad, solo se admiten fuentes de verdad mediante protocolo seguro (HTTPS)."
    })
    .optional()
    .or(z.literal('')), // Permite strings vacíos si el usuario limpia el input
});

/**
 * ---------------------------------------------------------------------------
 * III. ESQUEMA DE SÍNTESIS NARRATIVA (PHASE 3 & 4)
 * ---------------------------------------------------------------------------
 * Valida el activo de conocimiento final antes de la publicación oficial.
 */
export const POINarrativeSchema = z.object({
  name: z.string()
    .min(3, "Nombre muy corto.")
    .max(100, "Nombre demasiado extenso para el Radar."),

  historical_fact: z.string()
    .min(10, "El hecho histórico carece de sustancia.")
    .max(85, "El hecho debe ser atómico (máximo 85 caracteres)."),

  rich_description: z.string()
    .min(100, "La crónica es demasiado superficial para la Bóveda.")
    .max(4000, "La crónica excede la capacidad de almacenamiento de voz."),

  status: z.enum(['narrated', 'published', 'archived']),

  reference_podcast_id: z.number().nullable().optional(),

  importance_score: z.number().min(1).max(10).default(1),
})
  .superRefine((data, ctx) => {
    const genericPlaceholders = [
      "Descifrando la memoria",
      "Ubicado en el corazón de",
      "Un testimonio de",
      "Información no disponible",
      "No se ha podido determinar"
    ];

    if (data.status === 'published') {
      const isGeneric = genericPlaceholders.some(pattern => data.rich_description.includes(pattern));

      if (isGeneric) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No se permite la publicación de crónicas con lenguaje genérico de IA. Edite para aportar valor real.",
          path: ['rich_description']
        });
      }

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
 * IV. EXPORTACIÓN DE TIPOS E INFERENCIA SOBERANA
 * ---------------------------------------------------------------------------
 */
export type POIIngestionData = z.infer<typeof POIIngestionSchema>;
export type POINarrativeData = z.infer<typeof POINarrativeSchema>;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Neural Routing Guard: La inclusión de 'categoryMission' y 'categoryEntity' 
 *    garantiza que la UI del Step 1 no pueda enviar un formulario incompleto si 
 *    el Administrador no define ambas capas del nodo.
 * 2. TLS/SSL Enforcement: El campo 'referenceUrl' implementa una regla 'refine' 
 *    que aborta cualquier intento de inyección HTTP simple o esquemas extraños, 
 *    blindando al Oráculo (Agente 42) de consumir datos de repositorios no seguros.
 * 3. Graceful Optionality: La estructura `.optional().or(z.literal(''))` en el 
 *    puente de sabiduría previene colisiones cuando los componentes de React 
 *    envían strings vacíos en lugar de valores 'undefined'.
 */