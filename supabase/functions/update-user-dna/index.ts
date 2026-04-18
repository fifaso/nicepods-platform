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

/**
 * executeUserDnaSynthesisHandler:
 * Misión: Sintetizar la narrativa del usuario en un vector semántico (DNA) con integridad nominal.
 */
const executeUserDnaSynthesisHandler = async (request: Request, context: GuardContext): Promise<Response> => {
  const correlationIdentification = context.correlationIdentification;

  try {
    const dnaSynthesisPayload = await request.json();
    const {
      profile_text: profileNarrativeText,
      expertise_level: userExpertiseLevelMagnitude,
      negative_interests: noiseInterestsCollection
    } = dnaSynthesisPayload;

    // 1. PROTOCOLO DE IDENTIDAD (DIS DOCTRINE)
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) throw new Error("AUTORIZACION_REQUERIDA: No se detectó token de acceso.");

    const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseAdmin.auth.getUser(authorizationHeader.replace("Bearer ", ""));

    if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
      throw new Error("SESION_INVALIDA: La identidad del Voyager no pudo ser verificada.");
    }

    const authenticatedUserIdentification = authenticatedUserSnapshot.id;

    console.info(`[DNA-Engine][${correlationIdentification}] Sintetizando perfil semántico para: ${authenticatedUserIdentification}`);

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
    const { error: upsertDatabaseExceptionInformation } = await supabaseAdmin
      .from('user_interest_dna')
      .upsert({
        user_id: authenticatedUserIdentification,
        dna_vector: mastersDnaVector as unknown as string, // Cast necessary as generated vector is number[] but DB expects string/vector
        professional_profile: profileNarrativeText,
        negative_interests: noiseInterestsCollection || [],
        expertise_level: userExpertiseLevelMagnitude || 5,
        last_updated: new Date().toISOString()
      });

    if (upsertDatabaseExceptionInformation) throw new Error(`DB_UPSERT_FAIL: ${upsertDatabaseExceptionInformation.message}`);

    return new Response(JSON.stringify({
      success: true,
      message: "ADN Cognitivo actualizado correctamente.",
      trace_identification: correlationIdentification
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido en síntesis de ADN";
    console.error(`🔥 [DNA-Update-Fatal][${correlationIdentification}]:`, exceptionMessageInformationText);

    return new Response(JSON.stringify({
      error: exceptionMessageInformationText,
      trace_identification: correlationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

serve(guard(executeUserDnaSynthesisHandler));
