// supabase/functions/process-podcast-job/index.ts
// VERSIÓN: 9.0 (Restored Logic: Create First, Then Process + Private Notification)

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

// Limpiador HTML -> Texto Plano (Para Embeddings y TTS)
function stripHtml(html: string): string {
   if (!html) return "";
   return html
     .replace(/<[^>]+>/g, ' ') 
     .replace(/\s+/g, ' ')     
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

// --- HANDLER PRINCIPAL ---

const handler = async (request: Request): Promise<Response> => {
    let job: any = null;
    
    try {
        // 1. OBTENER EL TRABAJO
        const { job_id } = WebhookPayloadSchema.parse(await request.json());
        
        // Consultamos el trabajo. NOTA: No exigimos micro_pod_id aquí porque aún no existe.
        const { data: jobData, error: jobError } = await supabaseAdmin
            .from('podcast_creation_jobs')
            .select('*')
            .eq('id', job_id)
            .single();
            
        if (jobError || !jobData) throw new Error(`Trabajo ${job_id} no encontrado.`);
        job = jobData;

        // Marcamos como procesando
        await supabaseAdmin.from('podcast_creation_jobs').update({ status: 'processing' }).eq('id', job.id);
        
        const payload = job.payload || {};
        const inputs = payload.inputs || {};
        const agentName = payload.agentName || DEFAULT_AGENT; 
        
        const { final_script, final_title, sources } = payload;
        
        // 2. DETERMINAR CONTENIDO (Guion)
        let processedScriptData = { 
            title: "", 
            scriptBody: "",
            sources: [] as any[]
        };

        // CASO A: Guion ya editado en Frontend
        if (final_script && final_title) {
            console.log(`Job ${job.id}: Usando guion editado.`);
            processedScriptData = {
                title: final_title,
                scriptBody: final_script, 
                sources: sources || []
            };
        } 
        // CASO B: Generar Guion con IA (Fallback o API directa)
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

            const topicFallback = inputs.topic || inputs.solo_topic || "Nuevo Podcast";
            const extracted = extractContentFromResponse(generatedText, topicFallback);
            
            processedScriptData = {
                title: extracted.title,
                scriptBody: extracted.scriptBody,
                sources: [] 
            };
        }

        // Validación de contenido mínimo
        if (!processedScriptData.scriptBody || processedScriptData.scriptBody.length < 10) {
            throw new Error("El guion generado está vacío o es demasiado corto.");
        }

        // 3. CREAR EL PODCAST EN DB (AQUÍ NACE EL ID)
        
        // Si hay audio pedido, nace como 'pending_approval' (Borrador).
        // Si es solo texto, podría ser 'published', pero por consistencia usamos 'pending_approval' también si quieres revisión.
        // Asumiremos la lógica de QA: Todo nace privado.
        const initialPodcastStatus = 'pending_approval'; 
        
        // Preparamos el JSON estandarizado
        const scriptTextToSave = JSON.stringify({
            script_body: processedScriptData.scriptBody,       // HTML
            script_plain: stripHtml(processedScriptData.scriptBody) // Texto limpio para búsquedas
        });

        const { data: newPodcast, error: insertError } = await supabaseAdmin
            .from('micro_pods')
            .insert({
                user_id: job.user_id,
                title: processedScriptData.title,
                script_text: scriptTextToSave,
                status: initialPodcastStatus,
                creation_data: job.payload,
                sources: processedScriptData.sources 
            })
            .select('id')
            .single();
        
        if (insertError) throw new Error(`Error insertando podcast: ${insertError.message}`);

        console.log(`Podcast creado con ID: ${newPodcast.id}`);

        // 4. VINCULAR JOB CON PODCAST
        const finalJobStatus = inputs.generateAudioDirectly ? 'pending_audio' : 'completed';
        
        await supabaseAdmin.from('podcast_creation_jobs').update({
            status: finalJobStatus,
            micro_pod_id: newPodcast.id,
            error_message: null
        }).eq('id', job.id);

        // 5. DISPARAR WORKERS (Cadena de Producción)
        
        // A. Portada (Siempre)
        supabaseAdmin.functions.invoke('generate-cover-image', { 
            body: { job_id: job.id, agent_name: 'cover-art-director-v1' } 
        });
        
        // B. Embeddings (Siempre - Para el Buscador)
        supabaseAdmin.functions.invoke('generate-embedding', { 
            body: { podcast_id: newPodcast.id } 
        }).catch(err => console.error("Error silencioso embeddings:", err));
        
        // C. Audio (Si se solicitó)
        if (finalJobStatus === 'pending_audio') {
            supabaseAdmin.functions.invoke('generate-audio-from-script', { 
                body: { job_id: job.id } 
            });
        } else {
            // Si NO hay audio, notificamos al creador de inmediato que el TEXTO está listo
            await supabaseAdmin.from('notifications').insert({
                user_id: job.user_id,
                type: 'podcast_created_success', // Tipo genérico, el frontend maneja el mensaje
                data: { 
                    podcast_id: newPodcast.id, 
                    podcast_title: processedScriptData.title,
                    message: "Tu guion está listo para revisión."
                }
            });
        }
        
        // NOTA: Si hay audio, la notificación la envía la función 'generate-audio' al terminar.
        // NOTA: La notificación a los seguidores la maneja el TRIGGER de base de datos cuando pasa a 'published'.

        return new Response(JSON.stringify({ success: true, message: "Orquestación iniciada." }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        console.error(`Fallo Job ${job?.id}:`, msg);
        
        if (job) {
            await supabaseAdmin.from('podcast_creation_jobs')
                .update({ status: "failed", error_message: msg })
                .eq('id', job.id);
        }
        throw error;
    }
};

serve(guard(handler));