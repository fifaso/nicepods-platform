CREATE OR REPLACE FUNCTION "public"."check_draft_quota"("p_user_id" "uuid") RETURNS "jsonb"
AS $$
DECLARE
v_concurrent_limit int;

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
AND processing_status = 'processing';

CREATE OR REPLACE FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_function_name" "text", "p_limit" integer, "p_window_seconds" integer) RETURNS boolean
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'extensions'
AS $$
declare
request_count int;

CREATE OR REPLACE FUNCTION "public"."cleanup_expired_pulse"() RETURNS "void"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'extensions'
AS $$
BEGIN
DELETE FROM public.pulse_staging WHERE expires_at < now();

CREATE OR REPLACE FUNCTION "public"."create_profile_and_free_subscription"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO ''
AS $$ DECLARE free_plan_id BIGINT;

CREATE OR REPLACE FUNCTION "public"."dispatch_edge_function"("function_name" "text", "payload" "jsonb") RETURNS "jsonb"
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
request_id bigint;

CREATE OR REPLACE FUNCTION "public"."fetch_personalized_pulse"("p_user_id" "uuid", "p_limit" integer DEFAULT 20, "p_threshold" double precision DEFAULT 0.7) RETURNS TABLE("id" "uuid", "title" "text", "summary" "text", "url" "text", "source_name" "text", "content_type" "public"."content_category", "authority_score" double precision, "similarity" double precision)
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'extensions'
AS $$
DECLARE
v_user_dna vector(768);

CREATE OR REPLACE FUNCTION "public"."get_curated_library_shelves"("p_user_id" "uuid") RETURNS json
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
DECLARE
user_center point;

CREATE OR REPLACE FUNCTION "public"."get_generic_library_shelves"() RETURNS json
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
DECLARE
result json;

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
pm.geo_location::geometry && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
LIMIT 100;

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

CREATE TABLE IF NOT EXISTS "public"."micro_pods" (
"id" bigint NOT NULL,
"user_id" "uuid" NOT NULL,
"title" "text" NOT NULL,
"description" "text",
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
"script_text" "jsonb",
"total_audio_segments" integer DEFAULT 0,
"current_audio_segments" integer DEFAULT 0,
"audio_assembly_status" "public"."assembly_status" DEFAULT 'idle'::"public"."assembly_status",
CONSTRAINT "micro_pods_creation_mode_check" CHECK (("creation_mode" = ANY (ARRAY['standard'::"text", 'remix'::"text", 'situational'::"text"]))),
CONSTRAINT "micro_pods_title_check" CHECK (("char_length"("title") > 0))
);

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

CREATE OR REPLACE FUNCTION "public"."get_service_key"() RETURNS "text"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'vault'
AS $$
DECLARE
secret_value text;

CREATE OR REPLACE FUNCTION "public"."get_user_discovery_feed"("p_user_id" "uuid") RETURNS json
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
DECLARE
user_center point;

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
SET "search_path" TO 'public', 'extensions'
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

CREATE OR REPLACE FUNCTION "public"."handle_new_testimonial"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
DECLARE
actor_name_text text;

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
COALESCE(
NEW.raw_user_meta_data->>'username',
split_part(NEW.email, '@', 1)
)
);

CREATE OR REPLACE FUNCTION "public"."handle_resonance_update_async"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
target_user_id uuid;

CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO ''
AS $$ BEGIN NEW.updated_at = now();

CREATE OR REPLACE FUNCTION "public"."handle_zombie_jobs"() RETURNS "void"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'extensions'
AS $$
DECLARE
count_killed INTEGER;

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

CREATE OR REPLACE FUNCTION "public"."increment_jobs_and_queue"("p_user_id" "uuid", "p_payload" "jsonb") RETURNS bigint
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
DECLARE
current_monthly_count INT;

CREATE OR REPLACE FUNCTION "public"."increment_paper_usage"("p_ids" "uuid"[]) RETURNS "void"
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
BEGIN
UPDATE public.pulse_staging
SET usage_count = usage_count + 1,
updated_at = NOW()
WHERE id = ANY(p_ids);

CREATE OR REPLACE FUNCTION "public"."increment_play_count"("podcast_id" bigint) RETURNS "void"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
UPDATE public.micro_pods
SET play_count = play_count + 1
WHERE id = podcast_id;

CREATE OR REPLACE FUNCTION "public"."init_draft_process_v2"("p_payload" "jsonb") RETURNS TABLE("draft_id" bigint, "allowed" boolean, "reason" "text")
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
v_user_id UUID;

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

CREATE OR REPLACE FUNCTION "public"."maintain_thread_integrity"() RETURNS "trigger"
LANGUAGE "plpgsql"
SET "search_path" TO 'public', 'extensions'
AS $$
BEGIN
IF NEW.parent_id IS NOT NULL THEN
SELECT COALESCE(root_id, id) INTO NEW.root_id
FROM public.micro_pods
WHERE id = NEW.parent_id;

