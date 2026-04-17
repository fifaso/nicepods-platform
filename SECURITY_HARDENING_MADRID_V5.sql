/**
 * ARCHIVO: SECURITY_HARDENING_MADRID_V5.sql
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Zero Trust Architecture (ZTA)
 * MISIÓN: Hardening of Infrastructure Vault & Logging Perimeter
 * NIVEL DE INTEGRIDAD: 100%
 */

-- [PHASE 1]: VAULT HARDENING (private.secrets)
-- Mission: Seal sensitive infrastructure credentials from all non-system roles.

ALTER TABLE "private"."secrets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal_Service_Access" ON "private"."secrets"
    FOR ALL
    TO service_role
    USING (TRUE)
    WITH CHECK (TRUE);

-- Explicitly revoke all access from other roles to ensure Zero Trust.
REVOKE ALL ON TABLE "private"."secrets" FROM public, authenticated, anon;
GRANT ALL ON TABLE "private"."secrets" TO service_role;
GRANT ALL ON TABLE "private"."secrets" TO postgres;


-- [PHASE 2]: LOGGING PERIMETER HARDENING (public.ai_usage_logs)
-- Mission: Allow users to audit their own usage while enabling system-level logging.

-- Ensure RLS is enabled (Audit confirmed it is already enabled, but we re-assert for integrity).
ALTER TABLE "public"."ai_usage_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "artificial_intelligence_usage_logs_read_own_policy" ON "public"."ai_usage_logs"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "artificial_intelligence_usage_logs_system_insert_policy" ON "public"."ai_usage_logs"
    FOR INSERT
    TO service_role
    WITH CHECK (TRUE);

CREATE POLICY "artificial_intelligence_usage_logs_administrator_audit_policy" ON "public"."ai_usage_logs"
    FOR ALL
    TO authenticated
    USING (public.is_admin());


-- [PHASE 3]: INGESTION BUFFER HARDENING (public.point_of_interest_ingestion_buffer)
-- Mission: Protect raw sensor data and ingestion pipelines from unauthorized manipulation.

-- Ensure RLS is enabled (Audit confirmed it is already enabled, but we re-assert for integrity).
ALTER TABLE "public"."point_of_interest_ingestion_buffer" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "point_of_interest_ingestion_buffer_system_access_policy" ON "public"."point_of_interest_ingestion_buffer"
    FOR ALL
    TO service_role
    USING (TRUE)
    WITH CHECK (TRUE);

CREATE POLICY "point_of_interest_ingestion_buffer_administrator_audit_policy" ON "public"."point_of_interest_ingestion_buffer"
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- [PHASE 4]: NOMINAL SINCRO (ZAP Enforcement)
-- Mission: Ensure all policies follow technical descriptor standards.

COMMENT ON TABLE "private"."secrets" IS 'Infrastructure Vault: Contains encrypted binary secrets for cloud service authorization.';
COMMENT ON TABLE "public"."ai_usage_logs" IS 'Usage Telemetry: Records of Artificial Intelligence function execution per user.';
COMMENT ON TABLE "public"."point_of_interest_ingestion_buffer" IS 'Ingestion Staging: Temporary storage for high-resolution sensor data and OCR analysis.';
