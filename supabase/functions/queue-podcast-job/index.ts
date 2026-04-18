/**
 * ARCHIVO: supabase/functions/queue-podcast-job/index.ts
 * VERSIÓN: 20.1
 * PROTOCOLO: Madrid Resonance Protocol V8.0
 * MISIÓN: Zero-CPU Promotion Engine with Perimeter Guard and ZAP compliance.
 * [REFORMA V20.1]: Restoration of legacy response keys to prevent UI regression.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { guard, GuardContext } from "../_shared/guard.ts";

/**
 * executePodcastPromotionHandler:
 * Orquestador para la promoción de borradores a la forja de producción.
 */
const executePodcastPromotionHandler = async (incomingRequest: Request, context: GuardContext): Promise<Response> => {
  const correlationIdentification = context.correlationIdentification;

  try {
    const authorizationHeader = incomingRequest.headers.get('Authorization');
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ error: "Acceso denegado: Identidad no verificada." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const supabaseSovereignClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authorizationHeader } } }
    );

    const submissionPayload = await incomingRequest.json();
    const {
      draftIdentification,
      finalTitleTextContent,
      finalPodcastScriptContent,
      intelligenceResearchSourcesCollection
    } = submissionPayload;

    // Backward compatibility for legacy payloads during transition
    const targetDraftIdentification = draftIdentification || submissionPayload.draft_id;
    const targetTitle = finalTitleTextContent || submissionPayload.final_title;
    const targetScript = finalPodcastScriptContent || submissionPayload.final_script;
    const targetSources = intelligenceResearchSourcesCollection || submissionPayload.sources || [];

    const { data: rpcResultCollection, error: rpcHardwareExceptionInformation } = await supabaseSovereignClient.rpc('promote_draft_to_production_v2', {
      p_draft_id: targetDraftIdentification,
      p_final_title: targetTitle,
      p_final_script: targetScript,
      p_sources: targetSources
    });

    if (rpcHardwareExceptionInformation || !rpcResultCollection || rpcResultCollection.length === 0) {
      throw new Error(rpcHardwareExceptionInformation?.message || "Falla en promoción SQL");
    }

    const promotionResultSnapshot = rpcResultCollection[0];
    if (!promotionResultSnapshot.success) {
      return new Response(JSON.stringify({
        success: false,
        message: promotionResultSnapshot.message,
        trace_identification: correlationIdentification
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      pod_id: promotionResultSnapshot.pod_id, // RESTORED: Legacy key for UI compatibility
      podcastIdentification: promotionResultSnapshot.pod_id, // ZAP compliant key
      message: "Contenido enviado a la forja multimedia.",
      trace_identification: correlationIdentification
    }), {
      status: 202,
      headers: { "Content-Type": "application/json" }
    });

  } catch (hardwareException: unknown) {
    const exceptionMessageInformationText = hardwareException instanceof Error ? hardwareException.message : "Error desconocido";
    console.error(`🔥 [queue-podcast-job-Fatal][${correlationIdentification}]:`, exceptionMessageInformationText);

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

Deno.serve(guard(executePodcastPromotionHandler));
