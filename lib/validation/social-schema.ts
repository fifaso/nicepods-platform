//lib/validation/social-schema.ts
//version: 2.5
import { z } from "zod";

/**
 * ESQUEMA: ProfileUpdateSchema
 * Misión: Validar la actualización de la identidad soberana del curador.
 * 
 * [ESTABILIZACIÓN]: 
 * - Se elimina 'handle' y se sustituye por 'username' (Paridad con DB).
 * - Se elimina 'display_name' y se sustituye por 'full_name' (Paridad con DB).
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

  full_name: z
    .string()
    .min(2, { message: "El nombre completo debe tener al menos 2 caracteres." })
    .max(60, { message: "El nombre completo no puede exceder los 60 caracteres." })
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  bio: z
    .string()
    .max(160, { message: "La biografía no puede exceder los 160 caracteres." })
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  avatar_url: z
    .string()
    .url({ message: "La URL del avatar debe ser una dirección válida." })
    .nullable()
    .optional(),

  website_url: z
    .string()
    .url({ message: "La URL del sitio web debe ser una dirección válida." })
    .or(z.literal(""))
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),

  bio_short: z
    .string()
    .max(60, { message: "La biografía corta no puede exceder los 60 caracteres." })
    .nullable()
    .optional(),
});

/**
 * ESQUEMA: TestimonialSchema
 * Misión: Validar la integridad de las reseñas sociales (Testimonios) entre curadores.
 */
export const TestimonialSchema = z.object({
  profile_user_id: z.string().uuid({ message: "ID de perfil inválido." }),
  comment_text: z
    .string()
    .min(10, { message: "El testimonio debe tener al menos 10 caracteres." })
    .max(500, { message: "El testimonio no puede exceder los 500 caracteres." })
    .trim(),
});

/**
 * ESQUEMA: CollectionSchema
 * Misión: Validar la creación y edición de hilos de sabiduría (Colecciones).
 */
export const CollectionSchema = z.object({
  title: z
    .string()
    .min(3, { message: "El título de la colección debe tener al menos 3 caracteres." })
    .max(50, { message: "El título no puede exceder los 50 caracteres." })
    .trim(),

  description: z
    .string()
    .max(200, { message: "La descripción no puede exceder los 200 caracteres." })
    .trim()
    .nullable()
    .optional(),

  is_public: z.boolean().default(true),

  cover_image_url: z
    .string()
    .url({ message: "La URL de la carátula debe ser una dirección válida." })
    .nullable()
    .optional(),
});

/**
 * EXPORTACIÓN DE TIPOS INFERIDOS
 * Garantizamos que el compilador de TypeScript utilice estos contratos en las Server Actions.
 */
export type ProfileUpdatePayload = z.infer<typeof ProfileUpdateSchema>;
export type TestimonialPayload = z.infer<typeof TestimonialSchema>;
export type CollectionPayload = z.infer<typeof CollectionSchema>;

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este archivo establece la frontera de seguridad de NicePod V2.5. 
 * Cualquier intento de inyectar columnas obsoletas (como 'handle' o 'display_name')
 * será interceptado aquí antes de llegar a la capa de persistencia (PostgreSQL).
 */