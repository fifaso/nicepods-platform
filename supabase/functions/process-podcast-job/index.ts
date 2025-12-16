// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 7.0 (Full Pipeline: Guard + Dual Storage + Audio + Image + Embeddings)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { guard } from "../_shared/guard.ts"; // <--- INTEGRACIÓN DEL ESTÁNDAR

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const DEFAULT_AGENT = 'script-architect-v1';

const WebhookPayloadSchema = z.object({
  job_id: z.number()
});

// --- UTILIDADES ---

function buildFinalPrompt(template: string, inputs: any) {
  let finalPrompt = template;
  for (const key in inputs) {
    if (Object.prototype.hasOwnProperty.call(inputs, key)) {
      const value = typeof inputs[key] === 'object' ? JSON.stringify(inputs[key]) : String(inputs[key]);
      finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  }
  finalPrompt = finalPrompt.replace(/{{.*?}}/g, "");
  return finalPrompt;
}

// Limpiador HTML -> Texto Plano (Vital para futuros Embeddings/Búsqueda)
function stripHtml(html: string): string {
   if (!html) return "";
   return html
     .replace(/<[^>]+>/g, ' ') // Elimina etiquetas
     .replace(/\s+/g, ' ')     // Colapsa espacios
     .trim();
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

    if (script) {
        return { title, scriptBody: script };
    }
  } catch (e) {
    console.warn("Fallo al parsear JSON de la IA. Usando Fallback a Texto Plano.");
  }

  return {
    title: originalTopic || "Nuevo Podcast",
    scriptBody: rawText 
  };
}

async function notifyFollowers(creatorId: string, podcastId: number, podcastTitle: string) {
  try {
    const { data: creatorProfile } = await supabaseAdmin
      .from('profiles').select('full_name').eq('id', creatorId).single();
    if (!creatorProfile) return;

    const { data: followers } = await supabaseAdmin
      .from('followers').select('follower_id').eq('following_id', creatorId);
    if (!followers || followers.length === 0) return;

    const notifications = followers.map(f => ({
      user_id: f.follower_id,
      type: 'new_podcast_from_followed_user',
      data: { actor_id: creatorId, actor_name: creatorProfile.full_name, podcast_id: podcastId, podcast_title: podcastTitle }
    }));
    
    await supabaseAdmin.from('notifications').insert(notifications);
  } catch (error: any) {
    console.error("Error en fan-out:", error.message);
  }
}

// --- LOGICA DE NEGOCIO (HANDLER) ---

