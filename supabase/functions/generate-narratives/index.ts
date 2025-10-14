// supabase/functions/generate-narratives/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const NarrativesPayloadSchema = z.object({
  topicA: z.string().min(2, "El Tema A debe tener al menos 2 caracteres."),
  topicB: z.string().min(2, "El Tema B debe tener al menos 2 caracteres."),
  catalyst: z.string().optional(),
});

const parseJsonResponse = (text: string) => {
  const jsonMatch = text.match(/```json([\s\S]*?)```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error("La respuesta de la IA no tenía el formato JSON esperado.");
  }
  try { return JSON.parse(jsonMatch[1]); }
  catch { throw new Error("No se pudo parsear el bloque JSON de la respuesta de la IA."); }
};

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) throw new Error("Cabecera de autorización requerida.");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("La clave GOOGLE_AI_API_KEY no está configurada como secreto en el proyecto.");

    const payload = await request.json();
    const { topicA, topicB, catalyst } = NarrativesPayloadSchema.parse(payload);
    
    const prompt = `Eres un experto guionista...`; // (Contenido del prompt omitido por brevedad)

    const aiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
    
    const aiResponse = await fetch(aiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("Error de la API de Google AI:", errorBody);
      throw new Error(`La API de Google AI falló con el estado ${aiResponse.status}.`);
    }
    
    const aiResult = await aiResponse.json();
    if (!aiResult.candidates || !aiResult.candidates[0]?.content?.parts[0]?.text) {
      throw new Error("La respuesta de la API de Google AI no tiene la estructura esperada.");
    }

    const generatedText = aiResult.candidates[0].content.parts[0].text;
    const jsonResponse = parseJsonResponse(generatedText);

    return new Response(JSON.stringify(jsonResponse), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    if (error instanceof ZodError) return new Response(JSON.stringify({ error: "Payload inválido.", issues: error.issues }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error en generate-narratives: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});