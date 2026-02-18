// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 25.0 (Master Audio Architect - Production Standard)
// Misión: Forja binaria de audio neuronal de alta fidelidad optimizando CPU y RAM.
// [OPTIMIZACIÓN]: Eliminación de Guard para maximizar CPU y sincronía con Gemini 2.5 Pro TTS.

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * IMPORTACIONES DEL NÚCLEO SINCRO (v11.8)
 * Aseguramos la paridad de nombres con las exportaciones de _shared/ai.ts
 */
import {
  AI_MODELS,
  callGeminiAudio,
  cleanTextForSpeech,
  createWavHeader
} from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

/**
 * CONSTANTES TÉCNICAS
 * SAMPLE_RATE: 24000Hz (Estándar de fidelidad NicePod)
 */
const SAMPLE_RATE = 24000;

/**
 * INICIALIZACIÓN DE CLIENTE SUPABASE ADMIN
 * Persistente en el contexto de ejecución para optimizar latencia.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScript: Función de seguridad para normalizar el guion desde JSONB.
 */
function extractScript(input: any): string {
  if (!input) return "";
  // Prioridad: script_plain sanitizado por la Sala de Forja
  if (typeof input === 'object') {
    return input.script_plain || input.script_body || "";
  }
  // Fallback por si existe rastro de texto plano legado
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(input);
  }
}

/**
 * handler: Lógica central de materialización acústica.
 */
async function handler(request: Request): Promise<Response> {
  // 1. PROTOCOLO DE CONECTIVIDAD (CORS)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Trazabilidad por Correlation ID
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 2. RECEPCIÓN DE PAYLOAD
    const payload = await request.json();
    const { podcast_id } = payload;

    if (!podcast_id) throw new Error("IDENTIFICADOR_PODCAST_REQUERIDO");
    targetPodId = podcast_id;

    console.log(`🎙️ [Audio-Worker][${correlationId}] Iniciando forja para Pod #${podcast_id}`);

    // 3. OBTENCIÓN DE DATOS SOBERANOS
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("PODCAST_DATA_NOT_FOUND");

    // 4. PREPARACIÓN DE TEXTO E HIGIENE ACÚSTICA
    const rawText = extractScript(pod.script_text);
    const cleanText = cleanTextForSpeech(rawText);

    if (!cleanText || cleanText.length < 20) {
      throw new Error("CONTENIDO_GUION_INSUFICIENTE");
    }

    // 5. DIRECCIÓN ACTORIAL (Vocal Director Map)
    const inputs = (pod.creation_data as any)?.inputs || {};
    const directorNote = generateDirectorNote(
      pod.creation_data?.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    const voiceParams = {
      gender: inputs.voiceGender || "Masculino",
      style: inputs.voiceStyle || "Profesional"
    };

    // 6. SÍNTESIS NEURONAL (Llamada al modelo Gemini 2.5 Pro TTS)
    console.log(`🧠 [Audio-Worker] Invocando motor: ${AI_MODELS.AUDIO}`);

    // El núcleo v11.8 maneja el enrutamiento a la API de Google
    const { data: base64Audio } = await callGeminiAudio(
      cleanText.substring(0, 12000), // Límite de seguridad de ventana
      directorNote,
      voiceParams
    );

    // 7. ENSAMBLAJE BINARIO (Gestión de Memoria RAM)
    // Decodificamos el Base64 a un buffer de bytes crudos
    const audioBuffer = new Uint8Array(decode(base64Audio).buffer);
    const wavHeader = createWavHeader(audioBuffer.length, SAMPLE_RATE);

    // Creamos el contenedor final uniendo la cabecera RIFF con el cuerpo PCM
    const finalFile = new Uint8Array(wavHeader.length + audioBuffer.length);
    finalFile.set(wavHeader, 0);
    finalFile.set(audioBuffer, wavHeader.length);

    // 8. PERSISTENCIA EN STORAGE SOBERANO
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.wav`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalFile, {
        contentType: 'audio/wav',
        upsert: true
      });

    if (uploadError) throw new Error(`STORAGE_UPLOAD_ERROR: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 9. ACTUALIZACIÓN DE BASE DE DATOS Y LIBERACIÓN DE SEMÁFORO
    // Calculamos duración estimada: bytes / (samples * canales * bits)
    const duration = Math.round(audioBuffer.length / (SAMPLE_RATE * 2));

    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        audio_url: publicUrl,
        audio_ready: true, // Gatillo para el trigger tr_check_integrity
        duration_seconds: duration,
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DB_FINAL_SYNC_ERROR: ${updateErr.message}`);

    console.log(`✅ [Audio-Worker] Sincronía completada para Pod #${podcast_id}.`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Audio-Worker-Fatal][${correlationId}]:`, error.message);

    // [FALLBACK RESILIENTE]: Marcamos bandera para no bloquear la experiencia de usuario
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_ready: true,
        admin_notes: `Audio Materialization Failure: ${error.message} | ID: ${correlationId}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);