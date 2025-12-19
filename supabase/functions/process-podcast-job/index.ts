// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 11.0 (Final Robust Remix Logic)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { guard } from "../_shared/guard.ts"; 

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const DEFAULT_AGENT = 'script-architect-v1';

const WebhookPayloadSchema = z.object({
  job_id: z.number()
});

// --- UTILIDADES ---

function buildFinalPrompt(template: string, inputs: any, extraContext: any = {}) {
  let finalPrompt = template;
  
  // Fusionamos inputs normales con contexto extra (Remix)
  const allData = { ...inputs, ...extraContext };

  for (const key in allData) {
    if (Object.prototype.hasOwnProperty.call(allData, key)) {
      const value = typeof allData[key] === 'object' ? JSON.stringify(allData[key]) : String(allData[key]);
      // Reemplazo global seguro
      finalPrompt = finalPrompt.split(`{{${key}}}`).join(value);
    }
  }
  
  // Limpieza de variables no usadas
  finalPrompt = finalPrompt.replace(/{{.*?}}/g, "");
  return finalPrompt;
}

function stripHtml(html: string): string {
   if (!html) return "";
   return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractContentFromResponse(rawText: string, originalTopic: string): { title: string, scriptBody: string } {
  const cleanText = rawText.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
  try {
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    let jsonString = cleanText;
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = cleanText.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(jsonString);
    const title = parsed.title || parsed.suggested_title || parsed.podcast_title || originalTopic;
    const script = parsed.script_body || parsed.script || parsed.text || parsed.content;
    if (script) return { title, scriptBody: script };
  } catch (e) {
    console.warn("Fallo al parsear JSON IA.");
  }
  return { title: originalTopic || "Nuevo Podcast", scriptBody: rawText };
}

// --- HANDLER ---

const handler = async (request: Request): Promise<Response> => {
    let job: any = null;
    
    try {
        const { job_id } = WebhookPayloadSchema.parse(await request.json());
        
        const { data: jobData, error: jobError } = await supabaseAdmin
            .from('podcast_creation_jobs')
            .select('*')
            .eq('id', job_id)
            .single();
            
        if (jobError || !jobData) throw new Error(`Trabajo ${job_id} no encontrado.`);
        job = jobData;

        await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing' }).eq('id', job.id);
        
        const payload = job.payload || {};
        const inputs = payload.inputs || {};
        // Si es remix, usa el agente definido en payload, sino default
        const agentName = payload.agentName || DEFAULT_AGENT; 
        
        const { final_script, final_title, sources, creation_mode, parent_id, quote_context, user_reaction } = payload;
        
        let processedScriptData = { title: "", scriptBody: "", sources: [] as any[] };

        // CASO A: Guion pre-definido
        if (final_script && final_title) {
            processedScriptData = { title: final_title, scriptBody: final_script, sources: sources || [] };
        } 
        // CASO B: Generación IA (Incluye Remix)
        else {
            console.log(`Job ${job.id} (${creation_mode}): Generando con '${agentName}'...`);
            
            const { data: promptData } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agentName).single();
            if (!promptData) throw new Error(`Agente '${agentName}' no encontrado.`);

            // Preparamos contexto extra para el Remix
            const remixContext = creation_mode === 'remix' ? {
                quote_context: quote_context || "Contexto general",
                user_reaction: user_reaction || "",
                parent_context: quote_context // Alias por si el prompt usa otro nombre
            } : {};

            const finalPrompt = buildFinalPrompt(promptData.prompt_template, inputs, remixContext);
            
            const scriptGenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_API_KEY}`;
            const scriptResponse = await fetch(scriptGenApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
            });

            if (!scriptResponse.ok) throw new Error(`Error Gemini: ${await scriptResponse.text()}`);

            const scriptResult = await scriptResponse.json();
            const generatedText = scriptResult.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!generatedText) throw new Error("Respuesta IA vacía.");

            const topicFallback = inputs.topic || (creation_mode === 'remix' ? `Re: ${parent_id}` : "Nuevo Podcast");
            const extracted = extractContentFromResponse(generatedText, topicFallback);
            
            processedScriptData = { title: extracted.title, scriptBody: extracted.scriptBody, sources: [] };
        }

        if (!processedScriptData.scriptBody || processedScriptData.scriptBody.length < 10) {
            throw new Error("El guion generado está vacío.");
        }

        // 3. GUARDAR EN DB (Con Genealogía)
        const initialPodcastStatus = 'pending_approval'; 
        const scriptTextToSave = JSON.stringify({
            script_body: processedScriptData.scriptBody,
            script_plain: stripHtml(processedScriptData.scriptBody)
        });

        const insertPayload: any = {
            user_id: job.user_id,
            title: processedScriptData.title,
            script_text: scriptTextToSave,
            status: initialPodcastStatus,
            creation_data: job.payload,
            sources: processedScriptData.sources,
            creation_mode: creation_mode || 'standard',
            parent_id: parent_id || null, 
            quote_context: quote_context || null
        };

        const { data: newPodcast, error: insertError } = await supabaseAdmin
            .from('micro_pods')
            .insert(insertPayload)
            .select('id')
            .single();
        
        if (insertError) throw new Error(`Error insertando podcast: ${insertError.message}`);

        // 4. ACTUALIZAR JOB
        const finalJobStatus = inputs.generateAudioDirectly ? 'pending_audio' : 'completed';
        await supabaseAdmin.from('podcast_creation_jobs').update({
            status: finalJobStatus,
            micro_pod_id: newPodcast.id,
            error_message: null
        }).eq('id', job.id);

        // 5. WORKERS
        supabaseAdmin.functions.invoke('generate-cover-image', { body: { job_id: job.id, agent_name: 'cover-art-director-v1' } });
        supabaseAdmin.functions.invoke('generate-embedding', { body: { podcast_id: newPodcast.id } }).catch(console.error);
        
        if (finalJobStatus === 'pending_audio') {
            supabaseAdmin.functions.invoke('generate-audio-from-script', { body: { job_id: job.id } });
        } else {
            await supabaseAdmin.from('notifications').insert({
                user_id: job.user_id,
                type: 'podcast_created_success',
                data: { podcast_id: newPodcast.id, podcast_title: processedScriptData.title, message: "Tu respuesta está lista para revisión." }
            });
        }
        
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        if (job) await supabaseAdmin.from('podcast_creation_jobs').update({ status: "failed", error_message: msg }).eq('id', job.id);
        throw error;
    }
};

serve(guard(handler));