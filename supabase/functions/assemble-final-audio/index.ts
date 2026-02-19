// supabase/functions/assemble-final-audio/index.ts
// VERSIÓN: 1.0 (NSP Stitcher - Binary Integrity Master)
// Misión: Recuperar fragmentos RAW PCM, concatenarlos y generar el archivo WAV maestro.
// [ESTABILIZACIÓN]: Implementación de unión byte-a-byte para eliminar ruidos de transición.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * IMPORTACIONES DEL NÚCLEO SINCRO (v12.5)
 * Utilizamos AUDIO_CONFIG para asegurar que la cabecera WAV coincida con los fragmentos.
 */
import {
  AUDIO_CONFIG,
  createWavHeader
} from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * INICIALIZACIÓN DE CLIENTE SUPABASE ADMIN
 * Necesario para operaciones de lectura/escritura en Storage y Tablas de Sistema.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: Especialista en ensamblaje binario de alta precisión.
 */
async function handler(request: Request): Promise<Response> {
  // 1. GESTIÓN DE CORS
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 2. VALIDACIÓN DE SEGURIDAD (Internal Service Only)
    const authHeader = request.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authHeader?.includes(serviceKey ?? "SECURED")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 3. RECEPCIÓN DE SOLICITUD DE COSTURA
    const payload = await request.json();
    const { podcast_id, total_segments } = payload;

    if (!podcast_id || !total_segments) {
      throw new Error("DATOS_DE_ENSAMBLAJE_INCOMPLETOS");
    }
    targetPodId = podcast_id;

    console.log(`🧵 [NSP-Stitcher][${correlationId}] Iniciando costura de ${total_segments} fragmentos para Pod #${podcast_id}`);

    // 4. RECUPERACIÓN DEL MAPA BINARIO
    // Obtenemos las rutas de los archivos .raw ordenadas por su índice secuencial.
    const { data: segments, error: segmentsError } = await supabaseAdmin
      .from('audio_segments')
      .select('storage_path, byte_size, segment_index')
      .eq('podcast_id', podcast_id)
      .order('segment_index', { ascending: true });

    if (segmentsError || !segments || segments.length !== total_segments) {
      throw new Error(`INCONSISTENCIA_DE_SEGMENTOS: Se esperaban ${total_segments} pero se hallaron ${segments?.length || 0}`);
    }

    // 5. CÁLCULO DE CAPACIDAD TOTAL
    // Determinamos el tamaño final del archivo para realizar una pre-asignación de memoria eficiente.
    const totalPcmLength = segments.reduce((acc, curr) => acc + curr.byte_size, 0);
    const headerSize = 44; // Estándar RIFF/WAVE

    // Pre-asignamos el buffer final (Evita re-allocations costosas en CPU)
    const finalBuffer = new Uint8Array(headerSize + totalPcmLength);

    // 6. INYECCIÓN DE CABECERA MAESTRA
    // Generamos el WAV Header basado en el tamaño total acumulado.
    const wavHeader = createWavHeader(totalPcmLength, AUDIO_CONFIG.SAMPLE_RATE);
    finalBuffer.set(wavHeader, 0);

    // 7. PROCESO DE UNIÓN QUIRÚRGICA (Byte-by-Byte)
    let currentOffset = headerSize;

    for (const segment of segments) {
      console.log(`   > Descargando e inyectando segmento ${segment.segment_index}...`);

      const { data: blob, error: downloadError } = await supabaseAdmin.storage
        .from('podcasts')
        .download(segment.storage_path);

      if (downloadError || !blob) {
        throw new Error(`FALLO_DESCARGA_SEGMENTO_${segment.segment_index}: ${downloadError?.message}`);
      }

      // Convertimos el BLOB a Uint8Array para manipulación binaria
      const segmentArray = new Uint8Array(await blob.arrayBuffer());

      // Inyectamos el fragmento en su posición exacta en el buffer maestro
      finalBuffer.set(segmentArray, currentOffset);
      currentOffset += segmentArray.length;

      // [LIBERACIÓN]: Ayudamos al recolector de basura anulando el buffer temporal
      (segmentArray as any) = null;
    }

    // 8. PERSISTENCIA DEL PODCAST SOBERANO
    // Guardamos la pieza única final en la carpeta pública del usuario.
    const { data: podInfo } = await supabaseAdmin.from('micro_pods').select('user_id').eq('id', podcast_id).single();
    const finalPath = `public/${podInfo?.user_id}/${podcast_id}-audio.wav`;

    console.log(`💾 [NSP-Stitcher] Subiendo archivo final a: ${finalPath}`);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(finalPath, finalBuffer, {
        contentType: 'audio/wav',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`UPLOAD_FINAL_FAIL: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(finalPath);

    // 9. CIERRE DE CICLO DE INTEGRIDAD (Fase V)
    // Sincronizamos todas las banderas para liberar la UI del usuario.
    const { error: finalizeError } = await supabaseAdmin
      .from('micro_pods')
      .update({
        audio_url: publicUrl,
        audio_ready: true,
        audio_assembly_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (finalizeError) throw finalizeError;

    // [ELIMINACIÓN DIFERIDA]: 
    // Los segmentos quedan en la tabla 'audio_segments' con status 'uploaded'.
    // No los borramos físicamente del Storage aquí según instrucciones del Comandante.
    // Quedan listos para el proceso de purga una vez el usuario valide la escucha.

    console.log(`✅ [NSP-Stitcher] Podcast #${podcast_id} ensamblado y publicado con éxito.`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      total_bytes: finalBuffer.length,
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [NSP-Stitcher-Fatal][${correlationId}]:`, error.message);

    // Rollback de estado para informar al usuario
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