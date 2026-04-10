/**
 * ARCHIVO: supabase/functions/geo-transcribe-intent/index.ts
 * VERSIÓN: 3.0 (NicePod SpeechToTextMaster - Industrial Nominal & Acoustic Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Transmutación sónica de la intención cognitiva del Administrador en capital 
 * intelectual textual, utilizando modelos de lenguaje multimodal de baja latencia 
 * en el Borde de la red.
 * [REFORMA V3.0]: Elevación a Grado Industrial. Implementación rigurosa de la 
 * Zero Abbreviations Policy (ZAP). Refuerzo del protocolo de seguridad de búfer 
 * y gestión de excepciones sin tipos débiles (BSS). Sincronización absoluta 
 * con la Constitución de Soberanía V8.6.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AI_MODELS } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * ---------------------------------------------------------------------------
 * I. CONFIGURACIÓN DE INFRAESTRUCTURA TÉCNICA (EL METAL)
 * ---------------------------------------------------------------------------
 */
const GOOGLE_INTELLIGENCE_AGENCY_APPLICATION_PROGRAMMING_INTERFACE_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const SUPABASE_SERVICE_ROLE_SECRET_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

/**
 * UMBRALES DE SEGURIDAD ACÚSTICA
 * Misión: Prevenir el agotamiento de memoria en nodos perimetrales.
 */
const MAXIMUM_PERMITTED_ACOUSTIC_DENSITY_BYTES = 1048576; // 1 Megabyte (Límite táctico)

/**
 * INTERFAZ: SpeechToTextTranscriptionPayload
 * Contrato de transporte para el flujo binario de voz capturado por el hardware.
 */
interface SpeechToTextTranscriptionPayload {
  /** audioBinaryBase64Data: Datos crudos codificados para transporte seguro en JSON. */
  audioBinaryBase64Data: string; 
  /** mediaMimeTypeHeader: Identificador de formato (ej. audio/webm; codecs=opus). */
  mediaMimeTypeHeader: string; 
}

/**
 * SpeechToTextMaster: El Centinela de Transmutación Acústica de NicePod.
 */
