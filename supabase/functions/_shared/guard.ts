// supabase/functions/_shared/guard.ts
// VERSIÓN: 4.2 (Ultra-Lean Guard - Zero CPU Waste)

import { corsHeaders } from "./cors.ts";

export { corsHeaders };

/**
 * guard: Envoltura optimizada para no consumir CPU en el arranque.
 * Solo carga Sentry y Arcjet si el request es legítimo y requiere protección.
 */
export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {

    // 1. Prioridad Cero: Preflight (OPTIONS)
    // No gasta CPU en imports pesados para responder a un pre-vuelo.
    if (req.method === 'OPTIONS') {
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    const correlationId = crypto.randomUUID();

    try {
      // 2. Importación dinámica de seguridad (Lazy Loading)
      // Esto solo ocurre si el método es POST/GET, ahorrando CPU en el boot inicial.
      const [{ default: arcjet, shield, fixedWindow }, Sentry] = await Promise.all([
        import("https://esm.sh/@arcjet/deno@1.0.0-beta.4"),
        import("https://esm.sh/@sentry/deno@8.26.0")
      ]);

      // Inicialización mínima de Sentry
      Sentry.init({ dsn: Deno.env.get("SENTRY_DSN"), tracesSampleRate: 0.1 });

      const aj = arcjet({
        key: Deno.env.get("ARCJET_KEY")!,
        rules: [
          shield({ mode: "LIVE" }),
          fixedWindow({ mode: "LIVE", window: "60s", max: 60 }),
        ],
      });

      const decision = await aj.protect(req);
      if (decision.isDenied()) {
        return new Response(JSON.stringify({ error: "Security Block" }), {
          status: 403,
          headers: corsHeaders
        });
      }

      // 3. Ejecución del Handler real
      const response = await handler(req);

      // 4. Inyección de Headers
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });

    } catch (error: any) {
      console.error(`🔥 [Guard-System-Error]:`, error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  };
};