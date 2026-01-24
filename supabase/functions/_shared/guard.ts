// supabase/functions/_shared/guard.ts
// VERSIÓN: 3.9 (Bulletproof CORS & Stream Protection)

import * as Sentry from "https://esm.sh/@sentry/deno@8.26.0";
import { corsHeaders } from "./cors.ts";

export const guard = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    // 1. MANEJO PRIORITARIO DE PREFLIGHT
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      // 2. EJECUCIÓN DEL HANDLER
      const response = await handler(req);

      // 3. CLONACIÓN DE CABECERAS (Sin tocar el body para evitar errores de stream)
      // Simplemente retornamos la respuesta original pero inyectando los CORS
      Object.entries(corsHeaders).forEach(([k, v]) => {
        response.headers.set(k, v);
      });

      return response;

    } catch (error: any) {
      console.error(`🔥 [Guard-Fatal]:`, error.message);
      Sentry.captureException(error);

      return new Response(
        JSON.stringify({ error: "Internal Server Error", message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  };
};