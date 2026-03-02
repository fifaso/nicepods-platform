// supabase/functions/geo-ingest-context/index.ts
// VERSIÓN: 3.0

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de Inteligencia
import { AI_MODELS, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { guard } from "../_shared/guard.ts";

/**
 * INTERFAZ: GeoIngestPayload
 * Define el contrato de entrada masivo desde la Workstation del Administrador.
 */
interface GeoIngestPayload {
  heroImageBase64: string;      // Imagen estética del monumento/lugar
  ocrImageBase64?: string;      // (Opcional) Foto cercana de placa o texto
  ambientAudioUrl?: string;     // (Opcional) URL del audio subido previamente al Storage
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  intentText: string;           // La semilla curatorial del Administrador
  depth: string;                // Flash (45s), Crónica (2m), Inmersión (5m)
  tone: string;                 // Académico, Épico, Misterioso
  categoryId: string;           // Taxonomía (Historia, Arte, Naturaleza)
  resonanceRadius: number;      // El alcance físico del eco en metros
}

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  console.info(`🧠 [Geo-Analyst][${correlationId}] Iniciando procesamiento multimodal forense.`);

  try {
    // 1. DESEMPAQUETADO DE EVIDENCIA
    const payload: GeoIngestPayload = await request.json();

    if (!payload.heroImageBase64 || !payload.location || !payload.intentText) {
      throw new Error("EVIDENCIA_INSUFICIENTE: Se requiere imagen principal, coordenadas y semilla narrativa.");
    }

    let ocrExtractedText = "";

    // 2. FASE FORENSE (OCR Opcional)
    // Si el Admin adjuntó una foto de una placa, la procesamos primero para extraer la 'Verdad'.
    if (payload.ocrImageBase64) {
      console.info(`🔍 [Geo-Analyst][${correlationId}] Analizando placa/evidencia textual (OCR).`);
      const ocrPrompt = `Eres un experto transcriptor. Lee el texto de esta imagen (placa, cartel o monumento) y extráelo con precisión absoluta. 
      Ignora el ruido de fondo. Solo devuelve el texto transcrito.`;

      try {
        ocrExtractedText = await callGeminiMultimodal(ocrPrompt, payload.ocrImageBase64, AI_MODELS.FLASH, 0.1);
        console.info(`✅ [Geo-Analyst] OCR Exitoso: "${ocrExtractedText.substring(0, 50)}..."`);
      } catch (ocrError) {
        console.warn(`⚠️ [Geo-Analyst] Fallo en lectura OCR, procediendo sin evidencia de texto directo.`);
      }
    }

    // 3. FASE DE CONTEXTO VISUAL (HERO IMAGE)
    console.info(`📸 [Geo-Analyst][${correlationId}] Analizando entorno visual principal.`);

    const contextPrompt = `
      Actúa como un analista de inteligencia urbana de élite.
      Analiza esta fotografía de un entorno urbano o punto de interés.
      
      Evidencia adicional proporcionada por el curador: "${payload.intentText}"
      ${ocrExtractedText ? `Texto extraído de una placa en el lugar: "${ocrExtractedText}"` : ''}
      
      Debes devolver un análisis estructural riguroso que servirá de base para un guionista histórico.
      
      RESPONDE ÚNICA Y EXCLUSIVAMENTE CON ESTE FORMATO JSON EXACTO:
      {
        "isValid": true o false (false solo si la imagen es irreconocible, censurada o sin valor urbano),
        "rejectionReason": "Solo si isValid es false, explica por qué",
        "detectedArchitecture": "Estilo o materiales dominantes",
        "historicalContext": "Breve contexto histórico inferido a partir del texto y la imagen",
        "atmosphere": "Describe la iluminación, clima o sensación del lugar en esta foto"
      }
    `;

    const aiResponse = await callGeminiMultimodal(contextPrompt, payload.heroImageBase64, AI_MODELS.FLASH, 0.3);

    // Parseo Resiliente (Soporta bloques de código Markdown que Gemini suele añadir)
    const analysisData = parseAIJson<{
      isValid: boolean;
      rejectionReason?: string;
      detectedArchitecture: string;
      historicalContext: string;
      atmosphere: string;
    }>(aiResponse);

    // 4. PROTOCOLO DE RECHAZO SOBERANO
    if (!analysisData.isValid) {
      console.warn(`🛑 [Geo-Analyst][${correlationId}] Evidencia rechazada: ${analysisData.rejectionReason}`);
      return new Response(JSON.stringify({
        status: 'REJECTED',
        rejectionReason: analysisData.rejectionReason
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 5. CONSOLIDACIÓN DE DOSSIER Y GUARDADO EN STAGING (Borradores)
    console.info(`💾 [Geo-Analyst][${correlationId}] Evidencia validada. Sembrando en tabla de Borradores.`);

    // Identificamos al Admin a partir del token JWT de la petición
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) throw new Error("Fallo de Autorización en el Borde.");

    const dossierContext = {
      ...payload,
      ai_analysis: analysisData,
      ocr_text: ocrExtractedText,
      // Eliminamos el base64 masivo para no saturar el JSONB de la base de datos
      heroImageBase64: undefined,
      ocrImageBase64: undefined
    };

    const { data: draftRecord, error: draftError } = await supabaseAdmin
      .from('podcast_drafts')
      .insert({
        user_id: user.id,
        title: `Geo-Seed: ${payload.intentText.substring(0, 30)}...`,
        creation_data: {
          purpose: 'local_soul',
          agentName: 'Architect 38',
          creation_mode: 'situational',
          geo_dossier: dossierContext // Encapsulamos toda la evidencia táctica aquí
        },
        script_text: {}, // Vacío, a la espera de geo-generate-content
        status: 'researching'
      })
      .select('id')
      .single();

    if (draftError) throw new Error(`DB_DRAFT_FAIL: ${draftError.message}`);

    // 6. ENTREGA AL CLIENTE
    return new Response(JSON.stringify({
      status: 'ANALYZED',
      draftId: draftRecord.id,
      analysis: analysisData
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Geo-Analyst-Fatal][${correlationId}]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(handler));

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. OCR Concurrente: La capacidad de inyectar una foto de placa asegura 
 *    que Gemini no confunda el 'Palacio de Cristal' con un 'Invernadero Genérico'.
 *    El texto extraído se inyecta en el prompt maestro.
 * 2. Protección de Base de Datos: Retiramos los 'Base64' del objeto 'dossierContext'
 *    antes de guardarlo en PostgreSQL para evitar sobrecargar las filas de la tabla
 *    (que tienen un límite de compresión TOAST). Las imágenes se subirán al 
 *    Storage desde el cliente en paralelo.
 * 3. Aislamiento de Estados: El Worker no genera el guion. Solo 'analiza' y 
 *    crea el borrador. Esto permite a la UI mostrar el veredicto del escaneo 
 *    (Arquitectura detectada, etc.) antes de iniciar la forja final del audio.
 */