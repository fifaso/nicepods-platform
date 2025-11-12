// supabase/functions/admin-segment-existing-podcasts/index.ts
// Una función administrativa de un solo uso para analizar y segmentar podcasts existentes de forma controlada.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("FATAL: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const DELAY_BETWEEN_INVOCATIONS_MS = 1500; // 1.5 segundos de pausa para no saturar las APIs.

serve(async (req) => {
  console.log("🚀 Iniciando función de backfilling de segmentación (modo secuencial y controlado)...");

  try {
    // 1. Encontrar todos los podcasts que están esperando ser analizados.
    const { data: podcastsToProcess, error: podcastsError } = await supabaseAdmin
      .from('micro_pods')
      .select('id')
      .eq('processing_status', 'pending');

    if (podcastsError) throw podcastsError;

    if (!podcastsToProcess || podcastsToProcess.length === 0) {
      return new Response(JSON.stringify({ message: "✅ No hay podcasts pendientes de análisis. ¡Todo al día!" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`ℹ️ Se encontraron ${podcastsToProcess.length} podcasts. Iniciando procesamiento uno por uno...`);
    let successCount = 0;
    let failCount = 0;

    // 2. Usamos un bucle 'for...of' para procesar cada podcast de forma secuencial.
    for (const podcast of podcastsToProcess) {
      console.log(`---`);
      console.log(`🔍 Procesando podcast con ID: ${podcast.id}`);
      
      try {
        // 3. Invocamos al orquestador, imitando el payload de un webhook de base de datos.
        const payload = { record: { id: podcast.id } };
        
        const { error: invokeError } = await supabaseAdmin.functions.invoke('cognitive-core-orchestrator', {
          body: payload
        });

        if (invokeError) {
          throw invokeError; // Lanza para ser capturado por el catch interno y registrar el fallo.
        }

        console.log(`✅ ¡Invocación exitosa para el podcast ${podcast.id}!`);
        successCount++;

      } catch (innerError) {
        console.error(`❌ Error al invocar el análisis para el podcast ${podcast.id}:`, innerError.message);
        failCount++;
      }
      
      // 4. Pausa estratégica para ser amables con las APIs externas.
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_INVOCATIONS_MS));
    }

    return new Response(JSON.stringify({ 
        message: `🎉 Backfilling completado.`,
        success_count: successCount,
        fail_count: failCount
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("❌ Error catastrófico en la función de backfilling:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});