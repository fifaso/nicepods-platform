// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN FINAL Y ROBUSTA: Usa un cliente admin para invocar al dispatcher de forma segura.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const QueuePayloadSchema = z.object({
  style: z.enum(['solo', 'link', 'archetype']),
  agentName: z.string().min(1),
  inputs: z.object({}).passthrough(),
});

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ success: false, error: "Autorización requerida." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    // Cliente para actuar en nombre del usuario (para RLS y getUser)
    const supabaseClient: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);
    
    // [MEJORA] Usamos el cliente del usuario para el RPC, respetando RLS si la hubiera.
    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    if (rpcError) {
      throw new Error(`Fallo en RPC: ${rpcError.message}`);
    }

    // [CAMBIO QUIRÚRGICO] Reemplazamos el 'fetch' anónimo por una invocación autenticada.
    // Creamos un cliente admin SÓLO para esta operación privilegiada de servidor a servidor.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`Trabajo ${newJobId} creado. Invocando al dispatcher de forma segura...`);
    
    // El método 'invoke' automáticamente añade la cabecera 'Authorization: Bearer <service_role_key>'
    const { error: invokeError } = await supabaseAdmin.functions.invoke('secure-webhook-dispatcher', {
      body: {
        job_id: newJobId,
        target_webhook_url: `${Deno.env.get('SUPABASE_URL')!}/functions/v1/process-podcast-job`
      }
    });

    if (invokeError) {
      // Si la invocación falla, lo registramos, pero no bloqueamos la respuesta al usuario.
      console.error(`Error al invocar al dispatcher para el trabajo ${newJobId}:`, invokeError);
    }

    return new Response(JSON.stringify({
      success: true,
      job_id: newJobId,
      message: "Trabajo encolado y procesamiento iniciado."
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error en queue-podcast-job:", error);
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ success: false, error: "Payload inválido.", details: error.errors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }
    return new Response(JSON.stringify({ success: false, error: "Error interno.", message: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});