// supabase/functions/_shared/ai.ts
// VERSIÓN: 3.0 (NicePod Engine v1.0 - Full Multimodal & Voice Config)

/**
 * Identificadores de Modelos de Google Gemini.
 * Centralizamos aquí para actualizar toda la plataforma en un solo cambio.
 */
export const AI_MODELS = {
    FLASH: "gemini-1.5-flash",        // Ideal para transcripciones y tareas rápidas
    PRO: "gemini-1.5-pro",            // Para guiones de alta complejidad creativa
    LATEST: "gemini-2.0-flash-exp"    // Modelo de vanguardia para 2025 (Alta velocidad)
};

/**
 * Mapa Maestro de Voces para Google TTS (Neural2).
 * Unificamos la personalidad sonora de NicePod.
 */
export const VOICE_CONFIGS: Record<string, Record<string, string>> = {
    "Masculino": {
        "Calmado": "es-US-Neural2-B",
        "Energético": "es-US-Neural2-B",
        "Profesional": "es-US-Neural2-B",
        "Inspirador": "es-US-Neural2-B",
    },
    "Femenino": {
        "Energético": "es-US-Neural2-A",
        "Profesional": "es-US-Neural2-A",
        "Calmado": "es-US-Neural2-C",
        "Inspirador": "es-US-Neural2-C",
    }
};

/**
 * Mapeo de velocidad de lectura.
 */
export const SPEAKING_RATES: Record<string, number> = {
    "Lento": 0.85,
    "Moderado": 1.0,
    "Rápido": 1.15,
};

/**
 * Procesa plantillas de prompts reemplazando {{key}} con datos reales.
 * Sanitiza las entradas para evitar inyecciones que rompan el formato del prompt.
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        // Sanitización básica: escapamos comillas dobles para no romper strings en el prompt
        const safeValue = stringValue.replace(/"/g, '\\"');
        prompt = prompt.split(`{{${key}}}`).join(safeValue);
    }
    // Limpieza de variables no resueltas para evitar que la IA vea basura
    return prompt.replace(/{{.*?}}/g, "").trim();
}

/**
 * Realiza una llamada robusta a la API de Gemini.
 * Forzamos 'response_mime_type' para asegurar que la IA siempre devuelva JSON.
 */
export async function callGemini(prompt: string, model = AI_MODELS.FLASH) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY env var.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                response_mime_type: "application/json",
            }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error [${model}]: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("La IA devolvió una respuesta vacía o bloqueada por seguridad.");
    return resultText;
}

/**
 * Parser de JSON de alta resiliencia.
 * Si la IA incluye texto extra o markdown, lo limpia y extrae el objeto real.
 */
export function parseAIJson<T = any>(rawText: string): T {
    const cleanText = rawText.trim();
    try {
        // Intento 1: Parseo directo
        return JSON.parse(cleanText);
    } catch {
        try {
            // Intento 2: Búsqueda heurística de llaves (limpieza de markdown)
            const firstBrace = cleanText.indexOf('{');
            const lastBrace = cleanText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonSubstring = cleanText.substring(firstBrace, lastBrace + 1);
                return JSON.parse(jsonSubstring);
            }
        } catch (e) {
            console.error("Fallo total al parsear JSON IA. Texto recibido:", rawText);
        }
        throw new Error("No se pudo extraer un formato JSON válido de la respuesta del Agente.");
    }
}

/**
 * Limpia el guion de etiquetas HTML y Markdown antes de enviarlo al TTS.
 * Evita que el motor de voz intente "leer" los símbolos.
 */
export function cleanTextForSpeech(rawText: string): string {
    if (!rawText) return "";
    return rawText
        .replace(/<[^>]+>/g, ' ')       // Elimina etiquetas HTML
        .replace(/[\*_#`~]/g, '')       // Elimina símbolos Markdown
        .replace(/\s+/g, ' ')           // Normaliza espacios
        .trim();
}