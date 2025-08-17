// supabase/functions/process-podcast-job/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

// --- Tipos de Payload y Funciones de Prompt (Completas) ---
type SoloTalkInputs = { topic: string; motivation: string; duration: string; narrativeDepth: string; };
type LinkPointsInputs = { narrative: { title: string; thesis: string; }; tone: string; duration: string; narrativeDepth: string; };
interface PodcastCreationPayload { style: 'solo' | 'link'; inputs: SoloTalkInputs | LinkPointsInputs; }

function buildSoloTalkPrompt(inputs: SoloTalkInputs): string { return `Eres un guionista experto para micro-podcasts. Tu tarea es escribir un guion claro y atractivo.\n\nTEMA: "${inputs.topic}"\nMOTIVACIÓN DEL AUTOR: "${inputs.motivation}"\nDURACIÓN OBJETIVO: "${inputs.duration}"\nPROFUNDIDAD NARRATIVA: "${inputs.narrativeDepth}"\n\nINSTRUCCIONES: Escribe un guion fluido y conversacional en texto plano, con una introducción, desarrollo y conclusión, listo para ser convertido a audio.`; }
function buildLinkPointsPrompt(inputs: LinkPointsInputs): string { return `Eres un narrador experto y un sintetizador de ideas. Tu tarea es escribir un guion de micro-podcast basado en una narrativa y un tono predefinidos.\n\nTÍTULO DE LA NARRATIVA: "${inputs.narrative.title}"\nTESIS CENTRAL: "${inputs.narrative.thesis}"\nTONO DEL GUION: "${inputs.tone}"\nDURACIÓN OBJETIVO: "${inputs.duration}"\nPROFUNDIDAD NARRATIVA: "${inputs.narrativeDepth}"\n\nINSTRUCCIONES: Desarrolla la tesis en un guion completo y coherente, manteniendo el tono especificado. El guion debe ser fluido, en texto plano y listo para ser convertido a audio.`; }

const JobPayloadSchema = z.object({ style: z.enum(['solo', 'link']), inputs: z.object({}).passthrough() });

serve(async (req) => {
  let jobId: number | null = null;
  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    const { job_id } = await req.json();
    jobId = job_id;
    if (!jobId) { throw new Error("Missing 'job_id'.") }

    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', jobId);
    
    const { data: job, error: jobError } = await supabaseAdmin.from('podcast_creation_jobs').select('user_id, payload, retry_count').eq('id', jobId).single();
    if (jobError || !job) { throw new Error(`Job ${jobId} not found.`) }
    
    const payload = JobPayloadSchema.parse(job.payload);
    const userId = job.user_id;

    const { data: subData, error: subError } = await supabaseAdmin.from('subscriptions').select('plans(monthly_creation_limit)').eq('id', userId).single();
    if (subError || !subData) { throw new Error(`Could not find subscription for user ${userId}.`) }
    
    const limit = subData.plans?.monthly_creation_limit ?? 0;
    if (limit !== -1) {
      const { count: createdCount, error: countError } = await supabaseAdmin.from('micro_pods').select('id', { count: 'exact' }).eq('user_id', userId);
      if (countError) { throw new Error(`Could not count existing pods: ${countError.message}`) }
      const { data: profileData } = await supabaseAdmin.from('profiles').select('active_creation_jobs').eq('id', userId).single();
      const activeJobs = profileData?.active_creation_jobs ?? 0;
      if ((createdCount ?? 0) + activeJobs - 1 >= limit) {
        throw new Error(`Monthly creation limit of ${limit} reached (including queued jobs).`);
      }
    }

    let prompt = "";
    let podcastTitle = "";
    let podcastDescription = "";
    if(payload.style === 'solo') { const inputs = payload.inputs as SoloTalkInputs; prompt = buildSoloTalkPrompt(inputs); podcastTitle = inputs.topic; podcastDescription = inputs.motivation; }
    else { const inputs = payload.inputs as LinkPointsInputs; prompt = buildLinkPointsPrompt(inputs); podcastTitle = inputs.narrative.title; podcastDescription = inputs.narrative.thesis; }
    
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY')!;
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const generatedScript = result.response.text();
    if (!generatedScript) { throw new Error("AI did not return a valid script.") }

    // (Futuro: Lógica de ElevenLabs y Supabase Storage aquí)
    const audioUrl = `https://example.com/audio-for-job-${jobId}.mp3`;

    const { data: newPodcast, error: podError } = await supabaseAdmin.from('micro_pods').insert({ user_id: userId, title: podcastTitle, description: podcastDescription, script_text: generatedScript, audio_url: audioUrl, status: 'pending_approval' }).select('id').single();
    if (podError || !newPodcast) { throw new Error(`Failed to create final podcast: ${podError?.message}`) }

    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'completed', micro_pod_id: newPodcast.id, updated_at: new Date().toISOString() }).eq('id', jobId);
    await supabaseAdmin.rpc('decrement_active_jobs', { p_user_id: userId });

    return new Response(JSON.stringify({ success: true, message: `Job ${jobId} completed.` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error(`Critical error processing job ${jobId}: ${errorMessage}`);
    if (jobId) {
      const { data: job } = await supabaseAdmin.from('podcast_creation_jobs').select('user_id, retry_count').eq('id', jobId).single();
      const retryCount = job?.retry_count ?? 0;
      if (retryCount < 2 && (errorMessage.includes('fetch') || errorMessage.includes('timeout'))) {
         await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'pending', retry_count: retryCount + 1, error_message: `Retryable error: ${errorMessage}` }).eq('id', jobId);
      } else {
         await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'failed', error_message: errorMessage }).eq('id', jobId);
      }
      if (job?.user_id) {
        await supabaseAdmin.rpc('decrement_active_jobs', { p_user_id: job.user_id });
      }
    }
    return new Response(JSON.stringify({ error: "An internal server error occurred." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
});