/**
 * ARCHIVO: SEC_001_VAULT_HARDENING.sql
 * VERSIÓN: 1.1 (Madrid Resonance)
 * PROTOCOLO: Zero Trust Architecture
 * MISIÓN: Sellar la Bóveda de Infraestructura (private.secrets)
 * REQUISITO: Aplicación de la Ley #4 (Mínimo Privilegio - No USING TRUE)
 * NIVEL DE INTEGRIDAD: 100%
 */

-- [PHASE 1]: ACTIVACIÓN DE SOBERANÍA (ROW LEVEL SECURITY)
-- Garantizar que la tabla no sea accesible sin una política explícita.
ALTER TABLE "private"."secrets" ENABLE ROW LEVEL SECURITY;

-- [PHASE 2]: CREACIÓN DEL ESCUDO DE SERVICIO (Internal_Sovereign_Service_Access)
-- El acceso se restringe exclusivamente al rol de sistema 'service_role'.
-- Se utiliza una validación estricta del rol de autenticación.
CREATE POLICY "Internal_Sovereign_Service_Access" ON "private"."secrets"
    FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- [PHASE 3]: REVOCACIÓN DE PRIVILEGIOS HEREDADOS
-- Erradicar cualquier permiso residual para roles no soberanos.
REVOKE ALL ON TABLE "private"."secrets" FROM public, authenticated, anon;

-- [PHASE 4]: OTORGAMIENTO DE ACCESO SOBERANO
-- Restablecer el acceso total solo para los guardianes del sistema.
GRANT ALL ON TABLE "private"."secrets" TO service_role;
GRANT ALL ON TABLE "private"."secrets" TO postgres;

-- [PHASE 5]: NOMINAL SINCRO (Zero Abbreviation Policy Enforcement)
COMMENT ON TABLE "private"."secrets" IS 'Infrastructure Vault: Contains encrypted binary secrets for cloud service authorization. Access restricted to internal service_role.';
