// supabase/functions/admin-backfill-embeddings/index.ts
// VERSIÓN: 1.0 (Retroactive Vectorizer)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { cleanTextForSpeech, generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

function extractScript(input: any): string {
  if (!input) return "";
  if (typeof input === 'object') return input.script_plain || input.script_body || "";
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    return parsed.script_plain || parsed.script_body || "";
  } catch { return String(input); }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // 1. Identificar Podcasts Huérfanos (Existen en micro_pods pero no en embeddings)
    const { data: orphans, error: fetchError } = await supabaseAdmin
      .from('micro_pods')
      .select('id, title, script_text')
      .eq('status', 'published') // Solo procesamos publicados para no gastar en borradores
      .not('script_text', 'is', null); // Deben tener guion

    if (fetchError) throw fetchError;

    // Filtramos manualmente los que ya tienen embedding (por si la query SQL falla en el anti-join)
    // Nota: Para grandes volúmenes, esto debería ser un anti-join SQL, pero para <1000 es seguro en memoria.
    const { data: existing } = await supabaseAdmin.from('podcast_embeddings').select('podcast_id');
    const existingIds = new Set(existing?.map(e => e.podcast_id));

    const targets = orphans?.filter(p => !existingIds.has(p.id)) || [];

    console.log(`🧠 [Backfill] Encontrados ${targets.length} podcasts sin vector.`);

    let processed = 0;
    const errors = [];

    // 2. Procesamiento por Lotes (Batch Processing)
    for (const pod of targets) {
      try {
        const plainText = extractScript(pod.script_text);
        const cleanText = cleanTextForSpeech(plainText);

        if (cleanText.length < 50) {
          console.warn(`⚠️ [Backfill] Pod #${pod.id} tiene guion vacío. Saltando.`);
          continue;
        }

        // Vectorización
        const embeddingContext = `${pod.title} ${cleanText}`.substring(0, 15000);
        const embeddingValues = await generateEmbedding(embeddingContext);

        // Persistencia
        const { error: insertError } = await supabaseAdmin
          .from('podcast_embeddings')
          .upsert({
            podcast_id: pod.id,
            content: cleanText.substring(0, 1000),
            embedding: embeddingValues
          });

        if (insertError) throw insertError;
        processed++;
        console.log(`✅ [Backfill] Pod #${pod.id} vectorizado (${processed}/${targets.length})`);

      } catch (err: any) {
        console.error(`🔥 [Backfill] Error en Pod #${pod.id}:`, err.message);
        errors.push({ id: pod.id, error: err.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed,
      total_targets: targets.length,
      errors
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});