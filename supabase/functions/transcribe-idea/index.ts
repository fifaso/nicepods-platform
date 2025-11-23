// supabase/functions/transcribe-idea/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

// 1. Cliente Admin (Service Role) para leer prompts privados y acceder a Gemini
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const MODEL_NAME = "gemini-1.5-flash"; 
const API_VERSION = "v1beta";

serve(async (request) => {
  // Manejo de CORS
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- CAPA DE SEGURIDAD ---
    // Verificar que el usuario está logueado antes de procesar audio.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Falta cabecera de autorización.");
    }
    // Creamos un cliente temporal con el token del usuario para verificar validez
    const supabaseUserClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    
    if (authError || !user) {
      throw new Error("Usuario no autenticado. Acceso denegado.");
    }
    // -------------------------

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      throw new Error("Content-Type debe ser multipart/form-data.");
    }

    // Extracción del archivo de audio
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof File)) {
      throw new Error("Archivo de audio no encontrado en el cuerpo de la petición.");
    }

    // Preparar Audio para Gemini (Base64)
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = encodeBase64(new Uint8Array(arrayBuffer));

    // Obtener Prompt del Agente 37
    const { data: promptData, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'thought-clarifier') // Debe coincidir con el ID 37
      .single();

    if (promptError || !promptData) throw new Error("Agente 'thought-clarifier' no configurado en DB.");

    // Inyección de contexto (aunque es multimodal, el texto guía al modelo)
    const systemInstruction = promptData.prompt_template.replace('{{transcription}}', '[AUDIO ADJUNTO]');
    
    // URL de Gemini 1.5 Flash
    const apiUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`;

    // Llamada a la API (Multimodal)
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
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini Error:", errorText);
      throw new Error(`Gemini API Error: ${errorText}`);
    }

    const result = await response.json();
    const clarifiedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!clarifiedText) throw new Error("La IA no pudo procesar el audio.");

    return new Response(
      JSON.stringify({ success: true, clarified_text: clarifiedText.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error en transcribe-idea:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});