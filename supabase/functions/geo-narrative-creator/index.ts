/**
 * ARCHIVO: supabase/functions/geo-narrative-creator/index.ts
 * VERSIÓN: 3.0 (NicePod Sovereign Narrative Engine - Industrial Nominal & Defensive Parsing Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Sintetizar crónicas urbanas de alta fidelidad basadas en evidencia física 
 * validada y anclada en la Bóveda NKV. El motor literario transmuta el dossier 
 * técnico en una narrativa prosódica sintonizada con la época y el tono seleccionado.
 * [REFORMA V3.0]: Implementación exhaustiva de la Zero Abbreviations Policy (ZAP). 
 * Refuerzo del protocolo de "Defensive AI Parsing" para neutralizar fallos sintácticos 
 * de Gemini Pro. Sincronización total con la Constitución de Soberanía V8.6 y 
 * persistencia atómica en el Metal.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * ---------------------------------------------------------------------------
 * I. CONFIGURACIÓN DE INFRAESTRUCTURA INDUSTRIAL (EL METAL)
 * ---------------------------------------------------------------------------
 */
const GOOGLE_INTELLIGENCE_AGENCY_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const SUPABASE_INSTANCE_UNIFORM_RESOURCE_LOCATOR = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_SECRET_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabaseAdministrator: SupabaseClient = createClient(
  SUPABASE_INSTANCE_UNIFORM_RESOURCE_LOCATOR ?? "",
  SUPABASE_SERVICE_ROLE_SECRET_KEY ?? ""
);

/**
 * INTERFAZ: NarrativeSynthesisPayload
 * Contrato de entrada síncrono desde el Orquestador de Forja de la terminal.
 */
interface NarrativeSynthesisPayload {
  pointOfInterestIdentification: number;
  narrativeDepth: 'flash' | 'cronica' | 'inmersion';
  narrativeTone: 'academico' | 'misterioso' | 'epico' | 'melancolico' | 'neutro';
  refinedAdministratorIntent?: string;
}

/**
 * INTERFAZ: NarrativeOracleOutput
 * Contrato de salida esperado del Agente 38 (Arquitecto Narrativo).
 */
interface NarrativeOracleOutput {
  poeticTitle: string;
  historicalFactSummary: string;
  narrativeScriptContent: string;
  semanticTagsCollection: string[];
}

/**
 * calculateTargetWordCountMagnitude:
 * Misión: Determinar la extensión métrica de la crónica según la profundidad seleccionada.
 */
const calculateTargetWordCountMagnitude = (narrativeDepth: string): number => {
  if (narrativeDepth === 'flash') return 80;      // Magnitud: ~40 segundos de audio
  if (narrativeDepth === 'inmersion') return 650; // Magnitud: ~4.5 minutos de audio
  return 220; // 'cronica' (Magnitud Estándar Industrial)
};

/**
 * ---------------------------------------------------------------------------
 * II. MOTOR LITERARIO (EL HANDLER SOBERANO)
 * ---------------------------------------------------------------------------
 */
