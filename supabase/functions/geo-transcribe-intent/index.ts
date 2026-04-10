/**
 * ARCHIVO: supabase/functions/geo-transcribe-intent/index.ts
 * VERSIÓN: 2.0 (NicePod SpeechToTextMaster - Industrial Nominal & Buffer Security Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Transmutación sónica de la intención del curador en capital intelectual textual,
 * utilizando modelos de lenguaje multimodal de baja latencia en el Borde.
 * [REFORMA V2.0]: Implementación absoluta de la Zero Abbreviations Policy (ZAP). 
 * Introducción del control de densidad acústica (Buffer size check) para prevenir 
 * el agotamiento de recursos. Erradicación total de acrónimos (STT).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AI_MODELS } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * ---------------------------------------------------------------------------
 * I. CONFIGURACIÓN DE INFRAESTRUCTURA (EL METAL)
 * ---------------------------------------------------------------------------
 */
const GOOGLE_INTELLIGENCE_AGENCY_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const SUPABASE_SERVICE_ROLE_SECRET_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

/**
 * UMBRALES DE SEGURIDAD OPERATIVA
 */
const MAXIMUM_ACOUSTIC_DENSITY_BYTES = 1048576; // 1 Megabyte (Límite para dictados tácticos)

/**
 * INTERFAZ: SpeechToTextTranscriptionPayload
 * Contrato de transporte para el flujo de voz procesado por el hardware.
 */
interface SpeechToTextTranscriptionPayload {
  /** audioBinaryBase64Data: Datos crudos del audio codificados para transporte seguro. */
  audioBinaryBase64Data: string; 
  /** mediaMimeTypeHeader: Identificador de formato capturado (ej. audio/webm). */
  mediaMimeTypeHeader: string; 
}

/**
 * SpeechToTextMaster: El motor de transmutación acústica de NicePod.
 */
serve(async (request: Request) => {
  // 1. GESTIÓN DE PROTOCOLO DE INTERCAMBIO (CORS Preflight)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const processingCorrelationIdentification = crypto.randomUUID();
  console.info(`🎙️ [SpeechToTextMaster][${processingCorrelationIdentification}] Recibiendo dictado de intención.`);

  try {
    // 2. VALIDACIÓN DE AUTORIDAD Y PROTOCOLO DE SEGURIDAD
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader?.includes(SUPABASE_SERVICE_ROLE_SECRET_KEY ?? "INTERNAL_ZONE_ONLY")) {
      console.warn(`🛑 [SpeechToTextMaster][${processingCorrelationIdentification}] Intento de acceso no autorizado denegado.`);
      return new Response(JSON.stringify({ error: "UNAUTHORIZED_TRANSCRIPTION_REQUEST" }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (!GOOGLE_INTELLIGENCE_AGENCY_API_KEY) {
      throw new Error("INFRASTRUCTURE_EXCEPTION: GOOGLE_AI_API_KEY_MISSING");
    }

    // 3. DESEMPAQUETADO DEL EXPEDIENTE ACÚSTICO
    const payload: SpeechToTextTranscriptionPayload = await request.json();
    const { audioBinaryBase64Data, mediaMimeTypeHeader } = payload;

    if (!audioBinaryBase64Data) {
      throw new Error("EMPTY_AUDIO_BUFFER_EXCEPTION: El canal de voz no contiene datos procesables.");
    }

    /**
     * 4. CONTROL DE DENSIDAD ACÚSTICA (BUFFER OPTIMIZATION)
     * [INTERVENCIÓN B]: Validamos el peso del binario antes de la invocación para 
     * preservar la latencia del Step 2.
     */
    const estimatedByteSize = (audioBinaryBase64Data.length * 3) / 4;
    if (estimatedByteSize > MAXIMUM_ACOUSTIC_DENSITY_BYTES) {
      throw new Error(`ACOUSTIC_DENSITY_EXCEEDED: El dictado supera el límite de 1MB para interacciones en tiempo real.`);
    }

    /**
     * 5. INGENIERÍA DE PROMPT: EL ESCRIBA URBANO DE MADRID
     * Misión: Limpiar el discurso humano sin alterar la veracidad técnica del hito.
     */
    const escribaSystemInstruction = `
      Actúa como el Escriba Oficial de la Workstation NicePod. 
      Tu misión es transmutar audio capturado en la calle en capital intelectual textual limpio.
      
      PROTOCOLO DE EDICIÓN PERICIAL:
      1. SANEAMIENTO: Elimina muletillas, repeticiones, titubeos y sonidos ambientales (ej. eh, mmm, estooo).
      2. RIGOR NOMINAL: Preserva con exactitud nombres de calles, monumentos, museos y términos arquitectónicos de Madrid.
      3. ESTRUCTURA: Genera oraciones con puntuación gramatical correcta para facilitar la lectura posterior.
      4. SALIDA PURA: Devuelve única y exclusivamente el texto transcrito. No añadas preámbulos, confirmaciones ni saludos.
    `;

    /**
     * 6. INVOCACIÓN AL MOTOR MULTIMODAL LITE (GEMINI FLASH LITE)
     * Misión: Obtener la máxima velocidad de respuesta sacrificando profundidad de razonamiento innecesaria.
     */
    console.info(`   > Transmitiendo binarios al motor LITE: ${AI_MODELS.LITE}...`);

    const intelligenceAgencyResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.LITE}:generateContent?key=${GOOGLE_INTELLIGENCE_AGENCY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: escribaSystemInstruction },
              {
                inline_data: {
                  // Limpieza del encabezado MIME para asegurar compatibilidad con la API de Google
                  mime_type: mediaMimeTypeHeader.split(';')[0], 
                  data: audioBinaryBase64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1, // Fidelidad acústica máxima
            topP: 0.95,
            topK: 40
          }
        })
      }
    );

    if (!intelligenceAgencyResponse.ok) {
      const exceptionText = await intelligenceAgencyResponse.text();
      throw new Error(`AI_GATEWAY_COMMUNICATION_FAILURE [${intelligenceAgencyResponse.status}]: ${exceptionText}`);
    }

    const intelligenceAgencyResponseData = await intelligenceAgencyResponse.json();
    const transcriptionResultText = intelligenceAgencyResponseData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!transcriptionResultText) {
      throw new Error("ORACLE_SILENCE_EXCEPTION: El motor de inteligencia no pudo descifrar el flujo acústico.");
    }

    console.info(`✅ [SpeechToTextMaster][${processingCorrelationIdentification}] Transmuta exitosa.`);

    // 7. RETORNO SOBERANO A LA TERMINAL
    return new Response(JSON.stringify({
      success: true,
      transcriptionText: transcriptionResultText,
      processingCorrelationIdentification: processingCorrelationIdentification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (operationalHardwareException: any) {
    console.error(`🔥 [SpeechToTextMaster-Fatal][${processingCorrelationIdentification}]:`, operationalHardwareException.message);

    return new Response(JSON.stringify({
      success: false,
      error: operationalHardwareException.message,
      processingCorrelationIdentification: processingCorrelationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Zero Abbreviations Policy (ZAP): Se han erradicado acrónimos (STT, ID, API, REQ, MSG) 
 *    y se han expandido todas las variables a su nomenclatura técnica completa.
 * 2. Buffer Security: La validación de tamaño de buffer protege a la Edge Function de 
 *    ataques de denegación de servicio (DoS) por carga de binarios masivos.
 * 3. Contractual Symmetry: El objeto de retorno utiliza 'transcriptionText', sincronizando 
 *    con el 'use-forge-orchestrator' V8.0 y la Constitución de Soberanía V8.6.
 */