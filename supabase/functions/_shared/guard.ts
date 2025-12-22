// supabase/functions/_shared/guard.ts
// VERSIÓN: 3.0 (Smart Identity & Rate Limiting)

import * as Sentry from "npm:@sentry/node@8.26.0";
import arcjet, { detectBot, fixedWindow, shield } from "npm:@arcjet/deno@1.0.0-beta.4";
import { corsHeaders } from "./cors.ts";

// --- 1. CONFIGURACIÓN (SINGLETON) ---

Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
  tracesSampleRate: 1.0,
  defaultIntegrations: false,
});

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!,
  rules: [
    // Protección contra ataques comunes (SQL Injection, XSS)
    shield({ mode: "LIVE" }), 
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    // Rate Limit Base
    fixedWindow({
      mode: "LIVE",
      window: "60s",
      max: 60, // Aumentamos un poco el margen para usuarios legítimos
    }),
  ],
});

// --- 2. UTILIDADES DE IDENTIDAD ---

/**
 * Intenta extraer el User ID (sub) del JWT de Supabase sin validar la firma 
 * (la validación la hace Supabase después, aquí solo queremos el ID para el Rate Limit)
 */
function getUserIdFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  try {
    const token = authHeader.replace("Bearer ", "");
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || null; // 'sub' es el estándar para el ID de usuario
  } catch {
    return null;
  }
}

// --- 3. DEFINICIÓN DEL WRAPPER ---

export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      // A. DETERMINAR HUELLA DIGITAL (FINGERPRINTING)
      // Si tenemos un User ID, lo usamos como llave única. Si no, Arcjet usará la IP.
      const userId = getUserIdFromRequest(req);
      const fingerprint = userId ? `user-${userId}` : undefined;

      // B. PROTECCIÓN INTELIGENTE
      const decision = await aj.protect(req, { 
        requested: 1,
        fingerprint: fingerprint 
      });

      if (decision.isDenied()) {
        console.warn(`[Arcjet] Bloqueo para ${fingerprint || 'IP'}: ${decision.reason.type}`);
        
        if (decision.reason.isRateLimit()) {
          return new Response(
            JSON.stringify({ 
              error: "Límite de peticiones alcanzado.", 
              suggestion: userId ? "Espera un momento." : "Inicia sesión para límites más altos." 
            }), 
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: "Acceso denegado por seguridad." }), 
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // C. EJECUCIÓN
      return await handler(req);

    } catch (error) {
      console.error("🔥 Error en Guard:", error);
      Sentry.captureException(error);
      await Sentry.flush(2000);

      const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  };
};