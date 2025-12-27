// supabase/functions/_shared/ai.ts
// VERSIÓN: 5.0 (Master Engine - Gemini 2.5/3 Standard & Robust JSON Extraction)

/**
 * Identificadores Maatros de Modelos (Google Vertex AI / AI Studio).
 */
export const AI_MODELS = {
    FLASH: "gemini-2.0-flash",           // Estándar de velocidad y eficiencia.
    PRO: "gemini-2.5-pro",               // Estándar de calidad creativa y razonamiento.
    ELITE: "gemini-3-pro-preview",       // Próxima generación (placeholder para compatibilidad).
    LATEST: "gemini-2.0-flash"           // Alias de alta disponibilidad.
};

/**
 * Inyecta datos en plantillas de prompts de forma segura.
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        // Evitamos que las comillas dobles rompan la estructura del prompt inyectado.
        const safeValue = stringValue.replace(/"/g, '\\"');
        prompt = prompt.split(`{{${key}}}`).join(safeValue);
    }
    return prompt.replace(/{{.*?}}/g, "").trim();
}

/**
 * Llamada unificada a Gemini con configuración de contrato estricto.
 */
export async function callGemini(prompt: string, model = AI_MODELS.FLASH) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY environment variable.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                response_mime_type: "application/json",
            }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error [${model}]: ${errorText}`);
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!result) throw new Error("La IA no devolvió contenido útil o fue bloqueado.");
    return result;
}

/**
 * Extractor de JSON de alta resiliencia para modelos multimodales.
 */
export function parseAIJson<T = any>(rawText: string): T {
    const cleanText = rawText.trim();
    try {
        return JSON.parse(cleanText);
    } catch {
        // Fallback: Busca el primer bloque que parezca un objeto JSON.
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error("Fallo al parsear fragmento JSON extraído:", e);
            }
        }
        throw new Error("No se pudo extraer una estructura de datos válida de la respuesta AI.");
    }
}

/**
 * Limpieza profunda de texto para síntesis de voz (TTS).
 * Garantiza que el locutor no lea etiquetas de formato o símbolos de markdown.
 */
export function cleanTextForSpeech(rawText: string): string {
    if (!rawText) return "";
    return rawText
        .replace(/<[^>]+>/g, ' ')       // Elimina etiquetas HTML.
        .replace(/[\*_#`~]/g, '')       // Elimina símbolos de Markdown.
        .replace(/[\[\]\(\)]/g, '')     // Elimina corchetes y paréntesis.
        .replace(/\s+/g, ' ')           // Unifica espacios en blanco.
        .trim();
}