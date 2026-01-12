// supabase/functions/_shared/ai.ts
// VERSIÓN: 8.2 (Stability Patch - Native Audio Protocol Fix)

/**
 * 📋 INVENTARIO DE CONSUMO DE IA (GOVERNANCE MAP)
 * 1. process-podcast-job        -> GEMINI_2_5_PRO
 * 2. generate-script-draft      -> GEMINI_2_5_PRO
 * 3. research-intelligence      -> GEMINI_3_FLASH_PREVIEW
 * 4. vault-refinery             -> GEMINI_3_FLASH_PREVIEW
 * 5. generate-audio-from-script -> GEMINI_2_5_PRO_PREVIEW_TTS
 * 6. generate-embedding         -> TEXT_EMBEDDING_004
 */

export const AI_MODELS = {
    PRO: "gemini-2.5-pro",
    FLASH: "gemini-3-flash-preview",
    AUDIO: "gemini-2.5-pro-preview-tts",
    EMBEDDING: "text-embedding-004"
};

export const VOICE_CONFIGS: Record<string, Record<string, string>> = {
    "Masculino": { "Profesional": "es-US-Neural2-B", "Calmado": "es-US-Neural2-B", "Inspirador": "es-US-Neural2-B", "Energético": "es-US-Neural2-B" },
    "Femenino": { "Profesional": "es-US-Neural2-A", "Calmado": "es-US-Neural2-A", "Inspirador": "es-US-Neural2-A", "Energético": "es-US-Neural2-A" }
};

export const SPEAKING_RATES: Record<string, number> = {
    "Lento": 0.85, "Moderado": 1.0, "Rápido": 1.15
};

export function buildPrompt(template: string, data: Record<string, unknown>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        prompt = prompt.split(`{{${key}}}`).join(stringValue.replace(/"/g, '\\"'));
    }
    return prompt.replace(/{{.*?}}/g, "").trim();
}

export async function callGeminiMultimodal(prompt: string, imageBase64?: string, model = AI_MODELS.PRO, temperature = 0.7) {
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
            generationConfig: { temperature, response_mime_type: "application/json" }
        }),
    });

    if (!response.ok) throw new Error(`AI_FAIL [${model}]: ${await response.text()}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

/**
 * [FIJO]: callGeminiAudio
 * Eliminada la restricción de response_mime_type que causaba el error 400.
 * Gemini Audio devuelve el binario en la estructura de respuesta estándar.
 */
export async function callGeminiAudio(prompt: string, directorNote: string) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.AUDIO}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: `INSTRUCCIONES DE ACTUACIÓN: ${directorNote}` },
                    { text: `GUION: ${prompt}` }
                ]
            }]
            // Eliminamos response_mime_type: "audio/wav" para cumplir con el protocolo v1beta
        }),
    });

    if (!response.ok) throw new Error(`AUDIO_GEN_ERROR: ${await response.text()}`);
    const data = await response.json();

    // El audio reside en la propiedad inline_data del primer candidate
    const audioPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data);
    return audioPart?.inline_data?.data;
}

export async function extractAtomicFacts(rawText: string): Promise<string[]> {
    const prompt = `Extrae HECHOS ATÓMICOS del texto en JSON: {"facts": []}. Texto: ${rawText.substring(0, 20000)}`;
    const responseRaw = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.2);
    const result = parseAIJson<{ facts: string[] }>(responseRaw);
    return result.facts || [];
}

export function flattenDossierToFacts(dossier: Record<string, any>): string[] {
    const facts: string[] = [];
    if (Array.isArray(dossier.key_findings)) facts.push(...dossier.key_findings);
    if (dossier.structured_knowledge) {
        Object.entries(dossier.structured_knowledge).forEach(([key, value]) => {
            facts.push(`${key.toUpperCase()}: ${value}`);
        });
    }
    return facts.filter(f => f.length > 25);
}

export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON not found");
        return JSON.parse(jsonMatch[0]) as T;
    } catch {
        throw new Error("FAIL_PARSE_IA");
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: `models/${AI_MODELS.EMBEDDING}`, content: { parts: [{ text }] } })
    });
    const data = await res.json();
    return data.embedding.values;
}

export function cleanTextForSpeech(text: string): string {
    return text.replace(/\[.*?\]/g, "").replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "").replace(/[*#_~`]/g, "").replace(/\s+/g, " ").trim();
}