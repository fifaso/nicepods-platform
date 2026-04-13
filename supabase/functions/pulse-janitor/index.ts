// supabase/functions/pulse-janitor/index.ts
// VERSIÓN: 1.0 (The Janitor - Lifecycle & Maintenance)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // Solo permitimos llamadas internas de Supabase CRON (o via Service Key)
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    console.log("[Janitor] Iniciando tareas de mantenimiento Pulse...");

    // 1. Limpieza de noticias expiradas (RPC SQL que creamos)
    await supabaseAdmin.rpc('cleanup_expired_pulse');

    // 2. Disparar una nueva recolección de noticias (Harvester)
    // Esto asegura que el búfer siempre tenga contenido fresco
    await supabaseAdmin.functions.invoke('pulse-harvester');

    return new Response(JSON.stringify({ success: true, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});