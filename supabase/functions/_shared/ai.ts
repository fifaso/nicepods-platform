// supabase/functions/_shared/ai.ts
// VERSIÓN: 10.0 (Master AI Core - Gemini 3.0 Flash & 2.5 Pro TTS Native)

export const AI_MODELS = {
    // Inteligencia Superior para Redacción (Gemini 2.5 Pro)
    PRO: "gemini-2.5-pro",
    // Motor de Alta Velocidad para Procesamiento de Datos (Gemini 3.0 Flash)
    FLASH: "gemini-3.0-flash-preview",
    // Generación Nativa de Voz (Speech Generation Standard)
    AUDIO: "gemini-2.5-flash-preview-tts",
    // Motor de Embeddings (Vectores 768d)
    EMBEDDING: "text-embedding-004"
};

/**
 * buildPrompt: Inyecta datos en plantillas de forma segura.
 * Escapa comillas para evitar rupturas en la estructura de la IA.
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
 * callGeminiAudio: Generación nativa de voz interpretativa (WAV Output).
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
        const errText = await response.text();
        throw new Error(`GEMINI_AUDIO_API_FAIL: ${errText}`);
    }

    const data = await response.json();
    const audioPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (!audioPart?.inlineData) {
        throw new Error("IA_AUDIO_DATA_MISSING: El modelo no generó el flujo binario.");
    }

    return {
        data: audioPart.inlineData.data, // Base64
        mimeType: audioPart.inlineData.mimeType
    };
}

/**
 * callGeminiMultimodal: Invocación estándar para texto y visión (Gemini 2.5 Pro / 3.0 Flash).
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
        throw new Error(`AI_API_REJECTED [${model}]: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) throw new Error("EMPTY_IA_RESPONSE");
    return resultText;
}

/**
 * parseAIJson: Parser resiliente para extraer JSON de bloques markdown.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON_NOT_FOUND");
        return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
        console.error("AI_JSON_PARSE_ERROR:", rawText);
        throw new Error("Fallo crítico al parsear la respuesta estructurada de la IA.");
    }
}

/**
 * extractAtomicFacts: Destilación de conocimiento usando Gemini 3.0 Flash.
 */
export async function extractAtomicFacts(rawText: string): Promise<string[]> {
    const prompt = `Analiza el texto y extrae una lista de HECHOS ATÓMICOS (máximo valor informativo, mínimo ruido). Formato JSON: {"facts": []}. Texto: ${rawText.substring(0, 30000)}`;
    const responseRaw = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.2);
    const result = parseAIJson<{ facts: string[] }>(responseRaw);
    return result.facts || [];
}

/**
 * generateEmbedding: Generación de vectores 768d para Búsqueda Semántica.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${AI_MODELS.EMBEDDING}`,
            content: { parts: [{ text }] },
            taskType: "RETRIEVAL_DOCUMENT"
        })
    });

    if (!response.ok) throw new Error(`EMBEDDING_API_ERROR: ${await response.text()}`);

    const data = await response.json();
    return data.embedding.values;
}

/**
 * createWavHeader: Genera cabecera WAV para audio PCM 24kHz.
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
 * cleanTextForSpeech: Limpieza profunda de ruido narrativo.
 */
export function cleanTextForSpeech(text: string): string {
    if (!text) return "";
    return text
        .replace(/\[.*?\]/g, "")
        .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "")
        .replace(/[*#_~`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}