


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE TYPE "public"."agent_status" AS ENUM (
    'active',
    'experimental',
    'archived'
);


ALTER TYPE "public"."agent_status" OWNER TO "postgres";


CREATE TYPE "public"."agent_type" AS ENUM (
    'script',
    'image'
);


ALTER TYPE "public"."agent_type" OWNER TO "postgres";


CREATE TYPE "public"."consistency_level" AS ENUM (
    'high',
    'medium',
    'low'
);


ALTER TYPE "public"."consistency_level" OWNER TO "postgres";


CREATE TYPE "public"."content_category" AS ENUM (
    'paper',
    'report',
    'news',
    'analysis',
    'trend'
);


ALTER TYPE "public"."content_category" OWNER TO "postgres";


CREATE TYPE "public"."interaction_event_type" AS ENUM (
    'completed_playback',
    'liked',
    'shared'
);


ALTER TYPE "public"."interaction_event_type" OWNER TO "postgres";


CREATE TYPE "public"."job_status" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'pending_audio'
);


ALTER TYPE "public"."job_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'podcast_created_success',
    'podcast_created_failure',
    'new_follower',
    'new_like',
    'new_podcast_from_followed_user',
    'new_testimonial'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."podcast_status" AS ENUM (
    'pending_approval',
    'published',
    'archived',
    'failed',
    'draft'
);


ALTER TYPE "public"."podcast_status" OWNER TO "postgres";


CREATE TYPE "public"."podcast_shelf_item" AS (
	"id" bigint,
	"title" "text",
	"description" "text",
	"audio_url" "text",
	"cover_image_url" "text",
	"duration_seconds" integer,
	"like_count" bigint,
	"play_count" bigint,
	"created_at" timestamp with time zone,
	"user_id" "uuid",
	"status" "public"."podcast_status",
	"creation_data" "jsonb",
	"final_coordinates" "point",
	"ai_tags" "text"[],
	"profiles" json
);


ALTER TYPE "public"."podcast_shelf_item" OWNER TO "postgres";


CREATE TYPE "public"."processing_status" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


ALTER TYPE "public"."processing_status" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status" AS ENUM (
    'active',
    'inactive',
    'trialing',
    'past_due'
);


ALTER TYPE "public"."subscription_status" OWNER TO "postgres";


CREATE TYPE "public"."testimonial_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."testimonial_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_draft_quota"("p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_concurrent_limit int;
    v_monthly_limit int;
    v_current_concurrent int;
    v_current_monthly int;
BEGIN
    SELECT pl.max_concurrent_drafts, pl.max_monthly_drafts 
    INTO v_concurrent_limit, v_monthly_limit
    FROM public.subscriptions s
    JOIN public.plans pl ON s.plan_id = pl.id
    WHERE s.user_id = p_user_id AND s.status = 'active' LIMIT 1;

    SELECT count(*) INTO v_current_concurrent FROM public.podcast_drafts WHERE user_id = p_user_id;
    SELECT drafts_created_this_month INTO v_current_monthly FROM public.user_usage WHERE user_id = p_user_id;

    IF v_current_concurrent >= COALESCE(v_concurrent_limit, 3) THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'Límite de borradores simultáneos alcanzado.');
    END IF;

    RETURN jsonb_build_object('allowed', true);
END;
$$;


ALTER FUNCTION "public"."check_draft_quota"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_podcast_integrity_and_release"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Si ambos activos están listos, liberamos el podcast
    IF NEW.audio_ready = TRUE AND NEW.image_ready = TRUE THEN
        UPDATE public.micro_pods 
        SET 
            processing_status = 'completed',
            updated_at = now()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_podcast_integrity_and_release"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_function_name" "text", "p_limit" integer, "p_window_seconds" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  request_count int;
begin
  -- 1. Limpieza de mantenimiento (Borrar logs viejos)
  DELETE FROM public.ai_usage_logs 
  WHERE created_at < now() - (p_window_seconds || ' seconds')::interval;

  -- 2. Contar peticiones recientes
  SELECT count(*) INTO request_count
  FROM public.ai_usage_logs
  WHERE user_id = p_user_id
    AND function_name = p_function_name
    AND created_at > now() - (p_window_seconds || ' seconds')::interval;

  -- 3. Decisión
  IF request_count >= p_limit THEN
    RETURN FALSE; -- Bloqueado
  ELSE
    INSERT INTO public.ai_usage_logs (user_id, function_name)
    VALUES (p_user_id, p_function_name);
    RETURN TRUE; -- Permitido
  END IF;
end;
$$;


ALTER FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_function_name" "text", "p_limit" integer, "p_window_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_pulse"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
    DELETE FROM public.pulse_staging WHERE expires_at < now();
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_pulse"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_and_free_subscription"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ DECLARE free_plan_id BIGINT; BEGIN SELECT id INTO free_plan_id FROM public.plans WHERE name = 'Gratuito' LIMIT 1; IF free_plan_id IS NULL THEN RAISE EXCEPTION 'Plan "Gratuito" no encontrado.'; END IF; INSERT INTO public.profiles (id, username, full_name, avatar_url, role) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.id::text), NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', 'user'); INSERT INTO public.subscriptions (user_id, plan_id, status) VALUES (NEW.id, free_plan_id, 'active'); UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('user_role', 'user') WHERE id = NEW.id; RETURN NEW; END; $$;


ALTER FUNCTION "public"."create_profile_and_free_subscription"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dispatch_edge_function"("function_name" "text", "payload" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    request_id bigint;
    -- Descubrimos la URL dinámicamente para no fallar por Project ID
    base_url text := (SELECT value FROM public.platform_limits WHERE key_name = 'supabase_url'); 
    full_url text;
BEGIN
    -- Fallback si no está en la tabla de límites
    IF base_url IS NULL THEN
        base_url := 'https://arbojlknwilqcszuqope.supabase.co';
    END IF;
    
    full_url := base_url || '/functions/v1/' || function_name;

    SELECT net.http_post(
        url := full_url,
        body := payload,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || public.get_service_key()
        )
    ) INTO request_id;

    RETURN jsonb_build_object('status', 'queued', 'request_id', request_id, 'url_used', full_url);
END;
$$;


