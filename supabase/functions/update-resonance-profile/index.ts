// supabase/functions/update-resonance-profile/index.ts
// VERSIÓN: 2.0.0 (Guard Integrated: Sentry + Arcjet + Weighted Resonance)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { guard } from "../_shared/guard.ts"; // <--- INTEGRACIÓN DEL ESTÁNDAR
import { corsHeaders } from '../_shared/cors.ts';

const EVENT_LIMIT = 30;

// Definimos los pesos base para cada tipo de interacción.
const INTERACTION_WEIGHTS: Record<string, number> = {
  'liked': 1.5,
  'completed_playback': 1.0,
};

// --- LÓGICA DE NEGOCIO (HANDLER) ---
const handler = async (req: Request): Promise<Response> => {
  // El Guard maneja OPTIONS y CORS automáticamente

  // 1. VALIDACIÓN DE ENTORNO
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("FATAL: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados.");
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const payload = await req.json();
    const userId = payload?.record?.user_id;

    if (!userId) {
      // Error de Negocio (Bad Request) -> No reportar a Sentry como crítico
      return new Response(JSON.stringify({ error: "Payload inválido, falta user_id." }), { 
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    console.log(`🚀 Iniciando recálculo de resonancia para el usuario: ${userId}`);

    // 2. OBTENCIÓN DE DATOS (PARALELO)
    const [
      { data: recentPlays, error: playsError },
      { data: recentLikes, error: likesError }
    ] = await Promise.all([
      supabaseAdmin.from('playback_events').select('podcast_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(EVENT_LIMIT),
      supabaseAdmin.from('likes').select('podcast_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(EVENT_LIMIT)
    ]);

    if (playsError) throw new Error(`Error fetching plays: ${playsError.message}`);
    if (likesError) throw new Error(`Error fetching likes: ${likesError.message}`);

    // 3. PROCESAMIENTO DE INTERACCIONES
    const combinedInteractions = [
      ...(recentPlays || []).map(p => ({ ...p, type: 'completed_playback' as const })),
      ...(recentLikes || []).map(l => ({ ...l, type: 'liked' as const }))
    ];

    combinedInteractions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const recentInteractions = combinedInteractions.slice(0, EVENT_LIMIT);

    if (recentInteractions.length === 0) {
      return new Response(JSON.stringify({ message: "No hay interacciones recientes para este usuario." }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    const podcastIds = [...new Set(recentInteractions.map(event => event.podcast_id))];
    
    const { data: podcasts, error: podcastsError } = await supabaseAdmin
      .from('micro_pods')
      .select('id, final_coordinates')
      .in('id', podcastIds)
      .not('final_coordinates', 'is', null);

    if (podcastsError) throw new Error(`Error fetching podcasts: ${podcastsError.message}`);
    
    if (!podcasts || podcasts.length === 0) {
      return new Response(JSON.stringify({ message: "Los podcasts asociados no tienen coordenadas." }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const coordinatesMap = new Map(podcasts.map(p => [p.id, p.final_coordinates]));

    // 4. CÁLCULO PONDERADO (ALGORITMO DE RESONANCIA)
    let weightedSumX = 0;
    let weightedSumY = 0;
    let totalWeight = 0;

    recentInteractions.forEach((interaction, index) => {
      // Supabase devuelve las coordenadas como string "(x,y)"
      const coordsString = coordinatesMap.get(interaction.podcast_id) as string | undefined;
      
      if (coordsString) {
        // Parseo robusto de coordenadas Postgres Point
        const match = coordsString.match(/\(([^,]+),([^)]+)\)/);
        if (match) {
            const coords = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
            
            const baseWeight = INTERACTION_WEIGHTS[interaction.type] || 0.5;
            const recencyWeight = (EVENT_LIMIT - index) / EVENT_LIMIT; // Lo más reciente vale más
            const finalWeight = baseWeight * recencyWeight;

            weightedSumX += coords.x * finalWeight;
            weightedSumY += coords.y * finalWeight;
            totalWeight += finalWeight;
        }
      }
    });
    
    if (totalWeight === 0) {
      return new Response(JSON.stringify({ message: "No se pudo calcular el centro (pesos cero)." }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const newCenterX = weightedSumX / totalWeight;
    const newCenterY = weightedSumY / totalWeight;
    const pointString = `(${newCenterX},${newCenterY})`;

    // 5. GUARDADO DE PERFIL
    const { error: upsertError } = await supabaseAdmin
      .from('user_resonance_profiles')
      .upsert({
        user_id: userId,
        current_center: pointString,
        last_calculated_at: new Date().toISOString(),
      });

    if (upsertError) throw new Error(`Error updating profile: ${upsertError.message}`);

    console.log(`✅ Resonancia actualizada para ${userId}: ${pointString}`);

    return new Response(JSON.stringify({ success: true, newCenter: { x: newCenterX, y: newCenterY } }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    // Relanzamos el error para que el Guard (Sentry) lo capture y reporte.
    // Esto asegura que sepamos si el algoritmo de resonancia está fallando en producción.
    throw error;
  }
};

// --- PUNTO DE ENTRADA PROTEGIDO ---
serve(guard(handler));