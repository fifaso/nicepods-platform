// supabase/functions/transcribe-idea/index.ts
// VERSIÓN: 2.0 (Guard Integrated: Sentry + Arcjet + High Throughput for Creativity)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { guard } from "../_shared/guard.ts"; // <--- INTEGRACIÓN DEL ESTÁNDAR
import { corsHeaders } from "../_shared/cors.ts";

const MODEL_NAME = "gemini-2.5-pro"; // Usamos la versión estable y rápida
const API_VERSION = "v1beta";

// --- LOGICA DE NEGOCIO (HANDLER) ---
const handler = async (request: Request): Promise<Response> => {
  // El Guard maneja OPTIONS y CORS automáticamente

  // 1. VALIDACIÓN DE ENTORNO
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY || !GOOGLE_API_KEY) {
    throw new Error("FATAL: Variables de entorno críticas no configuradas.");
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 2. SEGURIDAD & AUTH
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta autorización.");
    
    const supabaseUserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    
    if (authError || !user) {
        // Retornamos 401 controlado (No Sentry)
        return new Response(JSON.stringify({ error: "Usuario no autenticado." }), { 
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    // NOTA: El Rate Limiting ya fue manejado por 'guard' (Arcjet) a 50 req/min.
    // Eliminamos la llamada manual a RPC 'check_rate_limit'.

    // 3. EXTRACCIÓN DE DATOS
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const mode = formData.get('mode') || 'clarify'; // 'clarify' | 'fast'

    if (!audioFile || !(audioFile instanceof File)) {
        return new Response(JSON.stringify({ error: "Falta el archivo de audio." }), { 
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = encodeBase64(new Uint8Array(arrayBuffer));

    // 4. SELECCIÓN DE INTELIGENCIA (EL CEREBRO)
    let systemInstruction = "";

    if (mode === 'fast') {
      // MODO RÁPIDO: Prompt ligero
      systemInstruction = `Transcribe el siguiente audio exactamente palabra por palabra. 
      No añadas explicaciones, ni formatos. Solo el texto crudo en español.`;
    } else {
      // MODO CLARIFICAR (Default): Usa el Agente experto de la DB.
      const { data: promptData } = await supabaseAdmin
        .from('ai_prompts').select('prompt_template')
        .eq('agent_name', 'thought-clarifier').single();
      
      if (!promptData) throw new Error("Agente 'thought-clarifier' no configurado en base de datos.");
      
      systemInstruction = promptData.prompt_template.replace('{{transcription}}', '[AUDIO ADJUNTO]');
    }

    // 5. LLAMADA A GEMINI (Audio Multimodal)
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
        // Temperatura baja para dictado, media para clarificación
        generationConfig: { 
            temperature: mode === 'fast' ? 0.2 : 0.7, 
            maxOutputTokens: 2000 
        }
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Gemini Error (${response.status}): ${txt}`);
    }

    const result = await response.json();
    const finalBuffer = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!finalBuffer) throw new Error("La IA no devolvió texto.");

    // 6. RESPUESTA EXITOSA
    return new Response(
      JSON.stringify({ success: true, clarified_text: finalBuffer.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Los errores críticos (Gemini fail, DB fail) se relanzan para que Guard los envíe a Sentry
    // Los errores de input (400) ya se manejaron arriba
    const msg = error instanceof Error ? error.message : "Error desconocido";
    
    // Si es un error esperado que se escapó, lo convertimos a respuesta limpia, 
    // pero si es sistema, throw.
    if (msg.includes("Falta autorización")) {
         return new Response(JSON.stringify({ error: msg }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw error;
  }
};

// --- PUNTO DE ENTRADA PROTEGIDO ---
serve(guard(handler));