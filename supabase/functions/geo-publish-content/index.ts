// supabase/functions/geo-suite/publish-geo-content/index.ts
// Misión: "Commit". Transforma un borrador geolocalizado en un Micro-Pod público y una Memoria de Lugar.

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

    // 1. Recuperar el Borrador Completo
    const { data: draft } = await supabase
      .from('geo_drafts_staging')
      .select('*')
      .eq('id', draft_id)
      .single();

    if (!draft) throw new Error("Draft not found");

    // 2. Insertar en la Tabla Maestra (Micro Pods)
    const { data: pod, error: podError } = await supabase
      .from('micro_pods')
      .insert({
        user_id: draft.user_id,
        title: `Crónica de ${draft.detected_place_id}`, // Título automático
        description: `Grabado en ${draft.detected_place_id} con clima ${draft.weather_snapshot.condition}`,
        audio_url: audio_path,
        duration_seconds: duration,
        status: 'published', // Publicación inmediata (o pending_approval si prefieres)
        category: 'urban_chronicle', // Categoría especial para filtrar
        creation_mode: 'geo_mode',
        geo_location: draft.location, // Pasamos el dato PostGIS
        place_name: draft.detected_place_id
      })
      .select()
      .single();

    if (podError) throw podError;

    // 3. Crear la "Memoria del Lugar" (Para el mapa AR)
    // Esto habilita que otros usuarios lo encuentren en el mapa
    const { error: memoryError } = await supabase
      .from('place_memories')
      .insert({
        pod_id: pod.id,
        poi_id: draft.detected_place_id,
        geo_location: draft.location,
        focus_entity: draft.detected_place_id,
        content_type: 'chronicle' // Podría venir del semantic router
      });

    if (memoryError) throw memoryError;

    // 4. Limpieza: Borrar el borrador de staging (ya no sirve)
    await supabase.from('geo_drafts_staging').delete().eq('id', draft_id);

    return new Response(JSON.stringify({ success: true, pod_id: pod.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});