CREATE OR REPLACE FUNCTION "public"."mark_notifications_as_read"() RETURNS "void"
LANGUAGE "sql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
UPDATE public.notifications
SET is_read = true
WHERE user_id = auth.uid() AND is_read = false;

CREATE OR REPLACE FUNCTION "public"."notify_segment_upload"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
v_total_expected INTEGER;

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

CREATE OR REPLACE FUNCTION "public"."promote_draft_to_production_v2"("p_draft_id" bigint, "p_final_title" "text", "p_final_script" "text", "p_sources" "jsonb" DEFAULT NULL::"jsonb") RETURNS TABLE("pod_id" bigint, "success" boolean, "message" "text")
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
v_user_id UUID;

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
SET "search_path" TO 'public', 'extensions'
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
SET "search_path" TO 'public', 'extensions'
AS $$
BEGIN
IF (OLD.status = 'draft' AND NEW.status = 'published' AND NEW.creation_mode = 'situational') THEN
UPDATE public.profiles
SET reputation_score = reputation_score + 10
WHERE id = NEW.user_id;

CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'pg_catalog'
AS $$
DECLARE
cmd record;

CREATE TABLE AS', 'SELECT INTO')
AND object_type IN ('table','partitioned table')
LOOP
IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
BEGIN
EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);

CREATE OR REPLACE FUNCTION "public"."save_analysis_and_embedding"("p_podcast_id" bigint, "p_agent_version" "text", "p_ai_summary" "text", "p_narrative_lens" "text", "p_ai_tags" "text"[], "p_ai_coordinates" "point", "p_consistency_level" "public"."consistency_level", "p_embedding" "extensions"."vector") RETURNS "void"
LANGUAGE "plpgsql"
SET "search_path" TO 'public', 'extensions'
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
order by (
((1 - (kc.embedding <=> query_embedding)) * 0.8) +
((1.0 / (extract(day from (now() - ks.created_at)) + 1)) * 0.2)
) desc
limit match_count;

CREATE OR REPLACE FUNCTION "public"."search_omni"("query_text" "text", "query_embedding" double precision[], "match_threshold" double precision, "match_count" integer) RETURNS TABLE("type" "text", "id" "text", "title" "text", "subtitle" "text", "image_url" "text", "similarity" double precision)
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'extensions'
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

CREATE OR REPLACE FUNCTION "public"."search_pulse_staging"("query_embedding" "extensions"."vector", "match_threshold" double precision, "match_count" integer) RETURNS TABLE("id" "uuid", "title" "text", "summary" "text", "url" "text", "similarity" double precision)
LANGUAGE "plpgsql"
AS $$
BEGIN
RETURN QUERY
SELECT
ps.id,
ps.title,
ps.summary,
ps.url,
1 - (ps.embedding <=> query_embedding) AS similarity
FROM pulse_staging ps
WHERE 1 - (ps.embedding <=> query_embedding) > match_threshold
ORDER BY similarity DESC
LIMIT match_count;

CREATE OR REPLACE FUNCTION "public"."trigger_resonance_recalculation"() RETURNS "trigger"
LANGUAGE "plpgsql"
SET "search_path" TO 'public', 'extensions'
AS $$
DECLARE
user_id_to_update UUID;

CREATE OR REPLACE FUNCTION "public"."update_curator_reputation"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'extensions'
AS $$
DECLARE
curator_id uuid;

CREATE OR REPLACE FUNCTION "public"."update_dna_timestamp"() RETURNS "trigger"
LANGUAGE "plpgsql"
SET "search_path" TO 'public', 'extensions'
AS $$
BEGIN
NEW.last_updated = now();

CREATE OR REPLACE FUNCTION "public"."update_follow_counts"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
DECLARE
actor_name_text text;

CREATE OR REPLACE FUNCTION "public"."update_like_count"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$-- Código SQL completo y corregido para la función 'update_like_count'
DECLARE
podcast_owner_id uuid;

CREATE TABLE IF NOT EXISTS "private"."secrets" (
"name" "text" NOT NULL,
"value" "bytea" NOT NULL
);

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

