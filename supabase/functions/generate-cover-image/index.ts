// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 21.0 (Master Image Architect - Imagen 3 Migration & Zero-Overhead Standard)
// Misión: Forjar la identidad visual del podcast mediante Google Imagen 3 con resiliencia total.
// [RESOLUCIÓN]: Corrección de error 404 (Deprecación de modelo @006) y optimización de CPU.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de inteligencia NicePod sincronizado (v11.8)
import { AI_MODELS, buildPrompt, cleanTextForSpeech } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";

/**
 * CONFIGURACIÓN DE ACTIVOS SOBERANOS
 */
const PLACEHOLDER_COVER_URL = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/static/placeholder-logo.png";
const GOOGLE_LOCATION = "us-central1";

/**
 * CLIENTE SUPABASE ADMIN:
 * Persistente en el contexto de ejecución para minimizar latencia en el handshake.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScriptContent: Recupera el texto plano desde el objeto JSONB estabilizado.
 */
function extractScriptContent(script_text: any): string {
  if (!script_text) return "";
  // Priorizamos script_plain ya sanitizado por la Sala de Forja (Protocolo V2.5)
  if (typeof script_text === 'object') {
    return script_text.script_plain || script_text.script_body || "";
  }
  // Fallback para datos legacy o stringificados
  try {
    const parsed = typeof script_text === 'string' ? JSON.parse(script_text) : script_text;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(script_text);
  }
}

/**
 * handler: Lógica central de síntesis visual.
 */
async function handler(request: Request): Promise<Response> {
  // 1. GESTIÓN DE PROTOCOLO DE RED (CORS)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 2. RECEPCIÓN DE SOLICITUD
    const payload = await request.json();
    const { podcast_id, agent_name = "cover-art-director-v1" } = payload;

    if (!podcast_id) throw new Error("PODCAST_ID_REQUIRED");
    targetPodId = podcast_id;

    console.log(`🎨 [Image-Worker][${correlationId}] Iniciando forja visual para Pod #${podcast_id}`);

    // 3. OBTENCIÓN DE DATOS Y AGENTE (Fase IV)
    // Extraemos título, guion y parámetros del agente simultáneamente.
    const [podRes, agentRes] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcast_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template, model_identifier').eq('agent_name', agent_name).single()
    ]);

    if (podRes.error || !podRes.data) throw new Error("PODCAST_NOT_FOUND");
    if (agentRes.error || !agentRes.data) throw new Error("ART_AGENT_NOT_CONFIGURED");

    // 4. CONSTRUCCIÓN DEL PROMPT VISUAL (Aurora Style)
    const rawScript = extractScriptContent(podRes.data.script_text);
    // Usamos los primeros 500 caracteres para dar contexto sin exceder los límites de tokens.
    const scriptSummary = cleanTextForSpeech(rawScript).substring(0, 500);

    const visualPrompt = buildPrompt(agentRes.data.prompt_template, {
      title: podRes.data.title,
      script_summary: scriptSummary
    });

    let finalImageUrl = PLACEHOLDER_COVER_URL;
    let imageWasGenerated = false;

    // 5. INVOCACIÓN A GOOGLE VERTEX AI (Imagen 3.0)
    try {
      const accessToken = await getGoogleAccessToken();
      const projectId = Deno.env.get("GOOGLE_PROJECT_ID");

      /**
       * [MIGRACIÓN]: Utilizamos el modelo IMAGE definido en nuestro núcleo compartido v11.8.
       * Fallback a imagen-3.0-generate-001 si no está definido.
       */
      const modelId = AI_MODELS.IMAGE || 'imagen-3.0-generate-001';
      const vertexUrl = `https://${GOOGLE_LOCATION}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${GOOGLE_LOCATION}/publishers/google/models/${modelId}:predict`;

      console.log(`🧠 [Image-Worker] Solicitando síntesis a motor Imagen 3...`);

      const response = await fetch(vertexUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instances: [{ "prompt": visualPrompt }],
          parameters: {
            "sampleCount": 1,
            "aspectRatio": "1:1",
            "safetySetting": "block_most"
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const imageBase64 = result.predictions?.[0]?.bytesBase64Encoded;

        if (imageBase64) {
          // 6. PERSISTENCIA EN STORAGE SOBERANO
          const imageBuffer = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
          const filePath = `public/${podRes.data.user_id}/${podcast_id}-cover.jpg`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from('podcasts')
            .upload(filePath, imageBuffer, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
            finalImageUrl = publicUrl;
            imageWasGenerated = true;
          }
        }
      } else {
        const errorText = await response.text();
        console.warn(`⚠️ [Image-Worker] Vertex AI declinó la generación (Posible filtro o cuota): ${errorText}`);
      }
    } catch (vertexErr: any) {
      console.error(`⚠️ [Image-Worker] Excepción en túnel Vertex AI: ${vertexErr.message}`);
    }

    // 7. CIERRE DE CICLO Y LIBERACIÓN DE SEMÁFORO (Fase V)
    // CRÍTICO: Siempre marcamos image_ready = true para que tr_check_integrity libere el podcast.
    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        cover_image_url: finalImageUrl,
        image_ready: true,
        admin_notes: imageWasGenerated ? null : `Fallback visual activado: ${correlationId}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DB_SYNC_ERROR: ${updateErr.message}`);

    console.log(`✅ [Image-Worker] Ciclo finalizado. Pod #${podcast_id}. Generado: ${imageWasGenerated}`);

    return new Response(JSON.stringify({
      success: true,
      url: finalImageUrl,
      generated: imageWasGenerated,
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`🔥 [Image-Worker-Fatal][${correlationId}]:`, err.message);

    // Fallback de emergencia para evitar estados bloqueados en la UI
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        image_ready: true, // Liberamos el semáforo para permitir el flujo de audio
        admin_notes: `Critical Art Failure: ${err.message}`
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
}

serve(handler);