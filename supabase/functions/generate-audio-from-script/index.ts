// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 19.0 (Master Audio Engine - Gemini 2.5 Pro Native Interpreter)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Importaciones con rutas relativas para estabilidad total en el despliegue
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { callGeminiAudio, cleanTextForSpeech } from "../_shared/ai.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

/**
 * LÍMITE DE PROCESAMIENTO COGNITIVO
 * Gemini 2.5 Pro Audio permite bloques grandes, pero limitamos a 10k 
 * para garantizar la estabilidad del streaming y evitar Timeouts de la Edge Function.
 */
const MAX_TEXT_CHUNK_SIZE = 10000;

/**
 * CONTRATO DE ENTRADA (Zod)
 * Validamos la integridad del payload recibido desde el orquestador.
 */
const InvokePayloadSchema = z.object({
  job_id: z.number().optional().nullable(),
  podcast_id: z.number(),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  console.log(`[Audio-Worker][${correlationId}] Iniciando interpretación neuronal...`);

  try {
    // 1. RECEPCIÓN DE PAYLOAD
    const payload = await request.json();
    const { podcast_id } = InvokePayloadSchema.parse(payload);

    // 2. RECUPERACIÓN DE DATOS (Custodia de Datos v5.2)
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('script_text, user_id, creation_data')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) {
      throw new Error(`CRITICAL_DATABASE_ERROR: Podcast ${podcast_id} no localizado.`);
    }

    // 3. EXTRACCIÓN Y LIMPIEZA DEL GUION
    let rawScript = "";
    try {
      const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
      rawScript = parsed.script_body || parsed.script_plain || pod.script_text;
    } catch {
      rawScript = pod.script_text;
    }

    const cleanText = cleanTextForSpeech(rawScript);
    if (!cleanText || cleanText.length < 10) {
      throw new Error("CONTENIDO_INSUFICIENTE: El guion está vacío o es demasiado corto.");
    }

    // 4. GENERACIÓN DE NOTA DE DIRECCIÓN ACTORAL (V3.0 Standard)
    const inputs = (pod.creation_data as any)?.inputs || {};
    const directorNote = generateDirectorNote(
      inputs.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    console.log(`🎭 [${correlationId}] Dirección Vocal Generada. Iniciando síntesis nativa.`);

    // 5. PROCESAMIENTO POR FRAGMENTOS (Semantic Chunking)
    // Dividimos por espacios para no cortar palabras
    const chunks = cleanText.match(new RegExp(`.{1,${MAX_TEXT_CHUNK_SIZE}}(?=\\s|$)`, 'g')) || [cleanText];
    const audioBuffers: Uint8Array[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Interpretando bloque ${i + 1}/${chunks.length}...`);

      // Invocación al modelo Gemini 2.5 Pro Audio (Speech Native)
      const base64AudioChunk = await callGeminiAudio(chunks[i], directorNote);

      if (!base64AudioChunk) {
        throw new Error(`IA_GENERATION_FAILED: El bloque ${i + 1} no devolvió datos de audio.`);
      }

      // Convertimos el base64 de Google en un buffer binario
      const binaryData = decode(base64AudioChunk);
      audioBuffers.push(new Uint8Array(binaryData));
    }

    // 6. ENSAMBLAJE BINARIO FINAL (Sinfonía Unificada)
    const totalByteLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const finalAudioBuffer = new Uint8Array(totalByteLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      finalAudioBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    // 7. PERSISTENCIA EN STORAGE (Atomic Upsert)
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.mp3`;
    console.log(`💾 [${correlationId}] Guardando archivo final: ${filePath}`);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalAudioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`STORAGE_UPLOAD_FAIL: ${uploadError.message}`);

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 8. CIERRE DE CICLO: Actualización de Metadatos y Duración
    // Ratio de calibración para Gemini Pro Audio: ~16,000 bytes por segundo
    const calculatedDuration = Math.round(totalByteLength / 16000);

    const { error: finalUpdateError } = await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      duration_seconds: calculatedDuration,
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    if (finalUpdateError) throw new Error(`DB_FINAL_UPDATE_FAIL: ${finalUpdateError.message}`);

    console.log(`✅ [${correlationId}] Podcast Interpretado Exitosamente. Duración: ${calculatedDuration}s`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl.publicUrl,
      duration: calculatedDuration,
      trace_id: correlationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : "Error desconocido en el proceso de audio";
    console.error(`🔥 [Audio Worker Error][${correlationId}]:`, errorMsg);

    return new Response(JSON.stringify({
      success: false,
      error: errorMsg,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));