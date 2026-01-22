// supabase/functions/pulse-harvester/index.ts
// VERSIÓN: 1.0 (Master Harvester - Multi-Source Authority Engine)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

// Importaciones de núcleo NicePod
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateContentHash } from "../_shared/vault-utils.ts";

const parser = new XMLParser({ ignoreAttributes: false });
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// --- CONFIGURACIÓN DE FUENTES ---
const SOURCES = {
  ARXIV: "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=5",
  HACKER_NEWS: "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=5",
  OPEN_ALEX: "https://api.openalex.org/works?filter=default_host_group.id:https://openalex.org/S4306400030&sort=publication_date:desc&per_page=5", // Filtro de IA/Tech
  RSS_AUTHORITY: "https://feeds.feedburner.com/hbr" // Ejemplo: Harvard Business Review
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * 1. CAPA DE NORMALIZACIÓN: Convierte XML/JSON dispar a un esquema NicePod único.
 */
async function harvestFromSources() {
  const allResults = [];

  // A. Ingesta de arXiv (XML)
  try {
    const res = await fetch(SOURCES.ARXIV);
    const xml = await res.text();
    const data = parser.parse(xml);
    const entries = data.feed.entry || [];
    entries.forEach((e: any) => allResults.push({
      title: e.title, summary: e.summary, url: e.id, source_name: "arXiv", content_type: "paper"
    }));
  } catch (e) { console.error("arXiv Fail:", e); }

  await delay(3000); // Retardo de cortesía para arXiv

  // B. Ingesta de OpenAlex (JSON + Polite Pool)
  try {
    const res = await fetch(SOURCES.OPEN_ALEX, {
      headers: { "User-Agent": `NicePod-Pulse/1.0 (mailto:${Deno.env.get("ADMIN_EMAIL")})` }
    });
    const data = await res.json();
    data.results.forEach((w: any) => allResults.push({
      title: w.title, summary: w.abstract_inverted_index ? "Technical Paper Abstract" : w.display_name,
      url: w.doi || w.id, source_name: "OpenAlex", content_type: "paper"
    }));
  } catch (e) { console.error("OpenAlex Fail:", e); }

  // C. Ingesta de HackerNews (JSON)
  try {
    const res = await fetch(SOURCES.HACKER_NEWS);
    const data = await res.json();
    data.hits.forEach((h: any) => allResults.push({
      title: h.title, summary: h.story_text || h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      source_name: "HackerNews", content_type: "trend"
    }));
  } catch (e) { console.error("HN Fail:", e); }

  return allResults;
}

/**
 * 2. CAPA DE JUICIO (IA): Evalúa autoridad y verifica veracidad.
 */
async function judgeContent(item: any) {
  const { data: agent } = await supabaseAdmin
    .from('ai_prompts')
    .select('prompt_template')
    .eq('agent_name', 'pulse-judge-v1')
    .single();

  const prompt = buildPrompt(agent?.prompt_template || "Evaluate authority and summarize: {{text}}", {
    text: `${item.title} - ${item.summary}`
  });

  const aiResponse = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.1);
  return parseAIJson<{ authority_score: number; summary: string; category: string; veracity: boolean }>(aiResponse);
}

/**
 * 3. HANDLER PRINCIPAL (Punto de entrada CRON)
 */
const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();
  console.log(`[Pulse-Harvester][${correlationId}] Iniciando recolección global...`);

  try {
    const rawItems = await harvestFromSources();
    let ingestedCount = 0;

    for (const item of rawItems) {
      // A. Muro de Hash (FinOps)
      const contentHash = await generateContentHash(`${item.title}${item.url}`);

      const { data: exists } = await supabaseAdmin
        .from('pulse_staging')
        .select('id')
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (exists) continue; // Saltamos si ya lo conocemos

      // B. Juicio de Autoridad
      console.log(`🧠 Juzgando: ${item.title.substring(0, 30)}...`);
      const judgment = await judgeContent(item);

      if (judgment.authority_score < 3.0) continue; // Descartamos ruido irrelevante

      // C. Generación de ADN Semántico (Vectores)
      const embedding = await generateEmbedding(`${judgment.summary} ${item.title}`);

      // D. Persistencia en el Búfer
      const { error: insertErr } = await supabaseAdmin
        .from('pulse_staging')
        .insert({
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
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
            : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()    // 48 horas
        });

      if (!insertErr) ingestedCount++;
    }

    return new Response(JSON.stringify({
      success: true,
      ingested: ingestedCount,
      trace_id: correlationId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error(`🔥 [Harvester-Fatal]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

serve(handler);