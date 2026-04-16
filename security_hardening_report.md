# 🛡️ Security Hardening Report: NicePod Persistence Layer

**Auditor:** Sentinel 🛡️
**Protocol:** Madrid Resonance V4.0
**Integrity Level:** CRITICAL

## 1. 🔒 Vulnerabilities Identified

### A. Missing RLS Enforcement on Sensitive Data
- **Table:** `private.secrets`
- **Risk:** CRITICAL. Currently, the table lacks Row Level Security. If a misconfiguration occurs in the `private` schema access or if it's accidentally exposed to the `anon` or `authenticated` roles, sensitive cryptographic material or API keys could be leaked.
- **Pathway:** Direct database connection or GraphQL exposure if the schema is not strictly isolated.

### B. Undefined Policies on Guarded Tables
- **Tables:** `public.ai_usage_logs`, `public.point_of_interest_ingestion_buffer`
- **Risk:** MEDIUM/HIGH. RLS is enabled, which is good, but the absence of policies defaults to a "deny all" for non-owners/non-admins. However, for `ai_usage_logs`, users should be able to audit their own consumption for transparency. For the ingestion buffer, access should be strictly limited to administrative tools to prevent leaking unrefined OCR/Vision data.

### C. Edge Function Authority Bypass (REMEDIATED)
- **Function:** `vault-refinery`
- **Risk:** CRITICAL. The function lacked identity verification. Any authenticated user could potentially trigger the expensive knowledge refinement process (Gemini Flash + Embeddings) if they discovered the function URL.
- **Action Taken:** Implemented `GuardContext` and manual role verification.

---

## 2. 🛠️ Proposed Hardening (SQL Migration)

The human architect is requested to verify and execute the following SQL snippets:

```sql
-- 1. Hardening private.secrets
ALTER TABLE "private"."secrets" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny all public access to secrets"
ON "private"."secrets"
USING (false);

-- 2. Implementing policies for ai_usage_logs
CREATE POLICY "Users can view their own usage logs"
ON "public"."ai_usage_logs"
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage logs"
ON "public"."ai_usage_logs"
FOR SELECT
USING (public.is_admin());

-- 3. Restricting point_of_interest_ingestion_buffer to Administrators
CREATE POLICY "Admins manage ingestion buffer"
ON "public"."point_of_interest_ingestion_buffer"
FOR ALL
USING (public.is_admin());
```

---

## 3. 📉 Impact Assessment

- **TypeScript Contract:** No changes required to `types/database.types.ts`. The schema structure remains identical; only access control logic is altered.
- **Server Actions:**
    - `actions/vault-actions.ts`: `listVaultSources` and `injectManualKnowledge` will remain functional as they already utilize administrative authority.
    - `actions/profile-actions.ts`: No impact.
- **Edge Functions:**
    - `supabase/functions/vault-refinery/index.ts`: Now requires a valid Administrator JWT if called from outside the trusted infrastructure. Internal triggers remain unaffected due to `isTrusted` bypass.

---

**FINAL MANDATE:** "Security is a process, not an action. Propose changes with surgical precision, audit twice, deploy once."
