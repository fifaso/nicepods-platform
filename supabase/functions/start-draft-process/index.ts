// supabase/functions/start-draft-process/index.ts
// VERSIÓN: 2.0 (Ultra-Light Receptionist - Database Powered)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * [SISTEMA]: Cabeceras CORS aisladas para evitar carga de archivos compartidos pesados.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 1. Manejo de Preflight (OPTIONS) - Respuesta en <1ms
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Capturar el Token de Autorización del Usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Acceso no autorizado: Falta Bearer Token.");

    // 3. Inicialización del cliente Supabase Ligero
    // Usamos el Token del usuario para que el motor SQL reconozca su identidad vía auth.uid()
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // 4. Procesamiento del Payload
    const payload = await req.json();

    /**
     * [CORE ESTRATÉGICO]: Delegación Atómica
     * Invocamos al procedimiento SQL 'init_draft_process_v2'.
     * Este único paso valida cuotas, extrae el título y crea el registro.
     */
    const { data, error } = await supabase.rpc('init_draft_process_v2', {
      p_payload: payload
    });

    if (error) throw new Error(`Fallo en el motor de base de datos: ${error.message}`);

    // Supabase devuelve el resultado de una tabla de retorno como un array
    const result = data && data[0];

    if (!result) {
      throw new Error("No se recibió respuesta del orquestador de admisión.");
    }

    // 5. Validación de Negocio (Cuotas/Planes)
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.reason
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    /**
     * [ÉXITO]: El registro ha sido creado en 'podcast_drafts'.
     * El Database Trigger 'tr_on_draft_created' ahora disparará automáticamente
     * la función de investigación de forma asíncrona en el servidor.
     */
    console.log(`✅ Borrador iniciado con éxito. ID: ${result.draft_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        draft_id: result.draft_id,
        message: "Misión aceptada. Iniciando fase de investigación profunda."
      }),
      {
        status: 202, // Accepted: El proceso continúa en el fondo
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err: any) {
    console.error("🔥 [start-draft-process-Fatal]:", err.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});