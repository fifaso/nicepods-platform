-- NICEPOD V2.5: CORE ARCHITECTURE DNA (V3.0)
-- Destilado Profesional para Sucesión AI - Grado Industrial

CREATE OR REPLACE FUNCTION "public"."check_podcast_integrity_and_release"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    
    IF NEW.audio_ready = TRUE AND NEW.image_ready = TRUE THEN
        UPDATE public.micro_pods 
        SET 
            processing_status = 'completed',
            published_at = COALESCE(published_at, now()),
            updated_at = now()
        WHERE id = NEW.id 
        AND processing_status = 'processing'; -- Seguridad contra doble ejecución
    END IF;

CREATE OR REPLACE FUNCTION "public"."claim_next_research_topic"() RETURNS TABLE("topic_id" bigint, "topic_text" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  UPDATE public.research_backlog
      updated_at = now()
  WHERE id = (
    FROM public.research_backlog 
    WHERE status = 'pending' 
    ORDER BY request_count DESC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED -- LA CLAVE: Bloquea la fila y salta si otra instancia ya la tiene
  )
  RETURNING id, topic;

CREATE OR REPLACE FUNCTION "public"."cleanup_expired_pulse"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM public.pulse_staging WHERE expires_at < now();

CREATE OR REPLACE FUNCTION "public"."create_profile_and_free_subscription"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ DECLARE free_plan_id BIGINT; BEGIN SELECT id INTO free_plan_id FROM public.plans WHERE name = 'Gratuito' LIMIT 1; IF free_plan_id IS NULL THEN RAISE EXCEPTION 'Plan "Gratuito" no encontrado.'; END IF; INSERT INTO public.profiles (id, username, full_name, avatar_url, role) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.id::text), NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', 'user'); INSERT INTO public.subscriptions (user_id, plan_id, status) VALUES (NEW.id, free_plan_id, 'active'); UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('user_role', 'user') WHERE id = NEW.id; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION "public"."get_memories_in_bounds"("min_lat" double precision, "min_lng" double precision, "max_lat" double precision, "max_lng" double precision) RETURNS TABLE("id" bigint, "lat" double precision, "lng" double precision, "title" "text", "focus_entity" "text", "content_type" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.pod_id as id,
        ST_Y(pm.geo_location::geometry) as lat,
        ST_X(pm.geo_location::geometry) as lng,
        mp.title,
        pm.focus_entity,
        pm.content_type
    FROM 
        public.place_memories pm
    JOIN 
        public.micro_pods mp ON pm.pod_id = mp.id
    WHERE 
        pm.geo_location::geometry && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    LIMIT 100; -- Protección contra sobrecarga de UI
END;

CREATE OR REPLACE FUNCTION "public"."get_nearby_podcasts"("p_lat" double precision, "p_lng" double precision, "p_radius_meters" integer DEFAULT 1000, "p_limit" integer DEFAULT 10) RETURNS TABLE("id" bigint, "title" "text", "description" "text", "audio_url" "text", "cover_image_url" "text", "distance_meters" double precision, "profiles" json)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.title,
    mp.description,
    mp.audio_url,
    mp.cover_image_url,
    ST_Distance(mp.geo_location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) as distance_meters,
    json_build_object(
        'full_name', prof.full_name,
        'avatar_url', prof.avatar_url,
        'username', prof.username
    ) as profiles
  FROM public.micro_pods mp
  JOIN public.profiles prof ON mp.user_id = prof.id
  WHERE mp.status = 'published'
    AND ST_DWithin(mp.geo_location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_meters)
  ORDER BY distance_meters ASC
  LIMIT p_limit;

CREATE OR REPLACE FUNCTION "public"."get_resonant_podcasts"("center_point" "point", "count_limit" integer) RETURNS SETOF "public"."micro_pods"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  FROM public.micro_pods
  WHERE 
    status = 'published' 
    AND final_coordinates IS NOT NULL
    AND cover_image_url IS NOT NULL -- [MEJORA] Aseguramos que solo devolvemos podcasts con carátula.
  ORDER BY 
    final_coordinates <-> center_point -- Operador de distancia de PostgreSQL.
  LIMIT 
    count_limit;

