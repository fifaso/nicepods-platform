// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 19.1 (Master Audio Engine - Multi-Source Sync & Protocol Stability)

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
 * [FIJO]: Se hace 'job_id' opcional/nulo para permitir la creación desde 
 * la Bóveda de Borradores (NKV) sin disparar errores de validación 400/500.
 */
const InvokePayloadSchema = z.object({
  job_id: z.number().optional().nullable(),
  podcast_id: z.number({ required_error: "podcast_id es obligatorio para la producción" }),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  console.log(`[Audio-Worker][${correlationId}] Iniciando interpretación de audio nativo...`);

  try {
    // 1. RECEPCIÓN Y VALIDACIÓN DEL PAYLOAD
    const rawBody = await request.json();
    const { podcast_id } = InvokePayloadSchema.parse(rawBody);

    // 2. RECUPERACIÓN DE DATOS (Alta Consistencia)
    // Buscamos el registro en micro_pods que contiene el guion y los metadatos de voz
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('script_text, user_id, creation_data')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) {
      throw new Error(`DB_FETCH_ERROR: El podcast ${podcast_id} no fue localizado o no es accesible.`);
    }

    // 3. EXTRACCIÓN Y SANITIZACIÓN DEL GUION
    let rawScript = "";
    try {
      // Manejamos tanto JSON estructurado como texto plano para retrocompatibilidad
      const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
      rawScript = parsed.script_body || parsed.script_plain || pod.script_text;
    } catch {
      rawScript = pod.script_text;
    }

    const cleanText = cleanTextForSpeech(rawScript);
    if (!cleanText || cleanText.length < 5) {
      throw new Error("GUION_INVALIDO: El contenido es insuficiente para la síntesis de audio.");
    }

    // 4. DIRECCIÓN ACTORAL (V3.0 Standard)
    // Extraemos la configuración desde el nuevo objeto 'inputs' (Custodia de Datos v5.2)
    const inputs = (pod.creation_data as any)?.inputs || {};
    const directorNote = generateDirectorNote(
      inputs.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    console.log(`🎭 [${correlationId}] Interpretación asignada: ${inputs.agentName || 'Standard Narrator'}`);

    // 5. SÍNTESIS NATIVA POR FRAGMENTOS (Semantic Chunking)
    // Dividimos por espacios para evitar cortes de audio en mitad de una palabra
    const chunks = cleanText.match(new RegExp(`.{1,${MAX_TEXT_CHUNK_SIZE}}(?=\\s|$)`, 'g')) || [cleanText];
    const audioBuffers: Uint8Array[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Procesando bloque ${i + 1}/${chunks.length}...`);

      // Invocación a Gemini 2.5 Pro Audio vía _shared/ai.ts (v8.4+)
      const base64AudioChunk = await callGeminiAudio(chunks[i], directorNote);

      if (!base64AudioChunk) {
        throw new Error(`AI_SIGNAL_LOSS: El bloque ${i + 1} falló en la generación de audio.`);
      }

      // Decodificación de flujo binario
      const binaryData = decode(base64AudioChunk);
      audioBuffers.push(new Uint8Array(binaryData));
    }

    // 6. ENSAMBLAJE BINARIO FINAL
    const totalByteLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const finalAudioBuffer = new Uint8Array(totalByteLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      finalAudioBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    // 7. PERSISTENCIA EN STORAGE (Atomic Upsert)
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.mp3`;
    console.log(`💾 [${correlationId}] Persistiendo audio en bucket: ${filePath}`);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalAudioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`STORAGE_FAIL: ${uploadError.message}`);

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 8. CIERRE DE CICLO: Actualización de Metadatos
    // Calibración de ratio para Gemini Pro Audio: ~16KB/seg
    const calculatedDuration = Math.round(totalByteLength / 16000);

    const { error: finalUpdateError } = await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      duration_seconds: calculatedDuration,
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    if (finalUpdateError) throw new Error(`DB_SYNC_FAIL: ${finalUpdateError.message}`);

    console.log(`✅ [${correlationId}] Producción de audio exitosa. Duración: ${calculatedDuration}s`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl.publicUrl,
      duration: calculatedDuration,
      trace_id: correlationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : "Fallo desconocido en el motor de audio";
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