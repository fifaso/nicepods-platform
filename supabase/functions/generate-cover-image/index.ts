// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 23.0 (Master Image Architect - High-Performance & Full Metadata Sync)
// Misión: Forjar la identidad visual del podcast utilizando el 100% del contexto creativo.
// [ESTABILIZACIÓN]: Integración nativa con Gemini 2.5 Flash Image y protocolo Zero-Wait.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * IMPORTACIONES DEL NÚCLEO SINCRO (v12.0)
 * Sincronizamos con el motor compartido para el uso de Gemini API.
 */
import {
  AI_MODELS,
  buildPrompt,
  callGeminiImage,
  cleanTextForSpeech
} from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CONFIGURACIÓN DE ACTIVOS SOBERANOS
 * PLACEHOLDER_COVER_URL: Backup visual oficial de NicePod.
 */
const PLACEHOLDER_COVER_URL = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/static/placeholder-logo.png";

/**
 * INICIALIZACIÓN DE CLIENTE SUPABASE ADMIN
 * Mantenemos la instancia persistente para optimizar los tiempos de ejecución.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScriptContent: Recupera la esencia del guion para la interpretación visual.
 */
function extractScriptContent(script_text: any): string {
  if (!script_text) return "";
  // Priorizamos script_plain para evitar que caracteres de control ensucien el prompt de imagen.
  if (typeof script_text === 'object') {
    return script_text.script_plain || script_text.script_body || "";
  }
  try {
    const parsed = typeof script_text === 'string' ? JSON.parse(script_text) : script_text;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(script_text);
  }
}

/**
 * handler: Lógica central de forja visual.
 */
async function handler(request: Request): Promise<Response> {
  // 1. GESTIÓN DE PROTOCOLO DE CONECTIVIDAD (CORS)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 2. VALIDACIÓN DE SEGURIDAD LITE (Internal Service Authorization)
    // Verificamos que la llamada provenga de nuestra propia base de datos o sistema.
    const authHeader = request.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!authHeader?.includes(serviceKey ?? "SECURED")) {
      console.warn(`🛑 [Security] Intento de acceso visual no autorizado.`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 3. RECEPCIÓN DE SOLICITUD
    const payload = await request.json();
    const { podcast_id, agent_name = "cover-art-director-v1" } = payload;

    if (!podcast_id) throw new Error("PODCAST_ID_REQUIRED");
    targetPodId = podcast_id;

    console.log(`🎨 [Image-Worker][${correlationId}] Iniciando forja visual para Pod #${podcast_id}`);

    // 4. CAPTURA DE METADATA CREATIVA (Sincronía 360°)
    // Obtenemos los datos del podcast y el template del agente de arte simultáneamente.
    const [podRes, agentRes] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('*').eq('id', podcast_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agent_name).single()
    ]);

    if (podRes.error || !podRes.data) throw new Error("PODCAST_NOT_FOUND");
    if (!agentRes.data) throw new Error("ART_AGENT_NOT_CONFIGURED_IN_VAULT");

    const pod = podRes.data;
    const creationData = pod.creation_data as any;

    // 5. CONSTRUCCIÓN DEL PROMPT DE ALTA FIDELIDAD
    // Destilamos el guion y extraemos los parámetros de intención del usuario.
    const rawScript = extractScriptContent(pod.script_text);
    const summary = cleanTextForSpeech(rawScript).substring(0, 600);

    const contextParams = {
      title: pod.title,
      script_summary: summary,
      purpose: creationData?.purpose || "knowledge",
      tone: creationData?.selectedTone || "professional",
      narrative_lens: creationData?.narrative_lens || "analytical",
      style: creationData?.style || "solo"
    };

    const visualPrompt = buildPrompt(agentRes.data.prompt_template, contextParams);

    let finalImageUrl = PLACEHOLDER_COVER_URL;
    let imageWasGenerated = false;

    // 6. SÍNTESIS VISUAL NATIVA (Gemini 2.5 Flash Image)
    try {
      console.log(`🧠 [Image-Worker] Invocando motor: ${AI_MODELS.IMAGE}`);

      // La función callGeminiImage (v12.0) gestiona el protocolo nativo de Gemini API.
      const { data: base64Image } = await callGeminiImage(visualPrompt);

      if (base64Image) {
        // 7. PERSISTENCIA BINARIA EN LA BÓVEDA DE ACTIVOS
        // Convertimos el flujo Base64 a un buffer de bytes para el Storage.
        const imageBuffer = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0));
        const filePath = `public/${pod.user_id}/${podcast_id}-cover.jpg`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('podcasts')
          .upload(filePath, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
            cacheControl: '3600'
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabaseAdmin.storage.from('podcasts').getPublicUrl(filePath);
          finalImageUrl = publicUrl;
          imageWasGenerated = true;
        }
      }
    } catch (generationError: any) {
      console.warn(`⚠️ [Image-Worker] Fallo en motor Gemini Image: ${generationError.message}`);
    }

    // 8. CIERRE DE CICLO Y ACTUALIZACIÓN DE ESTADO
    // CRÍTICO: Siempre marcamos image_ready = true para que el trigger de integridad libere el podcast.
    const { error: updateErr } = await supabaseAdmin
      .from('micro_pods')
      .update({
        cover_image_url: finalImageUrl,
        image_ready: true,
        admin_notes: imageWasGenerated ? null : `Fallback visual: ${correlationId}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

    if (updateErr) throw new Error(`DB_FINAL_SYNC_ERROR: ${updateErr.message}`);

    console.log(`✅ [Image-Worker] Ciclo terminado. Pod #${podcast_id}. Generado: ${imageWasGenerated}`);

    return new Response(JSON.stringify({
      success: true,
      url: finalImageUrl,
      generated: imageWasGenerated,
      trace_id: correlationId
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Image-Worker-Fatal][${correlationId}]:`, error.message);

    /**
     * [RESILIENCIA DE SEMÁFORO]:
     * En caso de error crítico, liberamos la bandera de imagen para permitir 
     * que el usuario acceda al menos al audio del podcast.
     */
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        image_ready: true,
        admin_notes: `Critical Art Failure: ${error.message} | ID: ${correlationId}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({
      error: error.message,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// Inicialización del servidor Edge sin wrapper pesado.
serve(handler);