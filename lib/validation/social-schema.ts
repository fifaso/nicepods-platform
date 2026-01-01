import { z } from "zod";

// Validaciones para el Perfil
export const ProfileUpdateSchema = z.object({
  display_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50),
  bio: z.string().max(160, "Tu bio no puede exceder 160 caracteres.").optional(),
  website_url: z.string().url("Debe ser una URL válida (https://...)").optional().or(z.literal("")),
  avatar_url: z.string().optional(),
});

// Validaciones para Colecciones
export const CreateCollectionSchema = z.object({
  title: z.string().min(3, "El título es muy corto").max(60),
  description: z.string().max(300).optional(),
  is_public: z.boolean().default(true),
  cover_image_url: z.string().optional(),
});

// Validaciones para Curaduría (Agregar a Colección)
export const AddToCollectionSchema = z.object({
  collection_id: z.string().uuid(),
  pod_id: z.number(), // micro_pods.id es bigint/number
  note: z.string().max(140, "La nota es muy larga").optional(),
});

// Tipos inferidos para uso en componentes
export type ProfileUpdatePayload = z.infer<typeof ProfileUpdateSchema>;
export type CreateCollectionPayload = z.infer<typeof CreateCollectionSchema>;