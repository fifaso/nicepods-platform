// supabase/functions/admin-backfill-embeddings/index.ts
// VERSIÓN: 1.0 (Admin Tool: Regenerate All Library Intelligence)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { guard } from "../_shared/guard.ts"; 
import { corsHeaders } from "../_shared/cors.ts";

const handler = async (request: Request): Promise<Response> => {
  // Solo POST
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  // Cliente con permisos de Dios
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log("🚀 Iniciando Backfill de Embeddings...");

  // 1. Obtener todos los podcasts PUBLICADOS
  // (No gastamos dinero en borradores o fallidos)
  const { data: podcasts, error } = await supabaseAdmin
    .from('micro_pods')
    .select('id, title')
    .eq('status', 'published');

  if (error) throw error;
  if (!podcasts || podcasts.length === 0) return new Response(JSON.stringify({ message: "No hay podcasts para procesar" }), { headers: corsHeaders });

  console.log(`Encontrados ${podcasts.length} podcasts para vectorizar.`);

  // 2. Disparar vectorización individual (Batching)
  // Lo hacemos invocando la función 'generate-embedding' para cada uno.
  // Usamos Promise.all con un límite de concurrencia simple para no saturar a Google.
  
  let successCount = 0;
  let failCount = 0;

  // Procesamos en lotes de 5 para ser amables con el Rate Limit de la API
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < podcasts.length; i += BATCH_SIZE) {
    const batch = podcasts.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (pod) => {
        try {
            console.log(`--> Procesando: ${pod.id} - ${pod.title}`);
            const { error: invokeError } = await supabaseAdmin.functions.invoke('generate-embedding', {
                body: { podcast_id: pod.id }
            });
            
            if (invokeError) throw invokeError;
            return true;
        } catch (e) {
            console.error(`X Fallo en ID ${pod.id}:`, e);
            return false;
        }
    });

    const results = await Promise.all(promises);
    successCount += results.filter(r => r).length;
    failCount += results.filter(r => !r).length;
  }

  return new Response(
    JSON.stringify({ 
        success: true, 
        message: `Proceso finalizado.`, 
        stats: { total: podcasts.length, processed: successCount, failed: failCount } 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
};

serve(guard(handler));