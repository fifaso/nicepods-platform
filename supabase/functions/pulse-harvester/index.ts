// supabase/functions/pulse-harvester/index.ts
// VERSIÓN: 2.3 (Unicode-Safe Harvester - SHA-256 Integrity)
// Misión: Cosechar y vectorizar conocimiento académico sin errores de codificación Latin1.
// [RESOLUCIÓN]: Sustitución de btoa() por Web Crypto API para manejar caracteres Unicode.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

// Importaciones del núcleo NicePod sincronizado (v11.4)
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const parser = new XMLParser({ ignoreAttributes: false });
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/**
 * generateSecureHash: Genera un identificador SHA-256 único y seguro para Unicode.
 */
async function generateSecureHash(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const SOURCES = {
  ARXIV: "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=5",
  HACKER_NEWS: "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=5",
  OPEN_ALEX: "https://api.openalex.org/works?filter=default_host_group.id:https://openalex.org/S4306400030&sort=publication_date:desc&per_page=5"
};

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
          allResults.push({ title: e.title, summary: e.summary, url: e.id, source: "arXiv", score: 8.5 });
        }
      });
    }
  } catch (e) { console.error("arXiv Fail:", e.message); }

  // 2. OpenAlex
  try {
    const res = await fetch(SOURCES.OPEN_ALEX, { headers: { "User-Agent": "NicePod-Pulse/2.3" } });
    if (res.ok) {
      const data = await res.json();
      data.results?.forEach((w: any) => {
        allResults.push({ title: w.display_name, summary: "Academic research documentation.", url: w.doi || w.id, source: "OpenAlex", score: 8.0 });
      });
    }
  } catch (e) { console.error("OpenAlex Fail:", e.message); }

  // 3. HackerNews
  try {
    const res = await fetch(SOURCES.HACKER_NEWS);
    if (res.ok) {
      const data = await res.json();
      data.hits?.forEach((h: any) => {
        allResults.push({ title: h.title, summary: h.story_text || h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, source: "HackerNews", score: 6.0 });
      });
    }
  } catch (e) { console.error("HackerNews Fail:", e.message); }

  return allResults;
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();
  console.log(`📡 [Harvester][${correlationId}] Iniciando cosecha Unicode-Safe...`);

  try {
    const rawItems = await harvestFromSources();
    let ingestedCount = 0;

    for (const item of rawItems) {
      // Usamos el nuevo hash SHA-256 para soportar caracteres especiales en títulos
      const contentHash = await generateSecureHash(item.title + item.url);

      const { data: exists } = await supabaseAdmin
        .from('pulse_staging')
        .select('id')
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (exists) continue;

      // Vectorización directa a 768d con gemini-embedding-001
      const embedding = await generateEmbedding(`${item.title} ${item.summary}`);

      const { error: insertErr } = await supabaseAdmin.from('pulse_staging').insert({
        content_hash: contentHash,
        title: item.title,
        summary: item.summary.substring(0, 1500),
        url: item.url,
        source_name: item.source,
        content_type: item.score > 7 ? 'paper' : 'trend',
        authority_score: item.score,
        veracity_verified: true,
        embedding: embedding,
        is_high_value: item.score > 8.0,
        expires_at: new Date(Date.now() + (item.score > 8.0 ? 168 : 48) * 60 * 60 * 1000).toISOString()
      });

      if (!insertErr) ingestedCount++;
    }

    return new Response(JSON.stringify({ success: true, ingested: ingestedCount, trace_id: correlationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Harvester-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
};

serve(handler);