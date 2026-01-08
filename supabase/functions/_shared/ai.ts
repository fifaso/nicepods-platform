// supabase/functions/_shared/ai.ts
// VERSIÓN: 6.5 (Standardized gemini-2.5-pro Implementation)

export const AI_MODELS = {
    // Sincronización total con la instrucción del usuario: Gemini 2.5 Pro
    FLASH: "gemini-2.5-pro",
    PRO: "gemini-2.5-pro",
    LATEST: "gemini-2.5-pro",
    EMBEDDING: "text-embedding-004"
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

export async function callGeminiMultimodal(prompt: string, imageBase64?: string, model = AI_MODELS.PRO) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts: Record<string, unknown>[] = [{ text: prompt }];

    if (imageBase64) {
        const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
        parts.push({
            inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
            }
        });
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
                temperature: 0.7,
                response_mime_type: "application/json"
            }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Multimodal Fail [${model}]: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) throw new Error("IA devolvió una respuesta vacía.");
    return resultText;
}

export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No se detectó estructura JSON en la respuesta.");
        return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
        console.error("Parse Error Raw Text:", rawText);
        throw new Error("Fallo crítico al parsear respuesta inteligente.");
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Missing AI Key for Embeddings");

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
        throw new Error(`Embedding Fail: ${errText}`);
    }

    const data = await response.json();
    return data.embedding.values;
}