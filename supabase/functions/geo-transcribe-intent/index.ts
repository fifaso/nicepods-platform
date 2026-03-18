// supabase/functions/geo-transcribe-intent/index.ts
// VERSIÓN: 1.0 (NicePod Sovereign STT - Flash Intelligence)
// Misión: Convertir el dictado del Administrador en texto limpio para la Bóveda.
// [ESTABILIZACIÓN]: Procesamiento multimodal nativo de audio (Sin transcodificación).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CONFIGURACIÓN DE INTELIGENCIA INDUSTRIAL
 */
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const GEMINI_MODEL = "gemini-1.5-flash";

/**
 * INTERFAZ: TranscriptionPayload
 * Recibe el audio en formato Base64 para evitar problemas de flujo en el Edge.
 */
interface TranscriptionPayload {
  audioBase64: string;
  contentType: string; // Ej: 'audio/webm' o 'audio/mp4'
}

/**
 * handler: El Escriba de la Malla.
 */
serve(async (req: Request) => {
  // 1. GESTIÓN DE PROTOCOLO CORS (Costo CPU: 0ms)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();
  console.info(`🎙️ [STT-Orquestrator][${correlationId}] Iniciando transcripción de intención.`);

  try {
    // 2. VALIDACIÓN DE AUTORIDAD SOBERANA
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(SERVICE_ROLE_KEY ?? "PROTECTED_NODE")) {
      console.warn(`🛑 [STT-Orquestrator][${correlationId}] Acceso no autorizado.`);
      return new Response(JSON.stringify({ error: "UNAUTHORIZED_ACCESS" }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // 3. DESEMPAQUETADO DE PAYLOAD
    const { audioBase64, contentType }: TranscriptionPayload = await req.json();

    if (!audioBase64) {
      throw new Error("AUDIO_DATA_MISSING: El canal de voz está vacío.");
    }

    /**
     * 4. INGENIERÍA DE PROMPT (EL ESCRIBA EDITORIAL)
     * Instruimos a la IA para que limpie el lenguaje natural del Administrador.
     */
    const systemPrompt = `
      Actúa como el Escriba Oficial de NicePod. Tu misión es transcribir el dictado del Administrador.
      
      REGLAS DE EDICIÓN:
      1. Limpia el texto: Elimina repeticiones, tartamudeos y muletillas (eh, mmm, bueno, entonces...).
      2. Preserva el rigor: Mantén nombres de calles, monumentos, siglos y términos técnicos de Madrid intactos.
      3. Puntuación: Inserta puntos y comas de forma inteligente para que el texto sea legible.
      4. Formato: Devuelve ÚNICA Y EXCLUSIVAMENTE el texto limpio. No añadas notas como "Aquí está tu texto".
    `;

    /**
     * 5. INVOCACIÓN DEL MOTOR MULTIMODAL (Gemini Flash)
     * Enviamos el audio como parte de la estructura de contenido.
     */
    console.info(`   > Transmitiendo binarios al motor ${GEMINI_MODEL}...`);

    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: contentType.split(';')[0], // Limpiamos el charset si existe
                  data: audioBase64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1, // Mínima creatividad para máxima fidelidad
            topP: 0.8,
            topK: 40
          }
        })
      }
    );

    if (!googleResponse.ok) {
      const errorDetail = await googleResponse.text();
      throw new Error(`AI_GATEWAY_FAIL: ${googleResponse.status} - ${errorDetail}`);
    }

    const aiResult = await googleResponse.json();
    const transcription = aiResult.candidates[0].content.parts[0].text.trim();

    console.info(`✅ [STT-Orquestrator][${correlationId}] Transcripción exitosa: ${transcription.substring(0, 30)}...`);

    // 6. RETORNO DE LA VERDAD TEXTUAL
    return new Response(JSON.stringify({
      success: true,
      transcription: transcription,
      trace_id: correlationId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error(`🔥 [STT-Fatal][${correlationId}]:`, error.message);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. Procesamiento In-Memory: Al usar Gemini 1.5 Flash, evitamos guardar el audio 
 *    temporalmente en el disco, cumpliendo con el dogma de 'Zero-Waste'.
 * 2. Latencia Optimizada: La temperatura baja (0.1) asegura que el modelo no 
 *    pierda tiempo "pensando" en variantes literarias, yendo directo al grano.
 * 3. Versatilidad de Formato: Acepta cualquier formato que el navegador móvil 
 *    capture (webm/mp4/ogg) y lo entrega al oráculo de Google para su interpretación.
 */