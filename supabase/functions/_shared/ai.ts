// supabase/functions/_shared/ai.ts
// VERSIÓN: 6.0 (Master Engine - Gemini 2.5/3 Standard & Multimodal Vision Support)

/**
 * Identificadores Maatros de Modelos de Google.
 * Centralizamos la gobernanza de modelos para actualizaciones instantáneas en toda la red.
 */
export const AI_MODELS = {
    // Para tareas de alta velocidad e identificación visual rápida
    FLASH: "gemini-2.0-flash", 
    // Estándar de calidad creativa solicitado por el Arquitecto
    PRO_2_5: "gemini-2.5-pro", 
    // Vanguardia tecnológica para razonamiento complejo
    PRO_3_PREVIEW: "gemini-3-pro-preview-01", 
    // Alias para despliegues de alta disponibilidad
    LATEST: "gemini-2.0-flash" 
};

/**
 * Inyecta datos en plantillas de prompts de forma segura.
 * Realiza sanitización de caracteres que podrían romper la estructura del prompt.
 */
export function buildPrompt(template: string, data: Record<string, unknown>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        // Escapamos comillas dobles para evitar inyecciones en el cuerpo del prompt
        const safeValue = stringValue.replace(/"/g, '\\"');
        prompt = prompt.split(`{{${key}}}`).join(safeValue);
    }
    // Limpieza de marcadores de posición no resueltos
    return prompt.replace(/{{.*?}}/g, "").trim();
}

/**
 * Llamada Estándar a Gemini (Texto a Texto).
 * Utiliza configuraciones optimizadas para respuestas JSON.
 */
export async function callGemini(prompt: string, model = AI_MODELS.FLASH) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Configuración fallida: GOOGLE_AI_API_KEY no detectada.");

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
        throw new Error(`Error en API de Gemini [${model}]: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("La IA no pudo generar una respuesta válida o el contenido fue bloqueado.");
    return resultText;
}

/**
 * Llamada Multimodal (Texto + Imagen).
 * Permite que NicePod interprete el entorno físico mediante fotos.
 */
export async function callGeminiMultimodal(
    prompt: string, 
    imageBase64?: string, 
    model = AI_MODELS.FLASH
) {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) throw new Error("Falta clave de API para procesamiento visual.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // El contrato de Gemini exige un array de partes (texto e imagen opcional)
    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
        // Limpiamos el encabezado data:image/... si el frontend lo envía
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
            contents: [{ parts: parts }],
            generationConfig: {
                temperature: 0.4, // Menor temperatura para una identificación visual más factual
                response_mime_type: "application/json",
            }
        }),
    });

    if (!response.ok) throw new Error(`Error Multimodal Gemini: ${await response.text()}`);

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("Fallo en la interpretación visual del entorno.");
    return resultText;
}

/**
 * Extractor de JSON de alta resiliencia.
 * Capaz de limpiar el "ruido" de Markdown (```json) que suelen incluir los modelos Pro.
 */
export function parseAIJson<T = any>(rawText: string): T {
    const cleanText = rawText.trim();
    try {
        // Intento de parseo directo
        return JSON.parse(cleanText);
    } catch {
        // Si falla, buscamos el primer bloque que parezca un objeto { ... }
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (error) {
                console.error("Fallo crítico al parsear JSON extraído:", error);
            }
        }
        throw new Error("No se pudo extraer una estructura JSON válida de la respuesta del Agente.");
    }
}

/**
 * Limpieza profesional de texto para el motor de síntesis de voz (TTS).
 */
export function cleanTextForSpeech(rawText: string): string {
    if (!rawText) return "";
    return rawText
        .replace(/<[^>]+>/g, ' ')       // Elimina etiquetas HTML
        .replace(/[\*_#`~]/g, '')       // Elimina símbolos de Markdown
        .replace(/[\[\]\(\)]/g, '')     // Elimina corchetes y paréntesis que causan pausas raras
        .replace(/\s+/g, ' ')           // Normaliza múltiples espacios
        .trim();
}