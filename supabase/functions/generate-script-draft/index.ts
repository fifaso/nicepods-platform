// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 26.5 (Architect Redactor - Raw Source Processor)
// Misión: Procesar fuentes crudas y generar narrativa profesional en un solo ciclo de CPU.
// [ADAPTACIÓN]: Ahora lee directamente de la columna 'sources' del borrador.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod
import { AI_MODELS, buildPrompt, callGeminiMultimodal, cleanTextForSpeech, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetDraftId: string | null = null;

  try {
    const payload = await request.json();
    const { draft_id } = payload;

    if (!draft_id) throw new Error("DRAFT_ID_REQUIRED");
    targetDraftId = draft_id;

    // 1. RECUPERACIÓN DE DATOS (Fuentes crudas y Metadata)
    const { data: draft, error: fetchErr } = await supabaseAdmin
      .from('podcast_drafts')
      .select('*')
      .eq('id', draft_id)
      .single();

    if (fetchErr || !draft) throw new Error("DRAFT_NOT_FOUND");
    if (!draft.sources || draft.sources.length === 0) throw new Error("NO_SOURCES_TO_WRITE");

    console.log(`✍️ [Redactor][${correlationId}] Iniciando redacción desde fuentes para: ${draft.title}`);

    // 2. RESOLUCIÓN DE AGENTE Y PERSONALIDAD
    const agentName = draft.creation_data?.agentName || 'script-architect-v1';
    const { data: agent, error: agentErr } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', agentName)
      .single();

    if (agentErr || !agent) throw new Error(`PROMPT_MISSING: ${agentName}`);

    // 3. CONSTRUCCIÓN DEL PROMPT MAESTRO
    // Enviamos las fuentes crudas (sources) directamente al modelo 3.0 Pro/Flash
    // para que él realice el trabajo de síntesis y redacción simultáneamente.
    const finalPrompt = buildPrompt(agent.prompt_template, {
      topic: draft.title,
      raw_sources: JSON.stringify(draft.sources), // Inyección de fuentes recolectadas en Fase II
      duration: draft.creation_data?.inputs?.duration || "Media",
      tone: draft.creation_data?.inputs?.tone || "Profesional"
    });

    // 4. INVOCACIÓN AL CEREBRO GEMINI 3.0
    const scriptRaw = await callGeminiMultimodal(
      finalPrompt,
      draft.creation_data?.inputs?.image_base64_reference,
      AI_MODELS.PRO, // Usamos PRO para la fase de redacción narrativa
      0.7
    );

    const content = parseAIJson<{ title: string, script_body: string }>(scriptRaw);

    if (!content.script_body) throw new Error("AI_GENERATION_FAILED");

    // 5. PERSISTENCIA FINAL Y LIBERACIÓN (Sincronía JSONB)
    const plainText = cleanTextForSpeech(content.script_body);

    const { error: updateError } = await supabaseAdmin
      .from('podcast_drafts')
      .update({
        title: content.title || draft.title,
        script_text: {
          script_body: content.script_body,
          script_plain: plainText
        },
        status: 'ready', // Libera el borrador para el usuario
        updated_at: new Date().toISOString()
      })
      .eq('id', draft_id);

    if (updateError) throw updateError;

    console.log(`✅ [Redactor][${correlationId}] Guion forjado y listo para producción.`);

    return new Response(JSON.stringify({
      success: true,
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Redactor-Fatal][${correlationId}]:`, error.message);
    if (targetDraftId) {
      await supabaseAdmin.from('podcast_drafts').update({ status: 'failed' }).eq('id', targetDraftId);
    }
    return new Response(JSON.stringify({ error: error.message, trace_id: correlationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(handler);