// supabase/functions/update-user-dna/index.ts
// VERSIÓN: 1.0 (DNA Synthesizer - Mapping User Interests to Latent Space)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, callGeminiMultimodal, generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const handler = async (request: Request): Promise<Response> => {
  try {
    const { profile_text, expertise_level, negative_interests } = await request.json();

    // 1. OBTENER IDENTIDAD DEL USUARIO
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("No autorizado.");

    console.log(`[DNA-Engine] Sintetizando perfil semántico para: ${user.id}`);

    // 2. ENRIQUECIMIENTO COGNITIVO (Gemini Flash)
    // Refinamos el texto del usuario para que el vector sea más preciso
    const refinementPrompt = `
      Analiza los siguientes intereses de un usuario y genera un párrafo técnico denso 
      que resuma su "Gravedad Semántica" profesional y personal para un sistema de búsqueda vectorial.
      INTERESES: ${profile_text}
    `;
    const refinedText = await callGeminiMultimodal(refinementPrompt, undefined, AI_MODELS.FLASH, 0.3);

    // 3. GENERACIÓN DEL VECTOR MAESTRO (ADN)
    const dnaVector = await generateEmbedding(refinedText);

    // 4. PERSISTENCIA EN LA MATRIZ
    const { error: upsertError } = await supabaseAdmin
      .from('user_interest_dna')
      .upsert({
        user_id: user.id,
        dna_vector: dnaVector,
        professional_profile: profile_text,
        negative_interests: negative_interests || [],
        expertise_level: expertise_level || 5,
        last_updated: new Date().toISOString()
      });

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({
      success: true,
      message: "ADN Cognitivo actualizado correctamente."
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
};

serve(guard(handler));