// supabase/functions/_shared/guard.ts
// VERSIÓN: 4.1 (Performance Shield - Lazy Sentry & Bulletproof CORS)

import arcjet, { fixedWindow, shield } from "https://esm.sh/@arcjet/deno@1.0.0-beta.4";
import * as Sentry from "https://esm.sh/@sentry/deno@8.26.0";
import { corsHeaders } from "./cors.ts";

export { corsHeaders };

let isSentryInit = false;
const initSentry = () => {
  if (!isSentryInit && Deno.env.get("SENTRY_DSN")) {
    Sentry.init({
      dsn: Deno.env.get("SENTRY_DSN"),
      tracesSampleRate: 1.0
    });
    isSentryInit = true;
  }
};

export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    // 1. Manejo de Preflight (OPTIONS) - Respuesta inmediata
    if (req.method === 'OPTIONS') {
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    const correlationId = crypto.randomUUID();

    try {
      initSentry();

      const aj = arcjet({
        key: Deno.env.get("ARCJET_KEY")!,
        rules: [
          shield({ mode: "LIVE" }),
          fixedWindow({ mode: "LIVE", window: "60s", max: 60 }),
        ],
      });

      const decision = await aj.protect(req);
      if (decision.isDenied()) {
        return new Response(
          JSON.stringify({ error: "Access Denied", trace_id: correlationId }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 2. Ejecución de la lógica de negocio
      const response = await handler(req);

      // 3. Inyección forzada de CORS en la respuesta final
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error: any) {
      console.error(`🔥 [NicePod-Guard][${correlationId}] Fatal:`, error.message);
      Sentry.captureException(error);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: error.message,
          trace_id: correlationId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  };
};