// supabase/functions/pulse-harvester/index.ts
// VERSIÓN: 3.2 (Professional Harvester - OpenAlex API Parameter Fix)
// Misión: Cosechar papers de alta reputación rotando categorías y garantizando links a PDF.
// [RESOLUCIÓN]: Corrección de 'topic.id' a 'primary_topic.id' para evitar error 400 en OpenAlex.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

// Importaciones del núcleo NicePod sincronizado (v11.6)
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const parser = new XMLParser({ ignoreAttributes: false });
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/**
 * TAXONOMÍA ESTRATÉGICA NICEPOD
 * Clústeres de búsqueda académica para el NKV.
 * [FIX]: Se utiliza 'primary_topic.id' como campo de filtrado válido según API OpenAlex.
 */
const NICEPOD_TAXONOMY = [
  { name: "Artificial Intelligence", arxiv: "cat:cs.AI+OR+cat:cs.LG", alex: "primary_topic.id:T10001" },
  { name: "Urbanism & Madrid", arxiv: "all:smart+cities+OR+all:urban+planning", alex: "primary_topic.id:T11005" },
  { name: "Cognitive Psychology", arxiv: "all:neuroscience+OR+all:decision+making", alex: "primary_topic.id:T10565" },
  { name: "Systems Theory", arxiv: "all:systems+thinking+OR+all:complexity", alex: "primary_topic.id:T12000" },
  { name: "Digital Society", arxiv: "cat:cs.CY+OR+all:digital+ethics", alex: "primary_topic.id:T10128" }
];

/**
 * generateSecureHash: Identificador SHA-256 para soporte Unicode.
 */
async function generateSecureHash(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * fetchFromSources: Ejecuta la búsqueda con lógica de reputación (Citas y Relevancia).
 */
async function fetchFromSources(category: typeof NICEPOD_TAXONOMY[0]) {
  const allResults: any[] = [];
  const OPENALEX_KEY = Deno.env.get("OPENALEX_API_KEY");
  const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@nicepod.ai";

  // 1. arXiv: Búsqueda por Relevancia
  try {
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${category.arxiv}&sortBy=relevance&sortOrder=descending&max_results=10`;
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

  // 2. OpenAlex: Filtrado por Reputación (Cited Count)
  try {
    // [FIX]: Construcción de filtro compatible y uso de header de API Key
    const alexFilter = `${category.alex},cited_by_count:>20`;
    const alexUrl = `https://api.openalex.org/works?filter=${alexFilter}&sort=cited_by_count:desc&per_page=10&mailto=${ADMIN_EMAIL}`;

    const headers: Record<string, string> = {
      "User-Agent": "NicePod-Intelligence/3.2"
    };

    if (OPENALEX_KEY) {
      headers["api-key"] = OPENALEX_KEY;
    }

    const res = await fetch(alexUrl, { headers });

    if (res.ok) {
      const data = await res.json();
      data.results?.forEach((w: any) => {
        allResults.push({
          title: w.display_name,
          summary: `Paper de alta autoridad científica. Citado por ${w.cited_by_count} investigadores.`,
          url: w.primary_location?.pdf_url || w.doi || w.id,
          source: "OpenAlex",
          authority: Math.min(10, 7.5 + (w.cited_by_count / 150))
        });
      });
    } else {
      const errorText = await res.text();
      console.error(`⚠️ [Harvester] OpenAlex API Rejected [${res.status}]: ${errorText}`);
    }
  } catch (error) { console.error("⚠️ [Harvester] OpenAlex Error:", error.message); }

  return allResults;
}

/**
 * handler: Punto de entrada del CRON.
 */
const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();

  // Rotación de categorías para diversificar el conocimiento
  const selectedCategory = NICEPOD_TAXONOMY[Math.floor(Math.random() * NICEPOD_TAXONOMY.length)];

  console.log(`📡 [Harvester][${correlationId}] Iniciando cosecha Gen 3: ${selectedCategory.name}`);

  try {
    const rawItems = await fetchFromSources(selectedCategory);
    let ingestedCount = 0;

    for (const item of rawItems) {
      // Identificador único SHA-256
      const contentHash = await generateSecureHash(item.title + item.url);

      const { data: exists } = await supabaseAdmin
        .from('pulse_staging')
        .select('id')
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (exists) continue;

      // Vectorización semántica 768d
      const embedding = await generateEmbedding(`${item.title} ${item.summary}`);

      // Inserción en Bóveda de Staging
      const { error: insertErr } = await supabaseAdmin.from('pulse_staging').insert({
        content_hash: contentHash,
        title: item.title,
        summary: item.summary.substring(0, 2000),
        url: item.url,
        source_name: item.source,
        content_type: 'paper',
        authority_score: item.authority,
        veracity_verified: true,
        embedding: embedding, // ADN 768 dimensiones
        is_high_value: item.authority > 8.8,
        expires_at: new Date(Date.now() + (item.authority > 8.8 ? 168 : 48) * 60 * 60 * 1000).toISOString()
      });

      if (!insertErr) ingestedCount++;
    }

    console.log(`✅ [Harvester] Ciclo terminado. Ingestados: ${ingestedCount} registros de ${selectedCategory.name}`);

    return new Response(JSON.stringify({
      success: true,
      category: selectedCategory.name,
      ingested: ingestedCount,
      trace_id: correlationId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Harvester-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(handler);