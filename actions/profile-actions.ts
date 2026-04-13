//actions/profile-actions.ts
//version:3.0
"use server";

import { createClient } from "@/lib/supabase/server";
import {
  ProfileUpdatePayload,
  ProfileUpdateSchema
} from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";

/**
 * TIPO: ActionResponse
 * Define la estructura de respuesta unificada para todas las operaciones de perfil.
 */
export type ActionResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * FUNCIÓN: updateProfile
 * Misión: Actualizar los metadatos del curador en la Bóveda de NicePod.
 * 
 * [ESTABILIZACIÓN]: 
 * - Uso estricto de 'username' y 'full_name' para paridad con DB.
 * - Sincronía de caché mediante revalidatePath.
 */
export async function updateProfile(
  payload: ProfileUpdatePayload
): Promise<ActionResponse> {
  const supabase = createClient();

  // 1. PROTOCOLO DE AUTORIDAD
  // Validamos la sesión física del usuario antes de cualquier mutación.
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Sesión expirada o no autorizada. Por favor, re-inicie sesión."
    };
  }

  // 2. VALIDACIÓN DE INTEGRIDAD SEMÁNTICA (Zod)
  // El esquema V2.0 garantiza que los datos vienen limpios y alineados con el Metal.
  const validationResult = ProfileUpdateSchema.safeParse(payload);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Los datos proporcionados no cumplen con el estándar de integridad.",
      errors: validationResult.error.flatten().fieldErrors
    };
  }

  const validatedData = validationResult.data;

  try {
    // 3. EJECUCIÓN DE PERSISTENCIA ATÓMICA
    // Realizamos el UPDATE utilizando los nombres de columna reales de PostgreSQL.
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: validatedData.username,
        full_name: validatedData.fullName,
        bio: validatedData.bio,
        bio_short: validatedData.bioShort,
        website_url: validatedData.websiteUniformResourceLocator,
        avatar_url: validatedData.avatarUniformResourceLocator,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      // Manejo específico de colisión de 'username' (Unique Constraint)
      if (updateError.code === '23505') {
        return {
          success: false,
          message: "El nombre de usuario ya está reservado por otro curador."
        };
      }
      throw updateError;
    }

    // 4. PROTOCOLO DE REVALIDACIÓN DE CACHÉ (Next.js 14)
    // Purgamos la memoria de las rutas afectadas para forzar la actualización visual.
    revalidatePath("/profile"); // Perfil privado/ajustes
    revalidatePath(`/u/${validatedData.username}`); // Perfil público
    revalidatePath("/dashboard"); // Sidebar y componentes globales

    return {
      success: true,
      message: "Identidad sincronizada correctamente en la Bóveda."
    };

  } catch (error: any) {
    console.error("🔥 [NicePod-Profile-Action-Fatal]:", error.message);
    return {
      success: false,
      message: "Fallo crítico en la comunicación con la base de datos."
    };
  }
}

/**
 * FUNCIÓN: getProfileByUsername
 * Misión: Recuperar la ficha técnica pública de un curador basada en su handle.
 */
export async function getProfileByUsername(username: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, 
      username, 
      full_name, 
      bio, 
      bio_short,
      avatar_url, 
      reputation_score, 
      is_verified, 
      website_url,
      followers_count, 
      following_count,
      created_at
    `)
    .eq("username", username)
    .single();

  if (error) {
    console.warn(`⚠️ [NicePod-Vault] Perfil no localizado: @${username}`);
    return null;
  }

  return data;
}

/**
 * FUNCIÓN: getProfileById
 * Misión: Recuperación directa por ID de sistema. Útil para la orquestación interna.
 */
export async function getProfileById(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Se ha erradicado el uso de 'handle' y 'display_name'. 
 * Las acciones ahora operan bajo el estándar industrial de NicePod V2.5.
 * La revalidación de rutas garantiza que el 'Handshake SSR' siempre entregue 
 * la versión más reciente del perfil sin necesidad de refrescos manuales.
 */