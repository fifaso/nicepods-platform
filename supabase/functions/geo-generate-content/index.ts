// supabase/functions/geo-generate-content/index.ts
// VERSIÓN: 3.0

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del Núcleo Sincronizado
import { AI_MODELS, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { guard } from "../_shared/guard.ts";

/**
 * INTERFAZ: GeoGeneratePayload
 * Contrato de parámetros finales emitidos por la Terminal GEO del Admin.
 */
interface GeoGeneratePayload {
  draftId: number;        // ID del borrador creado en geo-ingest-context
  finalIntent: string;    // Texto ajustado por el admin tras el análisis visual
  depth: string;          // Flash (30s) | Cronica (2m) | Inmersion (5m)
  tone: string;           // Academico | Epico | Melancolico | Neutro
  categoryId: string;     // historia | arte | naturaleza | secreto
}

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * UTILIDAD: getWordCountByDepth
 * Traduce el deseo de profundidad del Admin a límites estrictos para la IA.
 */
function getWordCountByDepth(depth: string): number {
  switch (depth.toLowerCase()) {
    case 'flash': return 90;      // ~45 segundos
    case 'cronica': return 250;   // ~1.5 - 2 minutos
    case 'inmersion': return 700; // ~4.5 - 5 minutos
    default: return 200;
  }
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  console.info(`✍️ [Geo-Chronicler][${correlationId}] Iniciando forja narrativa urbana.`);

  try {
    const payload: GeoGeneratePayload = await request.json();

    if (!payload.draftId) {
      throw new Error("DRAFT_ID_MISSING: El hilo de forja está roto.");
    }

    // 1. RECUPERACIÓN DEL DOSSIER FORENSE
    console.info(`   > Recuperando Dossier del Borrador #${payload.draftId}`);
    const { data: draft, error: fetchError } = await supabaseAdmin
      .from('podcast_drafts')
      .select('creation_data, user_id')
      .eq('id', payload.draftId)
      .single();

    if (fetchError || !draft) throw new Error("FALLO_LECTURA_BÓVEDA");

    const dossier = draft.creation_data.geo_dossier;
    const targetWordCount = getWordCountByDepth(payload.depth);

    // 2. CONSTRUCCIÓN DEL PROMPT DEL AGENTE 38 (El Historiador Urbano)
    const systemPrompt = `
      Eres el 'Agente 38', el Arquitecto Narrativo de NicePod.
      Estás escribiendo una crónica de audio sobre un lugar específico de la ciudad.
      
      DOGMA ESTRICTO: "Witness, Not Diarist". Eres un observador omnisciente y elegante. 
      No uses primera persona ("yo fui", "nosotros vemos"). No saludes ni te despidas.
      
      EVIDENCIA DEL LUGAR:
      - Coordenadas: ${dossier.location.latitude}, ${dossier.location.longitude}
      - Precisión del satélite: ${dossier.location.accuracy} metros
      - Análisis Visual: ${dossier.ai_analysis?.detectedArchitecture} | ${dossier.ai_analysis?.atmosphere}
      - Texto extraído de placa/cartel (OCR): "${dossier.ocr_text || 'Sin texto físico.'}"
      
      INTENCIÓN DEL ADMINISTRADOR:
      "${payload.finalIntent}"
      
      REQUERIMIENTOS TÉCNICOS:
      1. Tono: ${payload.tone}.
      2. Longitud estricta: Alrededor de ${targetWordCount} palabras. Ni más, ni menos.
      3. Higiene Acústica: El texto 'script_body' será leído por una IA neuronal. NO uses Markdown (*, #, _, -). Usa pausas naturales con puntos y comas. Escribe los números largos como palabras si es necesario para la dicción.
      
      RESPONDE ÚNICA Y EXCLUSIVAMENTE CON ESTE FORMATO JSON:
      {
        "title": "Un título poético o descriptivo del lugar",
        "historical_fact": "Una sola frase brillante (máx 80 caracteres) que resuma la esencia del lugar. Se usará como titular rápido.",
        "script_body": "El guion completo de la crónica.",
        "script_plain": "Una copia del guion completo."
      }
    `;

    console.info(`   > Sintetizando conocimiento (Longitud objetivo: ${targetWordCount} palabras)...`);

    // Llamada a Gemini 3.0 Flash (No necesitamos visión aquí, solo texto)
    const aiResponse = await callGeminiMultimodal(systemPrompt, undefined, AI_MODELS.FLASH, 0.7);
    const contentData = parseAIJson<{
      title: string;
      historical_fact: string;
      script_body: string;
      script_plain: string;
    }>(aiResponse);

    // 3. PERSISTENCIA Y BIFURCACIÓN DE ESTRUCTURAS
    console.info(`   > Crónica generada: "${contentData.title}". Escribiendo en Bóveda.`);

    // A. Actualizamos el Borrador con el guion para que el Admin lo pueda revisar/escuchar
    const { error: updateError } = await supabaseAdmin
      .from('podcast_drafts')
      .update({
        title: contentData.title,
        script_text: {
          script_body: contentData.script_body,
          script_plain: contentData.script_plain
        },
        status: 'ready' // Listo para promoción a producción
      })
      .eq('id', payload.draftId);

    if (updateError) throw new Error(`DB_UPDATE_FAIL: ${updateError.message}`);

    // B. [NUEVO FLUJO V3]: Guardamos temporalmente los datos del POI en el JSONB 
    // de 'creation_data'. De esta forma, cuando el admin pulse "Publicar" en la UI, 
    // el RPC 'promote_draft_to_production' sabrá que debe crear un registro en points_of_interest.

    // Actualizamos el campo JSONB de creation_data
    const updatedCreationData = {
      ...draft.creation_data,
      geo_poi_data: {
        latitude: dossier.location.latitude,
        longitude: dossier.location.longitude,
        category_id: payload.categoryId,
        historical_fact: contentData.historical_fact,
        resonance_radius: dossier.resonanceRadius || 30, // Default a 30m
        // En un flujo futuro, aquí inyectaríamos las URLs de las imágenes ya subidas
      }
    };

    await supabaseAdmin
      .from('podcast_drafts')
      .update({ creation_data: updatedCreationData })
      .eq('id', payload.draftId);

    console.info(`✅ [Geo-Chronicler][${correlationId}] Forja narrativa finalizada.`);

    // 4. RETORNO SOBERANO AL CLIENTE
    return new Response(JSON.stringify({
      status: 'ACCEPTED',
      draftId: payload.draftId,
      script: contentData.script_plain,
      title: contentData.title
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Geo-Chronicler-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Control de Duración (FinOps): Al forzar un límite de palabras en el prompt, 
 *    garantizamos que un audio "Flash" no consuma el mismo presupuesto de la API
 *    de Google TTS que un "Documental de 5 minutos".
 * 2. OCR en Acción: La IA ahora recibe la variable 'ocr_text' que extrajimos en el 
 *    paso anterior. Esto evita errores garrafales como confundir un siglo o un 
 *    nombre propio, elevando la fiabilidad de NicePod a nivel enciclopédico.
 * 3. Diseño Asíncrono de DB: No creamos el POI físico aquí. Guardamos su 'mapa' 
 *    (geo_poi_data) en el borrador. Así, si el Admin decide borrar el borrador 
 *    porque no le gustó el guion, no dejamos POIs basura en el mapa de producción.
 */