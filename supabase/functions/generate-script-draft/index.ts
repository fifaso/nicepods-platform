// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 9.0 (Fix: Model Names Correction & Enhanced Debugging)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

// --- CORRECCIÓN DE MODELOS ---
// "gemini-2.5" NO existe. Usamos las versiones estables actuales.
const WRITER_MODEL = "gemini-2.5-pro"; 
const RESEARCH_MODEL = "gemini-2.5-pro"; 

const API_VERSION = "v1beta";

// --- UTILIDADES ---

function calculateSourceLimits(durationStr: string, depthStr: string): { min: number, max: number } {
  const duration = (durationStr || "").toLowerCase().trim();
  const depth = (depthStr || "").toLowerCase().trim();
  if (duration.includes("3-5")) return depth.includes("profundo") ? { min: 4, max: 7 } : { min: 2, max: 4 };
  if (duration.includes("6-9")) return depth.includes("profundo") ? { min: 6, max: 10 } : { min: 3, max: 6 };
  if (duration.includes("10-14")) return depth.includes("profundo") ? { min: 10, max: 15 } : { min: 5, max: 10 };
  return { min: 3, max: 6 };
}

function cleanAndExtractJson(text: string): string {
  let clean = text;
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = text.substring(firstBrace, lastBrace + 1);
  }
  // Limpieza de caracteres de control peligrosos
  clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, (c) => {
      return ["\b", "\f", "\n", "\r", "\t"].includes(c) ? c : ""; 
  });
  return clean.trim();
}

function buildRawContext(purpose: string, inputs: any): string {
  switch (purpose) {
    case 'explore': return `Conectar "${inputs.topicA}" con "${inputs.topicB}". Catalizador: ${inputs.catalyst || 'Ninguno'}.`;
    case 'inspire': return `Arquetipo: ${inputs.archetype}. Tema: ${inputs.archetype_topic}. Meta: ${inputs.archetype_goal}.`;
    case 'reflect': return `Reflexión: ${inputs.legacy_lesson}.`;
    case 'answer': return `Pregunta: "${inputs.question}".`;
    default: return `Tema: ${inputs.solo_topic || inputs.topic}. Motivación: ${inputs.solo_motivation || inputs.motivation}.`;
  }
}

async function callGemini(model: string, prompt: string, tools: any[] = [], forceJson: boolean = false) {
  
  const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
  ];

  const requestBody: any = {
    contents: [{ parts: [{ text: prompt }] }],
    safetySettings: safetySettings,
    generationConfig: { temperature: 0.7 }
  };

  if (tools.length > 0) {
    requestBody.tools = tools;
  }

  // IMPORTANTE: Gemini falla con Error 400 si enviamos responseMimeType junto con Tools
  if (forceJson && tools.length === 0) {
    requestBody.generationConfig.responseMimeType = "application/json";
  }

  console.log(`[AI] Llamando a ${model}. JSON Mode: ${forceJson}. Tools: ${tools.length}`);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/${API_VERSION}/models/${model}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI API ERROR] ${model} respondió con ${response.status}: ${errorText}`);
      throw new Error(`Google AI Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    
    if (!candidate) throw new Error("Sin candidatos en respuesta.");
    
    const rawOutput = candidate.content?.parts?.[0]?.text;
    if (!rawOutput) throw new Error("Texto vacío.");

    if (forceJson) {
        const clean = cleanAndExtractJson(rawOutput);
        return JSON.parse(clean);
    } 
    
    try {
        const clean = cleanAndExtractJson(rawOutput);
        if (clean.startsWith('{') || clean.startsWith('[')) {
            return JSON.parse(clean);
        }
    } catch (e) { }

    return rawOutput;

  } catch (e) {
    console.error(`[AI] Excepción invocando ${model}:`, e);
    throw e;
  }
}

// --- MAIN ---

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
    const curatorAgentName = 'research-curator-v1';

    // Recuperar Prompts
    const { data: promptsData } = await supabaseAdmin
      .from('ai_prompts')
      .select('agent_name, prompt_template')
      .in('agent_name', [curatorAgentName, writerAgentName]);

    const curatorPromptTemplate = promptsData?.find(p => p.agent_name === curatorAgentName)?.prompt_template;
    const writerPromptTemplate = promptsData?.find(p => p.agent_name === writerAgentName)?.prompt_template;

    if (!curatorPromptTemplate || !writerPromptTemplate) throw new Error("Prompts no configurados en DB.");

    // --- FASE 1: EL CURADOR (Investigación) ---
    const normalizedRawText = buildRawContext(purpose, raw_inputs);
    const sourceLimits = calculateSourceLimits(duration, depth);
    
    console.log(`1. Investigación: "${normalizedRawText.substring(0, 30)}..."`);

    const curatorFinalPrompt = curatorPromptTemplate
        .replace('{{raw_input}}', normalizedRawText)
        .replace('{{purpose}}', purpose)
        .replace('{{topic}}', normalizedRawText) 
        .replace('{{goal}}', `Podcast ${style || 'Estándar'} de ${duration}`)
        .replace('{{context}}', `Profundidad: ${depth}`)
        .replace('{{min_sources}}', sourceLimits.min.toString())
        .replace('{{max_sources}}', sourceLimits.max.toString());

    let dossierJson;
    try {
        // [Fase Búsqueda]: Usamos RESEARCH_MODEL (1.5 Flash) + Tools
        dossierJson = await callGemini(RESEARCH_MODEL, curatorFinalPrompt, [{ google_search: {} }], false);
        
        if (typeof dossierJson === 'string') {
             dossierJson = JSON.parse(cleanAndExtractJson(dossierJson));
        }
    } catch (e) {
        console.warn("⚠️ Fallo Curador (Search), activando fallback:", e.message);
        // Fallback: Sin herramientas, forzando JSON
        dossierJson = await callGemini(RESEARCH_MODEL, curatorFinalPrompt + "\n\n(Investigación interna, sin web).", [], true);
    }

    if (!dossierJson || (!dossierJson.main_thesis && !dossierJson.key_facts)) {
        dossierJson = { main_thesis: normalizedRawText, key_facts: ["Datos no disponibles."], sources: [] };
    }

    // --- FASE 2: EL ARQUITECTO (Escritura) ---
    console.log("2. Redacción (Arquitecto)...");

    const dossierString = JSON.stringify(dossierJson);
    const userSelectedTone = tone || style || "Neutro";

    let writerFinalPrompt = writerPromptTemplate
        .replace('{{dossier_json}}', dossierString)
        .replace('{{topic}}', dossierJson.main_thesis || normalizedRawText)
        .replace('{{motivation}}', "Basado en investigación.")
        .replace('{{context}}', "Podcast.") 
        .replace('{{duration}}', duration)
        .replace('{{depth}}', depth)
        .replace('{{style}}', userSelectedTone)
        .replace('{{archetype}}', raw_inputs.archetype || 'Ninguno');

    // [Fase Escritura]: Usamos WRITER_MODEL (1.5 Pro) + JSON Mode
    const scriptJson = await callGemini(WRITER_MODEL, writerFinalPrompt, [], true);

    const finalDraft = {
        suggested_title: scriptJson.title || scriptJson.suggested_title || "Nuevo Podcast",
        script_body: scriptJson.script_body || scriptJson.script || scriptJson.text,
        sources: dossierJson.sources || [] 
    };

    if (!finalDraft.script_body) throw new Error("Guion vacío generado.");

    return new Response(JSON.stringify({ success: true, draft: finalDraft }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Pipeline Fatal Error:", error);
    // Devolvemos el mensaje exacto de la API para facilitar el debug en el frontend si falla
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});