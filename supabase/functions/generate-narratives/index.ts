// supabase/functions/generate-narratives/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"; // <--- CORRECCIÓN
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.11.3";
import { corsHeaders } from '@shared/cors.ts';

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
    
    const prompt = `Eres un experto guionista. Tu tarea es encontrar 3 conexiones narrativas únicas entre el Tema A y el Tema B, usando el Catalizador como lente. Para cada narrativa, proporciona un "title" y una "thesis". Responde únicamente en formato JSON dentro de un bloque de código markdown. La estructura debe ser: \`\`\`json\n{\n  "narratives": [\n    { "title": "...", "thesis": "..." },\n    { "title": "...", "thesis": "..." },\n    { "title": "...", "thesis": "..." }\n  ]\n}\n\`\`\`\n\nTema A: "${topicA}"\nTema B: "${topicB}"\nCatalizador: "${catalyst || 'ninguno'}"`;

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const jsonResponse = parseJsonResponse(result.response.text());

    return new Response(JSON.stringify(jsonResponse), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    if (error instanceof ZodError) return new Response(JSON.stringify({ error: "Payload inválido.", issues: error.issues }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error en generate-narratives: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});