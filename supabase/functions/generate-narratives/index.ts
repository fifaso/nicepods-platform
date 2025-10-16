// supabase/functions/generate-narratives/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL (CORREGIDA Y COMPLETA)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z, ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const NarrativesPayloadSchema = z.object({
  topicA: z.string().min(2, "El Tema A debe tener al menos 2 caracteres."),
  topicB: z.string().min(2, "El Tema B debe tener al menos 2 caracteres."),
  catalyst: z.string().optional(),
});

// Función de parsing "multi-etapa" para máxima robustez.
const parseJsonResponse = (text: string) => {
  // Etapa 1: Intentar encontrar un bloque de código JSON.
  const jsonMatch = text.match(/```json([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (error) {
      console.error("Error al parsear el bloque JSON encontrado:", error);
      // Si el bloque JSON está malformado, dejamos que el proceso falle más adelante.
    }
  }

  // Etapa 2: Si no se encuentra un bloque, intentar parsear el texto completo.
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("El texto completo no es un JSON válido:", error);
    // Si todo falla, lanzamos un error claro y definitivo.
    throw new Error("La respuesta de la IA no contenía un formato JSON reconocible.");
  }
};

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. AUTENTICACIÓN: Robusta y sin cambios.
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

    // 2. VALIDACIÓN DE ENTRADA: Robusta y sin cambios.
    const payload = await request.json();
    const { topicA, topicB, catalyst } = NarrativesPayloadSchema.parse(payload);
    
    // Prompt "blindado" para forzar el formato de salida.
    const prompt = `Eres un experto guionista y pensador de sistemas. Tu única tarea es encontrar 3 conexiones narrativas únicas y provocadoras entre el Tema A y el Tema B, utilizando el Catalizador como lente creativa.

### CONTRATO DE SALIDA OBLIGATORIO ###
Tu única respuesta debe ser un objeto JSON válido, sin texto introductorio, explicaciones o markdown. La estructura exacta debe ser:
\`\`\`json
{
  "narratives": [
    { "title": "Un título corto y magnético para la primera narrativa.", "thesis": "Una frase concisa que resuma la idea central de esta conexión." },
    { "title": "Título para la segunda narrativa.", "thesis": "Tesis para la segunda conexión." },
    { "title": "Título para la tercera narrativa.", "thesis": "Tesis para la tercera conexión." }
  ]
}
\`\`\`

### DATOS DE ENTRADA ###
- Tema A: "${topicA}"
- Tema B: "${topicB}"
- Catalizador Creativo: "${catalyst || 'ninguno'}"

### DIRECTIVAS ###
1.  **Originalidad:** Las 3 narrativas deben ser distintas y ofrecer perspectivas únicas.
2.  **Claridad:** Cada 'thesis' debe ser una idea clara y potente.
3.  **Formato:** Cumple estrictamente el contrato de salida JSON. Tu respuesta completa debe ser únicamente el bloque de código JSON.`;

    // Validación "pre-vuelo" del prompt.
    if (!prompt || prompt.trim() === "") {
      throw new Error("El prompt generado está vacío, no se puede llamar a la IA.");
    }

    // 3. LLAMADA A LA IA: Robusta y sin cambios estructurales.
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

    // Se corrige la sintaxis de encadenamiento opcional y la lógica de acceso a los datos.
    if (!aiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("La respuesta de la API de Google AI no tiene la estructura esperada.");
    }

    const generatedText = aiResult.candidates[0].content.parts[0].text;
    
    // 4. PARSING DE RESPUESTA: Utiliza la función robusta "multi-etapa".
    const jsonResponse = parseJsonResponse(generatedText);

    return new Response(JSON.stringify(jsonResponse), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    // 5. MANEJO DE ERRORES: Robusto y sin cambios.
    if (error instanceof ZodError) return new Response(JSON.stringify({ error: "Payload inválido.", issues: error.issues }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const errorMessage = error instanceof Error ? error.message : "Error interno desconocido.";
    console.error(`Error en generate-narratives: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});