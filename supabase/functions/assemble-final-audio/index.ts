// supabase/functions/assemble-final-audio/index.ts
// VERSIÓN: 1.2 (NSP Stitcher - Memory Management & Constant Fix)
// Misión: Unir fragmentos RAW PCM de forma atómica y coronarlos con el Header WAV oficial.
// [RESOLUCIÓN]: Fix de 'Assignment to constant variable' y optimización de ensamblaje universal.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * IMPORTACIONES DEL NÚCLEO SINCRO (v13.0)
 * Utilizamos AUDIO_CONFIG para garantizar que el Header WAV coincida 1:1 con el PCM.
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
 * sleep: Utilidad para pausas tácticas en caso de latencia de propagación de red.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * handler: Orquestador del ensamblaje de alta precisión.
 */
async function handler(request: Request): Promise<Response> {
  // Protocolo CORS para pre-vuelo
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 1. VALIDACIÓN DE SEGURIDAD INTERNA (Authorization Bearer Check)
    const authHeader = request.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authHeader?.includes(serviceKey ?? "INTERNAL_ONLY")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 2. RECEPCIÓN Y NORMALIZACIÓN DE PAYLOAD
    const payload = await request.json();
    const podcast_id = Number(payload.podcast_id);
    const total_segments = Number(payload.total_segments);

    if (!podcast_id || !total_segments) {
      throw new Error("PARAMETROS_INCOMPLETOS: Se requiere podcast_id y total_segments.");
    }
    targetPodId = podcast_id;

    console.info(`🧵 [NSP-Stitcher][${correlationId}] Iniciando ensamblaje de ${total_segments} partes para Pod #${podcast_id}`);

    // 3. RECUPERACIÓN DEL MAPA BINARIO DESDE LA DB
    // Obtenemos las rutas de los archivos .raw en el orden correcto
    const { data: segments, error: segmentsError } = await supabaseAdmin
      .from('audio_segments')
      .select('storage_path, byte_size, segment_index')
      .eq('podcast_id', podcast_id)
      .order('segment_index', { ascending: true });

    if (segmentsError || !segments || segments.length !== total_segments) {
      throw new Error(`INCONSISTENCIA_DE_MALLA: Hallados ${segments?.length || 0} de ${total_segments} prometidos.`);
    }

    // 4. PRE-ASIGNACIÓN DE BUFFER MAESTRO
    // Calculamos el espacio total necesario para evitar redimensionamiento de memoria (O(1))
    const totalPcmLength = segments.reduce((acc, curr) => acc + curr.byte_size, 0);
    const HEADER_SIZE = 44;

    // Usamos 'let' para permitir la limpieza final del buffer maestro
    let finalBuffer: Uint8Array | null = new Uint8Array(HEADER_SIZE + totalPcmLength);

    // 5. INYECCIÓN DE CABECERA WAV (Frecuencia NicePod 24kHz)
    const wavHeader = createWavHeader(totalPcmLength, AUDIO_CONFIG.SAMPLE_RATE);
    finalBuffer.set(wavHeader, 0);

    // 6. BUCLE DE COSTURA BINARIA CON RESILIENCIA
    let currentOffset = HEADER_SIZE;

    for (const segment of segments) {
      let blob: Blob | null = null;
      let retries = 3;

      // Protocolo anti-latencia: Esperamos a que el Storage confirme la presencia del archivo
      while (retries > 0) {
        const { data, error } = await supabaseAdmin.storage
          .from('podcasts')
          .download(segment.storage_path);

        if (!error && data) {
          blob = data;
          break;
        }

        console.warn(`⏳ [NSP-Stitcher] Segmento ${segment.segment_index} no hallado. Reintentando en 1s...`);
        await sleep(1000);
        retries--;
      }

      if (!blob) {
        throw new Error(`STORAGE_READ_ERROR: El segmento ${segment.segment_index} no se propagó al nodo de lectura.`);
      }

      // [FIX]: Declaramos como 'let' para permitir la nulificación manual
      let segmentArray: Uint8Array | null = new Uint8Array(await blob.arrayBuffer());

      // Inyectamos el fragmento en la posición calculada
      finalBuffer.set(segmentArray, currentOffset);
      currentOffset += segmentArray.length;

      // LIBERACIÓN DE RAM INMEDIATA
      segmentArray = null;
      blob = null;
    }

    // 7. PERSISTENCIA DEL PODCAST SOBERANO
    const { data: podInfo } = await supabaseAdmin
      .from('micro_pods')
      .select('user_id')
      .eq('id', podcast_id)
      .single();

    const finalPath = `public/${podInfo?.user_id}/${podcast_id}-audio.wav`;
    console.info(`💾 [NSP-Stitcher] Subiendo archivo final a Storage: ${finalPath}`);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(finalPath, finalBuffer, {
        contentType: 'audio/wav',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`UPLOAD_FINAL_FAIL: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(finalPath);

    // 8. CIERRE DE CICLO DE INTEGRIDAD (Fase V)
    const { error: finalizeError } = await supabaseAdmin
      .from('micro_pods')
      .update({
        audio_url: publicUrl,
        audio_ready: true,            // Gatillo final para revelar el podcast
        audio_assembly_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (finalizeError) throw new Error(`DB_FINALIZE_FAIL: ${finalizeError.message}`);

    // Limpieza final de memoria
    finalBuffer = null;

    console.info(`✅ [NSP-Stitcher] Podcast #${podcast_id} ensamblado y listo para el usuario.`);

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

    // Rollback administrativo para informar del fallo en la UI
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_assembly_status: 'failed',
        admin_notes: `Stitcher Error: ${error.message} | ID: ${correlationId}`
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