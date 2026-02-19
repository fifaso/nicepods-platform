// supabase/functions/generate-audio-from-script/index.ts
// VERSIÓN: 29.0 (NSP Harvester - High-Precision Traceability Standard)
// Misión: Cosechar fragmentos de audio neuronal y sembrarlos con trazabilidad absoluta.
// [ESTABILIZACIÓN]: Resolución de 'Silent Shutdown' mediante logs atómicos y gestión de promesas.

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * IMPORTACIONES DEL NÚCLEO SINCRO (v13.0)
 */
import {
  callGeminiAudio,
  cleanTextForSpeech
} from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateDirectorNote } from "../_shared/vocal-director-map.ts";

/**
 * CONSTANTES DE PROTOCOLO NSP
 */
const MAX_CHUNK_SIZE = 3800; // Reducimos ligeramente para mayor estabilidad en el buffer
const HEADER_BYTE_SIZE = 44; // Omitimos la cabecera WAV en los fragmentos RAW

/**
 * INICIALIZACIÓN DE CLIENTE SUPABASE ADMIN
 * Mantenemos la instancia fuera del handler para optimizar ejecuciones calientes.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScript: Normaliza el guion desde el formato JSONB souverano.
 */
function extractScript(input: any): string {
  if (!input) return "";
  if (typeof input === 'object' && input !== null) {
    return input.script_plain || input.script_body || "";
  }
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(input);
  }
}

/**
 * handler: Orquestador de la Cosecha Binaria.
 */
async function handler(request: Request): Promise<Response> {
  // 1. GESTIÓN DE CORS (Pre-vuelo)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 2. VALIDACIÓN DE SEGURIDAD INTERNA
    const authHeader = request.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authHeader?.includes(serviceKey ?? "PROTECTED")) {
      console.error(`🛑 [Security][${correlationId}] Intento de acceso no autorizado.`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 3. RECEPCIÓN Y ANÁLISIS DE DATOS
    const payload = await request.json();
    const { podcast_id } = payload;
    if (!podcast_id) throw new Error("ID_DEL_PODCAST_REQUERIDO");
    targetPodId = podcast_id;

    console.info(`📡 [NSP-Harvester][${correlationId}] Iniciando Misión para Pod #${podcast_id}`);

    // Obtenemos el registro maestro
    const { data: pod, error: podErr } = await supabaseAdmin
      .from('micro_pods')
      .select('*')
      .eq('id', podcast_id)
      .single();

    if (podErr || !pod) throw new Error("PODCAST_NO_ENCONTRADO_EN_BÓVEDA");

    // 4. PREPARACIÓN NARRATIVA
    const rawText = extractScript(pod.script_text);
    const cleanText = cleanTextForSpeech(rawText);
    const inputs = (pod.creation_data as any)?.inputs || {};

    // Dirección actorial basada en el ADN del podcast
    const directorNote = generateDirectorNote(
      pod.creation_data?.agentName || "narrador",
      inputs.voiceGender || "Masculino",
      inputs.voiceStyle || "Profesional",
      inputs.voicePace || "Moderado"
    );

    // 5. SEGMENTACIÓN DEL GUION
    const paragraphs = cleanText.split(/\n+/);
    const textChunks: string[] = [];
    let currentChunk = "";

    for (const p of paragraphs) {
      if ((currentChunk.length + p.length) < MAX_CHUNK_SIZE) {
        currentChunk += (currentChunk ? "\n\n" : "") + p;
      } else {
        if (currentChunk) textChunks.push(currentChunk);
        currentChunk = p;
      }
    }
    if (currentChunk) textChunks.push(currentChunk);

    console.info(`📦 [NSP-Harvester][${correlationId}] Guion segmentado en ${textChunks.length} fragmentos.`);

    // 6. INICIALIZACIÓN DE MALLA (Estado de Control)
    const { error: initError } = await supabaseAdmin.from('micro_pods').update({
      total_audio_segments: textChunks.length,
      current_audio_segments: 0,
      audio_assembly_status: 'collecting',
      audio_ready: false
    }).eq('id', podcast_id);

    if (initError) throw new Error(`DB_INIT_FAIL: ${initError.message}`);

    // 7. BUCLE DE COSECHA BINARIA (Rigor de RAM)
    for (let i = 0; i < textChunks.length; i++) {
      console.info(`   > [${i + 1}/${textChunks.length}] Sintetizando bloque neuronal...`);

      // Llamada al motor de voz de Google
      const { data: base64Audio } = await callGeminiAudio(
        textChunks[i],
        directorNote,
        { gender: inputs.voiceGender || "Masculino", style: inputs.voiceStyle || "Profesional" }
      );

      console.info(`   > [${i + 1}/${textChunks.length}] Sintetización exitosa. Decodificando binario...`);

      // Decodificación y extracción de PCM puro (Bypass de Header)
      let fullBuffer: Uint8Array | null = new Uint8Array(decode(base64Audio).buffer);
      let rawPcmData: Uint8Array | null = fullBuffer.slice(HEADER_BYTE_SIZE);

      const segmentPath = `temp/segments/${podcast_id}/part_${i}.raw`;

      console.info(`   > [${i + 1}/${textChunks.length}] Subiendo fragmento a Storage: ${segmentPath}`);

      const { error: uploadError } = await supabaseAdmin.storage
        .from('podcasts')
        .upload(segmentPath, rawPcmData, {
          contentType: 'application/octet-stream',
          upsert: true
        });

      if (uploadError) throw new Error(`STORAGE_UPLOAD_FAIL_SEGMENT_${i}: ${uploadError.message}`);

      // 8. REGISTRO EN MAPA BINARIO (Dispara el trigger del ensamblador)
      const { error: insertError } = await supabaseAdmin.from('audio_segments').insert({
        podcast_id: podcast_id,
        segment_index: i,
        storage_path: segmentPath,
        byte_size: rawPcmData.length,
        status: 'uploaded'
      });

      if (insertError) throw new Error(`DB_SEGMENT_INSERT_FAIL_SEGMENT_${i}: ${insertError.message}`);

      console.info(`   ✅ [${i + 1}/${textChunks.length}] Fragmento sembrado y registrado.`);

      // [CRÍTICO]: Liberación manual de memoria RAM
      rawPcmData = null;
      fullBuffer = null;
    }

    console.info(`🏁 [NSP-Harvester][${correlationId}] Misión de siembra completada con éxito.`);

    return new Response(JSON.stringify({
      success: true,
      message: "Cosecha de segmentos finalizada.",
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [NSP-Harvester-Fatal][${correlationId}]:`, error.message);

    // Reporte de fallo para el sistema de monitoreo
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        audio_assembly_status: 'failed',
        admin_notes: `Harvester Error: ${error.message} | ID: ${correlationId}`
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