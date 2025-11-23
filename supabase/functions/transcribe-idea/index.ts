// supabase/functions/transcribe-idea/index.ts
// VERSIÓN DE PRODUCCIÓN: Motor actualizado a Gemini 2.5 Flash (Multimodal Audio)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

// CAMBIO DEFINITIVO: Usamos el modelo validado en tu diagnóstico.
const MODEL_NAME = "gemini-2.5-flash"; 
const API_VERSION = "v1beta";

serve(async (request) => {
  // Manejo de Pre-flight (CORS)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. SEGURIDAD: Verificación de Usuario
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta cabecera de autorización.");
    
    const supabaseUserClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    
    if (authError || !user) throw new Error("Usuario no autenticado.");
    
    // 2. VALIDACIÓN DE INPUT
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) throw new Error("Content-Type inválido. Se espera audio multipart.");

    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof File)) throw new Error("Archivo de audio no recibido.");

    // 3. PROCESAMIENTO DE AUDIO (Blob -> Base64)
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = encodeBase64(new Uint8Array(arrayBuffer));

    // 4. CEREBRO: Obtener Prompt de la DB
    const { data: promptData, error: promptError } = await supabaseAdmin
      .from('ai_prompts')
      .select('prompt_template')
      .eq('agent_name', 'thought-clarifier')
      .single();

    if (promptError || !promptData) throw new Error("Error interno: Agente de clarificación no configurado.");

    const systemInstruction = promptData.prompt_template.replace('{{transcription}}', '[AUDIO ADJUNTO]');
    
    // 5. LLAMADA A LA API (Multimodal Gemini 2.5)
    // Nota: La URL se construye limpia, sin prefijos 'models/' duplicados si el MODEL_NAME no lo tiene.
    const apiUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
            role: "user",
            parts: [
              { text: systemInstruction },
              { 
                inline_data: { 
                  mime_type: audioFile.type || 'audio/mp3', // Gemini es flexible, pero mp3 es seguro
                  data: base64Audio 
                } 
              }
            ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000, // Aumentado para ideas largas
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini 2.5 Error:`, errorText);
      throw new Error(`Fallo en IA: ${errorText}`);
    }

    const result = await response.json();
    const clarifiedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!clarifiedText) throw new Error("La IA escuchó el audio pero no generó respuesta.");

    // 6. RESPUESTA AL FRONTEND
    return new Response(
      JSON.stringify({ success: true, clarified_text: clarifiedText.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error crítico en transcribe-idea:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});