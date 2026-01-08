// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 16.0 (Production Grade: Recursive Chunking & Binary Assembly)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Importaciones con rutas relativas para compatibilidad de despliegue móvil
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";
import { VOICE_CONFIGS, SPEAKING_RATES, cleanTextForSpeech } from "../_shared/ai.ts";

const SAFE_CHUNK_LIMIT = 4500; // Límite de seguridad para Google Cloud TTS

const InvokePayloadSchema = z.object({
  job_id: z.number(),
  podcast_id: z.number(),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const payload = await request.json();
    const { podcast_id } = InvokePayloadSchema.parse(payload);

    // 1. Obtención de datos con Custodia de Datos
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('script_text, user_id, creation_data')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error(`Podcast [${podcast_id}] no accesible.`);

    // 2. Extracción y Limpieza de Guion
    let scriptContent = "";
    try {
      const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
      scriptContent = parsed.script_body || parsed.script_plain || pod.script_text;
    } catch {
      scriptContent = pod.script_text;
    }

    const cleanText = cleanTextForSpeech(scriptContent);
    if (!cleanText) throw new Error("El guion está vacío tras la limpieza.");

    // 3. Configuración de Voz desde Metadata
    const inputs = (pod.creation_data as any)?.inputs || {};
    const voiceName = VOICE_CONFIGS[inputs.voiceGender || "Masculino"]?.[inputs.voiceStyle || "Profesional"] || "es-US-Neural2-B";
    const rate = SPEAKING_RATES[inputs.voicePace || "Moderado"] || 1.0;

    console.log(`🎙️ [${correlationId}] Iniciando síntesis por Chunks para Pod: ${podcast_id}`);

    // 4. PROCESAMIENTO POR CHUNKS (FRAGMENTACIÓN)
    // Dividimos el texto en partes manejables para la API de Google
    const chunks = cleanText.match(new RegExp(`.{1,${SAFE_CHUNK_LIMIT}}(?=\\s|$)`, 'g')) || [cleanText];
    const accessToken = await getGoogleAccessToken();
    const audioBuffers: Uint8Array[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Procesando bloque ${i + 1}/${chunks.length}...`);

      const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { text: chunks[i] },
          voice: { languageCode: "es-US", name: voiceName },
          audioConfig: { audioEncoding: "MP3", speakingRate: rate }
        })
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Google TTS Fail en bloque ${i + 1}: ${errorDetail}`);
      }

      const json = await response.json();
      audioBuffers.push(new Uint8Array(decode(json.audioContent).buffer));
    }

    // 5. ENSAMBLAJE BINARIO FINAL
    const totalSize = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const finalAudioArray = new Uint8Array(totalSize);
    let offset = 0;
    for (const buffer of audioBuffers) {
      finalAudioArray.set(buffer, offset);
      offset += buffer.length;
    }

    // 6. CARGA A STORAGE (SOBREESCRITURA SEGURA)
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.mp3`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalAudioArray, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) throw new Error(`Upload Fail: ${uploadError.message}`);

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 7. ACTUALIZACIÓN DE METADATOS
    // Estimación de duración: ~12KB por segundo para MP3 de 128kbps
    const estimatedDuration = Math.round(totalSize / 12000);

    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      duration_seconds: estimatedDuration,
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    console.log(`✅ [${correlationId}] Audio generado exitosamente: ${publicUrl.publicUrl}`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl.publicUrl,
      chunks_processed: chunks.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`🔥 [Audio Error][${correlationId}]:`, err.message);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(guard(handler));