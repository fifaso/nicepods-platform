// supabase/functions/update-resonance-profile/index.ts
// VERSIÓN: 2.0.0 (Guard Integrated: Sentry + Arcjet + Weighted Resonance)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { guard, GuardContext } from "../_shared/guard.ts"; // <--- INTEGRACIÓN DEL ESTÁNDAR
import { corsHeaders } from '../_shared/cors.ts';

const RECENT_EVENTS_LIMIT_MAGNITUDE = 30;

// Definimos los pesos base para cada tipo de interacción (Nominal Sovereignty).
const INTERACTION_TYPE_WEIGHTS_MAP: Record<string, number> = {
  'liked': 1.5,
  'completed_playback': 1.0,
};

/**
 * calculateUserResonanceOrchestrator:
 * Misión: Recalcular el centro de gravedad semántico-espacial del usuario con integridad perimetral.
 */
const calculateUserResonanceOrchestrator = async (request: Request, context: GuardContext): Promise<Response> => {
  const correlationIdentification = context.correlationIdentification;

  // 1. VALIDACIÓN DE ENTORNO SOBERANO
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("INFRASTRUCTURE_CONFIGURATION_FATAL: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados.");
  }

  const supabaseSovereignAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const interactionEventPayload = await request.json();
    const userIdentification = interactionEventPayload?.record?.user_id;

    if (!userIdentification) {
      return new Response(JSON.stringify({
        error: "PAYLOAD_INVALIDO: Se requiere user_identification en el registro.",
        trace_identification: correlationIdentification
      }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // PROTOCOLO DE AUTORIDAD: Solo permitimos que la infraestructura (Triggers) o el propio usuario activen esto.
    if (!context.isTrusted) {
      const authorizationHeader = request.headers.get('Authorization');
      if (!authorizationHeader) throw new Error("ACCESO_DENEGADO: Se requiere autorización perimetral.");

      const { data: { user: authenticatedUserSnapshot }, error: authException } = await supabaseSovereignAdmin.auth.getUser(authorizationHeader.replace("Bearer ", ""));
      if (authException || !authenticatedUserSnapshot || authenticatedUserSnapshot.id !== userIdentification) {
        throw new Error("VIOLACION_DE_AUTORIDAD: No se permite recalcular resonancia ajena.");
      }
    }

    console.info(`🚀 [Resonance-Engine][${correlationIdentification}] Recalculando pulso para: ${userIdentification}`);

    // 2. OBTENCIÓN DE DATOS (PARALELO)
    const [
      { data: recentPlaybackEventsCollection, error: playbackHardwareExceptionInformation },
      { data: recentLikesCollection, error: likesHardwareExceptionInformation }
    ] = await Promise.all([
      supabaseSovereignAdmin.from('playback_events').select('podcast_id, created_at').eq('user_id', userIdentification).order('created_at', { ascending: false }).limit(RECENT_EVENTS_LIMIT_MAGNITUDE),
      supabaseSovereignAdmin.from('likes').select('podcast_id, created_at').eq('user_id', userIdentification).order('created_at', { ascending: false }).limit(RECENT_EVENTS_LIMIT_MAGNITUDE)
    ]);

    if (playbackHardwareExceptionInformation) throw new Error(`FETCH_PLAYBACK_FAIL: ${playbackHardwareExceptionInformation.message}`);
    if (likesHardwareExceptionInformation) throw new Error(`FETCH_LIKES_FAIL: ${likesHardwareExceptionInformation.message}`);

    // 3. PROCESAMIENTO DE INTERACCIONES UNIFICADAS
    const combinedInteractionsCollection = [
      ...(recentPlaybackEventsCollection || []).map(playbackEvent => ({ ...playbackEvent, type: 'completed_playback' as const })),
      ...(recentLikesCollection || []).map(likeEvent => ({ ...likeEvent, type: 'liked' as const }))
    ];

    combinedInteractionsCollection.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const prioritizedInteractionsCollection = combinedInteractionsCollection.slice(0, RECENT_EVENTS_LIMIT_MAGNITUDE);

    if (prioritizedInteractionsCollection.length === 0) {
      return new Response(JSON.stringify({ message: "SILENCIO_OPERATIVO: No hay interacciones recientes para este Voyager." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    const relevantPodcastIdentificationsCollection = [...new Set(prioritizedInteractionsCollection.map(event => event.podcast_id))];
    
    const { data: podcastsDatabaseResultsCollection, error: queryHardwareExceptionInformation } = await supabaseSovereignAdmin
      .from('micro_pods')
      .select('id, final_coordinates')
      .in('id', relevantPodcastIdentificationsCollection)
      .not('final_coordinates', 'is', null);

    if (queryHardwareExceptionInformation) throw new Error(`FETCH_PODCASTS_GEOMETRY_FAIL: ${queryHardwareExceptionInformation.message}`);
    
    if (!podcastsDatabaseResultsCollection || podcastsDatabaseResultsCollection.length === 0) {
      return new Response(JSON.stringify({ message: "GEOMETRIA_INSUFICIENTE: Los activos asociados carecen de coordenadas." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const podcastCoordinatesMap = new Map(podcastsDatabaseResultsCollection.map(p => [p.id, p.final_coordinates]));

    // 4. CÁLCULO PONDERADO (ALGORITMO DE RESONANCIA SOBERANO)
    let weightedSumLongitudeX = 0;
    let weightedSumLatitudeY = 0;
    let totalInteractionWeightMagnitude = 0;

    prioritizedInteractionsCollection.forEach((interaction, eventIndex) => {
      const coordinateStringValue = podcastCoordinatesMap.get(interaction.podcast_id) as string | undefined;
      
      if (coordinateStringValue) {
        // Parseo robusto de coordenadas Postgres Point
        const coordinateMatchResults = coordinateStringValue.match(/\(([^,]+),([^)]+)\)/);
        if (coordinateMatchResults) {
            const geodeticCoordinates = {
              longitudeX: parseFloat(coordinateMatchResults[1]),
              latitudeY: parseFloat(coordinateMatchResults[2])
            };
            
            const baseTypeWeightMagnitude = INTERACTION_TYPE_WEIGHTS_MAP[interaction.type] || 0.5;
            const recencyDecayWeightMagnitude = (RECENT_EVENTS_LIMIT_MAGNITUDE - eventIndex) / RECENT_EVENTS_LIMIT_MAGNITUDE;
            const combinedFinalWeightMagnitude = baseTypeWeightMagnitude * recencyDecayWeightMagnitude;

            weightedSumLongitudeX += geodeticCoordinates.longitudeX * combinedFinalWeightMagnitude;
            weightedSumLatitudeY += geodeticCoordinates.latitudeY * combinedFinalWeightMagnitude;
            totalInteractionWeightMagnitude += combinedFinalWeightMagnitude;
        }
      }
    });
    
    if (totalInteractionWeightMagnitude === 0) {
      return new Response(JSON.stringify({ message: "CALCULO_FALLIDO: La sumatoria de pesos es nula." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const recalculatedCenterLongitudeX = weightedSumLongitudeX / totalInteractionWeightMagnitude;
    const recalculatedCenterLatitudeY = weightedSumLatitudeY / totalInteractionWeightMagnitude;
    const sovereignPointString = `(${recalculatedCenterLongitudeX},${recalculatedCenterLatitudeY})`;

    // 5. PERSISTENCIA EN LA MATRIZ (METAL SYNC)
    const { error: databaseUpsertExceptionInformation } = await supabaseSovereignAdmin
      .from('user_resonance_profiles')
      .upsert({
        user_id: userIdentification,
        current_center: sovereignPointString,
        last_calculated_at: new Date().toISOString(),
      });

    if (databaseUpsertExceptionInformation) throw new Error(`DATABASE_PROFILE_UPSERT_FAIL: ${databaseUpsertExceptionInformation.message}`);

    console.info(`✅ [Resonance-Engine][${correlationIdentification}] Resonancia estabilizada para ${userIdentification}: ${sovereignPointString}`);

    return new Response(JSON.stringify({
      success: true,
      new_center: { longitudeX: recalculatedCenterLongitudeX, latitudeY: recalculatedCenterLatitudeY },
      trace_identification: correlationIdentification
    }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido en motor de resonancia";
    console.error(`🔥 [Resonance-Engine-Fatal][${correlationIdentification}]:`, errorMessage);

    // Relanzamos para que el Guard ejecute el protocolo de pánico (Sentry)
    throw exceptionMessageInformation;
  }
};

// --- PUNTO DE ENTRADA SOBERANO ---
Deno.serve(guard(calculateUserResonanceOrchestrator));