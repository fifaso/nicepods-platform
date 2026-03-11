// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 3.0 (NSP Harvester - High-Precision Duration & Sync Standard)
// Misión: Cosechar audio neuronal, calcular métricas de duración y sembrar binarios.
// [ESTABILIZACIÓN]: Implementación de algoritmo de cálculo de duración (PCM to Seconds).

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

import { callGeminiAudio, cleanTextForSpeech } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

// Protocolo NSP: Estándares de audio industrial
const MAX_CHUNK_SIZE = 3800;
const HEADER_BYTE_SIZE = 44;
const SAMPLE_RATE = 24000;
const BYTES_PER_SAMPLE = 2; // 16-bit = 2 bytes
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

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let totalBytesHarvested = 0;

  try {
    const payload = await request.json();
    const { podcast_id } = payload;
    if (!podcast_id) throw new Error("ID_DEL_PODCAST_REQUERIDO");

    console.info(`📡 [NSP-Harvester][${correlationId}] Iniciando forja para Pod #${podcast_id}`);

    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("PODCAST_NO_ENCONTRADO");

    const cleanText = cleanTextForSpeech(extractScript(pod.script_text));
    const inputs = (pod.creation_data as any)?.inputs || {};
    const directorNote = generateDirectorNote(pod.creation_data?.agentName || "narrador", inputs.voiceGender || "Masculino", inputs.voiceStyle || "Profesional", inputs.voicePace || "Moderado");

    // Segmentación profesional (respetando estructura lógica)
    const textChunks: string[] = cleanText.match(new RegExp(`.{1,${MAX_CHUNK_SIZE}}(\\s|$)`, 'g')) || [cleanText];

    await supabaseAdmin.from('micro_pods').update({
      total_audio_segments: textChunks.length,
      current_audio_segments: 0,
      audio_assembly_status: 'collecting',
      audio_ready: false
    }).eq('id', podcast_id);

    for (let i = 0; i < textChunks.length; i++) {
      const { data: base64Audio } = await callGeminiAudio(textChunks[i], directorNote, { gender: inputs.voiceGender || "Masculino", style: inputs.voiceStyle || "Profesional" });

      const fullBuffer = new Uint8Array(decode(base64Audio).buffer);
      const rawPcmData = fullBuffer.slice(HEADER_BYTE_SIZE);

      totalBytesHarvested += rawPcmData.length;

      const segmentPath = `temp/segments/${podcast_id}/part_${i}.raw`;
      await supabaseAdmin.storage.from('podcasts').upload(segmentPath, rawPcmData, { contentType: 'application/octet-stream', upsert: true });

      await supabaseAdmin.from('audio_segments').insert({
        podcast_id: podcast_id, segment_index: i, storage_path: segmentPath, byte_size: rawPcmData.length, status: 'uploaded'
      });
    }

    // [CÁLCULO DE DURACIÓN]: Matemática de precisión para el sistema de UI
    const estimatedDuration = Math.round(totalBytesHarvested / BYTES_PER_SECOND);

    await supabaseAdmin.from('micro_pods').update({
      duration_seconds: estimatedDuration,
      audio_assembly_status: 'collecting' // El trigger final ensamblará y marcará como 'completed'
    }).eq('id', podcast_id);

    return new Response(JSON.stringify({ success: true, duration: estimatedDuration }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [NSP-Harvester-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}

serve(handler);