// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 26.0 (Master Audio Architect - Performance & Metadata Integration)
// Misión: Forja binaria de audio neuronal utilizando el 100% de los parámetros del usuario.
// [ESTABILIZACIÓN]: Sincronización con Núcleo v12.0 y protocolo de seguridad Lite.

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * IMPORTACIONES DEL NÚCLEO SINCRO (v12.0)
 * Aseguramos la integridad de los métodos compartidos para evitar SyntaxErrors.
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
 * PARÁMETROS TÉCNICOS NOMINALES
 * SAMPLE_RATE: 24000Hz (Estándar de fidelidad NicePod para Gemini TTS).
 * MAX_CHUNK_SIZE: Tamaño óptimo para evitar degradación de contexto en la IA.
 */
const SAMPLE_RATE = 24000;
const MAX_CHUNK_SIZE = 4000;

/**
 * INICIALIZACIÓN DE CLIENTE SUPABASE ADMIN
 * Persistente en el contexto de ejecución para optimizar latencia.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScriptContent: Recupera el texto plano desde el objeto JSONB de la base de datos.
 */
function extractScriptContent(script_text: any): string {
  if (!script_text) return "";

  // Priorizamos 'script_plain' (limpio de Markdown) generado por el Agente 38.
  if (typeof script_text === 'object' && script_text !== null) {
    return script_text.script_plain || script_text.script_body || "";
  }

  // Fallback para datos legacy o hilos malformados.
  try {
    const parsed = typeof script_text === 'string' ? JSON.parse(script_text) : script_text;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(script_text);
  }
}

/**
 * handler: Orquestador del flujo de materialización acústica.
 */
async function handler(request: Request): Promise<Response> {
  // 1. GESTIÓN DE PROTOCOLO CORS
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 2. VALIDACIÓN DE SEGURIDAD LITE (Internal Service Only)
    // Protegemos la función verificando la Service Role Key sin el costo de CPU de Arcjet.
    const authHeader = request.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!authHeader?.includes(serviceKey ?? "PROTECTED")) {
      console.warn(`🛑 [Security] Acceso no autorizado bloqueado en Audio Worker.`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 3. RECEPCIÓN Y BÚSQUEDA DE DATOS
    const payload = await request.json();
    const { podcast_id } = payload;

    if (!podcast_id) throw new Error("PODCAST_ID_REQUIRED");
    targetPodId = podcast_id;

    console.log(`🎙️ [Audio-Worker][${correlationId}] Iniciando Pod #${podcast_id}`);

    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND");

    // 4. NORMALIZACIÓN E HIGIENE ACÚSTICA
    const rawText = extractScriptContent(pod.script_text);
    const cleanText = cleanTextForSpeech(rawText);

    if (!cleanText || cleanText.length < 20) {
      throw new Error("CONTENIDO_GUION_INSUFICIENTE_PARA_SINTESIS");
    }

    // 5. EXTRACCIÓN DE PARÁMETROS DEL USUARIO (Metadata Sync)
    // Recuperamos las selecciones del formulario para personalizar la voz.
    const inputs = (pod.creation_data as any)?.inputs || {};
    const agentName = pod.creation_data?.agentName || "narrador";
    const voiceGender = inputs.voiceGender || "Masculino";
    const voiceStyle = inputs.voiceStyle || "Profesional";
    const voicePace = inputs.voicePace || "Moderado";

    // Generamos las notas de dirección para la IA (Acting Notes)
    const directorNote = generateDirectorNote(agentName, voiceGender, voiceStyle, voicePace);

    const voiceParams = {
      gender: voiceGender,
      style: voiceStyle
    };

    // 6. FRAGMENTACIÓN SEMÁNTICA (Chunking)
    // Dividimos el texto por párrafos para mantener la fluidez narrativa.
    const paragraphs = cleanText.split(/\n+/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const p of paragraphs) {
      if ((currentChunk.length + p.length) < MAX_CHUNK_SIZE) {
        currentChunk += (currentChunk ? "\n\n" : "") + p;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = p;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    console.log(`🧠 [Audio-Worker] Sintetizando ${chunks.length} bloques con modelo ${AI_MODELS.AUDIO}`);

    // 7. CICLO DE SÍNTESIS CON CONTROL DE RAM
    const audioBuffers: Uint8Array[] = [];
    let totalRawLength = 0;

    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Procesando fragmento ${i + 1}/${chunks.length}...`);

      const { data: base64Audio } = await callGeminiAudio(
        chunks[i],
        directorNote,
        voiceParams
      );

      // Decodificación inmediata para liberar el peso de la cadena Base64
      const buffer = new Uint8Array(decode(base64Audio).buffer);
      totalRawLength += buffer.length;
      audioBuffers.push(buffer);
    }

    // 8. ENSAMBLAJE BINARIO QUIRÚRGICO (WAV RIFF)
    const wavHeader = createWavHeader(totalRawLength, SAMPLE_RATE);
    const finalFile = new Uint8Array(wavHeader.length + totalRawLength);

    // Inyectamos cabecera maestra
    finalFile.set(wavHeader, 0);

    // Concatenamos y anulamos referencias para el Garbage Collector (Anti-Crash)
    let offset = wavHeader.length;
    for (let i = 0; i < audioBuffers.length; i++) {
      const chunk = audioBuffers[i];
      if (chunk) {
        finalFile.set(chunk, offset);
        offset += chunk.length;
        // Liberamos memoria del fragmento tras la copia
        (audioBuffers as any)[i] = null;
      }
    }

    // 9. PERSISTENCIA EN STORAGE SOBERANO
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.wav`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, finalFile, {
        contentType: 'audio/wav',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`STORAGE_UPLOAD_ERROR: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // 10. FINALIZACIÓN Y LIBERACIÓN DE SEMÁFORO
    // Duración estimada: bytes / (sampleRate * channels * bytesPerSample)
    const duration = Math.round(totalRawLength / (SAMPLE_RATE * 2));

    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        audio_url: publicUrl,
        audio_ready: true, // GATILLO FINAL
        duration_seconds: duration,
        updated_at: new Date().toISOString(),
        admin_notes: null // Limpiamos rastro de errores anteriores si existen
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DATABASE_SYNC_ERROR: ${updateErr.message}`);

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

    /**
     * [RESILIENCIA DE SEMÁFORO]:
     * Si la síntesis falla, marcamos audio_ready = true para que el usuario
     * no quede atrapado, registrando el error técnico en notas administrativas.
     */
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_ready: true,
        admin_notes: `Audio Failure: ${error.message} | Correlation: ${correlationId}`,
        updated_at: new Date().toISOString()
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