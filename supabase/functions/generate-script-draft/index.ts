// supabase/functions/generate-script-draft/index.ts
// CEREBRO SÍNCRONO: Genera el borrador del guion y el título sugerido para el editor.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

// Usamos el Service Role para leer los prompts de la base de datos (que pueden ser privados/admin)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const MODEL_NAME = "gemini-2.5-flash"; 
const API_VERSION = "v1beta";

// UTILIDAD: Limpiador de JSON (Vital para respuestas de IA)
function cleanJsonString(text: string): string {
  // Elimina bloques de markdown ```json ... ``` si existen
  let clean = text.replace(/```json\s*/g, "").replace(/```\s*$/g, "");
  // Elimina posibles espacios en blanco al inicio/final
  return clean.trim();
}

// UTILIDAD: Constructor de Contexto (Normaliza inputs dispares en un solo texto)
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
      // Caso base: combina tema y motivación
      const topic = inputs.solo_topic || inputs.topic || '';
      const motivation = inputs.solo_motivation || inputs.motivation || '';
      return `Tema: ${topic}. Detalles/Motivación: ${motivation}`;
  }
}

serve(async (request) => {
  // 1. CORS
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. SEGURIDAD: Verificar Usuario
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta cabecera de autorización.");
    
    const supabaseUserClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    
    if (authError || !user) throw new Error("Usuario no autenticado.");

    // 3. RATE LIMITING (Protección de API)
    // Usamos la misma función SQL pero con un límite separado para generación de guiones
    const { data: allowed } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_function_name: 'generate-script-draft',
      p_limit: 10, // 10 borradores por minuto es generoso y seguro
      p_window_seconds: 60
    });

    if (allowed === false) {
      return new Response(JSON.stringify({ error: "Has generado demasiados borradores muy rápido." }), { 
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 4. PREPARACIÓN DE DATOS
    const { purpose, style, duration, depth, raw_inputs } = await request.json();

    // Normalizar la "Materia Prima" en un solo string coherente
    const normalizedRawText = buildRawContext(purpose, raw_inputs);

    // 5. OBTENER EL CEREBRO (Prompt desde DB)
    const { data: promptData, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'script-architect-v1') // El agente que creamos en SQL
      .single();

    if (promptError || !promptData) {
      console.error("Error DB Prompt:", promptError);
      throw new Error("El agente 'script-architect-v1' no está configurado en la base de datos.");
    }

    // 6. INYECCIÓN DE VARIABLES
    let finalPrompt = promptData.prompt_template
      .replace('{{raw_text}}', normalizedRawText)
      .replace('{{duration}}', duration)
      .replace('{{depth}}', depth)
      .replace('{{style}}', style || 'Estándar')
      .replace('{{archetype}}', raw_inputs.archetype || 'N/A');

    // 7. LLAMADA A GEMINI
    const apiUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`;

    console.log(`Generando borrador con ${MODEL_NAME} para usuario ${user.id}...`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      }),
    });

    if (!response.ok) {
      const errorTxt = await response.text();
      throw new Error(`Gemini API Error: ${errorTxt}`);
    }

    // 8. PROCESAMIENTO DE RESPUESTA
    const result = await response.json();
    const rawOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawOutput) throw new Error("La IA no generó contenido.");

    // Limpieza y Parseo del JSON
    const cleanOutput = cleanJsonString(rawOutput);
    let draftJson;
    try {
      draftJson = JSON.parse(cleanOutput);
    } catch (e) {
      console.error("JSON Parse Error. Raw:", rawOutput);
      throw new Error("La IA generó un formato inválido. Por favor intenta de nuevo.");
    }

    // Validación básica de estructura
    if (!draftJson.suggested_title || !draftJson.script_body) {
        throw new Error("La respuesta de la IA está incompleta (falta título o cuerpo).");
    }

    // 9. RESPUESTA AL FRONTEND
    return new Response(
      JSON.stringify({ 
        success: true, 
        draft: draftJson 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Critical Error in generate-script-draft:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});