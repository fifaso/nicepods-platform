"use server";
import { createClient } from "@/lib/supabase/server";

export async function searchGlobalAction(query: string, lat: number, lng: number) {
  const supabase = createClient();
  
  // Invocamos la función Edge en lugar de intentar procesar IA localmente
  const { data, error } = await supabase.functions.invoke('search-pro', {
    body: { query, userLat: lat, userLng: lng }
  });

  if (error) return { success: false, message: error.message };
  return { success: true, results: data };
}