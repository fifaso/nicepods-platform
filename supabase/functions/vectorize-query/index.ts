// supabase/functions/vectorize-query/index.ts
// VERSIÓN: 1.0 (Query Vectorizer)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const EMBEDDING_MODEL = "models/text-embedding-004";
const API_VERSION = "v1beta";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Query vacía");

    // Llamada rápida a Google para obtener el vector
    const response = await fetch(`https://generativelanguage.googleapis.com/${API_VERSION}/${EMBEDDING_MODEL}:embedContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: { parts: [{ text: query }] },
            taskType: "RETRIEVAL_QUERY", // Optimizado para preguntas
        }),
    });

    if (!response.ok) throw new Error("Fallo en vectorización");
    
    const result = await response.json();
    const embedding = result.embedding?.values;

    return new Response(JSON.stringify({ embedding }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});