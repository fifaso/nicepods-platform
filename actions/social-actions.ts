/**
 * ARCHIVO: actions/social-actions.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Gestionar el flujo de seguidores e interacciones entre curadores con integridad nominal, identidad verificada y seguridad contra nulos.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / DIS / BSS Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProfileActionResponse } from "@/types/profile";
import { nicepodLog } from "@/lib/utils";

/**
 * followUserAction: Misión: Establecer o revocar un vínculo de seguimiento entre curadores con validación de identidad.
 */
export async function followUserAction(
  targetUserIdentification: string
): Promise<ProfileActionResponse<{ isFollowingSovereignty: boolean }>> {
  if (!targetUserIdentification) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_PARÁMETRO: Identificación del objetivo no proporcionada.",
      traceIdentification: "PARAM_NULL_FAIL"
    };
  }

  const supabaseSovereignClient = createClient();

  // 1. HANDSHAKE DE SOBERANÍA (DIS DOCTRINE)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();
  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    nicepodLog("🛑 [Social-Action] Intento de seguimiento sin identidad verificada.", null, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "SESIÓN_REQUERIDA: Inicie sesión para seguir a otros curadores.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

  if (authenticatedUserIdentification === targetUserIdentification) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "AUTOSEGUIMIENTO_PROHIBIDO: No puedes seguir tu propia identidad.",
      traceIdentification: "SELF_FOLLOW_FAIL"
    };
  }

  try {
    // 2. VERIFICACIÓN DE ESTADO ACTUAL (Snapshot de relación)
    const { data: followerRelationshipDatabaseRecordSnapshot, error: queryDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
      .from('followers')
      .select('*')
      .eq('follower_id', authenticatedUserIdentification)
      .eq('following_id', targetUserIdentification)
      .maybeSingle();

    if (queryDatabaseHardwareExceptionInformation) throw queryDatabaseHardwareExceptionInformation;

    if (followerRelationshipDatabaseRecordSnapshot) {
      // 3. ACCIÓN: DEJAR DE SEGUIR (Unfollow)
      const { error: deleteDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
        .from('followers')
        .delete()
        .eq('follower_id', authenticatedUserIdentification)
        .eq('following_id', targetUserIdentification);

      if (deleteDatabaseHardwareExceptionInformation) throw deleteDatabaseHardwareExceptionInformation;

      revalidatePath(`/profile/${targetUserIdentification}`);
      nicepodLog("📉 [Social-Action] Vínculo revocado:", { follower: authenticatedUserIdentification, following: targetUserIdentification });

      return {
        isOperationSuccessful: true,
        responseStatusMessage: "Vínculo revocado con éxito.",
        payloadData: { isFollowingSovereignty: false },
        traceIdentification: "UNFOLLOW_SUCCESS"
      };
    } else {
      // 4. ACCIÓN: SEGUIR (Follow)
      const { error: insertDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
        .from('followers')
        .insert({
          follower_id: authenticatedUserIdentification,
          following_id: targetUserIdentification
        });

      if (insertDatabaseHardwareExceptionInformation) throw insertDatabaseHardwareExceptionInformation;

      revalidatePath(`/profile/${targetUserIdentification}`);
      nicepodLog("📈 [Social-Action] Vínculo establecido:", { follower: authenticatedUserIdentification, following: targetUserIdentification });

      return {
        isOperationSuccessful: true,
        responseStatusMessage: "Vínculo de sabiduría establecido.",
        payloadData: { isFollowingSovereignty: true },
        traceIdentification: "FOLLOW_SUCCESS"
      };
    }
  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Social-Action-Fatal][Follow]:", exceptionMessageInformationText, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "Fallo crítico en la sincronía social.",
      traceIdentification: "FATAL_FAIL"
    };
  }
}

/**
 * toggleLikeAction: Misión: Registrar o eliminar una señal de resonancia (Like) en una crónica con validación de identidad.
 */
export async function toggleLikeAction(
  podcastIdentificationMagnitude: number
): Promise<ProfileActionResponse<{ isResonatingWithLike: boolean }>> {
  if (!podcastIdentificationMagnitude) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_PARÁMETRO: Identificación del activo no proporcionada.",
      traceIdentification: "PARAM_NULL_FAIL"
    };
  }

  const supabaseSovereignClient = createClient();

  // 1. PROTOCOLO DE AUTORIDAD (DIS DOCTRINE)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();
  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "SESIÓN_REQUERIDA: Inicie sesión para interactuar.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

  try {
    const { data: likeResonanceDatabaseRecordSnapshot, error: queryDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
      .from('likes')
      .select('*')
      .eq('user_id', authenticatedUserIdentification)
      .eq('podcast_id', podcastIdentificationMagnitude)
      .maybeSingle();

    if (queryDatabaseHardwareExceptionInformation) throw queryDatabaseHardwareExceptionInformation;

    if (likeResonanceDatabaseRecordSnapshot) {
      // 2. ACCIÓN: RETIRAR RESONANCIA (Unlike)
      const { error: deleteDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
        .from('likes')
        .delete()
        .eq('user_id', authenticatedUserIdentification)
        .eq('podcast_id', podcastIdentificationMagnitude);

      if (deleteDatabaseHardwareExceptionInformation) throw deleteDatabaseHardwareExceptionInformation;

      return {
        isOperationSuccessful: true,
        responseStatusMessage: "Resonancia retirada.",
        payloadData: { isResonatingWithLike: false },
        traceIdentification: "UNLIKE_SUCCESS"
      };
    } else {
      // 3. ACCIÓN: REGISTRAR RESONANCIA (Like)
      const { error: insertDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
        .from('likes')
        .insert({
          user_id: authenticatedUserIdentification,
          podcast_id: podcastIdentificationMagnitude
        });

      if (insertDatabaseHardwareExceptionInformation) throw insertDatabaseHardwareExceptionInformation;

      return {
        isOperationSuccessful: true,
        responseStatusMessage: "Resonancia registrada.",
        payloadData: { isResonatingWithLike: true },
        traceIdentification: "LIKE_SUCCESS"
      };
    }
  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Social-Action-Fatal][Like]:", exceptionMessageInformationText, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "Error al procesar resonancia.",
      traceIdentification: "FATAL_FAIL"
    };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.3):
 * 1. Zero Abbreviation Policy: Purificación absoluta de variables (authenticatedUserSnapshot,
 *    followerRelationshipDatabaseRecordSnapshot, podcastIdentificationMagnitude).
 * 2. Seguridad contra Nulos: Validación defensiva de parámetros de entrada y Handshake SSR robusto.
 * 3. Identidad SSR: Implementado el protocolo DIS para asegurar que cada interacción social
 *    sea trazable a una identidad autenticada.
 */
