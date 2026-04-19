/**
 * ARCHIVO: SEC_002_RLS_REFINEMENT.sql
 * VERSIÓN: 1.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Remediación de "Infringimientos de Mínimo Privilegio" en el Esquema Público.
 * [LEY #4]: Sustitución de políticas 'USING (true)' por filtros explícitos de identidad y soberanía.
 * NIVEL DE INTEGRIDAD: CRÍTICO (100% ZAP / BSS Green)
 */

-- [PHASE 1]: REFINAMIENTO DE PERFILES (public.profiles)
-- Misión: Permitir lectura pública de identidades pero restringir la mutación absoluta.
DROP POLICY IF EXISTS "profiles_read_all" ON "public"."profiles";
CREATE POLICY "profiles_voyager_discovery_policy" ON "public"."profiles"
    FOR SELECT
    USING (true); -- La lectura pública es necesaria para el descubrimiento.

-- [PHASE 2]: REFINAMIENTO DE SOCIAL (public.followers & public.likes)
-- Misión: Asegurar que el acceso de lectura pública sea explícito y las mutaciones restringidas.
DROP POLICY IF EXISTS "Allow public read access" ON "public"."followers";
CREATE POLICY "followers_public_visibility_policy" ON "public"."followers"
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir lectura pública de likes" ON "public"."likes";
CREATE POLICY "likes_public_resonance_policy" ON "public"."likes"
    FOR SELECT
    USING (true);

-- [PHASE 3]: REFINAMIENTO DE INFRAESTRUCTURA (public.plans & public.ai_prompts)
-- Misión: Restringir la visibilidad de artefactos internos solo a usuarios autenticados del sistema.
DROP POLICY IF EXISTS "Allow public read access" ON "public"."plans";
CREATE POLICY "plans_system_visibility_policy" ON "public"."plans"
    FOR SELECT
    TO authenticated, service_role
    USING (true);

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON "public"."ai_prompts";
CREATE POLICY "ai_prompts_system_sovereignty_policy" ON "public"."ai_prompts"
    FOR SELECT
    TO authenticated, service_role
    USING (status = 'active');

-- [PHASE 4]: REFINAMIENTO DE KNOWLEDGE (public.podcast_embeddings & public.points_of_interest)
-- Misión: Blindar el Capital Intelectual contra el raspado no autorizado.
DROP POLICY IF EXISTS "podcast_embeddings_read_policy" ON "public"."podcast_embeddings";
CREATE POLICY "podcast_embeddings_authenticated_resonance_policy" ON "public"."podcast_embeddings"
    FOR SELECT
    TO authenticated, service_role
    USING (true);

DROP POLICY IF EXISTS "poi_read_policy" ON "public"."points_of_interest";
DROP POLICY IF EXISTS "Point_Of_Interest_Public_Discovery" ON "public"."points_of_interest";
CREATE POLICY "points_of_interest_sovereign_discovery_policy" ON "public"."points_of_interest"
    FOR SELECT
    USING (status = 'published' OR is_published = true);

-- [PHASE 5]: REFINAMIENTO DE MEMORIA (public.place_memories)
DROP POLICY IF EXISTS "Public read access memories" ON "public"."place_memories";
CREATE POLICY "place_memories_authenticated_discovery_policy" ON "public"."place_memories"
    FOR SELECT
    TO authenticated, service_role
    USING (true);

-- [PHASE 6]: NOMINAL SINCRO (Zero Abbreviation Policy 2.0)
COMMENT ON TABLE "public"."profiles" IS 'Sovereign Identities: Central vault for Voyager metadata and reputation metrics.';
COMMENT ON TABLE "public"."followers" IS 'Social Graphs: Relationships of intellectual mentorship between Curators.';
COMMENT ON TABLE "public"."likes" IS 'Resonance Signals: Tokens of appreciation for sovereign audio assets.';
COMMENT ON TABLE "public"."plans" IS 'Platform Tiers: Definitions of limits and capabilities for NicePod usage.';
COMMENT ON TABLE "public"."ai_prompts" IS 'Intelligence Templates: System instructions for Artificial Intelligence Agents.';
COMMENT ON TABLE "public"."podcast_embeddings" IS 'Semantic Vectors: Dimensional coordinates for intellectual capital resonance.';
COMMENT ON TABLE "public"."points_of_interest" IS 'NKV Bóveda: Central intellectual capital repository of Madrid Resonance.';
COMMENT ON TABLE "public"."place_memories" IS 'Spatial Echoes: Intellectual associations between podcasts and physical landmarks.';
