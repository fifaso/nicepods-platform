/**
 * ARCHIVO: actions/profile-actions.ts
 * VERSIÓN: 4.1 (NicePod Profile Management - Sovereign Protocol V4.1)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Gestionar las mutaciones de identidad del curador con integridad axial y nominal.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  ProfileUpdatePayload,
  ProfileUpdateSchema
} from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";
import { ProfileActionResponse } from "@/types/profile";

/**
 * updateProfile: Misión: Actualizar los metadatos del curador en la Bóveda de NicePod.
 */
export async function updateProfile(
  updatePayload: ProfileUpdatePayload
): Promise<ProfileActionResponse> {
  const supabaseSovereignClient = createClient();

  // 1. PROTOCOLO DE AUTORIDAD (DIS DOCTRINE)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "SESIÓN_REQUERIDA: Sesión expirada o no autorizada. Por favor, re-inicie sesión.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  // 2. VALIDACIÓN DE INTEGRIDAD SEMÁNTICA (Zod)
  const validationResult = ProfileUpdateSchema.safeParse(updatePayload);

  if (!validationResult.success) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_VALIDACIÓN: Los datos proporcionados no cumplen con el estándar de integridad.",
      validationErrorMessageMap: validationResult.error.flatten().fieldErrors,
      traceIdentification: "SCHEMA_FAIL"
    };
  }

  const validatedProfileData = validationResult.data;

  try {
    // 3. EJECUCIÓN DE PERSISTENCIA ATÓMICA
    const { error: updateDatabaseExceptionInformation } = await supabaseSovereignClient
      .from("profiles")
      .update({
        username: validatedProfileData.username,
        full_name: validatedProfileData.fullName,
        bio: validatedProfileData.biographyTextContent,
        bio_short: validatedProfileData.biographyShortSummary,
        website_url: validatedProfileData.websiteUniformResourceLocator,
        avatar_url: validatedProfileData.avatarUniformResourceLocator,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authenticatedUserSnapshot.id);

    if (updateDatabaseExceptionInformation) {
      if (updateDatabaseExceptionInformation.code === '23505') {
        return {
          isOperationSuccessful: false,
          responseStatusMessage: "DUPLICIDAD_NOMINAL: El nombre de usuario ya está reservado por otro curador.",
          traceIdentification: "DB_UNIQUE_FAIL"
        };
      }
      throw updateDatabaseExceptionInformation;
    }

    // 4. PROTOCOLO DE REVALIDACIÓN DE CACHÉ
    revalidatePath("/profile");
    revalidatePath(`/u/${validatedProfileData.username}`);
    revalidatePath("/dashboard");

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "ÉXITO: Identidad sincronizada correctamente en la Bóveda.",
      traceIdentification: "UPDATE_SUCCESS"
    };

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.error("🔥 [NicePod-Profile-Action-Fatal]:", errorMessage);
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_CRÍTICO: Fallo crítico en la comunicación con la base de datos.",
      traceIdentification: "FATAL_FAIL"
    };
  }
}

/**
 * getProfileByUsername: Recuperar la ficha técnica pública de un curador basada en su handle.
 */
export async function getProfileByUsername(targetUsernameIdentification: string) {
  const supabaseSovereignClient = createClient();

  const { data: profileDatabaseRowSnapshot, error: queryDatabaseExceptionInformation } = await supabaseSovereignClient
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

  if (queryDatabaseExceptionInformation || !profileDatabaseRowSnapshot) {
    console.warn(`⚠️ [NicePod-Vault] Perfil no localizado: @${targetUsernameIdentification}`);
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
 * getProfileById: Recuperación directa por ID de sistema.
 */
export async function getProfileById(userIdentification: string) {
  const supabaseSovereignClient = createClient();

  const { data: profileDatabaseRowSnapshot, error: queryDatabaseExceptionInformation } = await supabaseSovereignClient
    .from("profiles")
    .select("*")
    .eq("id", userIdentification)
    .single();

  if (queryDatabaseExceptionInformation || !profileDatabaseRowSnapshot) return null;

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
