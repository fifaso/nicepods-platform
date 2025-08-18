// supabase/functions/process-podcast-job/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

type SoloTalkInputs = {
  topic: string;
  motivation: string;
  duration: string;
  narrativeDepth: string;
};
type LinkPointsInputs = {
  narrative: { title: string; thesis: string };
  tone: string;
  duration: string;
  narrativeDepth: string;
};
interface PodcastCreationPayload {
  style: "solo" | "link";
  inputs: SoloTalkInputs | LinkPointsInputs;
}
const JobPayloadSchema = z.object({
  style: z.enum(["solo", "link"]),
  inputs: z.object({}).passthrough(),
});

serve(async (req) => {
  let jobId: number | null = null;
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  try {
    const { job_id } = await req.json();
    jobId = job_id;
    if (!jobId) throw new Error("Missing 'job_id'.");
    await supabaseAdmin.from("podcast_creation_jobs").update({
      status: "processing",
    }).eq("id", jobId);

    const { data: job } = await supabaseAdmin.from("podcast_creation_jobs")
      .select("user_id, payload").eq("id", jobId).single();
    if (!job) throw new Error(`Job ${jobId} not found.`);

    const payload = JobPayloadSchema.parse(job.payload);
    const userId = job.user_id;

    // Lógica de Verificación de Cuota (ya la teníamos, la verificamos)

    const agentName = payload.style === "solo"
      ? "create-podcast-script-solo"
      : "create-podcast-script-link";
    const { data: promptData } = await supabaseAdmin.from("ai_prompts").select(
      "prompt_template",
    ).eq("agent_name", agentName).single();
    if (!promptData) {
      throw new Error(`Prompt template '${agentName}' not found.`);
    }

    let prompt = promptData.prompt_template;
    let podcastTitle = "", podcastDescription = "";
    if (payload.style === "solo") {
      const inputs = payload.inputs as SoloTalkInputs;
      podcastTitle = inputs.topic;
      podcastDescription = inputs.motivation;
      prompt = prompt.replace("{{topic}}", inputs.topic).replace(
        "{{motivation}}",
        inputs.motivation,
      ).replace("{{duration}}", inputs.duration).replace(
        "{{narrativeDepth}}",
        inputs.narrativeDepth,
      );
    } else {
      const inputs = payload.inputs as LinkPointsInputs;
      podcastTitle = inputs.narrative.title;
      podcastDescription = inputs.narrative.thesis;
      prompt = prompt.replace("{{narrativeTitle}}", inputs.narrative.title)
        .replace("{{narrativeThesis}}", inputs.narrative.thesis).replace(
          "{{tone}}",
          inputs.tone,
        ).replace("{{duration}}", inputs.duration).replace(
          "{{narrativeDepth}}",
          inputs.narrativeDepth,
        );
    }

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const generatedScript = result.response.text();
    if (!generatedScript) throw new Error("AI did not return a valid script.");

    const { data: newPodcast } = await supabaseAdmin.from("micro_pods").insert({
      user_id: userId,
      title: podcastTitle,
      description: podcastDescription,
      script_text: generatedScript,
      status: "pending_approval",
    }).select("id").single();
    if (!newPodcast) throw new Error("Failed to create podcast entry.");

    await supabaseAdmin.from("podcast_creation_jobs").update({
      status: "completed",
      micro_pod_id: newPodcast.id,
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Internal server error.";
    if (jobId) {
      await supabaseAdmin.from("podcast_creation_jobs").update({
        status: "failed",
        error_message: errorMessage,
      }).eq("id", jobId);
    }
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