CREATE OR REPLACE FUNCTION "public"."handle_new_podcast_async"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    PERFORM public.dispatch_edge_function(
        'cognitive-core-orchestrator',
        jsonb_build_object('record', row_to_json(NEW))
    );

CREATE OR REPLACE FUNCTION "public"."handle_new_podcast_publication"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    
    INSERT INTO public.notifications (user_id, type, data)
    SELECT 
      follower_id,
      'new_podcast_from_followed_user',
      jsonb_build_object(
        'actor_id', NEW.user_id,
        'podcast_id', NEW.id,
        'podcast_title', NEW.title
      )
    FROM public.followers
    WHERE following_id = NEW.user_id;

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      split_part(NEW.email, '@', 1)
    )
  );

CREATE OR REPLACE FUNCTION "public"."hybrid_search"("query_text" "text", "query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer) RETURNS TABLE("id" bigint, "podcast_id" bigint, "content" "text", "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
begin
  return query
  select
    pe.id,
    pe.podcast_id,
    pe.content,
    (1 - (pe.embedding <=> query_embedding)) as similarity
  from public.podcast_embeddings pe
  where 1 - (pe.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;

CREATE OR REPLACE FUNCTION "public"."increment_paper_usage"("p_ids" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.pulse_staging
        updated_at = NOW()
    WHERE id = ANY(p_ids);

CREATE OR REPLACE FUNCTION "public"."increment_play_count"("podcast_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.micro_pods
      WHERE id = podcast_id;

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );

CREATE OR REPLACE FUNCTION "public"."maintain_thread_integrity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    FROM public.micro_pods
    WHERE id = NEW.parent_id;

CREATE OR REPLACE FUNCTION "public"."mark_notifications_as_read"() RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  UPDATE public.notifications
  WHERE user_id = auth.uid() AND is_read = false;

CREATE OR REPLACE FUNCTION "public"."on_draft_created_trigger_research"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    BEGIN
        PERFORM public.dispatch_edge_function(
            'research-intelligence',
            jsonb_build_object(
                'draft_id', NEW.id,
                'topic', NEW.title,
                'depth', COALESCE(NEW.creation_data->'inputs'->>'narrativeDepth', 'Medio'),
                'is_pulse', (NEW.creation_data->>'purpose' = 'pulse'),
                'pulse_ids', NEW.creation_data->'pulse_source_ids'
            )
        );

CREATE OR REPLACE FUNCTION "public"."on_pod_created_dispatch_assets"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF NEW.processing_status = 'processing' THEN
        
        PERFORM public.dispatch_edge_function(
            'generate-audio-from-script',
            jsonb_build_object('podcast_id', NEW.id)
        );

CREATE OR REPLACE FUNCTION "public"."on_pod_created_trigger_assets"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    PERFORM public.dispatch_edge_function(
        'process-podcast-job',
        jsonb_build_object('podcast_id', NEW.id)
    );

CREATE OR REPLACE FUNCTION "public"."push_to_research_backlog"("p_topic" "text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.research_backlog (topic, metadata)
    VALUES (TRIM(p_topic), p_metadata)
    ON CONFLICT (topic) 
    DO UPDATE SET 
        request_count = public.research_backlog.request_count + 1,
        updated_at = NOW();

CREATE OR REPLACE FUNCTION "public"."reset_monthly_quotas"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.user_usage
    SET 
        podcasts_created_this_month = 0,
        minutes_listened_this_month = 0,
        last_reset_date = CURRENT_DATE,
        updated_at = NOW();

CREATE OR REPLACE FUNCTION "public"."reward_sovereign_curation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF (OLD.status = 'draft' AND NEW.status = 'published' AND NEW.creation_mode = 'situational') THEN
        UPDATE public.profiles 
        WHERE id = NEW.user_id;

CREATE OR REPLACE FUNCTION "public"."save_analysis_and_embedding"("p_podcast_id" bigint, "p_agent_version" "text", "p_ai_summary" "text", "p_narrative_lens" "text", "p_ai_tags" "text"[], "p_ai_coordinates" "point", "p_consistency_level" "public"."consistency_level", "p_embedding" "extensions"."vector") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.micro_pods
    SET 
        agent_version = p_agent_version,
        ai_summary = p_ai_summary,
        narrative_lens = p_narrative_lens,
        ai_tags = p_ai_tags,
        final_coordinates = p_ai_coordinates,
        consistency_level = p_consistency_level,
        updated_at = NOW()
    WHERE id = p_podcast_id;

CREATE OR REPLACE FUNCTION "public"."search_knowledge_vault"("query_embedding" "extensions"."vector", "match_threshold" double precision DEFAULT 0.7, "match_count" integer DEFAULT 5, "only_public" boolean DEFAULT true) RETURNS TABLE("source_id" "uuid", "content" "text", "title" "text", "url" "text", "similarity" double precision, "days_old" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select
    ks.id as source_id,
    kc.content,
    ks.title,
    ks.url,
    (1 - (kc.embedding <=> query_embedding))::float as similarity,
    extract(day from (now() - ks.created_at))::float as days_old
  from public.knowledge_chunks kc
  join public.knowledge_sources ks on kc.source_id = ks.id
  where (1 - (kc.embedding <=> query_embedding)) > match_threshold
    and (case when only_public then ks.is_public = true else true end)
  order by (
    ((1 - (kc.embedding <=> query_embedding)) * 0.8) + 
    ((1.0 / (extract(day from (now() - ks.created_at)) + 1)) * 0.2)
  ) desc
  limit match_count;

CREATE OR REPLACE FUNCTION "public"."search_omni"("query_text" "text", "query_embedding" double precision[], "match_threshold" double precision, "match_count" integer) RETURNS TABLE("type" "text", "id" "text", "title" "text", "subtitle" "text", "image_url" "text", "similarity" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'podcast'::text as type,
    mp.id::text,
    mp.title,
    mp.description as subtitle,
    mp.cover_image_url as image_url,
    ((1 - (pe.embedding <=> query_embedding::vector)) + (CASE WHEN mp.title ILIKE '%' || query_text || '%' THEN 0.3 ELSE 0 END))::float as similarity
  FROM public.podcast_embeddings pe
  JOIN public.micro_pods mp ON mp.id = pe.podcast_id
  WHERE 
    mp.status = 'published' 
    AND (
      (1 - (pe.embedding <=> query_embedding::vector) > match_threshold)
      OR 
      mp.title ILIKE '%' || query_text || '%'
      OR 
      mp.description ILIKE '%' || query_text || '%'
    )
  ORDER BY similarity DESC
  LIMIT match_count;

CREATE OR REPLACE FUNCTION "public"."search_podcasts"("search_term" "text") RETURNS TABLE("id" bigint, "user_id" "uuid", "title" "text", "description" "text", "script_text" "text", "audio_url" "text", "cover_image_url" "text", "duration_seconds" integer, "category" "text", "status" "public"."podcast_status", "play_count" bigint, "like_count" bigint, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "creation_data" "jsonb", "profiles" json)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        mp.id,
        mp.user_id,
        mp.title,
        mp.description,
        mp.script_text,
        mp.audio_url,
        mp.cover_image_url,
        mp.duration_seconds,
        mp.category,
        mp.status,
        mp.play_count,
        mp.like_count,
        mp.created_at,
        mp.updated_at,
        mp.creation_data,
        json_build_object(
            'full_name', p.full_name,
            'avatar_url', p.avatar_url
        ) AS profiles
    FROM
        public.micro_pods AS mp
    JOIN
        public.profiles AS p ON mp.user_id = p.id
    WHERE
        mp.status = 'published' AND (
            mp.title ILIKE '%' || search_term || '%' OR
            mp.description ILIKE '%' || search_term || '%' OR
            p.full_name ILIKE '%' || search_term || '%'
        );

CREATE OR REPLACE FUNCTION "public"."unified_search_v3"("p_query_text" "text", "p_query_embedding" "extensions"."vector", "p_match_threshold" double precision DEFAULT 0.25, "p_match_count" integer DEFAULT 15, "p_user_lat" double precision DEFAULT NULL::double precision, "p_user_lng" double precision DEFAULT NULL::double precision) RETURNS TABLE("result_type" "text", "id" "text", "title" "text", "subtitle" "text", "image_url" "text", "similarity" double precision, "geo_distance" double precision, "metadata" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH 
    podcast_results AS (
        SELECT 
            'podcast'::text as r_type,
            mp.id::text as r_id,
            mp.title as r_title,
            prof.full_name as r_subtitle,
            mp.cover_image_url as r_image_url,
            (1 - (pe.embedding <=> p_query_embedding))::float as r_similarity,
            CASE 
                WHEN p_user_lat IS NOT NULL AND mp.geo_location IS NOT NULL 
                THEN ST_Distance(mp.geo_location, ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography)
                ELSE NULL 
            END as r_distance,
            jsonb_build_object(
                'author_username', prof.username,
                'duration', mp.duration_seconds,
                'mode', mp.creation_mode
            ) as r_metadata
        FROM public.micro_pods mp
        JOIN public.podcast_embeddings pe ON mp.id = pe.podcast_id
        JOIN public.profiles prof ON mp.user_id = prof.id
        WHERE mp.status = 'published'
        AND (1 - (pe.embedding <=> p_query_embedding)) > p_match_threshold
    ),
    
    user_results AS (
        SELECT 
            'user'::text as r_type,
            p.id::text as r_id,
            p.full_name as r_title,
            '@' || p.username as r_subtitle,
            p.avatar_url as r_image_url,
            0.9::float as r_similarity, -- Puntuación estática alta por coincidencia de nombre
            NULL::float as r_distance,
            jsonb_build_object('reputation', p.reputation_score) as r_metadata
        FROM public.profiles p
        WHERE p.username ILIKE '%' || p_query_text || '%'
           OR p.full_name ILIKE '%' || p_query_text || '%'
    ),

    vault_results AS (
        SELECT 
            'vault_chunk'::text as r_type,
            kc.id::text as r_id,
            ks.title as r_title,
            substring(kc.content from 1 for 100) || '...' as r_subtitle,
            NULL::text as r_image_url,
            (1 - (kc.embedding <=> p_query_embedding))::float as r_similarity,
            NULL::float as r_distance,
            jsonb_build_object('source_url', ks.url) as r_metadata
        FROM public.knowledge_chunks kc
        JOIN public.knowledge_sources ks ON kc.source_id = ks.id
        WHERE (1 - (kc.embedding <=> p_query_embedding)) > p_match_threshold + 0.1 -- Mayor rigor para la Bóveda
    )

        UNION ALL
        UNION ALL
    ) AS combined
    ORDER BY 
        (r_similarity * 0.8) + (CASE WHEN r_distance IS NOT NULL THEN (1 / (r_distance + 1)) * 0.2 ELSE 0 END) DESC
    LIMIT p_match_count;

CREATE OR REPLACE FUNCTION "public"."unified_search_v4"("p_query_text" "text", "p_query_embedding" "extensions"."vector", "p_match_threshold" double precision DEFAULT 0.15, "p_match_count" integer DEFAULT 20, "p_user_lat" double precision DEFAULT NULL::double precision, "p_user_lng" double precision DEFAULT NULL::double precision) RETURNS TABLE("result_type" "text", "id" "text", "title" "text", "subtitle" "text", "image_url" "text", "similarity" double precision, "geo_distance" double precision, "metadata" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH all_results AS (
        
        SELECT 
            'podcast'::text AS r_type, 
            mp.id::text AS r_id, 
            mp.title AS r_title, 
            prof.full_name AS r_subtitle, 
            mp.cover_image_url AS r_image_url, 
            (1 - (pe.embedding <=> p_query_embedding))::float AS r_similarity,
            
            CASE 
                WHEN p_user_lat IS NOT NULL AND mp.geo_location IS NOT NULL 
                THEN ST_Distance(mp.geo_location, ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography) 
                ELSE NULL 
            END AS r_distance,
            
            jsonb_build_object(
                'author', prof.username,
                'mode', mp.creation_mode,
                'lat', ST_Y(mp.geo_location::geometry),
                'lng', ST_X(mp.geo_location::geometry)
            ) AS r_metadata
            
        FROM public.micro_pods mp 
        JOIN public.podcast_embeddings pe ON mp.id = pe.podcast_id
        JOIN public.profiles prof ON mp.user_id = prof.id
        
        WHERE mp.status IN ('published', 'pending_approval') 
        AND (1 - (pe.embedding <=> p_query_embedding)) > p_match_threshold

        UNION ALL

        SELECT 
            'user'::text AS r_type, 
            p.id::text AS r_id, 
            p.full_name AS r_title, 
            '@' || p.username AS r_subtitle, 
            p.avatar_url AS r_image_url, 
            
            0.95::float AS r_similarity, 
            NULL::float AS r_distance, 
            
            jsonb_build_object('reputation', p.reputation_score) AS r_metadata
            
        FROM public.profiles p
        WHERE p.username ILIKE '%' || p_query_text || '%' 
           OR p.full_name ILIKE '%' || p_query_text || '%'

        UNION ALL

        SELECT 
            'place'::text AS r_type, 
            poi.id::text AS r_id, 
            poi.name AS r_title, 
            poi.category AS r_subtitle, 
            NULL::text AS r_image_url, 
            
            (CASE WHEN poi.name ILIKE '%' || p_query_text || '%' THEN 0.85 ELSE 0.60 END)::float AS r_similarity,
            
            CASE 
                WHEN p_user_lat IS NOT NULL AND poi.geo_location IS NOT NULL
                THEN ST_Distance(poi.geo_location, ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography) 
                ELSE NULL 
            END AS r_distance,
            
            jsonb_build_object(
                'category', poi.category,
                'lat', ST_Y(poi.geo_location::geometry),
                'lng', ST_X(poi.geo_location::geometry)
            ) AS r_metadata
            
        FROM public.points_of_interest poi
        WHERE poi.name ILIKE '%' || p_query_text || '%' 
           OR poi.category ILIKE '%' || p_query_text || '%'

        UNION ALL

        SELECT 
            'vault_chunk'::text AS r_type, 
            kc.id::text AS r_id, 
            ks.title AS r_title, 
            substring(kc.content from 1 for 120) || '...' AS r_subtitle, 
            NULL::text AS r_image_url, 
            
            (1 - (kc.embedding <=> p_query_embedding))::float AS r_similarity, 
            NULL::float AS r_distance, 
            
            jsonb_build_object('source_url', ks.url) AS r_metadata
            
        FROM public.knowledge_chunks kc
        JOIN public.knowledge_sources ks ON kc.source_id = ks.id
        
        WHERE (1 - (kc.embedding <=> p_query_embedding)) > p_match_threshold + 0.1 
    )
    
    ORDER BY 
        (similarity * 0.8) + (
            CASE 
                WHEN geo_distance IS NOT NULL AND geo_distance < 5000 
                THEN (1.0 / (geo_distance + 1)) * 0.2 
                ELSE 0 
            END
        ) DESC
    LIMIT p_match_count;