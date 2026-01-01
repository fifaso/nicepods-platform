"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./profile-actions";

export async function toggleFollowUser(targetUserId: string): Promise<ActionResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Login requerido" };

  if (user.id === targetUserId) return { success: false, message: "No puedes seguirte a ti mismo" };

  // Check existencia
  const { data: existing } = await supabase
    .from("followers")
    .select("*")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .single();

  if (existing) {
    // Unfollow
    const { error } = await supabase
      .from("followers")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);
      
    if (error) return { success: false, message: "Error al dejar de seguir" };
    
    // IMPORTANTE: Revalidar ambas perspectivas
    revalidatePath(`/u/${targetUserId}`); // El perfil que veo
    revalidatePath(`/u/me`); // Mi perfil (mi contador de seguidos)
    return { success: true, message: "Dejaste de seguir al usuario." };
  } else {
    // Follow
    const { error } = await supabase
      .from("followers")
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      });

    if (error) return { success: false, message: "Error al seguir" };
    
    revalidatePath(`/u/${targetUserId}`);
    return { success: true, message: "Ahora sigues a este usuario." };
  }
}