ALTER FUNCTION "public"."dispatch_edge_function"("function_name" "text", "payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_personalized_pulse"("p_user_id" "uuid", "p_limit" integer DEFAULT 20, "p_threshold" double precision DEFAULT 0.7) RETURNS TABLE("id" "uuid", "title" "text", "summary" "text", "url" "text", "source_name" "text", "content_type" "public"."content_category", "authority_score" double precision, "similarity" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
DECLARE
    v_user_dna vector(768);
BEGIN
    -- Obtener el vector DNA del usuario
    SELECT dna_vector INTO v_user_dna FROM public.user_interest_dna WHERE user_id = p_user_id;

    RETURN QUERY
    SELECT 
        ps.id,
        ps.title,
        ps.summary,
        ps.url,
        ps.source_name,
        ps.content_type,
        ps.authority_score,
        (1 - (ps.embedding <=> v_user_dna))::FLOAT as similarity
    FROM public.pulse_staging ps
    WHERE 
        ps.expires_at > now()
        AND (1 - (ps.embedding <=> v_user_dna)) > p_threshold
    ORDER BY (ps.authority_score * 0.4 + (1 - (ps.embedding <=> v_user_dna)) * 0.6) DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."fetch_personalized_pulse"("p_user_id" "uuid", "p_limit" integer, "p_threshold" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_curated_library_shelves"("p_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_center point;
  result json;
BEGIN
  SELECT COALESCE(current_center, point(0,0)) INTO user_center FROM public.user_resonance_profiles WHERE user_id = p_user_id;
  WITH
  most_resonant AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.final_coordinates IS NOT NULL ORDER BY p.final_coordinates <-> user_center LIMIT 10
  ),
  deep_thought AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.final_coordinates[0] < 0 AND p.final_coordinates[1] > 0 ORDER BY p.final_coordinates <-> user_center LIMIT 10
  ),
  practical_tools AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.final_coordinates[1] < -5 ORDER BY p.final_coordinates <-> user_center LIMIT 10
  ),
  tech_and_innovation AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.ai_tags && ARRAY['ia', 'tecnología', 'futurismo', 'innovación'] ORDER BY p.final_coordinates <-> user_center LIMIT 10
  ),
  wellness_and_mind AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.ai_tags && ARRAY['psicología', 'mindfulness', 'hábitos', 'estoicismo', 'bienestar'] ORDER BY p.final_coordinates <-> user_center LIMIT 10
  ),
  narrative_and_stories AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.ai_tags && ARRAY['storytelling', 'historia', 'narrativa'] ORDER BY p.final_coordinates <-> user_center LIMIT 10
  )
  SELECT json_build_object( 'most_resonant', (SELECT json_agg(t) FROM most_resonant t), 'deep_thought', (SELECT json_agg(t) FROM deep_thought t), 'practical_tools', (SELECT json_agg(t) FROM practical_tools t), 'tech_and_innovation', (SELECT json_agg(t) FROM tech_and_innovation t), 'wellness_and_mind', (SELECT json_agg(t) FROM wellness_and_mind t), 'narrative_and_stories', (SELECT json_agg(t) FROM narrative_and_stories t) ) INTO result;
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_curated_library_shelves"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_generic_library_shelves"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result json;
BEGIN
  WITH
  most_resonant AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' ORDER BY p.play_count DESC, p.created_at DESC LIMIT 10
  ),
  deep_thought AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.final_coordinates[0] < 0 AND p.final_coordinates[1] > 0 ORDER BY p.play_count DESC, p.created_at DESC LIMIT 10
  ),
  practical_tools AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.final_coordinates[1] < -5 ORDER BY p.play_count DESC, p.created_at DESC LIMIT 10
  ),
  tech_and_innovation AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.ai_tags && ARRAY['ia', 'tecnología', 'futurismo', 'innovación'] ORDER BY p.play_count DESC, p.created_at DESC LIMIT 10
  ),
  wellness_and_mind AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.ai_tags && ARRAY['psicología', 'mindfulness', 'hábitos', 'estoicismo', 'bienestar'] ORDER BY p.play_count DESC, p.created_at DESC LIMIT 10
  ),
  narrative_and_stories AS (
    SELECT p.id, p.title, p.description, p.audio_url, p.cover_image_url, p.duration_seconds, p.user_id, to_json(prof.*) as profiles
    FROM public.micro_pods p LEFT JOIN public.profiles prof ON p.user_id = prof.id WHERE p.status = 'published' AND p.ai_tags && ARRAY['storytelling', 'historia', 'narrativa'] ORDER BY p.play_count DESC, p.created_at DESC LIMIT 10
  )
  SELECT json_build_object( 'most_resonant', (SELECT json_agg(t) FROM most_resonant t), 'deep_thought', (SELECT json_agg(t) FROM deep_thought t), 'practical_tools', (SELECT json_agg(t) FROM practical_tools t), 'tech_and_innovation', (SELECT json_agg(t) FROM tech_and_innovation t), 'wellness_and_mind', (SELECT json_agg(t) FROM wellness_and_mind t), 'narrative_and_stories', (SELECT json_agg(t) FROM narrative_and_stories t) ) INTO result;
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_generic_library_shelves"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_memories_in_bounds"("min_lat" double precision, "min_lng" double precision, "max_lat" double precision, "max_lng" double precision) RETURNS TABLE("id" bigint, "lat" double precision, "lng" double precision, "title" "text", "focus_entity" "text", "content_type" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
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
        -- Filtro espacial: Cuadro delimitador (Bounding Box)
        -- Usamos casting a geometry porque es más rápido para bounding box simple que geography
        pm.geo_location::geometry && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    LIMIT 100; -- Protección contra sobrecarga de UI
END;
$$;


ALTER FUNCTION "public"."get_memories_in_bounds"("min_lat" double precision, "min_lng" double precision, "max_lat" double precision, "max_lng" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_nearby_podcasts"("p_lat" double precision, "p_lng" double precision, "p_radius_meters" integer DEFAULT 1000, "p_limit" integer DEFAULT 10) RETURNS TABLE("id" bigint, "title" "text", "description" "text", "audio_url" "text", "cover_image_url" "text", "distance_meters" double precision, "profiles" json)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
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
END;
$$;


ALTER FUNCTION "public"."get_nearby_podcasts"("p_lat" double precision, "p_lng" double precision, "p_radius_meters" integer, "p_limit" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."micro_pods" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "script_text" "text",
    "audio_url" "text",
    "cover_image_url" "text",
    "duration_seconds" integer,
    "category" "text",
    "status" "public"."podcast_status" DEFAULT 'pending_approval'::"public"."podcast_status" NOT NULL,
    "play_count" bigint DEFAULT 0 NOT NULL,
    "like_count" bigint DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "creation_data" "jsonb",
    "processing_status" "public"."processing_status" DEFAULT 'pending'::"public"."processing_status" NOT NULL,
    "agent_version" "text",
    "ai_summary" "text",
    "narrative_lens" "text",
    "ai_tags" "text"[],
    "user_tags" "text"[],
    "ai_coordinates" "point",
    "final_coordinates" "point",
    "ai_consistency_drift" "jsonb",
    "consistency_level" "public"."consistency_level",
    "creation_context" "jsonb",
    "sources" "jsonb" DEFAULT '[]'::"jsonb",
    "reviewed_by_user" boolean DEFAULT false,
    "published_at" timestamp with time zone,
    "admin_notes" "text",
    "is_featured" boolean DEFAULT false,
    "parent_id" bigint,
    "root_id" bigint,
    "quote_context" "text",
    "quote_timestamp" numeric,
    "creation_mode" "text" DEFAULT 'standard'::"text",
    "geo_location" "extensions"."geography"(Point,4326),
    "place_name" "text",
    "audio_ready" boolean DEFAULT false,
    "image_ready" boolean DEFAULT false,
    CONSTRAINT "micro_pods_creation_mode_check" CHECK (("creation_mode" = ANY (ARRAY['standard'::"text", 'remix'::"text"]))),
    CONSTRAINT "micro_pods_title_check" CHECK (("char_length"("title") > 0))
);


ALTER TABLE "public"."micro_pods" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_resonant_podcasts"("center_point" "point", "count_limit" integer) RETURNS SETOF "public"."micro_pods"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.micro_pods
  WHERE 
    status = 'published' 
    AND final_coordinates IS NOT NULL
    AND cover_image_url IS NOT NULL -- [MEJORA] Aseguramos que solo devolvemos podcasts con carátula.
  ORDER BY 
    final_coordinates <-> center_point -- Operador de distancia de PostgreSQL.
  LIMIT 
    count_limit;
END;
$$;


ALTER FUNCTION "public"."get_resonant_podcasts"("center_point" "point", "count_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_service_key"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'vault'
    AS $$
DECLARE
  secret_value text;
BEGIN
  -- Buscamos el secreto por el nombre que le pusiste en el Dashboard
  SELECT decrypted_secret INTO secret_value 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
  
  RETURN secret_value;
END;
$$;


ALTER FUNCTION "public"."get_service_key"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_service_key"() IS 'Recupera de forma segura la SERVICE_ROLE_KEY desde la Vault para uso exclusivo en triggers y orquestadores.';



CREATE OR REPLACE FUNCTION "public"."get_user_discovery_feed"("p_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_center point;
  epicenter_tags text[];
  result json;
BEGIN
  -- 1. Obtener el centro de gravedad del usuario. Si no existe, usar el origen (0,0).
  SELECT COALESCE(current_center, point(0,0))
  INTO user_center
  FROM public.user_resonance_profiles
  WHERE user_id = p_user_id;

  -- Usamos Common Table Expressions (CTEs) para organizar las consultas.
  WITH
  -- Estantería 1: "Tu Epicentro Creativo" - Los 10 más cercanos al centro del usuario.
  epicenter_shelf AS (
    SELECT p.*, to_json(prof.*) as profiles
    FROM public.micro_pods p
    LEFT JOIN public.profiles prof ON p.user_id = prof.id
    WHERE p.status = 'published' AND p.final_coordinates IS NOT NULL
    ORDER BY p.final_coordinates <-> user_center
    LIMIT 10
  ),
  -- Obtenemos los tags más comunes del epicentro para la siguiente estantería.
  common_tags AS (
    SELECT unnest(ai_tags) as tag
    FROM epicenter_shelf
    GROUP BY tag
    ORDER BY count(*) DESC
    LIMIT 3
  ),
  -- Estantería 2: "Conexiones Inesperadas" - Podcasts con los mismos tags, pero lejos en el mapa.
  semantic_connections_shelf AS (
    SELECT p.*, to_json(prof.*) as profiles
    FROM public.micro_pods p
    LEFT JOIN public.profiles prof ON p.user_id = prof.id
    CROSS JOIN common_tags ct
    WHERE p.status = 'published'
      AND p.ai_tags && ARRAY[ct.tag] -- Que contenga al menos uno de los tags comunes
      AND p.final_coordinates IS NOT NULL
      AND (p.final_coordinates <-> user_center) > 10 -- Umbral de distancia para que sea "inesperado"
    ORDER BY p.created_at DESC
    LIMIT 10
  ),
  -- Estantería 3: "Nuevos Horizontes" - Lo último en la plataforma.
  new_horizons_shelf AS (
    SELECT p.*, to_json(prof.*) as profiles
    FROM public.micro_pods p
    LEFT JOIN public.profiles prof ON p.user_id = prof.id
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC
    LIMIT 10
  )
  -- 2. Construir el objeto JSON final que se devolverá al frontend.
  SELECT json_build_object(
    'epicenter', (SELECT json_agg(t) FROM epicenter_shelf t),
    'semantic_connections', (SELECT json_agg(t) FROM semantic_connections_shelf t),
    'new_horizons', (SELECT json_agg(t) FROM new_horizons_shelf t)
  )
  INTO result;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_user_discovery_feed"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_podcast_async"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    PERFORM public.dispatch_edge_function(
        'cognitive-core-orchestrator',
        jsonb_build_object('record', row_to_json(NEW))
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_podcast_async"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_podcast_publication"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  -- Solo si el estado cambia a 'published' (y antes no lo era)
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    
    -- Insertar notificaciones para todos los seguidores
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
    
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_podcast_publication"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_testimonial"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  actor_name_text text;
BEGIN
  -- Obtener el nombre del autor para mostrarlo en la notificación.
  SELECT full_name INTO actor_name_text FROM public.profiles WHERE id = NEW.author_user_id;
  
  -- Crear la notificación para el dueño del perfil que recibió el testimonio.
  INSERT INTO public.notifications (user_id, type, data)
  VALUES (
    NEW.profile_user_id, -- El destinatario de la notificación.
    'new_testimonial',
    jsonb_build_object(
      'actor_id', NEW.author_user_id,
      'actor_name', actor_name_text,
      'testimonial_text', left(NEW.comment_text, 50) -- Acortamos el texto a 50 caracteres para la vista previa.
    )
  );
  
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."handle_new_testimonial"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    -- Lógica de seguridad: Usar parte del email, nunca el ID
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_resonance_update_async"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    target_user_id uuid;
BEGIN
    IF TG_TABLE_NAME = 'likes' THEN
        target_user_id := COALESCE(NEW.user_id, OLD.user_id);
    ELSIF TG_TABLE_NAME = 'playback_events' THEN
        target_user_id := NEW.user_id;
    END IF;

    PERFORM public.dispatch_edge_function(
        'update-resonance-profile',
        jsonb_build_object(
            'user_id', target_user_id,
            'event_source', TG_TABLE_NAME
        )
    );
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."handle_resonance_update_async"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_zombie_jobs"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
DECLARE
    count_killed INTEGER;
BEGIN
    WITH updated_rows AS (
        UPDATE public.podcast_creation_jobs
        SET 
            status = 'failed',
            error_message = 'Timeout del Sistema: El proceso excedió el tiempo límite (Zombie Auto-Kill)',
            updated_at = NOW()
        WHERE 
            status = 'processing' 
            AND updated_at < (NOW() - INTERVAL '1 hour')
        RETURNING id
    )
    SELECT count(*) INTO count_killed FROM updated_rows;

    IF count_killed > 0 THEN
        RAISE NOTICE 'Se han eliminado % jobs zombis.', count_killed;
    END IF;
END;
$$;


ALTER FUNCTION "public"."handle_zombie_jobs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hybrid_search"("query_text" "text", "query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer) RETURNS TABLE("id" bigint, "podcast_id" bigint, "content" "text", "similarity" double precision)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
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
end;
$$;


ALTER FUNCTION "public"."hybrid_search"("query_text" "text", "query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_jobs_and_queue"("p_user_id" "uuid", "p_payload" "jsonb") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_monthly_count INT;
  monthly_limit INT;
  active_jobs_count INT;
  new_job_id BIGINT;
BEGIN
  -- 1. Obtener límite del plan y uso actual en una sola consulta
  SELECT 
    COALESCE(uu.podcasts_created_this_month, 0),
    pl.monthly_creation_limit,
    (SELECT count(*) FROM public.podcast_creation_jobs WHERE user_id = p_user_id AND status IN ('pending', 'processing'))
  INTO current_monthly_count, monthly_limit, active_jobs_count
  FROM public.profiles p
  JOIN public.subscriptions s ON p.id = s.user_id
  JOIN public.plans pl ON s.plan_id = pl.id
  LEFT JOIN public.user_usage uu ON p.id = uu.user_id
  WHERE p.id = p_user_id;

  -- 2. Validaciones estrictas
  IF current_monthly_count >= monthly_limit THEN
    RAISE EXCEPTION 'Límite mensual alcanzado (% de %)', current_monthly_count, monthly_limit;
  END IF;

  IF active_jobs_count >= 1 THEN -- Evita que el mismo usuario sature el orquestador
    RAISE EXCEPTION 'Ya tienes un podcast procesándose. Espera a que termine.';
  END IF;

  -- 3. Inserción del Job
  INSERT INTO public.podcast_creation_jobs (user_id, payload)
  VALUES (p_user_id, p_payload)
  RETURNING id INTO new_job_id;
  
  RETURN new_job_id;
END;
$$;


ALTER FUNCTION "public"."increment_jobs_and_queue"("p_user_id" "uuid", "p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_play_count"("podcast_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.micro_pods
    SET play_count = play_count + 1
      WHERE id = podcast_id;
      END;
      $$;


ALTER FUNCTION "public"."increment_play_count"("podcast_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."init_draft_process_v2"("p_payload" "jsonb") RETURNS TABLE("draft_id" bigint, "allowed" boolean, "reason" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_new_id BIGINT;
    v_quota_check JSONB;
    v_extracted_title TEXT;
BEGIN
    -- 1. Identidad
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT NULL::BIGINT, FALSE, 'Sesión expirada.';
        RETURN;
    END IF;

    -- 2. Cuota
    v_quota_check := public.check_draft_quota(v_user_id);
    IF NOT (v_quota_check->>'allowed')::BOOLEAN THEN
        RETURN QUERY SELECT NULL::BIGINT, FALSE, v_quota_check->>'reason';
        RETURN;
    END IF;

    -- 3. Título
    v_extracted_title := COALESCE(
        p_payload->'inputs'->>'solo_topic', 
        p_payload->>'solo_topic',
        p_payload->'inputs'->>'question_to_answer',
        'Nueva Investigación'
    );

    -- 4. Inserción Blindada
    -- Inyectamos JSONs vacíos '{}' para satisfacer las restricciones NOT NULL
    INSERT INTO public.podcast_drafts (
        user_id,
        title,
        status,
        script_text,   -- <--- Columna Crítica
        dossier_text,  -- <--- Columna Crítica
        creation_data,
        updated_at
    )
    VALUES (
        v_user_id,
        v_extracted_title,
        'researching',
        '{"script_body": ""}'::jsonb, -- Valor inicial válido
        '{}'::jsonb,                  -- Valor inicial válido
        p_payload,
        now()
    )
    RETURNING id INTO v_new_id;

    RETURN QUERY SELECT v_new_id, TRUE, 'Misión iniciada.';
END;
$$;


ALTER FUNCTION "public"."init_draft_process_v2"("p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."maintain_thread_integrity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Buscamos el root_id del padre
    SELECT COALESCE(root_id, id) INTO NEW.root_id
    FROM public.micro_pods
    WHERE id = NEW.parent_id;
    
    -- Si el padre no tenía root_id (era el origen), él mismo es el root
    IF NEW.root_id IS NULL THEN
        NEW.root_id = NEW.parent_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."maintain_thread_integrity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_notifications_as_read"() RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  UPDATE public.notifications
  SET is_read = true
  WHERE user_id = auth.uid() AND is_read = false;
$$;


ALTER FUNCTION "public"."mark_notifications_as_read"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."on_draft_created_trigger_research"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Envolvemos la llamada en un bloque EXCEPTION
    -- Así, si falla el despacho, el borrador SÍ se guarda en la tabla
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
    EXCEPTION WHEN OTHERS THEN
        -- Si falla, solo dejamos una nota en el log, no matamos el proceso
        RAISE WARNING 'Fallo el despacho inicial del borrador ID %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."on_draft_created_trigger_research"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."on_pod_created_dispatch_assets"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- [CRÍTICO]: Solo disparamos si el podcast nace en estado 'processing'
    -- Esto evita bucles infinitos en actualizaciones posteriores.
    IF NEW.processing_status = 'processing' THEN
        
        -- A. DISPARO DE AUDIO
        PERFORM public.dispatch_edge_function(
            'generate-audio-from-script',
            jsonb_build_object('podcast_id', NEW.id)
        );

        -- B. DISPARO DE IMAGEN
        PERFORM public.dispatch_edge_function(
            'generate-cover-image',
            jsonb_build_object('podcast_id', NEW.id)
        );

        -- C. DISPARO DE VECTORIZACIÓN (Discovery Hub)
        PERFORM public.dispatch_edge_function(
            'generate-embedding',
            jsonb_build_object('podcast_id', NEW.id)
        );

    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."on_pod_created_dispatch_assets"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."on_pod_created_trigger_assets"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Eliminamos la llave hardcodeada y usamos el canal seguro
    PERFORM public.dispatch_edge_function(
        'process-podcast-job',
        jsonb_build_object('podcast_id', NEW.id)
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."on_pod_created_trigger_assets"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."promote_draft_to_production_v2"("p_draft_id" bigint, "p_final_title" "text", "p_final_script" "text", "p_sources" "jsonb" DEFAULT NULL::"jsonb") RETURNS TABLE("pod_id" bigint, "success" boolean, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_new_pod_id BIGINT;
    v_creation_data JSONB;
    v_internal_sources JSONB;
BEGIN
    -- 1. Identificar al dueño del proceso
    v_user_id := auth.uid();

    -- 2. Recuperar metadatos y fuentes directamente desde la tabla de borradores
    -- Esto evita que si el frontend envía un array vacío, perdamos la investigación.
    SELECT creation_data, sources INTO v_creation_data, v_internal_sources
    FROM public.podcast_drafts 
    WHERE id = p_draft_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::BIGINT, FALSE, 'Borrador no encontrado o acceso denegado.';
        RETURN;
    END IF;

    -- 3. Insertar en Producción (micro_pods)
    -- Inyectamos los activos con banderas en FALSE para activar el semáforo de integridad
    INSERT INTO public.micro_pods (
        user_id,
        title,
        description,
        script_text,
        sources, -- Usamos las fuentes recuperadas internamente
        creation_data,
        status,
        processing_status,
        audio_ready,
        image_ready
    )
    VALUES (
        v_user_id,
        p_final_title,
        p_final_title, 
        JSONB_BUILD_OBJECT(
            'script_body', p_final_script,
            'script_plain', regexp_replace(p_final_script, '<[^>]+>', ' ', 'g')
        ),
        COALESCE(v_internal_sources, p_sources, '[]'::jsonb),
        v_creation_data,
        'pending_approval',
        'processing',
        FALSE,
        FALSE
    )
    RETURNING id INTO v_new_pod_id;

    -- 4. ELIMINAR BORRADOR (Liberación inmediata de cuota)
    DELETE FROM public.podcast_drafts WHERE id = p_draft_id;

    RETURN QUERY SELECT v_new_pod_id, TRUE, 'Producción iniciada exitosamente.';
END;
$$;


ALTER FUNCTION "public"."promote_draft_to_production_v2"("p_draft_id" bigint, "p_final_title" "text", "p_final_script" "text", "p_sources" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_monthly_quotas"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
    UPDATE public.user_usage
    SET 
        podcasts_created_this_month = 0,
        minutes_listened_this_month = 0,
        last_reset_date = CURRENT_DATE,
        updated_at = NOW();
        
    RAISE NOTICE 'Cuotas mensuales reseteadas para todos los usuarios.';
END;
$$;


ALTER FUNCTION "public"."reset_monthly_quotas"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reward_sovereign_curation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
    -- Si un podcast pasa de status 'draft' a 'published' y es de tipo 'pulse'
    IF (OLD.status = 'draft' AND NEW.status = 'published' AND NEW.creation_mode = 'situational') THEN
        UPDATE public.profiles 
        SET reputation_score = reputation_score + 10
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."reward_sovereign_curation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_analysis_and_embedding"("p_podcast_id" bigint, "p_agent_version" "text", "p_ai_summary" "text", "p_narrative_lens" "text", "p_ai_tags" "text"[], "p_ai_coordinates" "point", "p_consistency_level" "public"."consistency_level", "p_embedding" "extensions"."vector") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
    -- SOLO actualizamos metadatos visuales en micro_pods
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

    -- [CRÍTICO]: NO HACEMOS NADA CON p_embedding ni con la tabla podcast_embeddings.
    -- Esa responsabilidad es 100% de la nueva función generate-embedding.
END;
$$;


ALTER FUNCTION "public"."save_analysis_and_embedding"("p_podcast_id" bigint, "p_agent_version" "text", "p_ai_summary" "text", "p_narrative_lens" "text", "p_ai_tags" "text"[], "p_ai_coordinates" "point", "p_consistency_level" "public"."consistency_level", "p_embedding" "extensions"."vector") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_geo_semantic"("query_embedding" "extensions"."vector", "user_lat" double precision, "user_long" double precision, "radius_units" double precision DEFAULT 0.1, "match_threshold" double precision DEFAULT 0.7, "match_count" integer DEFAULT 10) RETURNS TABLE("id" bigint, "title" "text", "description" "text", "similarity" double precision, "dist_val" double precision, "audio_url" "text", "image_url" "text", "author_handle" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  return query
  select
    mp.id,
    mp.title,
    mp.description,
    (1 - (pe.embedding <=> query_embedding))::float as similarity,
    (mp.final_coordinates <-> point(user_lat, user_long))::float as dist_val,
    mp.audio_url,
    mp.cover_image_url,
    p.username as author_handle
  from micro_pods mp
  join podcast_embeddings pe on mp.id = pe.podcast_id
  join profiles p on mp.user_id = p.id
  where 
    mp.status = 'published'
    and mp.final_coordinates is not null
    and (1 - (pe.embedding <=> query_embedding)) > match_threshold
    and (mp.final_coordinates <-> point(user_lat, user_long)) < radius_units
  order by similarity desc, dist_val asc
  limit match_count;
end;
$$;


ALTER FUNCTION "public"."search_geo_semantic"("query_embedding" "extensions"."vector", "user_lat" double precision, "user_long" double precision, "radius_units" double precision, "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_knowledge_vault"("query_embedding" "extensions"."vector", "match_threshold" double precision DEFAULT 0.7, "match_count" integer DEFAULT 5, "only_public" boolean DEFAULT true) RETURNS TABLE("source_id" "uuid", "content" "text", "title" "text", "url" "text", "similarity" double precision, "days_old" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
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
  -- Lógica de ordenamiento NicePod: 80% Similitud Semántica + 20% Frescura del dato
  order by (
    ((1 - (kc.embedding <=> query_embedding)) * 0.8) + 
    ((1.0 / (extract(day from (now() - ks.created_at)) + 1)) * 0.2)
  ) desc
  limit match_count;
end;
$$;


ALTER FUNCTION "public"."search_knowledge_vault"("query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer, "only_public" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_omni"("query_text" "text", "query_embedding" double precision[], "match_threshold" double precision, "match_count" integer) RETURNS TABLE("type" "text", "id" "text", "title" "text", "subtitle" "text", "image_url" "text", "similarity" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  -- 1. BUSCAR PODCASTS
  RETURN QUERY
  SELECT 
    'podcast'::text as type,
    mp.id::text,
    mp.title,
    mp.description as subtitle,
    mp.cover_image_url as image_url,
    -- [CORRECCIÓN]: Convertimos el resultado matemático a float explícitamente
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

  -- 2. BUSCAR USUARIOS
  RETURN QUERY
  SELECT 
    'user'::text as type,
    p.id::text,
    p.full_name as title,
    '@' || p.username as subtitle,
    p.avatar_url as image_url,
    -- [CORRECCIÓN]: 1.0 es numeric, 1.0::float es double precision. Esto arregla el error.
    1.0::float as similarity
  FROM public.profiles p
  WHERE 
    p.username ILIKE '%' || query_text || '%' 
    OR p.full_name ILIKE '%' || query_text || '%'
  LIMIT 5;
END;
$$;


ALTER FUNCTION "public"."search_omni"("query_text" "text", "query_embedding" double precision[], "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_podcasts"("search_term" "text") RETURNS TABLE("id" bigint, "user_id" "uuid", "title" "text", "description" "text", "script_text" "text", "audio_url" "text", "cover_image_url" "text", "duration_seconds" integer, "category" "text", "status" "public"."podcast_status", "play_count" bigint, "like_count" bigint, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "creation_data" "jsonb", "profiles" json)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
END;
$$;


ALTER FUNCTION "public"."search_podcasts"("search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_resonance_recalculation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
DECLARE
  user_id_to_update UUID;
BEGIN
  -- TG_OP nos dice si es un INSERT, UPDATE o DELETE.
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    user_id_to_update := NEW.user_id;
  ELSE
    user_id_to_update := OLD.user_id;
  END IF;
  
  -- Realiza la llamada HTTP no bloqueante a nuestra función "cerebro".
  PERFORM http_post(
    url := 'https://arbojlknwilqcszuqope.supabase.co/functions/v1/update-resonance-profile',
    body := jsonb_build_object('record', jsonb_build_object('user_id', user_id_to_update)),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );

  RETURN NULL; -- El resultado no es importante para un trigger AFTER.
END;
$$;


ALTER FUNCTION "public"."trigger_resonance_recalculation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_curator_reputation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
DECLARE
    curator_id uuid;
BEGIN
    -- 1. Identificar si el podcast escuchado pertenece a alguna colección
    -- 2. Si pertenece, encontrar al dueño de la colección (Curador)
    SELECT owner_id INTO curator_id
    FROM public.collections c
    JOIN public.collection_items ci ON c.id = ci.collection_id
    WHERE ci.pod_id = NEW.podcast_id
    LIMIT 1;

    -- 3. Si hay un curador implicado y el evento es 'completed_playback'
    IF curator_id IS NOT NULL AND NEW.event_type = 'completed_playback' THEN
        -- Aumentar reputación del curador (+5 puntos por iluminación)
        UPDATE public.profiles 
        SET reputation_score = reputation_score + 5
        WHERE id = curator_id;
        
        -- Aumentar contador de la colección
        UPDATE public.collections
        SET total_listened_count = total_listened_count + 1
        WHERE id = (SELECT collection_id FROM public.collection_items WHERE pod_id = NEW.podcast_id LIMIT 1);
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_curator_reputation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_dna_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
    NEW.last_updated = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_dna_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_follow_counts"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  actor_name_text text;
  actor_avatar_url_text text;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;

    SELECT full_name, avatar_url INTO actor_name_text, actor_avatar_url_text FROM public.profiles WHERE id = NEW.follower_id;

    INSERT INTO public.notifications (user_id, type, data)
    VALUES (
      NEW.following_id,
      'new_follower',
      jsonb_build_object(
        'actor_id', NEW.follower_id,
        'actor_name', actor_name_text,
        'actor_avatar_url', actor_avatar_url_text
      )
    );

  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE public.profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_follow_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_like_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$-- Código SQL completo y corregido para la función 'update_like_count'

DECLARE
  -- PASO 1: Declarar todas las variables que usaremos.
  podcast_owner_id uuid;
  podcast_title_text text;
  actor_name_text text;
BEGIN
  -- PASO 2: Iniciar el bloque lógico.
  IF (TG_OP = 'INSERT') THEN
    -- Actualizar el contador de likes.
    UPDATE public.micro_pods SET like_count = like_count + 1 WHERE id = NEW.podcast_id;

    -- Obtener la información necesaria para crear la notificación.
    SELECT user_id, title INTO podcast_owner_id, podcast_title_text FROM public.micro_pods WHERE id = NEW.podcast_id;
    SELECT full_name INTO actor_name_text FROM public.profiles WHERE id = NEW.user_id;

    -- Solo crear la notificación si la persona que da 'like' no es la dueña del podcast.
    IF podcast_owner_id <> NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, data)
      VALUES (
        podcast_owner_id,
        'new_like',
        jsonb_build_object(
          'actor_id', NEW.user_id,
          'actor_name', actor_name_text,
          'podcast_id', NEW.podcast_id,
          'podcast_title', podcast_title_text
        )
      );
    END IF;

  ELSIF (TG_OP = 'DELETE') THEN
    -- Si se quita un 'like', solo actualizamos el contador. No generamos notificación.
    UPDATE public.micro_pods SET like_count = like_count - 1 WHERE id = OLD.podcast_id;
  END IF;

  -- Las funciones de trigger deben devolver NULL.
  RETURN NULL;
END;$$;


ALTER FUNCTION "public"."update_like_count"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "private"."secrets" (
    "name" "text" NOT NULL,
    "value" "bytea" NOT NULL
);


ALTER TABLE "private"."secrets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_prompts" (
    "id" bigint NOT NULL,
    "agent_name" "text" NOT NULL,
    "description" "text",
    "prompt_template" "text" NOT NULL,
    "prompt_variables" "text"[],
    "agent_type" "public"."agent_type" DEFAULT 'script'::"public"."agent_type" NOT NULL,
    "model_identifier" "text",
    "version" integer DEFAULT 1 NOT NULL,
    "status" "public"."agent_status" DEFAULT 'active'::"public"."agent_status" NOT NULL,
    "parameters" "jsonb",
    "output_schema" "jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_prompts" OWNER TO "postgres";


ALTER TABLE "public"."ai_prompts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."ai_prompts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."ai_usage_logs" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "function_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_usage_logs" OWNER TO "postgres";


ALTER TABLE "public"."ai_usage_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."ai_usage_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."audio_echoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_pod_id" bigint NOT NULL,
    "author_id" "uuid" NOT NULL,
    "audio_url" "text" NOT NULL,
    "duration_seconds" integer,
    "transcript" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audio_echoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collection_items" (
    "collection_id" "uuid" NOT NULL,
    "pod_id" bigint NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"(),
    "curator_note" "text"
);


ALTER TABLE "public"."collection_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "cover_image_url" "text",
    "is_public" boolean DEFAULT true,
    "likes_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "total_listened_count" integer DEFAULT 0
);


ALTER TABLE "public"."collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."followers" (
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."followers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."geo_drafts_staging" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "location" "extensions"."geography"(Point,4326) NOT NULL,
    "altitude" double precision,
    "accuracy_meters" double precision,
    "heading" double precision,
    "detected_place_id" "text",
    "weather_snapshot" "jsonb" DEFAULT '{}'::"jsonb",
    "vision_analysis" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'scanning'::"text",
    "rejection_reason" "text",
    CONSTRAINT "geo_drafts_staging_status_check" CHECK (("status" = ANY (ARRAY['scanning'::"text", 'analyzing'::"text", 'rejected'::"text", 'ready_to_record'::"text", 'converted'::"text"])))
);


ALTER TABLE "public"."geo_drafts_staging" OWNER TO "postgres";


ALTER TABLE "public"."geo_drafts_staging" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."geo_drafts_staging_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."knowledge_chunks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "embedding" "extensions"."vector"(768),
    "token_count" integer,
    "importance_score" double precision DEFAULT 1.0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."knowledge_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_hash" "text" NOT NULL,
    "title" "text" NOT NULL,
    "url" "text",
    "source_type" "text" NOT NULL,
    "is_public" boolean DEFAULT false,
    "reputation_score" double precision DEFAULT 1.0,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_cited_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "knowledge_sources_source_type_check" CHECK (("source_type" = ANY (ARRAY['web'::"text", 'admin'::"text", 'user_contribution'::"text"])))
);


ALTER TABLE "public"."knowledge_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."likes" (
    "user_id" "uuid" NOT NULL,
    "podcast_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."madrid_vault_knowledge" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "source_authority" "text",
    "embedding" "extensions"."vector"(768),
    "valid_geo_bounds" "extensions"."geography"(Polygon,4326),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."madrid_vault_knowledge" OWNER TO "postgres";


ALTER TABLE "public"."micro_pods" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."micro_pods_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "data" "jsonb",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."place_memories" (
    "poi_id" bigint NOT NULL,
    "pod_id" bigint NOT NULL,
    "relevance_score" double precision DEFAULT 1.0,
    "geo_location" "extensions"."geography"(Point,4326),
    "focus_entity" "text",
    "content_type" "text",
    "vibe_vector" "extensions"."vector"(768),
    CONSTRAINT "place_memories_content_type_check" CHECK (("content_type" = ANY (ARRAY['chronicle'::"text", 'friend_tip'::"text", 'cultural_radar'::"text", 'legacy_echo'::"text"])))
);


ALTER TABLE "public"."place_memories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" bigint NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price_monthly" numeric(10,2),
    "monthly_creation_limit" integer DEFAULT 0 NOT NULL,
    "features" "text"[],
    "max_concurrent_drafts" integer DEFAULT 3,
    "max_monthly_drafts" integer DEFAULT 5,
    CONSTRAINT "plans_monthly_creation_limit_check" CHECK (("monthly_creation_limit" >= 0))
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


ALTER TABLE "public"."plans" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."plans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."platform_limits" (
    "id" integer NOT NULL,
    "key_name" "text" NOT NULL,
    "max_podcasts_per_month" integer DEFAULT 3,
    "max_listening_minutes" integer DEFAULT 2000,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."platform_limits" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."platform_limits_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."platform_limits_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."platform_limits_id_seq" OWNED BY "public"."platform_limits"."id";



CREATE TABLE IF NOT EXISTS "public"."playback_events" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "podcast_id" bigint NOT NULL,
    "event_type" "public"."interaction_event_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."playback_events" OWNER TO "postgres";


ALTER TABLE "public"."playback_events" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."playback_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."podcast_analysis_history" (
    "analysis_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "podcast_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "agent_version" "text" NOT NULL,
    "analysis_data" "jsonb" NOT NULL,
    "triggered_by" "text" DEFAULT 'system'::"text" NOT NULL
);


ALTER TABLE "public"."podcast_analysis_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."podcast_creation_jobs" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."job_status" DEFAULT 'pending'::"public"."job_status" NOT NULL,
    "payload" "jsonb",
    "error_message" "text",
    "retry_count" integer DEFAULT 0 NOT NULL,
    "micro_pod_id" bigint,
    "archived" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "job_title" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("payload" ->> 'style'::"text") = 'solo'::"text") THEN (("payload" -> 'inputs'::"text") ->> 'topic'::"text")
    WHEN (("payload" ->> 'style'::"text") = 'link'::"text") THEN ((("payload" -> 'inputs'::"text") -> 'narrative'::"text") ->> 'title'::"text")
    ELSE 'Untitled Job'::"text"
END) STORED
);


ALTER TABLE "public"."podcast_creation_jobs" OWNER TO "postgres";


ALTER TABLE "public"."podcast_creation_jobs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."podcast_creation_jobs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."podcast_drafts" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "script_text" "jsonb" NOT NULL,
    "sources" "jsonb" DEFAULT '[]'::"jsonb",
    "creation_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "dossier_text" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'idle'::"text",
    CONSTRAINT "podcast_drafts_status_check" CHECK (("status" = ANY (ARRAY['idle'::"text", 'researching'::"text", 'writing'::"text", 'ready'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."podcast_drafts" OWNER TO "postgres";


ALTER TABLE "public"."podcast_drafts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."podcast_drafts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."podcast_embeddings" (
    "id" bigint NOT NULL,
    "podcast_id" bigint NOT NULL,
    "content" "text",
    "embedding" "extensions"."vector"(768)
);


ALTER TABLE "public"."podcast_embeddings" OWNER TO "postgres";


ALTER TABLE "public"."podcast_embeddings" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."podcast_embeddings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."points_of_interest" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "category" "text",
    "description" "text",
    "geo_location" "extensions"."geography"(Point,4326) NOT NULL,
    "image_summary" "text",
    "reference_podcast_id" bigint,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."points_of_interest" OWNER TO "postgres";


ALTER TABLE "public"."points_of_interest" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."points_of_interest_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."processing_errors" (
    "id" bigint NOT NULL,
    "podcast_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "error_message" "text",
    "error_stack" "text"
);


ALTER TABLE "public"."processing_errors" OWNER TO "postgres";


ALTER TABLE "public"."processing_errors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."processing_errors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profile_testimonials" (
    "id" bigint NOT NULL,
    "profile_user_id" "uuid" NOT NULL,
    "author_user_id" "uuid" NOT NULL,
    "comment_text" "text" NOT NULL,
    "status" "public"."testimonial_status" DEFAULT 'pending'::"public"."testimonial_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "author_cannot_be_profile_user" CHECK (("author_user_id" <> "profile_user_id")),
    CONSTRAINT "profile_testimonials_comment_text_check" CHECK (("char_length"("comment_text") > 0))
);


ALTER TABLE "public"."profile_testimonials" OWNER TO "postgres";


ALTER TABLE "public"."profile_testimonials" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."profile_testimonials_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "active_creation_jobs" integer DEFAULT 0 NOT NULL,
    "stripe_customer_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bio" "text",
    "followers_count" integer DEFAULT 0 NOT NULL,
    "following_count" integer DEFAULT 0 NOT NULL,
    "reputation_score" integer DEFAULT 0,
    "is_verified" boolean DEFAULT false,
    "website_url" "text",
    "bio_short" "text",
    CONSTRAINT "profiles_active_creation_jobs_check" CHECK (("active_creation_jobs" >= 0)),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"]))),
    CONSTRAINT "profiles_username_check" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pulse_staging" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_hash" "text" NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "url" "text" NOT NULL,
    "source_name" "text" NOT NULL,
    "content_type" "public"."content_category" DEFAULT 'news'::"public"."content_category" NOT NULL,
    "authority_score" double precision DEFAULT 1.0,
    "embedding" "extensions"."vector"(768),
    "cluster_id" "uuid",
    "veracity_verified" boolean DEFAULT false,
    "is_high_value" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '48:00:00'::interval)
);


ALTER TABLE "public"."pulse_staging" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "user_id" "uuid" NOT NULL,
    "plan_id" bigint NOT NULL,
    "status" "public"."subscription_status" DEFAULT 'active'::"public"."subscription_status" NOT NULL,
    "stripe_subscription_id" "text",
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_interest_dna" (
    "user_id" "uuid" NOT NULL,
    "dna_vector" "extensions"."vector"(768) NOT NULL,
    "professional_profile" "text",
    "negative_interests" "text"[],
    "expertise_level" smallint DEFAULT 5,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "total_pulses_generated" integer DEFAULT 0,
    CONSTRAINT "user_interest_dna_expertise_level_check" CHECK ((("expertise_level" >= 1) AND ("expertise_level" <= 10)))
);


ALTER TABLE "public"."user_interest_dna" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_resonance_profiles" (
    "user_id" "uuid" NOT NULL,
    "current_center" "point",
    "last_calculated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_resonance_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_usage" (
    "user_id" "uuid" NOT NULL,
    "podcasts_created_this_month" integer DEFAULT 0,
    "minutes_listened_this_month" integer DEFAULT 0,
    "last_reset_date" "date" DEFAULT CURRENT_DATE,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "drafts_created_this_month" integer DEFAULT 0
);


ALTER TABLE "public"."user_usage" OWNER TO "postgres";


ALTER TABLE ONLY "public"."platform_limits" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."platform_limits_id_seq"'::"regclass");



ALTER TABLE ONLY "private"."secrets"
    ADD CONSTRAINT "secrets_pkey" PRIMARY KEY ("name");



ALTER TABLE ONLY "public"."ai_prompts"
    ADD CONSTRAINT "ai_prompts_agent_name_key" UNIQUE ("agent_name");



ALTER TABLE ONLY "public"."ai_prompts"
    ADD CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_usage_logs"
    ADD CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audio_echoes"
    ADD CONSTRAINT "audio_echoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collection_items"
    ADD CONSTRAINT "collection_items_pkey" PRIMARY KEY ("collection_id", "pod_id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "followers_pkey" PRIMARY KEY ("follower_id", "following_id");



ALTER TABLE ONLY "public"."geo_drafts_staging"
    ADD CONSTRAINT "geo_drafts_staging_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_chunks"
    ADD CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_sources"
    ADD CONSTRAINT "knowledge_sources_content_hash_key" UNIQUE ("content_hash");



ALTER TABLE ONLY "public"."knowledge_sources"
    ADD CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("user_id", "podcast_id");



ALTER TABLE ONLY "public"."madrid_vault_knowledge"
    ADD CONSTRAINT "madrid_vault_knowledge_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."micro_pods"
    ADD CONSTRAINT "micro_pods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."place_memories"
    ADD CONSTRAINT "place_memories_pkey" PRIMARY KEY ("poi_id", "pod_id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_limits"
    ADD CONSTRAINT "platform_limits_key_name_key" UNIQUE ("key_name");



ALTER TABLE ONLY "public"."platform_limits"
    ADD CONSTRAINT "platform_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."playback_events"
    ADD CONSTRAINT "playback_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."podcast_analysis_history"
    ADD CONSTRAINT "podcast_analysis_history_pkey" PRIMARY KEY ("analysis_id");



ALTER TABLE ONLY "public"."podcast_creation_jobs"
    ADD CONSTRAINT "podcast_creation_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."podcast_drafts"
    ADD CONSTRAINT "podcast_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."podcast_embeddings"
    ADD CONSTRAINT "podcast_embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."points_of_interest"
    ADD CONSTRAINT "points_of_interest_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."processing_errors"
    ADD CONSTRAINT "processing_errors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_testimonials"
    ADD CONSTRAINT "profile_testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."pulse_staging"
    ADD CONSTRAINT "pulse_staging_content_hash_key" UNIQUE ("content_hash");



ALTER TABLE ONLY "public"."pulse_staging"
    ADD CONSTRAINT "pulse_staging_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."user_interest_dna"
    ADD CONSTRAINT "user_interest_dna_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_resonance_profiles"
    ADD CONSTRAINT "user_resonance_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_usage"
    ADD CONSTRAINT "user_usage_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "idx_ai_usage_logs_user_date" ON "public"."ai_usage_logs" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_jobs_status" ON "public"."podcast_creation_jobs" USING "btree" ("status");



CREATE INDEX "idx_jobs_user_id" ON "public"."podcast_creation_jobs" USING "btree" ("user_id");



CREATE INDEX "idx_kc_embedding_hnsw" ON "public"."knowledge_chunks" USING "hnsw" ("embedding" "extensions"."vector_cosine_ops");



CREATE INDEX "idx_ks_is_public" ON "public"."knowledge_sources" USING "btree" ("is_public");



CREATE INDEX "idx_ks_source_type" ON "public"."knowledge_sources" USING "btree" ("source_type");



CREATE INDEX "idx_madrid_vault_embedding" ON "public"."madrid_vault_knowledge" USING "hnsw" ("embedding" "extensions"."vector_cosine_ops");



CREATE INDEX "idx_micro_pods_geo_active" ON "public"."micro_pods" USING "gist" ("geo_location") WHERE ("status" = 'published'::"public"."podcast_status");



CREATE INDEX "idx_micro_pods_geo_location" ON "public"."micro_pods" USING "gist" ("geo_location");



CREATE INDEX "idx_micro_pods_mode" ON "public"."micro_pods" USING "btree" ("creation_mode");



CREATE INDEX "idx_micro_pods_parent" ON "public"."micro_pods" USING "btree" ("parent_id");



CREATE INDEX "idx_micro_pods_root" ON "public"."micro_pods" USING "btree" ("root_id");



CREATE INDEX "idx_micro_pods_status" ON "public"."micro_pods" USING "btree" ("status");



CREATE INDEX "idx_micro_pods_user_id" ON "public"."micro_pods" USING "btree" ("user_id");



CREATE INDEX "idx_place_memories_geo" ON "public"."place_memories" USING "gist" ("geo_location");



CREATE INDEX "idx_playback_events_user_id_created_at" ON "public"."playback_events" USING "btree" ("user_id", "created_at" DESC);



CREATE UNIQUE INDEX "idx_profiles_username_btree" ON "public"."profiles" USING "btree" ("username");



COMMENT ON INDEX "public"."idx_profiles_username_btree" IS 'Optimiza la resolución de rutas dinámicas de perfil y garantiza la unicidad del handle soberano.';



CREATE INDEX "idx_pulse_staging_embedding" ON "public"."pulse_staging" USING "hnsw" ("embedding" "extensions"."vector_cosine_ops");



CREATE INDEX "idx_pulse_staging_expires_at" ON "public"."pulse_staging" USING "btree" ("expires_at");



CREATE INDEX "notifications_user_id_created_at_idx" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "podcast_embeddings_embedding_idx" ON "public"."podcast_embeddings" USING "ivfflat" ("embedding" "extensions"."vector_cosine_ops") WITH ("lists"='100');



CREATE OR REPLACE TRIGGER "on_follow_delete" AFTER DELETE ON "public"."followers" FOR EACH ROW EXECUTE FUNCTION "public"."update_follow_counts"();



CREATE OR REPLACE TRIGGER "on_follow_insert" AFTER INSERT ON "public"."followers" FOR EACH ROW EXECUTE FUNCTION "public"."update_follow_counts"();



CREATE OR REPLACE TRIGGER "on_jobs_update" BEFORE UPDATE ON "public"."podcast_creation_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_like_delete" AFTER DELETE ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_like_count"();



CREATE OR REPLACE TRIGGER "on_like_insert" AFTER INSERT ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_like_count"();



CREATE OR REPLACE TRIGGER "on_micro_pods_update" BEFORE UPDATE ON "public"."micro_pods" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_new_testimonial" AFTER INSERT ON "public"."profile_testimonials" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_testimonial"();



CREATE OR REPLACE TRIGGER "on_playback_completed_reputation" AFTER INSERT ON "public"."playback_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_curator_reputation"();



CREATE OR REPLACE TRIGGER "on_podcast_publish" AFTER UPDATE ON "public"."micro_pods" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_podcast_publication"();



CREATE OR REPLACE TRIGGER "on_poi_update" BEFORE UPDATE ON "public"."points_of_interest" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_profiles_update" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_subscriptions_update" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_root_id_trigger" BEFORE INSERT ON "public"."micro_pods" FOR EACH ROW EXECUTE FUNCTION "public"."maintain_thread_integrity"();



CREATE OR REPLACE TRIGGER "tr_async_cognitive_orchestrator" AFTER INSERT ON "public"."micro_pods" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_podcast_async"();



CREATE OR REPLACE TRIGGER "tr_async_resonance_likes" AFTER INSERT OR DELETE ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_resonance_update_async"();



CREATE OR REPLACE TRIGGER "tr_async_resonance_playback" AFTER INSERT ON "public"."playback_events" FOR EACH ROW EXECUTE FUNCTION "public"."handle_resonance_update_async"();



CREATE OR REPLACE TRIGGER "tr_check_integrity" AFTER UPDATE OF "audio_ready", "image_ready" ON "public"."micro_pods" FOR EACH ROW WHEN (("new"."processing_status" = 'processing'::"public"."processing_status")) EXECUTE FUNCTION "public"."check_podcast_integrity_and_release"();



CREATE OR REPLACE TRIGGER "tr_on_draft_created" AFTER INSERT ON "public"."podcast_drafts" FOR EACH ROW EXECUTE FUNCTION "public"."on_draft_created_trigger_research"();



CREATE OR REPLACE TRIGGER "tr_on_pod_created" AFTER INSERT ON "public"."micro_pods" FOR EACH ROW EXECUTE FUNCTION "public"."on_pod_created_dispatch_assets"();



CREATE OR REPLACE TRIGGER "tr_update_dna_timestamp" BEFORE UPDATE ON "public"."user_interest_dna" FOR EACH ROW EXECUTE FUNCTION "public"."update_dna_timestamp"();



ALTER TABLE ONLY "public"."ai_usage_logs"
    ADD CONSTRAINT "ai_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."audio_echoes"
    ADD CONSTRAINT "audio_echoes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audio_echoes"
    ADD CONSTRAINT "audio_echoes_parent_pod_id_fkey" FOREIGN KEY ("parent_pod_id") REFERENCES "public"."micro_pods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_items"
    ADD CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_items"
    ADD CONSTRAINT "collection_items_pod_id_fkey" FOREIGN KEY ("pod_id") REFERENCES "public"."micro_pods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "followers_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."geo_drafts_staging"
    ADD CONSTRAINT "geo_drafts_staging_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_chunks"
    ADD CONSTRAINT "knowledge_chunks_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "public"."micro_pods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."micro_pods"
    ADD CONSTRAINT "micro_pods_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."micro_pods"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."micro_pods"
    ADD CONSTRAINT "micro_pods_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "public"."micro_pods"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."micro_pods"
    ADD CONSTRAINT "micro_pods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."place_memories"
    ADD CONSTRAINT "place_memories_pod_id_fkey" FOREIGN KEY ("pod_id") REFERENCES "public"."micro_pods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."place_memories"
    ADD CONSTRAINT "place_memories_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "public"."points_of_interest"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playback_events"
    ADD CONSTRAINT "playback_events_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "public"."micro_pods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playback_events"
    ADD CONSTRAINT "playback_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."podcast_analysis_history"
    ADD CONSTRAINT "podcast_analysis_history_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "public"."micro_pods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."podcast_creation_jobs"
    ADD CONSTRAINT "podcast_creation_jobs_micro_pod_id_fkey" FOREIGN KEY ("micro_pod_id") REFERENCES "public"."micro_pods"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."podcast_creation_jobs"
    ADD CONSTRAINT "podcast_creation_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."podcast_drafts"
    ADD CONSTRAINT "podcast_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."podcast_embeddings"
    ADD CONSTRAINT "podcast_embeddings_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "public"."micro_pods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."points_of_interest"
    ADD CONSTRAINT "points_of_interest_reference_podcast_id_fkey" FOREIGN KEY ("reference_podcast_id") REFERENCES "public"."micro_pods"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."processing_errors"
    ADD CONSTRAINT "processing_errors_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "public"."micro_pods"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profile_testimonials"
    ADD CONSTRAINT "profile_testimonials_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_testimonials"
    ADD CONSTRAINT "profile_testimonials_profile_user_id_fkey" FOREIGN KEY ("profile_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_interest_dna"
    ADD CONSTRAINT "user_interest_dna_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_resonance_profiles"
    ADD CONSTRAINT "user_resonance_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_usage"
    ADD CONSTRAINT "user_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Admins can update quotas" ON "public"."user_usage" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins manage vault" ON "public"."madrid_vault_knowledge" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Allow authenticated users to create" ON "public"."profile_testimonials" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") IS NOT NULL) AND (( SELECT "auth"."uid"() AS "uid") <> "profile_user_id")));



CREATE POLICY "Allow individual read access" ON "public"."subscriptions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Allow individual read access" ON "public"."user_resonance_profiles" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Allow owners to delete" ON "public"."profile_testimonials" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "profile_user_id"));



CREATE POLICY "Allow owners to update" ON "public"."profile_testimonials" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "profile_user_id"));



CREATE POLICY "Allow public and owner read access" ON "public"."profile_testimonials" FOR SELECT USING ((("status" = 'approved'::"public"."testimonial_status") OR (( SELECT "auth"."uid"() AS "uid") = "profile_user_id")));



CREATE POLICY "Allow public read access" ON "public"."followers" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."plans" FOR SELECT USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "public"."ai_prompts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Chunks follow source visibility" ON "public"."knowledge_chunks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."knowledge_sources" "ks"
  WHERE (("ks"."id" = "knowledge_chunks"."source_id") AND ("ks"."is_public" = true)))));



CREATE POLICY "Denegar acceso público a errores de procesamiento" ON "public"."processing_errors" USING (false);



CREATE POLICY "Denegar todo el acceso público" ON "public"."podcast_analysis_history" USING (false);



CREATE POLICY "Echoes are public" ON "public"."audio_echoes" FOR SELECT USING (true);



CREATE POLICY "Los usuarios pueden crear sus propios likes" ON "public"."likes" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Los usuarios pueden eliminar sus propios likes" ON "public"."likes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Permitir acceso total a las notificaciones propias" ON "public"."notifications" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Permitir inserción de eventos de reproducción propios" ON "public"."playback_events" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Permitir lectura pública de likes" ON "public"."likes" FOR SELECT USING (true);



CREATE POLICY "Public read access for verified pulse" ON "public"."pulse_staging" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public read access memories" ON "public"."place_memories" FOR SELECT USING (true);



CREATE POLICY "Users can manage their own drafts" ON "public"."podcast_drafts" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users manage own geo drafts" ON "public"."geo_drafts_staging" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."ai_prompts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_usage_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audio_echoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audio_echoes_insert_policy" ON "public"."audio_echoes" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "author_id"));



ALTER TABLE "public"."collection_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "collection_items_insert_policy" ON "public"."collection_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."collections" "c"
  WHERE (("c"."id" = "collection_items"."collection_id") AND ("c"."owner_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "collection_items_select_policy" ON "public"."collection_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."collections" "c"
  WHERE (("c"."id" = "collection_items"."collection_id") AND (("c"."is_public" IS TRUE) OR ("c"."owner_id" = ( SELECT "auth"."uid"() AS "uid")))))));



ALTER TABLE "public"."collections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "collections_delete" ON "public"."collections" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));



CREATE POLICY "collections_select" ON "public"."collections" FOR SELECT USING ((("is_public" IS TRUE) OR (( SELECT "auth"."uid"() AS "uid") = "owner_id")));



CREATE POLICY "collections_update" ON "public"."collections" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));



CREATE POLICY "collections_write" ON "public"."collections" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));



CREATE POLICY "dna_owner_policy" ON "public"."user_interest_dna" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."followers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "followers_delete_policy" ON "public"."followers" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "follower_id"));



CREATE POLICY "followers_insert_policy" ON "public"."followers" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "follower_id"));



ALTER TABLE "public"."geo_drafts_staging" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "jobs_owner_policy" ON "public"."podcast_creation_jobs" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."knowledge_chunks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_sources" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "knowledge_sources_read_policy" ON "public"."knowledge_sources" FOR SELECT USING ((("is_public" IS TRUE) OR ( SELECT "public"."is_admin"() AS "is_admin")));



ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."madrid_vault_knowledge" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."micro_pods" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "micropods_master_delete" ON "public"."micro_pods" FOR DELETE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."is_admin"()));



