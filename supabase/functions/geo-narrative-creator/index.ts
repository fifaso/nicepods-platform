/**
 * ARCHIVO: supabase/functions/geo-narrative-creator/index.ts
 * VERSIÓN: 2.0 (NicePod Sovereign Narrative Engine - Defensive Parsing & Industrial Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Sintetizar crónicas urbanas de alta fidelidad basadas en evidencia física 
 * validada y anclada en la Bóveda NKV. El motor literario transmuta el dossier 
 * técnico en una narrativa prosódica sintonizada con la época y el tono seleccionado.
 * [REFORMA V2.0]: Implementación absoluta de la Zero Abbreviations Policy (ZAP). 
 * Integración de 'parseAIJson' para Defensive AI Parsing. Sincronización nominal 
 * total con la Constitución de Soberanía V8.6 y persistencia atómica.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * ---------------------------------------------------------------------------
 * I. CONFIGURACIÓN DE INTELIGENCIA INDUSTRIAL (EL METAL)
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
 * Misión: Determinar la extensión métrica de la crónica según la profundidad.
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
  // 1. GESTIÓN DE PROTOCOLO CORS (Preflight)
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

    // 3. DESEMPAQUETADO DEL PAYLOAD DE SÍNTESIS
    const payload: NarrativeSynthesisPayload = await request.json();
    const { 
      pointOfInterestIdentification, 
      narrativeDepth, 
      narrativeTone, 
      refinedAdministratorIntent 
    } = payload;

    // 4. RECUPERACIÓN DEL DOSSIER MULTIDIMENSIONAL DESDE EL METAL
    console.info(`   > Recuperando expediente del Nodo #${pointOfInterestIdentification}...`);
    
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
      throw new Error("POI_DOSSIER_NOT_FOUND_IN_METAL_VAULT");
    }

    // [BSS]: Mapeo de buffer para asegurar acceso nominal a los campos del peritaje.
    const ingestionBufferData = (pointOfInterestData as any).point_of_interest_ingestion_buffer[0];
    const targetWordCountMagnitude = calculateTargetWordCountMagnitude(narrativeDepth);

    /**
     * 5. INGENIERÍA DE PROMPT: EL AGENTE 38 (ARQUITECTO NARRATIVO)
     * Misión: Integrar la evidencia física con la intencionalidad humana.
     */
    const systemNarrativeInstruction = `
      Actúa como el 'Agente 38', el Cronista Urbano de Élite de NicePod Madrid.
      Tu misión es redactar una crónica narrativa de alta fidelidad sobre el hito: "${pointOfInterestData.name}".
      
      DOGMA TÉCNICO: "Witness, Not Diarist". Eres un observador omnisciente. 
      ESTILO EDITORIAL: Tono ${narrativeTone}. Debe ser elegante, técnico pero evocador.
      RESTRICCIÓN MÉTRICA: Alrededor de ${targetWordCountMagnitude} palabras.
      
      EVIDENCIA FÍSICA PROVENIENTE DEL PERITAJE (VERDAD ABSOLUTA):
      - Texto Detectado (OCR): "${ingestionBufferData.raw_ocr_text || 'No disponible'}"
      - Época Histórica Sintonizada: ${pointOfInterestData.historical_epoch}
      - Estilo Arquitectónico: ${ingestionBufferData.visual_analysis_dossier?.architectureStyle}
      - Atmósfera Urbana: ${ingestionBufferData.visual_analysis_dossier?.atmosphere}
      
      INTENCIÓN COGNITIVA DEL ADMINISTRADOR:
      "${refinedAdministratorIntent || ingestionBufferData.visual_analysis_dossier?.administrator_original_intent}"
      
      PROTOCOLO ACÚSTICO (MANDATORIO):
      1. NO utilices Markdown (sin asteriscos, sin negritas, sin hashtags). 
      2. El texto será procesado por una voz neuronal; utiliza puntuación estratégica para marcar el ritmo.
      3. Escribe cifras significativas en letras para asegurar una dicción perfecta.
      4. No uses comillas dobles internas en las propiedades JSON.

      RESPONDE EXCLUSIVAMENTE EN ESTE FORMATO JSON:
      {
        "poeticTitle": "Título industrial para el activo",
        "historicalFactSummary": "Frase de impacto (máx 85 caracteres) que resuma un hecho único.",
        "narrativeScriptContent": "El guion completo de la crónica.",
        "semanticTagsCollection": ["etiqueta1", "etiqueta2"]
      }
    `;

    /**
     * 6. INVOCACIÓN AL MOTOR DE INTELIGENCIA PRO (GEMINI 1.5 PRO)
     * Misión: Utilizar el modelo superior para garantizar calidad literaria y prosodia.
     */
    console.info(`   > Despertando motor literario: gemini-1.5-pro. Sintetizando sabiduría...`);

    const intelligenceAgencyResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.PRO}:generateContent?key=${GOOGLE_INTELLIGENCE_AGENCY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemNarrativeInstruction }] }],
          generationConfig: {
            temperature: 0.75, // Balance entre rigor técnico y fluidez narrativa
            response_mime_type: "application/json"
          }
        })
      }
    );

    if (!intelligenceAgencyResponse.ok) {
      const exceptionText = await intelligenceAgencyResponse.text();
      throw new Error(`AI_GATEWAY_LITERARY_FAILURE: ${intelligenceAgencyResponse.status} - ${exceptionText}`);
    }

    const intelligenceAgencyData = await intelligenceAgencyResponse.json();
    const rawSynthesisResponseText = intelligenceAgencyData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawSynthesisResponseText) {
      throw new Error("ORACLE_NARRATIVE_EMPTY_RESPONSE_EXCEPTION");
    }

    /**
     * 7. DEFENSIVE AI PARSING (ADUANA LITERARIA)
     * [REFORMA V2.0]: Aplicación del protocolo de saneamiento sintáctico.
     */
    const validatedSynthesisResults = parseAIJson<NarrativeOracleOutput>(rawSynthesisResponseText);

    /**
     * 8. ANCLAJE Y SELLADO EN EL METAL (POSTGRESQL)
     * Realizamos la materialización de la sabiduría en el registro definitivo del nodo.
     */
    const { error: databaseUpdateException } = await supabaseAdministrator
      .from('points_of_interest')
      .update({
        name: validatedSynthesisResults.poeticTitle,
        historical_fact: validatedSynthesisResults.historicalFactSummary,
        rich_description: validatedSynthesisResults.narrativeScriptContent,
        status: 'narrated', // El ciclo de vida evoluciona a la Fase 4
        updated_at: new Date().toISOString()
      })
      .eq('id', pointOfInterestIdentification);

    if (databaseUpdateException) {
      throw new Error(`DATABASE_NARRATIVE_COMMIT_FAILURE: ${databaseUpdateException.message}`);
    }

    console.info(`✅ [Narrative-Creator][${processingCorrelationIdentification}] Sabiduría sintetizada y anclada.`);

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
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Defensive Parsing Implementation: La sustitución de JSON.parse por la utilidad shared 
 *    'parseAIJson' garantiza que la función sea resiliente ante fallos de escapado 
 *    sintáctico de Gemini Pro.
 * 2. Zero Abbreviations Policy: Purificación nominal absoluta (targetWordCountMagnitude, 
 *    databaseUpdateException, processingCorrelationIdentification).
 * 3. Acoustic Integrity: El prompt obliga al Agente 38 a omitir Markdown y a escribir 
 *    cifras en palabras, optimizando el guion para la síntesis de audio final.
 */