// supabase/functions/_shared/ai.ts
// VERSIÓN: 13.0 (Master Intelligence Core - Gemini 2.5 Flash Image & NSP Standard)
// Misión: Centralizar los recursos de IA eliminando la dependencia de Vertex AI y estandarizando el flujo binario.
// [ESTABILIZACIÓN]: Restauración del modelo gemini-2.5-flash-image y soporte para Streaming NSP.

/**
 * AI_MODELS: Inventario oficial de modelos de última generación.
 * - PRO/FLASH: Motores de razonamiento y redacción 3.0.
 * - AUDIO: Motor de síntesis de voz neuronal (TTS).
 * - EMBEDDING: Generador de ADN semántico 768d (HNSW Ready).
 * - IMAGE: Generación de imágenes nativa (Modelo validado: 2.5 Flash Image).
 */
export const AI_MODELS = {
    PRO: "gemini-3-flash-preview",
    FLASH: "gemini-3-flash-preview",
    AUDIO: "gemini-2.5-flash-preview-tts",
    EMBEDDING: "gemini-embedding-001",
    IMAGE: "gemini-2.5-flash-image"
};

/**
 * AUDIO_CONFIG: Estándar acústico NicePod para el Protocolo NSP.
 * Garantiza que los fragmentos PCM sean compatibles con el ensamblador final.
 */
export const AUDIO_CONFIG = {
    SAMPLE_RATE: 24000,
    BIT_DEPTH: 16,
    CHANNELS: 1, // Mono
    MIME_TYPE: "audio/wav"
};

/**
 * buildPrompt: Inyecta datos en plantillas con eficiencia O(n).
 * Sanitiza caracteres de control para prevenir rupturas en respuestas JSON.
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
        const value = data[key];
        if (value === undefined || value === null) return "";

        const stringValue = typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);

        return stringValue
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
    }).trim();
}

/**
 * generateEmbedding: Transforma texto en vectores de 768 dimensiones.
 * Configurado para máxima paridad con los índices HNSW de la base de datos Supabase.
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
        throw new Error("IA_EMBEDDING_DATA_INVALID: No se recibió el vector.");
    }

    return data.embedding.values;
}

/**
 * callGeminiMultimodal: Invocación estándar para texto y visión (Fase II y III).
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * callGeminiAudio: Generación nativa de voz interpretativa (Audio del Podcast).
 * [NSP READY]: Devuelve el buffer Base64 para el ensamblaje de fragmentos.
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
        data: audioPart.inlineData.data, // Base64
        mimeType: audioPart.inlineData.mimeType
    };
}

/**
 * callGeminiImage: Generación nativa de carátulas mediante Gemini API (AI Studio).
 * [RESTAURACIÓN V12]: Utiliza el modelo gemini-2.5-flash-image con respuesta modal.
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
            // Instrucción específica para habilitar la síntesis visual en modelos multimodales.
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

    // El modelo devuelve la imagen como un fragmento de datos en línea (Base64).
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
        throw new Error("IA_IMAGE_DATA_MISSING: El motor no generó el activo visual esperado.");
    }

    return {
        data: imagePart.inlineData.data, // Buffer Base64
        mimeType: imagePart.inlineData.mimeType
    };
}

/**
 * parseAIJson: Parser resiliente para extraer JSON de bloques de texto.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error("JSON_STRUCTURE_NOT_FOUND");

        return JSON.parse(jsonMatch[0]) as T;
    } catch {
        throw new Error("ERROR_PARSING_AI_JSON: El formato de la IA no es un JSON válido.");
    }
}

/**
 * createWavHeader: Genera cabecera RIFF/WAVE de 44 bytes para audio PCM.
 * Sincronizado con AUDIO_CONFIG.SAMPLE_RATE.
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