// supabase/functions/_shared/ai.ts
// VERSIÓN: 10.9 (Master Intelligence Core - Gemini Embedding Migration)
// Misión: Migrar al modelo estable embedding-001 y optimizar el ruteo de API.

export const AI_MODELS = {
    PRO: "gemini-3.0-flash",
    FLASH: "gemini-3.0-flash",
    AUDIO: "gemini-3.0-flash-tts",
    EMBEDDING: "gemini-embedding-001"
};

/**
 * generateEmbedding: Transforma texto en vectores para búsqueda semántica.
 * [RESOLUCIÓN 404]: Implementación del modelo 'embedding-001' según documentación v1beta.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY_MISSING");

    // El modelo embedding-001 reside en el endpoint v1beta para acceso GA
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${AI_MODELS.EMBEDDING}`,
            content: {
                parts: [{ text }]
            }
        })
    });

    if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`EMBEDDING_API_ERROR [${response.status}]: ${errorDetail}`);
    }

    const data = await response.json();

    if (!data.embedding?.values) {
        throw new Error("EMBEDDING_DATA_INCOMPLETE: No se recibieron valores vectoriales.");
    }

    return data.embedding.values;
}

/**
 * buildPrompt: Inyecta datos con eficiencia Regex O(n).
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
        const value = data[key];
        if (value === undefined || value === null) return "";
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return stringValue
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
    }).trim();
}

/**
 * callGeminiMultimodal: Invocación estándar texto/visión.
 */
export async function callGeminiMultimodal(
    prompt: string,
    imageBase64?: string,
    model = AI_MODELS.PRO,
    temperature = 0.7
) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
        const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
        parts.push({ inline_data: { mime_type: "image/jpeg", data: base64Data } });
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

    if (!response.ok) throw new Error(`AI_API_ERROR: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * cleanTextForSpeech: Higiene acústica para el motor de voz.
 */
export function cleanTextForSpeech(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/\[.*?\]/g, "")
        .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "")
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/[*#_~`>]/g, "")
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * parseAIJson: Extractor de JSON resiliente.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON_NOT_FOUND");
        return JSON.parse(jsonMatch[0]) as T;
    } catch {
        throw new Error("ERROR_PARSING_AI_JSON");
    }
}