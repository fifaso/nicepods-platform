// supabase/functions/_shared/ai.ts
// VERSIÓN: 8.6 (Master Standard - Final Production Integrity & Audio Protocol)

/**
 * 📋 INVENTARIO DE CONSUMO DE IA (GOVERNANCE MAP)
 * -----------------------------------------------------------------------------
 * 1. process-podcast-job        -> GEMINI_PRO (Razonamiento Superior)
 * 2. generate-script-draft      -> GEMINI_PRO (Orquestación Híbrida)
 * 3. research-intelligence      -> GEMINI_FLASH (Síntesis de Dossier)
 * 4. vault-refinery             -> GEMINI_FLASH (Destilación NKV)
 * 5. get-local-discovery        -> GEMINI_FLASH (Visión Situacional)
 * 6. generate-audio-from-script -> GEMINI_AUDIO (Interpretación Nativa)
 * 7. search-pro / NKV           -> TEXT_EMBEDDING_004 (ADN Semántico)
 * -----------------------------------------------------------------------------
 */

export const AI_MODELS = {
    // Inteligencia Superior para Redacción y Lógica (Gemini 2.5 Pro)
    PRO: "gemini-2.5-pro",

    // Motor de Alta Velocidad para Procesamiento de Datos (Gemini 3 Flash)
    FLASH: "gemini-3-flash-preview",

    // Generación Nativa de Voz (Speech Generation Preview)
    AUDIO: "gemini-2.5-pro-preview-tts",

    // Motor de Embeddings (Vectores 768d)
    EMBEDDING: "text-embedding-004"
};

/**
 * CONFIGURACIÓN DE APOYO PARA VOCES (Fallback y Mapeo)
 */
export const VOICE_CONFIGS: Record<string, Record<string, string>> = {
    "Masculino": {
        "Profesional": "es-US-Neural2-B",
        "Calmado": "es-US-Neural2-B",
        "Inspirador": "es-US-Neural2-B",
        "Energético": "es-US-Neural2-B"
    },
    "Femenino": {
        "Profesional": "es-US-Neural2-A",
        "Calmado": "es-US-Neural2-A",
        "Inspirador": "es-US-Neural2-A",
        "Energético": "es-US-Neural2-A"
    }
};

/**
 * SPEAKING_RATES: Mapeo de ritmo para compatibilidad
 */
export const SPEAKING_RATES: Record<string, number> = {
    "Lento": 0.85,
    "Moderado": 1.0,
    "Rápido": 1.15
};

/**
 * buildPrompt: Inyecta datos en plantillas de forma segura, sanitizando comillas.
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
 * callGeminiMultimodal: Invocación estándar para texto y visión (Gemini Pro/Flash).
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
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) throw new Error("EMPTY_IA_RESPONSE: No se recibió texto del modelo.");
    return resultText;
}

/**
 * callGeminiAudio: Generación nativa de voz interpretativa (Audio Native).
 * [CORRECCIÓN CRÍTICA V8.6]: Implementación del protocolo de respuesta JSON 
 * para modelos especializados TTS. Esto evita errores 400 de MimeType y Modalidad.
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
                    { text: `SCRIPT TO VOCALIZE: ${prompt}` }
                ]
            }],
            generationConfig: {
                // [NUEVO]: Solicitamos JSON como envoltorio estructural.
                // El modelo TTS inyectará el audio binario en el campo inline_data automáticamente.
                response_mime_type: "application/json",
                temperature: 0.2 // Temperatura baja para consistencia de voz
            }
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`GEMINI_AUDIO_API_REJECTED: ${errText}`);
    }

    const data = await response.json();

    /**
     * EXTRACCIÓN DEL FLUJO BINARIO:
     * En el modo application/json para TTS, el binario viene en la primera parte
     * del contenido del primer candidato, bajo la llave 'inline_data'.
     */
    const audioContent = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data)?.inline_data?.data;

    if (!audioContent) {
        console.error("DEBUG_IA_AUDIO_RESPONSE_FAIL:", JSON.stringify(data));
        throw new Error("IA_AUDIO_DATA_MISSING: El modelo no incluyó el audio Base64 en el JSON.");
    }

    return audioContent;
}

/**
 * extractAtomicFacts: Destilación de conocimiento usando Gemini 3 Flash.
 */
export async function extractAtomicFacts(rawText: string): Promise<string[]> {
    const prompt = `Analiza el texto y extrae una lista de HECHOS ATÓMICOS. Formato JSON: {"facts": []}. Texto: ${rawText.substring(0, 25000)}`;
    const responseRaw = await callGeminiMultimodal(prompt, undefined, AI_MODELS.FLASH, 0.2);
    const result = parseAIJson<{ facts: string[] }>(responseRaw);
    return result.facts || [];
}

/**
 * flattenDossierToFacts: Convierte un dossier JSON en una lista de unidades semánticas.
 * Vital para vectorizar inteligencia estructurada en el NKV.
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
 * parseAIJson: Parser resiliente para extraer JSON de respuestas mixtas de la IA.
 */
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON_NOT_FOUND_IN_RESPONSE");
        return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
        console.error("AI_JSON_PARSE_ERROR_RAW:", rawText);
        throw new Error("Fallo crítico al parsear la respuesta inteligente de la IA.");
    }
}

/**
 * generateEmbedding: Generación de vectores 768d para Búsqueda Semántica (NKV).
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
 * Limpia marcas técnicas de dirección y etiquetas de origen.
 */
export function cleanTextForSpeech(text: string): string {
    if (!text) return "";
    return text
        .replace(/\[.*?\]/g, "") // Elimina marcas como [SFX], [MUSIC], [ORIGIN: VAULT]
        .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "") // Elimina etiquetas de locutor al inicio
        .replace(/\n(Host|Narrador|Speaker\s?\d?):\s?/gim, "\n")
        .replace(/[*#_~`]/g, "") // Elimina Markdown
        .replace(/\s+/g, " ") // Normaliza espacios
        .trim();
}