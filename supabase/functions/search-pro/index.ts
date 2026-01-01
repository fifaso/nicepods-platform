import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { generateEmbedding } from "ai-core";
import { corsHeaders } from "cors"; // Importamos directo de cors.ts vía alias

console.log("Search-Pro Function Initialized v1.0");

serve(async (req: Request) => {
  // 1. Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Parseo de datos
    const { query, userLat, userLng } = await req.json();

    if (!query) throw new Error("Query parameter is required");

    // 3. Generar Vector (usando la nueva función en ai.ts)
    const embedding = await generateEmbedding(query);

    // 4. Conexión DB (Service Role para poder buscar globalmente)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 5. Ejecutar RPC Híbrida
    const { data, error } = await supabase.rpc("search_geo_semantic", {
      query_embedding: embedding, // Supabase convierte array a vector automáticamente
      user_lat: userLat,
      user_long: userLng,
      radius_units: 0.1, // ~10km aprox (ajustable según tu lógica de coords)
      match_threshold: 0.5,
      match_count: 20
    });

    if (error) {
      console.error("RPC Error:", error);
      throw new Error(`Database Error: ${error.message}`);
    }

    // 6. Retorno de datos
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown internal error';
    console.error("Search Logic Error:", errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});