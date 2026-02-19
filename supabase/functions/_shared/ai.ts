// supabase/functions/_shared/ai.ts
// VERSIÓN: 12.0 (Master Intelligence Core - Unified Gemini API Standard)
// Misión: Proveer el cerebro asíncrono de NicePod eliminando la dependencia de Vertex AI.
// [ESTABILIZACIÓN]: Integración nativa de Audio y Imagen mediante protocolos de Google AI Studio.

/**
 * AI_MODELS: Inventario oficial de modelos validados para NicePod V2.5.
 * Utilizamos la serie Flash 2.5 para un rendimiento de baja latencia y alta eficiencia.
 */
export const AI_MODELS = {
    // Inteligencia para redacción técnica y arquitectura de guiones.
    PRO: "gemini-3-flash-preview",

    // Motor de investigación rápida y análisis de fuentes crudas.
    FLASH: "gemini-3-flash-preview",

    // Motor de síntesis de voz neuronal (TTS) de última generación.
    AUDIO: "gemini-2.5-flash-preview-tts",

    // Generador de ADN semántico compatible con Supabase (768d).
    EMBEDDING: "gemini-embedding-001",

    // Motor de dirección de arte visual nativo en Gemini API.
    IMAGE: "gemini-2.5-flash-image"
};

/**
 * buildPrompt: Inyecta variables dinámicas en plantillas con eficiencia máxima.
 * Diseñado para manejar volúmenes masivos de fuentes sin desbordar el tiempo de CPU.
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
        const value = data[key];
        if (value === undefined || value === null) return "";

        const stringValue = typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);

        // Escape de caracteres de control para inyección segura en esquemas JSON.
        return stringValue
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
    }).trim();
}

/**
 * generateEmbedding: Transforma conocimiento en vectores de 768 dimensiones.
 * [RIGOR]: Forzamos la dimensionalidad para asegurar compatibilidad con HNSW de PostgreSQL.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL_ERROR: GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${AI_MODELS.EMBEDDING}`,
            content: {
                parts: [{ text: text.substring(0, 30000) }]
            },
            taskType: "RETRIEVAL_DOCUMENT",
            outputDimensionality: 768
        })
    });

    if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`EMBEDDING_API_ERROR [${response.status}]: ${errorDetail}`);
    }

    const data = await response.json();
    if (!data.embedding?.values) {
        throw new Error("IA_EMBEDDING_DATA_INVALID: El modelo no devolvió valores.");
    }

    return data.embedding.values;
}

/**
 * callGeminiMultimodal: Invocación estándar para tareas de texto y visión.
 * Utilizado por el Investigador de Inteligencia y el Router Semántico.
 */
export async function callGeminiMultimodal(
    prompt: string,
    imageBase64?: string,
    model = AI_MODELS.FLASH,
    temperature = 0.7
) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const parts: any[] = [{ text: prompt }];

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
        throw new Error(`AI_TEXT_API_FAIL [${model}]: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) throw new Error("EMPTY_IA_RESPONSE");
    return resultText;
}

/**
 * callGeminiAudio: Generación nativa de voz interpretativa (WAV Output).
 * Utiliza el modelo gemini-2.5-flash-preview-tts bajo el protocolo modal de la API.
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
        throw new Error(`GEMINI_AUDIO_API_FAIL [${response.status}]: ${errorDetail}`);
    }

    const data = await response.json();
    const audioPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (!audioPart?.inlineData) {
        throw new Error("IA_AUDIO_DATA_MISSING: El motor no generó el flujo binario.");
    }

    return {
        data: audioPart.inlineData.data, // Buffer Base64
        mimeType: audioPart.inlineData.mimeType
    };
}

/**
 * callGeminiImage: Generación nativa de carátulas mediante Imagen 3.
 * [RESOLUCIÓN]: Implementación directa bajo Gemini API (AI Studio), eliminando Vertex AI.
 */
export async function callGeminiImage(prompt: string) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.IMAGE}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            responseModalities: ["IMAGE"]
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`GEMINI_IMAGE_API_FAIL [${response.status}]: ${errorDetail}`);
    }

    const data = await response.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
        throw new Error("IA_IMAGE_DATA_MISSING: No se generó el activo visual.");
    }

    return {
        data: imagePart.inlineData.data, // Buffer Base64
        mimeType: imagePart.inlineData.mimeType
    };
}

/**
 * parseAIJson: Parser resiliente para extraer JSON de bloques de código.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        // Limpiamos etiquetas de bloque de código Markdown frecuentemente incluidas por la IA.
        const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error("JSON_STRUCTURE_NOT_FOUND");

        return JSON.parse(jsonMatch[0]) as T;
    } catch {
        throw new Error("ERROR_PARSING_AI_JSON: El formato devuelto por la IA no es un JSON válido.");
    }
}

/**
 * createWavHeader: Construye una cabecera RIFF/WAVE de 44 bytes para audio PCM.
 * Sincronizado con el estándar de salida de Gemini TTS a 24kHz.
 */
export function createWavHeader(dataLength: number, sampleRate = 24000) {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte Rate
    view.setUint16(32, 2, true); // Block Align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    return new Uint8Array(buffer);
}

/**
 * cleanTextForSpeech: El 'Stripper' acústico de NicePod.
 * Elimina marcas visuales para garantizar una prosodia pura en el motor TTS.
 */
export function cleanTextForSpeech(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/\[.*?\]/g, "") // Elimina marcas técnicas [SFX], [MUSIC]
        .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "") // Elimina etiquetas de locutor
        .replace(/\*\*/g, "") // Elimina negritas Markdown
        .replace(/__/g, "") // Elimina cursivas Markdown
        .replace(/[*#_~`>]/g, "") // Elimina restos de símbolos visuales
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // Elimina Emojis
        .replace(/\s+/g, " ") // Normaliza espacios múltiples
        .trim();
}