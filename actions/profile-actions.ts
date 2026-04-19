/**
 * ARCHIVO: actions/profile-actions.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Gestionar las mutaciones de identidad del curador con integridad axial, nominal y seguridad contra nulos.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / DIS / BSS Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  ProfileUpdatePayload,
  ProfileUpdateSchema
} from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";
import { ProfileActionResponse } from "@/types/profile";
import { nicepodLog } from "@/lib/utils";

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
    nicepodLog("🛑 [Profile-Action] Acceso denegado: Intento de actualización sin identidad.", null, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "SESIÓN_REQUERIDA: Sesión expirada o no autorizada. Por favor, re-inicie sesión.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  // 2. VALIDACIÓN DE INTEGRIDAD SEMÁNTICA (Zod)
  const validationResultDossier = ProfileUpdateSchema.safeParse(updatePayloadSnapshot);

  if (!validationResultDossier.success) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_VALIDACIÓN: Los datos proporcionados no cumplen con el estándar de integridad.",
      validationErrorMessageMap: validationResultDossier.error.flatten().fieldErrors,
      traceIdentification: "SCHEMA_FAIL"
    };
  }

  const validatedProfileDataInventory = validationResultDossier.data;

  try {
    // 3. EJECUCIÓN DE PERSISTENCIA ATÓMICA
    const { error: updateDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
      .from("profiles")
      .update({
        username: validatedProfileDataInventory.username,
        full_name: validatedProfileDataInventory.fullName,
        bio: validatedProfileDataInventory.biographyTextContent,
        bio_short: validatedProfileDataInventory.biographyShortSummary,
        website_url: validatedProfileDataInventory.websiteUniformResourceLocator,
        avatar_url: validatedProfileDataInventory.avatarUniformResourceLocator,
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
    revalidatePath(`/u/${validatedProfileDataInventory.username}`);
    revalidatePath("/dashboard");

    nicepodLog("✅ [Profile-Action] Identidad sincronizada:", { userIdentification: authenticatedUserSnapshot.id });

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "ÉXITO: Identidad sincronizada correctamente en la Bóveda.",
      traceIdentification: "UPDATE_SUCCESS"
    };

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Profile-Action-Fatal][Update]:", exceptionMessageInformationText, 'exceptionInformation');
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
export async function getProfileByUsername(targetUsernameIdentification: string) {
  const supabaseSovereignClient = createClient();

  const { data: profileDatabaseRowSnapshot, error: queryDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
    .from('profiles')
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
      active_creation_jobs,
      role,
      created_at,
      updated_at
    `)
    .eq("username", targetUsernameIdentification)
    .single();

  if (queryDatabaseHardwareExceptionInformation || !profileDatabaseRowSnapshot) {
    nicepodLog(`⚠️ [Profile-Action] Perfil no localizado: @${targetUsernameIdentification}`, null, 'warning');
    return null;
  }

  return {
    identification: profileDatabaseRowSnapshot.id,
    username: profileDatabaseRowSnapshot.username,
    fullName: profileDatabaseRowSnapshot.full_name,
    avatarUniformResourceLocator: profileDatabaseRowSnapshot.avatar_url,
    biographyTextContent: profileDatabaseRowSnapshot.bio,
    biographyShortSummary: profileDatabaseRowSnapshot.bio_short,
    websiteUniformResourceLocator: profileDatabaseRowSnapshot.website_url,
    reputationScoreValue: profileDatabaseRowSnapshot.reputation_score || 0,
    isVerifiedAccountStatus: profileDatabaseRowSnapshot.is_verified || false,
    authorityRole: profileDatabaseRowSnapshot.role,
    followersCountInventory: profileDatabaseRowSnapshot.followers_count || 0,
    followingCountInventory: profileDatabaseRowSnapshot.following_count || 0,
    activeCreationJobsCount: profileDatabaseRowSnapshot.active_creation_jobs || 0,
    creationTimestamp: profileDatabaseRowSnapshot.created_at,
    updateTimestamp: profileDatabaseRowSnapshot.updated_at
  };
}

/**
 * getProfileById: Recuperación directa por identificación única de sistema.
 */
export async function getProfileById(userIdentification: string) {
  if (!userIdentification) return null;

  const supabaseSovereignClient = createClient();

  const { data: profileDatabaseRowSnapshot, error: queryDatabaseHardwareExceptionInformation } = await supabaseSovereignClient
    .from("profiles")
    .select("*")
    .eq("id", userIdentification)
    .single();

  if (queryDatabaseHardwareExceptionInformation || !profileDatabaseRowSnapshot) return null;

  return {
    identification: profileDatabaseRowSnapshot.id,
    username: profileDatabaseRowSnapshot.username,
    fullName: profileDatabaseRowSnapshot.full_name,
    avatarUniformResourceLocator: profileDatabaseRowSnapshot.avatar_url,
    biographyTextContent: profileDatabaseRowSnapshot.bio,
    biographyShortSummary: profileDatabaseRowSnapshot.bio_short,
    websiteUniformResourceLocator: profileDatabaseRowSnapshot.website_url,
    reputationScoreValue: profileDatabaseRowSnapshot.reputation_score || 0,
    isVerifiedAccountStatus: profileDatabaseRowSnapshot.is_verified || false,
    authorityRole: profileDatabaseRowSnapshot.role,
    followersCountInventory: profileDatabaseRowSnapshot.followers_count || 0,
    followingCountInventory: profileDatabaseRowSnapshot.following_count || 0,
    activeCreationJobsCount: profileDatabaseRowSnapshot.active_creation_jobs || 0,
    creationTimestamp: profileDatabaseRowSnapshot.created_at,
    updateTimestamp: profileDatabaseRowSnapshot.updated_at
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.3):
 * 1. Zero Abbreviation Policy: Purificación absoluta de variables (updatePayloadSnapshot,
 *    validationResultDossier, queryDatabaseHardwareExceptionInformation).
 * 2. Seguridad contra Nulos: Se ha reforzado el manejo defensivo en getProfileById y en el Handshake
 *    de actualización.
 * 3. Integridad Axial: Sincronizado con el contrato de tipos de la base de datos (BSS Green).
 */
