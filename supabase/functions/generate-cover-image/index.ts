// supabase/functions/generate-cover-image/index.ts
import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z } from "zod";
import { guard } from "guard";
import { corsHeaders } from "cors";
import { getGoogleAccessToken } from "google-auth";
import { buildPrompt, cleanTextForSpeech } from "ai-core";

const InvokePayloadSchema = z.object({
  job_id: z.number(),
  podcast_id: z.number(),
  agent_name: z.string().default("cover-art-director-v1"),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const GOOGLE_PROJECT_ID = Deno.env.get("GOOGLE_PROJECT_ID") ?? "";
  const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const payload = await request.json();
    const { podcast_id, agent_name } = InvokePayloadSchema.parse(payload);

    // 1. OBTENCIÓN DIRECTA
    const [podRes, agentRes] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcast_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template, model_identifier').eq('agent_name', agent_name).single()
    ]);

    if (!podRes.data || !agentRes.data) throw new Error("Datos insuficientes para imagen.");

    // 2. PROMPT VISUAL
    const scriptSummary = cleanTextForSpeech(podRes.data.script_text || "").substring(0, 500);
    const visualPrompt = buildPrompt(agentRes.data.prompt_template, {
      title: podRes.data.title,
      script_summary: scriptSummary
    });

    // 3. GENERACIÓN VERTEX AI
    console.log(`🎨 [${correlationId}] Generando Imagen para Pod: ${podcast_id}`);
    const accessToken = await getGoogleAccessToken();
    const modelId = agentRes.data.model_identifier || 'imagegeneration@006';
    const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/${modelId}:predict`;

    const response = await fetch(vertexUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ "prompt": visualPrompt }],
        parameters: { "sampleCount": 1, "aspectRatio": "1:1", "outputOptions": { "mimeType": "image/jpeg", "compressionQuality": 80 } }
      })
    });

    if (!response.ok) throw new Error(`Vertex AI Error: ${await response.text()}`);
    const result = await response.json();
    const imageBase64 = result.predictions?.[0]?.bytesBase64Encoded;

    // 4. STORAGE
    const imageBuffer = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    const filePath = `public/${podRes.data.user_id}/${podcast_id}-cover.jpg`;

    await supabaseAdmin.storage.from('podcasts').upload(filePath, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    await supabaseAdmin.from('micro_pods').update({
      cover_image_url: publicUrl.publicUrl
    }).eq('id', podcast_id);

    return new Response(JSON.stringify({ success: true, url: publicUrl.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    console.error(`🔥 [Image Error]:`, err);
    return new Response(JSON.stringify({ success: false, error: "Image Fail" }), { status: 500 });
  }
};

serve(guard(handler));