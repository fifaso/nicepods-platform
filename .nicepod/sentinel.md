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
**STATUS: GREEN**
`npx tsc --noEmit` executed successfully with 0 errors. Nominal integrity established across all axial propagation points (Forms, Actions, Hooks).

## 2024-05-23 - Sovereign Profile Integrity & RLS Audit

### Vulnerability Identified: Privilege Escalation (Profiles)
- **Root Cause**: The Row Level Security policy `profiles_update_own` allows authenticated users to update all columns of their own profile record.
- **Risk**: Malicious actors can escalate their own `role` to `'admin'`, inflate `reputation_score`, or manipulate social metrics (`followers_count`, `following_count`) via direct client-side database calls (Supabase Client).
- **Hardening Requirement**: Implementation of a `BEFORE UPDATE` trigger to seal administrative columns from non-system modifications.

### Security Finding: Missing RLS Enforcement
- **Table**: `private.secrets`
- **Issue**: This table lacks the `ENABLE ROW LEVEL SECURITY` instruction.
- **Status**: Recorded for future remediation (Phase 2).
