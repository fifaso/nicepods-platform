/**
 * 📋 INVENTARIO DE CONSUMO DE IA (GOVERNANCE MAP)
 * -----------------------------------------------------------------------------
 * 1. process-podcast-job        -> GEMINI_PRO (Razonamiento y Estructura)
 * 2. generate-script-draft      -> GEMINI_PRO (Orquestación Híbrida)
 * 3. research-intelligence      -> GEMINI_FLASH (Análisis y Creación de Dossier)
 * 4. vault-refinery             -> GEMINI_FLASH (Destilación de Hechos Atómicos)
 * 5. get-local-discovery        -> GEMINI_FLASH (Visión Situacional)
 * 6. generate-audio-from-script -> GEMINI_AUDIO (Interpretación Nativa)
 * 7. search-pro / NKV           -> TEXT_EMBEDDING_004 (ADN Semántico)
 * -----------------------------------------------------------------------------
 */

export const AI_MODELS = {
    // Inteligencia Superior para Redacción y Lógica
    PRO: "gemini-2.5-pro",

    // Motor de Alta Velocidad para Procesamiento de Datos (Ex-1.5 Flash)
    FLASH: "gemini-3-flash-preview",

    // Generación Nativa de Voz (Speech Generation)
    AUDIO: "gemini-2.5-pro-preview-tts",

    // Motor de Embeddings (Vectores 768d)
    EMBEDDING: "text-embedding-004"
};

/**
 * CONFIGURACIÓN DE APOYO PARA AUDIO
 */
export const VOICE_CONFIGS: Record<string, Record<string, string>> = {
    "Masculino": { "Profesional": "es-US-Neural2-B", "Calmado": "es-US-Neural2-B" },
    "Femenino": { "Profesional": "es-US-Neural2-A", "Calmado": "es-US-Neural2-A" }
};

export const SPEAKING_RATES: Record<string, number> = {
    "Lento": 0.85, "Moderado": 1.0, "Rápido": 1.15
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
    if (!apiKey) throw new Error("CRITICAL: GOOGLE_AI_API_KEY_MISSING");

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
            generationConfig: { temperature, response_mime_type: "application/json" }
        }),
    });

    if (!response.ok) throw new Error(`AI_ERROR [${model}]: ${await response.text()}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

/**
 * callGeminiAudio: Generación nativa de voz interpretativa.
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
                    { text: `GUION A INTERPRETAR: ${prompt}` }
                ]
            }],
            generationConfig: { response_mime_type: "audio/wav" }
        }),
    });

    if (!response.ok) throw new Error(`AUDIO_GEN_ERROR: ${await response.text()}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data)?.inline_data?.data;
}

/**
 * extractAtomicFacts: Destilación de conocimiento usando Gemini 3 Flash.
 */
export async function extractAtomicFacts(rawText: string): Promise<string[]> {
    const prompt = `Extrae HECHOS ATÓMICOS de este texto. Formato JSON: {"facts": []}. Texto: ${rawText.substring(0, 20000)}`;
    const responseRaw = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.2);
    const result = parseAIJson<{ facts: string[] }>(responseRaw);
    return result.facts || [];
}

/**
 * flattenDossierToFacts: Convierte un dossier JSON en una lista de unidades semánticas.
 * [NUEVO V8.1]: Vital para vectorizar inteligencia estructurada en el NKV.
 */
export function flattenDossierToFacts(dossier: Record<string, any>): string[] {
    const facts: string[] = [];

    // 1. Extraer Hallazgos Clave
    if (Array.isArray(dossier.key_findings)) {
        facts.push(...dossier.key_findings);
    }

    // 2. Aplanar Conocimiento Estructurado
    if (dossier.structured_knowledge && typeof dossier.structured_knowledge === 'object') {
        Object.entries(dossier.structured_knowledge).forEach(([key, value]) => {
            const cleanKey = key.replace(/_/g, ' ').toUpperCase();
            facts.push(`${cleanKey}: ${value}`);
        });
    }

    // 3. Incluir el Hook Narrativo como unidad de valor
    if (dossier.suggested_hook) {
        facts.push(`PERSPECTIVA NARRATIVA: ${dossier.suggested_hook}`);
    }

    // Filtro de calidad: Solo hechos con densidad informativa suficiente
    return facts.filter(f => f.length > 25);
}

/**
 * parseAIJson: Parser resiliente.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");
        return JSON.parse(jsonMatch[0]) as T;
    } catch {
        throw new Error("FAIL_PARSE_INTELLIGENCE");
    }
}

/**
 * generateEmbedding: Generación de vectores 768d.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.EMBEDDING}:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: `models/${AI_MODELS.EMBEDDING}`, content: { parts: [{ text }] } })
    });
    const data = await response.json();
    return data.embedding.values;
}

/**
 * cleanTextForSpeech: Filtro de ruido para locución fluida.
 */
export function cleanTextForSpeech(text: string): string {
    return text
        .replace(/\[.*?\]/g, "") // Limpia marcas de [SFX], [MUSIC], [ORIGIN]
        .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "") // Limpia etiquetas de locutor
        .replace(/[*#_~`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}