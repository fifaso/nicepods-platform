// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 9.0 (Architecture: Tavily Integration for Validated Grounding)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

// --- MODELOS ---
// Usamos Gemini 1.5 Pro para la escritura final por su capacidad de contexto y JSON.
const WRITER_MODEL = "gemini-2.5-pro"; 
const API_VERSION = "v1beta";

// --- UTILIDADES DE BÚSQUEDA (TAVILY) ---

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  answer: string; // El resumen generado por Tavily
  results: TavilyResult[]; // Las fuentes validadas
}

async function searchWithTavily(query: string, maxResults: number = 5): Promise<TavilyResponse> {
  console.log(`[Tavily] Buscando: "${query}"...`);
  
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: query,
      search_depth: "advanced", // Búsqueda profunda para mejor calidad
      include_answer: true,     // Tavily genera un resumen (tesis) por nosotros
      max_results: maxResults,
      include_images: false,
      include_raw_content: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// --- UTILIDADES DE TEXTO ---

function cleanAndExtractJson(text: string): string {
  let clean = text;
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = text.substring(firstBrace, lastBrace + 1);
  }
  clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, (c) => {
      return ["\b", "\f", "\n", "\r", "\t"].includes(c) ? c : ""; 
  });
  return clean.trim();
}

function buildSearchQuery(purpose: string, inputs: any): string {
  // Construimos una query optimizada para motor de búsqueda, no para chat
  switch (purpose) {
    case 'explore': return `Relación y conexión entre ${inputs.topicA} y ${inputs.topicB}`;
    case 'inspire': return `Historia inspiradora real sobre ${inputs.archetype_topic} ${inputs.archetype_goal}`;
    case 'reflect': return `Análisis filosófico y psicológico de ${inputs.legacy_lesson}`;
    case 'answer': return `${inputs.question} explicación detallada y científica`;
    default: return `${inputs.solo_topic || inputs.topic} análisis profundo y hechos clave`;
  }
}

// --- LLAMADA A GEMINI (Solo Escritura) ---
async function callGeminiWriter(prompt: string) {
  const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
  ];

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/${API_VERSION}/models/${WRITER_MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: safetySettings,
        generationConfig: { 
          temperature: 0.7,
          responseMimeType: "application/json" // Forzamos JSON porque no usamos Tools aquí
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google AI Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    const rawOutput = candidate.content?.parts?.[0]?.text;

    if (!rawOutput) throw new Error("Texto vacío de Gemini.");

    // Parseo directo
    return JSON.parse(cleanAndExtractJson(rawOutput));

  } catch (e) {
    console.error(`[AI Writer] Error:`, e);
    throw e;
  }
}

// --- MAIN HANDLER ---

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta autorización.");
    
    const supabaseUserClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    if (authError || !user) throw new Error("Usuario no autenticado.");

    // Inputs
    const { purpose, style, duration, depth, tone, raw_inputs } = await request.json();
    const writerAgentName = 'script-architect-v1'; 

    // Recuperar Prompt del Escritor
    const { data: promptsData } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', writerAgentName)
      .single();

    if (!promptsData?.prompt_template) throw new Error("Prompt de arquitecto no encontrado.");

    // --- FASE 1: INVESTIGACIÓN REAL (Tavily) ---
    const searchQuery = buildSearchQuery(purpose, raw_inputs);
    let dossierData;
    let usedSources: any[] = [];

    try {
        // Buscamos en la web real
        const tavilyResponse = await searchWithTavily(searchQuery);
        
        // Mapeamos la respuesta de Tavily a nuestro formato de "Dossier"
        dossierData = {
            main_thesis: tavilyResponse.answer || `Investigación sobre ${searchQuery}`,
            // Usamos los snippets de los resultados como "Key Facts"
            key_facts: tavilyResponse.results.map(r => r.content.substring(0, 300)), 
            sources: tavilyResponse.results.map(r => ({
                title: r.title,
                url: r.url,
                snippet: r.content.substring(0, 150) + "..."
            }))
        };
        usedSources = dossierData.sources;

    } catch (e) {
        console.warn("⚠️ Fallo Tavily, usando conocimiento interno:", e.message);
        // Fallback: Si Tavily falla (créditos, error), usamos datos básicos
        dossierData = {
            main_thesis: searchQuery,
            key_facts: ["Investigación web no disponible. Generado con conocimiento base."],
            sources: []
        };
    }

    // --- FASE 2: REDACCIÓN (Gemini Pro) ---
    console.log("2. Redacción con datos verificados...");

    const userSelectedTone = tone || style || "Neutro";
    
    // Inyectamos el Dossier Real en el prompt
    let writerFinalPrompt = promptsData.prompt_template
        .replace('{{dossier_json}}', JSON.stringify(dossierData))
        .replace('{{topic}}', searchQuery)
        .replace('{{motivation}}', "Basado en fuentes verificadas.")
        .replace('{{context}}', "Podcast educativo.") 
        .replace('{{duration}}', duration)
        .replace('{{depth}}', depth)
        .replace('{{style}}', userSelectedTone)
        .replace('{{archetype}}', raw_inputs.archetype || 'Ninguno');

    const scriptJson = await callGeminiWriter(writerFinalPrompt);

    // Construcción del objeto final
    const finalDraft = {
        suggested_title: scriptJson.title || scriptJson.suggested_title || "Nuevo Podcast",
        script_body: scriptJson.script_body || scriptJson.script || scriptJson.text,
        sources: usedSources // Pasamos las fuentes REALES validadas por Tavily
    };

    if (!finalDraft.script_body) throw new Error("Guion vacío.");

    return new Response(JSON.stringify({ success: true, draft: finalDraft }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Pipeline Fatal Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});