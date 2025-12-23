// supabase/functions/_shared/guard.ts
// VERSIÓN: 3.3 (Final Stable - Deno Optimized)

import * as Sentry from "sentry";
import arcjet, { detectBot, fixedWindow, shield } from "arcjet";
import { corsHeaders } from "cors";

// --- 1. CONFIGURACIÓN (SINGLETON) ---

Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
  tracesSampleRate: 1.0,
  defaultIntegrations: false,
});

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!,
  rules: [
    // Protección contra ataques de inyección y malicia conocida
    shield({ mode: "LIVE" }), 
    // Bloqueo de Bots agresivo
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    // Rate Limit por IP (Capa de defensa contra inundación de red)
    fixedWindow({
      mode: "LIVE",
      window: "60s",
      max: 60,
    }),
  ],
});

// --- 2. UTILIDADES DE IDENTIDAD ---

function getUserIdFromAuth(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.split(".")[1];
    const decoded = JSON.parse(atob(token));
    return decoded.sub || null;
  } catch {
    return null;
  }
}

// --- 3. DEFINICIÓN DEL WRAPPER ---

export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    
    // A. MANEJO DE CORS (Mantenemos soporte total)
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const correlationId = crypto.randomUUID();

    try {
      // B. PROTECCIÓN DE BORDE (EDGE PROTECTION)
      // Solo enviamos 'req' para cumplir con la firma de la versión Deno
      const decision = await aj.protect(req);

      if (decision.isDenied()) {
        console.warn(`[Guard][${correlationId}] Acceso denegado por Arcjet: ${decision.reason.type}`);
        
        const status = decision.reason.isRateLimit() ? 429 : 403;
        return new Response(
          JSON.stringify({ 
            error: "Acceso restringido por seguridad.", 
            trace_id: correlationId 
          }), 
          { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // C. CONTEXTO DE OBSERVABILIDAD
      // Extraemos el ID para Sentry pero no lo usamos en la decisión de Arcjet (Edge)
      const userId = getUserIdFromAuth(req.headers.get("Authorization"));
      Sentry.setTag("correlation_id", correlationId);
      if (userId) Sentry.setUser({ id: userId });

      // D. EJECUCIÓN LÓGICA DE NEGOCIO
      const response = await handler(req);
      
      // Inyectar headers CORS en la respuesta de la función real
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      
      return response;

    } catch (error) {
      console.error(`🔥 [Guard][${correlationId}] Error Crítico:`, error);
      
      Sentry.captureException(error, { extra: { correlationId } });
      await Sentry.flush(2000);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Internal Server Error", 
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