// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 15.0 (Mobile Deployment Fix - Direct Relative Imports)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";
import { buildPrompt, cleanTextForSpeech } from "../_shared/ai.ts";

const InvokePayloadSchema = z.object({
  job_id: z.number(),
  podcast_id: z.number(),
  agent_name: z.string().default("cover-art-director-v1"),
  trace_id: z.string().optional()
});

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const supabaseAdmin: SupabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const payload = await request.json();
    const { podcast_id, agent_name } = InvokePayloadSchema.parse(payload);

    const [podRes, agentRes] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcast_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template, model_identifier').eq('agent_name', agent_name).single()
    ]);

    if (!podRes.data || !agentRes.data) throw new Error("Data incomplete");

    const visualPrompt = buildPrompt(agentRes.data.prompt_template, { title: podRes.data.title, script_summary: podRes.data.script_text.substring(0, 300) });
    const accessToken = await getGoogleAccessToken();
    const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${Deno.env.get("GOOGLE_PROJECT_ID")}/locations/us-central1/publishers/google/models/${agentRes.data.model_identifier || 'imagegeneration@006'}:predict`;

    const response = await fetch(vertexUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: [{ "prompt": visualPrompt }], parameters: { "sampleCount": 1, "aspectRatio": "1:1" } })
    });

    if (!response.ok) throw new Error("Vertex AI Fail");
    const result = await response.json();
    const imageBuffer = Uint8Array.from(atob(result.predictions[0].bytesBase64Encoded), (c) => c.charCodeAt(0));
    const filePath = `public/${podRes.data.user_id}/${podcast_id}-cover.jpg`;

    await supabaseAdmin.storage.from('podcasts').upload(filePath, imageBuffer, { contentType: 'image/jpeg', upsert: true });
    const { data: publicUrl } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);

    await supabaseAdmin.from('micro_pods').update({ cover_image_url: publicUrl.publicUrl }).eq('id', podcast_id);

    return new Response(JSON.stringify({ success: true, url: publicUrl.publicUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
};

serve(guard(handler));