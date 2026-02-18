// supabase/functions/generate-cover-image/index.ts
// VERSIÓN: 22.0 (Master Image Architect - Gemini API Standard)
// Misión: Forja de identidad visual mediante Imagen 3 con validación de seguridad de bajo impacto.
// [OPTIMIZACIÓN]: Eliminación de dependencia de Vertex AI y bypass de Guard para salvar CPU.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de inteligencia NicePod sincronizado (v11.9)
import { buildPrompt, callGeminiImage, cleanTextForSpeech } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CONFIGURACIÓN DE ACTIVOS SOBERANOS
 */
const PLACEHOLDER_COVER_URL = "https://arbojlknwilqcszuqope.supabase.co/storage/v1/object/public/podcasts/static/placeholder-logo.png";

/**
 * CLIENTE SUPABASE ADMIN: Reutilizado entre ejecuciones para optimizar latencia.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScript: Normaliza la entrada del guion para el contexto visual.
 */
function extractScript(input: any): string {
  if (!input) return "";
  if (typeof input === 'object') return input.script_plain || input.script_body || "";
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    return parsed.script_plain || parsed.script_body || "";
  } catch {
    return String(input);
  }
}

/**
 * handler: Lógica central de síntesis visual.
 */
async function handler(request: Request): Promise<Response> {
  // 1. GESTIÓN DE PROTOCOLO DE RED (CORS)
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  let targetPodId: number | null = null;

  try {
    // 2. VALIDACIÓN DE SEGURIDAD LIGERA (Internal Service Only)
    // Sustituimos el pesado wrapper Guard por una validación de cabecera directa.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "INVALID")) {
      console.warn(`🛑 [Security] Intento de acceso no autorizado detectado.`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 3. RECEPCIÓN DE SOLICITUD
    const payload = await request.json();
    const { podcast_id, agent_name = "cover-art-director-v1" } = payload;
    targetPodId = podcast_id;

    console.log(`🎨 [Image-Worker][${correlationId}] Iniciando síntesis para Pod #${podcast_id}`);

    // 4. OBTENCIÓN DE DATOS Y PROMPT DESDE LA BÓVEDA
    const [podRes, agentRes] = await Promise.all([
      supabaseAdmin.from('micro_pods').select('title, script_text, user_id').eq('id', podcast_id).single(),
      supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', agent_name).single()
    ]);

    if (podRes.error || !podRes.data) throw new Error("PODCAST_NOT_FOUND");
    if (!agentRes.data) throw new Error("ART_AGENT_PROMPT_NOT_CONFIGURED");

    // 5. DESTILACIÓN DEL PROMPT VISUAL (Aurora Style)
    const rawScript = extractScript(podRes.data.script_text);
    const summary = cleanTextForSpeech(rawScript).substring(0, 500);

    const visualPrompt = buildPrompt(agentRes.data.prompt_template, {
      title: podRes.data.title,
      script_summary: summary
    });

    let finalImageUrl = PLACEHOLDER_COVER_URL;
    let imageWasGenerated = false;

    // 6. GENERACIÓN MEDIANTE GEMINI API (Imagen 3.0)
    // Utilizamos el nuevo callGeminiImage de _shared/ai.ts v11.9
    try {
      console.log(`🧠 [Image-Worker] Invocando motor Imagen 3 via AI Studio API...`);
      const { data: base64Image } = await callGeminiImage(visualPrompt);

      if (base64Image) {
        // 7. PERSISTENCIA BINARIA EN STORAGE
        const imageBuffer = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0));
        const filePath = `public/${podRes.data.user_id}/${podcast_id}-cover.jpg`;

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
    } catch (genErr: any) {
      console.warn(`⚠️ [Image-Worker] Fallo en generación (Posible filtro de seguridad): ${genErr.message}`);
    }

    // 8. CIERRE DE CICLO Y ACTUALIZACIÓN DE ESTADO
    // CRÍTICO: Siempre marcamos image_ready = true para no bloquear el semáforo SQL.
    await supabaseAdmin
      .from('micro_pods')
      .update({
        cover_image_url: finalImageUrl,
        image_ready: true,
        admin_notes: imageWasGenerated ? null : `Uso de placeholder por fallo en motor visual. ID: ${correlationId}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', podcast_id);

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

    // Fallback administrativo para garantizar la liberación del podcast
    if (targetPodId) {
      await supabaseAdmin.from('micro_pods').update({
        image_ready: true,
        admin_notes: `Critical Art Failure: ${error.message}`
      }).eq('id', targetPodId);
    }

    return new Response(JSON.stringify({ error: error.message, trace_id: correlationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

serve(handler);