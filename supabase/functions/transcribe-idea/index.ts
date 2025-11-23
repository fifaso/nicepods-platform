// supabase/functions/transcribe-idea/index.ts
// VERSIÓN ENTERPRISE: Rate Limiting + Audio Streaming + Gemini 2.5

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
    // 1. AUTENTICACIÓN
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta autorización.");
    
    const supabaseUserClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    if (authError || !user) throw new Error("Usuario no autenticado.");

    // 2. RATE LIMITING (5 peticiones por 60 segundos)
    const { data: allowed, error: rateError } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_function_name: 'transcribe-idea',
      p_limit: 5,
      p_window_seconds: 60
    });

    if (rateError) console.error("Error Rate Limit RPC:", rateError);
    if (allowed === false) {
      return new Response(JSON.stringify({ error: "Límite de velocidad excedido. Espera un momento." }), { 
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 3. PROCESAMIENTO AUDIO
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) throw new Error("Content-Type inválido.");
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    if (!audioFile || !(audioFile instanceof File)) throw new Error("Falta archivo de audio.");

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = encodeBase64(new Uint8Array(arrayBuffer));

    // 4. PREPARAR PROMPT
    const { data: promptData } = await supabaseAdmin
      .from('ai_prompts').select('prompt_template')
      .eq('agent_name', 'thought-clarifier').single();
    if (!promptData) throw new Error("Agente no configurado.");

    const systemInstruction = promptData.prompt_template.replace('{{transcription}}', '[AUDIO ADJUNTO]');

    // 5. LLAMADA A GEMINI CON STREAMING (alt=sse)
    const apiUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:streamGenerateContent?alt=sse&key=${GOOGLE_API_KEY}`;

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
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Gemini Error: ${txt}`);
    }

    // 6. TRANSFORMACIÓN DEL STREAM (Proxy SSE -> Texto)
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) { controller.close(); return; }
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr.trim() === '[DONE]') continue;
                try {
                  const data = JSON.parse(jsonStr);
                  const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (textPart) {
                    controller.enqueue(encoder.encode(textPart));
                  }
                } catch (e) { /* ignorar chunks parciales */ }
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error" }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});