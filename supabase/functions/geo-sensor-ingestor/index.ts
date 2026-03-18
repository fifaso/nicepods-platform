// supabase/functions/geo-sensor-ingestor/index.ts
// VERSIÓN: 2.2 (NicePod Sovereign Ingestor - Stack-Safe Edition)
// [ESTABILIZACIÓN]: Solución definitiva al error 'Maximum call stack size exceeded'.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL ?? "", SERVICE_ROLE_KEY ?? "");

interface IngestorPayload {
  heroImage: string;
  ocrImages?: string[];
  adminIntent: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  categoryId: string;
  userId: string;
}

/**
 * arrayBufferToBase64:
 * [FIX CRÍTICO]: Convierte binarios a base64 de forma segmentada para evitar
 * el error 'Maximum call stack size exceeded'.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const len = bytes.byteLength;
  const chunk_size = 8192; // Procesamos en bloques de 8KB

  for (let i = 0; i < len; i += chunk_size) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunk_size) as unknown as number[]
    );
  }
  return btoa(binary);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const correlationId = crypto.randomUUID();
  console.info(`🧠 [Sensor-Ingestor][${correlationId}] Iniciando peritaje visual stack-safe.`);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(SERVICE_ROLE_KEY ?? "")) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers: corsHeaders });
    }

    const payload: IngestorPayload = await req.json();
    const { heroImage, ocrImages = [], adminIntent, latitude, longitude, accuracy, categoryId, userId } = payload;

    if (!heroImage || !latitude || !longitude || !userId) {
      throw new Error("INCOMPLETE_DOSSIER");
    }

    // 1. Descarga y conversión SEGURA de imágenes
    const downloadImage = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`STORAGE_FAIL: ${res.status}`);
      const buffer = await res.arrayBuffer();
      // Usamos el nuevo conversor segmentado
      return arrayBufferToBase64(buffer);
    };

    console.info(`   > Procesando binarios...`);
    const [heroBase64, ...ocrBase64Array] = await Promise.all([
      downloadImage(heroImage),
      ...ocrImages.map(url => downloadImage(url))
    ]);

    // 2. Preparación del Prompt Multimodal
    const systemPrompt = `Analiza este hito de Madrid. Hero: Principal. OCR: Detalles. Intención: "${adminIntent}". Devuelve JSON: officialName, architectureStyle, historicalDossier, atmosphere, detectedElements, confidenceScore.`;

    const parts = [
      { text: systemPrompt },
      { inline_data: { mime_type: "image/jpeg", data: heroBase64 } }
    ];

    ocrBase64Array.forEach(data => {
      parts.push({ inline_data: { mime_type: "image/jpeg", data } });
    });

    // 3. Invocación a Gemini 3.0 Flash Preview
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.PRO}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.15, response_mime_type: "application/json" }
        })
      }
    );

    const aiData = await googleResponse.json();
    const analysis = parseAIJson<any>(aiData.candidates[0].content.parts[0].text);

    // 4. Inserción en el Metal
    const { data: poi, error: poiError } = await supabaseAdmin
      .from('points_of_interest')
      .insert({
        author_id: userId,
        name: analysis.officialName,
        category_id: categoryId,
        geo_location: `POINT(${longitude} ${latitude})`,
        status: 'ingested',
        gallery_urls: [heroImage, ...ocrImages]
      })
      .select('id')
      .single();

    if (poiError) throw poiError;

    await supabaseAdmin.from('poi_ingestion_buffer').insert({
      poi_id: poi.id,
      raw_ocr_text: analysis.historicalDossier,
      visual_analysis_dossier: analysis,
      sensor_accuracy: accuracy
    });

    return new Response(JSON.stringify({ success: true, data: { poiId: poi.id, analysis } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error(`🔥 [Sensor-Ingestor-Fatal]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});