// supabase/functions/start-draft-process/index.ts
// VERSIÓN: 1.0 (Async Entry Point - Multi-Flow Logic)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const handler = async (req: Request): Promise<Response> => {
  try {
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("SESIÓN_INVÁLIDA");

    const body = await req.json();
    const { purpose, inputs, pulse_source_ids, draft_id } = body;

    // 1. Validar Cuota (Solo si es un borrador nuevo)
    if (!draft_id) {
      const { data: quota } = await supabaseAdmin.rpc('check_draft_quota', { p_user_id: user.id });
      if (!quota.allowed) {
        return new Response(JSON.stringify(quota), { status: 403, headers: corsHeaders });
      }
    }

    // 2. Registro Inicial en la Bóveda (Status: Researching)
    // Guardamos absolutamente toda la metadata de entrada
    const { data: draft, error: dbErr } = await supabaseAdmin.from('podcast_drafts').upsert({
      id: draft_id || undefined,
      user_id: user.id,
      title: inputs.solo_topic || inputs.question_to_answer || "Nueva Investigación",
      status: 'researching',
      creation_data: body,
      updated_at: new Date().toISOString()
    }).select('id').single();

    if (dbErr) throw dbErr;

    // 3. Disparo Asíncrono de Fase B (Investigación)
    // Pasamos el SERVICE_ROLE para que la comunicación interna no sea bloqueada
    supabaseAdmin.functions.invoke('research-intelligence', {
      body: {
        draft_id: draft.id,
        topic: draft.title,
        depth: inputs.narrativeDepth,
        is_pulse: purpose === 'pulse',
        pulse_source_ids: pulse_source_ids
      }
    });

    // 4. Respuesta inmediata al Frontend (Status 202 Accepted)
    return new Response(JSON.stringify({
      success: true,
      draft_id: draft.id,
      message: "Proceso de inteligencia profunda iniciado."
    }), { status: 202, headers: corsHeaders });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
};

serve(guard(handler));