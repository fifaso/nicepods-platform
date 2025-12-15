// supabase/functions/generate-narratives/index.ts
// VERSIÓN: 2.0 (Guard Integrated: Sentry + Arcjet + Creative Flow Optimized)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { guard } from "../_shared/guard.ts"; // <--- INTEGRACIÓN DEL ESTÁNDAR
import { corsHeaders } from "../_shared/cors.ts";

// Validación de Entrada
const NarrativesPayloadSchema = z.object({
  topicA: z.string().min(2, "El Tema A es muy corto."),
  topicB: z.string().min(2, "El Tema B es muy corto."),
});

// Utilidad de Parseo Resiliente
const parseJsonResponse = (text: string) => {
  const jsonMatch = text.match(/```json([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    try { return JSON.parse(jsonMatch[1]); } catch (e) {}
  }
  // Intento de extracción por llaves si falla el regex
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
     try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch (e) {}
  }
  throw new Error("La respuesta de la IA no es un JSON válido.");
};

// --- LÓGICA DE NEGOCIO (HANDLER) ---
const handler = async (request: Request): Promise<Response> => {
  // El Guard maneja OPTIONS y CORS automáticamente

  try {
    // 1. AUTH
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta autorización.");
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Usuario no autenticado.");

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    
    // 2. INPUTS & VALIDATION
    const payload = await request.json();
    const { topicA, topicB } = NarrativesPayloadSchema.parse(payload);
    
    // Prompt optimizado para creatividad lateral
    const prompt = `Eres un experto en pensamiento lateral y síntesis creativa.
Tu misión es encontrar 3 conexiones narrativas fascinantes, inesperadas o profundas entre dos conceptos aparentemente dispares.

CONCEPTOS:
A: "${topicA}"
B: "${topicB}"

INSTRUCCIONES:
1. No busques lo obvio. Busca la intersección filosófica, histórica o metafórica.
2. Genera 3 ángulos distintos (Narrativas).
3. Cada narrativa debe tener un Título atractivo y una Tesis clara.

FORMATO DE SALIDA (JSON ÚNICAMENTE):
\`\`\`json
{
  "narratives": [
    { "title": "Título 1", "thesis": "Explicación breve de la conexión." },
    { "title": "Título 2", "thesis": "Explicación breve." },
    { "title": "Título 3", "thesis": "Explicación breve." }
  ]
}
\`\`\``;

    // 3. IA (Gemini Flash para velocidad en flujo creativo)
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!aiResponse.ok) throw new Error(`Error Google AI: ${await aiResponse.text()}`);
    
    const aiResult = await aiResponse.json();
    const text = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("Respuesta vacía de la IA.");

    // 4. OUTPUT
    const json = parseJsonResponse(text);
    return new Response(JSON.stringify(json), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    // --- MANEJO DE ERRORES DE NEGOCIO ---
    // Atrapamos errores esperados para devolver códigos 4xx y NO reportar a Sentry
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";

    if (error instanceof ZodError) {
        return new Response(JSON.stringify({ error: errorMessage }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (errorMessage.includes("Usuario no autenticado") || errorMessage.includes("Falta autorización")) {
        return new Response(JSON.stringify({ error: errorMessage }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- ERRORES CRÍTICOS ---
    // Si no es ninguno de los anteriores, lanzamos el error hacia arriba.
    // El 'guard' lo atrapará, lo enviará a Sentry y devolverá un 500.
    throw error;
  }
};

// --- PUNTO DE ENTRADA PROTEGIDO ---
serve(guard(handler));