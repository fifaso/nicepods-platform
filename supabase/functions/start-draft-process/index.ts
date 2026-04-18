/**
 * ARCHIVO: supabase/functions/start-draft-process/index.ts
 * VERSIÓN: 4.1
 * PROTOCOLO: Madrid Resonance Protocol V8.0
 * MISIÓN: Receptionist for new podcast drafts with Perimeter Guard and ZAP compliance.
 * [REFORMA V4.1]: Restoration of legacy response keys to prevent UI regression.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { guard, GuardContext } from "../_shared/guard.ts";

/**
 * executeDraftInitiationHandler:
 * Orquestador para el inicio de misiones de investigación de podcasts.
 */
const executeDraftInitiationHandler = async (incomingRequest: Request, context: GuardContext): Promise<Response> => {
  const correlationIdentification = context.correlationIdentification;

  try {
    const authorizationHeader = incomingRequest.headers.get('Authorization');
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ error: "Acceso no autorizado: Falta Bearer Token." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const supabaseSovereignClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authorizationHeader },
        },
      }
    );

    const submissionPayload = await incomingRequest.json();

    const { data: rpcResultCollection, error: rpcHardwareExceptionInformation } = await supabaseSovereignClient.rpc('init_draft_process_v2', {
      p_payload: submissionPayload
    });

    if (rpcHardwareExceptionInformation) throw new Error(`DATABASE_FAIL: ${rpcHardwareExceptionInformation.message}`);

    const draftInitiationResult = rpcResultCollection && rpcResultCollection[0];

    if (!draftInitiationResult) {
      throw new Error("EMPTY_ORCHESTRATOR_RESPONSE");
    }

    if (!draftInitiationResult.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: draftInitiationResult.reason,
          trace_identification: correlationIdentification
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    console.info(`✅ [start-draft-process][${correlationIdentification}] Draft initiated: ${draftInitiationResult.draft_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        draft_id: draftInitiationResult.draft_id, // RESTORED: Legacy key for UI compatibility
        draftIdentification: draftInitiationResult.draft_id, // ZAP compliant key
        message: "Misión aceptada. Iniciando fase de investigación profunda.",
        trace_identification: correlationIdentification
      }),
      {
        status: 202,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (hardwareException: unknown) {
    const exceptionMessageInformationText = hardwareException instanceof Error ? hardwareException.message : "Error desconocido";
    console.error(`🔥 [start-draft-process-Fatal][${correlationIdentification}]:`, exceptionMessageInformationText);

    return new Response(
      JSON.stringify({
        error: exceptionMessageInformationText,
        trace_identification: correlationIdentification
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

Deno.serve(guard(executeDraftInitiationHandler));
