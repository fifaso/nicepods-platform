// supabase/functions/generate-embedding/index.ts
// VERSIÓN: 3.0 (Políglota: Soporta JSON Moderno, Texto Plano y Arrays Legacy)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { guard } from "../_shared/guard.ts"; 
import { corsHeaders } from "../_shared/cors.ts";

const EMBEDDING_MODEL = "models/text-embedding-004";
const API_VERSION = "v1beta";

const PayloadSchema = z.object({
  podcast_id: z.number(),
});

// --- HELPER DE EXTRACCIÓN ROBUSTA ---
function extractTextContent(input: any): string {
    if (!input) return "";

    // CASO 1: String puro
    if (typeof input === 'string') {
        // Intentar parsear por si es un JSON stringificado
        try {
            const parsed = JSON.parse(input);
            return extractTextContent(parsed); // Recursión
        } catch {
            return input; // Es texto plano real
        }
    }

    // CASO 2: Array Legacy ([{speaker: "...", line: "..."}])
    if (Array.isArray(input)) {
        return input
            .map((item: any) => {
                if (typeof item === 'string') return item;
                // Formato diálogo: "Speaker: Linea"
                const speaker = item.speaker ? `${item.speaker}: ` : "";
                const line = item.line || item.text || "";
                return `${speaker}${line}`;
            })
            .join("\n\n");
    }

    // CASO 3: Objeto Moderno ({ script_body: "...", script_plain: "..." })
    if (typeof input === 'object') {
        // Prioridad: Texto limpio > HTML > Texto crudo
        return input.script_plain || input.script_body || input.text || "";
    }

    return "";
}

// --- HANDLER ---
const handler = async (request: Request): Promise<Response> => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GOOGLE_API_KEY) {
    throw new Error("FATAL: Faltan variables de entorno críticas.");
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { podcast_id } = PayloadSchema.parse(await request.json());
    console.log(`[Embedding] Procesando Podcast ID: ${podcast_id}`);

    // 1. OBTENER DATOS
    const { data: podcast, error: fetchError } = await supabaseAdmin
        .from('micro_pods')
        .select('script_text')
        .eq('id', podcast_id)
        .single();

    if (fetchError || !podcast) throw new Error(`Podcast no encontrado: ${fetchError?.message}`);

    // 2. EXTRACCIÓN INTELIGENTE
    let textToEmbed = extractTextContent(podcast.script_text);
    
    // Limpieza final de HTML
    textToEmbed = textToEmbed.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    console.log(`[Debug] Texto extraído (${textToEmbed.length} chars): ${textToEmbed.substring(0, 50)}...`);

    if (textToEmbed.length < 50) {
        console.warn("⚠️ Texto insuficiente tras limpieza. Saltando.");
        // Devolvemos éxito falso pero controlado para que el backfill no se detenga
        return new Response(JSON.stringify({ skipped: true, reason: "too_short" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const safeText = textToEmbed.substring(0, 8000);

    // 3. GENERAR VECTOR
    const response = await fetch(`https://generativelanguage.googleapis.com/${API_VERSION}/${EMBEDDING_MODEL}:embedContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: { parts: [{ text: safeText }] },
            taskType: "RETRIEVAL_DOCUMENT",
        }),
    });

    if (!response.ok) {
        const errTxt = await response.text();
        throw new Error(`Google Embedding Error: ${errTxt}`);
    }

    const result = await response.json();
    const embeddingValues = result.embedding?.values;

    if (!embeddingValues) throw new Error("Google no devolvió valores vectoriales.");

    // 4. GUARDAR
    await supabaseAdmin.from('podcast_embeddings').delete().eq('podcast_id', podcast_id);

    const { error: insertError } = await supabaseAdmin
        .from('podcast_embeddings')
        .insert({
            podcast_id: podcast_id,
            content: safeText, 
            embedding: embeddingValues
        });

    if (insertError) throw new Error(`Error guardando: ${insertError.message}`);

    return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    throw error;
  }
};

serve(guard(handler));