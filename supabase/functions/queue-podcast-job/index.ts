// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 18.0 (Zero-CPU Promotion Engine - Production Ready)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Acceso denegado.");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { draft_id, final_title, final_script, sources } = await req.json();

    /**
     * [CORE]: Delegamos la promoción y borrado al motor SQL.
     * Esto reduce el tiempo de CPU a prácticamente cero en la Edge Function.
     */
    const { data, error } = await supabase.rpc('promote_draft_to_production_v2', {
      p_draft_id: draft_id,
      p_final_title: final_title,
      p_final_script: final_script,
      p_sources: sources || []
    });

    if (error || !data || data.length === 0) throw new Error(error?.message || "Falla en promoción SQL");

    const result = data[0];
    if (!result.success) throw new Error(result.message);

    return new Response(JSON.stringify({
      success: true,
      pod_id: result.pod_id,
      message: "Contenido enviado a la forja multimedia."
    }), {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("🔥 queue-podcast-job fatal:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});