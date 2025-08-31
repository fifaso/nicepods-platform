// supabase/functions/process-podcast-job/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"; // <--- CORRECCIÓN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.11.3";
import { corsHeaders } from "../_shared/cors.ts";

const SoloInputsSchema = z.object({ topic: z.string(), motivation: z.string(), duration: z.string(), narrativeDepth: z.string() });
const LinkInputsSchema = z.object({ narrative: z.object({ title: z.string(), thesis: z.string() }), tone: z.string(), duration: z.string(), narrativeDepth: z.string() });
const JobPayloadSchema = z.discriminatedUnion("style", [
  z.object({ style: z.literal("solo"), inputs: SoloInputsSchema }),
  z.object({ style: z.literal("link"), inputs: LinkInputsSchema }),
]);

interface Plan { monthly_creation_limit: number; }
interface Subscription { plans: Plan | null; }
interface ProfileWithPlan { subscriptions: Subscription | null; }

const MAX_RETRIES = 2;
const API_TIMEOUT_MILLISECONDS = 45000;

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  let jobId = null;
  let jobData: { user_id: string; payload: unknown; retry_count: number; } | null = null;
  const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  
  try {
    const { job_id } = await request.json();
    jobId = job_id;
    if (!jobId) throw new Error("Se requiere un 'job_id' en el cuerpo de la solicitud.");
    
    await supabaseAdmin.from("podcast_creation_jobs").update({ status: "processing" }).eq("id", jobId);

    const { data: job } = await supabaseAdmin.from("podcast_creation_jobs").select("user_id, payload, retry_count").eq("id", jobId).single();
    if (!job) throw new Error(`El trabajo con ID ${jobId} no fue encontrado.`);
    jobData = job;

    const payload = JobPayloadSchema.parse(job.payload);
    const userId = job.user_id;

    // Lógica de Verificación de Cuota
    const { data: profileData } = await supabaseAdmin.from('profiles').select('subscriptions( plans( monthly_creation_limit ) )').eq('id', userId).single<ProfileWithPlan>();
    const limit = profileData?.subscriptions?.plans?.monthly_creation_limit ?? 0;
    const { count } = await supabaseAdmin.from('micro_pods').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    if ((count ?? 0) >= limit) throw new Error(`Límite de creación mensual (${limit}) alcanzado.`);

    // Lógica de Generación de Guion
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("La clave GOOGLE_AI_API_KEY no está configurada.");

    const { data: promptData } = await supabaseAdmin.from("ai_prompts").select("prompt_template").eq("agent_name", `create-podcast-script-${payload.style}`).single();
    if (!promptData) throw new Error(`Plantilla de prompt para '${payload.style}' no encontrada.`);

    let prompt = promptData.prompt_template;
    let podcastTitle = "", podcastDescription = "";
    if (payload.style === "solo") {
      const { topic, motivation, duration, narrativeDepth } = payload.inputs;
      podcastTitle = topic; podcastDescription = motivation;
      prompt = prompt.replace("{{topic}}", topic).replace("{{motivation}}", motivation).replace("{{duration}}", duration).replace("{{narrativeDepth}}", narrativeDepth);
    } else {
      const { narrative, tone, duration, narrativeDepth } = payload.inputs;
      podcastTitle = narrative.title; podcastDescription = narrative.thesis;
      prompt = prompt.replace("{{narrativeTitle}}", narrative.title).replace("{{narrativeThesis}}", narrative.thesis).replace("{{tone}}", tone).replace("{{duration}}", duration).replace("{{narrativeDepth}}", narrativeDepth);
    }
    
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout de la API de IA.`)), API_TIMEOUT_MILLISECONDS));
    const apiCallPromise = model.generateContent(prompt);
    const result = await Promise.race([apiCallPromise, timeoutPromise]);
    const generatedScript = result.response.text() ?? "";
    if (!generatedScript) throw new Error("La IA no devolvió un guion válido.");

    const { data: newPodcast } = await supabaseAdmin.from("micro_pods").insert({
      user_id: userId, title: podcastTitle, description: podcastDescription, script_text: generatedScript, status: "pending_approval"
    }).select("id").single();
    if (!newPodcast) throw new Error(`Error al guardar el podcast.`);

    await supabaseAdmin.from("podcast_creation_jobs").update({ status: "completed", micro_pod_id: newPodcast.id }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, podcastId: newPodcast.id }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error procesando el trabajo ${jobId}: ${errorMessage}`);
    if (jobId && jobData && jobData.retry_count < MAX_RETRIES) {
      await supabaseAdmin.from("podcast_creation_jobs").update({
        status: "pending", retry_count: jobData.retry_count + 1, error_message: `Intento ${jobData.retry_count + 1} falló: ${errorMessage}`
      }).eq("id", jobId);
    } else if (jobId) {
      await supabaseAdmin.from("podcast_creation_jobs").update({
        status: "failed", error_message: `Falló después de ${MAX_RETRIES + 1} intentos. Error final: ${errorMessage}`
      }).eq("id", jobId);
    }
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});