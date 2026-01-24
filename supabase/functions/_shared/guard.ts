// supabase/functions/_shared/guard.ts
// VERSIÓN: 3.8 (Deno Runtime Compatibility & Universal CORS)

import arcjet, { detectBot, fixedWindow, shield } from "https://esm.sh/@arcjet/deno@1.0.0-beta.4";
import * as Sentry from "https://esm.sh/@sentry/deno@8.26.0";
import { corsHeaders } from "./cors.ts";

// Inicialización de Sentry para observabilidad de errores en el borde
Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
  tracesSampleRate: 1.0,
});

/**
 * Arcjet Config: Optimizada para el Runtime de Supabase.
 * [FIX]: Silenciamos fallos internos de conectividad para evitar bloqueos por protocolos.
 */
const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
    fixedWindow({ mode: "LIVE", window: "60s", max: 60 }),
  ],
});

export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {

    // 1. GESTIÓN ATÓMICA DE PREFLIGHT (CORS)
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const correlationId = crypto.randomUUID();

    try {
      // 2. PROTECCIÓN DE SEGURIDAD (Bypass en error de protocolo para no bloquear el servicio)
      try {
        const decision = await aj.protect(req);
        if (decision.isDenied()) {
          return new Response(
            JSON.stringify({ error: "Access Denied", trace_id: correlationId }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (ajError) {
        console.warn(`[Guard][${correlationId}] Arcjet Connection Warning: Running in local-bypass mode.`);
      }

      // 3. EJECUCIÓN DEL HANDLER PRINCIPAL
      const response = await handler(req);

      // 4. ASEGURAMIENTO DE CABECERAS CORS EN RESPUESTA
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error: any) {
      console.error(`🔥 [Guard][${correlationId}] Fatal Error:`, error.message);
      Sentry.captureException(error, { extra: { correlationId } });
      await Sentry.flush(2000);

      return new Response(
        JSON.stringify({ error: "Internal Server Error", trace_id: correlationId, message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  };
};

export { corsHeaders };
