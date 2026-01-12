/**
 * 📋 INVENTARIO DE CONSUMO DE IA (GOVERNANCE MAP)
 * -----------------------------------------------------------------------------
 * 1. process-podcast-job        -> GEMINI_2_5_PRO (Razonamiento y Estructura)
 * 2. generate-script-draft      -> GEMINI_2_5_PRO (Investigación y Síntesis)
 * 3. vault-refinery             -> GEMINI_3_FLASH_PREVIEW (Destilación Masiva)
 * 4. get-local-discovery        -> GEMINI_3_FLASH_PREVIEW (Visión Situacional)
 * 5. generate-audio-from-script -> GEMINI_2_5_PRO_PREVIEW_TTS (Audio Nativo)
 * 6. generate-embedding         -> TEXT_EMBEDDING_004 (Vectores 768d)
 * -----------------------------------------------------------------------------
 */

export const AI_MODELS = {
    // Inteligencia de Grado Profesional
    PRO: "gemini-2.5-pro",

    // Motor de Última Generación (Velocidad Extrema)
    FLASH: "gemini-3-flash-preview",

    // Motor de Audio Nativo (Speech Generation)
    AUDIO: "gemini-2.5-pro-preview-tts",

    // Motor de Embeddings
    EMBEDDING: "text-embedding-004"
};

/**
 * CONFIGURACIÓN DE APOYO PARA AUDIO TRADICIONAL (Fallback)
 */
export const VOICE_CONFIGS: Record<string, Record<string, string>> = {
    "Masculino": { "Profesional": "es-US-Neural2-B", "Calmado": "es-US-Neural2-B" },
    "Femenino": { "Profesional": "es-US-Neural2-A", "Calmado": "es-US-Neural2-A" }
};

export const SPEAKING_RATES: Record<string, number> = {
    "Lento": 0.85, "Moderado": 1.0, "Rápido": 1.15
};

/**
 * buildPrompt: Inyecta datos en plantillas de forma segura.
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        prompt = prompt.split(`{{${key}}}`).join(stringValue.replace(/"/g, '\\"'));
    }
    return prompt.replace(/{{.*?}}/g, "").trim();
}

/**
 * callGeminiMultimodal: Invocación estándar para texto y visión.
 */
export async function callGeminiMultimodal(
    prompt: string,
    imageBase64?: string,
    model = AI_MODELS.PRO,
    temperature = 0.7
) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const parts: Record<string, unknown>[] = [{ text: prompt }];

    if (imageBase64) {
        const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
        parts.push({ inline_data: { mime_type: "image/jpeg", data: base64Data } });
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { temperature, response_mime_type: "application/json" }
        }),
    });

    if (!response.ok) throw new Error(`AI_ERROR [${model}]: ${await response.text()}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

/**
 * callGeminiAudio: Generación nativa de voz (Text-to-Audio).
 * Utiliza el modelo especializado gemini-2.5-pro-preview-tts.
 */
export async function callGeminiAudio(prompt: string, directorNote: string) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.AUDIO}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: `INSTRUCCIONES DE ACTUACIÓN: ${directorNote}` },
                    { text: `GUION A LOCUTAR: ${prompt}` }
                ]
            }],
            generationConfig: {
                // Dejamos libre el razonamiento de audio pero forzamos el formato de salida
                response_mime_type: "audio/wav"
            }
        }),
    });

    if (!response.ok) throw new Error(`AUDIO_GEN_ERROR: ${await response.text()}`);
    const data = await response.json();

    // Retorna el base64 del audio generado nativamente
    return data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data)?.inline_data?.data;
}

/**
 * extractAtomicFacts: Destilación de conocimiento usando Gemini 3 Flash.
 */
export async function extractAtomicFacts(rawText: string): Promise<string[]> {
    const prompt = `Extrae HECHOS ATÓMICOS de este texto. Formato JSON: {"facts": []}. Texto: ${rawText.substring(0, 20000)}`;
    const responseRaw = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.2);
    const result = parseAIJson<{ facts: string[] }>(responseRaw);
    return result.facts || [];
}

/**
 * parseAIJson: Parser resiliente de respuestas de IA.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");
        return JSON.parse(jsonMatch[0]) as T;
    } catch {
        throw new Error("Fallo al parsear estructura de inteligencia.");
    }
}

/**
 * generateEmbedding: Generación de vectores 768d.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: `models/${AI_MODELS.EMBEDDING}`, content: { parts: [{ text }] } })
    });
    const data = await response.json();
    return data.embedding.values;
}

/**
 * cleanTextForSpeech: Limpia el guion para una locución fluida.
 */
export function cleanTextForSpeech(text: string): string {
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/[*#_~`]/g, "")
        .replace(/\[origin:.*?\]/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}