/**
 * ARCHIVO: supabase/functions/pulse-harvester/index.ts
 * VERSIÓN: 8.3 (Seed Bank Harvester - Sovereign Protocol V8.3)
 * PROTOCOLO: MADRID RESONANCE V8.3
 * MISIÓN: Cosechar papers y alojarlos permanentemente con integridad perimetral guard.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / BSS Green)
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

import { generateEmbedding } from "../_shared/ai.ts";
import { guard, GuardContext } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

const parser = new XMLParser({ ignoreAttributes: false });
const supabaseSovereignAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const NICEPOD_TAXONOMY_COLLECTION = [
  { name: "Artificial Intelligence", query: "cat:cs.AI+OR+cat:cs.LG" },
  { name: "Urbanism & Madrid", query: "all:smart+cities+OR+all:urban+planning" },
  { name: "Cognitive Psychology", query: "all:neuroscience+OR+all:decision+making" },
  { name: "Systems Theory", query: "all:systems+thinking+OR+all:complexity" },
  { name: "Digital Society", query: "cat:cs.CY+OR+all:digital+ethics" }
];

/**
 * generateSecureContentHash:
 * Misión: Generar un identificador único basado en el contenido para evitar duplicidad.
 */
async function generateSecureContentHash(inputTextContent: string): Promise<string> {
  const messageUint8Collection = new TextEncoder().encode(inputTextContent);
  const cryptographicHashBuffer = await crypto.subtle.digest('SHA-256', messageUint8Collection);
  const hashArrayCollection = Array.from(new Uint8Array(cryptographicHashBuffer));
  return hashArrayCollection.map(byteValue => byteValue.toString(16).padStart(2, '0')).join('');
}

/**
 * fetchIntelligenceFromArxiv:
 * Misión: Recuperar crónicas científicas desde el repositorio arXiv.
 */
async function fetchIntelligenceFromArxiv(taxonomyCategorySnapshot: typeof NICEPOD_TAXONOMY_COLLECTION[0]) {
  const intelligenceResultsCollection: any[] = [];
  try {
    const arxivUniformResourceLocator = `https://export.arxiv.org/api/query?search_query=${taxonomyCategorySnapshot.query}&sortBy=relevance&sortOrder=descending&max_results=15`;
    const networkResponse = await fetch(arxivUniformResourceLocator);
    if (networkResponse.ok) {
      const xmlDataContent = await networkResponse.text();
      const parsedDataSnapshot = parser.parse(xmlDataContent);
      const entryItemsCollection = Array.isArray(parsedDataSnapshot.feed?.entry) ? parsedDataSnapshot.feed.entry : (parsedDataSnapshot.feed?.entry ? [parsedDataSnapshot.feed.entry] : []);

      entryItemsCollection.forEach((entrySnapshot: any) => {
        if (entrySnapshot.title && entrySnapshot.summary) {
          intelligenceResultsCollection.push({
            title: entrySnapshot.title.replace(/\n/g, " ").trim(),
            summary: entrySnapshot.summary.replace(/\n/g, " ").trim(),
            uniformResourceLocator: entrySnapshot.id?.replace('/abs/', '/pdf/'),
            sourceName: "arXiv",
            authorityScore: 8.5
          });
        }
      });
    }
  } catch (exceptionMessageInformation: any) {
    console.error("⚠️ [Harvester] arXiv Fail:", exceptionMessageInformation.message);
  }
  return intelligenceResultsCollection;
}

/**
 * executeHarvestingOrchestrationHandler:
 * Misión: Orquestar la cosecha permanente de capital intelectual.
 */
const executeHarvestingOrchestrationHandler = async (incomingRequest: Request, context: GuardContext): Promise<Response> => {
  const correlationIdentification = context.correlationIdentification;
  const selectedTaxonomyCategorySnapshot = NICEPOD_TAXONOMY_COLLECTION[Math.floor(Math.random() * NICEPOD_TAXONOMY_COLLECTION.length)];

  // PROTOCOLO DE SEGURIDAD: Solo permitimos acceso interno (Trusted Zone) para la cosecha automática.
  if (!context.isTrusted) {
      console.warn(`🛑 [Harvester][${correlationIdentification}] Intento de acceso externo bloqueado.`);
      return new Response(JSON.stringify({ error: "Unauthorized: Internal infrastructure only." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
  }

  console.info(`📡 [Harvester][${correlationIdentification}] Cosecha permanente iniciada: ${selectedTaxonomyCategorySnapshot.name}`);

  try {
    const rawIntelligenceItemsCollection = await fetchIntelligenceFromArxiv(selectedTaxonomyCategorySnapshot);
    let ingestedCountMagnitude = 0;

    for (const pulseItemSnapshot of rawIntelligenceItemsCollection) {
      const contentHashIdentification = await generateSecureContentHash(pulseItemSnapshot.title + pulseItemSnapshot.uniformResourceLocator);

      const { data: existingRecordSnapshot } = await supabaseSovereignAdmin
        .from('pulse_staging')
        .select('id')
        .eq('content_hash', contentHashIdentification)
        .maybeSingle();

      if (existingRecordSnapshot) continue;

      const semanticEmbeddingVector = await generateEmbedding(`${pulseItemSnapshot.title} ${pulseItemSnapshot.summary}`);

      const { error: databaseInsertHardwareException } = await supabaseSovereignAdmin
        .from('pulse_staging')
        .insert({
          content_hash: contentHashIdentification,
          title: pulseItemSnapshot.title,
          summary: pulseItemSnapshot.summary.substring(0, 2000),
          uniformResourceLocator: pulseItemSnapshot.uniformResourceLocator,
          source_name: pulseItemSnapshot.sourceName,
          content_type: 'paper',
          authority_score: pulseItemSnapshot.authorityScore,
          veracity_verified: true,
          embedding: semanticEmbeddingVector,
          is_high_value: true,
          usage_count: 0,
          expires_at: null
        });

      if (!databaseInsertHardwareException) ingestedCountMagnitude++;
    }

    return new Response(JSON.stringify({
      success: true,
      ingestedCountMagnitude: ingestedCountMagnitude,
      traceIdentification: correlationIdentification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (exceptionMessageInformation: any) {
    console.error(`🔥 [Harvester-Fatal][${correlationIdentification}]:`, exceptionMessageInformation.message);
    return new Response(JSON.stringify({
      error: exceptionMessageInformation.message,
      traceIdentification: correlationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

Deno.serve(guard(executeHarvestingOrchestrationHandler));
