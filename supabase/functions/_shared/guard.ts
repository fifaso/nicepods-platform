// supabase/functions/_shared/guard.ts
// VERSIÓN: 3.5 (Deno v2 Optimized - Silent Header Injection)

import * as Sentry from "sentry";
import arcjet, { detectBot, fixedWindow, shield } from "arcjet";
import { corsHeaders } from "cors";

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

export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const correlationId = crypto.randomUUID();

    try {
      const decision = await aj.protect(req);
      if (decision.isDenied()) {
        return new Response(
          JSON.stringify({ error: "Access Denied", trace_id: correlationId }), 
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Ejecutamos la función
      const response = await handler(req);
      
      // Creamos una respuesta nueva para asegurar que los headers CORS estén presentes
      // sin importar cómo se generó la respuesta original.
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error) {
      console.error(`🔥 [Guard][${correlationId}] Error:`, error);
      Sentry.captureException(error);
      await Sentry.flush(2000);

      return new Response(
        JSON.stringify({ error: "Internal Server Error", trace_id: correlationId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  };
};