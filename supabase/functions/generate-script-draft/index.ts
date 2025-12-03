// supabase/functions/generate-script-draft/index.ts
// CEREBRO SÍNCRONO ROBUSTO: Incluye lógica de reintento automático (Self-Healing) ante errores de JSON.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const MODEL_NAME = "gemini-2.5-flash"; 
const API_VERSION = "v1beta";
const MAX_RETRIES = 2; // Intentará hasta 2 veces si la IA falla el formato

// Extractor quirúrgico
function extractJsonFromResponse(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

// Constructor de Contexto
function buildRawContext(purpose: string, inputs: any): string {
  switch (purpose) {
    case 'explore':
      return `Conectar idea A: "${inputs.topicA}" con idea B: "${inputs.topicB}". Catalizador: ${inputs.catalyst || 'Ninguno'}.`;
    case 'inspire':
      return `Arquetipo: ${inputs.archetype}. Tema: ${inputs.archetype_topic}. Objetivo emocional: ${inputs.archetype_goal}.`;
    case 'reflect':
      return `Reflexión personal sobre: ${inputs.legacy_lesson}.`;
    case 'answer':
      return `Responder a la pregunta: "${inputs.question}".`;
    case 'learn':
    case 'freestyle':
    default:
      const topic = inputs.solo_topic || inputs.topic || '';
      const motivation = inputs.solo_motivation || inputs.motivation || '';
      return `Tema: ${topic}. Detalles/Motivación: ${motivation}`;
  }
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- SEGURIDAD Y RATE LIMITING ---
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta cabecera de autorización.");
    
    const supabaseUserClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    if (authError || !user) throw new Error("Usuario no autenticado.");

    const { data: allowed } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_function_name: 'generate-script-draft',
      p_limit: 10, 
      p_window_seconds: 60
    });

    if (allowed === false) {
      return new Response(JSON.stringify({ error: "Has generado demasiados borradores muy rápido." }), { 
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    // ---------------------------------

    const { purpose, style, duration, depth, raw_inputs } = await request.json();
    const normalizedRawText = buildRawContext(purpose, raw_inputs);

    const { data: promptData, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1')
      .single();

    if (promptError || !promptData) throw new Error("Agente 'script-architect-v1' no configurado.");

    let basePrompt = promptData.prompt_template
      .replace('{{raw_text}}', normalizedRawText)
      .replace('{{duration}}', duration)
      .replace('{{depth}}', depth)
      .replace('{{style}}', style || 'Estándar')
      .replace('{{archetype}}', raw_inputs.archetype || 'N/A');

    // --- BUCLE DE INTENTOS (SELF-HEALING) ---
    let lastError = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Intento ${attempt}/${MAX_RETRIES} con ${MODEL_NAME}...`);
        
        // Si es un reintento, añadimos una instrucción de corrección fuerte al prompt
        const currentPrompt = attempt > 1 
            ? basePrompt + "\n\nIMPORTANTE: Tu respuesta anterior falló. Asegúrate de devolver UNICAMENTE un JSON válido. Escapa correctamente los saltos de línea."
            : basePrompt;

        const apiUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: currentPrompt }] }] }),
        });

        if (!response.ok) {
          const errorTxt = await response.text();
          throw new Error(`Gemini API Error: ${errorTxt}`);
        }

        const result = await response.json();
        const rawOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawOutput) throw new Error("La IA no generó contenido.");

        const cleanOutput = extractJsonFromResponse(rawOutput);
        const draftJson = JSON.parse(cleanOutput);

        if (!draftJson.suggested_title || !draftJson.script_body) {
            throw new Error("JSON incompleto.");
        }

        // ÉXITO
        return new Response(
          JSON.stringify({ success: true, draft: draftJson }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (e) {
        console.error(`Fallo intento ${attempt}:`, e);
        lastError = e;
        // Si falló, el bucle continuará al siguiente intento
      }
    }

    // Si salimos del bucle, es que fallaron todos los intentos
    throw lastError || new Error("Fallaron todos los intentos de generación.");

  } catch (error) {
    console.error("Critical Error in generate-script-draft:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});