// supabase/functions/_shared/ai.ts
// VERSIÓN: 2.0 (Optimized for Cost & JSON Reliability)

export const AI_MODELS = {
    FLASH: "gemini-flash-preview", 
    PRO: "gemini-2.5-pro",
    LATEST: "gemini-3-flash-preview" // Alta velocidad, bajo costo
};

/**
 * Procesa el template reemplazando {{key}} por valores reales.
 * Sanitiza strings para evitar que comillas rompan la estructura del prompt.
 */
export function buildPrompt(template: string, data: Record<string, any>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
        const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
        // Escapamos comillas para seguridad en el prompt
        const safeVal = val.replace(/"/g, '\\"');
        prompt = prompt.split(`{{${key}}}`).join(safeVal);
    }
    return prompt.replace(/{{.*?}}/g, ""); 
}

/**
 * Llamada unificada a Google Gemini.
 * Inyecta una instrucción de sistema para forzar JSON y ahorrar tokens de charla.
 */
export async function callGemini(prompt: string, model = AI_MODELS.FLASH) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
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
                response_mime_type: "application/json", // Fuerza la salida JSON a nivel de API
            }
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini Error [${model}]: ${err}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("La IA no devolvió contenido útil.");
    return text;
}

/**
 * Parser de alta resiliencia.
 * Capaz de encontrar un JSON dentro de un bloque de texto si el modelo falla el contrato.
 */
export function parseAIJson(rawText: string) {
    try {
        // Intento 1: Parseo directo
        return JSON.parse(rawText.trim());
    } catch {
        try {
            // Intento 2: Extraer contenido entre las primeras y últimas llaves
            const start = rawText.indexOf('{');
            const end = rawText.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return JSON.parse(rawText.substring(start, end + 1));
            }
        } catch (e) {
            console.error("Error crítico de parseo. Texto crudo:", rawText);
        }
        throw new Error("No se pudo extraer un JSON válido de la respuesta IA.");
    }
}