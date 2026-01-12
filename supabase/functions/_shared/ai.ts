// supabase/functions/_shared/ai.ts
// VERSIÓN: 8.4 (Master Standard - Strict Audio Modality & Protocol Fix)

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

    // Motor de Alta Velocidad para Procesamiento de Datos
    FLASH: "gemini-3-flash-preview",

    // Generación Nativa de Voz (Speech Generation)
    AUDIO: "gemini-2.5-pro-preview-tts",

    // Motor de Embeddings (Vectores 768d)
    EMBEDDING: "text-embedding-004"
};

/**
 * CONFIGURACIÓN DE APOYO PARA AUDIO TRADICIONAL (Fallback)
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

export const SPEAKING_RATES: Record<string, number> = {
    "Lento": 0.85,
    "Moderado": 1.0,
    "Rápido": 1.15
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
 * [ACTUALIZACIÓN V8.4]: Implementación de 'response_modalities' a nivel raíz 
 * para satisfacer el contrato estricto de Gemini Audio y evitar Error 400.
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
                    { text: `INSTRUCCIONES DE ACTUACIÓN: ${directorNote}` },
                    { text: `GUION A INTERPRETAR: ${prompt}` }
                ]
            }],
            // [FILTRO DE MODALIDAD]: Obliga al modelo a responder ÚNICAMENTE con audio.
            // Esto resuelve el error "requested combination of response modalities (TEXT) is not supported".
            response_modalities: ["AUDIO"],
            generationConfig: {
                // Mantenemos la temperatura baja para asegurar una locución estable y consistente.
                temperature: 0.3,
            }
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AUDIO_GEN_PROTOCOL_ERROR: ${errText}`);
    }

    const data = await response.json();

    // El audio reside en la propiedad inline_data del mensaje de respuesta de la IA.
    // Buscamos específicamente la parte que contiene los datos binarios.
    const audioPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data);

    if (!audioPart?.inline_data?.data) {
        throw new Error("IA_AUDIO_PAYLOAD_MISSING: El modelo no devolvió el binario de audio.");
    }

    return audioPart.inline_data.data;
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
 * Elimina marcas técnicas que la IA no debe leer en voz alta.
 */
export function cleanTextForSpeech(text: string): string {
    if (!text) return "";
    return text
        .replace(/\[.*?\]/g, "") // Elimina [SFX], [MUSIC], [ORIGIN], etc.
        .replace(/^(Host|Narrador|Speaker\s?\d?):\s?/gim, "") // Elimina etiquetas de locutor
        .replace(/\n(Host|Narrador|Speaker\s?\d?):\s?/gim, "\n")
        .replace(/[*#_~`]/g, "") // Elimina Markdown residual
        .replace(/\s+/g, " ") // Normaliza espacios en blanco
        .trim();
}