// supabase/functions/pulse-harvester/index.ts
// VERSIÓN: 2.1 (Intelligence Harvester - Stable Model Integration)
// Misión: Cosechar papers y tendencias cada 10 minutos integrando el modelo 1.5 Flash verificado.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

// Importaciones del núcleo NicePod sincronizado (v11.2)
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const parser = new XMLParser({ ignoreAttributes: false });
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const SOURCES = {
  ARXIV: "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=5",
  HACKER_NEWS: "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=5",
  OPEN_ALEX: "https://api.openalex.org/works?filter=default_host_group.id:https://openalex.org/S4306400030&sort=publication_date:desc&per_page=5"
};

/**
 * harvestFromSources: Recolector de datos crudos desde APIs académicas.
 */
async function harvestFromSources() {
  const allResults: any[] = [];

  // 1. arXiv
  try {
    const res = await fetch(SOURCES.ARXIV);
    if (res.ok) {
      const xml = await res.text();
      const data = parser.parse(xml);
      const entries = data.feed?.entry;
      const items = Array.isArray(entries) ? entries : (entries ? [entries] : []);
      items.forEach((e: any) => {
        if (e.title && e.summary) {
          allResults.push({ title: e.title, summary: e.summary, url: e.id, source_name: "arXiv", content_type: "paper" });
        }
      });
    }
  } catch (error) { console.error("⚠️ arXiv Fail:", error.message); }

  // 2. OpenAlex
  try {
    const res = await fetch(SOURCES.OPEN_ALEX, {
      headers: { "User-Agent": `NicePod-Pulse/2.1 (mailto:${Deno.env.get("ADMIN_EMAIL")})` }
    });
    if (res.ok) {
      const data = await res.json();
      data.results?.forEach((w: any) => {
        allResults.push({ title: w.display_name, summary: "Academic paper summary and citation.", url: w.doi || w.id, source_name: "OpenAlex", content_type: "paper" });
      });
    }
  } catch (error) { console.error("⚠️ OpenAlex Fail:", error.message); }

  // 3. HackerNews
  try {
    const res = await fetch(SOURCES.HACKER_NEWS);
    if (res.ok) {
      const data = await res.json();
      data.hits?.forEach((h: any) => {
        allResults.push({ title: h.title, summary: h.story_text || h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, source_name: "HackerNews", content_type: "trend" });
      });
    }
  } catch (error) { console.error("⚠️ HackerNews Fail:", error.message); }

  return allResults;
}

/**
 * handler: Punto de entrada del Harvester.
 */
const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();
  console.log(`📡 [Harvester][${correlationId}] Iniciando recolección con Gemini 1.5 Flash...`);

  try {
    const rawItems = await harvestFromSources();
    let ingestedCount = 0;

    for (const item of rawItems) {
      // Duplicidad: Verificación atómica
      const contentHash = btoa(item.title + item.url).substring(0, 64);
      const { data: exists } = await supabaseAdmin.from('pulse_staging').select('id').eq('content_hash', contentHash).maybeSingle();
      if (exists) continue;

      // IA: Juicio de Calidad (Gemini 1.5 Flash)
      const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'pulse-judge-v1').single();

      const prompt = buildPrompt(agent?.prompt_template || "Resume y puntúa autoridad (1-10) y categoría para: {{text}}", {
        text: `${item.title} - ${item.summary}`
      });

      const aiResponse = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.1);
      const judgment = parseAIJson<any>(aiResponse);

      if (judgment.authority_score < 4.0) continue;

      // Vectorización: 768 dimensiones
      const embedding = await generateEmbedding(`${judgment.summary} ${item.title}`);

      // Persistencia: Inserción en Bóveda Volátil (Pulse Staging)
      const { error: insertErr } = await supabaseAdmin.from('pulse_staging').insert({
        content_hash: contentHash,
        title: item.title,
        summary: judgment.summary,
        url: item.url,
        source_name: item.source_name,
        content_type: judgment.category?.toLowerCase() || 'paper',
        authority_score: judgment.authority_score,
        embedding: embedding, // 768d
        is_high_value: judgment.authority_score > 8.0,
        expires_at: new Date(Date.now() + (judgment.authority_score > 8.0 ? 168 : 48) * 60 * 60 * 1000).toISOString()
      });

      if (!insertErr) ingestedCount++;
    }

    console.log(`✅ [Harvester] Ciclo completado. Ingestados: ${ingestedCount}`);

    return new Response(JSON.stringify({
      success: true,
      ingested: ingestedCount,
      trace_id: correlationId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Harvester-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
};

serve(handler);