CREATE POLICY "micropods_master_insert" ON "public"."micro_pods" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "micropods_master_select" ON "public"."micro_pods" FOR SELECT USING ((("status" = 'published'::"public"."podcast_status") OR (( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."is_admin"()));



CREATE POLICY "micropods_master_update" ON "public"."micro_pods" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."is_admin"()));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."place_memories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."playback_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."podcast_analysis_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."podcast_creation_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."podcast_drafts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."podcast_embeddings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "podcast_embeddings_read_policy" ON "public"."podcast_embeddings" FOR SELECT USING (true);



CREATE POLICY "poi_read_policy" ON "public"."points_of_interest" FOR SELECT USING (true);



ALTER TABLE "public"."points_of_interest" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."processing_errors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_testimonials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_read_all" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."pulse_staging" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_interest_dna" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_resonance_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_usage" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_usage_policy" ON "public"."user_usage" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."is_admin"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."collection_items";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."collections";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."followers";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."likes";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."micro_pods";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."playback_events";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."podcast_analysis_history";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."podcast_creation_jobs";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."podcast_drafts";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."points_of_interest";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profile_testimonials";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."subscriptions";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";

































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."check_draft_quota"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_draft_quota"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_draft_quota"("p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."check_draft_quota"("p_user_id" "uuid") TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."check_podcast_integrity_and_release"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_podcast_integrity_and_release"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_podcast_integrity_and_release"() TO "service_role";
GRANT ALL ON FUNCTION "public"."check_podcast_integrity_and_release"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_function_name" "text", "p_limit" integer, "p_window_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_function_name" "text", "p_limit" integer, "p_window_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_function_name" "text", "p_limit" integer, "p_window_seconds" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_function_name" "text", "p_limit" integer, "p_window_seconds" integer) TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."cleanup_expired_pulse"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_pulse"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_pulse"() TO "service_role";
GRANT ALL ON FUNCTION "public"."cleanup_expired_pulse"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."create_profile_and_free_subscription"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_and_free_subscription"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_and_free_subscription"() TO "service_role";
GRANT ALL ON FUNCTION "public"."create_profile_and_free_subscription"() TO "supabase_auth_admin";
GRANT ALL ON FUNCTION "public"."create_profile_and_free_subscription"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."dispatch_edge_function"("function_name" "text", "payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."dispatch_edge_function"("function_name" "text", "payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."dispatch_edge_function"("function_name" "text", "payload" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."dispatch_edge_function"("function_name" "text", "payload" "jsonb") TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."fetch_personalized_pulse"("p_user_id" "uuid", "p_limit" integer, "p_threshold" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_personalized_pulse"("p_user_id" "uuid", "p_limit" integer, "p_threshold" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_personalized_pulse"("p_user_id" "uuid", "p_limit" integer, "p_threshold" double precision) TO "service_role";
GRANT ALL ON FUNCTION "public"."fetch_personalized_pulse"("p_user_id" "uuid", "p_limit" integer, "p_threshold" double precision) TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."get_curated_library_shelves"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_curated_library_shelves"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_curated_library_shelves"("p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_curated_library_shelves"("p_user_id" "uuid") TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."get_generic_library_shelves"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_generic_library_shelves"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_generic_library_shelves"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_generic_library_shelves"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."get_memories_in_bounds"("min_lat" double precision, "min_lng" double precision, "max_lat" double precision, "max_lng" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."get_memories_in_bounds"("min_lat" double precision, "min_lng" double precision, "max_lat" double precision, "max_lng" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_memories_in_bounds"("min_lat" double precision, "min_lng" double precision, "max_lat" double precision, "max_lng" double precision) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_memories_in_bounds"("min_lat" double precision, "min_lng" double precision, "max_lat" double precision, "max_lng" double precision) TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."get_nearby_podcasts"("p_lat" double precision, "p_lng" double precision, "p_radius_meters" integer, "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_nearby_podcasts"("p_lat" double precision, "p_lng" double precision, "p_radius_meters" integer, "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_nearby_podcasts"("p_lat" double precision, "p_lng" double precision, "p_radius_meters" integer, "p_limit" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_nearby_podcasts"("p_lat" double precision, "p_lng" double precision, "p_radius_meters" integer, "p_limit" integer) TO "supabase_functions_admin";



GRANT ALL ON TABLE "public"."micro_pods" TO "anon";
GRANT ALL ON TABLE "public"."micro_pods" TO "authenticated";
GRANT ALL ON TABLE "public"."micro_pods" TO "service_role";



GRANT UPDATE("duration_seconds") ON TABLE "public"."micro_pods" TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_resonant_podcasts"("center_point" "point", "count_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_resonant_podcasts"("center_point" "point", "count_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_resonant_podcasts"("center_point" "point", "count_limit" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_resonant_podcasts"("center_point" "point", "count_limit" integer) TO "supabase_functions_admin";



REVOKE ALL ON FUNCTION "public"."get_service_key"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_service_key"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_service_key"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."get_user_discovery_feed"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_discovery_feed"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_discovery_feed"("p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_user_discovery_feed"("p_user_id" "uuid") TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."handle_new_podcast_async"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_podcast_async"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_podcast_async"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_podcast_async"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."handle_new_podcast_publication"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_podcast_publication"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_podcast_publication"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_podcast_publication"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."handle_new_testimonial"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_testimonial"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_testimonial"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_testimonial"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."handle_resonance_update_async"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_resonance_update_async"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_resonance_update_async"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_resonance_update_async"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."handle_zombie_jobs"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_zombie_jobs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_zombie_jobs"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_zombie_jobs"() TO "supabase_functions_admin";






GRANT ALL ON FUNCTION "public"."increment_jobs_and_queue"("p_user_id" "uuid", "p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_jobs_and_queue"("p_user_id" "uuid", "p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_jobs_and_queue"("p_user_id" "uuid", "p_payload" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."increment_jobs_and_queue"("p_user_id" "uuid", "p_payload" "jsonb") TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."increment_play_count"("podcast_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_play_count"("podcast_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_play_count"("podcast_id" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."increment_play_count"("podcast_id" bigint) TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."init_draft_process_v2"("p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."init_draft_process_v2"("p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."init_draft_process_v2"("p_payload" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."init_draft_process_v2"("p_payload" "jsonb") TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."maintain_thread_integrity"() TO "anon";
GRANT ALL ON FUNCTION "public"."maintain_thread_integrity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."maintain_thread_integrity"() TO "service_role";
GRANT ALL ON FUNCTION "public"."maintain_thread_integrity"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."mark_notifications_as_read"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notifications_as_read"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notifications_as_read"() TO "service_role";
GRANT ALL ON FUNCTION "public"."mark_notifications_as_read"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."on_draft_created_trigger_research"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_draft_created_trigger_research"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_draft_created_trigger_research"() TO "service_role";
GRANT ALL ON FUNCTION "public"."on_draft_created_trigger_research"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."on_pod_created_dispatch_assets"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_pod_created_dispatch_assets"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_pod_created_dispatch_assets"() TO "service_role";
GRANT ALL ON FUNCTION "public"."on_pod_created_dispatch_assets"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."on_pod_created_trigger_assets"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_pod_created_trigger_assets"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_pod_created_trigger_assets"() TO "service_role";
GRANT ALL ON FUNCTION "public"."on_pod_created_trigger_assets"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."promote_draft_to_production_v2"("p_draft_id" bigint, "p_final_title" "text", "p_final_script" "text", "p_sources" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."promote_draft_to_production_v2"("p_draft_id" bigint, "p_final_title" "text", "p_final_script" "text", "p_sources" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."promote_draft_to_production_v2"("p_draft_id" bigint, "p_final_title" "text", "p_final_script" "text", "p_sources" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."promote_draft_to_production_v2"("p_draft_id" bigint, "p_final_title" "text", "p_final_script" "text", "p_sources" "jsonb") TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."reset_monthly_quotas"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_monthly_quotas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_monthly_quotas"() TO "service_role";
GRANT ALL ON FUNCTION "public"."reset_monthly_quotas"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."reward_sovereign_curation"() TO "anon";
GRANT ALL ON FUNCTION "public"."reward_sovereign_curation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reward_sovereign_curation"() TO "service_role";
GRANT ALL ON FUNCTION "public"."reward_sovereign_curation"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "supabase_functions_admin";












GRANT ALL ON FUNCTION "public"."search_omni"("query_text" "text", "query_embedding" double precision[], "match_threshold" double precision, "match_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_omni"("query_text" "text", "query_embedding" double precision[], "match_threshold" double precision, "match_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_omni"("query_text" "text", "query_embedding" double precision[], "match_threshold" double precision, "match_count" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."search_omni"("query_text" "text", "query_embedding" double precision[], "match_threshold" double precision, "match_count" integer) TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."search_podcasts"("search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_podcasts"("search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_podcasts"("search_term" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."search_podcasts"("search_term" "text") TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."trigger_resonance_recalculation"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_resonance_recalculation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_resonance_recalculation"() TO "service_role";
GRANT ALL ON FUNCTION "public"."trigger_resonance_recalculation"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."update_curator_reputation"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_curator_reputation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_curator_reputation"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_curator_reputation"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."update_dna_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_dna_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_dna_timestamp"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_dna_timestamp"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "supabase_functions_admin";



GRANT ALL ON FUNCTION "public"."update_like_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_like_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_like_count"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_like_count"() TO "supabase_functions_admin";









































































































GRANT ALL ON TABLE "public"."ai_prompts" TO "anon";
GRANT ALL ON TABLE "public"."ai_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_prompts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ai_prompts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ai_prompts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ai_prompts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."ai_usage_logs" TO "anon";
GRANT ALL ON TABLE "public"."ai_usage_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_usage_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ai_usage_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ai_usage_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ai_usage_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."audio_echoes" TO "anon";
GRANT ALL ON TABLE "public"."audio_echoes" TO "authenticated";
GRANT ALL ON TABLE "public"."audio_echoes" TO "service_role";



GRANT ALL ON TABLE "public"."collection_items" TO "anon";
GRANT ALL ON TABLE "public"."collection_items" TO "authenticated";
GRANT ALL ON TABLE "public"."collection_items" TO "service_role";



GRANT ALL ON TABLE "public"."collections" TO "anon";
GRANT ALL ON TABLE "public"."collections" TO "authenticated";
GRANT ALL ON TABLE "public"."collections" TO "service_role";



GRANT ALL ON TABLE "public"."followers" TO "anon";
GRANT ALL ON TABLE "public"."followers" TO "authenticated";
GRANT ALL ON TABLE "public"."followers" TO "service_role";



GRANT ALL ON TABLE "public"."geo_drafts_staging" TO "anon";
GRANT ALL ON TABLE "public"."geo_drafts_staging" TO "authenticated";
GRANT ALL ON TABLE "public"."geo_drafts_staging" TO "service_role";



GRANT ALL ON SEQUENCE "public"."geo_drafts_staging_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."geo_drafts_staging_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."geo_drafts_staging_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_chunks" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_sources" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_sources" TO "service_role";



GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";



GRANT ALL ON TABLE "public"."madrid_vault_knowledge" TO "anon";
GRANT ALL ON TABLE "public"."madrid_vault_knowledge" TO "authenticated";
GRANT ALL ON TABLE "public"."madrid_vault_knowledge" TO "service_role";



GRANT ALL ON SEQUENCE "public"."micro_pods_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."micro_pods_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."micro_pods_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."place_memories" TO "anon";
GRANT ALL ON TABLE "public"."place_memories" TO "authenticated";
GRANT ALL ON TABLE "public"."place_memories" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."plans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."plans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."plans_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."platform_limits" TO "anon";
GRANT ALL ON TABLE "public"."platform_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_limits" TO "service_role";



GRANT ALL ON SEQUENCE "public"."platform_limits_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."platform_limits_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."platform_limits_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."playback_events" TO "anon";
GRANT ALL ON TABLE "public"."playback_events" TO "authenticated";
GRANT ALL ON TABLE "public"."playback_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."playback_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."playback_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."playback_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."podcast_analysis_history" TO "anon";
GRANT ALL ON TABLE "public"."podcast_analysis_history" TO "authenticated";
GRANT ALL ON TABLE "public"."podcast_analysis_history" TO "service_role";



GRANT ALL ON TABLE "public"."podcast_creation_jobs" TO "anon";
GRANT ALL ON TABLE "public"."podcast_creation_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."podcast_creation_jobs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."podcast_creation_jobs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."podcast_creation_jobs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."podcast_creation_jobs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."podcast_drafts" TO "anon";
GRANT ALL ON TABLE "public"."podcast_drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."podcast_drafts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."podcast_drafts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."podcast_drafts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."podcast_drafts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."podcast_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."podcast_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."podcast_embeddings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."podcast_embeddings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."podcast_embeddings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."podcast_embeddings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."points_of_interest" TO "anon";
GRANT ALL ON TABLE "public"."points_of_interest" TO "authenticated";
GRANT ALL ON TABLE "public"."points_of_interest" TO "service_role";



GRANT ALL ON SEQUENCE "public"."points_of_interest_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."points_of_interest_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."points_of_interest_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."processing_errors" TO "anon";
GRANT ALL ON TABLE "public"."processing_errors" TO "authenticated";
GRANT ALL ON TABLE "public"."processing_errors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."processing_errors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."processing_errors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."processing_errors_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profile_testimonials" TO "anon";
GRANT ALL ON TABLE "public"."profile_testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_testimonials" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profile_testimonials_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profile_testimonials_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profile_testimonials_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."pulse_staging" TO "anon";
GRANT ALL ON TABLE "public"."pulse_staging" TO "authenticated";
GRANT ALL ON TABLE "public"."pulse_staging" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."user_interest_dna" TO "anon";
GRANT ALL ON TABLE "public"."user_interest_dna" TO "authenticated";
GRANT ALL ON TABLE "public"."user_interest_dna" TO "service_role";



GRANT ALL ON TABLE "public"."user_resonance_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_resonance_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_resonance_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_usage" TO "anon";
GRANT ALL ON TABLE "public"."user_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."user_usage" TO "service_role";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































