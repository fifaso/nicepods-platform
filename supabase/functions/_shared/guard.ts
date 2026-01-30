// supabase/functions/_shared/guard.ts
// VERSIÓN: 4.0 (Universal Security Shield - Fixed Exports & Boot Integrity)

import arcjet, { detectBot, fixedWindow, shield } from "https://esm.sh/@arcjet/deno@1.0.0-beta.4";
import * as Sentry from "https://esm.sh/@sentry/deno@8.26.0";
import { corsHeaders } from "./cors.ts";

/**
 * [CRÍTICO]: Exportamos corsHeaders para que todos los workers
 * puedan consumirlas directamente desde la envoltura de seguridad.
 */
export { corsHeaders };

// Inicialización de Sentry para trazabilidad de errores en el Edge
Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
  tracesSampleRate: 1.0,
});

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
    fixedWindow({ mode: "LIVE", window: "60s", max: 60 }),
  ],
});

/**
 * guard: Envoltura profesional que gestiona CORS, Seguridad (Arcjet) 
 * y Observabilidad (Sentry).
 */
export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {

    // 1. GESTIÓN DE PREFLIGHT (Bypass inmediato)
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        status: 200,
        headers: corsHeaders
      });
    }

    const correlationId = crypto.randomUUID();

    try {
      // 2. PROTECCIÓN PERIMETRAL (SafeMode: Si falla protocolo, permitimos tráfico)
      try {
        const decision = await aj.protect(req);
        if (decision.isDenied()) {
          return new Response(
            JSON.stringify({ error: "Access Denied", trace_id: correlationId }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (ajErr) {
        console.warn(`[Guard][${correlationId}] Arcjet Protocol Alert: Fail-Open activated.`);
      }

      // 3. EJECUCIÓN DEL WORKER
      const response = await handler(req);

      // 4. INYECCIÓN DINÁMICA DE CABECERAS
      // Garantizamos que el navegador siempre reciba permiso, incluso en errores de lógica interna.
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error: any) {
      console.error(`🔥 [NicePod-Guard][${correlationId}] Error Crítico:`, error.message);

      Sentry.captureException(error, { extra: { correlationId } });
      await Sentry.flush(2000);

      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: error.message,
          trace_id: correlationId
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  };
};