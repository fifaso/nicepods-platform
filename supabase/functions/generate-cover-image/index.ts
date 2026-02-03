// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 18.0 (Stable Image Architect - Fallback Resilience & Readiness Sync)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de NicePod
import { buildPrompt, cleanTextForSpeech } from "../_shared/ai.ts";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

/**
 * CONFIGURACIÓN DE ACTIVOS
 * Ruta al logo de NicePod para casos de error o saturación de cuota.
 */
const PLACEHOLDER_COVER_URL = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/static/placeholder-logo.png";

const InvokePayloadSchema = z.object({
  podcast_id: z.number({ required_error: "podcast_id_is_required" }),
  agent_name: z.string().default("cover-art-director-v1"),
  trace_id: z.string().optional()
});

/**
 * extractScriptContent: Asegura la compatibilidad con guiones en formato JSON o Texto.
 */
function extractScriptContent(input: any): string {
  if (!input) return "";
  if (typeof input === 'object' && input !== null) {
    return input.script_body || input.text || "";
  }
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
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let targetPodId: number | null = null;

  try {
    const payload = await request.json();
    const { podcast_id, agent_name } = InvokePayloadSchema.parse(payload);
    targetPodId = podcast_id;

    console.log(`🎨 [Image-Worker][${correlationId}] Iniciando generación para Pod #${podcast_id}`);

    // 1. OBTENCIÓN DE RECURSOS (Mapeo atómico)
    const [podRes, agentRes] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcast_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template, model_identifier').eq('agent_name', agent_name).single()
    ]);

    if (podRes.error || !podRes.data) throw new Error("PODCAST_NOT_FOUND");
    if (agentRes.error || !agentRes.data) throw new Error("ART_AGENT_NOT_CONFIGURED");

    // 2. CONSTRUCCIÓN DEL PROMPT VISUAL
    const rawScript = extractScriptContent(podRes.data.script_text);
    const scriptContext = cleanTextForSpeech(rawScript).substring(0, 450);

    const visualPrompt = buildPrompt(agentRes.data.prompt_template, {
      title: podRes.data.title,
      script_summary: scriptContext
    });

    let finalImageUrl = PLACEHOLDER_COVER_URL;
    let imageWasGenerated = false;

    // 3. INTENTO DE GENERACIÓN EN VERTEX AI (Google Imagen 3)
    try {
      const accessToken = await getGoogleAccessToken();
      const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${Deno.env.get("GOOGLE_PROJECT_ID")}/locations/us-central1/publishers/google/models/${agentRes.data.model_identifier || 'imagegeneration@006'}:predict`;

      console.log(`🧠 [Image-Worker] Solicitando imagen para: "${podRes.data.title}"`);

      const response = await fetch(vertexUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instances: [{ "prompt": visualPrompt }],
          parameters: { "sampleCount": 1, "aspectRatio": "1:1" }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const imageBase64 = result.predictions?.[0]?.bytesBase64Encoded;

        if (imageBase64) {
          // 4. PERSISTENCIA EN STORAGE (Solo si la IA respondió con éxito)
          const imageBuffer = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
          const filePath = `public/${podRes.data.user_id}/${podcast_id}-cover.jpg`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from('podcasts')
            .upload(filePath, imageBuffer, {
              contentType: 'image/jpeg',
              upsert: true,
              cacheControl: '3600'
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
            finalImageUrl = publicUrl;
            imageWasGenerated = true;
          } else {
            console.error(`⚠️ Error al subir imagen generada: ${uploadError.message}`);
          }
        }
      } else {
        const errText = await response.text();
        console.warn(`⚠️ Vertex AI no pudo generar la imagen (Cuota o Filtro): ${errText}`);
        // No lanzamos error aquí, permitimos que el flujo continúe hacia el placeholder
      }
    } catch (vertexErr: any) {
      console.error(`⚠️ Excepción en el flujo de Vertex AI: ${vertexErr.message}`);
    }

    // 5. ACTUALIZACIÓN DE BASE DE DATOS Y LIBERACIÓN DE BANDERA
    // Actualizamos 'image_ready' a TRUE siempre, incluso si es el placeholder, 
    // para que el trigger tr_check_integrity pueda completar el podcast.
    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        cover_image_url: finalImageUrl,
        image_ready: true, // <--- LIBERA EL SEMÁFORO DE INTEGRIDAD
        admin_notes: imageWasGenerated ? null : "Usada carátula de respaldo por indisponibilidad de Vertex AI.",
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DB_FINAL_SYNC_FAIL: ${updateErr.message}`);

    console.log(`✅ [Image-Worker] Ciclo terminado. Generada: ${imageWasGenerated}. Pod #${podcast_id}`);

    return new Response(JSON.stringify({
      success: true,
      url: finalImageUrl,
      generated: imageWasGenerated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`🔥 [Image-Worker-Fatal][${correlationId}]:`, err.message);

    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        admin_notes: `Critical Image Error: ${err.message} | Trace: ${correlationId}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
};

serve(guard(handler));