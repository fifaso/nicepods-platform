// supabase/functions/admin-backfill-images/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL: Ejecuta las tareas de forma secuencial y con cadencia.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("FATAL: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados.");
}
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const IMAGE_AGENT = 'cover-art-director-v1';
const DELAY_BETWEEN_INVOCATIONS = 2000; // 2 segundos de pausa para no exceder la cuota.
serve(async (req)=>{
  console.log("🚀 Iniciando función de backfilling de carátulas (modo secuencial)...");
  try {
    const { data: podcastsToUpdate, error: podcastsError } = await supabaseAdmin.from('micro_pods').select('id').is('cover_image_url', null);
    if (podcastsError) throw podcastsError;
    if (!podcastsToUpdate || podcastsToUpdate.length === 0) {
      return new Response(JSON.stringify({
        message: "✅ No hay podcasts que necesiten una carátula."
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log(`ℹ️ Se encontraron ${podcastsToUpdate.length} podcasts. Iniciando procesamiento uno por uno...`);
    let successCount = 0;
    let failCount = 0;
    for (const podcast of podcastsToUpdate){
      console.log(`---`);
      console.log(`🔍 Procesando podcast con ID: ${podcast.id}`);
      try {
        const { data: job, error: jobError } = await supabaseAdmin.from('podcast_creation_jobs').select('id').eq('micro_pod_id', podcast.id).order('created_at', {
          ascending: false
        }).limit(1).single();
        if (jobError || !job) {
          console.warn(`⚠️ No se pudo encontrar un 'job' para el podcast ${podcast.id}. Saltando...`);
          failCount++;
          continue;
        }
        console.log(`✔️ Invocando 'generate-cover-image' para el job ${job.id}`);
        const { error: invokeError } = await supabaseAdmin.functions.invoke('generate-cover-image', {
          body: {
            job_id: job.id,
            agent_name: IMAGE_AGENT
          }
        });
        if (invokeError) {
          throw invokeError;
        }
        console.log(`✅ ¡Invocación exitosa para el job ${job.id}!`);
        successCount++;
      } catch (innerError) {
        console.error(`❌ Error procesando el podcast ${podcast.id}:`, innerError.message);
        failCount++;
      }
      await new Promise((resolve)=>setTimeout(resolve, DELAY_BETWEEN_INVOCATIONS));
    }
    return new Response(JSON.stringify({
      message: `🎉 Backfilling completado. Éxitos: ${successCount}, Fallos: ${failCount}.`
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("❌ Error catastrófico en la función de backfilling:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});