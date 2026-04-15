/**
 * ARCHIVO: lib/validation/social-schema.ts
 * VERSIÓN: 4.0 (NicePod Social Validation - Madrid Resonance Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 *
 * Misión: Gobernar la integridad de las interacciones sociales y perfiles con paridad nominal.
 * [REFORMA V4.0]: Sincronización total con descriptores ZAP (biographyTextContent, biographyShortSummary, etc.).
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

import { z } from "zod";

/**
 * ESQUEMA: ProfileUpdateSchema
 * Misión: Validar la actualización de la identidad soberana del curador.
 */
export const ProfileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres." })
    .max(30, { message: "El nombre de usuario no puede exceder los 30 caracteres." })
    .regex(/^[a-zA-Z0-9_.]+$/, {
      message: "El nombre de usuario solo puede contener letras, números, puntos y guiones bajos.",
    })
    .trim()
    .toLowerCase(),

  fullName: z
    .string()
    .min(2, { message: "El nombre completo debe tener al menos 2 caracteres." })
    .max(60, { message: "El nombre completo no puede exceder los 60 caracteres." })
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  biographyTextContent: z
    .string()
    .max(160, { message: "La biografía no puede exceder los 160 caracteres." })
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  avatarUniformResourceLocator: z
    .string()
    .url({ message: "La URL del avatar debe ser una dirección válida." })
    .nullable()
    .optional(),

  websiteUniformResourceLocator: z
    .string()
    .url({ message: "La URL del sitio web debe ser una dirección válida." })
    .or(z.literal(""))
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),

  biographyShortSummary: z
    .string()
    .max(60, { message: "La biografía corta no puede exceder los 60 caracteres." })
    .nullable()
    .optional(),
});

/**
 * ESQUEMA: TestimonialSchema
 */
export const TestimonialSchema = z.object({
  profileUserIdentification: z.string().uuid({ message: "Identificación de perfil inválido." }),
  commentTextContent: z
    .string()
    .min(10, { message: "El testimonio debe tener al menos 10 caracteres." })
    .max(500, { message: "El testimonio no puede exceder los 500 caracteres." })
    .trim(),
});

/**
 * ESQUEMA: CollectionSchema
 */
export const CollectionSchema = z.object({
  title: z
    .string()
    .min(3, { message: "El título de la colección debe tener al menos 3 caracteres." })
    .max(50, { message: "El título no puede exceder los 50 caracteres." })
    .trim(),

  descriptionTextContent: z
    .string()
    .max(200, { message: "La descripción no puede exceder los 200 caracteres." })
    .trim()
    .nullable()
    .optional(),

  isPublicSovereignty: z.boolean().default(true),

  coverImageUniformResourceLocator: z
    .string()
    .url({ message: "La URL de la carátula debe ser una dirección válida." })
    .nullable()
    .optional(),
});

/**
 * EXPORTACIÓN DE TIPOS INFERIDOS
 */
export type ProfileUpdatePayload = z.infer<typeof ProfileUpdateSchema>;
export type TestimonialPayload = z.infer<typeof TestimonialSchema>;
export type CollectionPayload = z.infer<typeof CollectionSchema>;
