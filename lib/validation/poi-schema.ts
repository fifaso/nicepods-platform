// lib/validation/poi-schema.ts
// VERSIÓN: 1.1 (NicePod V2.6 - Fixed Zod Effects Chain)

import { z } from 'zod';

const sanitizeGeoInput = (valor: string | undefined) => {
  if (!valor) return undefined;
  return valor
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

// [FIX TS2339]: Aplicamos el .min(5) antes de la mutación de estado (.transform)
const geoInputString = z.string()
  .max(10000, { message: "El contenido excede el límite de seguridad geoespacial." })
  .min(5, "Describe brevemente por qué este lugar merece ser un eco en el mapa.")
  .transform(sanitizeGeoInput);

export const POIIngestionSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().max(50, "Señal GPS débil."),
  heroImage: z.string().min(1, "Captura visual requerida."),
  ocrImage: z.string().optional(),
  categoryId: z.enum(['historia', 'arte', 'naturaleza', 'secreto', 'cultural', 'arquitectura', 'anecdota'], { required_error: "Clasificación requerida." }),
  resonanceRadius: z.number().min(10).max(200).default(35),
  adminIntent: geoInputString,
});

export const POINarrativeSchema = z.object({
  name: z.string().min(3).max(100),
  historical_fact: z.string().min(10).max(85),
  rich_description: z.string().min(100).max(3000),
  status: z.enum(['narrated', 'published', 'archived']),
  reference_podcast_id: z.number().nullable().optional(),
  importance_score: z.number().min(1).max(10).default(1),
}).superRefine((data, ctx) => {
  if (data.status === 'published' && data.rich_description.includes("Descifrando la memoria")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'No puedes publicar un nodo con una descripción genérica.',
      path: ['rich_description']
    });
  }
});

export type POIIngestionData = z.infer<typeof POIIngestionSchema>;
export type POINarrativeData = z.infer<typeof POINarrativeSchema>;