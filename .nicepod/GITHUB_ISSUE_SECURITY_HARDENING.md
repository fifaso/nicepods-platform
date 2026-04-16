# 🛡️ SECURITY: RLS Hardening for private.secrets

## ⚠️ RISK ASSESSMENT
- **Vulnerability**: Row Level Security (RLS) is [DISABLED] on `private.secrets`.
- **Classification**: CRITICAL
- **Infrastructure Layer**: Metal (Persistence)
- **Impact**: Any authenticated session with access to the `private` schema could potentially read or mutate infrastructure secrets. This violates the Madrid Resonance Zero Trust protocol.

## 🛠️ PROPOSED REMEDIATION
Execute the following SQL migration to establish a sovereign perimeter around the vault:

```sql
-- 1. Activate Security Perimeter
ALTER TABLE "private"."secrets" ENABLE ROW LEVEL SECURITY;

-- 2. Establish Sovereign Policy
CREATE POLICY "Internal_Service_Access"
ON "private"."secrets"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Revoke Non-Sovereign Access
REVOKE ALL ON TABLE "private"."secrets" FROM public, authenticated, anon;

-- 4. Grant Sovereign Authority
GRANT ALL ON TABLE "private"."secrets" TO service_role;
```

## ✅ VERIFICATION MANDATE
- [ ] Confirm `SELECT` from `private.secrets` returns 0 rows for `authenticated` role.
- [ ] Confirm `SELECT` from `private.secrets` returns valid data for `service_role`.
- [ ] Verify `ALTER TABLE` status in `schema_core.sql`.

**REPORTED BY**: Sentinel 🛡️
**PROTOCOL**: Madrid Resonance V5.0