serve(async (request: Request) => {
  // 1. GESTIÓN DE PROTOCOLO DE INTERCAMBIO (CORS Preflight)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const processingCorrelationIdentification = crypto.randomUUID();
  console.info(`🧠 [Narrative-Creator][${processingCorrelationIdentification}] Iniciando síntesis intelectual.`);

  try {
    // 2. VALIDACIÓN DE AUTORIDAD (ADMINISTRATOR RBAC)
    const authorizationHeader = request.headers.get('Authorization');
    const { data: { user: authorizedUser }, error: authenticationException } = 
      await supabaseAdministrator.auth.getUser(authorizationHeader?.replace('Bearer ', '') || '');

    if (authenticationException || !authorizedUser || authorizedUser.app_metadata.user_role !== 'admin') {
      return new Response(JSON.stringify({ error: "ADMIN_AUTHORITY_REQUIRED_FOR_SYNTHESIS" }), {
        status: 403, headers: corsHeaders
      });
    }

    if (!GOOGLE_INTELLIGENCE_AGENCY_API_KEY) {
      throw new Error("INFRASTRUCTURE_EXCEPTION: GOOGLE_AI_API_KEY_MISSING");
    }

    // 3. DESEMPAQUETADO DEL PAYLOAD DE SÍNTESIS TÉCNICA
    const synthesisPayload: NarrativeSynthesisPayload = await request.json();
    const { 
      pointOfInterestIdentification, 
      narrativeDepth, 
      narrativeTone, 
      refinedAdministratorIntent 
    } = synthesisPayload;

    // 4. RECUPERACIÓN DEL DOSSIER MULTIDIMENSIONAL DESDE EL METAL
    console.info(`   > Recuperando expediente pericial del Nodo #${pointOfInterestIdentification}...`);
    
    const { data: pointOfInterestData, error: databaseQueryException } = await supabaseAdministrator
      .from('points_of_interest')
      .select(`
        name, 
        historical_epoch,
        point_of_interest_ingestion_buffer (
          raw_ocr_text,
          weather_snapshot,
          visual_analysis_dossier
        )
      `)
      .eq('id', pointOfInterestIdentification)
      .single();

    if (databaseQueryException || !pointOfInterestData) {
      throw new Error("POINT_OF_INTEREST_DOSSIER_NOT_FOUND_IN_METAL_VAULT");
    }

    /** 
     * [BUILD SHIELD]: Mapeo de buffer de ingesta. 
     * Aseguramos acceso nominal a los campos capturados por el Sensor Ingestor.
     */
    const ingestionBufferMetadata = (pointOfInterestData as unknown as Record<string, unknown>).point_of_interest_ingestion_buffer[0];
    const targetWordCountMagnitude = calculateTargetWordCountMagnitude(narrativeDepth);

    /**
     * 5. INGENIERÍA DE PROMPT: EL AGENTE 38 (ARQUITECTO NARRATIVO)
     * Misión: Integrar la evidencia física capturada con la intencionalidad humana
     * para producir una crónica urbana fidedigna y evocadora.
     */
    const systemNarrativeInstruction = `
      Actúa como el 'Agente 38', el Cronista Urbano de Élite de la Workstation NicePod Madrid.
      Tu misión es redactar una crónica narrativa de alta fidelidad sobre el hito: "${pointOfInterestData.name}".
      
      DOGMA TÉCNICO: "Witness, Not Diarist". Eres un observador omnisciente y aséptico. 
      ESTILO EDITORIAL: Tono ${narrativeTone}. Debe ser técnico pero profundamente evocador.
      RESTRICCIÓN MÉTRICA: Alrededor de ${targetWordCountMagnitude} palabras de densidad.
      
      EVIDENCIA FÍSICA PROVENIENTE DEL PERITAJE (VERDAD ABSOLUTA):
      - Texto Pericial Detectado (OCR): "${ingestionBufferMetadata.raw_ocr_text || 'No disponible'}"
      - Época Histórica de Sintonía: ${pointOfInterestData.historical_epoch}
      - Estilo Arquitectónico Detectado: ${ingestionBufferMetadata.visual_analysis_dossier?.architectureStyle}
      - Atmósfera Urbana Capturada: ${ingestionBufferMetadata.visual_analysis_dossier?.atmosphere}
      
      INTENCIÓN COGNITIVA DEL ADMINISTRADOR:
      "${refinedAdministratorIntent || ingestionBufferMetadata.visual_analysis_dossier?.administrator_original_intent}"
      
      PROTOCOLO ACÚSTICO DE PRODUCCIÓN (MANDATORIO):
      1. SINTAXIS LIMPIA: NO utilices Markdown (sin asteriscos, sin negritas, sin hashtags). 
      2. PROSODIA NEURONAL: El texto será procesado por una voz neuronal; utiliza puntuación estratégica para marcar el ritmo y las pausas.
      3. CLARIDAD NUMÉRICA: Escribe cifras significativas en letras para asegurar una dicción perfecta en la síntesis de audio.
      4. INTEGRIDAD JSON: No uses comillas dobles (") dentro de los valores de texto. Usa comillas simples (') para diálogos.

      RESPONDE EXCLUSIVAMENTE EN ESTE FORMATO JSON:
      {
        "poeticTitle": "Título industrial para el activo de sabiduría",
        "historicalFactSummary": "Frase de impacto (máx 85 caracteres) que resuma un hecho histórico único.",
        "narrativeScriptContent": "El guion completo de la crónica urbana listo para la síntesis de voz.",
        "semanticTagsCollection": ["etiqueta1", "etiqueta2"]
      }
    `;

    /**
     * 6. INVOCACIÓN AL MOTOR DE INTELIGENCIA PRO (GEMINI 1.5 PRO)
     * Utilizamos el modelo PRO para garantizar la máxima calidad literaria y sintonía prosódica.
     */
    console.info(`   > Despertando motor literario Pro: ${AI_MODELS.PRO}. Iniciando síntesis...`);

    const intelligenceAgencyResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.PRO}:generateContent?key=${GOOGLE_INTELLIGENCE_AGENCY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemNarrativeInstruction }] }],
          generationConfig: {
            temperature: 0.75, // Equilibrio entre rigor pericial y fluidez creativa
            response_mime_type: "application/json"
          }
        })
      }
    );

    if (!intelligenceAgencyResponse.ok) {
      const exceptionResponseText = await intelligenceAgencyResponse.text();
      throw new Error(`AI_GATEWAY_LITERARY_FAILURE: ${intelligenceAgencyResponse.status} - ${exceptionResponseText}`);
    }

    const intelligenceAgencyResponseData = await intelligenceAgencyResponse.json();
    const rawSynthesisResponseText = intelligenceAgencyResponseData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawSynthesisResponseText) {
      throw new Error("ORACLE_NARRATIVE_EMPTY_RESPONSE_EXCEPTION");
    }

    /**
     * 7. DEFENSIVE AI PARSING (ADUANA LITERARIA SOBERANA)
     * [REFORMA V3.0]: Aplicación del protocolo de saneamiento heurístico para corregir
     * posibles fallos de Gemini Pro en el escapado de caracteres del JSON.
     */
    const validatedSynthesisResults = parseAIJson<NarrativeOracleOutput>(rawSynthesisResponseText);

    /**
     * 8. ANCLAJE Y SELLADO EN EL METAL (POSTGRESQL)
     * Misión: Materializar la sabiduría sintetizada en el registro definitivo del hito.
     */
    const { error: databaseUpdateException } = await supabaseAdministrator
      .from('points_of_interest')
      .update({
        name: validatedSynthesisResults.poeticTitle,
        historical_fact: validatedSynthesisResults.historicalFactSummary,
        rich_description: validatedSynthesisResults.narrativeScriptContent,
        status: 'narrated', // Evolución del ciclo de vida a la Fase 4
        updated_at: new Date().toISOString()
      })
      .eq('id', pointOfInterestIdentification);

    if (databaseUpdateException) {
      throw new Error(`DATABASE_NARRATIVE_COMMIT_FAILURE: ${databaseUpdateException.message}`);
    }

    console.info(`✅ [Narrative-Creator][${processingCorrelationIdentification}] Sabiduría sintetizada y anclada exitosamente.`);

    // 9. RESPUESTA SOBERANA A LA TERMINAL DE FORJA
    return new Response(JSON.stringify({
      success: true,
      data: {
        title: validatedSynthesisResults.poeticTitle,
        hook: validatedSynthesisResults.historicalFactSummary,
        script: validatedSynthesisResults.narrativeScriptContent
      },
      processingCorrelationIdentification: processingCorrelationIdentification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (operationalHardwareException: any) {
    console.error(`🔥 [Narrative-Creator-Fatal][${processingCorrelationIdentification}]:`, operationalHardwareException.message);
    return new Response(JSON.stringify({ 
      success: false, 
      error: operationalHardwareException.message, 
      processingCorrelationIdentification: processingCorrelationIdentification 
    }), {
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Defensive Parsing Implementation: La utilización de 'parseAIJson' garantiza que el 
 *    motor sea resiliente ante fallos de formato, preservando la integridad del flujo.
 * 2. Zero Abbreviations Policy (ZAP): Purificación nominal total de todas las interfaces, 
 *    variables y constantes (processingCorrelationIdentification, databaseQueryException).
 * 3. Atomic Lifecycle Sync: La actualización en el Metal del nombre poético y la 
 *    descripción rica asegura que el hito esté listo para su publicación final en la Fase 4.
 */