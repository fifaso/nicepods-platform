# Navigator Journal - Edge Routing & Graph Resolution

## Phase 1: Initialization and Graph Audit

The following files within `supabase/functions/` contain the illegal `@/` alias in their import statements, causing coupling with Next.js/Webpack resolution logic and failing the Deno Edge Runtime deployment graph.

### Affected Files and Imports

- `supabase/functions/pulse-janitor/index.ts`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/pulse-matcher/index.ts`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
  - `import { guard } from "@/supabase/functions/_shared/guard.ts";`
  - `import { Database } from "@/types/database.types.ts";`
- `supabase/functions/update-resonance-profile/index.ts`
  - `import { guard } from "@/supabase/functions/_shared/guard.ts";`
- `supabase/functions/geo-narrative-creator/index.ts`
  - `import { AI_MODELS, parseAIJson } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/update-user-dna/index.ts`
  - `import { AI_MODELS, callGeminiMultimodal, generateEmbedding } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders, guard } from "@/supabase/functions/_shared/guard.ts";`
  - `import { Database } from "@/types/database.types.ts";`
- `supabase/functions/generate-script-draft/index.ts`
  - `import { AI_MODELS, buildPrompt, cleanTextForSpeech } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/assemble-final-audio/index.ts`
  - `import { AUDIO_CONFIG, createWavHeader } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/geo-sensor-ingestor/index.ts`
  - `import { AI_MODELS, parseAIJson } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/admin-backfill-embeddings/index.ts`
  - `import { cleanTextForSpeech, generateEmbedding } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/pulse-harvester/index.ts`
  - `import { generateEmbedding } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/generate-audio-from-script/index.ts`
  - `import { AUDIO_CONFIG, callGeminiAudio, cleanTextForSpeech, createWavHeader } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
  - `import { generateDirectorNote } from "@/supabase/functions/_shared/vocal-director-map.ts";`
- `supabase/functions/generate-cover-image/index.ts`
  - `import { ... } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/generate-narratives/index.ts`
  - `import { guard } from "@/supabase/functions/_shared/guard.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/transcribe-idea/index.ts`
  - `import { guard } from "@/supabase/functions/_shared/guard.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/generate-briefing-pill/index.ts`
  - `import { ... } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders, guard } from "@/supabase/functions/_shared/guard.ts";`
- `supabase/functions/geo-resolve-location/index.ts`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/vault-refinery/index.ts`
  - `import { extractAtomicFacts, generateEmbedding } from "@/supabase/functions/_shared/ai.ts";`
  - `import { guard } from "@/supabase/functions/_shared/guard.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
  - `import { Database } from "@/types/database.types.ts";`
- `supabase/functions/generate-embedding/index.ts`
  - `import { ... } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/search-pro/index.ts`
  - `import { generateEmbedding } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/research-intelligence/index.ts`
  - `import { generateEmbedding } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`
- `supabase/functions/geo-transcribe-intent/index.ts`
  - `import { AI_MODELS } from "@/supabase/functions/_shared/ai.ts";`
  - `import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";`

### Summary
Total files affected: 21
Total illegal imports: ~45
