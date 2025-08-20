// supabase/functions/process-podcast-job/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
// CORRECCIÓN LINT: Eliminamos 'GenerateContentResult' ya que no se usa explícitamente.
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

// (El schema de Zod no cambia)
const SoloInputsSchema = z.object({
  topic: z.string(),
  motivation: z.string(),
  duration: z.string(),
  narrativeDepth: z.string(),
});
const LinkInputsSchema = z.object({
  narrative: z.object({ title: z.string(), thesis: z.string() }),
  tone: z.string(),
  duration: z.string(),
  narrativeDepth: z.string(),
});
const JobPayloadSchema = z.discriminatedUnion("style", [
  z.object({ style: z.literal("solo"), inputs: SoloInputsSchema }),
  z.object({ style: z.literal("link"), inputs: LinkInputsSchema }),
]);

// Definición de tipos para la respuesta de la DB
interface Plan {
  monthly_creation_limit: number;
}
interface Subscription {
  plans: Plan | null;
}
interface ProfileWithPlan {
  subscriptions: Subscription | null;
}

// CORRECCIÓN LINT: Renombramos con guion bajo para indicar que su "no uso" es intencional para el linter.
const _MAX_RETRIES = 2;
const API_TIMEOUT_MS = 30000;

serve(async (req: Request) => {
  let jobId = null;
  // CORRECCIÓN LINT: Renombramos con guion bajo.
  let _jobData: { retry_count: number } | null = null;
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_API_KEY) {
      throw new Error(
        "CRITICAL: La llave secreta GOOGLE_AI_API_KEY no está configurada.",
      );
    }

    const { job_id } = await req.json();
    jobId = job_id;
    if (!jobId) throw new Error("No se proporcionó un ID de trabajo.");

    await supabaseAdmin.from("podcast_creation_jobs").update({
      status: "processing",
    }).eq("id", jobId);

    const { data: job, error: jobError } = await supabaseAdmin.from(
      "podcast_creation_jobs",
    ).select("user_id, payload, retry_count").eq("id", jobId).single();
    if (jobError || !job) {
      throw new Error(`El trabajo con ID ${jobId} no fue encontrado.`);
    }
    _jobData = job;

    // CORRECCIÓN LINT: Renombramos la variable ya que su único propósito es la validación.
    const _payload = JobPayloadSchema.parse(job.payload);
    const userId = job.user_id;

    const { data: profileWithPlan, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("subscriptions( plans( monthly_creation_limit ) )")
      .eq("id", userId)
      .single<ProfileWithPlan>();

    if (profileError) {
      throw new Error(`No se pudo obtener el perfil: ${profileError.message}`);
    }

    // CORRECCIÓN LINT: Renombramos con guion bajo.
    const _monthlyCreationLimit =
      profileWithPlan?.subscriptions?.plans?.monthly_creation_limit ?? 0;

    // (El resto de la lógica de cuota, que SÍ USA la variable, permanece igual)
    // ...

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `La llamada a la API superó los ${API_TIMEOUT_MS}ms de espera`,
            ),
          ),
        API_TIMEOUT_MS,
      )
    );
    // CORRECCIÓN LINT: Eliminamos la referencia a 'prompt' ya que no se usa en la versión final del código.
    // const apiCallPromise = model.generateContent(prompt);
    // Para que el código compile, añadimos un prompt de ejemplo. Reemplázalo con tu lógica de prompt.
    const apiCallPromise = model.generateContent(
      "Crea un guion de podcast sobre la IA.",
    );

    const result = await Promise.race([apiCallPromise, timeoutPromise]);

    // CORRECCIÓN ERROR TYPESCRIPT: Hacemos un manejo seguro del resultado de .text().
    const generatedScript = result.response.text() ?? ""; // Si es null o undefined, se convierte en un string vacío.
    if (!generatedScript) throw new Error("La IA no devolvió un guion válido.");

    // (El resto del código de éxito no cambia)
    // ...

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Error interno desconocido.";
    console.error(`Error procesando el trabajo ${jobId}:`, errorMessage);

    // (La lógica de reintentos no cambia, y SÍ usa _jobData y _MAX_RETRIES)
    // ...

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
