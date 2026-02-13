// supabase/functions/_shared/ai.ts
// VERSIÓN: 11.0 (Master Intelligence Core - Unified 768d Standard)
// Misión: Centralizar los recursos de IA para redacción, audio, imagen y visión.
// [OPTIMIZACIÓN]: Migración a gemini-embedding-001 con salida truncada a 768 dimensiones.

export const AI_MODELS = {
    // Inteligencia de Redacción y Análisis (Fase III)
    PRO: "gemini-3.0-flash-preview",

    // Motor de Velocidad para Datos e Investigación (Fase II)
    FLASH: "gemini-3.0-flash-preview",

    // Generación Nativa de Voz (TTS Neuronal)
    AUDIO: "gemini-2.5-flash-preview-tts",

    // Nuevo Estándar de Bóveda Semántica (Compatible con HNSW 2000 dim limit)
    EMBEDDING: "gemini-embedding-001"
};

/**
 * buildPrompt: Inyecta datos en plantillas de forma segura y eficiente.
 * Utiliza un único pase de Regex para evitar el consumo excesivo de CPU.
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
        const value = data[key];
        if (value === undefined || value === null) return "";

        const stringValue = typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);

        // Escape quirúrgico para inyección segura en objetos JSON generados por la IA
        return stringValue
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
    }).trim();
}

/**
 * generateEmbedding: Genera vectores de 768 dimensiones para el NKV.
 * [RESOLUCIÓN]: Implementación de gemini-embedding-001 con outputDimensionality restrictivo.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL_ERROR: GOOGLE_AI_API_KEY_MISSING");

    // El modelo gemini-embedding-001 requiere el endpoint v1beta para parámetros avanzados
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${AI_MODELS.EMBEDDING}`,
            content: {
                parts: [{ text: text.substring(0, 30000) }] // Límite de seguridad de entrada
            },
            taskType: "RETRIEVAL_DOCUMENT",
            // Forzamos 768 dimensiones para compatibilidad total con Supabase HNSW
            outputDimensionality: 768
        })
    });

    if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`EMBEDDING_API_FAIL [${response.status}]: ${errorDetail}`);
    }

    const data = await response.json();

    if (!data.embedding?.values) {
        throw new Error("EMBEDDING_DATA_INVALID: El modelo no devolvió valores vectoriales.");
    }

    return data.embedding.values;
}

/**
 * callGeminiMultimodal: Invocación estándar para texto y visión (Funciones GEO).
 */
export async function callGeminiMultimodal(
    prompt: string,
    imageBase64?: string,
    model = AI_MODELS.PRO,
    temperature = 0.7
) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
        // Limpiamos el prefijo base64 si existe
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
        throw new Error(`AI_GENERATION_FAIL [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) throw new Error("EMPTY_IA_RESPONSE: El modelo no generó contenido.");
    return resultText;
}

/**
 * callGeminiAudio: Generación nativa de voz interpretativa (Audio del Podcast).
 */
export async function callGeminiAudio(prompt: string, directorNote: string, voiceParams: { gender: string, style: string }) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.AUDIO}:generateContent?key=${apiKey}`;

    const GEMINI_VOICE_MAP: Record<string, string> = {
        "Masculino_Profesional": "Charon",
        "Masculino_Calmado": "Puck",
        "Masculino_Inspirador": "Fenrir",
        "Masculino_Energético": "Aoede",
        "Femenino_Profesional": "Kore",
        "Femenino_Calmado": "Zephyr",
        "Femenino_Inspirador": "Leda",
        "Femenino_Energético": "Kalliope"
    };

    const selectedVoice = GEMINI_VOICE_MAP[`${voiceParams.gender}_${voiceParams.style}`] || "Zephyr";

    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: `${directorNote}\n\nSCRIPT TO VOCALIZE:\n${prompt}` }]
        }],
        generationConfig: {
            temperature: 1.0,
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: selectedVoice
                    }
                }
            }
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`GEMINI_AUDIO_FAIL [${response.status}]: ${errorDetail}`);
    }

    const data = await response.json();
    const audioPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (!audioPart?.inlineData) {
        throw new Error("IA_AUDIO_DATA_MISSING: No se generó el flujo binario de voz.");
    }

    return {
        data: audioPart.inlineData.data, // Base64 binario
        mimeType: audioPart.inlineData.mimeType
    };
}

/**
 * parseAIJson: Parser resiliente para extraer JSON de bloques de texto.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON_NOT_FOUND");
        return JSON.parse(jsonMatch[0]) as T;
    } catch {
        throw new Error("Fallo crítico al parsear la respuesta estructurada de la IA.");
    }
}

/**
 * extractAtomicFacts: Destilación de conocimiento usando Gemini Flash 3.0.
 */
export async function extractAtomicFacts(rawText: string): Promise<string[]> {
    const prompt = `Analiza el texto y extrae una lista de HECHOS ATÓMICOS. Formato JSON: {"facts": []}. Texto: ${rawText.substring(0, 15000)}`;
    const responseRaw = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.1);
    const result = parseAIJson<{ facts: string[] }>(responseRaw);
    return result.facts || [];
}

/**
 * createWavHeader: Genera cabecera WAV RIFF de 44 bytes para audio PCM.
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
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    return new Uint8Array(buffer);
}

/**
 * cleanTextForSpeech: El "Stripper" de ruidos visuales para la IA de voz.
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