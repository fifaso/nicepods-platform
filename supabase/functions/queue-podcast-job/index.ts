// supabase/functions/queue-podcast-job/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

// El "Chef de Control" usa una versión simplificada del manual.
// Solo necesita saber que la comanda tiene un estilo y unos ingredientes.
const PayloadSchema = z.object({
  style: z.enum(["solo", "link"]),
  inputs: z.object({}).passthrough(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();

    // ========================================================================
    // INICIO: EL CHEF DE CONTROL REVISA LA COMANDA
    // ========================================================================
    const validatedPayload = PayloadSchema.parse(payload);
    // Si la comanda no sigue el estándar, Zod lanzará un error y saltaremos al bloque 'catch'.
    // ========================================================================
    // FIN: REVISIÓN DEL CHEF DE CONTROL
    // ========================================================================

    const { error: rpcError } = await supabaseClient.rpc(
      "increment_jobs_and_queue",
      { p_user_id: user.id, p_payload: validatedPayload },
    );
    if (rpcError) {
      throw new Error(`Error en la base de datos: ${rpcError.message}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "La comanda enviada no es válida.",
          issues: error.issues,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const _errorMessage = error instanceof Error
      ? error.message
      : "Error interno desconocido.";
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
