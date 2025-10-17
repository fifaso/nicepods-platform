// supabase/functions/get-audio-options/index.ts
// VERSIÓN DE PRODUCCIÓN FINAL

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";

// Definimos la estructura de la voz que devolveremos, simplificando la respuesta de Google.
interface VoiceOption {
  name: string;
  description: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

// Nombres descriptivos para las voces que hemos pre-seleccionado.
const voiceDescriptions: Record<string, string> = {
  "es-US-Wavenet-A": "Voz Masculina (EE.UU., Clara)",
  "es-US-Wavenet-B": "Voz Masculina (EE.UU., Grave)",
  "es-US-Wavenet-C": "Voz Femenina (EE.UU., Cálida)",
  "es-ES-Wavenet-B": "Voz Masculina (España, Formal)",
  "es-ES-Wavenet-C": "Voz Femenina (España, Suave)",
  "en-US-Wavenet-D": "Voz Masculina (EE.UU., Profesional)",
  "en-US-Wavenet-F": "Voz Femenina (EE.UU., Profesional)",
};

serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Autenticación: Asegurarnos de que solo usuarios logueados puedan llamar a esta función.
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) throw new Error("Cabecera de autorización requerida.");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorizationHeader } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("La clave GOOGLE_AI_API_KEY no está configurada.");

    // 2. Llamada a la API de Google para obtener la lista de voces.
    const voicesResponse = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${GOOGLE_API_KEY}`);
    if (!voicesResponse.ok) {
      throw new Error("No se pudo obtener la lista de voces de Google.");
    }
    const { voices } = await voicesResponse.json();

    // 3. Curación y Transformación: Filtramos y simplificamos los datos.
    const curatedVoices: VoiceOption[] = voices
      .filter((voice: any) => voice.name in voiceDescriptions) // Nos quedamos solo con las voces que hemos pre-seleccionado
      .map((voice: any) => ({
        name: voice.name,
        description: voiceDescriptions[voice.name],
        gender: voice.ssmlGender,
      }));

    return new Response(JSON.stringify({ voices: curatedVoices }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error en get-audio-options:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});