// supabase/functions/queue-podcast-job/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
// CAMBIO: Asumimos que has modernizado el proyecto para usar el import con alias.
// Si no lo has hecho, vuelve a cambiarlo a '../_shared/cors.ts'
import { corsHeaders } from '@shared/cors.ts';

const QueuePayloadSchema = z.object({
  style: z.enum(['solo', 'link']),
  agentName: z.string().min(1, { message: "El 'agentName' es requerido." }),
  inputs: z.object({}).passthrough(),
});

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) { throw new Error("La cabecera de autorización es requerida."); }

    // ================== INTERVENCIÓN QUIRÚRGICA #1 ==================
    // CAMBIO: Se eliminan los argumentos de createClient().
    // Dentro de una Edge Function, la librería es lo suficientemente inteligente
    // para obtener la URL y la ANON_KEY de las variables de entorno inyectadas
    // por el sistema, evitando así la llamada conflictiva a Deno.env.get().
    const supabaseClient = createClient(
      undefined,
      undefined,
      { global: { headers: { Authorization: authorizationHeader } } }
    );
    // ================================================================

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const payload = await request.json();
    const validatedPayload = QueuePayloadSchema.parse(payload);

    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    if (rpcError) { throw new Error(rpcError.message); }

    // ================== INTERVENCIÓN QUIRÚRGICA #2 ==================
    // CAMBIO: Se reemplaza la creación del cliente de admin y la llamada a .invoke()
    // por una llamada directa con `fetch`. Esto nos da control total y evita
    // cualquier inicialización de la librería que pueda tocar las claves en conflicto.
    // Usamos las variables de entorno que SÍ sabemos que son seguras.
    
    const functionUrl = `${Deno.env.get('SUPABASE_URL')!}/functions/v1/process-podcast-job`;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Usamos una Promise sin `await` para invocar la función de forma asíncrona ("fire and forget"),
    // replicando exactamente el comportamiento de `supabaseAdmin.functions.invoke(...).catch()`.
    fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ job_id: newJobId }),
    }).catch(err => {
      console.error(`Error invoking process-podcast-job for job ${newJobId}:`, err);
    });
    // ==================================================================================

    return new Response(JSON.stringify({ 
      success: true, 
      job_id: newJobId,
      message: "El trabajo ha sido encolado y el procesamiento ha comenzado."
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error detallado en la función queue-podcast-job:", error);

    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    const status = error instanceof ZodError ? 400 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
})