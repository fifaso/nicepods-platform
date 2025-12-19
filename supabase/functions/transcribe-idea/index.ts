// supabase/functions/transcribe-idea/index.ts
// VERSIÓN: 3.1 (Fix: Model Version Pinning 'gemini-1.5-flash-002')

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { guard } from "../_shared/guard.ts"; 
import { corsHeaders } from "../_shared/cors.ts";

// [CORRECCIÓN CRÍTICA]: Usamos la versión específica '002' en lugar del alias genérico.
// Esto evita el error 404 y asegura soporte multimodal estable.
const MODEL_NAME = "gemini-3-flash-preview"; 
const API_VERSION = "v1beta";

// Configuración de seguridad permisiva
const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
];

const handler = async (request: Request): Promise<Response> => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY || !GOOGLE_API_KEY) {
    throw new Error("FATAL: Variables de entorno críticas no configuradas.");
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. SEGURIDAD & AUTH
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta autorización.");
    
    const supabaseUserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    
    if (authError || !user) {
        return new Response(JSON.stringify({ error: "Usuario no autenticado." }), { 
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    // 2. EXTRACCIÓN DE DATOS
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const mode = formData.get('mode') || 'clarify'; 

    if (!audioFile || !(audioFile instanceof File)) {
        return new Response(JSON.stringify({ error: "Falta el archivo de audio." }), { 
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    const mimeType = audioFile.type || "audio/webm";
    console.log(`[Transcribe] Procesando: ${audioFile.size} bytes, Tipo: ${mimeType}, Modelo: ${MODEL_NAME}`);

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = encodeBase64(new Uint8Array(arrayBuffer));

    // 3. PREPARACIÓN DEL PROMPT
    let systemInstruction = "";

    if (mode === 'fast') {
      systemInstruction = `Transcribe el siguiente audio exactamente palabra por palabra. Ignora balbuceos. Solo el texto limpio.`;
    } else {
      const { data: promptData } = await supabaseAdmin
        .from('ai_prompts').select('prompt_template')
        .eq('agent_name', 'thought-clarifier').single();
      
      const defaultPrompt = "Actúa como un redactor experto. Transcribe, limpia y mejora la claridad de la siguiente idea de audio. {{transcription}}";
      const template = promptData?.prompt_template || defaultPrompt;
      
      systemInstruction = template.replace('{{transcription}}', '[AUDIO ADJUNTO]');
    }

    // 4. LLAMADA A GEMINI
    const apiUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`;

    const payload = {
        contents: [{
            role: "user",
            parts: [
              { text: systemInstruction },
              { inline_data: { mime_type: mimeType, data: base64Audio } }
            ]
        }],
        safetySettings: SAFETY_SETTINGS,
        generationConfig: { 
            temperature: mode === 'fast' ? 0.1 : 0.7, 
            maxOutputTokens: 2000 
        }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const txt = await response.text();
      // Logueamos el error completo para debug si vuelve a fallar
      console.error(`Gemini Fail Response: ${txt}`);
      throw new Error(`Gemini API Error (${response.status}): ${txt}`);
    }

    const result = await response.json();
    
    const finalBuffer = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const finishReason = result.candidates?.[0]?.finishReason;

    if (!finalBuffer) {
        console.error("Gemini Response Dump:", JSON.stringify(result, null, 2));
        throw new Error(`La IA no devolvió texto. Razón: ${finishReason}`);
    }

    // 5. ÉXITO
    return new Response(
      JSON.stringify({ success: true, clarified_text: finalBuffer.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error Transcribe:", msg);
    
    if (msg.includes("Falta autorización")) {
         return new Response(JSON.stringify({ error: msg }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw error;
  }
};

serve(guard(handler));