// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 27.0 (NSP Harvester - Segmented Binary Production)
// Misión: Cosechar fragmentos de audio neuronal y sembrarlos en el Storage como RAW PCM.
// [ESTABILIZACIÓN]: Implementación del Protocolo de Streaming para soporte de audios extensos (>150MB).

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * IMPORTACIONES DEL NÚCLEO SINCRO (v12.5)
 * Utilizamos AUDIO_CONFIG para asegurar paridad binaria entre el Cosechador y el Ensamblador.
 */
import {
  callGeminiAudio,
  cleanTextForSpeech
} from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

/**
 * LÍMITES TÉCNICOS OPERATIVOS
 * MAX_CHUNK_SIZE: 4000 caracteres para asegurar que Gemini mantenga la coherencia tonal.
 * HEADER_BYTE_SIZE: 44 bytes (Tamaño estándar de una cabecera WAV que debemos omitir en los segmentos).
 */
const MAX_CHUNK_SIZE = 4000;
const HEADER_BYTE_SIZE = 44;

/**
 * INICIALIZACIÓN DE CLIENTE SUPABASE ADMIN
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScriptContent: Extrae el texto plano desde el JSONB soberano de la base de datos.
 */
function extractScriptContent(script_text: any): string {
  if (!script_text) return "";
  if (typeof script_text === 'object' && script_text !== null) {
    return script_text.script_plain || script_text.script_body || "";
  }
  try {
    const parsed = typeof script_text === 'string' ? JSON.parse(script_text) : script_text;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(script_text);
  }
}

/**
 * handler: Orquestador de la Cosecha de Segmentos.
 */
async function handler(request: Request): Promise<Response> {
  // 1. PROTOCOLO CORS
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 2. VALIDACIÓN DE SEGURIDAD LITE
    const authHeader = request.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authHeader?.includes(serviceKey ?? "PROTECTED")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 3. RECEPCIÓN DE DATOS
    const payload = await request.json();
    const { podcast_id } = payload;
    if (!podcast_id) throw new Error("PODCAST_ID_REQUIRED");
    targetPodId = podcast_id;

    console.log(`📡 [NSP-Harvester][${correlationId}] Iniciando siembra de segmentos para Pod #${podcast_id}`);

    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND");

    // 4. PREPARACIÓN NARRATIVA
    const rawText = extractScriptContent(pod.script_text);
    const cleanText = cleanTextForSpeech(rawText);
    const inputs = (pod.creation_data as any)?.inputs || {};

    const directorNote = generateDirectorNote(
      pod.creation_data?.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    // 5. SEGMENTACIÓN DEL GUION (Cubicaje)
    const paragraphs = cleanText.split(/\n+/);
    const textChunks: string[] = [];
    let currentChunk = "";

    for (const p of paragraphs) {
      if ((currentChunk.length + p.length) < MAX_CHUNK_SIZE) {
        currentChunk += (currentChunk ? "\n\n" : "") + p;
      } else {
        if (currentChunk) textChunks.push(currentChunk);
        currentChunk = p;
      }
    }
    if (currentChunk) textChunks.push(currentChunk);

    // 6. ACTUALIZACIÓN DE CONTROL EN BASE DE DATOS
    // Informamos a la DB cuántos fragmentos debe esperar para disparar el ensamblaje final.
    await supabaseAdmin.from('micro_pods').update({
      total_audio_segments: textChunks.length,
      current_audio_segments: 0,
      audio_assembly_status: 'collecting'
    }).eq('id', podcast_id);

    console.log(`📦 [NSP-Harvester] Malla definida: ${textChunks.length} segmentos.`);

    // 7. BUCLE DE COSECHA BINARIA (Anti-Memory Peak)
    for (let i = 0; i < textChunks.length; i++) {
      console.log(`   > Cosechando segmento ${i + 1}/${textChunks.length}...`);

      // Invocación al motor TTS de Gemini
      const { data: base64Audio } = await callGeminiAudio(
        textChunks[i],
        directorNote,
        { gender: inputs.voiceGender || "Masculino", style: inputs.voiceStyle || "Profesional" }
      );

      /**
       * [LIMPIEZA BINARIA]: 
       * Gemini devuelve un archivo WAV con su propio header.
       * Para concatenar perfectamente, extraemos solo el PCM crudo (slice 44).
       */
      const fullBuffer = new Uint8Array(decode(base64Audio).buffer);
      const rawPcmData = fullBuffer.slice(HEADER_BYTE_SIZE);

      // 8. PERSISTENCIA INMEDIATA DEL FRAGMENTO (Liberación de RAM)
      const segmentPath = `temp/segments/${podcast_id}/part_${i}.raw`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('podcasts')
        .upload(segmentPath, rawPcmData, {
          contentType: 'application/octet-stream',
          upsert: true
        });

      if (uploadError) throw new Error(`SEGMENT_UPLOAD_FAIL: ${uploadError.message}`);

      // 9. REGISTRO EN EL MAPA BINARIO
      // Al insertar este registro, el trigger SQL 'tr_on_segment_uploaded' se encargará 
      // de contar y disparar el ensamblador si es el último pedazo.
      await supabaseAdmin.from('audio_segments').insert({
        podcast_id: podcast_id,
        segment_index: i,
        storage_path: segmentPath,
        byte_size: rawPcmData.length,
        status: 'uploaded'
      });

      // [CRÍTICO]: Ayudamos al Garbage Collector nulificando las variables pesadas
      (rawPcmData as any) = null;
      (fullBuffer as any) = null;
    }

    console.log(`✅ [NSP-Harvester] Siembra completada para Pod #${podcast_id}.`);

    return new Response(JSON.stringify({
      success: true,
      segments_total: textChunks.length,
      trace_id: correlationId
    }), {
      status: 202, // Accepted: El proceso continúa asíncronamente en la DB
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [NSP-Harvester-Fatal][${correlationId}]:`, error.message);

    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_assembly_status: 'failed',
        admin_notes: `Harvester Error: ${error.message} | Trace: ${correlationId}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({ error: error.message, trace_id: correlationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);