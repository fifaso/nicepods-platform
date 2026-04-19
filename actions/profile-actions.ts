/**
 * ARCHIVO: actions/profile-actions.ts
 * VERSIÓN: 8.3 (NicePod Profile Management - Madrid Resonance V8.3)
 * PROTOCOLO: MADRID RESONANCE V8.3
 * MISIÓN: Gestionar las mutaciones de identidad del curador con integridad axial y nominal.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  ProfileUpdatePayload,
  ProfileUpdateSchema
} from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";
import { ProfileActionResponse, ProfileData } from "@/types/profile";
import { nicepodLog } from "@/lib/utils";
import { transformDatabaseProfileToSovereignEntity } from "@/lib/mappers/profile-sovereign-mapper";

/**
 * updateProfile: Misión: Actualizar los metadatos del curador en la Bóveda de NicePod con validación estricta.
 */
export async function updateProfile(
  updatePayloadSnapshot: ProfileUpdatePayload
): Promise<ProfileActionResponse> {
  const supabaseSovereignClient = createClient();

  // 1. PROTOCOLO DE AUTORIDAD (DIS DOCTRINE)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    nicepodLog("🛑 [Profile-Engine] Intento de actualización sin sesión.", "AUTH_FAIL", 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "SESIÓN_REQUERIDA: Sesión expirada o no autorizada. Por favor, re-inicie sesión.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  // 2. VALIDACIÓN DE INTEGRIDAD SEMÁNTICA (Zod)
  const validationResultSnapshot = ProfileUpdateSchema.safeParse(updatePayloadSnapshot);

  if (!validationResultSnapshot.success) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_VALIDACIÓN: Los datos proporcionados no cumplen con el estándar de integridad.",
      validationErrorMessageMap: validationResultSnapshot.error.flatten().fieldErrors,
      traceIdentification: "SCHEMA_FAIL"
    };
  }

  const validatedProfileDataSnapshot = validationResultSnapshot.data;

  try {
    // 3. EJECUCIÓN DE PERSISTENCIA ATÓMICA
    const { error: updateDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
      .from("profiles")
      .update({
        username: validatedProfileDataSnapshot.username,
        full_name: validatedProfileDataSnapshot.fullName,
        bio: validatedProfileDataSnapshot.biographyTextContent,
        bio_short: validatedProfileDataSnapshot.biographyShortSummary,
        website_url: validatedProfileDataSnapshot.websiteUniformResourceLocator,
        avatar_url: validatedProfileDataSnapshot.avatarUniformResourceLocator,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authenticatedUserSnapshot.id);

    if (updateDatabaseHardwareExceptionInformation) {
      if (updateDatabaseHardwareExceptionInformation.code === '23505') {
        return {
          isOperationSuccessful: false,
          responseStatusMessage: "DUPLICIDAD_NOMINAL: El nombre de usuario ya está reservado por otro curador.",
          traceIdentification: "DB_UNIQUE_FAIL"
        };
      }
      throw updateDatabaseHardwareExceptionInformation;
    }

    // 4. PROTOCOLO DE REVALIDACIÓN DE CACHÉ
    revalidatePath("/profile");
    revalidatePath(`/u/${validatedProfileDataSnapshot.username}`);
    revalidatePath("/dashboard");

    nicepodLog("👤 [Profile-Engine] Identidad sincronizada.", { username: validatedProfileDataSnapshot.username });

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "ÉXITO: Identidad sincronizada correctamente en la Bóveda.",
      traceIdentification: "UPDATE_SUCCESS"
    };

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Profile-Action-Fatal][Update]:", exceptionMessageText, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_CRÍTICO: Fallo crítico en la comunicación con la base de datos.",
      traceIdentification: "FATAL_FAIL"
    };
  }
}

/**
 * getProfileByUsername: Recuperar la ficha técnica pública de un curador basada en su handle nominal.
 */
export async function getProfileByUsername(targetUsernameIdentification: string): Promise<ProfileData | null> {
  const supabaseSovereignClient = createClient();

  try {
    const { data: profileDatabaseRowSnapshot, error: queryDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
      .from('profiles')
      .select(`*`)
      .eq("username", targetUsernameIdentification)
      .single();

    if (queryDatabaseHardwareExceptionInformation || !profileDatabaseRowSnapshot) {
      nicepodLog(`⚠️ [Profile-Engine] Perfil no localizado: @${targetUsernameIdentification}`, null, 'warning');
      return null;
    }

    return transformDatabaseProfileToSovereignEntity(profileDatabaseRowSnapshot);
  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Profile-Action-Fatal][GetByUsername]:", exceptionMessageText, 'exceptionInformation');
    return null;
  }
}

/**
 * getProfileById: Recuperación directa por identificación de sistema.
 */
export async function getProfileById(authenticatedUserIdentification: string): Promise<ProfileData | null> {
  const supabaseSovereignClient = createClient();

  try {
    const { data: profileDatabaseRowSnapshot, error: queryDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
      .from("profiles")
      .select("*")
      .eq("id", authenticatedUserIdentification)
      .single();

    if (queryDatabaseHardwareExceptionInformation || !profileDatabaseRowSnapshot) {
        nicepodLog(`⚠️ [Profile-Engine] Perfil no localizado por identificación: ${authenticatedUserIdentification}`, null, 'warning');
        return null;
    }

    return transformDatabaseProfileToSovereignEntity(profileDatabaseRowSnapshot);
  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Profile-Action-Fatal][GetById]:", exceptionMessageText, 'exceptionInformation');
    return null;
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.3):
 * 1. Zero Abbreviation Policy: Purificación absoluta de variables (updatePayloadSnapshot,
 *    validationResultDossier, queryDatabaseHardwareExceptionInformation).
 * 2. Seguridad contra Nulos: Se ha reforzado el manejo defensivo en getProfileById y en el Handshake
 *    de actualización.
 * 3. Integridad Axial: Sincronizado con el contrato de tipos de la base de datos (BSS Green).
 */
