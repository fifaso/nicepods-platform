// supabase/functions/_shared/ai.ts
// VERSIÓN: 14.0 (Master Intelligence Core - Sovereign V2.6 Edition)
// Misión: Centralizar recursos de IA, optimizar tiering de modelos y habilitar visión de mosaico.
// [ESTABILIZACIÓN]: Integración de Tier LITE y soporte para múltiples entradas visuales.

/**
 * AI_MODELS: Inventario oficial de modelos sintonizados por NicePod.
 * - PRO: Máxima capacidad de razonamiento y visión arquitectónica.
 * - FLASH: Equilibrio entre velocidad y comprensión multimodal.
 * - LITE: Modelo económico optimizado para tareas de alta frecuencia (STT/Resumen).
 */
export const AI_MODELS = {
    PRO: "gemini-3-flash-preview",
    FLASH: "gemini-1.5-flash",
    LITE: "gemini-2.5-flash-lite", // [NUEVO]: Optimización de costos
    AUDIO: "gemini-2.5-flash-preview-tts",
    EMBEDDING: "gemini-embedding-001",
    IMAGE: "gemini-2.5-flash-image"
};

/**
 * AUDIO_CONFIG: Estándar acústico industrial para el protocolo NSP.
 */
export const AUDIO_CONFIG = {
    SAMPLE_RATE: 24000,
    BIT_DEPTH: 16,
    CHANNELS: 1,
    MIME_TYPE: "audio/wav"
};

/**
 * buildPrompt: Inyecta datos en plantillas con sanitización de escape JSON.
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
 * callGeminiMultimodal: Invocación estándar para texto, visión única o mosaico visual.
 * [V14.0]: Ahora soporta un array de imágenes y detección dinámica de MIME.
 */
export async function callGeminiMultimodal(
    prompt: string,
    images?: { base64: string, mimeType?: string }[], // Soporte para Mosaico
    model = AI_MODELS.FLASH,
    temperature = 0.5
) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL_ERROR: GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // 1. Preparamos el bloque de texto
    const parts: any[] = [{ text: prompt }];

    // 2. Inyectamos el mosaico de imágenes si existen
    if (images && images.length > 0) {
        images.forEach((img) => {
            const cleanBase64 = img.base64.includes(",") ? img.base64.split(",")[1] : img.base64;
            parts.push({
                inline_data: {
                    mime_type: img.mimeType || "image/jpeg",
                    data: cleanBase64
                }
            });
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
        throw new Error(`AI_GATEWAY_FAIL [${model}]: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * generateEmbedding: ADN semántico 768d para Bóveda NKV.
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

    const data = await response.json();
    if (!data.embedding?.values) throw new Error("EMBEDDING_GENERATION_FAILED");
    return data.embedding.values;
}

/**
 * parseAIJson: Extrae objetos JSON de respuestas de lenguaje natural.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("NO_JSON_FOUND");
        return JSON.parse(jsonMatch[0]) as T;
    } catch {
        throw new Error("PARSING_AI_ERROR: La respuesta de la IA no es un JSON válido.");
    }
}

/**
 * createWavHeader: Sincronía RIFF/WAVE de 44 bytes para fragmentos PCM.
 */
export function createWavHeader(dataLength: number, sampleRate = 24000) {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    return new Uint8Array(buffer);
}

/**
 * cleanTextForSpeech: Limpieza de Markdown para voz neuronal.
 */
export function cleanTextForSpeech(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/\[.*?\]/g, "")
        .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "")
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/[*#_~`>]/g, "")
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{2600}-\u{26FF}]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
}