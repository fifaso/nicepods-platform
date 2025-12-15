// supabase/functions/cognitive-core-orchestrator/index.ts
// VERSIÓN: 2.0.0 (Guard Integrated: Sentry + Arcjet + Robust Orchestration)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { guard } from "../_shared/guard.ts"; // <--- INTEGRACIÓN DEL ESTÁNDAR

// =================================================================================
// CAPA 1: FOUNDATION (Tipos, Configuración, Logging)
// =================================================================================

interface WebhookPayload { record: { id: string } }
type CreationContext = { tool: 'monologo' | 'unir_puntos' | 'arquetipo' | 'plan_aprendizaje' | 'legado'; [key: string]: any };
interface PodcastData { id: string; script_text: string; creation_context: CreationContext | null }
interface AIAgent { agent_name: string; prompt_template: string; model_identifier: string; parameters: Record<string, any>; version: number; }
interface AIAnalysisResult { analysis: { x_essence: number; y_intention: number; narrative_lens: 'Ficción' | 'No-Ficción'; tags: string[]; ai_summary: string }; embedding_source: string }
interface FinalAnalysis { ai_analysis: AIAnalysisResult['analysis']; embedding: number[]; consistency_level: 'high' | 'medium' | 'low' }

const config = {
  supabaseUrl: Deno.env.get('SUPABASE_URL'),
  supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  googleClientEmail: Deno.env.get('GOOGLE_CLIENT_EMAIL'),
  googlePrivateKeyRaw: Deno.env.get('GOOGLE_PRIVATE_KEY'),
  googleProjectId: Deno.env.get('GOOGLE_PROJECT_ID'),
  podcastAgentName: Deno.env.get('PODCAST_AGENT_NAME') || 'podcast_analyzer_v1',
  embeddingModel: 'text-embedding-004',
  apiTimeoutMs: 30000,
  agentCacheTtlMs: 5 * 60 * 1000,
};

class Logger {
  constructor(private context: Record<string, any> = {}) {}
  child(newContext: Record<string, any>) { return new Logger({ ...this.context, ...newContext }); }
  log(level: 'info' | 'warn' | 'error', message: string, data: Record<string, any> = {}) { console[level](JSON.stringify({ level, timestamp: new Date().toISOString(), message, ...this.context, ...data })); }
  info(message: string, data?: Record<string, any>) { this.log('info', message, data); }
  warn(message: string, data?: Record<string, any>) { this.log('warn', message, data); }
  error(message: string, data?: Record<string, any>) { this.log('error', message, data); }
}
const log = new Logger();

// =================================================================================
// CAPA 2: ADAPTERS (Comunicación con sistemas externos)
// =================================================================================

let supabase: SupabaseClient;
const getSupabaseClient = () => {
  if (!supabase) { supabase = createClient(config.supabaseUrl!, config.supabaseServiceKey!); }
  return supabase;
};

const agentCache = new Map<string, { agent: AIAgent; expiry: number }>();