serve(async (request: Request) => {
  // 1. GESTIÓN DE PROTOCOLO DE INTERCAMBIO (CORS Preflight)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const processingCorrelationIdentification = crypto.randomUUID();
  console.info(`🎙️ [SpeechToTextMaster][${processingCorrelationIdentification}] Iniciando transmutación de dictado.`);

  try {
    // 2. VALIDACIÓN DE AUTORIDAD Y PROTOCOLO DE CONFIANZA
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader?.includes(SUPABASE_SERVICE_ROLE_SECRET_KEY ?? "INTERNAL_ZONE_ONLY")) {
      console.warn(`🛑 [SpeechToTextMaster][${processingCorrelationIdentification}] Intento de acceso no autorizado denegado.`);
      return new Response(JSON.stringify({ error: "UNAUTHORIZED_TRANSCRIPTION_REQUEST_ACCESS" }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (!GOOGLE_INTELLIGENCE_AGENCY_APPLICATION_PROGRAMMING_INTERFACE_KEY) {
      throw new Error("INFRASTRUCTURE_EXCEPTION: GOOGLE_AI_API_KEY_MISSING");
    }

    // 3. DESEMPAQUETADO DEL EXPEDIENTE ACÚSTICO
    const transcriptionPayload: SpeechToTextTranscriptionPayload = await request.json();
    const { audioBinaryBase64Data, mediaMimeTypeHeader } = transcriptionPayload;

    if (!audioBinaryBase64Data) {
      throw new Error("EMPTY_AUDIO_BUFFER_EXCEPTION: El canal de voz no contiene datos binarios.");
    }

    /**
     * 4. CONTROL DE DENSIDAD ACÚSTICA (HARDWARE HYGIENE)
     * Misión: Validar el peso del binario antes de la ignición del motor de IA.
     */
    const estimatedByteSizeMagnitude = (audioBinaryBase64Data.length * 3) / 4;
    if (estimatedByteSizeMagnitude > MAXIMUM_PERMITTED_ACOUSTIC_DENSITY_BYTES) {
      throw new Error(`ACOUSTIC_DENSITY_EXCEEDED: El dictado supera el límite de seguridad de 1MB.`);
    }

    /**
     * 5. INGENIERÍA DE PROMPT: EL ESCRIBA URBANO DE MADRID RESONANCE
     * Misión: Limpiar la semántica humana preservando el rigor técnico del hito.
     */
    const escribaIndustrialSystemInstruction = `
      Actúa como el Escriba Oficial de la terminal de inteligencia NicePod. 
      Tu misión es transmutar audio capturado en el entorno urbano en capital intelectual textual purificado.
      
      PROTOCOLO DE EDICIÓN PERICIAL:
      1. SANEAMIENTO: Elimina muletillas, repeticiones, titubeos y ruidos ambientales (ej. eh, mmm, bueno, estooo).
      2. RIGOR NOMINAL: Preserva con exactitud nombres de calles, monumentos, coordenadas y términos arquitectónicos de Madrid.
      3. ESTRUCTURA: Genera oraciones con puntuación gramatical técnica para asegurar la legibilidad del peritaje.
      4. SALIDA PURA: Devuelve única y exclusivamente el texto transcrito. Prohibido añadir preámbulos, despedidas o comentarios.
    `;

    /**
     * 6. INVOCACIÓN AL MOTOR MULTIMODAL LITE (GEMINI FLASH LITE)
     * Misión: Obtener respuesta instantánea en el Borde mediante el modelo de baja latencia.
     */
    console.info(`   > Transmitiendo binarios al motor LITE: ${AI_MODELS.LITE}...`);

    const intelligenceAgencyResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.LITE}:generateContent?key=${GOOGLE_INTELLIGENCE_AGENCY_APPLICATION_PROGRAMMING_INTERFACE_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: escribaIndustrialSystemInstruction },
              {
                inline_data: {
                  // Limpieza del encabezado MIME para sintonía con la API de Google
                  mime_type: mediaMimeTypeHeader.split(';')[0], 
                  data: audioBinaryBase64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1, // Fidelidad técnica máxima al audio original
            topP: 0.95,
            topK: 40
          }
        })
      }
    );

    if (!intelligenceAgencyResponse.ok) {
      const exceptionResponseText = await intelligenceAgencyResponse.text();
      throw new Error(`AI_GATEWAY_COMMUNICATION_FAILURE [${intelligenceAgencyResponse.status}]: ${exceptionResponseText}`);
    }

    const intelligenceAgencyResponseData = await intelligenceAgencyResponse.json();
    const transcriptionResultText = intelligenceAgencyResponseData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!transcriptionResultText) {
      throw new Error("ORACLE_SILENCE_EXCEPTION: El motor de inteligencia no pudo decodificar el flujo acústico.");
    }

    console.info(`✅ [SpeechToTextMaster][${processingCorrelationIdentification}] Transmuta completada exitosamente.`);

    // 7. RESPUESTA SOBERANA A LA TERMINAL DE FORJA
    return new Response(JSON.stringify({
      success: true,
      transcriptionText: transcriptionResultText,
      processingCorrelationIdentification: processingCorrelationIdentification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (operationalHardwareException: unknown) {
    const exceptionMessageText = operationalHardwareException instanceof Error 
      ? operationalHardwareException.message 
      : String(operationalHardwareException);

    console.error(`🔥 [SpeechToTextMaster-Fatal][${processingCorrelationIdentification}]:`, exceptionMessageText);

    return new Response(JSON.stringify({
      success: false,
      error: exceptionMessageText,
      processingCorrelationIdentification: processingCorrelationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Zero Abbreviations Policy (ZAP): Purificación nominal absoluta de todas las variables 
 *    locales y constantes de entorno (estimatedByteSizeMagnitude, writeString -> no aplica aquí, 
 *    transcriptionResultText, etc.).
 * 2. Hardware Hygiene: La validación de densidad acústica protege el presupuesto de RAM 
 *    del nodo de ejecución, evitando colapsos ante ráfagas de datos masivas.
 * 3. Contractual Symmetry: Sincronización total con 'use-forge-orchestrator' V8.0 y 
 *    la Constitución de Soberanía V8.6, utilizando el campo 'transcriptionText'.
 */