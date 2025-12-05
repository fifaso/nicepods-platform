// supabase/functions/generate-script-draft/index.ts
// CEREBRO SÍNCRONO V2 (SALA DE REDACCIÓN): Pipeline de Investigación (Curador) -> Escritura (Arquitecto).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const MODEL_NAME = "gemini-2.5-flash"; 
const API_VERSION = "v1beta";
const MAX_RETRIES = 2; 

// --- UTILIDADES ---

// Extractor quirúrgico de JSON
function extractJsonFromResponse(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

// Constructor de Contexto Crudo (Para el Investigador)
function buildRawContext(purpose: string, inputs: any): string {
  switch (purpose) {
    case 'explore': return `Conectar "${inputs.topicA}" con "${inputs.topicB}". Catalizador: ${inputs.catalyst || 'Ninguno'}.`;
    case 'inspire': return `Arquetipo: ${inputs.archetype}. Tema: ${inputs.archetype_topic}. Meta: ${inputs.archetype_goal}.`;
    case 'reflect': return `Reflexión: ${inputs.legacy_lesson}.`;
    case 'answer': return `Pregunta: "${inputs.question}".`;
    default: return `Tema: ${inputs.solo_topic || inputs.topic}. Motivación: ${inputs.solo_motivation || inputs.motivation}.`;
  }
}

// Función Genérica para llamar a Gemini con Reintentos
async function callGeminiAgent(prompt: string, tools: any[] = []) {
  let lastError = null;
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
          tools: tools.length > 0 ? tools : undefined
        }),
      });

      if (!response.ok) throw new Error(`Gemini Error: ${await response.text()}`);

      const result = await response.json();
      const rawOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawOutput) throw new Error("Respuesta vacía.");

      const cleanOutput = extractJsonFromResponse(rawOutput);
      return JSON.parse(cleanOutput);

    } catch (e) {
      console.error(`Intento ${attempt} fallido:`, e);
      lastError = e;
    }
  }
  throw lastError;
}

// --- MAIN ---

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // 1. SEGURIDAD
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

    // 2. DATOS DE ENTRADA
    const { purpose, style, duration, depth, tone, raw_inputs } = await request.json();
    
    // Seleccionamos el agente "Personalidad" (Tono) o usamos el default si no hay uno específico.
    // Nota: Aunque tengamos un Curador antes, la personalidad define CÓMO se escribe el guion final.
    const writerAgentName = tone || 'script-architect-v1'; 

    // 3. RECUPERAR PROMPTS (Curador y Escritor)
    // Buscamos ambos prompts en paralelo para eficiencia
    const { data: promptsData, error: promptsError } = await supabaseAdmin
      .from('ai_prompts')
      .select('agent_name, prompt_template')
      .in('agent_name', ['research-curator-v1', writerAgentName]);

    if (promptsError || !promptsData) throw new Error("Error cargando agentes.");

    const curatorPromptTemplate = promptsData.find(p => p.agent_name === 'research-curator-v1')?.prompt_template;
    const writerPromptTemplate = promptsData.find(p => p.agent_name === writerAgentName)?.prompt_template;

    if (!curatorPromptTemplate) throw new Error("Agente Curador no encontrado.");
    if (!writerPromptTemplate) throw new Error(`Agente Escritor '${writerAgentName}' no encontrado.`);

    // --- FASE 1: EL CURADOR (Investigación) ---
    const normalizedRawText = buildRawContext(purpose, raw_inputs);
    console.log(`1. Iniciando Investigación para: ${normalizedRawText.substring(0, 50)}...`);

    const curatorFinalPrompt = curatorPromptTemplate
        .replace('{{raw_input}}', normalizedRawText)
        .replace('{{purpose}}', purpose);

    // Llamada con Google Search Activado
    let dossierJson;
    try {
        dossierJson = await callGeminiAgent(curatorFinalPrompt, [{ google_search: {} }]);
    } catch (e) {
        // Fallback: Si falla la investigación, creamos un dossier "ficticio" con la data cruda para que el escritor no falle.
        console.warn("Fallo en Curador, usando fallback local:", e);
        dossierJson = {
            main_thesis: normalizedRawText,
            key_facts: ["Información basada en el conocimiento general de la IA."],
            sources: []
        };
    }

    // --- FASE 2: EL ARQUITECTO (Escritura) ---
    console.log("2. Iniciando Redacción basada en Dossier...");

    // Preparamos las variables para el escritor. 
    // IMPORTANTE: Si el escritor es 'script-architect-v1' (nuevo), espera {{dossier_json}}.
    // Si es un tono antiguo (ej 'narrador'), espera {{topic}} y {{motivation}}. Hacemos un mapeo híbrido.
    
    const dossierString = JSON.stringify(dossierJson); // Dossier completo para el arquitecto
    const enrichedTopic = dossierJson.main_thesis || normalizedRawText; // Tesis validada como tema
    const enrichedMotivation = (dossierJson.key_facts || []).join(". "); // Hechos como motivación

    let writerFinalPrompt = writerPromptTemplate
        .replace('{{dossier_json}}', dossierString) // Para la V3.0 (Arquitecto)
        // Compatibilidad con Tonos (V2.0)
        .replace('{{topic}}', enrichedTopic)
        .replace('{{motivation}}', enrichedMotivation)
        .replace('{{context}}', "Basado en hechos reales investigados.") 
        .replace('{{duration}}', duration)
        .replace('{{depth}}', depth)
        .replace('{{style}}', style || 'Estándar')
        .replace('{{archetype}}', raw_inputs.archetype || 'N/A');

    // Llamada al Escritor (Sin búsqueda, usa el dossier)
    const scriptJson = await callGeminiAgent(writerFinalPrompt);

    // Validación Final
    if (!scriptJson.title && !scriptJson.suggested_title) throw new Error("Guion sin título.");
    
    // Normalización de salida
    const finalDraft = {
        suggested_title: scriptJson.title || scriptJson.suggested_title,
        script_body: scriptJson.script_body || scriptJson.script,
        sources: dossierJson.sources || [] // Pasamos las fuentes al frontend
    };

    return new Response(JSON.stringify({ success: true, draft: finalDraft }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Critical Error pipeline:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error interno" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});