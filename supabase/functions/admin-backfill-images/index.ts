// supabase/functions/admin-backfill-images/index.ts
// VERSIÓN INTELIGENTE: Solo procesa imágenes que NO han sido optimizadas (PNGs o antiguas).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("FATAL: Credenciales faltantes.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const IMAGE_AGENT = 'cover-art-director-v1';
const DELAY_BETWEEN_INVOCATIONS = 2000; // Bajamos a 2s para ir un poco más rápido

serve(async (req) => {
  console.log("🚀 Iniciando Renovación Inteligente de Carátulas...");

  try {
    // [CAMBIO ESTRATÉGICO]: Filtro Inteligente
    // Seleccionamos podcasts donde la URL NO termine en '.jpg'.
    // Esto asume que las optimizadas son .jpg y las viejas pesadas son .png (o null).
    const { data: podcastsToUpdate, error: podcastsError } = await supabaseAdmin
      .from('micro_pods')
      .select('id, cover_image_url')
      .not('cover_image_url', 'like', '%.jpg%') // <--- EL FILTRO MÁGICO
      .order('created_at', { ascending: false })
      .limit(50); 

    if (podcastsError) throw podcastsError;

    if (!podcastsToUpdate || podcastsToUpdate.length === 0) {
      return new Response(JSON.stringify({
        message: "✅ ¡Todo limpio! No quedan imágenes pendientes de optimizar."
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`ℹ️ Se encontraron ${podcastsToUpdate.length} podcasts pendientes (PNGs o sin cover).`);

    let successCount = 0;
    let failCount = 0;

    for (const podcast of podcastsToUpdate) {
      console.log(`--- Procesando Podcast ID: ${podcast.id} ---`);

      try {
        const { data: job, error: jobError } = await supabaseAdmin
          .from('podcast_creation_jobs')
          .select('id')
          .eq('micro_pod_id', podcast.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (jobError || !job) {
          console.warn(`⚠️ Sin Job asociado. Saltando.`);
          failCount++;
          continue;
        }

        // Invocamos la optimización
        const { error: invokeError } = await supabaseAdmin.functions.invoke('generate-cover-image', {
          body: { job_id: job.id, agent_name: IMAGE_AGENT }
        });

        if (invokeError) throw invokeError;

        console.log(`✅ Optimizado a JPEG.`);
        successCount++;

      } catch (innerError) {
        console.error(`❌ Error:`, innerError.message);
        failCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_INVOCATIONS));
    }

    return new Response(JSON.stringify({
      message: `🎉 Lote finalizado. Optimizados: ${successCount}. Pendientes: Probablemente más, vuelve a ejecutar.`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});