"use server";

import { createClient } from "@/lib/supabase/server"; // Tu cliente de servidor
import { ProfileUpdateSchema, ProfileUpdatePayload } from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";

export type ActionResponse<T = null> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function updateProfile(payload: ProfileUpdatePayload): Promise<ActionResponse> {
  const supabase = createClient();
  
  // 1. Autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No autorizado" };

  // 2. Validación Zod
  const validated = ProfileUpdateSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  // 3. Ejecución DB
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: validated.data.display_name,
      bio: validated.data.bio,
      website_url: validated.data.website_url,
      avatar_url: validated.data.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Error al guardar el perfil." };
  }

  // 4. Revalidación (Refrescar la ruta del perfil propio)
  revalidatePath(`/u/${user.user_metadata.handle || "me"}`);
  revalidatePath("/account");
  
  return { success: true, message: "Perfil actualizado correctamente." };
}

export async function getProfileByHandle(handle: string) {
  const supabase = createClient();
  
  // Buscamos por handle, incluyendo métricas sociales
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, handle, display_name, bio, avatar_url, 
      reputation_score, is_verified, website_url,
      followers_count, following_count
    `)
    .eq("handle", handle)
    .single();

  if (error) return null;
  return data;
}