// supabase/functions/_shared/guard.ts

// Usamos los paquetes via NPM para máxima compatibilidad
import * as Sentry from "npm:@sentry/node@8.26.0";
import arcjet, { detectBot, tokenBucket, fixedWindow } from "npm:@arcjet/deno@1.0.0-beta.4";
import { corsHeaders } from "./cors.ts";

// --- 1. CONFIGURACIÓN INICIAL (SINGLETON) ---

// Inicializamos Sentry fuera del handler para reusar la instancia (Warm Start)
Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
  tracesSampleRate: 1.0, // Capturamos todo en esta etapa "Boutique"
  defaultIntegrations: false, // Minimizamos overhead en Edge
});

// Inicializamos Arcjet
const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!,
  rules: [
    // Regla 1: Bloqueo de Bots (Permitimos buscadores como Google para SEO si fuera público)
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    // Regla 2: Rate Limit General (Protección base contra inundación)
    // 50 peticiones cada 60 segundos por IP.
    fixedWindow({
      mode: "LIVE",
      window: "60s",
      max: 50,
    }),
  ],
});

// --- 2. DEFINICIÓN DEL WRAPPER ---

/**
 * Higher-Order Function que envuelve la lógica de negocio con:
 * 1. Manejo automático de CORS.
 * 2. Protección de Arcjet (Seguridad).
 * 3. Captura de errores con Sentry (Observabilidad).
 */
export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    
    // A. MANEJO DE CORS (Preflight)
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      // B. CAPA DE SEGURIDAD (ARCJET)
      // Pasamos 'requested: 1' explícitamente para satisfacer tipos estrictos
      const decision = await aj.protect(req, { requested: 1 });

      if (decision.isDenied()) {
        console.warn(`[Arcjet] Bloqueo: ${decision.reason.type}`);
        
        if (decision.reason.isRateLimit()) {
          return new Response(
            JSON.stringify({ error: "Demasiadas peticiones. Por favor espera." }), 
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: "Acceso denegado por seguridad." }), 
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // C. EJECUCIÓN LÓGICA DE NEGOCIO
      // Si pasa la seguridad, ejecutamos la función real
      return await handler(req);

    } catch (error) {
      // D. CAPTURA DE ERRORES (SENTRY)
      console.error("🔥 Error no controlado:", error);

      // Reportar a Sentry
      Sentry.captureException(error);
      
      // CRÍTICO: Esperar a que Sentry envíe los datos antes de cerrar el proceso
      await Sentry.flush(2000);

      // Determinar mensaje de error seguro para el cliente
      const errorMessage = error instanceof Error ? error.message : "Error interno del servidor";
      
      // Retornar 500 estándar
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  };
};