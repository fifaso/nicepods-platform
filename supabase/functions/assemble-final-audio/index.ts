// supabase/functions/assemble-final-audio/index.ts
// VERSIÓN: 3.0 (Master Stitcher - Final Production Standard)
// Misión: Ensamblar fragmentos RAW, mezclar ambiente y coronar con cabecera WAV.
// [ESTABILIZACIÓN]: Implementación de limpieza de temporales y mezcla aditiva 24kHz.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AUDIO_CONFIG, createWavHeader } from "@/supabase/functions/_shared/ai.ts";
import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

function mixAudioBuffers(voiceBuffer: Uint8Array, ambientBuffer: Uint8Array): Uint8Array {
  const voiceSamples = new Int16Array(voiceBuffer.buffer);
  const ambientSamples = new Int16Array(ambientBuffer.buffer);
  const mixedSamples = new Int16Array(voiceSamples.length);

  for (let i = 0; i < voiceSamples.length; i++) {
    const voice = voiceSamples[i];
    const ambient = ambientSamples[i] || 0;
    // Mezcla Industrial: Voz 100% + Ambiente 35% (recalibrado para claridad)
    mixedSamples[i] = Math.max(-32768, Math.min(32767, voice + (ambient * 0.35)));
  }
  return new Uint8Array(mixedSamples.buffer);
}

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationIdentification = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let podcastId: number | null = null;

  try {
    const payload = await request.json();
    const { podcast_id, total_segments } = payload;
    podcastId = podcast_id;

    console.info(`🧵 [Stitcher][${correlationIdentification}] Iniciando para Pod #${podcast_id}`);

    // 1. Cosecha de la Malla de Segmentos
    const { data: segments } = await supabaseAdmin
      .from('audio_segments')
      .select('storage_path, byte_size')
      .eq('podcast_id', podcast_id)
      .order('segment_index', { ascending: true });

    if (!segments || segments.length < total_segments) throw new Error("MALLA_INCOMPLETA");

    // 2. Preparación del Buffer de Voz
    const totalPcmSize = segments.reduce((acc, s) => acc + s.byte_size, 0);
    const finalVoiceBuffer = new Uint8Array(totalPcmSize);
    let offset = 0;

    for (const segment of segments) {
      const { data: blob } = await supabaseAdmin.storage.from('podcasts').download(segment.storage_path);
      if (!blob) throw new Error(`ERROR_DESCARGA: ${segment.storage_path}`);
      const array = new Uint8Array(await blob.arrayBuffer());
      finalVoiceBuffer.set(array, offset);
      offset += array.length;
    }

    // 3. Verificación de Resonancia Ambiental (Madrid)
    const { data: pointOfInterestRecord } = await supabaseAdmin.from('points_of_interest').select('ambient_audio_url').eq('reference_podcast_id', podcast_id).maybeSingle();

    let outputBuffer = finalVoiceBuffer;

    if (pointOfInterestRecord?.ambient_audio_url) {
      const path = pointOfInterestRecord.ambient_audio_url.split('podcasts/')[1];
      const { data: ambBlob } = await supabaseAdmin.storage.from('podcasts').download(path);
      if (ambBlob) {
        outputBuffer = mixAudioBuffers(finalVoiceBuffer, new Uint8Array(await ambBlob.arrayBuffer()));
      }
    }

    // 4. Coronación (WAV Header 44 bytes)
    const wavHeader = createWavHeader(outputBuffer.length, AUDIO_CONFIG.SAMPLE_RATE);
    const finalFile = new Uint8Array(wavHeader.length + outputBuffer.length);
    finalFile.set(wavHeader, 0);
    finalFile.set(outputBuffer, wavHeader.length);

    // 5. Persistencia y Cierre de Ciclo
    const { data: pod } = await supabaseAdmin.from('micro_pods').select('user_id').eq('id', podcast_id).single();
    const finalPath = `public/${pod?.user_id}/${podcast_id}-audio.wav`;

    await supabaseAdmin.storage.from('podcasts').upload(finalPath, finalFile, { contentType: 'audio/wav', upsert: true });

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(finalPath);

    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl,
      audio_ready: true,
      audio_assembly_status: 'completed',
      processing_status: 'completed', // El trigger maestro detectará esto y liberará
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    // 6. HIGIENE: Limpieza de fragmentos temporales
    await supabaseAdmin.from('audio_segments').delete().eq('podcast_id', podcast_id);
    // (Opcional: Borrar carpeta temp en Storage)

    return new Response(JSON.stringify({ success: true, uniformResourceLocator: publicUrl }), { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error(`🔥 [Stitcher-Fatal]:`, error.message);
    if (podcastId) await supabaseAdmin.from('micro_pods').update({ audio_assembly_status: 'failed' }).eq('id', podcastId);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}

serve(handler);