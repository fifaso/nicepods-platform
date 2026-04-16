/**
 * ARCHIVO: supabase/functions/queue-podcast-job/index.ts
 * VERSIÓN: 19.0
 * PROTOCOLO: Madrid Resonance Protocol V4.0
 * MISIÓN: Zero-CPU Promotion Engine with Perimeter Security.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { guard, GuardContext } from "../_shared/guard.ts";

const handler = async (request: Request, context: GuardContext): Promise<Response> => {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ error: "Acceso denegado: Identidad no verificada." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const { draft_id, final_title, final_script, sources } = await request.json();

    const { data: rpcResultData, error: rpcExceptionInformation } = await supabaseClient.rpc('promote_draft_to_production_v2', {
      p_draft_id: draft_id,
      p_final_title: final_title,
      p_final_script: final_script,
      p_sources: sources || []
    });

    if (rpcExceptionInformation || !rpcResultData || rpcResultData.length === 0) {
      throw new Error(rpcExceptionInformation?.message || "Falla en promoción SQL");
    }

    const result = rpcResultData[0];
    if (!result.success) {
      return new Response(JSON.stringify({ success: false, message: result.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      pod_id: result.pod_id,
      message: "Contenido enviado a la forja multimedia.",
      trace_identification: context.correlationIdentification
    }), {
      status: 202,
      headers: { "Content-Type": "application/json" }
    });

  } catch (exceptionMessageInformation: any) {
    console.error(`🔥 [queue-podcast-job-Fatal][${context.correlationIdentification}]:`, exceptionMessageInformation.message);
    throw exceptionMessageInformation;
  }
};

Deno.serve(guard(handler));
