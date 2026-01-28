// supabase/functions/geo-suite/generate-geo-content/index.ts
// Misión: Alquimia. Convertir datos y clima en un guion inmersivo.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MadridAIClient } from "../geo-shared/gemini-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const ai = new MadridAIClient(Deno.env.get('GOOGLE_AI_API_KEY') ?? '');

    const { draft_id, classification } = await req.json();

    // 1. Datos Completos
    const { data: draft } = await supabase
      .from('geo_drafts_staging')
      .select('*')
      .eq('id', draft_id)
      .single();

    // 2. Prompt del "Genius Loci" (Espíritu del Lugar)
    const weather = draft.weather_snapshot;
    const weatherPrompt = weather.condition.toLowerCase().includes('rain')
      ? "Está lloviendo. Usa un tono melancólico e íntimo. Menciona el sonido del agua."
      : "Hace sol. Usa un tono vibrante y energético. Invita a mirar los detalles.";

    const systemPrompt = `
      Eres la voz de Madrid. Escribes guiones para cápsulas de audio de Realidad Aumentada.
      
      TU OBJETIVO:
      Crear una narración inmersiva de 60-90 segundos para que el usuario la escuche MIENTRAS está parado en el lugar.
      
      ESTILO:
      - Segunda persona ("Estás parado frente a...", "Mira hacia arriba...").
      - Sensorial: Describe olores, luces y sonidos basados en el clima actual.
      - ${weatherPrompt}
      - Tipo de contenido: ${classification} (Ajusta el rigor histórico según esto).
      
      DATOS DEL ENTORNO:
      Lugar: ${draft.detected_place_id}
      Usuario intentó decir: "${draft.rejection_reason || 'Algo sobre este lugar'}" (Úsalo como inspiración pero elévalo).
      
      SALIDA:
      Un guion listo para ser leído por un TTS (Text-to-Speech). Sin acotaciones de director, solo el texto hablado.
    `;

    // 3. Generación
    const script = await ai.generate(systemPrompt, "Genera el guion ahora.", undefined, false);

    // 4. Guardar resultado final en el borrador, listo para que el usuario grabe o use TTS
    // Nota: Aquí podrías guardar también en 'geo_drafts_staging' una columna 'final_script'
    // Para este MVP, devolvemos el texto directamente al frontend.

    return new Response(JSON.stringify({
      success: true,
      script: script.text,
      vibe: weather.condition
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});