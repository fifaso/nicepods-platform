// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 19.3 (Binary Assembly & Error Catching)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { callGeminiAudio, cleanTextForSpeech } from "../_shared/ai.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

const MAX_TEXT_CHUNK_SIZE = 8000;

const InvokePayloadSchema = z.object({
  job_id: z.number().optional().nullable(),
  podcast_id: z.number({ required_error: "podcast_id_is_required" }),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  console.log(`[Audio-Worker][${correlationId}] Iniciando interpretación...`);

  try {
    const rawBody = await request.json();
    const { podcast_id } = InvokePayloadSchema.parse(rawBody);

    // 1. Obtención de Datos
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('script_text, user_id, creation_data')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error(`DB_FETCH_FAIL: Podcast ${podcast_id}`);

    // 2. Preparación de Guion
    const scriptData = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
    const cleanText = cleanTextForSpeech(scriptData.script_body || pod.script_text);

    // 3. Nota de Dirección Actoral
    const inputs = (pod.creation_data as any)?.inputs || {};
    const directorNote = generateDirectorNote(
      inputs.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    // 4. Fragmentación y Síntesis
    const chunks = cleanText.match(new RegExp(`.{1,${MAX_TEXT_CHUNK_SIZE}}(?=\\s|$)`, 'g')) || [cleanText];
    const audioBuffers: Uint8Array[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Procesando chunk ${i + 1}/${chunks.length}`);
      const base64Chunk = await callGeminiAudio(chunks[i], directorNote);
      audioBuffers.push(new Uint8Array(decode(base64Chunk).buffer));
    }

    // 5. Ensamblaje Binario
    const totalSize = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const finalBuffer = new Uint8Array(totalSize);
    let offset = 0;
    for (const b of audioBuffers) { finalBuffer.set(b, offset); offset += b.length; }

    // 6. Almacenamiento
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.mp3`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalBuffer, { contentType: 'audio/mpeg', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 7. Actualización de Metadatos
    // Actualizamos al final para habilitar el botón de reproducción en el frontend
    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      duration_seconds: Math.round(totalSize / 16000),
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    return new Response(JSON.stringify({ success: true, url: publicUrl.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`🔥 [Audio Critical Error]:`, err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));