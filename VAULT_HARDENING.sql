-- [SENTINEL SECURITY MIGRATION]
-- ARCHIVE: vault-hardening-2025.sql
-- PROTOCOLO: Madrid Resonance V5.0
-- MISIÓN: Hardening de la Bóveda de Secretos (private.secrets)
-- NIVEL DE INTEGRIDAD: 100%

-- 1. Activación del Perímetro de Seguridad (RLS)
-- Esto previene fugas de datos si se compromete un rol de menor privilegio.
ALTER TABLE "private"."secrets" ENABLE ROW LEVEL SECURITY;

-- 2. Establecimiento de la Política de Soberanía Interna
-- Solo el service_role (Infraestructura/Orquestador) tiene acceso a los secretos físicos.
-- Los Voyager (usuarios) no deben tener visibilidad sobre las llaves de la bóveda.
CREATE POLICY "Internal_Service_Access"
ON "private"."secrets"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Revocación de privilegios a roles no soberanos
-- Eliminamos cualquier acceso residual de roles públicos o autenticados.
REVOKE ALL ON TABLE "private"."secrets" FROM public, authenticated, anon;

-- 4. Concesión explícita al rol de servicio
-- El orquestador mantiene el control total sobre los activos de la bóveda.
GRANT ALL ON TABLE "private"."secrets" TO service_role;
