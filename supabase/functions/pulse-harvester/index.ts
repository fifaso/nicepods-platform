// supabase/functions/pulse-harvester/index.ts
// VERSIÓN: 1.2 (Harvester Integrity Master - Model Sync & Defensive Fetch)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateContentHash } from "../_shared/vault-utils.ts";

const parser = new XMLParser({ ignoreAttributes: false });
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const SOURCES = {
  ARXIV: "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=5",
  HACKER_NEWS: "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=5",
  OPEN_ALEX: "https://api.openalex.org/works?filter=default_host_group.id:https://openalex.org/S4306400030&sort=publication_date:desc&per_page=5"
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function harvestFromSources() {
  const allResults: any[] = [];

  // A. arXiv (XML - Manejo defensivo de array/objeto)
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
  } catch (e) { console.error("arXiv Source Failure:", e.message); }

  await delay(2000);

  // B. OpenAlex (JSON - [FIX]: Validación de existencia de 'results')
  try {
    const res = await fetch(SOURCES.OPEN_ALEX, {
      headers: { "User-Agent": `NicePod-Pulse/1.0 (mailto:${Deno.env.get("ADMIN_EMAIL")})` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.results && Array.isArray(data.results)) {
        data.results.forEach((w: any) => {
          allResults.push({ title: w.display_name, summary: "Technical Paper Abstract", url: w.doi || w.id, source_name: "OpenAlex", content_type: "paper" });
        });
      }
    }
  } catch (e) { console.error("OpenAlex Source Failure:", e.message); }

  // C. HackerNews (JSON - [FIX]: Validación de existencia de 'hits')
  try {
    const res = await fetch(SOURCES.HACKER_NEWS);
    if (res.ok) {
      const data = await res.json();
      if (data?.hits && Array.isArray(data.hits)) {
        data.hits.forEach((h: any) => {
          allResults.push({ title: h.title, summary: h.story_text || h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, source_name: "HackerNews", content_type: "trend" });
        });
      }
    }
  } catch (e) { console.error("HackerNews Source Failure:", e.message); }

  return allResults;
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();
  console.log(`[Pulse-Harvester][${correlationId}] Iniciando recolección...`);

  try {
    const rawItems = await harvestFromSources();
    let ingestedCount = 0;

    for (const item of rawItems) {
      const contentHash = await generateContentHash(`${item.title}${item.url}`);

      // Verificación atómica de duplicados
      const { data: exists } = await supabaseAdmin.from('pulse_staging').select('id').eq('content_hash', contentHash).maybeSingle();
      if (exists) continue;

      const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'pulse-judge-v1').single();
      const prompt = buildPrompt(agent?.prompt_template || "", { text: `${item.title} - ${item.summary}` });

      // Llamada al modelo Flash estabilizado (Gemini 2.0 Flash)
      const aiResponse = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.1);
      const judgment = parseAIJson<any>(aiResponse);

      if (judgment.authority_score < 3.0) continue;

      const embedding = await generateEmbedding(`${judgment.summary} ${item.title}`);

      await supabaseAdmin.from('pulse_staging').insert({
        content_hash: contentHash,
        title: item.title,
        summary: judgment.summary,
        url: item.url,
        source_name: item.source_name,
        content_type: judgment.category.toLowerCase(),
        authority_score: judgment.authority_score,
        veracity_verified: judgment.veracity,
        embedding: embedding,
        is_high_value: judgment.authority_score > 8.0,
        expires_at: judgment.authority_score > 8.0
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      });
      ingestedCount++;
    }

    return new Response(JSON.stringify({ success: true, ingested: ingestedCount, trace_id: correlationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error(`🔥 [Harvester-Fatal]:`, err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(handler);