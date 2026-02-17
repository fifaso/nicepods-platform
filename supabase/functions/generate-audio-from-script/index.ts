// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 24.1 (Master Audio Architect - Export Sync Edition)
// Misión: Forja binaria de audio neuronal con sincronización total con el núcleo IA.
// [RESOLUCIÓN]: Fix de SyntaxError: Importación correcta de callGeminiAudio.

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de inteligencia NicePod (v11.8)
import { callGeminiAudio, cleanTextForSpeech, createWavHeader } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

/**
 * CONFIGURACIÓN TÉCNICA
 */
const MAX_CHUNK_SIZE = 4500;
const SAMPLE_RATE = 24000;

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScriptContent: Recupera el texto plano desde el JSONB.
 */
function extractScriptContent(script_text: any): string {
  if (!script_text) return "";
  if (typeof script_text === 'object') {
    return script_text.script_plain || script_text.script_body || "";
  }
  try {
    const parsed = typeof script_text === 'string' ? JSON.parse(script_text) : script_text;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(script_text);
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    const payload = await request.json();
    const { podcast_id } = payload;
    if (!podcast_id) throw new Error("PODCAST_ID_REQUIRED");
    targetPodId = podcast_id;

    console.log(`🎙️ [Audio-Worker][${correlationId}] Iniciando Pod #${podcast_id}`);

    // 1. OBTENCIÓN DE DATOS
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND");

    // 2. NORMALIZACIÓN DE TEXTO
    const rawScript = extractScriptContent(pod.script_text);
    const cleanText = cleanTextForSpeech(rawScript);

    if (!cleanText || cleanText.length < 10) throw new Error("SCRIPT_CONTENT_INSUFFICIENT");

    // 3. DIRECCIÓN ACTORIAL
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

    // 4. FRAGMENTACIÓN SEMÁNTICA
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

    // 5. CICLO DE SÍNTESIS
    let audioBuffers: (Uint8Array | null)[] = [];
    let totalRawLength = 0;

    for (let i = 0; i < chunks.length; i++) {
      const { data: base64Audio } = await callGeminiAudio(chunks[i], directorNote, voiceParams);
      const buffer = new Uint8Array(decode(base64Audio).buffer);
      totalRawLength += buffer.length;
      audioBuffers.push(buffer);
    }

    // 6. ENSAMBLAJE BINARIO
    const wavHeader = createWavHeader(totalRawLength, SAMPLE_RATE);
    const finalFile = new Uint8Array(wavHeader.length + totalRawLength);

    finalFile.set(wavHeader, 0);
    let offset = wavHeader.length;
    for (let i = 0; i < audioBuffers.length; i++) {
      const chunk = audioBuffers[i];
      if (chunk) {
        finalFile.set(chunk, offset);
        offset += chunk.length;
        audioBuffers[i] = null; // Liberación de RAM inmediata
      }
    }

    // 7. PERSISTENCIA EN STORAGE
    const filePath = `public/${pod.user_id}/${podcast_id}-audio.wav`;
    await supabaseAdmin.storage.from('podcasts').upload(filePath, finalFile, {
      contentType: 'audio/wav',
      upsert: true
    });

    const publicUrl = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath).data.publicUrl;

    // 8. ACTUALIZACIÓN DE BASE DE DATOS
    const duration = Math.round(totalRawLength / (SAMPLE_RATE * 2));
    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl,
      audio_ready: true,
      duration_seconds: duration,
      updated_at: new Date().toISOString()
    }).eq('id', podcast_id);

    console.log(`✅ [Audio-Worker] Completado para Pod #${podcast_id}`);

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Audio-Worker-Fatal]:`, error.message);
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_ready: true,
        admin_notes: `Audio Error: ${error.message}`
      }).eq('id', targetPodId);
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);