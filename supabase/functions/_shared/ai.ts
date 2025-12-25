// supabase/functions/_shared/ai.ts
// VERSIÓN: 4.0 (Master Engine - Gemini 2.5 Pro Standard)

export const AI_MODELS = {
    FLASH: "gemini-2.0-flash",       // El estándar de velocidad actual
    PRO: "gemini-2.5-pro",         // El estándar de calidad solicitado (sustituye al 1.5)
    LATEST: "gemini-2.0-flash"      // Fallback de alta disponibilidad
};

export function buildPrompt(template: string, data: Record<string, unknown>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const safeValue = stringValue.replace(/"/g, '\\"');
        prompt = prompt.split(`{{${key}}}`).join(safeValue);
    }
    return prompt.replace(/{{.*?}}/g, "").trim();
}

export async function callGemini(prompt: string, model = AI_MODELS.FLASH) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY");

    // Endpoint unificado para modelos de nueva generación
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
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
    
    if (!resultText) throw new Error("La IA no devolvió contenido o fue bloqueado por seguridad.");
    return resultText;
}

export function parseAIJson<T = any>(rawText: string): T {
    const cleanText = rawText.trim();
    try {
        return JSON.parse(cleanText);
    } catch {
        const start = cleanText.indexOf('{');
        const end = cleanText.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            return JSON.parse(cleanText.substring(start, end + 1));
        }
        throw new Error("Respuesta IA inválida: No se encontró un JSON procesable.");
    }
}

export function cleanTextForSpeech(rawText: string): string {
    if (!rawText) return "";
    return rawText
        .replace(/<[^>]+>/g, ' ')
        .replace(/[\*_#`~]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}