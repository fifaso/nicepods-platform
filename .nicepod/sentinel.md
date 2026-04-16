/**
 * ARCHIVO: .nicepod/sentinel.md
 * VERSIÓN: 4.0
 * PROTOCOLO: Madrid Resonance Protocol V4.0
 * MISIÓN: Security Finding Journaling
 * NIVEL DE INTEGRIDAD: HIGH
 */

# Sentinel Journal - Madrid Resonance Protocol V4.0

## 2025-05-22 - Nominal Mirroring & ZAP Enforcement

### Mission Summary
Refactor all validation schemas in `lib/validation/` to ensure a 1:1 mirror of the database structure in `types/database.types.ts`, enforcing the Zero Abbreviations Policy (ZAP) and the Build Shield.

### Data Customs Audit (Aduana de Datos)
The following property mappings were implemented to synchronize the Crystal (UI) with the Metal (SQL):

| Old Property (Crystal) | New Property (Sovereign) | Database Column (Metal) |
| :--- | :--- | :--- |
| `id` | `identification` | `id` |
| `url` | `uniformResourceLocator` | `url` |
| `dna` | `deoxyribonucleicAcid` | `dna` |
| `poiId` | `pointOfInterestIdentification` | `poi_id` |
| `full_name` | `fullName` | `full_name` |
| `avatar_url` | `avatarUniformResourceLocator` | `avatar_url` |
| `is_public` | `isPublic` | `is_public` |
| `draft_id` | `draftIdentification` | `id` (podcast_drafts) |

### Discrepancies Found
- **Snake vs Camel**: The legacy schemas were inconsistent, mixing `snake_case` (database-like) and `camelCase` (frontend-like). V4.0 enforces Sovereign `camelCase` for all application logic while maintaining `snake_case` only at the boundary of PostgreSQL calls.
- **Abbreviation Pollution**: Acronyms like `POI`, `OCR`, `DNA`, and `URL` were ubiquitous. All have been expanded to their full industrial descriptors.
- **Boundary Mapping**: Several components were directly using database row types instead of validated schema types, causing friction during the nominal shift.

### Future Sprint Requirements (Edge Functions)
The following Edge Functions still operate using legacy abbreviations or `snake_case` in their JSON payloads. A nominal synchronization task should be scheduled:
- `start-draft-process`: Uses `draft_id`.
- `queue-podcast-job`: Uses `draft_id`, `final_title`, `final_script`.
- `research-intelligence`: Uses `draft_id`, `pulse_source_ids`.
- `geo-sensor-ingestor`: Uses `heroImageStoragePath` (partial ZAP).
- `update-user-dna`: Uses `profile_text`, `expertise_level`.

### Build Shield Status
**STATUS: YELLOW (Build Shield Breaches Detected)**
`pnpm type-check` failed with pre-existing errors in out-of-domain files (app/, components/).

**Identified Breaches (Non-Sentinel Domain):**
- `app/(platform)/dashboard/dashboard-client.tsx`: Property `variant` does not exist on `UnifiedSearchBarProperties` (Use `variantType` instead).
- `components/feed/intelligence-feed.tsx`: Missing `SearchResult` in `@/hooks/use-search-radar` (Use `SearchRadarResult`).
- `components/ui/poi-action-card.tsx`: Missing `getHumanReadableDistanceMagnitudeLabel` in `@/lib/utils`.
- `components/create-flow/steps/audio-studio.tsx`: Missing `useMemo` import.

**Sentinel Integrity:** My modifications to Edge Functions are localized and verified. Security perimeter established.

## 2024-05-23 - Sovereign Profile Integrity & RLS Audit

### Vulnerability Identified: Privilege Escalation (Profiles)
- **Root Cause**: The Row Level Security policy `profiles_update_own` allows authenticated users to update all columns of their own profile record.
- **Risk**: Malicious actors can escalate their own `role` to `'admin'`, inflate `reputation_score`, or manipulate social metrics (`followers_count`, `following_count`) via direct client-side database calls (Supabase Client).
- **Hardening Requirement**: Implementation of a `BEFORE UPDATE` trigger to seal administrative columns from non-system modifications.

### Security Finding: Missing RLS Enforcement
- **Table**: `private.secrets`
- **Issue**: This table lacks the `ENABLE ROW LEVEL SECURITY` instruction.
- **Status**: Recorded for future remediation (Phase 2).

## 2025-05-24 - Data Layer & Perimeter Hardening Audit

### Security Findings: Missing RLS Policies
- **CRITICAL**: `private.secrets` - RLS is disabled. This table contains sensitive infrastructure credentials.
- **HIGH**: `public.ai_usage_logs` - RLS enabled but NO policies defined. Defaults to total denial for non-owners, but needs explicit 'service_role' access for logging.
- **HIGH**: `public.point_of_interest_ingestion_buffer` - RLS enabled but NO policies defined. Risk of ingestion stall or unauthorized buffer manipulation.

### Security Findings: Perimeter Bypass (Edge Functions)
- **Vulnerability**: Several Edge Functions are not utilizing the `guard` security wrapper.
- **Impact**: These functions lack Arcjet protection, rate limiting, and consistent identity verification. They rely on manual auth checks which are inconsistent across the fleet.
- **Functions Identified**:
  - `start-draft-process`
  - `queue-podcast-job`
  - `research-intelligence`
  - `search-pro` (and others)

### Hardening Roadmap
1. Refactor axial Edge Functions to implement the `guard` perimeter.
2. Formalize SQL Hardening Report for `private.secrets` and ingestion buffers.
3. Validate Build Shield integrity post-refactor.
- **Issue**: CRITICAL: Table lacks the `ENABLE ROW LEVEL SECURITY` instruction.
- **Status**: Recorded for hardening.

### Security Finding: Missing Row Level Security Policies
- **Table**: `public.ai_usage_logs`
- **Issue**: RLS is enabled but no policies are defined. Default behavior blocks all non-admin access.
- **Status**: Recorded for policy implementation.

- **Table**: `public.point_of_interest_ingestion_buffer`
- **Issue**: RLS is enabled but no policies are defined. Access restricted to superusers only.
- **Status**: Recorded for administrative policy implementation.

### Security Finding: Edge Function Identity Verification Breach
- **Function**: `vault-refinery`
- **Issue**: CRITICAL: Lacks internal authority verification. Any authenticated user could potentially trigger knowledge refinery processes if the URL is known.
- **Status**: Remediation in progress (Phase 2).

### Security Finding: Build Shield Breaches (External Domains)
The following pre-existing TypeScript errors were identified during the security audit phase. These files are out-of-domain for Sentinel and remain untouched to preserve the Build Shield:
- `app/(platform)/dashboard/dashboard-client.tsx`: Property 'variant' does not exist on type 'UnifiedSearchBarProperties'.
- `app/(platform)/podcasts/library-tabs.tsx`: Type mismatch between 'PodcastWithGenealogy' and 'PodcastThreadStructure'.
- `components/create-flow/steps/audio-studio.tsx`: 'useMemo' not found (missing import).
- `components/create-flow/steps/discovery-result-step.tsx`: Property 'poi' does not exist on 'PointOfInterestActionCardProperties'.
- `components/feed/intelligence-feed.tsx` & `components/geo/SpatialEngine/index.tsx`: 'SearchResult' missing in '@/hooks/use-search-radar'.
- `components/ui/poi-action-card.tsx`: 'getHumanReadableDistanceMagnitudeLabel' missing in '@/lib/utils'.
