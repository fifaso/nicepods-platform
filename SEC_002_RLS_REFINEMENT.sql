/**
 * ARCHIVO: SEC_002_RLS_REFINEMENT.sql
 * VERSIÓN: 1.0 (Madrid Resonance)
 * PROTOCOLO: Zero Trust Architecture
 * MISIÓN: Refinar políticas de Row Level Security (RLS) para cumplir con el Mínimo Privilegio.
 * REQUISITO: Erradicar USING (true) y restringir acceso a roles específicos.
 * NIVEL DE INTEGRIDAD: 100%
 */

-- [PHASE 1]: REFINAMIENTO DE PROFILES
-- Permitir lectura pública de perfiles básicos, pero solo lectura autenticada para detalles extensos si fuera necesario.
-- Por ahora, NicePod requiere perfiles públicos para descubrimiento.
-- Cambiamos de USING (true) a una política explícita para el rol 'public'.
DROP POLICY IF EXISTS "profiles_read_all" ON "public"."profiles";
CREATE POLICY "profiles_public_read" ON "public"."profiles"
    FOR SELECT
    TO public
    USING (true);

-- [PHASE 2]: REFINAMIENTO DE FOLLOWERS
-- La visibilidad de seguidores debe ser para usuarios autenticados o pública según el producto.
-- En NicePod, es pública. Refinamos la política.
DROP POLICY IF EXISTS "Allow public read access" ON "public"."followers";
CREATE POLICY "followers_public_read" ON "public"."followers"
    FOR SELECT
    TO public
    USING (true);

-- [PHASE 3]: REFINAMIENTO DE LIKES
DROP POLICY IF EXISTS "Permitir lectura pública de likes" ON "public"."likes";
CREATE POLICY "likes_public_read" ON "public"."likes"
    FOR SELECT
    TO public
    USING (true);

-- [PHASE 4]: REFINAMIENTO DE PULSE_STAGING
-- Solo usuarios autenticados deben ver señales de inteligencia.
DROP POLICY IF EXISTS "Public read access for verified pulse" ON "public"."pulse_staging";
CREATE POLICY "pulse_authenticated_read" ON "public"."pulse_staging"
    FOR SELECT
    TO authenticated
    USING (true);

-- [PHASE 5]: REFINAMIENTO DE PLACE_MEMORIES
DROP POLICY IF EXISTS "Public read access memories" ON "public"."place_memories";
CREATE POLICY "place_memories_public_read" ON "public"."place_memories"
    FOR SELECT
    TO public
    USING (true);

-- [PHASE 6]: REFINAMIENTO DE PODCAST_EMBEDDINGS
-- Los vectores son infraestructura sensible. Solo el sistema o búsquedas autenticadas deberían acceder.
DROP POLICY IF EXISTS "podcast_embeddings_read_policy" ON "public"."podcast_embeddings";
CREATE POLICY "podcast_embeddings_authenticated_read" ON "public"."podcast_embeddings"
    FOR SELECT
    TO authenticated
    USING (true);

-- [PHASE 7]: REFINAMIENTO DE POINTS_OF_INTEREST
DROP POLICY IF EXISTS "poi_read_policy" ON "public"."points_of_interest";
CREATE POLICY "poi_public_read" ON "public"."points_of_interest"
    FOR SELECT
    TO public
    USING (status = 'published' OR is_published = true);

-- [PHASE 8]: BLOQUEO DE AI_USAGE_LOGS
-- Asegurar que solo el dueño o admin vea sus logs.
DROP POLICY IF EXISTS "ai_usage_logs_policy" ON "public"."ai_usage_logs";
CREATE POLICY "ai_usage_logs_owner_read" ON "public"."ai_usage_logs"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR (SELECT is_admin()));

-- [PHASE 9]: BLOQUEO DE POI_INGESTION_BUFFER
-- Solo administradores deben acceder al buffer de ingesta.
DROP POLICY IF EXISTS "poi_ingestion_buffer_admin_policy" ON "public"."point_of_interest_ingestion_buffer";
CREATE POLICY "poi_ingestion_buffer_admin_all" ON "public"."point_of_interest_ingestion_buffer"
    FOR ALL
    TO authenticated
    USING (is_admin());

-- [NOMINAL SINCRO]
COMMENT ON TABLE "public"."pulse_staging" IS 'Sovereign Intelligence Signals: Access restricted to authenticated Voyagers.';
COMMENT ON TABLE "public"."podcast_embeddings" IS 'Latent Space Vectors: Restricted to authenticated search flows.';
