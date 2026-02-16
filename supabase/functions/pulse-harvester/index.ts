// supabase/functions/pulse-harvester/index.ts
// VERSIÓN: 3.4 (Seed Bank Harvester - Infinite Retention Edition)
// Misión: Cosechar papers y alojarlos permanentemente con contador de uso inicializado.
// [OPTIMIZACIÓN]: Eliminación de TTL (expires_at) para preservar el capital intelectual.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const parser = new XMLParser({ ignoreAttributes: false });
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const NICEPOD_TAXONOMY = [
  { name: "Artificial Intelligence", query: "cat:cs.AI+OR+cat:cs.LG" },
  { name: "Urbanism & Madrid", query: "all:smart+cities+OR+all:urban+planning" },
  { name: "Cognitive Psychology", query: "all:neuroscience+OR+all:decision+making" },
  { name: "Systems Theory", query: "all:systems+thinking+OR+all:complexity" },
  { name: "Digital Society", query: "cat:cs.CY+OR+all:digital+ethics" }
];

async function generateSecureHash(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fetchFromArxiv(category: typeof NICEPOD_TAXONOMY[0]) {
  const allResults: any[] = [];
  try {
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${category.query}&sortBy=relevance&sortOrder=descending&max_results=15`;
    const res = await fetch(arxivUrl);
    if (res.ok) {
      const xml = await res.text();
      const data = parser.parse(xml);
      const items = Array.isArray(data.feed?.entry) ? data.feed.entry : (data.feed?.entry ? [data.feed.entry] : []);
      items.forEach((e: any) => {
        if (e.title && e.summary) {
          allResults.push({
            title: e.title.replace(/\n/g, " ").trim(),
            summary: e.summary.replace(/\n/g, " ").trim(),
            url: e.id?.replace('/abs/', '/pdf/'),
            source: "arXiv",
            authority: 8.5
          });
        }
      });
    }
  } catch (error) { console.error("⚠️ [Harvester] arXiv Fail:", error.message); }
  return allResults;
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();
  const selectedCategory = NICEPOD_TAXONOMY[Math.floor(Math.random() * NICEPOD_TAXONOMY.length)];

  console.log(`📡 [Harvester][${correlationId}] Cosecha permanente: ${selectedCategory.name}`);

  try {
    const rawItems = await fetchFromArxiv(selectedCategory);
    let ingestedCount = 0;

    for (const item of rawItems) {
      const contentHash = await generateSecureHash(item.title + item.url);
      const { data: exists } = await supabaseAdmin.from('pulse_staging').select('id').eq('content_hash', contentHash).maybeSingle();
      if (exists) continue;

      const embedding = await generateEmbedding(`${item.title} ${item.summary}`);

      const { error: insertErr } = await supabaseAdmin.from('pulse_staging').insert({
        content_hash: contentHash,
        title: item.title,
        summary: item.summary.substring(0, 2000),
        url: item.url,
        source_name: item.source,
        content_type: 'paper',
        authority_score: item.authority,
        veracity_verified: true,
        embedding: embedding,
        is_high_value: true,
        usage_count: 0, // Inicializamos el contador de uso
        expires_at: null // ELIMINAMOS EL TTL: Permanencia absoluta
      });

      if (!insertErr) ingestedCount++;
    }

    return new Response(JSON.stringify({ success: true, ingested: ingestedCount, trace_id: correlationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
};

serve(handler);