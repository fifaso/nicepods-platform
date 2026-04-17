/**
 * ARCHIVO: supabase/functions/start-draft-process/index.ts
 * VERSIÓN: 3.0
 * PROTOCOLO: Madrid Resonance Protocol V4.0
 * MISIÓN: Receptionist for new podcast drafts with Perimeter Security.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { guard, GuardContext } from "../_shared/guard.ts";

const handler = async (request: Request, context: GuardContext): Promise<Response> => {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ error: "Acceso no autorizado: Falta Bearer Token." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authorizationHeader },
        },
      }
    );

    const payload = await request.json();

    const { data: rpcResultData, error: rpcExceptionInformation } = await supabaseClient.rpc('init_draft_process_v2', {
      p_payload: payload
    });

    if (rpcExceptionInformation) throw new Error(`DATABASE_FAIL: ${rpcExceptionInformation.message}`);

    const result = rpcResultData && rpcResultData[0];

    if (!result) {
      throw new Error("EMPTY_ORCHESTRATOR_RESPONSE");
    }

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.reason
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    console.info(`✅ [start-draft-process][${context.correlationIdentification}] Draft initiated: ${result.draft_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        draft_id: result.draft_id,
        message: "Misión aceptada. Iniciando fase de investigación profunda.",
        trace_identification: context.correlationIdentification
      }),
      {
        status: 202,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.error(`🔥 [start-draft-process-Fatal][${context.correlationIdentification}]:`, errorMessage);
    throw exceptionMessageInformation;
  }
};

Deno.serve(guard(handler));
