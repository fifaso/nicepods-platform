// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 17.0 (Master Journey Engine - Native Gemini Audio & Director's Note)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Importaciones Estratégicas
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { callGeminiAudio, cleanTextForSpeech } from "../_shared/ai.ts";
import { generateDirectorNote, PersonalityType, VoiceGender, VoiceStyle, VoicePace } from "../_shared/vocal-director-map.ts";

/**
 * Límite de seguridad para Gemini Audio. 
 * Aunque soporta más que el TTS tradicional, fragmentamos en 10k caracteres 
 * para garantizar una latencia de respuesta controlada y evitar Timeouts del borde.
 */
const COGNITIVE_CHUNK_LIMIT = 10000;

const InvokePayloadSchema = z.object({
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

    // 1. OBTENCIÓN DE DATOS (Custodia de Datos)
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('script_text, user_id, creation_data')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error(`Podcast [${podcast_id}] no accesible en DB.`);

    // 2. EXTRACCIÓN Y LIMPIEZA DE GUION
    let scriptContent = "";
    try {
      const parsed = typeof pod.script_text === 'string' ? JSON.parse(pod.script_text) : pod.script_text;
      scriptContent = parsed.script_body || parsed.script_plain || pod.script_text;
    } catch {
      scriptContent = pod.script_text;
    }

    const cleanText = cleanTextForSpeech(scriptContent);
    if (!cleanText) throw new Error("CRITICAL: Guion vacío tras limpieza de seguridad.");

    // 3. GENERACIÓN DE NOTA DE DIRECCIÓN (Performance Engine)
    // Extraemos las preferencias del usuario o usamos la "Configuración Áurea"
    const inputs = (pod.creation_data as any)?.inputs || {};
    const personality = (inputs.agentName || "narrador") as PersonalityType;
    const gender = (inputs.voiceGender || "Masculino") as VoiceGender;
    const style = (inputs.voiceStyle || "Profesional") as VoiceStyle;
    const pace = (inputs.voicePace || "Moderado") as VoicePace;

    const directorNote = generateDirectorNote(personality, gender, style, pace);

    console.log(`🎭 [${correlationId}] Iniciando Interpretación: ${personality} | ${gender} | ${style}`);

    // 4. PROCESAMIENTO NATIVO GEMINI (Recursive Chunking)
    // Dividimos por párrafos para no romper la fluidez de la interpretación
    const chunks = cleanText.match(new RegExp(`.{1,${COGNITIVE_CHUNK_LIMIT}}(?=\\s|$)`, 'g')) || [cleanText];
    const audioBuffers: Uint8Array[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Interpretando bloque ${i + 1}/${chunks.length}...`);

      // Llamamos a la nueva función nativa en ai.ts
      const base64Audio = await callGeminiAudio(chunks[i], directorNote);

      if (!base64Audio) throw new Error(`IA_AUDIO_FAIL: El bloque ${i + 1} no generó contenido.`);

      audioBuffers.push(new Uint8Array(decode(base64Audio).buffer));
    }

    // 5. ENSAMBLAJE BINARIO (Sinfonía Final)
    const totalSize = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const finalAudioArray = new Uint8Array(totalSize);
    let offset = 0;
    for (const b of audioBuffers) {
      finalAudioArray.set(b, offset);
      offset += b.length;
    }

    // 6. STORAGE (Persistencia en el Borde)
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.mp3`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalAudioArray, {
        contentType: 'audio/mpeg', // Gemini 2.5 Pro TTS puede entregar WAV o MP3 según headers
        upsert: true
      });

    if (uploadError) throw new Error(`UPLOAD_FAIL: ${uploadError.message}`);

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 7. ACTUALIZACIÓN DE METADATOS (Cierre de Ciclo)
    // Ajuste de estimación para el nuevo bitrate de alta fidelidad
    const estimatedDuration = Math.round(totalSize / 16000);

    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl.publicUrl,
      duration_seconds: estimatedDuration,
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    console.log(`✅ [${correlationId}] Viaje sonoro completado: ${publicUrl.publicUrl}`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl.publicUrl,
      interpretation_notes: directorNote
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`🔥 [Acting Error][${correlationId}]:`, err.message);
    return new Response(JSON.stringify({
      success: false,
      error: err.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(guard(handler));