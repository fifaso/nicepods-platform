// supabase/functions/_shared/ai.ts
// VERSIÓN: 8.5 (Master Standard - Clean Audio Protocol & Binary Extraction)

/**
 * 📋 INVENTARIO DE CONSUMO DE IA (GOVERNANCE MAP)
 * -----------------------------------------------------------------------------
 * 1. process-podcast-job        -> GEMINI_PRO (Razonamiento Superior)
 * 2. generate-script-draft      -> GEMINI_PRO (Orquestación Híbrida)
 * 3. research-intelligence      -> GEMINI_FLASH (Síntesis de Dossier)
 * 4. vault-refinery             -> GEMINI_FLASH (Destilación NKV)
 * 5. generate-audio-from-script -> GEMINI_AUDIO (Síntesis de Voz Nativa)
 * 6. search-pro / NKV           -> TEXT_EMBEDDING_004 (ADN Semántico)
 * -----------------------------------------------------------------------------
 */

export const AI_MODELS = {
    PRO: "gemini-2.5-pro",
    FLASH: "gemini-3-flash-preview",
    AUDIO: "gemini-2.5-pro-preview-tts",
    EMBEDDING: "text-embedding-004"
};

/**
 * buildPrompt: Inyecta datos en plantillas de forma segura.
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
 * callGeminiMultimodal: Invocación estándar para texto y visión.
 */
export async function callGeminiMultimodal(
    prompt: string,
    imageBase64?: string,
    model = AI_MODELS.PRO,
    temperature = 0.7
) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL_ERROR: GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const parts: Record<string, unknown>[] = [{ text: prompt }];

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
        throw new Error(`AI_MODALITY_FAIL [${model}]: ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

/**
 * callGeminiAudio: Generación nativa de voz interpretativa (Audio Native).
 * [ACTUALIZACIÓN V8.5]: Protocolo simplificado para modelos TTS Preview.
 * Eliminamos 'response_modalities' de la raíz para evitar el error de 'Unknown name'.
 */
export async function callGeminiAudio(prompt: string, directorNote: string) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("CRITICAL_ERROR: GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.AUDIO}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: `INSTRUCTIONS: ${directorNote}` },
                    { text: `SCRIPT: ${prompt}` }
                ]
            }],
            generationConfig: {
                // Definimos el tipo de respuesta aquí para que el modelo TTS 
                // sepa que debe emitir el flujo binario de audio.
                response_mime_type: "audio/wav",
                temperature: 0.2 // Temperatura baja para estabilidad fonética
            }
        }),
    });

    if (!response.ok) {
        const errText = await response.json();
        throw new Error(`AUDIO_API_REJECTION: ${JSON.stringify(errText)}`);
    }

    const data = await response.json();

    /**
     * EXTRACCIÓN BINARIA:
     * El modelo 'preview-tts' devuelve el audio codificado en Base64 
     * dentro de la estructura inline_data.
     */
    const audioContent = data.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;

    if (!audioContent) {
        console.error("DEBUG_AUDIO_RESPONSE:", JSON.stringify(data));
        throw new Error("EMPTY_AUDIO_CONTENT: El modelo no devolvió datos binarios.");
    }

    return audioContent;
}

/**
 * extractAtomicFacts: Destilación de conocimiento usando Gemini 3 Flash.
 */
export async function extractAtomicFacts(rawText: string): Promise<string[]> {
    const prompt = `Extrae HECHOS ATÓMICOS del texto en JSON: {"facts": []}. Texto: ${rawText.substring(0, 20000)}`;
    const responseRaw = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.2);
    const result = parseAIJson<{ facts: string[] }>(responseRaw);
    return result.facts || [];
}

/**
 * flattenDossierToFacts: Convierte un dossier JSON en una lista de unidades semánticas.
 */
export function flattenDossierToFacts(dossier: Record<string, any>): string[] {
    const facts: string[] = [];
    if (Array.isArray(dossier.key_findings)) facts.push(...dossier.key_findings);
    if (dossier.structured_knowledge && typeof dossier.structured_knowledge === 'object') {
        Object.entries(dossier.structured_knowledge).forEach(([key, value]) => {
            const cleanKey = key.replace(/_/g, ' ').toUpperCase();
            facts.push(`${cleanKey}: ${value}`);
        });
    }
    if (dossier.suggested_hook) {
        facts.push(`PERSPECTIVA NARRATIVA: ${dossier.suggested_hook}`);
    }
    return facts.filter(f => f.length > 25);
}

/**
 * parseAIJson: Parser resiliente para extraer JSON de respuestas mixtas.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON_STRUCTURE_NOT_FOUND");
        return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
        console.error("AI_JSON_PARSE_ERROR:", rawText);
        throw new Error("Fallo crítico al procesar la respuesta inteligente.");
    }
}

/**
 * generateEmbedding: Generación de vectores 768d para Búsqueda Semántica.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY_MISSING");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${AI_MODELS.EMBEDDING}`,
            content: { parts: [{ text }] }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`EMBEDDING_API_ERROR: ${errText}`);
    }

    const data = await response.json();
    return data.embedding.values;
}

/**
 * cleanTextForSpeech: Filtro de ruido narrativo para locución fluida.
 */
export function cleanTextForSpeech(text: string): string {
    if (!text) return "";
    return text
        .replace(/\[.*?\]/g, "")
        .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "")
        .replace(/\n(Host|Narrador|Speaker\s?\d?):\s?/gim, "\n")
        .replace(/[*#_~`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}