CREATE TABLE IF NOT EXISTS "public"."ai_usage_logs" (
"id" bigint NOT NULL,
"user_id" "uuid" NOT NULL,
"function_name" "text" NOT NULL,
"created_at" timestamp with time zone DEFAULT "now"()
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

CREATE TABLE IF NOT EXISTS "public"."audio_segments" (
"id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
"podcast_id" bigint,
"segment_index" integer NOT NULL,
"storage_path" "text" NOT NULL,
"byte_size" integer DEFAULT 0,
"status" "text" DEFAULT 'pending'::"text",
"created_at" timestamp with time zone DEFAULT "now"(),
"updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."collection_items" (
"collection_id" "uuid" NOT NULL,
"pod_id" bigint NOT NULL,
"added_at" timestamp with time zone DEFAULT "now"(),
"curator_note" "text"
);

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

CREATE TABLE IF NOT EXISTS "public"."followers" (
"follower_id" "uuid" NOT NULL,
"following_id" "uuid" NOT NULL,
"created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

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

CREATE TABLE IF NOT EXISTS "public"."knowledge_chunks" (
"id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
"source_id" "uuid" NOT NULL,
"content" "text" NOT NULL,
"embedding" "extensions"."vector"(768),
"token_count" integer,
"importance_score" double precision DEFAULT 1.0,
"created_at" timestamp with time zone DEFAULT "now"()
);

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

CREATE TABLE IF NOT EXISTS "public"."likes" (
"user_id" "uuid" NOT NULL,
"podcast_id" bigint NOT NULL,
"created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."madrid_vault_knowledge" (
"id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
"content" "text" NOT NULL,
"source_authority" "text",
"embedding" "extensions"."vector"(768),
"valid_geo_bounds" "extensions"."geography"(Polygon,4326),
"created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."notifications" (
"id" bigint NOT NULL,
"user_id" "uuid" NOT NULL,
"type" "public"."notification_type" NOT NULL,
"data" "jsonb",
"is_read" boolean DEFAULT false NOT NULL,
"created_at" timestamp with time zone DEFAULT "now"() NOT NULL
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

CREATE TABLE IF NOT EXISTS "public"."platform_limits" (
"id" integer NOT NULL,
"key_name" "text" NOT NULL,
"max_podcasts_per_month" integer DEFAULT 3,
"max_listening_minutes" integer DEFAULT 2000,
"created_at" timestamp with time zone DEFAULT "now"(),
"value" "text"
);

CREATE TABLE IF NOT EXISTS "public"."playback_events" (
"id" bigint NOT NULL,
"user_id" "uuid" NOT NULL,
"podcast_id" bigint NOT NULL,
"event_type" "public"."interaction_event_type" NOT NULL,
"created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."podcast_analysis_history" (
"analysis_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
"podcast_id" bigint NOT NULL,
"created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
"agent_version" "text" NOT NULL,
"analysis_data" "jsonb" NOT NULL,
"triggered_by" "text" DEFAULT 'system'::"text" NOT NULL
);

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

CREATE TABLE IF NOT EXISTS "public"."podcast_embeddings" (
"id" bigint NOT NULL,
"podcast_id" bigint NOT NULL,
"content" "text",
"embedding" "extensions"."vector"(768)
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

CREATE TABLE IF NOT EXISTS "public"."processing_errors" (
"id" bigint NOT NULL,
"podcast_id" bigint,
"created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
"error_message" "text",
"error_stack" "text"
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
"expires_at" timestamp with time zone DEFAULT ("now"() + '48:00:00'::interval),
"usage_count" integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "public"."research_backlog" (
"id" bigint NOT NULL,
"topic" "text" NOT NULL,
"request_count" integer DEFAULT 1,
"priority_level" integer DEFAULT 1,
"status" "public"."backlog_status" DEFAULT 'pending'::"public"."backlog_status",
"last_error" "text",
"metadata" "jsonb" DEFAULT '{}'::"jsonb",
"created_at" timestamp with time zone DEFAULT "now"(),
"updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
"user_id" "uuid" NOT NULL,
"plan_id" bigint NOT NULL,
"status" "public"."subscription_status" DEFAULT 'active'::"public"."subscription_status" NOT NULL,
"stripe_subscription_id" "text",
"current_period_end" timestamp with time zone,
"created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
"updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

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

CREATE TABLE IF NOT EXISTS "public"."user_resonance_profiles" (
"user_id" "uuid" NOT NULL,
"current_center" "point",
"last_calculated_at" timestamp with time zone,
"created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
"updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_usage" (
"user_id" "uuid" NOT NULL,
"podcasts_created_this_month" integer DEFAULT 0,
"minutes_listened_this_month" integer DEFAULT 0,
"last_reset_date" "date" DEFAULT CURRENT_DATE,
"updated_at" timestamp with time zone DEFAULT "now"(),
"drafts_created_this_month" integer DEFAULT 0
);

CREATE OR REPLACE TRIGGER "on_audio_segments_update" BEFORE UPDATE ON "public"."audio_segments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();

CREATE OR REPLACE TRIGGER "on_backlog_update" BEFORE UPDATE ON "public"."research_backlog" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();

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

CREATE OR REPLACE TRIGGER "tr_on_segment_uploaded" AFTER INSERT OR UPDATE ON "public"."audio_segments" FOR EACH ROW EXECUTE FUNCTION "public"."notify_segment_upload"();

CREATE OR REPLACE TRIGGER "tr_update_dna_timestamp" BEFORE UPDATE ON "public"."user_interest_dna" FOR EACH ROW EXECUTE FUNCTION "public"."update_dna_timestamp"();