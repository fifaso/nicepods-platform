// supabase/functions/queue-podcast-job/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }) }
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { throw new Error("Unauthorized") }

    const payload = await req.json();
    if (!payload.style || !payload.inputs) { throw new Error("Invalid payload structure.") }
    
    const { error: rpcError } = await supabaseClient.rpc('increment_jobs_and_queue', {
      p_user_id: user.id,
      p_payload: payload
    });
    if (rpcError) { throw new Error(`RPC Error: ${rpcError.message}`) }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error(`Error in queue-podcast-job: ${errorMessage}`);
    return new Response(JSON.stringify({ error: "An internal server error occurred." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});