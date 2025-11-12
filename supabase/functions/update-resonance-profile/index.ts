// supabase/functions/update-resonance-profile/index.ts
// VERSIÓN DE LA VICTORIA ABSOLUTA: Integra 'likes' y 'playbacks' con ponderación.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("FATAL: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const EVENT_LIMIT = 30; // Aumentamos ligeramente el límite para capturar más contexto.

// [INTERVENCIÓN ESTRATÉGICA] Definimos los pesos base para cada tipo de interacción.
const INTERACTION_WEIGHTS = {
  'liked': 1.5,
  'completed_playback': 1.0,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const userId = payload?.record?.user_id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Payload inválido, falta user_id." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`🚀 Iniciando recálculo de resonancia para el usuario: ${userId}`);

    // 1. Obtener las últimas interacciones de AMBAS fuentes en paralelo.
    const [
      { data: recentPlays, error: playsError },
      { data: recentLikes, error: likesError }
    ] = await Promise.all([
      supabaseAdmin.from('playback_events').select('podcast_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(EVENT_LIMIT),
      supabaseAdmin.from('likes').select('podcast_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(EVENT_LIMIT)
    ]);

    if (playsError) throw playsError;
    if (likesError) throw likesError;

    // 2. Fusionar, ordenar y limitar el historial de interacciones.
    const combinedInteractions = [
      ...(recentPlays || []).map(p => ({ ...p, type: 'completed_playback' as const })),
      ...(recentLikes || []).map(l => ({ ...l, type: 'liked' as const }))
    ];

    combinedInteractions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const recentInteractions = combinedInteractions.slice(0, EVENT_LIMIT);

    if (recentInteractions.length === 0) {
      return new Response(JSON.stringify({ message: "No hay interacciones recientes para este usuario." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    const podcastIds = [...new Set(recentInteractions.map(event => event.podcast_id))];
    const { data: podcasts, error: podcastsError } = await supabaseAdmin
      .from('micro_pods')
      .select('id, final_coordinates')
      .in('id', podcastIds)
      .not('final_coordinates', 'is', null);

    if (podcastsError) throw podcastsError;
    if (!podcasts || podcasts.length === 0) {
      return new Response(JSON.stringify({ message: "Los podcasts asociados no tienen coordenadas para calcular." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const coordinatesMap = new Map(podcasts.map(p => [p.id, p.final_coordinates]));

    // 3. Calcular el promedio ponderado con el nuevo sistema de pesos.
    let weightedSumX = 0;
    let weightedSumY = 0;
    let totalWeight = 0;

    recentInteractions.forEach((interaction, index) => {
      const coordsString = coordinatesMap.get(interaction.podcast_id);
      if (coordsString) {
        const match = coordsString.match(/\(([^,]+),([^)]+)\)/);
        if (match) {
            const coords = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
            
            const baseWeight = INTERACTION_WEIGHTS[interaction.type] || 0.5; // Peso base por tipo
            const recencyWeight = (EVENT_LIMIT - index) / EVENT_LIMIT; // Peso por frescura
            const finalWeight = baseWeight * recencyWeight;

            weightedSumX += coords.x * finalWeight;
            weightedSumY += coords.y * finalWeight;
            totalWeight += finalWeight;
        }
      }
    });
    
    if (totalWeight === 0) {
      return new Response(JSON.stringify({ message: "No se pudo calcular el centro de resonancia." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const newCenterX = weightedSumX / totalWeight;
    const newCenterY = weightedSumY / totalWeight;
    const pointString = `(${newCenterX},${newCenterY})`;

    // 4. Guardar el nuevo perfil de resonancia.
    const { error: upsertError } = await supabaseAdmin
      .from('user_resonance_profiles')
      .upsert({
        user_id: userId,
        current_center: pointString,
        last_calculated_at: new Date().toISOString(),
      });

    if (upsertError) throw upsertError;

    console.log(`✅ Perfil de resonancia actualizado para ${userId}: (${newCenterX.toFixed(2)}, ${newCenterY.toFixed(2)})`);

    return new Response(JSON.stringify({ success: true, newCenter: { x: newCenterX, y: newCenterY } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("❌ Error en update-resonance-profile:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});