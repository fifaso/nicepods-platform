// supabase/functions/_shared/ai.ts
// VERSIÓN: 11.9 (Master Intelligence Core - Unified Gemini API Standard)
// Misión: Centralizar los recursos de inteligencia artificial para redacción, audio, imagen y visión.
// [ESTABILIZACIÓN]: Migración a Imagen 3 nativa, exportaciones explícitas y estandarización 768d.

/**
 * AI_MODELS: Inventario oficial de modelos validados para NicePod V2.5.
 * - PRO/FLASH: Modelos de generación de texto y análisis de alta velocidad.
 * - AUDIO: Motor de síntesis de voz neuronal (TTS).
 * - EMBEDDING: Generador de ADN semántico para el Radar y NKV.
 * - IMAGE: Motor de dirección de arte visual (Imagen 3).
 */
export const AI_MODELS = {
    PRO: "gemini-3-flash-preview",
    FLASH: "gemini-3-flash-preview",
    AUDIO: "gemini-2.5-pro-preview-tts",
    EMBEDDING: "gemini-embedding-001",
    IMAGE: "imagen-3.0-generate-001"
};

/**
 * buildPrompt: Inyecta variables dinámicas en plantillas de instrucciones.
 * Utiliza un algoritmo de reemplazo basado en expresiones regulares para optimizar
 * el uso de CPU y prevenir el error 'CPU Time exceeded' en contextos de texto extenso.
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
        const value = data[key];
        if (value === undefined || value === null) return "";

        const stringValue = typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);

        // Sanitización para inyección segura en estructuras JSON
        return stringValue
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
    }).trim();
}

/**
 * generateEmbedding: Transforma cadenas de texto en vectores numéricos de 768 dimensiones.
 * [CONFIGURACIÓN]: Utiliza el endpoint v1beta para forzar la dimensionalidad compatible 
 * con los índices HNSW de Supabase (Límite de 2000 dimensiones).
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
                parts: [{ text: text.substring(0, 30000) }] // Límite de seguridad para evitar saturación
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
        throw new Error("IA_EMBEDDING_DATA_INVALID: El modelo no devolvió valores vectoriales.");
    }

    return data.embedding.values;
}

/**
 * callGeminiMultimodal: Invocación estándar para tareas de texto y visión computacional.
 * Utilizado por el Investigador de Inteligencia y el Router Semántico de Madrid Resonance.
 */
export async function callGeminiMultimodal(
    prompt: string,
    imageBase64?: string,
    model = AI_MODELS.FLASH,
    temperature = 0.7
) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL_ERROR: GOOGLE_AI_API_KEY_MISSING");

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

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI_API_FAIL [${model}]: ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * callGeminiAudio: Generación nativa de voz interpretativa (WAV Output).
 * [ESTABILIZACIÓN]: Exportación explícita para consumo de los trabajadores multimedia.
 */
export async function callGeminiAudio(prompt: string, directorNote: string, voiceParams: { gender: string, style: string }) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL_ERROR: GOOGLE_AI_API_KEY_MISSING");

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
        throw new Error("IA_AUDIO_DATA_MISSING: El motor no generó el flujo binario.");
    }

    return {
        data: audioPart.inlineData.data, // Base64
        mimeType: audioPart.inlineData.mimeType
    };
}

/**
 * callGeminiImage: Generación nativa de carátulas mediante Imagen 3.
 * [NUEVO]: Migración de Vertex AI a Gemini API para reducción de latencia y CPU.
 */
export async function callGeminiImage(prompt: string) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL_ERROR: GOOGLE_AI_API_KEY_MISSING");

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
        throw new Error("IA_IMAGE_DATA_MISSING: El motor no generó el activo visual.");
    }

    return {
        data: imagePart.inlineData.data, // Base64
        mimeType: imagePart.inlineData.mimeType
    };
}

/**
 * parseAIJson: Extractor de estructuras JSON con limpieza de ruido Markdown.
 * Garantiza que las respuestas de la IA sean procesables por el sistema NicePod.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        // Limpiamos etiquetas de bloque de código generadas por modelos Preview
        const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error("JSON_STRUCTURE_NOT_FOUND");

        return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
        console.error("❌ [NicePod-Parser-Fatal]:", rawText);
        throw new Error("ERROR_PARSING_AI_JSON: El formato devuelto por la IA es incompatible.");
    }
}

/**
 * createWavHeader: Construye una cabecera RIFF/WAVE de 44 bytes para audio PCM.
 * Sincronizado con el motor TTS de Google a 24,000Hz, 16-bit, Mono.
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
    view.setUint16(20, 1, true); // Formato PCM
    view.setUint16(22, 1, true); // Mono canal
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte Rate
    view.setUint16(32, 2, true); // Block Align
    view.setUint16(34, 16, true); // Bits por muestra
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    return new Uint8Array(buffer);
}

/**
 * cleanTextForSpeech: El 'Stripper' acústico de NicePod.
 * Elimina marcas visuales y etiquetas técnicas para que el TTS no las verbalice.
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