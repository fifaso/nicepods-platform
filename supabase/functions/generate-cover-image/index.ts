// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 17.0 (Autonomous Image Agent - Readiness Flag & Vertex AI Shield)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de NicePod
import { buildPrompt, cleanTextForSpeech } from "../_shared/ai.ts";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

/**
 * SCHEMA: InvokePayloadSchema
 * podcast_id: Requerido para anclar el activo.
 * agent_name: Permite variar el estilo artístico del generador de imágenes.
 */
const InvokePayloadSchema = z.object({
  job_id: z.number().optional().nullable(),
  podcast_id: z.number({ required_error: "podcast_id_is_required" }),
  agent_name: z.string().default("cover-art-director-v1"),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const payload = await request.json();
    const { podcast_id, agent_name } = InvokePayloadSchema.parse(payload);

    console.log(`🎨 [Image-Worker][${correlationId}] Iniciando generación para Pod #${podcast_id}`);

    // 1. OBTENCIÓN DE DATOS Y PROMPT MAESTRO
    const [podRes, agentRes] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcast_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template, model_identifier').eq('agent_name', agent_name).single()
    ]);

    if (podRes.error || !podRes.data) throw new Error("PODCAST_NOT_FOUND");
    if (agentRes.error || !agentRes.data) throw new Error("ART_AGENT_NOT_CONFIGURED");

    // 2. CONSTRUCCIÓN DEL PROMPT VISUAL
    // Limpiamos el guion para extraer un contexto visual de alta fidelidad (primeros 400 caracteres)
    const scriptContext = cleanTextForSpeech(podRes.data.script_text || "").substring(0, 400);
    const visualPrompt = buildPrompt(agentRes.data.prompt_template, {
      title: podRes.data.title,
      script_summary: scriptContext
    });

    // 3. GENERACIÓN EN VERTEX AI (Google Imagen 3 / v006)
    const accessToken = await getGoogleAccessToken();
    const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${Deno.env.get("GOOGLE_PROJECT_ID")}/locations/us-central1/publishers/google/models/${agentRes.data.model_identifier || 'imagegeneration@006'}:predict`;

    console.log(`🧠 [Image-Worker] Invocando Vertex AI con prompt: ${visualPrompt.substring(0, 50)}...`);

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

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403 || errorText.includes("Quota exceeded")) {
        throw new Error("GOOGLE_CLOUD_QUOTA_EXCEEDED");
      }
      throw new Error(`VERTEX_AI_FAIL [${response.status}]: ${errorText}`);
    }

    const result = await response.json();
    const imageBase64 = result.predictions?.[0]?.bytesBase64Encoded;
    if (!imageBase64) throw new Error("NO_IMAGE_DATA_RECEIVED");

    // 4. PERSISTENCIA EN STORAGE (Bucket: podcasts)
    const imageBuffer = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    const filePath = `public/${podRes.data.user_id}/${podcast_id}-cover.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw new Error(`STORAGE_UPLOAD_FAIL: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    /**
     * 5. LEVANTAR BANDERA DE DISPONIBILIDAD (Readiness Flag)
     * [CORE]: Actualizamos 'image_ready' para que el Trigger de la DB orqueste el cierre.
     */
    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        cover_image_url: publicUrl,
        image_ready: true, // <--- BANDERA DE COREOGRAFÍA
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DB_UPDATE_FAIL: ${updateErr.message}`);

    console.log(`✅ [Image-Worker] Activo forjado y bandera image_ready activada.`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`🔥 [Image-Worker-Fatal]:`, err.message);

    // Notificamos el fallo en las notas administrativas
    await supabaseAdmin.from('micro_pods').update({
      admin_notes: `Image Error: ${err.message} | Trace: ${correlationId}`
    }).eq('id', (request as any).podcast_id || podcast_id);

    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
};

serve(guard(handler));