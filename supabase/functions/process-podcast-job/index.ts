// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 12.0 (Remix Stability: Enhanced Logging & Error Handling)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { guard } from "../_shared/guard.ts"; 

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const DEFAULT_AGENT = 'script-architect-v1';
const REMIX_AGENT = 'reply-synthesizer-v1';

// Usamos Flash para velocidad o Pro para calidad. 
// Para Remixes cortos, Flash suele ser suficiente y menos propenso a timeouts.
const AI_MODEL = "gemini-3-flash-preview"; 

const WebhookPayloadSchema = z.object({
  job_id: z.number()
});

// --- UTILIDADES ---

function buildFinalPrompt(template: string, inputs: any, extraContext: any = {}) {
  let finalPrompt = template;
  const allData = { ...inputs, ...extraContext };

  for (const key in allData) {
    if (Object.prototype.hasOwnProperty.call(allData, key)) {
      // Sanitización básica de strings para no romper el prompt
      let value = typeof allData[key] === 'object' ? JSON.stringify(allData[key]) : String(allData[key]);
      value = value.replace(/"/g, '\\"'); // Escapar comillas dobles
      finalPrompt = finalPrompt.split(`{{${key}}}`).join(value);
    }
  }
  finalPrompt = finalPrompt.replace(/{{.*?}}/g, ""); // Limpiar variables no usadas
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
    console.warn("Fallo al parsear JSON IA, usando texto crudo.");
  }
  return { title: originalTopic || "Nuevo Podcast", scriptBody: rawText };
}

// --- HANDLER ---

const handler = async (request: Request): Promise<Response> => {
    let job: any = null;
    
    try {
        const reqJson = await request.json();
        const { job_id } = WebhookPayloadSchema.parse(reqJson);
        
        // 1. Obtener Job
        const { data: jobData, error: jobError } = await supabaseAdmin
            .from('podcast_creation_jobs')
            .select('*')
            .eq('id', job_id)
            .single();
            
        if (jobError || !jobData) throw new Error(`Trabajo ${job_id} no encontrado.`);
        job = jobData;

        console.log(`🚀 [Process] Iniciando Job ${job.id}. Mode: ${job.payload.creation_mode || 'standard'}`);
        await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing' }).eq('id', job.id);
        
        const payload = job.payload || {};
        const inputs = payload.inputs || {};
        const creationMode = payload.creation_mode || 'standard';
        
        // Selección de Agente
        const agentName = creationMode === 'remix' ? REMIX_AGENT : (payload.agentName || DEFAULT_AGENT);
        
        const { final_script, final_title, sources, parent_id, quote_context, user_reaction } = payload;
        
        let processedScriptData = { title: "", scriptBody: "", sources: [] as any[] };

        // --- RUTA A: GUION PRE-DEFINIDO (Edición manual) ---
        if (final_script && final_title) {
            console.log(`[Process] Usando guion editado manualmente.`);
            processedScriptData = { title: final_title, scriptBody: final_script, sources: sources || [] };
        } 
        // --- RUTA B: GENERACIÓN IA (Standard & Remix) ---
        else {
            console.log(`[Process] Generando con agente: '${agentName}'`);
            
            // Buscar Prompt
            const { data: promptData } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agentName).single();
            if (!promptData) {
                // Fallback de emergencia si no existe el agente de remix
                if (creationMode === 'remix') throw new Error(`Agente crítico '${agentName}' no encontrado en DB.`);
                throw new Error(`Agente '${agentName}' no encontrado.`);
            }

            // Preparar Contexto
            const remixContext = creationMode === 'remix' ? {
                quote_context: quote_context || "Contexto general del debate.",
                user_reaction: user_reaction || "Sin comentario específico.",
            } : {};

            const finalPrompt = buildFinalPrompt(promptData.prompt_template, inputs, remixContext);
            
            // Llamada a Gemini
            const scriptGenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
            const scriptResponse = await fetch(scriptGenApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
            });

            if (!scriptResponse.ok) {
                const errTxt = await scriptResponse.text();
                throw new Error(`Gemini Error (${scriptResponse.status}): ${errTxt}`);
            }

            const scriptResult = await scriptResponse.json();
            const generatedText = scriptResult.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!generatedText) throw new Error("Respuesta IA vacía (Blocked or Null).");

            const topicFallback = inputs.topic || (creationMode === 'remix' ? `Re: ${parent_id}` : "Nuevo Podcast");
            const extracted = extractContentFromResponse(generatedText, topicFallback);
            
            processedScriptData = { title: extracted.title, scriptBody: extracted.scriptBody, sources: [] };
        }

        // Validación Final de Contenido
        if (!processedScriptData.scriptBody || processedScriptData.scriptBody.length < 5) {
            throw new Error("El guion generado es inválido o vacío.");
        }

        // 3. GUARDAR EN DB
        // Los remixes nacen como 'pending_approval' también para que el usuario los revise
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
            creation_mode: creationMode,
            parent_id: parent_id || null, 
            quote_context: quote_context || null
        };

        console.log(`[Process] Insertando podcast en DB...`);
        const { data: newPodcast, error: insertError } = await supabaseAdmin
            .from('micro_pods')
            .insert(insertPayload)
            .select('id')
            .single();
        
        if (insertError) throw new Error(`Error DB Insert: ${insertError.message}`);

        console.log(`[Process] Podcast creado ID: ${newPodcast.id}`);

        // 4. ACTUALIZAR JOB
        const finalJobStatus = inputs.generateAudioDirectly ? 'pending_audio' : 'completed';
        await supabaseAdmin.from('podcast_creation_jobs').update({
            status: finalJobStatus,
            micro_pod_id: newPodcast.id,
            error_message: null
        }).eq('id', job.id);

        // 5. WORKERS (Fire & Forget)
        // Usamos try/catch individuales para que si falla la portada, no mate el proceso entero
        try {
             supabaseAdmin.functions.invoke('generate-cover-image', { body: { job_id: job.id, agent_name: 'cover-art-director-v1' } });
        } catch (e) { console.error("Cover generation trigger failed", e); }

        try {
             supabaseAdmin.functions.invoke('generate-embedding', { body: { podcast_id: newPodcast.id } });
        } catch (e) { console.error("Embedding trigger failed", e); }
        
        if (finalJobStatus === 'pending_audio') {
            console.log(`[Process] Invocando Audio Worker...`);
            supabaseAdmin.functions.invoke('generate-audio-from-script', { body: { job_id: job.id } });
        } else {
            // Notificación solo si no hay audio (si hay audio, la envía el worker de audio al terminar)
            await supabaseAdmin.from('notifications').insert({
                user_id: job.user_id,
                type: 'podcast_created_success',
                data: { podcast_id: newPodcast.id, podcast_title: processedScriptData.title, message: "Tu guion está listo." }
            });
        }
        
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        console.error(`🔥 FATAL JOB ERROR:`, msg);
        if (job) {
            await supabaseAdmin.from('podcast_creation_jobs')
                .update({ status: "failed", error_message: msg })
                .eq('id', job.id);
        }
        throw error;
    }
};

serve(guard(handler));