const handler = async (request: Request): Promise<Response> => {
    let job: any = null;
    
    // 1. Parsing y Validación Inicial
    const { job_id } = WebhookPayloadSchema.parse(await request.json());
    
    // Recuperar Job
    const { data: jobData, error: jobError } = await supabaseAdmin.from('podcast_creation_jobs').select('*').eq('id', job_id).single();
    if (jobError || !jobData) throw new Error(`Trabajo ${job_id} no encontrado.`);
    job = jobData;

    // Marcar como procesando
    await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing' }).eq('id', job.id);
    
    try {
        const payload = job.payload || {};
        const inputs = payload.inputs || {};
        const agentName = payload.agentName || DEFAULT_AGENT; 
        
        const { final_script, final_title, sources } = payload;
        
        let processedScriptData = { 
            title: "", 
            scriptBody: "",
            sources: [] as any[]
        };

        // --- RUTA A: GUION EXISTENTE (Normal) ---
        if (final_script && final_title) {
            console.log(`Job ${job.id}: Usando guion editado.`);
            processedScriptData = {
                title: final_title,
                scriptBody: final_script, 
                sources: sources || []
            };
        } 
        // --- RUTA B: GENERACIÓN BACKEND (Legacy/Emergency) ---
        else {
            console.log(`Job ${job.id}: Generando con agente '${agentName}'...`);
            
            let templateToUse;
            const { data: promptData } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agentName).single();
            
            if (promptData) {
                templateToUse = promptData.prompt_template;
            } else {
                const { data: defaultPrompt } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', DEFAULT_AGENT).single();
                templateToUse = defaultPrompt?.prompt_template || ""; 
            }

            if (!templateToUse) throw new Error("No se encontró ningún prompt válido.");

            const finalPrompt = buildFinalPrompt(templateToUse, inputs);
            
            const scriptGenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GOOGLE_API_KEY}`;
            const scriptResponse = await fetch(scriptGenApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
            });

            if (!scriptResponse.ok) throw new Error(`Error Gemini: ${await scriptResponse.text()}`);

            const scriptResult = await scriptResponse.json();
            const generatedText = scriptResult.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!generatedText) throw new Error("Respuesta IA vacía.");

            const topicFallback = inputs.topic || inputs.solo_topic || "Nuevo Podcast";
            const extracted = extractContentFromResponse(generatedText, topicFallback);
            
            processedScriptData = {
                title: extracted.title,
                scriptBody: extracted.scriptBody,
                sources: [] 
            };
        }

        // Validación Final
        if (!processedScriptData.scriptBody || processedScriptData.scriptBody.length < 10) {
            throw new Error("El guion generado está vacío o es demasiado corto.");
        }

        // --- PREPARACIÓN DE DATOS INTELIGENTES ---
        const initialPodcastStatus = inputs.generateAudioDirectly ? 'pending_approval' : 'published';
        
        // [MEJORA V6.0] Guardado Dual (HTML + Plain)
        const scriptTextToSave = JSON.stringify({
            script_body: processedScriptData.scriptBody,       // HTML Rico (para Visor)
            script_plain: stripHtml(processedScriptData.scriptBody) // Texto Plano (para Embeddings/Search)
        });

        // Inserción en DB
        const { data: newPodcast, error: insertError } = await supabaseAdmin.from('micro_pods').insert({
            user_id: job.user_id,
            title: processedScriptData.title,
            script_text: scriptTextToSave,
            status: initialPodcastStatus,
            creation_data: job.payload,
            sources: processedScriptData.sources 
        }).select('id').single();
        
        if (insertError) throw new Error(`Error DB: ${insertError.message}`);

        // Actualización Job
        const finalJobStatus = inputs.generateAudioDirectly ? 'pending_audio' : 'completed';
        await supabaseAdmin.from('podcast_creation_jobs').update({
            status: finalJobStatus,
            micro_pod_id: newPodcast.id,
            error_message: null
        }).eq('id', job.id);

        // --- WORKERS ASÍNCRONOS ---
        // Fire-and-forget invocations (Sentry capturará si la invocación falla, pero no bloquea el flujo principal)
        
        // 1. Portada
        supabaseAdmin.functions.invoke('generate-cover-image', { body: { job_id: job.id, agent_name: 'cover-art-director-v1' } });
        
        // 2. Audio (Si aplica)
        if (finalJobStatus === 'pending_audio') {
            supabaseAdmin.functions.invoke('generate-audio-from-script', { body: { job_id: job.id } });
        }

        // 3. [NUEVO] Embeddings (Inteligencia de Búsqueda)
        supabaseAdmin.functions.invoke('generate-embedding', { 
            body: { podcast_id: newPodcast.id } 
        }).catch(err => console.error("Fallo silencioso en embedding:", err));

        // 4. Notificaciones (Fan-out)
        (async () => {
            try {
                await supabaseAdmin.from('notifications').insert({
                    user_id: job.user_id,
                    type: 'podcast_created_success',
                    data: { podcast_id: newPodcast.id, podcast_title: processedScriptData.title }
                });
                await notifyFollowers(job.user_id, newPodcast.id, processedScriptData.title);
            } catch (e) {
                console.error("Error en notificaciones secundarias (No crítico):", e);
            }
        })();
        
        return new Response(JSON.stringify({ success: true, message: "Job completado." }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        // En caso de error dentro del flujo de negocio, marcamos el job como fallido
        // El Guard (Sentry) capturará la excepción y la reportará también.
        const msg = error instanceof Error ? error.message : "Error desconocido";
        if (job) {
            await supabaseAdmin.from('podcast_creation_jobs').update({ status: "failed", error_message: msg }).eq('id', job.id);
        }
        throw error; // Re-lanzamos para que el Guard haga su trabajo
    }
};

// --- PUNTO DE ENTRADA PROTEGIDO ---
serve(guard(handler));