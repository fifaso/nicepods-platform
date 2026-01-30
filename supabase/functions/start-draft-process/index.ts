// supabase/functions/start-draft-process/index.ts
// VERSIÓN: 1.1 (High Speed Receptionist - CPU Optimized)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const handler = async (req: Request): Promise<Response> => {
  try {
    // 1. Validación de sesión ultra-rápida
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("UNAUTHORIZED");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("SESSION_EXPIRED");

    // 2. Lectura del Body (Solo una vez)
    const body = await req.json();
    const { purpose, inputs, draft_id } = body;

    // 3. Validación de Cuota vía RPC (Lógica delegada a SQL para ahorrar CPU en el Edge)
    const { data: quota, error: qErr } = await supabaseAdmin.rpc('check_draft_quota', {
      p_user_id: user.id
    });

    if (qErr || !quota?.allowed) {
      return new Response(JSON.stringify(quota || { allowed: false, reason: "Quota Error" }), {
        status: 403, headers: corsHeaders
      });
    }

    // 4. Registro en Bóveda (Status: Researching)
    // El 'upsert' es eficiente en CPU.
    const { data: draft, error: dbErr } = await supabaseAdmin.from('podcast_drafts').upsert({
      id: draft_id || undefined,
      user_id: user.id,
      title: inputs?.solo_topic || inputs?.question_to_answer || "Nueva Misión",
      status: 'researching',
      creation_data: body,
      updated_at: new Date().toISOString()
    }).select('id').single();

    if (dbErr) throw dbErr;

    // 5. Disparo Asíncrono de Inteligencia (Malla de Investigación)
    // Usamos fetch nativo para minimizar overhead de librerías
    const internalUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/research-intelligence`;

    // Fire and forget (No esperamos el await)
    fetch(internalUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        draft_id: draft.id,
        topic: draft.title,
        depth: inputs?.narrativeDepth || "Medio"
      })
    }).catch(e => console.error("Async Trigger Fail:", e.message));

    // 6. Respuesta inmediata (UX de alta velocidad)
    return new Response(JSON.stringify({
      success: true,
      draft_id: draft.id
    }), { status: 202, headers: corsHeaders });

  } catch (e: any) {
    console.error("🔥 start-draft-process error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: corsHeaders
    });
  }
};

serve(guard(handler));