// supabase/functions/transcribe-idea/index.ts
// VERSIÓN DUAL: Soporta 'clarify' (IA) y 'fast' (Literal). Sin Streaming para máxima estabilidad.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);
const MODEL_NAME = "gemini-2.5-flash"; 
const API_VERSION = "v1beta";

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // 1. SEGURIDAD & RATE LIMITING
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta autorización.");
    
    const supabaseUserClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    if (authError || !user) throw new Error("Usuario no autenticado.");

    // Limitamos a 10 peticiones por minuto (un poco más generoso para uso intensivo)
    const { data: allowed } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: user.id, p_function_name: 'transcribe-idea', p_limit: 10, p_window_seconds: 60
    });
    if (allowed === false) {
      return new Response(JSON.stringify({ error: "Límite de velocidad. Espera un poco." }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. EXTRACCIÓN DE DATOS
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const mode = formData.get('mode') || 'clarify'; // 'clarify' | 'fast'

    if (!audioFile || !(audioFile instanceof File)) throw new Error("Falta audio.");

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = encodeBase64(new Uint8Array(arrayBuffer));

    // 3. SELECCIÓN DE INTELIGENCIA (EL CEREBRO)
    let systemInstruction = "";

    if (mode === 'fast') {
      // MODO RÁPIDO: Prompt ligero, sin consultas a DB, directo al grano.
      systemInstruction = `Transcribe el siguiente audio exactamente palabra por palabra. 
      No añadas explicaciones, ni formatos. Solo el texto crudo en español.`;
    } else {
      // MODO CLARIFICAR (Default): Usa el Agente experto de la DB.
      const { data: promptData } = await supabaseAdmin
        .from('ai_prompts').select('prompt_template')
        .eq('agent_name', 'thought-clarifier').single();
      
      if (!promptData) throw new Error("Agente thought-clarifier no configurado.");
      systemInstruction = promptData.prompt_template.replace('{{transcription}}', '[AUDIO ADJUNTO]');
    }

    // 4. LLAMADA A GEMINI (SIN STREAMING PARA EVITAR BUGS DE PARSEO)
    const apiUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
            role: "user",
            parts: [
              { text: systemInstruction },
              { inline_data: { mime_type: audioFile.type || 'audio/mp3', data: base64Audio } }
            ]
        }],
        // Temperatura baja para dictado, media para creatividad
        generationConfig: { temperature: mode === 'fast' ? 0.2 : 0.7, maxOutputTokens: 2000 }
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Gemini Error: ${txt}`);
    }

    const result = await response.json();
    const finalBuffer = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!finalBuffer) throw new Error("Sin respuesta de texto.");

    // 5. RESPUESTA LIMPIA
    return new Response(
      JSON.stringify({ success: true, clarified_text: finalBuffer.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error" }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});