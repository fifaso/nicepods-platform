/**
 * ARCHIVO: supabase/functions/pulse-janitor/index.ts
 * VERSIÓN: 8.3 (The Janitor - Sovereign Protocol V8.3)
 * PROTOCOLO: MADRID RESONANCE V8.3
 * MISIÓN: Mantenimiento del ciclo de vida de señales con integridad perimetral guard.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / BSS Green)
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { guard, GuardContext } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseSovereignAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/**
 * executeMaintenanceOrchestrationHandler:
 * Misión: Orquestar las tareas de limpieza y recolección programadas.
 */
const executeMaintenanceOrchestrationHandler = async (incomingRequest: Request, context: GuardContext): Promise<Response> => {
  const correlationIdentification = context.correlationIdentification;

  // PROTOCOLO DE SEGURIDAD: Solo permitimos acceso interno (Trusted Zone) para el mantenimiento automático.
  if (!context.isTrusted) {
      console.warn(`🛑 [Janitor][${correlationIdentification}] Intento de acceso externo bloqueado.`);
      return new Response(JSON.stringify({ error: "Unauthorized: Internal infrastructure only." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
  }

  try {
    console.info(`🧹 [Janitor][${correlationIdentification}] Iniciando tareas de mantenimiento Pulse...`);

    // 1. Limpieza de noticias expiradas (RPC SQL)
    const { error: cleanupDatabaseHardwareException } = await supabaseSovereignAdmin.rpc('cleanup_expired_pulse');
    if (cleanupDatabaseHardwareException) throw cleanupDatabaseHardwareException;

    // 2. Disparar una nueva recolección de noticias (Harvester)
    const { error: harvesterInvokeHardwareException } = await supabaseSovereignAdmin.functions.invoke('pulse-harvester');
    if (harvesterInvokeHardwareException) throw harvesterInvokeHardwareException;

    return new Response(JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        traceIdentification: correlationIdentification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (exceptionMessageInformation: any) {
    console.error(`🔥 [Janitor-Fatal][${correlationIdentification}]:`, exceptionMessageInformation.message);
    return new Response(JSON.stringify({
        error: exceptionMessageInformation.message,
        traceIdentification: correlationIdentification
    }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

Deno.serve(guard(executeMaintenanceOrchestrationHandler));
