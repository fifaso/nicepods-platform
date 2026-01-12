// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 19.2 (Master Audio Engine - Stable Binary Processing)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Importaciones con rutas relativas para estabilidad total
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { callGeminiAudio, cleanTextForSpeech } from "../_shared/ai.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

/**
 * LÍMITE DE PROCESAMIENTO
 * Reducimos el chunk a 8k caracteres para maximizar la estabilidad del flujo binario.
 */
const MAX_TEXT_CHUNK_SIZE = 8000;

const InvokePayloadSchema = z.object({
  job_id: z.number().optional().nullable(),
  podcast_id: z.number({ required_error: "podcast_id_missing" }),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  console.log(`[Audio-Worker][${correlationId}] Iniciando interpretación de audio...`);

  try {
    const rawBody = await request.json();
    const { podcast_id } = InvokePayloadSchema.parse(rawBody);

    // 1. OBTENCIÓN DE DATOS (Alta Fidelidad)
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('script_text, user_id, creation_data')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error(`PODCAST_NOT_ACCESSIBLE: ${podcast_id}`);

    // 2. EXTRACCIÓN Y SANITIZACIÓN
    let rawScript = "";
    try {
      const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
      rawScript = parsed.script_body || parsed.script_plain || pod.script_text;
    } catch {
      rawScript = pod.script_text;
    }

    const cleanText = cleanTextForSpeech(rawScript);
    if (!cleanText || cleanText.length < 5) throw new Error("GUION_INSUFICIENTE");

    // 3. GENERACIÓN DE DIRECCIÓN ACTORAL
    const inputs = (pod.creation_data as any)?.inputs || {};
    const directorNote = generateDirectorNote(
      inputs.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    console.log(`🎭 [${correlationId}] Nota de Dirección: ${inputs.agentName}`);

    // 4. SÍNTESIS NATIVA POR FRAGMENTOS (Semantic Chunking)
    const chunks = cleanText.match(new RegExp(`.{1,${MAX_TEXT_CHUNK_SIZE}}(?=\\s|$)`, 'g')) || [cleanText];
    const audioBuffers: Uint8Array[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Interpretando bloque ${i + 1}/${chunks.length}...`);

      const base64AudioChunk = await callGeminiAudio(chunks[i], directorNote);

      if (!base64AudioChunk) {
        throw new Error(`IA_GENERATION_FAILED_AT_CHUNK_${i + 1}`);
      }

      const binaryData = decode(base64AudioChunk);
      audioBuffers.push(new Uint8Array(binaryData));
    }

    // 5. ENSAMBLAJE BINARIO FINAL
    const totalByteLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const finalAudioBuffer = new Uint8Array(totalByteLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      finalAudioBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    // 6. PERSISTENCIA EN STORAGE
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.mp3`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalAudioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`STORAGE_UPLOAD_FAIL: ${uploadError.message}`);

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 7. ACTUALIZACIÓN DE METADATOS
    const calculatedDuration = Math.round(totalByteLength / 16000);

    const { error: finalUpdateError } = await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      duration_seconds: calculatedDuration,
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    if (finalUpdateError) throw new Error(`DATABASE_SYNC_FAIL: ${finalUpdateError.message}`);

    console.log(`✅ [${correlationId}] Producción de audio completada.`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl.publicUrl,
      duration: calculatedDuration,
      trace_id: correlationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`🔥 [Audio Worker Error][${correlationId}]:`, err.message);

    return new Response(JSON.stringify({
      success: false,
      error: err.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));