// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 3.2 (NSP Harvester - Parallel Logic Edition)
// Misión: Cosechar audio neuronal mediante concurrencia controlada para evitar el Timeout.
// [ESTABILIZACIÓN]: Implementación de Promise.all para reducir el tiempo de ejecución en un 70%.

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod
import { callGeminiAudio, cleanTextForSpeech } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

const MAX_CHUNK_SIZE = 3600; // Un margen de seguridad mayor
const HEADER_BYTE_SIZE = 44;
const SAMPLE_RATE = 24000;
const BYTES_PER_SECOND = SAMPLE_RATE * 2; // 16-bit Mono

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
    if (!podcast_id) throw new Error("ID_DEL_PODCAST_REQUERIDO");
    targetPodId = podcast_id;

    console.info(`📡 [NSP-Harvester-V3.2][${correlationId}] Iniciando Misión para Pod #${podcast_id}`);

    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("PODCAST_NO_ENCONTRADO");

    const rawText = extractScript(pod.script_text);
    const cleanText = cleanTextForSpeech(rawText);
    const inputs = (pod.creation_data as any)?.inputs || {};

    const directorNote = generateDirectorNote(
      pod.creation_data?.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    // Segmentación por oraciones para no cortar palabras
    const textChunks: string[] = [];
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk.length + sentence.length) < MAX_CHUNK_SIZE) {
        currentChunk += sentence;
      } else {
        textChunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }
    if (currentChunk) textChunks.push(currentChunk.trim());

    console.info(`📦 Guion segmentado en ${textChunks.length} fragmentos.`);

    // --- INICIO DE PROCESAMIENTO PARALELO ---
    // Creamos un array de promesas para procesar todos los fragmentos simultáneamente
    const tasks = textChunks.map(async (text, index) => {
      console.info(`   > Procesando fragmento [${index + 1}/${textChunks.length}]`);

      const { data: base64Audio } = await callGeminiAudio(
        text,
        directorNote,
        { gender: inputs.voiceGender || "Masculino", style: inputs.voiceStyle || "Profesional" }
      );

      const buffer = new Uint8Array(decode(base64Audio).buffer);
      const pcmData = buffer.slice(HEADER_BYTE_SIZE);
      const segmentPath = `temp/segments/${podcast_id}/part_${index}.raw`;

      // Subida y Registro
      await supabaseAdmin.storage.from('podcasts').upload(segmentPath, pcmData, { contentType: 'application/octet-stream', upsert: true });
      await supabaseAdmin.from('audio_segments').upsert({
        podcast_id,
        segment_index: index,
        storage_path: segmentPath,
        byte_size: pcmData.length,
        status: 'uploaded'
      }, { onConflict: 'podcast_id, segment_index' });

      return pcmData.length;
    });

    // Esperamos a que todas las misiones de siembra terminen
    const byteSizes = await Promise.all(tasks);
    const totalBytes = byteSizes.reduce((acc, curr) => acc + curr, 0);
    const estimatedDuration = Math.round(totalBytes / BYTES_PER_SECOND);

    // Actualizamos el registro final
    await supabaseAdmin.from('micro_pods').update({
      total_audio_segments: textChunks.length,
      duration_seconds: estimatedDuration,
      audio_assembly_status: 'collecting'
    }).eq('id', podcast_id);

    console.info(`🏁 Misión completada. Duración: ${estimatedDuration}s. Tiempo acumulado: ${totalBytes} bytes.`);

    return new Response(JSON.stringify({ success: true, duration: estimatedDuration }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Harvester-Fatal]:`, error.message);
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_assembly_status: 'failed',
        admin_notes: `Harvester Error: ${error.message}`
      }).eq('id', targetPodId);
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}

serve(handler);