async function getGoogleAccessToken(): Promise<string> {
    const GOOGLE_PRIVATE_KEY = config.googlePrivateKeyRaw!.replace(/\\n/g, '\n');
    const jwt = await create({ alg: "RS256", typ: "JWT" }, {
        iss: config.googleClientEmail,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: "https://oauth2.googleapis.com/token",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
    }, GOOGLE_PRIVATE_KEY);

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Error al obtener el token de acceso de Google: ${JSON.stringify(data)}`);
    }
    return data.access_token;
}

const dbAdapter = {
  fetchActiveAgent: async (name: string, logger: Logger): Promise<AIAgent> => {
    const cached = agentCache.get(name);
    if (cached && cached.expiry > Date.now()) {
      logger.info('AI Agent fetched from cache.');
      return cached.agent;
    }
    logger.info('Fetching AI Agent from database table: ai_prompts.');
    
    const { data, error } = await getSupabaseClient().from('ai_prompts').select('agent_name, prompt_template, model_identifier, parameters, version').eq('agent_name', name).eq('status', 'active').single();
    
    if (error) throw new Error(`DB Error: Could not fetch active agent "${name}". ${error.message}`);
    
    agentCache.set(name, { agent: data as AIAgent, expiry: Date.now() + config.agentCacheTtlMs });
    return data as AIAgent;
  },

  fetchPodcastData: async (id: string, logger: Logger): Promise<PodcastData> => {
    logger.info('Fetching podcast data.');
    const { data, error } = await getSupabaseClient().from('micro_pods').select('id, script_text, creation_context').eq('id', id).single();
    if (error) throw new Error(`DB Error fetching podcast ${id}. ${error.message}`);
    if (!data) throw new Error(`DB Error: Podcast with id ${id} not found.`);
    return data as PodcastData;
  },
  
  updatePodcastStatus: async (id: string, status: 'processing' | 'completed' | 'failed', logger: Logger) => {
    logger.info(`Updating podcast status to: ${status}`);
    await getSupabaseClient().from('micro_pods').update({ processing_status: status }).eq('id', id).throwOnError();
  },

  saveAnalysisResults: async (id: string, results: FinalAnalysis, agentVersion: number, logger: Logger) => {
    logger.info('Saving final analysis results to database via RPC.');
    const { ai_analysis, embedding, consistency_level } = results;

    const { error } = await getSupabaseClient().rpc('save_analysis_and_embedding', {
      p_podcast_id: id,
      p_agent_version: String(agentVersion),
      p_ai_summary: ai_analysis.ai_summary,
      p_narrative_lens: ai_analysis.narrative_lens,
      p_ai_tags: ai_analysis.tags,
      p_ai_coordinates: `(${ai_analysis.x_essence},${ai_analysis.y_intention})`,
      p_consistency_level: consistency_level,
      p_embedding: embedding,
    });
    if (error) throw new Error(`DB Error: Failed to save results via RPC. ${error.message}`);
  },

  logProcessingError: async (id: string, error: Error, logger: Logger) => {
    logger.info('Logging processing error to database.');
    await getSupabaseClient().from('processing_errors').insert({
      podcast_id: id,
      error_message: error.message,
      error_stack: error.stack,
    }).throwOnError();
  },
};

const aiAdapter = {
  _fetchWithRetry: async (url: string, options: RequestInit, logger: Logger, retries = 3): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.status < 500 && response.status !== 429) return response;
        logger.warn(`API call failed with status ${response.status}. Retrying (${i + 1}/${retries})...`);
      } catch (error) {
        // [MEJORA TS] tipado de error en catch
        const errMsg = error instanceof Error ? error.message : String(error);
        if (i === retries - 1) throw error;
        logger.warn(`API call failed with network error. Retrying (${i + 1}/${retries})...`, { error: errMsg });
      }
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      await new Promise(res => setTimeout(res, delay));
    }
    throw new Error('AI API Error: Max retries exceeded.');
  },

  getAIAnalysis: async (prompt: string, agent: AIAgent, logger: Logger): Promise<AIAnalysisResult> => {
    const accessToken = await getGoogleAccessToken();
    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${config.googleProjectId}/locations/us-central1/publishers/google/models/${agent.model_identifier}:streamGenerateContent`;
    
    const body = { 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: agent.parameters || {}
    };

    const response = await aiAdapter._fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(config.apiTimeoutMs),
    }, logger);

    if (!response.ok) throw new Error(`AI Analysis API Error: ${response.status} ${await response.text()}`);
    
    const chunks = await response.json();
    const textResponse = chunks.map((c: any) => c.candidates?.[0]?.content?.parts?.[0]?.text).join('');
    if (!textResponse) throw new Error('AI Analysis API Error: Invalid response structure from chunks.');

    try {
      const jsonString = textResponse.match(/```json\n([\s\S]*?)\n```/)?.[1];
      if (!jsonString) throw new Error('AI Analysis API Error: JSON block not found in response.');
      return JSON.parse(jsonString) as AIAnalysisResult;
    } catch (e: any) {
      throw new Error(`AI Analysis API Error: Failed to parse JSON response. ${e.message}`);
    }
  },

  getEmbedding: async (text: string, logger: Logger): Promise<number[]> => {
    const accessToken = await getGoogleAccessToken();
    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${config.googleProjectId}/locations/us-central1/publishers/google/models/${config.embeddingModel}:predict`;
    
    const body = { instances: [{ content: text }] };

    const response = await aiAdapter._fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(config.apiTimeoutMs),
    }, logger);

    if (!response.ok) throw new Error(`Embedding API Error: ${response.status} ${await response.text()}`);
    
    const json = await response.json();
    const embedding = json.predictions?.[0]?.embeddings?.values;
    if (!embedding || !Array.isArray(embedding)) throw new Error('Embedding API Error: Invalid response structure.');

    return embedding;
  },
};

// =================================================================================
// CAPA 3: SERVICES
// =================================================================================
const services = {
  getReferenceCoordinates: (context: CreationContext | null): { refX: number; refY: number } => {
    if (!context || !context.tool) {
      return { refX: 0, refY: 0 };
    }

    const referenceMatrix: Record<string, Record<string, { refX: number; refY: number }>> = {
      arquetipo: { 'Sabio': { refX: 8, refY: 8 }, 'Cuidador': { refX: -7, refY: 7 } },
      unir_puntos: { default: { refX: 5, refY: -8 } },
      plan_aprendizaje: { default: { refX: 9, refY: 9 } },
      legado: { default: { refX: -8, refY: 5 } },
      monologo: { default: { refX: 0, refY: 0 } }
    };
    const toolMatrix = referenceMatrix[context.tool];
    if (!toolMatrix) return { refX: 0, refY: 0 };
    return toolMatrix[context.archetype as string] || toolMatrix.default || { refX: 0, refY: 0 };
  },
  
  buildPrompt: (template: string, data: PodcastData, refCoords: { refX: number, refY: number }): string => {
    return template
      .replace('{{script_text}}', data.script_text)
      .replace('{{context_tool}}', data.creation_context?.tool || 'unknown')
      .replace('{{context_details}}', JSON.stringify(data.creation_context) || '{}')
      .replace('{{ref_x}}', String(refCoords.refX))
      .replace('{{ref_y}}', String(refCoords.refY));
  },
  
  calculateConsistency: (refCoords: { refX: number; refY: number }, aiCoords: { x_essence: number; y_intention: number }): 'high' | 'medium' | 'low' => {
    const distance = Math.sqrt(Math.pow(refCoords.refX - aiCoords.x_essence, 2) + Math.pow(refCoords.refY - aiCoords.y_intention, 2));
    if (distance < 5) return 'high';
    if (distance < 10) return 'medium';
    return 'low';
  },
};

// =================================================================================
// CAPA 4: ORCHESTRATOR
// =================================================================================

async function runAnalysisOrchestration(podcastId: string, logger: Logger) {
    logger.info('Orchestration started.');
    try {
        await dbAdapter.updatePodcastStatus(podcastId, 'processing', logger);
        
        const [podcastData, agent] = await Promise.all([
            dbAdapter.fetchPodcastData(podcastId, logger),
            dbAdapter.fetchActiveAgent(config.podcastAgentName, logger),
        ]);

        const refCoords = services.getReferenceCoordinates(podcastData.creation_context);
        const prompt = services.buildPrompt(agent.prompt_template, podcastData, refCoords);
        
        const aiResult = await aiAdapter.getAIAnalysis(prompt, agent, logger);
        const embedding = await aiAdapter.getEmbedding(aiResult.embedding_source, logger);
        
        const consistencyLevel = services.calculateConsistency(refCoords, aiResult.analysis);
        
        const finalResults: FinalAnalysis = {
            ai_analysis: aiResult.analysis,
            embedding,
            consistency_level: consistencyLevel,
        };

        await dbAdapter.saveAnalysisResults(podcastId, finalResults, agent.version, logger);
        await dbAdapter.updatePodcastStatus(podcastId, 'completed', logger); // [CORRECCIÓN]: Marcar como completado al final
        
        logger.info('Orchestration completed successfully.');
    } catch (error: any) {
        logger.error('Orchestration failed.', { error: error.message, stack: error.stack });
        try {
            await dbAdapter.updatePodcastStatus(podcastId, 'failed', logger);
            await dbAdapter.logProcessingError(podcastId, error, logger);
        } catch (dbError: any) {
            logger.error('CRITICAL: Failed to log processing error to DB.', { dbError: dbError.message });
        }
        throw error; // Relanzar para que Guard (Sentry) capture la excepción
    }
}

// =================================================================================
// CAPA 5: ENTRYPOINT (HANDLER)
// =================================================================================

const handler = async (req: Request): Promise<Response> => {
  // El Guard maneja OPTIONS y CORS
  // Validamos secretos críticos al inicio para Sentry
  if (!config.supabaseUrl || !config.supabaseServiceKey || !config.googleClientEmail || !config.googlePrivateKeyRaw || !config.googleProjectId) {
    throw new Error("FATAL: Faltan variables de entorno críticas en el servidor.");
  }

  const requestId = crypto.randomUUID();
  const logger = log.child({ requestId, function: 'cognitive-core-orchestrator' });
  
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = (await req.json()) as WebhookPayload;
    const podcastId = payload?.record?.id;

    if (!podcastId) {
      logger.warn('Invalid payload received.', { payload });
      return new Response('Invalid payload: Missing record.id', { status: 400 });
    }

    logger.info('Webhook received, starting orchestration.', { podcastId });
    await runAnalysisOrchestration(String(podcastId), logger);

    return new Response(JSON.stringify({ success: true, podcastId }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Si el error subió hasta aquí, es crítico.
    // El Guard lo enviará a Sentry.
    throw error;
  }
};

// --- PUNTO DE ENTRADA PROTEGIDO ---
serve(guard(handler));