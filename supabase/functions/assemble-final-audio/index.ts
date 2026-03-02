// supabase/functions/assemble-final-audio/index.ts
// VERSIÓN: 2.0

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// --- INFRAESTRUCTURA ACÚSTICA (NÚCLEO SINCRO v13.0) ---
import { AUDIO_CONFIG, createWavHeader } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CLIENTE SUPABASE ADMIN
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * FUNCIÓN: mixAudioBuffers
 * Misión: Mezclar dos señales PCM 16-bit Mono.
 * [TÉCNICA]: Suma de amplitudes con normalización para evitar saturación (clipping).
 */
function mixAudioBuffers(voiceBuffer: Uint8Array, ambientBuffer: Uint8Array): Uint8Array {
  // Convertimos los Uint8Array (8 bits) a Int16Array (16 bits) para procesar amplitudes reales.
  const voiceSamples = new Int16Array(voiceBuffer.buffer);
  const ambientSamples = new Int16Array(ambientBuffer.buffer);

  const resultLength = voiceSamples.length;
  const mixedSamples = new Int16Array(resultLength);

  for (let i = 0; i < resultLength; i++) {
    const voice = voiceSamples[i];
    // Si el audio ambiente es más corto, usamos silencio (0). 
    // Si es más largo, se trunca al final de la voz.
    const ambient = ambientSamples[i] || 0;

    /**
     * FÓRMULA DE MEZCLA INDUSTRIAL:
     * Mezclamos la voz al 100% y el ambiente al 40% (0.4) para asegurar 
     * que la narrativa sea siempre la protagonista.
     */
    mixedSamples[i] = Math.max(-32768, Math.min(32767, voice + (ambient * 0.4)));
  }

  return new Uint8Array(mixedSamples.buffer);
}

/**
 * handler: El Orquestador del Ensamblaje Final.
 */
async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 1. VALIDACIÓN DE AUTORIDAD
    const authHeader = request.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authHeader?.includes(serviceKey ?? "INTERNAL_ONLY")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 2. RECEPCIÓN DE PARÁMETROS
    const payload = await request.json();
    const { podcast_id, total_segments } = payload;
    if (!podcast_id || !total_segments) throw new Error("PARAMETROS_INCOMPLETOS");
    targetPodId = podcast_id;

    console.info(`🧵 [Master-Stitcher][${correlationId}] Iniciando ensamble para Pod #${podcast_id}`);

    // 3. RECUPERACIÓN DE LA MALLA BINARIA
    const { data: segments, error: segError } = await supabaseAdmin
      .from('audio_segments')
      .select('storage_path, byte_size')
      .eq('podcast_id', podcast_id)
      .order('segment_index', { ascending: true });

    if (segError || segments.length !== total_segments) {
      throw new Error(`INCONSISTENCIA_DE_MALLA: Hallados ${segments?.length} de ${total_segments}`);
    }

    // 4. ¿EXISTE AUDIO AMBIENTAL? (Estrategia Retiro Resonance)
    // Buscamos si este podcast está vinculado a un POI con sonido real.
    const { data: poiData } = await supabaseAdmin
      .from('points_of_interest')
      .select('ambient_audio_url')
      .eq('reference_podcast_id', podcast_id)
      .maybeSingle();

    // 5. PRE-ASIGNACIÓN DE MEMORIA (Rigor de RAM)
    const totalVoicePcmLength = segments.reduce((acc, curr) => acc + curr.byte_size, 0);
    const HEADER_SIZE = 44;

    // Buffer para la voz de la IA
    let finalVoiceBuffer = new Uint8Array(totalVoicePcmLength);
    let currentOffset = 0;

    // 6. BUCLE DE DESCARGA Y COSTURA DE VOZ
    for (const segment of segments) {
      let retries = 3;
      let blob = null;

      while (retries > 0) {
        const { data, error } = await supabaseAdmin.storage.from('podcasts').download(segment.storage_path);
        if (!error && data) { blob = data; break; }
        await sleep(1000);
        retries--;
      }

      if (!blob) throw new Error(`STORAGE_READ_FAIL: Segmento ${segment.storage_path}`);

      const segmentArray = new Uint8Array(await blob.arrayBuffer());
      finalVoiceBuffer.set(segmentArray, currentOffset);
      currentOffset += segmentArray.length;
    }

    // 7. FASE DE MEZCLA (Si aplica)
    let finalOutputBuffer: Uint8Array;

    if (poiData?.ambient_audio_url) {
      console.info(`🍃 [Master-Stitcher] Detectado Audio Ambiental. Iniciando mezcla inmersiva.`);

      const { data: ambientBlob, error: ambError } = await supabaseAdmin.storage
        .from('podcasts')
        .download(poiData.ambient_audio_url.split('podcasts/')[1]);

      if (!ambError && ambientBlob) {
        const ambientArray = new Uint8Array(await ambientBlob.arrayBuffer());
        // Mezclamos la voz con el fondo real del Retiro
        finalOutputBuffer = mixAudioBuffers(finalVoiceBuffer, ambientArray);
      } else {
        console.warn("⚠️ Falló descarga de ambiente, procediendo solo con voz IA.");
        finalOutputBuffer = finalVoiceBuffer;
      }
    } else {
      finalOutputBuffer = finalVoiceBuffer;
    }

    // 8. CORONACIÓN (HEADER WAV)
    const totalPcmLength = finalOutputBuffer.length;
    const finalFileBuffer = new Uint8Array(HEADER_SIZE + totalPcmLength);
    const wavHeader = createWavHeader(totalPcmLength, AUDIO_CONFIG.SAMPLE_RATE);

    finalFileBuffer.set(wavHeader, 0);
    finalFileBuffer.set(finalOutputBuffer, HEADER_SIZE);

    // 9. PERSISTENCIA SOBERANA
    const { data: podRecord } = await supabaseAdmin.from('micro_pods').select('user_id').eq('id', podcast_id).single();
    const finalPath = `public/${podRecord?.user_id}/${podcast_id}-audio.wav`;

    console.info(`💾 [Master-Stitcher] Subiendo crónica final: ${finalPath}`);
    const { error: uploadError } = await supabaseAdmin.storage.from('podcasts').upload(finalPath, finalFileBuffer, {
      contentType: 'audio/wav',
      upsert: true
    });

    if (uploadError) throw new Error(`UPLOAD_FAIL: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(finalPath);

    // 10. CIERRE DE CICLO DE INTEGRIDAD
    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl,
      audio_ready: true,
      audio_assembly_status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    console.info(`✅ [Master-Stitcher] Misión completada para Pod #${podcast_id}.`);

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Master-Stitcher-Fatal][${correlationId}]:`, error.message);
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_assembly_status: 'failed',
        admin_notes: `Stitcher Error: ${error.message}`
      }).eq('id', targetPodId);
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}

serve(handler);

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Mezcla Lineal: La función 'mixAudioBuffers' procesa la señal a nivel de 
 *    muestra (sample), multiplicando el ambiente por 0.4 para crear una 
 *    'cama de sonido' que no opaque la voz neuronal.
 * 2. Gestión de Memoria: El uso de Int16Array para el cálculo y Uint8Array 
 *    para el transporte es la forma más eficiente de manejar binarios en JS, 
 *    manteniendo la función dentro del límite de 150MB de Supabase Edge.
 * 3. Atomicidad: Al actualizar 'audio_ready = true' al final del proceso, 
 *    disparamos el semáforo que libera el podcast en la UI del usuario Voyager.
 */