// supabase/functions/_shared/guard.ts
// VERSIÓN: 3.7 (Zero-Crash Preflight & Unified CORS Injection)

import arcjet, { detectBot, fixedWindow, shield } from "https://esm.sh/@arcjet/deno@1.0.0-beta.4";
import * as Sentry from "https://esm.sh/@sentry/deno@8.26.0";
import { corsHeaders } from "./cors.ts";

// Inicialización de Observabilidad
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
 * guard: Envoltura de seguridad perimetral para Edge Functions.
 * Gestiona CORS, Preflight (OPTIONS), Arcjet (Seguridad) y Sentry (Errores).
 */
export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {

    // 1. MANEJO DE PREFLIGHT (Bypass inmediato para evitar errores de body)
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        status: 200,
        headers: corsHeaders
      });
    }

    const correlationId = crypto.randomUUID();

    try {
      // 2. PROTECCIÓN PERIMETRAL (Arcjet)
      const decision = await aj.protect(req);
      if (decision.isDenied()) {
        return new Response(
          JSON.stringify({ error: "Acceso denegado por políticas de seguridad.", trace_id: correlationId }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 3. EJECUCIÓN DE LA LÓGICA DE NEGOCIO
      const response = await handler(req);

      // 4. INYECCIÓN DE CABECERAS DE SEGURIDAD Y PERMISOS
      // Re-encapsulamos para asegurar que el navegador siempre acepte el origen.
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error: any) {
      console.error(`🔥 [NicePod-Guard][${correlationId}] Fatal:`, error.message);

      // Reporte automático a Sentry
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

export { corsHeaders };
