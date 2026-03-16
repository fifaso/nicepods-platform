// supabase/functions/geo-narrative-creator/index.ts
// VERSIÓN: 1.0 (NicePod V2.6 - Sovereign Narrative Engine)
// Misión: Sintetizar crónicas urbanas basadas en evidencia física validada.
// [ESTABILIZACIÓN]: Integración de Dogma 'Witness, Not Diarist' e Higiene Acústica.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

// --- CONFIGURACIÓN DE INTELIGENCIA INDUSTRIAL ---
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const GEMINI_MODEL = "gemini-1.5-pro"; // Usamos Pro para máxima calidad literaria

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * INTERFAZ: NarrativePayload
 * Contrato de entrada desde el Stepper final de la Workstation.
 */
interface NarrativePayload {
  poiId: number;
  depth: 'flash' | 'cronica' | 'inmersion';
  tone: 'academico' | 'misterioso' | 'epico' | 'melancolico' | 'neutro';
  refinedIntent?: string; // Ajustes de última hora del Admin
}

/**
 * getWordCount: Métrica de duración NicePod
 */
const getWordCount = (depth: string) => {
  if (depth === 'flash') return 80;    // ~40 seg
  if (depth === 'inmersion') return 650; // ~4.5 min
  return 220; // 'cronica' ~1.5 min (Default)
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationId = crypto.randomUUID();
  console.info(`🧠 [Narrative-Creator][${correlationId}] Iniciando síntesis intelectual.`);

  try {
    // 1. VALIDACIÓN DE AUTORIDAD
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader?.replace('Bearer ', '') || '');

    if (authError || !user || user.app_metadata.user_role !== 'admin') {
      return new Response(JSON.stringify({ error: "ADMIN_AUTHORITY_REQUIRED" }), {
        status: 403, headers: corsHeaders
      });
    }

    // 2. RECUPERACIÓN DEL DOSSIER COMPLETO
    const { poiId, depth, tone, refinedIntent }: NarrativePayload = await req.json();

    const { data: poiData, error: poiError } = await supabaseAdmin
      .from('points_of_interest')
      .select(`
        name, 
        category_id,
        poi_ingestion_buffer (
          raw_ocr_text,
          weather_snapshot,
          visual_analysis_dossier
        )
      `)
      .eq('id', poiId)
      .single();

    if (poiError || !poiData) throw new Error("POI_DOSSIER_NOT_FOUND");

    const buffer = poiData.poi_ingestion_buffer[0];
    const targetWords = getWordCount(depth);

    /**
     * 3. CONSTRUCCIÓN DEL PROMPT DEL AGENTE 38 (ARQUITECTO NARRATIVO)
     */
    const prompt = `
      Actúa como el 'Agente 38', el Cronista Urbano de NicePod.
      Tu misión es redactar una crónica de alta fidelidad sobre el hito: "${poiData.name}".
      
      DOGMA: "Witness, Not Diarist". Eres un observador omnisciente. 
      ESTILO: Tono ${tone}. Elegante, técnico pero evocador.
      RESTRICCIÓN: Alrededor de ${targetWords} palabras.
      
      EVIDENCIA FÍSICA (VERDAD ABSOLUTA):
      - Texto de placa/inscripción (OCR): "${buffer.raw_ocr_text || 'No disponible'}"
      - Atmósfera capturada: ${buffer.visual_analysis_dossier?.atmosphere}
      - Estilo detectado: ${buffer.visual_analysis_dossier?.architecture}
      - Clima en el momento de la siembra: ${buffer.weather_snapshot?.condition_code}
      
      INTENCIÓN EDITORIAL:
      "${refinedIntent || buffer.visual_analysis_dossier?.admin_original_intent}"
      
      REQUERIMIENTOS ACÚSTICOS:
      1. NO uses Markdown (ni asteriscos, ni hashtags). 
      2. El texto será leído por una voz neuronal. Usa puntuación para marcar el ritmo.
      3. Escribe números significativos en palabras si ayuda a la dicción.
      
      RESPONDE EXCLUSIVAMENTE EN JSON:
      {
        "poeticTitle": "Título sugerido para el activo",
        "historicalFact": "Frase gancho (máx 85 caracteres) que resuma un hecho único.",
        "narrativeScript": "El guion completo de la crónica urbana.",
        "tags": ["tag1", "tag2"]
      }
    `;

    // 4. INVOCACIÓN DEL MOTOR DE INTELIGENCIA
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7, // Balance entre rigor y elegancia literaria
            response_mime_type: "application/json"
          }
        })
      }
    );

    const aiData = await aiResponse.json();
    const synthesis = JSON.parse(aiData.candidates[0].content.parts[0].text);

    /**
     * 5. ANCLAJE EN EL METAL (ACTUALIZACIÓN SOBERANA)
     */
    const { error: updateError } = await supabaseAdmin
      .from('points_of_interest')
      .update({
        name: synthesis.poeticTitle,
        historical_fact: synthesis.historicalFact,
        rich_description: synthesis.narrativeScript,
        status: 'narrated', // El ciclo evoluciona
        updated_at: new Date().toISOString()
      })
      .eq('id', poiId);

    if (updateError) throw updateError;

    console.info(`✅ [Narrative-Creator][${correlationId}] Sabiduría sintetizada para POI: ${poiId}`);

    // 6. RETORNO DE MISIÓN
    return new Response(JSON.stringify({
      success: true,
      data: {
        title: synthesis.poeticTitle,
        hook: synthesis.historicalFact,
        script: synthesis.narrativeScript
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error(`🔥 [Narrative-Creator-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({ error: error.message, trace_id: correlationId }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Rigor Histórico: Al inyectar el OCR como "Verdad Absoluta", evitamos que la IA 
 *    contradiga los datos físicos del lugar, algo crítico para la credibilidad de la Workstation.
 * 2. Economía de Tokens: Se utiliza Gemini 1.5 Pro solo en esta fase, donde la 
 *    creatividad es necesaria. La fase de ingesta (Flash) ahorró los recursos.
 * 3. Acoustic-Ready: La restricción de Markdown en el prompt previene el fallo 
 *    común donde la voz neuronal intenta pronunciar asteriscos como "asterisco".
 */