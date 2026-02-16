// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 24.0 (Master Audio Architect - Performance & Integrity Standard)
// Misión: Forja binaria de audio neuronal optimizando el uso de CPU y RAM.
// [OPTIMIZACIÓN]: Ejecución directa sin Guard y sincronización con Gemini 2.5 Pro TTS.

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de inteligencia NicePod (Sincronizadas con Nivel 1)
import { AI_MODELS, callGeminiAudio, cleanTextForSpeech, createWavHeader } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

/**
 * LÍMITES TÉCNICOS OPERATIVOS
 */
const MAX_CHUNK_SIZE = 4500; // Margen de seguridad para el contexto de la IA de voz
const SAMPLE_RATE = 24000;    // Estándar de frecuencia para el header WAV de NicePod

/**
 * extractScriptContent: Recupera el texto plano del objeto JSONB de la base de datos.
 */
function extractScriptContent(script_text: any): string {
  if (!script_text) return "";
  // Priorizamos script_plain ya sanitizado por la Sala de Forja
  if (typeof script_text === 'object') {
    return script_text.script_plain || script_text.script_body || "";
  }
  // Fallback por si existe rastro de texto plano legacy
  try {
    const parsed = typeof script_text === 'string' ? JSON.parse(script_text) : script_text;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(script_text);
  }
}

/**
 * handler: Lógica central de síntesis de voz.
 */
async function handler(request: Request): Promise<Response> {
  // 1. GESTIÓN DE CORS (Protocolo rápido)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let targetPodId: number | null = null;

  try {
    const payload = await request.json();
    const { podcast_id } = payload;

    if (!podcast_id) throw new Error("PODCAST_ID_REQUIRED");
    targetPodId = podcast_id;

    console.log(`🎙️ [Audio-Worker][${correlationId}] Iniciando forja para Pod #${podcast_id}`);

    // 2. OBTENCIÓN DE DATOS MAESTROS (Fase IV)
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND");

    // 3. NORMALIZACIÓN DE TEXTO
    const rawScript = extractScriptContent(pod.script_text);
    const cleanText = cleanTextForSpeech(rawScript);

    if (!cleanText || cleanText.length < 10) throw new Error("SCRIPT_CONTENT_INSUFFICIENT");

    // 4. DIRECCIÓN ACTORAL (Grounded Prosody)
    const inputs = (pod.creation_data as any)?.inputs || {};
    const directorNote = generateDirectorNote(
      pod.creation_data?.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    const voiceParams = {
      gender: inputs.voiceGender || "Masculino",
      style: inputs.voiceStyle || "Profesional"
    };

    // 5. FRAGMENTACIÓN SEMÁNTICA (Evitar cortes de oraciones)
    const paragraphs = cleanText.split(/\n+/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const p of paragraphs) {
      if ((currentChunk.length + p.length) < MAX_CHUNK_SIZE) {
        currentChunk += (currentChunk ? "\n\n" : "") + p;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = p;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    console.log(`[Audio-Worker] Sintetizando ${chunks.length} bloques con modelo ${AI_MODELS.AUDIO}.`);

    // 6. CICLO DE SÍNTESIS CON GESTIÓN DE RAM (Fase IV)
    let audioBuffers: (Uint8Array | null)[] = [];
    let totalRawLength = 0;

    for (let i = 0; i < chunks.length; i++) {
      // Invocación al modelo 2.5 Pro TTS validado
      const { data: base64Audio } = await callGeminiAudio(chunks[i], directorNote, voiceParams);

      const buffer = new Uint8Array(decode(base64Audio).buffer);
      totalRawLength += buffer.length;
      audioBuffers.push(buffer);
    }

    // 7. ENSAMBLAJE BINARIO ATÓMICO (WAV RIFF 24kHz)
    const wavHeader = createWavHeader(totalRawLength, SAMPLE_RATE);
    const finalFile = new Uint8Array(wavHeader.length + totalRawLength);

    // Inyectamos cabecera de 44 bytes
    finalFile.set(wavHeader, 0);

    // Concatenamos y liberamos memoria instantáneamente para evitar el crash de 150MB
    let offset = wavHeader.length;
    for (let i = 0; i < audioBuffers.length; i++) {
      const chunk = audioBuffers[i];
      if (chunk) {
        finalFile.set(chunk, offset);
        offset += chunk.length;
        // Anulamos referencia para el Garbage Collector de Deno
        audioBuffers[i] = null;
      }
    }
    audioBuffers = []; // Limpieza final de punteros

    // 8. PERSISTENCIA EN STORAGE SOBERANO
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.wav`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalFile, {
        contentType: 'audio/wav',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`STORAGE_UPLOAD_ERROR: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 9. CIERRE DE CICLO DE INTEGRIDAD (Fase V)
    const duration = Math.round(totalRawLength / (SAMPLE_RATE * 2));

    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        audio_url: publicUrl,
        duration_seconds: duration,
        audio_ready: true, // Libera el semáforo tr_check_integrity
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DATABASE_SYNC_ERROR: ${updateErr.message}`);

    console.log(`✅ [Audio-Worker] Éxito para Pod #${podcast_id}. Duración: ${duration}s`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Audio-Worker-Fatal][${correlationId}]:`, error.message);

    // [FALLBACK RESILIENTE]: Marcamos la bandera para no bloquear el Dashboard
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_ready: true,
        admin_notes: `Audio Failure: ${error.message} | Trace: ${correlationId}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({
      error: error.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);