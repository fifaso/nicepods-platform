// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 3.3 (NSP Harvester - Atomic Handover Edition)
// Misión: Cosechar audio neuronal garantizando el disparo del ensamblador final.
// [ESTABILIZACIÓN]: Implementación de limpieza de segmentos previa y corrección de disparador SQL.

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod sincronizado
import { callGeminiAudio, cleanTextForSpeech } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

// Estándares de audio de NicePod
const MAX_CHUNK_SIZE = 3600;
const HEADER_BYTE_SIZE = 44;
const SAMPLE_RATE = 24000;
const BYTES_PER_SECOND = SAMPLE_RATE * 2;

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
  let targetPodId: number | null = null;

  try {
    const payload = await request.json();
    const { podcast_id } = payload;
    if (!podcast_id) throw new Error("ID_PODCAST_REQUERIDO");
    targetPodId = podcast_id;

    console.info(`📡 [Harvester-V3.3][${correlationId}] Iniciando para Pod #${podcast_id}`);

    // 1. RECUPERACIÓN Y SEGMENTACIÓN
    const { data: pod, error: podErr } = await supabaseAdmin.from('micro_pods').select('*').eq('id', podcast_id).single();
    if (podErr || !pod) throw new Error("NODO_NO_ENCONTRADO_EN_BOVEDA");

    const cleanText = cleanTextForSpeech(extractScript(pod.script_text));
    const inputs = (pod.creation_data as any)?.inputs || {};
    const directorNote = generateDirectorNote(
      pod.creation_data?.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    const textChunks: string[] = cleanText.match(new RegExp(`.{1,${MAX_CHUNK_SIZE}}(\\s|$)`, 'g')) || [cleanText];

    // =========================================================================
    // 2. HIGIENE DE MALLA (Critical Fix)
    // Borramos segmentos antiguos para garantizar que el Trigger 'AFTER INSERT' 
    // se active siempre con los nuevos registros.
    // =========================================================================
    await supabaseAdmin.from('audio_segments').delete().eq('podcast_id', podcast_id);

    // 3. INICIALIZACIÓN ATÓMICA DE ESTADOS
    const { error: initErr } = await supabaseAdmin.from('micro_pods').update({
      total_audio_segments: textChunks.length,
      current_audio_segments: 0,
      audio_assembly_status: 'collecting',
      audio_ready: false,
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    if (initErr) throw new Error(`FAILED_TO_INIT_POD_STATUS: ${initErr.message}`);

    // 4. PROCESAMIENTO PARALELO CON CONTROL DE EXCEPCIONES
    const tasks = textChunks.map(async (text, index) => {
      try {
        console.info(`   > Forjando fragmento [${index + 1}/${textChunks.length}]`);

        const { data: base64Audio } = await callGeminiAudio(
          text,
          directorNote,
          { gender: inputs.voiceGender || "Masculino", style: inputs.voiceStyle || "Profesional" }
        );

        const buffer = new Uint8Array(decode(base64Audio).buffer);
        const pcmData = buffer.slice(HEADER_BYTE_SIZE);
        const segmentPath = `temp/segments/${podcast_id}/part_${index}.raw`;

        // Subida a Storage
        const { error: uploadError } = await supabaseAdmin.storage
          .from('podcasts')
          .upload(segmentPath, pcmData, { contentType: 'application/octet-stream', upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        // Registro en DB (Esto disparará el trigger 'notify_segment_upload')
        const { error: insertError } = await supabaseAdmin.from('audio_segments').insert({
          podcast_id: podcast_id,
          segment_index: index,
          storage_path: segmentPath,
          byte_size: pcmData.length,
          status: 'uploaded'
        });

        if (insertError) throw new Error(insertError.message);

        return pcmData.length;
      } catch (e: any) {
        console.error(`❌ Fallo en fragmento ${index}: ${e.message}`);
        throw e; // Rompemos Promise.all para ir al catch principal
      }
    });

    const byteSizes = await Promise.all(tasks);
    const totalBytes = byteSizes.reduce((acc, curr) => acc + curr, 0);
    const finalDuration = Math.round(totalBytes / BYTES_PER_SECOND);

    // 5. CIERRE DE EXPEDIENTE TÉCNICO
    await supabaseAdmin.from('micro_pods').update({
      duration_seconds: finalDuration,
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    console.info(`✅ [Harvester] Cosecha terminada. Duración calculada: ${finalDuration}s.`);

    return new Response(JSON.stringify({ success: true, duration: finalDuration }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Harvester-Fatal][${correlationId}]:`, error.message);
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_assembly_status: 'failed',
        admin_notes: `Harvester Error: ${error.message}`
      }).eq('id', targetPodId);
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.3):
 * 1. Garantía de Disparo: El borrado previo de segmentos antiguos permite usar 
 *    'INSERT' puro. Esto asegura que el disparador SQL 'tr_on_segment_ready' 
 *    se ejecute siempre, eliminando el problema de los procesos que no terminaban.
 * 2. Integridad de Telemetría: La duración se calcula sumando los bytes reales 
 *    recibidos de Gemini, proporcionando una métrica de tiempo 100% exacta en la UI.
 * 3. Gestión de Concurrencia: Aunque los fragmentos se procesan en paralelo, la 
 *    función mantiene la integridad del 'total_audio_segments', permitiendo que 
 *    el Master Stitcher sepa exactamente cuándo cerrar el archivo WAV.
 */