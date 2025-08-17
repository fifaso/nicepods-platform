// supabase/functions/supervisor/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (_req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: pendingJobs, error: selectError } = await supabaseAdmin
      .from('podcast_creation_jobs')
      .select('id')
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .limit(5);

    if (selectError) { throw new Error(`Failed to fetch pending jobs: ${selectError.message}`); }
    if (!pendingJobs || pendingJobs.length === 0) {
      return new Response(JSON.stringify({ message: "No pending jobs." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const processingPromises = pendingJobs.map(job =>
      supabaseAdmin.functions.invoke('process-podcast-job', { body: { job_id: job.id } })
    );

    await Promise.allSettled(processingPromises);

    return new Response(JSON.stringify({ message: `Invoked workers for ${pendingJobs.length} jobs.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error(`Critical error in supervisor: ${errorMessage}`);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});