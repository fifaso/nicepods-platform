// supabase/functions/update-user-dna/index.ts
// VERSIÓN: 1.1 (DNA Synthesizer - Mapping User Interests to Latent Space)
// Misión: Sintetizar la narrativa del usuario en un vector semántico (DNA) y persistirlo.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, callGeminiMultimodal, generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";
import { Database } from "../../../types/database.types.ts";

const supabaseAdmin = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const handler = async (request: Request): Promise<Response> => {
  try {
    const {
      profile_text: profileNarrativeText,
      expertise_level: userExpertiseLevel,
      negative_interests: noiseInterestsCollection
    } = await request.json();

    // 1. OBTENER IDENTIDAD DEL USUARIO
    const authorizationHeader = request.headers.get('Authorization')!;
    const { data: { user: authenticatedUser }, error: authenticationError } = await supabaseAdmin.auth.getUser(authorizationHeader.replace("Bearer ", ""));

    if (authenticationError || !authenticatedUser) throw new Error("No autorizado.");

    console.log(`[DNA-Engine] Sintetizando perfil semántico para: ${authenticatedUser.id}`);

    // 2. ENRIQUECIMIENTO COGNITIVO (Gemini Flash)
    // Refinamos el texto del usuario para que el vector sea más preciso
    const refinementPrompt = `
      Analiza los siguientes intereses de un usuario y genera un párrafo técnico denso 
      que resuma su "Gravedad Semántica" profesional y personal para un sistema de búsqueda vectorial.
      INTERESES: ${profileNarrativeText}
    `;
    const refinedText = await callGeminiMultimodal(refinementPrompt, undefined, AI_MODELS.FLASH, 0.3);

    // 3. GENERACIÓN DEL VECTOR MAESTRO (ADN)
    const mastersDnaVector = await generateEmbedding(refinedText);

    // 4. PERSISTENCIA EN LA MATRIZ (METAL SYNC)
    // [METAL]: Se respetan estrictamente los nombres de columna de PostgreSQL (user_id, dna_vector, etc.)
    const { error: upsertProcessError } = await supabaseAdmin
      .from('user_interest_dna')
      .upsert({
        user_id: authenticatedUser.id,
        dna_vector: mastersDnaVector as unknown as string, // Cast necessary as generated vector is number[] but DB expects string/vector
        professional_profile: profileNarrativeText,
        negative_interests: noiseInterestsCollection || [],
        expertise_level: userExpertiseLevel || 5,
        last_updated: new Date().toISOString()
      });

    if (upsertProcessError) throw upsertProcessError;

    return new Response(JSON.stringify({
      success: true,
      message: "ADN Cognitivo actualizado correctamente."
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (caughtError: unknown) {
    const errorMessage = caughtError instanceof Error ? caughtError.message : "Error desconocido";
    console.error("🔥 [DNA-Update-Error]:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: corsHeaders
    });
  }
};

serve(guard(handler));
