// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 21.0 (Autonomous Audio Agent - Readiness Flag & Binary Assembly)

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de inteligencia de NicePod
import { callGeminiAudio, cleanTextForSpeech, createWavHeader } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { guard } from "../_shared/guard.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

/**
 * CONFIGURACIÓN TÉCNICA:
 * MAX_CHUNK_SIZE: 5000 caracteres para evitar timeouts en el modelo Flash TTS.
 */
const MAX_CHUNK_SIZE = 5000;

const PayloadSchema = z.object({
  podcast_id: z.number({ required_error: "podcast_id_is_required" })
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await request.json();
    const { podcast_id } = PayloadSchema.parse(body);

    console.log(`🎙️ [Audio-Worker][${correlationId}] Procesando activos para Pod #${podcast_id}`);

    // 1. OBTENCIÓN DE MATERIA PRIMA (Guion y Metadatos de Voz)
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("RECURSO_NO_LOCALIZADO: El podcast no existe en producción.");

    // 2. NORMALIZACIÓN NARRATIVA
    let scriptBody = "";
    try {
      const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
      scriptBody = parsed.script_body || String(parsed);
    } catch {
      scriptBody = String(pod.script_text);
    }

    const cleanText = cleanTextForSpeech(scriptBody);
    const inputs = (pod.creation_data as any)?.inputs || {};

    // 3. GENERACIÓN DE NOTA DE DIRECCIÓN ACTORAL
    const directorNote = generateDirectorNote(
      inputs.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    const voiceParams = {
      gender: inputs.voiceGender || "Masculino",
      style: inputs.voiceStyle || "Profesional"
    };

    // 4. FRAGMENTACIÓN SEMÁNTICA (Evita cortes abruptos en palabras)
    const chunks = cleanText.match(new RegExp(`.{1,${MAX_CHUNK_SIZE}}(?=\\s|$)`, 'g')) || [cleanText];
    const audioBuffers: Uint8Array[] = [];

    console.log(`[Audio-Worker] Sintetizando ${chunks.length} bloques neuronales...`);

    // 5. CICLO DE SÍNTESIS (Gemini 2.5 Flash TTS)
    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Procesando bloque ${i + 1}/${chunks.length}`);
      const { data: base64Audio } = await callGeminiAudio(chunks[i], directorNote, voiceParams);
      audioBuffers.push(new Uint8Array(decode(base64Audio).buffer));
    }

    // 6. ENSAMBLAJE BINARIO MAESTRO (WAV Container)
    const rawDataLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const wavHeader = createWavHeader(rawDataLength, 24000); // 24kHz estándar

    const finalFile = new Uint8Array(wavHeader.length + rawDataLength);
    finalFile.set(wavHeader, 0);

    let offset = wavHeader.length;
    for (const b of audioBuffers) {
      finalFile.set(b, offset);
      offset += b.length;
    }

    // 7. PERSISTENCIA EN STORAGE (Bucket: podcasts)
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.wav`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalFile, {
        contentType: 'audio/wav',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`STORAGE_FAIL: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    /**
     * 8. LEVANTAR BANDERA DE DISPONIBILIDAD (Readiness Flag)
     * [CORE]: No cambiamos el processing_status aquí. 
     * Actualizamos 'audio_ready' para que el Trigger de la DB orqueste el cierre.
     */
    const estimatedDuration = Math.round(rawDataLength / (24000 * 2)); // 16-bit Mono

    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        audio_url: publicUrl,
        duration_seconds: estimatedDuration,
        audio_ready: true, // <--- BANDERA DE COREOGRAFÍA
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DB_UPDATE_FAIL: ${updateErr.message}`);

    console.log(`✅ [Audio-Worker] Activo forjado y bandera audio_ready activada.`);

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error(`🔥 [Audio-Worker-Fatal]:`, err.message);

    // Notificamos el fallo en las notas administrativas para soporte
    await supabaseAdmin.from('micro_pods').update({
      admin_notes: `Audio Error: ${err.message} | Trace: ${correlationId}`
    }).eq('id', podcast_id);

    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));