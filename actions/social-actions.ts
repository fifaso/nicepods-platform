/**
 * ARCHIVO: actions/social-actions.ts
 * VERSIÓN: 3.0 (NicePod Social Interactions - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Gestionar el flujo de seguidores e interacciones entre curadores con integridad nominal.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProfileActionResponse } from "@/types/profile";

/**
 * followUserAction: Misión: Establecer o revocar un vínculo de seguimiento entre curadores.
 */
export async function followUserAction(
  targetUserIdentification: string
): Promise<ProfileActionResponse<{ isFollowingSovereignty: boolean }>> {
  const supabaseClient = createClient();

  // 1. HANDSHAKE DE SOBERANÍA
  const { data: { user: authenticatedUser }, error: authenticationExceptionInformation } = await supabaseClient.auth.getUser();
  if (authenticationExceptionInformation || !authenticatedUser) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "SESIÓN_REQUERIDA: Inicie sesión para seguir a otros curadores.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  if (authenticatedUser.id === targetUserIdentification) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "AUTOSEGUIMIENTO_PROHIBIDO: No puedes seguir tu propia identidad.",
      traceIdentification: "SELF_FOLLOW_FAIL"
    };
  }

  try {
    // 2. VERIFICACIÓN DE ESTADO ACTUAL
    const { data: followerDatabaseRecord } = await supabaseClient
      .from('followers')
      .select('*')
      .eq('follower_id', authenticatedUser.id)
      .eq('following_id', targetUserIdentification)
      .maybeSingle();

    if (followerDatabaseRecord) {
      // 3. ACCIÓN: DEJAR DE SEGUIR (Unfollow)
      const { error: deleteDatabaseExceptionInformation } = await supabaseClient
        .from('followers')
        .delete()
        .eq('follower_id', authenticatedUser.id)
        .eq('following_id', targetUserIdentification);

      if (deleteDatabaseExceptionInformation) throw deleteDatabaseExceptionInformation;

      revalidatePath(`/profile/${targetUserIdentification}`);
      return {
        isOperationSuccessful: true,
        responseStatusMessage: "Vínculo revocado con éxito.",
        payloadData: { isFollowingSovereignty: false },
        traceIdentification: "UNFOLLOW_SUCCESS"
      };
    } else {
      // 4. ACCIÓN: SEGUIR (Follow)
      const { error: insertDatabaseExceptionInformation } = await supabaseClient
        .from('followers')
        .insert({
          follower_id: authenticatedUser.id,
          following_id: targetUserIdentification
        });

      if (insertDatabaseExceptionInformation) throw insertDatabaseExceptionInformation;

      revalidatePath(`/profile/${targetUserIdentification}`);
      return {
        isOperationSuccessful: true,
        responseStatusMessage: "Vínculo de sabiduría establecido.",
        payloadData: { isFollowingSovereignty: true },
        traceIdentification: "FOLLOW_SUCCESS"
      };
    }
  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.error("🔥 [Social-Action-Error][Follow]:", errorMessage);
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "Fallo crítico en la sincronía social.",
      traceIdentification: "FATAL_FAIL"
    };
  }
}

/**
 * toggleLikeAction: Misión: Registrar o eliminar una señal de resonancia (Like) en una crónica.
 */
export async function toggleLikeAction(
  podcastIdentification: number
): Promise<ProfileActionResponse<{ isResonatingWithLike: boolean }>> {
  const supabaseClient = createClient();

  const { data: { user: authenticatedUser }, error: authenticationExceptionInformation } = await supabaseClient.auth.getUser();
  if (authenticationExceptionInformation || !authenticatedUser) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "Inicie sesión para interactuar.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  try {
    const { data: likeDatabaseRecord } = await supabaseClient
      .from('likes')
      .select('*')
      .eq('user_id', authenticatedUser.id)
      .eq('podcast_id', podcastIdentification)
      .maybeSingle();

    if (likeDatabaseRecord) {
      const { error: deleteDatabaseExceptionInformation } = await supabaseClient
        .from('likes')
        .delete()
        .eq('user_id', authenticatedUser.id)
        .eq('podcast_id', podcastIdentification);

      if (deleteDatabaseExceptionInformation) throw deleteDatabaseExceptionInformation;

      return {
        isOperationSuccessful: true,
        responseStatusMessage: "Resonancia retirada.",
        payloadData: { isResonatingWithLike: false },
        traceIdentification: "UNLIKE_SUCCESS"
      };
    } else {
      const { error: insertDatabaseExceptionInformation } = await supabaseClient
        .from('likes')
        .insert({
          user_id: authenticatedUser.id,
          podcast_id: podcastIdentification
        });

      if (insertDatabaseExceptionInformation) throw insertDatabaseExceptionInformation;

      return {
        isOperationSuccessful: true,
        responseStatusMessage: "Resonancia registrada.",
        payloadData: { isResonatingWithLike: true },
        traceIdentification: "LIKE_SUCCESS"
      };
    }
  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.error("🔥 [Social-Action-Error][Like]:", errorMessage);
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "Error al procesar resonancia.",
      traceIdentification: "FATAL_FAIL"
    };
  }
}
