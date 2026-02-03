// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 22.0 (Stable Audio Architect - RAM Optimized & Semantic Chunking)

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de inteligencia NicePod
import { callGeminiAudio, cleanTextForSpeech, createWavHeader } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { guard } from "../_shared/guard.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

/**
 * LÍMITES TÉCNICOS OPERATIVOS
 */
const MAX_CHUNK_SIZE = 4500; // Un poco menos de 5000 para dejar margen de seguridad a etiquetas
const SAMPLE_RATE = 24000;

const PayloadSchema = z.object({
  podcast_id: z.number({ required_error: "podcast_id_is_required" }),
  trace_id: z.string().optional()
});

/**
 * extractScriptContent: Normaliza el guion sin importar el origen (Draft o Pod)
 */
function extractScriptContent(input: any): string {
  if (!input) return "";
  // Si es un objeto JSON (Formato V2.5)
  if (typeof input === 'object' && input !== null) {
    return input.script_body || input.text || "";
  }
  // Si es un string que parece JSON
  if (typeof input === 'string' && input.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(input);
      return parsed.script_body || parsed.text || input;
    } catch {
      return input;
    }
  }
  return String(input);
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let targetPodId: number | null = null;

  try {
    const body = await request.json();
    const { podcast_id } = PayloadSchema.parse(body);
    targetPodId = podcast_id;

    console.log(`🎙️ [Audio-Worker][${correlationId}] Iniciando forja para Pod #${podcast_id}`);

    // 1. OBTENCIÓN DE DATOS MAESTROS
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND");

    // 2. NORMALIZACIÓN Y SANITIZACIÓN AGRESIVA
    // Extraemos el guion y eliminamos Markdown que confunda al TTS
    const rawScript = extractScriptContent(pod.script_text);
    const cleanText = cleanTextForSpeech(rawScript);

    if (!cleanText || cleanText.length < 10) throw new Error("SCRIPT_CONTENT_INSUFFICIENT");

    // 3. DIRECCIÓN ACTORAL (Grounded Intelligence)
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

    // 4. FRAGMENTACIÓN SEMÁNTICA (Paragraph-Aware)
    // Dividimos por saltos de línea para no cortar oraciones a la mitad.
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

    console.log(`[Audio-Worker] Procesando ${chunks.length} fragmentos semánticos.`);

    // 5. CICLO DE SÍNTESIS CON GESTIÓN DE RAM
    let audioBuffers: Uint8Array[] = [];
    let totalRawLength = 0;

    for (let i = 0; i < chunks.length; i++) {
      console.log(`   > Sintetizando bloque ${i + 1}/${chunks.length}...`);
      const { data: base64Audio } = await callGeminiAudio(chunks[i], directorNote, voiceParams);

      const buffer = new Uint8Array(decode(base64Audio).buffer);
      totalRawLength += buffer.length;
      audioBuffers.push(buffer);

      // Ayudamos al Garbage Collector (liberación inmediata de la cadena base64)
      // deno-lint-ignore no-unused-vars
      const _wipe = base64Audio;
    }

    // 6. ENSAMBLAJE BINARIO QUIRÚRGICO (Avoid Memory Peaks)
    const wavHeader = createWavHeader(totalRawLength, SAMPLE_RATE);
    const finalFile = new Uint8Array(wavHeader.length + totalRawLength);

    // Inyectamos cabecera
    finalFile.set(wavHeader, 0);

    // Inyectamos bloques usando .set() (Acelerado por hardware)
    let offset = wavHeader.length;
    for (let i = 0; i < audioBuffers.length; i++) {
      finalFile.set(audioBuffers[i], offset);
      offset += audioBuffers[i].length;
      // Liberamos referencia del buffer individual una vez copiado
      (audioBuffers as any)[i] = null;
    }
    audioBuffers = []; // Limpieza total

    // 7. PERSISTENCIA EN STORAGE
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

    // 8. CIERRE DE CICLO DE INTEGRIDAD (Readiness Flag)
    // Calculamos duración: dataLength / (sampleRate * bytesPerSample * channels)
    const duration = Math.round(totalRawLength / (SAMPLE_RATE * 2));

    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        audio_url: publicUrl,
        duration_seconds: duration,
        audio_ready: true, // ESTO ACTIVA EL TRIGGER TR_CHECK_INTEGRITY
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DATABASE_FINAL_SYNC_ERROR: ${updateErr.message}`);

    console.log(`✅ [Audio-Worker] Éxito absoluto para Pod #${podcast_id}. Archivo: ${filePath}`);

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error(`🔥 [Audio-Worker-Fatal][${correlationId}]`, err.message);

    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        admin_notes: `Audio Failure: ${err.message} | Trace: ${correlationId}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));