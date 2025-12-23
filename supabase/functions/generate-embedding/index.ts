// supabase/functions/generate-embedding/index.ts
// VERSIÓN: 4.0 (Standard Compliant - Google Gecko-004 Optimized)

import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "supabase";
import { z } from "zod";
import { guard } from "guard";
import { corsHeaders } from "cors";
import { cleanTextForSpeech } from "ai-core";

const EMBEDDING_MODEL = "models/text-embedding-004";
const API_VERSION = "v1beta";

const PayloadSchema = z.object({
  podcast_id: z.number(),
  trace_id: z.string().optional()
});

/**
 * Interfaces para navegación segura de tipos sin usar 'any'
 */
interface AIScriptLine {
  speaker?: string;
  line?: string;
  text?: string;
}

interface ScriptMetadata {
  script_body?: string;
  script_plain?: string;
  text?: string;
}

/**
 * Extrae texto de forma recursiva y segura de múltiples formatos históricos.
 */
function extractTextContent(input: unknown): string {
    if (!input) return "";

    // Caso 1: String (puede ser JSON stringificado)
    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input);
            return extractTextContent(parsed);
        } catch {
            return input; 
        }
    }

    // Caso 2: Array Legacy (Diálogos)
    if (Array.isArray(input)) {
        return input
            .map((item: AIScriptLine) => {
                const prefix = item.speaker ? `${item.speaker}: ` : "";
                const content = item.line || item.text || "";
                return `${prefix}${content}`;
            })
            .join("\n\n");
    }

    // Caso 3: Objeto Moderno
    if (typeof input === 'object' && input !== null) {
        const obj = input as ScriptMetadata;
        return obj.script_plain || obj.script_body || obj.text || "";
    }

    return "";
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY") ?? "";

  const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = await request.json();
    const { podcast_id } = PayloadSchema.parse(body);

    console.log(`🧠 [${correlationId}] Generando Embedding para Podcast: ${podcast_id}`);

    // 1. OBTENER CONTENIDO
    const { data: podcast, error: fetchError } = await supabaseAdmin
        .from('micro_pods')
        .select('script_text')
        .eq('id', podcast_id)
        .single();

    if (fetchError || !podcast) throw new Error(`Podcast ${podcast_id} no encontrado.`);

    // 2. LIMPIEZA SEMÁNTICA
    // Usamos el helper centralizado para asegurar consistencia con el audio
    const rawText = extractTextContent(podcast.script_text);
    const cleanText = cleanTextForSpeech(rawText);

    if (cleanText.length < 50) {
        console.warn(`[${correlationId}] Texto demasiado corto para vectorizar. ID: ${podcast_id}`);
        return new Response(JSON.stringify({ success: true, skipped: true }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    // Google soporta hasta 2048 tokens, cortamos por seguridad de red
    const safeText = cleanText.substring(0, 10000);

    // 3. LLAMADA A GOOGLE AI (Gecko)
    const embeddingUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/${EMBEDDING_MODEL}:embedContent?key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(embeddingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: { parts: [{ text: safeText }] },
            taskType: "RETRIEVAL_DOCUMENT",
        }),
    });

    if (!response.ok) throw new Error(`Google AI Error: ${await response.text()}`);

    const result = await response.json();
    const embeddingValues = result.embedding?.values;

    if (!embeddingValues) throw new Error("La IA no devolvió el vector esperado.");

    // 4. PERSISTENCIA VECTORIAL (Atómica)
    // Borramos registros previos del mismo podcast para evitar duplicidad semántica
    await supabaseAdmin.from('podcast_embeddings').delete().eq('podcast_id', podcast_id);

    const { error: insertError } = await supabaseAdmin
        .from('podcast_embeddings')
        .insert({
            podcast_id: podcast_id,
            content: safeText, 
            embedding: embeddingValues
        });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, dimensions: embeddingValues.length }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido en el worker de embedding";
    console.error(`🔥 [${correlationId}] Error Vectorial:`, msg);
    
    return new Response(JSON.stringify({ success: false, error: msg }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
};

serve(guard(handler));