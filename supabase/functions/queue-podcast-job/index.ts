// supabase/functions/queue-podcast-job/index.ts
// VERSIÓN: 5.7 (Fix: Whitelist 'sources', 'final_script', 'final_title' in Zod Schema)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// [CAMBIO QUIRÚRGICO]: Ampliamos el esquema para permitir el paso de datos de edición y fuentes.
const QueuePayloadSchema = z.object({
  purpose: z.string(),
  style: z.enum(['solo', 'link', 'archetype', 'legacy', 'qa']).optional(),
  agentName: z.string().min(1).optional(),
  
  // --- NUEVOS CAMPOS PERMITIDOS (Corrección de Fuga de Datos) ---
  final_title: z.string().optional(),
  final_script: z.string().optional(),
  // Permitimos un array de cualquier objeto para las fuentes. 
  // La validación estricta del contenido de la fuente ya se hizo en el frontend.
  sources: z.array(z.any()).optional(), 
  
  inputs: z.object({}).passthrough(),
});

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) throw new Error("Autorización requerida.");

    const supabaseClient: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No autorizado.");

    const payload = await request.json();
    
    // Aquí ocurría el "strip": Zod eliminaba lo que no estaba definido arriba.
    // Con el nuevo esquema, 'sources' sobrevivirá a esta línea.
    const validatedPayload = QueuePayloadSchema.parse(payload);
    
    // 1. Crear el trabajo en la base de datos (con el payload completo).
    const { data: newJobId, error: rpcError } = await supabaseClient
      .rpc('increment_jobs_and_queue', {
        p_user_id: user.id,
        p_payload: validatedPayload
      });

    if (rpcError) throw new Error(`Fallo en RPC: ${rpcError.message}`);

    // 2. Asumir la responsabilidad de iniciar la cadena.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`Trabajo ${newJobId} creado. Invocando a 'process-podcast-job'...`);
    
    // 3. Invocación asíncrona ("dispara y olvida").
    supabaseAdmin.functions.invoke('process-podcast-job', {
      body: { job_id: newJobId }
    }).then(({ error: invokeError }) => {
      if (invokeError) {
        console.error(`Invocación asíncrona a 'process-podcast-job' falló para el trabajo ${newJobId}:`, invokeError);
      }
    });

    // 4. Devolver éxito inmediato al usuario.
    return new Response(JSON.stringify({
      success: true,
      job_id: newJobId,
      message: "Trabajo encolado y procesamiento iniciado."
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    console.error("Error en queue-podcast-job:", error);
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: error instanceof ZodError ? 400 : 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});