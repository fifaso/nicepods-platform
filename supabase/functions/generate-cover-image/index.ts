// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 19.0 (Master Image Architect - Global Resilience & Integrity Standard)
// Misión: Forja de identidad visual mediante Google Vertex AI (Imagen 3) con protocolo de fallback garantizado.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de NicePod (Sincronizadas con Nivel 1 de Estabilización)
import { buildPrompt, cleanTextForSpeech } from "../_shared/ai.ts";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

/**
 * CONFIGURACIÓN DE ACTIVOS SOBERANOS
 */
const PLACEHOLDER_COVER_URL = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/static/placeholder-logo.png";
const GOOGLE_LOCATION = "us-central1"; // Región validada para Imagen 3

/**
 * extractScriptContent: Extrae el texto para el contexto visual desde el objeto JSONB.
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

const handler = async (request: Request): Promise<Response> => {
  // Recuperamos identidad de petición de nuestro Guard V5.0
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let targetPodId: number | null = null;

  try {
    const payload = await request.json();
    const { podcast_id, agent_name = "cover-art-director-v1" } = payload;

    if (!podcast_id) throw new Error("PODCAST_ID_REQUIRED");
    targetPodId = podcast_id;

    console.log(`🎨 [Image-Worker][${correlationId}] Iniciando generación visual para Pod #${podcast_id}`);

    // 1. OBTENCIÓN DE DATOS Y AGENTE (Fase IV)
    const [podRes, agentRes] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcast_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template, model_identifier').eq('agent_name', agent_name).single()
    ]);

    if (podRes.error || !podRes.data) throw new Error("PODCAST_NOT_FOUND");
    if (agentRes.error || !agentRes.data) throw new Error("ART_AGENT_NOT_CONFIGURED");

    // 2. DESTILACIÓN DEL PROMPT VISUAL
    const rawScript = extractScriptContent(podRes.data.script_text);
    // Usamos cleanTextForSpeech para evitar que Markdown ensucie el prompt de la imagen
    const scriptSummary = cleanTextForSpeech(rawScript).substring(0, 450);

    const visualPrompt = buildPrompt(agentRes.data.prompt_template, {
      title: podRes.data.title,
      script_summary: scriptSummary
    });

    let finalImageUrl = PLACEHOLDER_COVER_URL;
    let imageWasGenerated = false;

    // 3. CONEXIÓN CON VERTEX AI (GOOGLE IMAGEN 3)
    try {
      const accessToken = await getGoogleAccessToken();
      const projectId = Deno.env.get("GOOGLE_PROJECT_ID");
      const modelId = agentRes.data.model_identifier || 'imagegeneration@006';

      const vertexUrl = `https://${GOOGLE_LOCATION}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${GOOGLE_LOCATION}/publishers/google/models/${modelId}:predict`;

      console.log(`🧠 [Image-Worker] Solicitando síntesis visual a Imagen 3...`);

      const response = await fetch(vertexUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instances: [{ "prompt": visualPrompt }],
          parameters: { "sampleCount": 1, "aspectRatio": "1:1", "safetySetting": "block_most" }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const imageBase64 = result.predictions?.[0]?.bytesBase64Encoded;

        if (imageBase64) {
          // 4. PERSISTENCIA EN BÓVEDA DE ACTIVOS
          const imageBuffer = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
          const filePath = `public/${podRes.data.user_id}/${podcast_id}-cover.jpg`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from('podcasts')
            .upload(filePath, imageBuffer, {
              contentType: 'image/jpeg',
              upsert: true,
              cacheControl: '3600',
              metadata: { correlation_id: correlationId }
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
            finalImageUrl = publicUrl;
            imageWasGenerated = true;
          }
        }
      } else {
        const errorData = await response.text();
        console.warn(`⚠️ [Image-Worker] Vertex AI declinó la generación: ${errorData}`);
      }
    } catch (vertexErr: any) {
      console.error(`⚠️ [Image-Worker] Error en túnel Vertex AI: ${vertexErr.message}`);
    }

    // 5. CIERRE DE CICLO Y LIBERACIÓN DE SEMÁFORO
    // CRÍTICO: Siempre marcamos image_ready = true para no bloquear el tr_check_integrity
    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        cover_image_url: finalImageUrl,
        image_ready: true, // Libera la fase final
        admin_notes: imageWasGenerated ? null : `Respaldo activado: ${correlationId}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DB_SYNC_ERROR: ${updateErr.message}`);

    console.log(`✅ [Image-Worker] Ciclo finalizado para Pod #${podcast_id}. Generado: ${imageWasGenerated}`);

    return new Response(JSON.stringify({
      success: true,
      url: finalImageUrl,
      generated: imageWasGenerated,
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error(`🔥 [Image-Worker-Fatal][${correlationId}]:`, err.message);

    // Fallback administrativo para evitar estados bloqueados
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        image_ready: true, // Liberamos el semáforo incluso en error fatal para permitir el flujo de audio
        admin_notes: `Critical Image Failure: ${err.message} | ID: ${correlationId}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({
      success: false,
      error: err.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

// Aplicamos el Guard Maestro V5.0
serve(guard(handler));