// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 2.9 (FinOps Collector - AI Token Saver Edition)
// Misión: Recolectar fuentes priorizando el Vault y eliminando el uso de Gemini en esta fase.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let draftId: string | null = null;

    try {
        const payload = await request.json();
        const { draft_id, topic } = payload;
        draftId = draft_id;

        console.log(`📡 [Collector][${correlationId}] Iniciando búsqueda para: ${topic}`);

        // 1. GENERAR VECTOR (Única llamada a AI, necesaria para semántica)
        const queryVector = await generateEmbedding(topic);

        // 2. BUSCAR EN BÓVEDA (NKV)
        const { data: vaultSources } = await supabaseAdmin.rpc('search_knowledge_vault', {
            query_embedding: queryVector,
            match_threshold: 0.82, // Umbral de alta confianza
            match_count: 5
        });

        let finalSources = (vaultSources || []).map((v: any) => ({
            t: v.title,
            c: v.content.substring(0, 2000),
            o: 'vault',
            s: v.similarity
        }));

        // 3. ESTRATEGIA FALLBACK (Solo llamamos a la Web si el Vault es insuficiente)
        if (finalSources.length < 2) {
            console.log(`🌐 [Collector] Vault insuficiente. Invocando Tavily...`);
            const webRes = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: Deno.env.get("TAVILY_API_KEY"),
                    query: topic,
                    max_results: 4
                })
            });

            if (webRes.ok) {
                const webData = await webRes.json();
                const webSources = (webData.results || []).map((w: any) => ({
                    t: w.title,
                    c: w.content.substring(0, 2000),
                    o: 'web',
                    s: w.score
                }));
                finalSources = [...finalSources, ...webSources];
            }
        }

        // 4. ACTUALIZACIÓN DIRECTA (Sin pasar por Gemini)
        // Guardamos las fuentes y marcamos como 'writing' para el siguiente paso.
        // Inyectamos un dossier_text vacío pero válido para no romper el contrato.
        const { error: updateErr } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                sources: finalSources,
                dossier_text: { status: "sources_collected", count: finalSources.length },
                status: 'writing',
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateErr) throw updateErr;

        // 5. HANDOVER INMEDIATO
        // Ahora es la función de REDACCIÓN la que leerá las fuentes crudas.
        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id },
            headers: { "x-correlation-id": correlationId }
        }).catch(() => { });

        return new Response(JSON.stringify({ success: true, sources_found: finalSources.length }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(`🔥 [Collector-Fatal]:`, e.message);
        if (draftId) await supabaseAdmin.from('podcast_drafts').update({ status: 'failed' }).eq('id', draftId);
        return new Response(e.message, { status: 500, headers: corsHeaders });
    }
});