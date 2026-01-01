// VERSIÓN: 6.3 (Strict Typing Fix)

export const AI_MODELS = {
    FLASH: "gemini-2.0-flash", 
    PRO: "gemini-2.5-pro", 
    LATEST: "gemini-2.0-flash",
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

export async function callGeminiMultimodal(prompt: string, imageBase64?: string, model = AI_MODELS.FLASH) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Missing AI Key");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // [CORRECCIÓN LINEA 25] Cambiamos 'any[]' por un tipo más seguro
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
            generationConfig: { temperature: 0.4, response_mime_type: "application/json" }
        }),
    });

    if (!response.ok) throw new Error(`AI Multimodal Fail: ${await response.text()}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

// [CORRECCIÓN LINEA 46] Cambiamos <T = any> por <T = unknown>
export function parseAIJson<T = unknown>(rawText: string): T {
    try {
        const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON structure found");
        return JSON.parse(jsonMatch[0]) as T;
    } catch {
        throw new Error("Fallo al parsear respuesta inteligente.");
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