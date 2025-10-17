// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN DE PRODUCCIÓN - HITO 2

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Se crea un cliente de administrador a nivel de módulo para eficiencia.
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Esquema de validación para el payload que esperamos del frontend.
const AudioPayloadSchema = z.object({
  podcastId: z.string(),
  voiceName: z.string(),
  speakingRate: z.number(),
});

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. AUTENTICACIÓN: Validar el token JWT del usuario.
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) throw new Error("La cabecera de autorización es requerida.");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }

    // 2. VALIDACIÓN DE PAYLOAD: Asegurar que los datos recibidos son correctos.
    const payload = await request.json();
    const { podcastId, voiceName, speakingRate } = AudioPayloadSchema.parse(payload);

    // 3. AUTORIZACIÓN (EL PASO DE SEGURIDAD CRÍTICO):
    // Verificar que el usuario que llama es el propietario del guion.
    const { data: podcast, error: podcastError } = await supabaseAdmin
      .from('micro_pods')
      .select('user_id, script_text')
      .eq('id', podcastId)
      .single();

    if (podcastError) throw new Error(`No se pudo encontrar el podcast: ${podcastError.message}`);
    if (podcast.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "No tienes permiso para modificar este podcast." }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }
    if (!podcast.script_text) {
      throw new Error("El guion de este podcast está vacío y no se puede generar el audio.");
    }

    // 4. SIMULACIÓN DEL TRABAJO (CRITERIO DE ÉXITO DEL HITO 2)
    // En lugar de llamar a Google, registramos que hemos recibido todo correctamente.
    console.log("=== VALIDACIÓN DE GENERACIÓN DE AUDIO (HITO 2) EXITOSA ===");
    console.log("Podcast ID:", podcastId);
    console.log("Propietario (User ID):", user.id);
    console.log("Voz Seleccionada:", voiceName);
    console.log("Velocidad:", speakingRate);
    console.log("Texto del Guion a Procesar:", podcast.script_text.substring(0, 100) + "...");
    console.log("=========================================================");

    // En el Hito 3, aquí irá la lógica para llamar a Google TTS,
    // subir a Supabase Storage y actualizar la fila del podcast.

    return new Response(JSON.stringify({ success: true, message: "Petición de generación de audio validada." }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error en generate-audio-from-script:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    const status = error instanceof ZodError ? 400 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});