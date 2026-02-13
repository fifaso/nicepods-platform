// supabase/functions/pulse-harvester/index.ts
// VERSIÓN: 2.2 (Ultra-Lean Harvester - Embedding-Only Edition)
// Misión: Cosechar y vectorizar conocimiento académico automáticamente sin juicio de LLM.
// [OPTIMIZACIÓN]: Eliminación de llamadas a Gemini Flash. 100% dependiente de vectores 768d.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

// Importaciones del núcleo NicePod sincronizado (v11.3)
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const parser = new XMLParser({ ignoreAttributes: false });
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/**
 * FUENTES DE CONOCIMIENTO ACADÉMICO Y TÉCNICO
 */
const SOURCES = {
  ARXIV: "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=5",
  HACKER_NEWS: "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=5",
  OPEN_ALEX: "https://api.openalex.org/works?filter=default_host_group.id:https://openalex.org/S4306400030&sort=publication_date:desc&per_page=5"
};

/**
 * harvestFromSources: Recolector políglota de datos crudos.
 */
async function harvestFromSources() {
  const allResults: any[] = [];

  // 1. arXiv (XML)
  try {
    const res = await fetch(SOURCES.ARXIV);
    if (res.ok) {
      const xml = await res.text();
      const data = parser.parse(xml);
      const entries = data.feed?.entry;
      const items = Array.isArray(entries) ? entries : (entries ? [entries] : []);
      items.forEach((e: any) => {
        if (e.title && e.summary) {
          allResults.push({
            title: e.title,
            summary: e.summary,
            url: e.id,
            source_name: "arXiv",
            type: "paper",
            base_score: 8.5 // Los papers tienen autoridad intrínseca alta
          });
        }
      });
    }
  } catch (error) { console.error("⚠️ arXiv Fail:", error.message); }

  // 2. OpenAlex (JSON)
  try {
    const res = await fetch(SOURCES.OPEN_ALEX, {
      headers: { "User-Agent": "NicePod-Bot/2.2" }
    });
    if (res.ok) {
      const data = await res.json();
      data.results?.forEach((w: any) => {
        allResults.push({
          title: w.display_name,
          summary: "Resumen académico disponible en la fuente original.",
          url: w.doi || w.id,
          source_name: "OpenAlex",
          type: "paper",
          base_score: 8.0
        });
      });
    }
  } catch (error) { console.error("⚠️ OpenAlex Fail:", error.message); }

  // 3. HackerNews (JSON)
  try {
    const res = await fetch(SOURCES.HACKER_NEWS);
    if (res.ok) {
      const data = await res.json();
      data.hits?.forEach((h: any) => {
        allResults.push({
          title: h.title,
          summary: h.story_text || h.title,
          url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          source_name: "HackerNews",
          type: "trend",
          base_score: 6.0
        });
      });
    }
  } catch (error) { console.error("⚠️ HackerNews Fail:", error.message); }

  return allResults;
}

/**
 * handler: Ejecución del ciclo de cosecha sin intervención de LLM.
 */
const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();
  console.log(`📡 [Harvester][${correlationId}] Iniciando cosecha Embedding-First...`);

  try {
    const rawItems = await harvestFromSources();
    let ingestedCount = 0;

    for (const item of rawItems) {
      // a. Verificación de duplicados (Hash de integridad)
      const contentHash = btoa(item.title + item.url).substring(0, 64);
      const { data: exists } = await supabaseAdmin
        .from('pulse_staging')
        .select('id')
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (exists) continue;

      // b. Vectorización Directa (La matemática es el juicio)
      // Usamos el título y el resumen para crear el ADN semántico
      const embedding = await generateEmbedding(`${item.title} ${item.summary}`);

      // c. Ingestión en Bóveda Volátil
      // Asignamos autoridad basada en la fuente, ahorrando llamadas a Gemini
      const { error: insertErr } = await supabaseAdmin.from('pulse_staging').insert({
        content_hash: contentHash,
        title: item.title,
        summary: item.summary.substring(0, 1500),
        url: item.url,
        source_name: item.source_name,
        content_type: item.type,
        authority_score: item.base_score,
        veracity_verified: item.type === "paper",
        embedding: embedding, // 768d
        is_high_value: item.base_score > 8.0,
        expires_at: new Date(Date.now() + (item.base_score > 8.0 ? 168 : 48) * 60 * 60 * 1000).toISOString()
      });

      if (!insertErr) ingestedCount++;
    }

    console.log(`✅ [Harvester] Ingestados: ${ingestedCount} registros vectorizados.`);

    return new Response(JSON.stringify({
      success: true,
      ingested: ingestedCount,
      trace_id: correlationId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Harvester-Fatal]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
};

serve(handler);