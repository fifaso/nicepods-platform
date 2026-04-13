// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 23.0 (Master Image Architect - Unified Gemini API Standard)
// Misión: Forjar la carátula artística del podcast utilizando el 100% del contexto creativo.
// [ESTABILIZACIÓN]: Integración nativa con Gemini 2.5 Flash Image y cierre de ciclo garantizado.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * IMPORTACIONES DEL NÚCLEO SINCRO (v13.0)
 * Utilizamos callGeminiImage para la síntesis visual nativa sin Vertex AI.
 */
import {
  AI_MODELS,
  buildPrompt,
  callGeminiImage,
  cleanTextForSpeech
} from "@/supabase/functions/_shared/ai.ts";
import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";

/**
 * CONFIGURACIÓN DE ACTIVOS SOBERANOS
 * PLACEHOLDER_COVER_URL: Backup visual oficial de NicePod en caso de fallo del motor.
 */
const PLACEHOLDER_COVER_URL = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/static/placeholder-logo.png";

/**
 * INICIALIZACIÓN DE CLIENTE SUPABASE ADMIN
 * Persistente en el contexto de ejecución para optimizar la latencia del Edge.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScript: Normaliza la entrada del guion gestionando el formato JSONB.
 * Prioriza la versión limpia (script_plain) para evitar ruidos de Markdown en el prompt visual.
 */
function extractScript(input: any): string {
  if (!input) return "";
  if (typeof input === 'object' && input !== null) {
    return input.script_plain || input.script_body || "";
  }
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(input);
  }
}

/**
 * handler: Orquestador central de la dirección de arte visual.
 */
async function handler(request: Request): Promise<Response> {
  // 1. GESTIÓN DE PROTOCOLO CORS (Bypass rápido para pre-vuelo)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationIdentification = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 2. VALIDACIÓN DE SEGURIDAD LITE (Internal Service Authorization)
    // Verificamos que la petición provenga de nuestra infraestructura soberana.
    const authHeader = request.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!authHeader?.includes(serviceKey ?? "SECURED_ENVIRONMENT")) {
      console.warn(`🛑 [Security] Intento de acceso visual no autorizado bloqueado.`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 3. RECEPCIÓN DE SOLICITUD
    const payload = await request.json();
    const { podcast_id, agent_name = "cover-art-director-v1" } = payload;

    if (!podcast_id) throw new Error("PODCAST_ID_REQUIRED");
    targetPodId = podcast_id;

    console.log(`🎨 [Image-Worker][${correlationIdentification}] Iniciando forja visual para Pod #${podcast_id}`);

    // 4. CAPTURA DE CONTEXTO CREATIVO (Sincronía 360°)
    // Obtenemos los datos del podcast y las instrucciones del agente de arte simultáneamente.
    const [podRes, agentRes] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('*').eq('id', podcast_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agent_name).single()
    ]);

    if (podRes.error || !podRes.data) throw new Error("PODCAST_DATA_NOT_FOUND");
    if (!agentRes.data) throw new Error("ART_AGENT_NOT_CONFIGURED");

    const pod = podRes.data;
    const creationData = pod.creation_data as unknown as Record<string, unknown>;

    // 5. DESTILACIÓN DEL PROMPT DE ALTA FIDELIDAD
    // Extraemos la esencia y los metadatos para un arte visual coherente.
    const rawScript = extractScript(pod.script_text);
    // Limitamos a 600 caracteres para un resumen denso pero procesable.
    const summary = cleanTextForSpeech(rawScript).substring(0, 600);

    const contextParams = {
      title: pod.title,
      script_summary: summary,
      purpose: creationData?.purpose || "knowledge",
      tone: creationData?.selectedTone || "professional",
      narrative_lens: creationData?.narrative_lens || "analytical"
    };

    const visualPrompt = buildPrompt(agentRes.data.prompt_template, contextParams);

    let finalImageUrl = PLACEHOLDER_COVER_URL;
    let imageWasGenerated = false;

    // 6. SÍNTESIS VISUAL NATIVA (Gemini 2.5 Flash Image)
    try {
      console.log(`🧠 [Image-Worker] Invocando motor: ${AI_MODELS.IMAGE}`);

      // La función callGeminiImage (v13.0) gestiona el protocolo nativo de Gemini API.
      const { data: base64Image } = await callGeminiImage(visualPrompt);

      if (base64Image) {
        // 7. PERSISTENCIA BINARIA EN STORAGE SOBERANO
        // Transformamos la respuesta en un buffer de bytes para la Bóveda de Activos.
        const imageBuffer = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0));
        const filePath = `public/${pod.user_id}/${podcast_id}-cover.jpg`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('podcasts')
          .upload(filePath, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
          finalImageUrl = publicUrl;
          imageWasGenerated = true;
        }
      }
    } catch (generationError: any) {
      console.warn(`⚠️ [Image-Worker] Fallo en motor Gemini Image (Posible restricción): ${generationError.message}`);
    }

    // 8. CIERRE DE CICLO Y ACTUALIZACIÓN DE ESTADO
    // CRÍTICO: Siempre marcamos image_ready = true para liberar el semáforo tr_check_integrity.
    await supabaseAdmin
      .from('micro_pods')
      .update({
        cover_image_url: finalImageUrl,
        image_ready: true,
        admin_notes: imageWasGenerated ? null : `Respaldo visual activado por incidente en IA. ID: ${correlationIdentification}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    console.log(`✅ [Image-Worker] Ciclo finalizado para Pod #${podcast_id}. Generado: ${imageWasGenerated}`);

    return new Response(JSON.stringify({
      success: true,
      uniformResourceLocator: finalImageUrl,
      generated: imageWasGenerated,
      trace_identification: correlationIdentification
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Image-Worker-Fatal][${correlationIdentification}]:`, error.message);

    // [RESILIENCIA FINAL]: Garantizamos que el podcast no quede en loop eterno.
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        image_ready: true,
        admin_notes: `Critical Art Failure: ${error.message} | ID: ${correlationIdentification}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({
      error: error.message,
      trace_identification: correlationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// Inicialización del servidor HTTP sin overhead.
serve(handler);