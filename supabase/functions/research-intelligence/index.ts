// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 2.6 (Depth-Aware & Early Persistence - Gemini 3.0 Flash)
// Misión: Investigar con límites inteligentes basados en profundidad y persistir datos preventivamente.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const handler = async (req: Request): Promise<Response> => {
    const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let currentDraftId: string | null = null;

    try {
        const payload = await request.json();
        const { draft_id, topic, is_pulse, pulse_source_ids } = payload;
        currentDraftId = draft_id;

        // 1. RESOLUCIÓN DE PROFUNDIDAD Y LÍMITES
        // Recuperamos la profundidad desde el registro para aplicar la política de cuotas de texto
        const { data: draftInitial } = await supabaseAdmin
            .from('podcast_drafts')
            .select('creation_data')
            .eq('id', draft_id)
            .single();

        const depth = draftInitial?.creation_data?.narrativeDepth || "Intermedia";

        // Mapeo táctico de límites para salvar CPU
        const limits = {
            "Superficial": { vault: 2, web: 1, chars: 1000 },
            "Intermedia": { vault: 3, web: 2, chars: 1500 },
            "Profunda": { vault: 5, web: 3, chars: 2000 }
        }[depth as "Superficial" | "Intermedia" | "Profunda"] || { vault: 3, web: 2, chars: 1500 };

        console.log(`🧠 [Intelligence][${correlationId}] Profundidad: ${depth}. Límites: ${limits.vault}V / ${limits.web}W`);

        let allSources = [];

        // 2. CAPTURA DE FUENTES
        if (is_pulse && pulse_source_ids?.length > 0) {
            const { data } = await supabaseAdmin.from('pulse_staging').select('title, summary, url').in('id', pulse_source_ids);
            allSources = (data || []).map(p => ({ t: p.title, c: p.summary.substring(0, limits.chars), u: p.url, o: 'web' }));
        } else {
            const queryVector = await generateEmbedding(topic);
            const [vaultRes, webRes] = await Promise.allSettled([
                supabaseAdmin.rpc('search_knowledge_vault', {
                    query_embedding: queryVector,
                    match_threshold: 0.75,
                    match_count: limits.vault
                }),
                fetch("https://api.tavily.com/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        api_key: Deno.env.get("TAVILY_API_KEY"),
                        query: topic,
                        max_results: limits.web
                    })
                })
            ]);

            const vaultData = vaultRes.status === 'fulfilled' ? vaultRes.value.data || [] : [];
            let webData = [];
            if (webRes.status === 'fulfilled' && webRes.value.ok) webData = (await webRes.value.json()).results || [];

            allSources = [
                ...vaultData.map((v: any) => ({ t: v.title, c: v.content.substring(0, limits.chars), u: v.url || "#", o: 'vault' })),
                ...webData.map((w: any) => ({ t: w.title, c: w.content.substring(0, limits.chars), u: w.url, o: 'web' }))
            ];
        }

        // [CHECKPOINT]: Guardamos las fuentes ANTES de la llamada pesada de IA.
        // Esto asegura que el borrador deje de estar vacío en la UI.
        await supabaseAdmin.from('podcast_drafts').update({ sources: allSources }).eq('id', draft_id);

        // 3. SÍNTESIS DEL DOSSIER (Gemini 3.0 Flash)
        const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'research-intelligence-v1').single();

        // buildPrompt V10.5 usará Regex, consumiendo mínimo CPU
        const dossierPrompt = buildPrompt(agent!.prompt_template, {
            topic,
            raw_sources: JSON.stringify(allSources.map(s => ({ title: s.t, content: s.c })))
        });

        const dossierRaw = await callGeminiMultimodal(dossierPrompt, undefined, AI_MODELS.FLASH, 0.1);
        const dossier = parseAIJson(dossierRaw);

        // 4. PERSISTENCIA FINAL Y HANDOVER
        await supabaseAdmin.from('podcast_drafts').update({
            dossier_text: dossier,
            status: 'writing',
            updated_at: new Date().toISOString()
        }).eq('id', draft_id);

        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id },
            headers: { "x-correlation-id": correlationId }
        }).catch(() => { });

        return new Response(JSON.stringify({ success: true, trace_id: correlationId }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(`🔥 [Intelligence-Fatal][${correlationId}]:`, e.message);
        if (currentDraftId) await supabaseAdmin.from('podcast_drafts').update({ status: 'failed' }).eq('id', currentDraftId);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
};

serve(guard(handler));