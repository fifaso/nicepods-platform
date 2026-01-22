// supabase/functions/generate-briefing-pill/index.ts
// VERSIÓN: 1.0 (Executive Briefing Engine - High-Speed Strategic Synthesis)

import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod para máxima consistencia técnica
import {
  AI_MODELS,
  buildPrompt,
  callGeminiAudio,
  callGeminiMultimodal,
  cleanTextForSpeech,
  createWavHeader,
  parseAIJson
} from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/**
 * Interface: PillPayload
 * Recibe los IDs de las fuentes seleccionadas en el Radar y preferencias del usuario.
 */
interface PillPayload {
  selected_source_ids: string[];
  voice_gender: 'Masculino' | 'Femenino';
  user_id: string;
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();

  try {
    const payload: PillPayload = await request.json();
    const { selected_source_ids, voice_gender, user_id } = payload;

    if (!selected_source_ids || selected_source_ids.length === 0) {
      throw new Error("Se requieren fuentes seleccionadas para generar la píldora.");
    }

    console.log(`[Pill-Engine][${correlationId}] Iniciando síntesis para usuario: ${user_id}`);

    // 1. OBTENCIÓN DE MATERIA PRIMA (Fuentes del Búfer)
    const { data: sources, error: sourceError } = await supabaseAdmin
      .from('pulse_staging')
      .select('title, summary, source_name, content_type, url')
      .in('id', selected_source_ids);

    if (sourceError || !sources) throw new Error("No se pudieron recuperar las fuentes seleccionadas.");

    // 2. FASE DE REDACCIÓN (Gemini 3.0 Flash)
    // Buscamos el prompt especializado para Briefings
    const { data: agent } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'briefing-architect-v1')
      .single();

    const scriptPrompt = buildPrompt(agent?.prompt_template || "Generate a strategic briefing for: {{sources}}", {
      sources: JSON.stringify(sources)
    });

    console.log(`🧠 [Pill-Engine] Redactando guion ejecutivo...`);
    const rawAiResponse = await callGeminiMultimodal(scriptPrompt, undefined, AI_MODELS.FLASH);
    const content = parseAIJson<{ title: string; script_body: string; summary: string }>(rawAiResponse);

    // 3. FASE DE AUDIO (Gemini 2.5 Flash TTS)
    // Definimos una nota de dirección actoral fija para el estilo "Briefing"
    const directorNote = `
        Interpreta como un analista de inteligencia senior. 
        Tono: Profesional, directo, informativo y con autoridad.
        Ritmo: Ágil pero permitiendo procesar datos clave.
        Idioma: Español Neutro.
    `.trim();

    const cleanText = cleanTextForSpeech(content.script_body);
    console.log(`🎙️ [Pill-Engine] Sintetizando audio neuronal...`);

    // Generación del audio (Asumimos un solo bloque por ser una píldora corta < 2 min)
    const { data: base64Audio } = await callGeminiAudio(
      cleanText,
      directorNote,
      { gender: voice_gender, style: 'Profesional' }
    );

    const audioBuffer = new Uint8Array(decode(base64Audio).buffer);
    const wavFile = new Uint8Array(createWavHeader(audioBuffer.length, 24000).length + audioBuffer.length);
    wavFile.set(createWavHeader(audioBuffer.length, 24000), 0);
    wavFile.set(audioBuffer, 44);

    // 4. PERSISTENCIA ATÓMICA (Podcast + Storage)
    const { data: newPod, error: podErr } = await supabaseAdmin.from("micro_pods").insert({
      user_id: user_id,
      title: content.title,
      description: content.summary,
      script_text: JSON.stringify({ script_body: content.script_body }),
      status: 'draft', // Nace privado (Curaduría Soberana)
      processing_status: 'completed',
      creation_mode: 'pulse', // Flag para identificar píldoras en la UI
      sources: sources.map(s => ({ title: s.title, url: s.url, origin: 'web' }))
    }).select("id").single();

    if (podErr) throw podErr;

    const filePath = `public/${user_id}/pill-${newPod.id}.wav`;
    await supabaseAdmin.storage.from('podcasts').upload(filePath, wavFile, {
      contentType: 'audio/wav',
      upsert: true
    });

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    // Actualización final de URL
    await supabaseAdmin.from('micro_pods').update({
      audio_url: publicUrl,
      duration_seconds: Math.round(audioBuffer.length / (24000 * 2))
    }).eq('id', newPod.id);

    console.log(`✅ [Pill-Engine] Píldora entregada con éxito: ${newPod.id}`);

    return new Response(JSON.stringify({
      success: true,
      podcast_id: newPod.id,
      url: publicUrl,
      trace_id: correlationId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error(`🔥 [Pill-Engine-Fatal]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

serve(guard(handler));