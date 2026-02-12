// supabase/functions/_shared/guard.ts
// VERSIÓN: 5.0 (NicePod Shield & Telemetry Protocol - Full Traceability Edition)
// Misión: Blindar el perímetro con Arcjet y garantizar observabilidad total mediante Sentry y Correlation IDs.

import { corsHeaders } from "./cors.ts";

export { corsHeaders };

/**
 * guard: Orquestador de seguridad y telemetría.
 * Implementa un modelo de ejecución segura con medición de rendimiento.
 */
export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {

    // 1. PROTOCOLO PRE-VUELO (CORS)
    // Respondemos inmediatamente a las peticiones OPTIONS sin cargar módulos pesados.
    if (req.method === 'OPTIONS') {
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    // 2. GENERACIÓN DE IDENTIDAD DE PETICIÓN (Traceability)
    // Este ID unificará los logs del cliente, los de la Edge Function y los de Sentry.
    const correlationId = crypto.randomUUID();
    const startTime = performance.now();

    try {
      // 3. CARGA DINÁMICA DE INFRAESTRUCTURA (Performance Optimization)
      // Importamos solo cuando la petición es legítima para minimizar el Cold Start.
      const [{ default: arcjet, shield, fixedWindow }, Sentry] = await Promise.all([
        import("https://esm.sh/@arcjet/deno@1.0.0-beta.4"),
        import("https://esm.sh/@sentry/deno@8.26.0")
      ]);

      // 4. CONFIGURACIÓN DE OBSERVABILIDAD
      if (Deno.env.get("SENTRY_DSN")) {
        Sentry.init({
          dsn: Deno.env.get("SENTRY_DSN"),
          tracesSampleRate: 0.1,
          environment: Deno.env.get("NODE_ENV") || "production",
        });

        // Vinculamos la identidad de la petición al contexto de Sentry
        Sentry.setTag("correlation_id", correlationId);
        Sentry.setExtra("request_method", req.method);
        Sentry.setExtra("request_url", req.url);
      }

      // 5. PROTECCIÓN PERIMETRAL (Arcjet Shield)
      const aj = arcjet({
        key: Deno.env.get("ARCJET_KEY")!,
        rules: [
          // Escudo contra ataques comunes (SQLi, XSS, etc)
          shield({ mode: "LIVE" }),
          // Limitador de tasa: 60 peticiones por minuto por dirección IP
          fixedWindow({ mode: "LIVE", window: "60s", max: 60 }),
        ],
      });

      const decision = await aj.protect(req);

      if (decision.isDenied()) {
        console.warn(`🛑 [Security-Block][${correlationId}] Motivo: ${decision.reason.type}`);

        return new Response(
          JSON.stringify({
            error: "Security Block",
            message: "La petición ha sido interceptada por el escudo de seguridad.",
            trace_id: correlationId
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // 6. EJECUCIÓN DEL HANDLER Y MEDICIÓN
      // Pasamos el control a la lógica de negocio de la función.
      const response = await handler(req);

      // 7. ENSAMBLAJE DE HEADERS DE RESPUESTA
      // Inyectamos trazabilidad y métricas de rendimiento para el cliente.
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);

      const responseHeaders = new Headers(response.headers);

      // Aplicamos CORS
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      // Aplicamos Telemetría
      responseHeaders.set("x-correlation-id", correlationId);
      responseHeaders.set("x-execution-time", `${executionTime}ms`);
      responseHeaders.set("x-shield-status", "protected");

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });

    } catch (error: any) {
      // 8. GESTIÓN DE FALLOS CRÍTICOS (The Safety Net)
      console.error(`🔥 [Guard-Fatal-Error][${correlationId}]:`, error.message);

      // Reporte de pánico a Sentry
      const Sentry = await import("https://esm.sh/@sentry/deno@8.26.0");
      Sentry.captureException(error, {
        tags: { correlation_id: correlationId },
        extra: { fatal: true }
      });

      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: error.message,
          trace_id: correlationId
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  };
};