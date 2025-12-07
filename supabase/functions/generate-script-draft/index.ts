// supabase/functions/generate-script-draft/index.ts
// VERSIÓN: 5.9 (Final: Force 'script-architect-v1' & Safety Settings)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

// Usamos el modelo experimental más capaz para razonamiento complejo
const MODEL_NAME = "gemini-2.0-flash-exp"; 
const API_VERSION = "v1beta";
const MAX_RETRIES = 2; 

// --- UTILIDADES ---

// 1. Matriz de Densidad Documental
function calculateSourceLimits(durationStr: string, depthStr: string): { min: number, max: number } {
  const duration = (durationStr || "").toLowerCase().trim();
  const depth = (depthStr || "").toLowerCase().trim();

  if (duration.includes("3-5")) {
    return depth.includes("profundo") ? { min: 4, max: 7 } : { min: 2, max: 4 };
  }
  if (duration.includes("6-9")) {
    return depth.includes("profundo") ? { min: 6, max: 10 } : { min: 3, max: 6 };
  }
  if (duration.includes("10-14")) {
    return depth.includes("profundo") ? { min: 10, max: 15 } : { min: 5, max: 10 };
  }
  return { min: 3, max: 6 };
}

// Extractor quirúrgico de JSON
function extractJsonFromResponse(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text.trim();
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

// Función Genérica para llamar a Gemini
async function callGeminiAgent(prompt: string, tools: any[] = []) {
  let lastError = null;
  
  // Configuración de Seguridad permisiva para evitar bloqueos en temas creativos
  const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
  ];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const currentPrompt = attempt > 1 
          ? prompt + "\n\nIMPORTANTE: Tu respuesta anterior falló. Devuelve SOLO un JSON válido."
          : prompt;

      const response = await fetch(`https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: currentPrompt }] }],
          tools: tools.length > 0 ? tools : undefined,
          safetySettings: safetySettings,
          generationConfig: { responseMimeType: "application/json" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      
      if (!candidate) throw new Error("Gemini no devolvió candidatos.");
      if (candidate.finishReason !== "STOP") console.warn(`Gemini Warning: FinishReason ${candidate.finishReason}`);

      const rawOutput = candidate.content?.parts?.[0]?.text;
      if (!rawOutput) throw new Error("Respuesta de texto vacía.");

      const cleanOutput = extractJsonFromResponse(rawOutput);
      return JSON.parse(cleanOutput);

    } catch (e) {
      console.error(`Intento ${attempt} fallido:`, e.message);
      lastError = e;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  throw lastError;
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

    const { data: allowed } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: user.id, p_function_name: 'generate-script-draft', p_limit: 10, p_window_seconds: 60
    });
    if (allowed === false) return new Response(JSON.stringify({ error: "Rate limit excedido." }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Inputs
    const { purpose, style, duration, depth, tone, raw_inputs } = await request.json();
    
    // [CAMBIO CRÍTICO]: Forzamos SIEMPRE al Arquitecto V1.
    // El 'tone' del usuario se pasará como parámetro {{style}} al prompt, no como nombre de agente.
    const writerAgentName = 'script-architect-v1'; 
    const curatorAgentName = 'research-curator-v1';

    // Recuperamos Prompts
    const { data: promptsData, error: promptsError } = await supabaseAdmin
      .from('ai_prompts')
      .select('agent_name, prompt_template')
      .in('agent_name', [curatorAgentName, writerAgentName]);

    if (promptsError || !promptsData) throw new Error("Error cargando agentes.");

    const curatorPromptTemplate = promptsData.find(p => p.agent_name === curatorAgentName)?.prompt_template;
    const writerPromptTemplate = promptsData.find(p => p.agent_name === writerAgentName)?.prompt_template;

    if (!curatorPromptTemplate) throw new Error("Agente Curador no encontrado.");
    if (!writerPromptTemplate) throw new Error("Agente Arquitecto no encontrado.");

    // --- FASE 1: EL CURADOR (Investigación) ---
    const normalizedRawText = buildRawContext(purpose, raw_inputs);
    const sourceLimits = calculateSourceLimits(duration, depth);
    
    console.log(`1. Investigación: "${normalizedRawText.substring(0, 30)}..." | Sources: ${sourceLimits.min}-${sourceLimits.max}`);

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
        dossierJson = await callGeminiAgent(curatorFinalPrompt, [{ google_search: {} }]);
    } catch (e) {
        console.warn("⚠️ Fallo Curador (Fallback activo):", e);
        dossierJson = {
            main_thesis: normalizedRawText,
            key_facts: ["Investigación en tiempo real no disponible. Generación basada en conocimiento general."],
            sources: []
        };
    }

    // --- FASE 2: EL ARQUITECTO (Escritura) ---
    console.log("2. Redacción (Arquitecto V1)...");

    const dossierString = JSON.stringify(dossierJson);
    
    // Aquí mapeamos el 'tone' (input usuario) a la variable {{style}} del prompt
    const userSelectedTone = tone || style || "Neutro y Profesional";

    let writerFinalPrompt = writerPromptTemplate
        .replace('{{dossier_json}}', dossierString)
        // Mapeo de seguridad para variables antiguas si existieran en el prompt
        .replace('{{topic}}', dossierJson.main_thesis || normalizedRawText)
        .replace('{{motivation}}', "Basado en dossier.")
        .replace('{{context}}', "Podcast fundamentado.") 
        // Variables V5
        .replace('{{duration}}', duration)
        .replace('{{depth}}', depth)
        .replace('{{style}}', userSelectedTone) // <--- El tono del usuario entra aquí
        .replace('{{archetype}}', raw_inputs.archetype || 'Ninguno');

    const scriptJson = await callGeminiAgent(writerFinalPrompt);

    if (!scriptJson.title && !scriptJson.suggested_title) throw new Error("Guion generado sin título.");
    
    const finalDraft = {
        suggested_title: scriptJson.title || scriptJson.suggested_title,
        script_body: scriptJson.script_body || scriptJson.script,
        sources: dossierJson.sources || [] 
    };

    return new Response(JSON.stringify({ success: true, draft: finalDraft }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Pipeline Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error interno" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});