//actions/social-actions.ts
//VERSIÓN: 2.0 (NicePod Social Engine - Resonance & Reputation Standard)
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./profile-actions";

/**
 * FUNCIÓN: toggleFollowUser
 * Misión: Establecer o disolver un vínculo de seguimiento entre dos curadores.
 * 
 * [PROTOCOLO DE INTEGRIDAD]:
 * 1. Validación de Autenticidad: Verifica que el actor tenga una sesión nominal.
 * 2. Bloqueo de Auto-Resonancia: Impide que un curador se siga a sí mismo.
 * 3. Sincronía de Identidad: Recupera los 'usernames' para una revalidación de ruta precisa.
 */
export async function toggleFollowUser(
  targetUserId: string
): Promise<ActionResponse<{ isFollowing: boolean }>> {
  const supabase = createClient();

  // 1. HANDSHAKE DE IDENTIDAD
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "AUTENTICACIÓN_REQUERIDA: Inicie sesión para interactuar." };
  }

  if (user.id === targetUserId) {
    return { success: false, message: "ERROR_SOBERANÍA: No es posible establecer un vínculo consigo mismo." };
  }

  try {
    // 2. RECUPERACIÓN DE METADATOS PARA REVALIDACIÓN
    // Necesitamos los handles para limpiar la caché de las rutas públicas.
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", [user.id, targetUserId]);

    if (profileError || !profiles || profiles.length < 2) {
      // Nota: Si el perfil objetivo no existe, el sistema de integridad falla.
      throw new Error("PERFIL_OBJETIVO_NO_LOCALIZADO");
    }

    const actorProfile = profiles.find(p => p.id === user.id);
    const targetProfile = profiles.find(p => p.id === targetUserId);

    // 3. VERIFICACIÓN DE VÍNCULO EXISTENTE
    const { data: existingFollow } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .single();

    if (existingFollow) {
      // --- OPERACIÓN: DESVINCULAR (UNFOLLOW) ---
      const { error: deleteError } = await supabase
        .from("followers")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);

      if (deleteError) throw deleteError;

      // REVALIDACIÓN QUIRÚRGICA: Actualizamos los contadores en ambas vistas.
      revalidatePath(`/u/${targetProfile?.username}`); // Vista pública del objetivo
      revalidatePath(`/profile`); // Dashboard privado del actor

      return {
        success: true,
        message: `Has dejado de seguir a @${targetProfile?.username}.`,
        data: { isFollowing: false }
      };
    } else {
      // --- OPERACIÓN: VINCULAR (FOLLOW) ---
      const { error: insertError } = await supabase
        .from("followers")
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        });

      if (insertError) throw insertError;

      revalidatePath(`/u/${targetProfile?.username}`);
      revalidatePath(`/profile`);

      return {
        success: true,
        message: `Ahora sigues a @${targetProfile?.username}.`,
        data: { isFollowing: true }
      };
    }
  } catch (error: any) {
    console.error("🔥 [Social-Action-Fatal][Follow]:", error.message);
    return {
      success: false,
      message: "El sistema de resonancia social no pudo procesar la solicitud."
    };
  }
}

/**
 * FUNCIÓN: toggleLikePodcast
 * Misión: Gestionar la resonancia (Like) de una crónica de voz.
 * 
 * [IMPACTO]: Esta acción dispara el Trigger SQL 'update_like_count' que 
 * incrementa el 'reputation_score' del autor original.
 */
export async function toggleLikePodcast(
  podcastId: number
): Promise<ActionResponse<{ isLiked: boolean }>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "AUTENTICACIÓN_REQUERIDA." };

  try {
    // 1. VERIFICACIÓN DE RESONANCIA PREVIA
    const { data: existingLike } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("podcast_id", podcastId)
      .single();

    if (existingLike) {
      // --- OPERACIÓN: RETIRAR RESONANCIA ---
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("podcast_id", podcastId);

      if (deleteError) throw deleteError;

      revalidatePath(`/podcast/${podcastId}`);
      return { success: true, message: "Resonancia retirada.", data: { isLiked: false } };
    } else {
      // --- OPERACIÓN: INYECTAR RESONANCIA ---
      const { error: insertError } = await supabase
        .from("likes")
        .insert({
          user_id: user.id,
          podcast_id: podcastId
        });

      if (insertError) throw insertError;

      revalidatePath(`/podcast/${podcastId}`);
      return { success: true, message: "Resonancia inyectada con éxito.", data: { isLiked: true } };
    }
  } catch (error: any) {
    console.error("🔥 [Social-Action-Fatal][Like]:", error.message);
    return { success: false, message: "Error en el protocolo de resonancia." };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Sincronía de Red: El uso de 'revalidatePath' con el 'username' dinámico 
 *    garantiza que los contadores de seguidores en el Hero Section del perfil 
 *    sean precisos tras cada interacción.
 * 2. Integridad Atómica: Las operaciones se basan en identificadores de sistema (UUID/BigInt), 
 *    asegurando que el vínculo persista incluso si el curador cambia su 'full_name'.
 * 3. Feedback Industrial: Las respuestas incluyen un objeto 'data' con el estado 
 *    booleano resultante, permitiendo que la UI (botones de Follow/Like) 
 *    cambie instantáneamente sin esperar a un refresco total.
 */