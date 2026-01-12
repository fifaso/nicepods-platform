// supabase/functions/_shared/ai.ts
// VERSIÓN: 7
/**
 * 📋 INVENTARIO DE CONSUMO DE IA (GOVERNANCE MAP)
 * -----------------------------------------------------------------------------
 * 1. process-podcast-job        -> GEMINI_2_5_PRO (Orquestación y Redacción Final)
 * 2. generate-script-draft      -> GEMINI_2_5_PRO (Investigación y Síntesis)
 * 3. vault-refinery             -> GEMINI_1_5_FLASH (Destilación de Hechos Atómicos)
 * 4. get-local-discovery        -> GEMINI_1_5_FLASH (Análisis Situacional Rápido)
 * 5. generate-embedding         -> TEXT_EMBEDDING_004 (ADN Semántico)
 * 6. search-pro                 -> TEXT_EMBEDDING_004 (Vectores de Consulta)
 * -----------------------------------------------------------------------------
 */

export const AI_MODELS = {
    // Motor de Razonamiento Superior (Lógica Compleja)
    PRO: "gemini-2.5-pro",

    // Motor de Alta Velocidad y Bajo Costo (Procesamiento de Datos)
    FLASH: "gemini-1.5-flash",

    // Motor Vectorial (Grounding & RAG)
    EMBEDDING: "text-embedding-004",

    // Alias de Compatibilidad
    LATEST_PREMIUM: "gemini-2.5-pro",
    LATEST_FAST: "gemini-1.5-flash"
};

/**
 * buildPrompt: Inyecta variables en templates de forma segura.
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const safeValue = stringValue.replace(/"/g, '\\"');
        prompt = prompt.split(`{{${key}}}`).join(safeValue);
    }
    return prompt.replace(/{{.*?}}/g, "").trim();
}

/**
 * callGeminiMultimodal: Wrapper universal para interactuar con Google AI.
 * Soporta Texto + Imagen (Base64).
 */
export async function callGeminiMultimodal(
    prompt: string,
    imageBase64?: string,
    model = AI_MODELS.PRO,
    temperature = 0.7
) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL: GOOGLE_AI_API_KEY is not configured.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts: Record<string, unknown>[] = [{ text: prompt }];

    if (imageBase64) {
        const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
        parts.push({
            inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
            }
        });
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
                temperature: temperature,
                response_mime_type: "application/json"
            }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API Error [${model}]: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) throw new Error("IA_EMPTY_RESPONSE: No se generó contenido.");
    return resultText;
}

/**
 * extractAtomicFacts: Destila un texto largo en una lista de hechos objetivos.
 * Específico para alimentar el Knowledge Vault (NKV) con Gemini 1.5 Flash.
 */
export async function extractAtomicFacts(rawText: string): Promise<string[]> {
    const prompt = `
    Analiza el siguiente texto y extrae una lista de HECHOS ATÓMICOS.
    
    REGLAS:
    1. Cada hecho debe ser una oración corta e independiente.
    2. Elimina opiniones, introducciones y lenguaje de relleno.
    3. Mantén nombres, fechas, datos técnicos y conceptos clave.
    4. Devuelve el resultado exclusivamente en formato JSON: {"facts": ["hecho 1", "hecho 2"]}.
    
    TEXTO:
    ${rawText.substring(0, 25000)}
    `;

    const responseRaw = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.3);
    const result = parseAIJson<{ facts: string[] }>(responseRaw);
    return result.facts || [];
}

/**
 * parseAIJson: Extrae y parsea JSON incrustado en respuestas de texto de la IA.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON block found.");
        return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
        console.error("AI_JSON_PARSE_ERROR:", rawText);
        throw new Error("Fallo crítico al procesar la respuesta inteligente.");
    }
}

/**
 * generateEmbedding: Convierte texto en vectores de 768 dimensiones.
 * Utilizado para Búsqueda Semántica y RAG.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Missing AI Key for Embeddings");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${AI_MODELS.EMBEDDING}`,
            content: { parts: [{ text }] }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Embedding API Error: ${errText}`);
    }

    const data = await response.json();
    return data.embedding.values;
}