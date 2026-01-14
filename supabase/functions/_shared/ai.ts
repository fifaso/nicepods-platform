// supabase/functions/_shared/ai.ts
// VERSIÓN: 9.5 (Gemini 2.5 Flash TTS Native Integration)

export const AI_MODELS = {
    PRO: "gemini-3.0-flash",
    FLASH: "gemini-2.5-pro",
    // NUEVO ESTÁNDAR TTS
    AUDIO: "gemini-2.5-flash-preview-tts",
    EMBEDDING: "text-embedding-004"
};

/**
 * Mapeo de Voces NicePod -> Gemini 2.5 TTS
 * Seleccionadas por su calidad actoral y tono.
 */
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

/**
 * callGeminiAudio: Implementación REST para Gemini 2.5 Flash TTS
 * Maneja la configuración de voz nativa y el protocolo de respuesta de audio.
 */
export async function callGeminiAudio(prompt: string, directorNote: string, voiceParams: { gender: string, style: string }) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL_ERROR: GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.AUDIO}:generateContent?key=${apiKey}`;

    // Determinamos la voz ideal según el mapeo de NicePod
    const voiceKey = `${voiceParams.gender}_${voiceParams.style}`;
    const selectedVoice = GEMINI_VOICE_MAP[voiceKey] || "Zephyr";

    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: `${directorNote}\n\nSCRIPT TO READ:\n${prompt}` }]
        }],
        generationConfig: {
            temperature: 1.0,
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: selectedVoice // 'Zephyr', 'Puck', etc.
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
        const err = await response.text();
        throw new Error(`TTS_ENGINE_REJECTED: ${err}`);
    }

    const data = await response.json();

    // Extraemos los datos de audio y el MIME type para la cabecera WAV
    const audioPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (!audioPart?.inlineData) {
        console.error("FULL_API_RESPONSE_DEBUG:", JSON.stringify(data));
        throw new Error("EMPTY_TTS_RESPONSE: El modelo no generó datos binarios.");
    }

    return {
        data: audioPart.inlineData.data, // Base64
        mimeType: audioPart.inlineData.mimeType
    };
}

/**
 * createWavHeader: Utilidad forense para reconstruir archivos WAV desde PCM
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
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true); // 16 bits
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    return new Uint8Array(buffer);
}

export function cleanTextForSpeech(text: string): string {
    if (!text) return "";
    return text.replace(/\[.*?\]/g, "").replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "").replace(/[*#_~`]/g, "").replace(/\s+/g, " ").trim();
}

export async function callGeminiMultimodal(prompt: string, imageBase64?: string, model = AI_MODELS.FLASH) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64.split(",")[1] || imageBase64 } });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }], generationConfig: { response_mime_type: "application/json" } })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

export function parseAIJson<T>(text: string): T {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("INVALID_JSON_RESPONSE");
    return JSON.parse(match[0]);
}