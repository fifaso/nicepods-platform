// supabase/functions/geo-publish-content/index.ts
// VERSIÓN: 1.1 (Production Bridge)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { draft_id, audio_path, duration } = await req.json();

    // 1. Obtener datos del borrador geo
    const { data: draft } = await supabase
      .from('geo_drafts_staging')
      .select('*')
      .eq('id', draft_id)
      .single();

    if (!draft) throw new Error("Borrador no encontrado.");

    // 2. Insertar Micro-Pod oficial
    const { data: pod, error: podError } = await supabase
      .from('micro_pods')
      .insert({
        user_id: draft.user_id,
        title: `Memoria de ${draft.detected_place_id}`,
        description: `Crónica urbana generada en ${draft.detected_place_id}`,
        audio_url: audio_path,
        duration_seconds: duration,
        status: 'published',
        category: 'urban_chronicle',
        creation_mode: 'geo_mode',
        geo_location: draft.location, // Inyección directa de geography point
        place_name: draft.detected_place_id
      })
      .select()
      .single();

    if (podError) throw podError;

    // 3. Registrar en Place Memories para visualización en Mapa
    await supabase.from('place_memories').insert({
      pod_id: pod.id,
      geo_location: draft.location,
      focus_entity: draft.detected_place_id,
      content_type: 'chronicle'
    });

    // 4. Limpieza de Staging
    await supabase.from('geo_drafts_staging').delete().eq('id', draft_id);

    return new Response(JSON.stringify({ success: true, pod_id: pod.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});