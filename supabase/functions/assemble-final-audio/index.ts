// supabase/functions/assemble-final-audio/index.ts
// VERSIÓN: 1.1 (NSP Stitcher - Latency Resilience & Precision Edition)
// Misión: Unir fragmentos RAW PCM de forma atómica y coronarlos con el Header WAV oficial.
// [ESTABILIZACIÓN]: Implementación de reintentos de descarga para mitigar latencia de Storage.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * IMPORTACIONES DEL NÚCLEO SINCRO (v12.5)
 * AUDIO_CONFIG garantiza que el Header WAV coincida 1:1 con los fragmentos de Gemini.
 */
import {
  AUDIO_CONFIG,
  createWavHeader
} from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * INICIALIZACIÓN DE CLIENTE SUPABASE ADMIN
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * sleep: Utilidad para pausas tácticas entre reintentos.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * handler: Orquestador de la costura binaria.
 */
async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 1. VALIDACIÓN DE SEGURIDAD INTERNA
    const authHeader = request.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authHeader?.includes(serviceKey ?? "SECURED_ENVIRONMENT")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 2. RECEPCIÓN DE SOLICITUD
    const payload = await request.json();
    const podcast_id = Number(payload.podcast_id);
    const total_segments = Number(payload.total_segments);

    if (!podcast_id || !total_segments) {
      throw new Error("PARAMETROS_INCOMPLETOS: podcast_id y total_segments requeridos.");
    }
    targetPodId = podcast_id;

    console.log(`🧵 [NSP-Stitcher][${correlationId}] Iniciando costura de ${total_segments} fragmentos para Pod #${podcast_id}`);

    // 3. RECUPERACIÓN DEL MAPA BINARIO
    const { data: segments, error: segmentsError } = await supabaseAdmin
      .from('audio_segments')
      .select('storage_path, byte_size, segment_index')
      .eq('podcast_id', podcast_id)
      .order('segment_index', { ascending: true });

    if (segmentsError || !segments || segments.length !== total_segments) {
      throw new Error(`INCONSISTENCIA_DE_MAPA: Se hallaron ${segments?.length || 0} de ${total_segments} esperados.`);
    }

    // 4. PRE-ASIGNACIÓN DE MEMORIA (Eficiencia O(1) en Alloc)
    const totalPcmLength = segments.reduce((acc, curr) => acc + curr.byte_size, 0);
    const HEADER_SIZE = 44;
    const finalBuffer = new Uint8Array(HEADER_SIZE + totalPcmLength);

    // 5. INYECCIÓN DE CABECERA MAESTRA (Frecuencia 24kHz)
    const wavHeader = createWavHeader(totalPcmLength, AUDIO_CONFIG.SAMPLE_RATE);
    finalBuffer.set(wavHeader, 0);

    // 6. BUCLE DE ENSAMBLAJE CON PROTOCOLO DE RESILIENCIA
    let currentOffset = HEADER_SIZE;

    for (const segment of segments) {
      let blob = null;
      let retries = 3;

      // Protocolo de espera por propagación de Storage
      while (retries > 0) {
        const { data, error } = await supabaseAdmin.storage
          .from('podcasts')
          .download(segment.storage_path);

        if (!error && data) {
          blob = data;
          break;
        }

        console.warn(`⏳ [NSP-Stitcher] Reintentando descarga de segmento ${segment.segment_index}... (${retries} restantes)`);
        await sleep(1000);
        retries--;
      }

      if (!blob) {
        throw new Error(`ERROR_DESC_SEGMENTO_${segment.segment_index}: El archivo no se propagó a tiempo.`);
      }

      const segmentArray = new Uint8Array(await blob.arrayBuffer());
      finalBuffer.set(segmentArray, currentOffset);
      currentOffset += segmentArray.length;

      // Liberación manual de memoria intermedia
      (segmentArray as any) = null;
    }

    // 7. PERSISTENCIA DEL PODCAST SOBERANO
    const { data: podInfo } = await supabaseAdmin
      .from('micro_pods')
      .select('user_id')
      .eq('id', podcast_id)
      .single();

    const finalPath = `public/${podInfo?.user_id}/${podcast_id}-audio.wav`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(finalPath, finalBuffer, {
        contentType: 'audio/wav',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`UPLOAD_FINAL_FAIL: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(finalPath);

    // 8. CIERRE DE CICLO DE INTEGRIDAD (Handover a UI)
    const { error: finalizeError } = await supabaseAdmin
      .from('micro_pods')
      .update({
        audio_url: publicUrl,
        audio_ready: true, // Esto dispara el tr_check_integrity final
        audio_assembly_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (finalizeError) throw finalizeError;

    console.log(`✅ [NSP-Stitcher] Podcast #${podcast_id} forjado y publicado.`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [NSP-Stitcher-Fatal][${correlationId}]:`, error.message);

    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_assembly_status: 'failed',
        admin_notes: `Stitcher Error: ${error.message} | Trace: ${correlationId}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({ error: error.message, trace_id: correlationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);