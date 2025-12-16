// supabase/functions/generate-embedding/index.ts
// VERSIÓN: 2.0 (Standardized Guard + Google Embedding-004)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { guard } from "../_shared/guard.ts"; 
import { corsHeaders } from "../_shared/cors.ts";

// Configuración
const EMBEDDING_MODEL = "models/text-embedding-004";
const API_VERSION = "v1beta";

const PayloadSchema = z.object({
  podcast_id: z.number(),
});

// --- LÓGICA DE NEGOCIO (HANDLER) ---
const handler = async (request: Request): Promise<Response> => {
  
  // 1. VALIDACIÓN ENTORNO
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GOOGLE_API_KEY) {
    throw new Error("FATAL: Faltan variables de entorno críticas.");
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 2. PARSEO INPUT
    const { podcast_id } = PayloadSchema.parse(await request.json());
    console.log(`[Embedding] Procesando Podcast ID: ${podcast_id}`);

    // 3. OBTENER DATOS (Texto Plano)
    const { data: podcast, error: fetchError } = await supabaseAdmin
        .from('micro_pods')
        .select('script_text')
        .eq('id', podcast_id)
        .single();

    if (fetchError || !podcast) throw new Error(`Podcast no encontrado: ${fetchError?.message}`);

    // Extracción inteligente de texto plano
    let textToEmbed = "";
    if (typeof podcast.script_text === 'string') {
        try {
            const parsed = JSON.parse(podcast.script_text);
            // Prioridad: script_plain > script_body > raw
            textToEmbed = parsed.script_plain || parsed.script_body || "";
        } catch {
            textToEmbed = podcast.script_text;
        }
    } else if (typeof podcast.script_text === 'object') {
        textToEmbed = (podcast.script_text as any).script_plain || (podcast.script_text as any).script_body || "";
    }

    // Limpieza final de HTML por seguridad
    textToEmbed = textToEmbed.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    if (textToEmbed.length < 50) {
        console.warn("Texto demasiado corto para vectorizar. Saltando.");
        return new Response(JSON.stringify({ skipped: true, reason: "too_short" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Truncate seguro (8k chars aprox)
    const safeText = textToEmbed.substring(0, 8000);

    // 4. GENERAR EMBEDDING (GOOGLE AI)
    const apiUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/${EMBEDDING_MODEL}:embedContent?key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(apiUrl, {
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

    // 5. GUARDAR VECTOR (Upsert lógico: borrar viejo, insertar nuevo)
    await supabaseAdmin.from('podcast_embeddings').delete().eq('podcast_id', podcast_id);

    const { error: insertError } = await supabaseAdmin
        .from('podcast_embeddings')
        .insert({
            podcast_id: podcast_id,
            content: safeText, // Guardamos el texto base para referencia
            embedding: embeddingValues
        });

    if (insertError) throw new Error(`Error guardando vector: ${insertError.message}`);

    console.log(`[Embedding] Éxito. Vector dimensión ${embeddingValues.length} guardado.`);

    return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    // Relanzar para que Guard reporte a Sentry
    throw error;
  }
};

serve(guard(handler));