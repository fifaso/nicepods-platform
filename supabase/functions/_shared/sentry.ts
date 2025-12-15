// supabase/functions/_shared/sentry.ts
import * as Sentry from "npm:@sentry/node";

export const initSentry = () => {
  Sentry.init({
    dsn: Deno.env.get("SENTRY_DSN"),
    tracesSampleRate: 1.0, // Capturar el 100% de transacciones por ahora (Boutique)
    environment: "production",
  });
};

export const wrapWithSentry = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request) => {
    initSentry();
    try {
      return await handler(req);
    } catch (error) {
      console.error("Error capturado por Sentry:", error);
      Sentry.captureException(error);
      
      // CRÍTICO EN SERVERLESS: Esperar a que Sentry envíe el error antes de morir
      await Sentry.flush(2000); 
      
      throw error; // Re-lanzamos para que Supabase también marque el error 500
    }
  };
};