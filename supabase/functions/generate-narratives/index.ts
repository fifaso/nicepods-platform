// supabase/functions/generate-narratives/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

interface LinkPointsPayload {
    topicA: string;
    topicB: string;
    catalyst: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }
    try {
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const authHeader = req.headers.get("Authorization")!;
        const { data: { user } } = await supabaseAdmin.auth.getUser(
            authHeader.replace("Bearer ", ""),
        );
        if (!user) throw new Error("Unauthorized");

        const payload: LinkPointsPayload = await req.json();

        const { data: promptData } = await supabaseAdmin.from("ai_prompts")
            .select("prompt_template").eq("agent_name", "generate-narratives")
            .single();
        if (!promptData) {
            throw new Error("Prompt template 'generate-narratives' not found.");
        }

        const catalystClause = payload.catalyst
            ? `utilizando el siguiente concepto como un "lente de análisis": "${payload.catalyst}"`
            : "";
        const prompt = promptData.prompt_template
            .replace("{{topicA}}", payload.topicA)
            .replace("{{topicB}}", payload.topicB)
            .replace("{{catalystClause}}", catalystClause);

        const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanedText = response.text().replace(/```json/g, "").replace(
            /```/g,
            "",
        ).trim();
        const jsonResponse = JSON.parse(cleanedText);

        return new Response(JSON.stringify(jsonResponse), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        const errorMessage = error instanceof Error
            ? error.message
            : "Internal server error";
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
