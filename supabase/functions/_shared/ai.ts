// supabase/functions/_shared/ai.ts
// VERSIÓN: 11.7 (Master Intelligence Core - Bulletproof Parser Edition)
// Misión: Centralizar IA y garantizar que el parseo de JSON no falle por ruidos de formato.

export const AI_MODELS = {
    PRO: "gemini-3-flash-preview",
    FLASH: "gemini-3-flash-preview",
    AUDIO: "gemini-2.5-pro-preview-tts",
    EMBEDDING: "gemini-embedding-001"
};

/**
 * parseAIJson: Parser de Grado Industrial.
 * [RESOLUCIÓN]: Limpia bloques de código Markdown y caracteres invisibles antes de parsear.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        // 1. Limpieza de bloques de código (```json ... ```)
        let cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

        // 2. Extracción del primer objeto válido detectado
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("NO_JSON_STRUCTURE");

        return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
        console.error("❌ [Parser-Fail] Contenido original:", rawText);
        throw new Error("ERROR_PARSING_AI_JSON: El modelo devolvió un formato incompatible.");
    }
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
 * generateEmbedding: Genera vectores de 768 dimensiones.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${AI_MODELS.EMBEDDING}`,
            content: { parts: [{ text: text.substring(0, 30000) }] },
            taskType: "RETRIEVAL_DOCUMENT",
            outputDimensionality: 768
        })
    });
    if (!response.ok) throw new Error(`EMBEDDING_API_FAIL [${response.status}]`);
    const data = await response.json();
    return data.embedding.values;
}

/**
 * callGeminiMultimodal: Invocación estándar para Gemini 3.0.
 */
export async function callGeminiMultimodal(prompt: string, imageBase64?: string, model = AI_MODELS.FLASH, temperature = 0.7) {
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
                temperature,
                response_mime_type: "application/json" // Forzamos JSON a nivel de API
            }
        }),
    });
    if (!response.ok) throw new Error(`AI_API_FAIL: ${response.status}`);
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