/**
 * ARCHIVO: SECURITY_HARDENING_FINAL.sql
 * VERSIÓN: 1.1 (Madrid Resonance)
 * PROTOCOLO: Zero Trust Architecture (ZTA)
 * MISIÓN: Final Sealing of the Infrastructure Vault & Telemetry Perimeter
 * [REFORMA V1.1]: Enforcement of Universal Law #4 (Least Privilege - No USING TRUE).
 * NIVEL DE INTEGRIDAD: 100%
 */

-- [PHASE 1]: VAULT HARDENING (private.secrets)
-- Mission: Seal sensitive infrastructure credentials.
-- Protocol: Restricted to service_role with explicit check on auth.role().

ALTER TABLE "private"."secrets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal_Service_Access_Policy" ON "private"."secrets"
    FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Explicitly revoke all access from other roles to ensure Zero Trust.
REVOKE ALL ON TABLE "private"."secrets" FROM public, authenticated, anon;
GRANT ALL ON TABLE "private"."secrets" TO service_role;
GRANT ALL ON TABLE "private"."secrets" TO postgres;


-- [PHASE 2]: TELEMETRY PERIMETER (public.ai_usage_logs)
-- Mission: Allow Voyagers to audit their own usage while enabling system-level logging.

ALTER TABLE "public"."ai_usage_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_logs_voyager_read_own_policy" ON "public"."ai_usage_logs"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "ai_usage_logs_system_insert_policy" ON "public"."ai_usage_logs"
    FOR INSERT
    TO service_role
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "ai_usage_logs_administrator_audit_policy" ON "public"."ai_usage_logs"
    FOR ALL
    TO authenticated
    USING (public.is_admin());


-- [PHASE 3]: INGESTION BUFFER (public.point_of_interest_ingestion_buffer)
-- Mission: Protect raw sensor data and ingestion pipelines.

ALTER TABLE "public"."point_of_interest_ingestion_buffer" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poi_ingestion_buffer_system_orchestration_policy" ON "public"."point_of_interest_ingestion_buffer"
    FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "poi_ingestion_buffer_administrator_audit_policy" ON "public"."point_of_interest_ingestion_buffer"
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- [PHASE 4]: NOMINAL SINCRO (ZAP Enforcement)
COMMENT ON TABLE "private"."secrets" IS 'Infrastructure Vault: Contains encrypted binary secrets for cloud service authorization.';
COMMENT ON TABLE "public"."ai_usage_logs" IS 'Usage Telemetry: Records of Artificial Intelligence function execution per user.';
COMMENT ON TABLE "public"."point_of_interest_ingestion_buffer" IS 'Ingestion Staging: Temporary storage for sensor data and OCR analysis.';
