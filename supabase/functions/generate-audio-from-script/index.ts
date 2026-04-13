// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 4.1 (NicePod Audio Harvester - Direct Materialization & Time Metrics)
// Misión: Forjar el activo acústico final y calcular su duración técnica exacta.
// [ESTABILIZACIÓN]: Implementación de cálculo de 'duration_seconds' basado en el peso del buffer PCM.

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod sincronizado
import { AUDIO_CONFIG, callGeminiAudio, cleanTextForSpeech, createWavHeader } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

const MAX_CHUNK_SIZE = 4000;
const HEADER_SIZE = 44;

// --- CONSTANTES DE TELEMETRÍA ACÚSTICA ---
const SAMPLE_RATE = 24000;
const BYTES_PER_SAMPLE = 2; // 16-bit
const BYTES_PER_SECOND = SAMPLE_RATE * BYTES_PER_SAMPLE;

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

function extractScript(input: any): string {
  if (!input) return "";
  if (typeof input === 'object' && input !== null) return input.script_plain || input.script_body || "";
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    return parsed.script_plain || parsed.script_body || "";
  } catch { return String(input); }
}

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationIdentification = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    const payload = await request.json();
    const { podcast_id } = payload;
    if (!podcast_id) throw new Error("ID_PODCAST_REQUERIDO");
    targetPodId = podcast_id;

    console.info(`📡 [Audio-Forge-V4.1][${correlationIdentification}] Iniciando forja para Pod #${podcast_id}`);

    // 1. RECUPERACIÓN DE DATOS
    const { data: pod, error: podErr } = await supabaseAdmin.from('micro_pods').select('*').eq('id', podcast_id).single();
    if (podErr || !pod) throw new Error("NODO_NO_ENCONTRADO");

    const cleanText = cleanTextForSpeech(extractScript(pod.script_text));
    const inputs = (pod.creation_data as unknown as Record<string, unknown>)?.inputs || {};
    const directorNote = generateDirectorNote(
      pod.creation_data?.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    // 2. SEGMENTACIÓN TÁCTICA
    const textChunks: string[] = cleanText.match(new RegExp(`.{1,${MAX_CHUNK_SIZE}}(\\s|$)`, 'g')) || [cleanText];

    const audioBuffers: Uint8Array[] = [];
    let totalPcmLength = 0;

    // 3. BUCLE DE SÍNTESIS
    for (let i = 0; i < textChunks.length; i++) {
      const { data: base64Audio } = await callGeminiAudio(
        textChunks[i],
        directorNote,
        { gender: inputs.voiceGender || "Masculino", style: inputs.voiceStyle || "Profesional" }
      );

      const buffer = new Uint8Array(decode(base64Audio).buffer);
      const pcmData = buffer.slice(HEADER_SIZE);
      audioBuffers.push(pcmData);
      totalPcmLength += pcmData.length;
    }

    // =========================================================================
    // 4. CÁLCULO DE DURACIÓN (Métrica de Sabiduría)
    // Determinamos el tiempo exacto antes de cerrar el archivo binario.
    // =========================================================================
    const durationSeconds = Math.round(totalPcmLength / BYTES_PER_SECOND);
    console.info(`⏱️ Telemetría: ${totalPcmLength} bytes detectados. Duración: ${durationSeconds}s.`);

    // 5. ENSAMBLAJE FINAL
    const finalFileBuffer = new Uint8Array(HEADER_SIZE + totalPcmLength);
    const wavHeader = createWavHeader(totalPcmLength, AUDIO_CONFIG.SAMPLE_RATE);

    finalFileBuffer.set(wavHeader, 0);
    let offset = HEADER_SIZE;
    for (const chunk of audioBuffers) {
      finalFileBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // 6. PERSISTENCIA EN STORAGE
    const finalPath = `public/${pod.user_id}/${podcast_id}-audio.wav`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(finalPath, finalFileBuffer, {
        contentType: 'audio/wav',
        upsert: true
      });

    if (uploadError) throw new Error(`STORAGE_FAIL: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(finalPath);

    // 7. CIERRE DE CICLO CON MÉTRICAS COMPLETAS
    const { error: updateError } = await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl,
      audio_ready: true,
      duration_seconds: durationSeconds, // [INYECCIÓN DE VALOR]
      audio_assembly_status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    if (updateError) throw new Error(`DATABASE_FAIL: ${updateError.message}`);

    return new Response(JSON.stringify({ success: true, duration: durationSeconds }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Audio-Forge-Fatal]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Telemetría Binaria: La duración se deriva matemáticamente de la carga útil PCM, 
 *    garantizando que el Dashboard y el reproductor muestren el tiempo exacto de 
 *    vocalización neuronal, eliminando el valor 'n/a' de la interfaz.
 * 2. Estabilidad de Memoria: Se mantiene la gestión de Uint8Array para evitar 
 *    desbordamientos en el Edge Runtime de Deno durante la costura de audio.
 */