// supabase/functions/geo-suite/_shared/gemini-client.ts
// VERSIÓN: 1.0 (Google Vertex/Gemini Adapter for Geo Suite)

export interface GeminiConfig {
  apiKey: string;
  model: "gemini-2.0-flash" | "gemini-1.5-pro"; // Modelos rápidos y capaces
}

export interface AIResponse {
  text: string;
  json?: any;
}

export class MadridAIClient {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Genera contenido basado en texto y opcionalmente imágenes (Multimodal)
   */
  async generate(
    systemInstruction: string,
    userPrompt: string,
    imageBase64?: string,
    jsonMode: boolean = false
  ): Promise<AIResponse> {
    const model = jsonMode ? "gemini-1.5-pro" : "gemini-2.0-flash";
    const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;

    const parts: any[] = [{ text: userPrompt }];

    // Si hay imagen, la adjuntamos (Vision)
    if (imageBase64) {
      // Limpiamos el header del base64 si viene del frontend
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: cleanBase64
        }
      });
    }

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: parts }],
      generationConfig: {
        temperature: 0.7,
        response_mime_type: jsonMode ? "application/json" : "text/plain"
      }
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) throw new Error("Gemini returned empty response");

      return {
        text: rawText,
        json: jsonMode ? JSON.parse(rawText) : null
      };

    } catch (error) {
      console.error("AI Generation Failed:", error);
      throw error;
    }
  }
}