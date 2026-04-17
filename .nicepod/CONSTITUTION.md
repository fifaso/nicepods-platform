/**
 * ARCHIVO: .nicepod/CONSTITUTION.md
 * VERSIÓN: 8.0 (Madrid Resonance - Omnisovereign Edition)
 * PROTOCOLO: TOTAL REPOSITORY GOVERNANCE & CLOSED-LOOP
 * MISIÓN: Blindaje, Evolución Autónoma y Hermeticidad del Ecosistema NicePod
 * NIVEL DE INTEGRIDAD: 100% (CRÍTICO - AUTO-EVOLUTIVO)
 */

# ⚖️ CONSTITUCIÓN TÉCNICA SOBERANA DE NICEPOD (v8.0)

## PREÁMBULO
Esta Constitución constituye la Ley Suprema de la Workstation. Define el marco operativo para la convivencia entre la Inteligencia Humana y la Inteligencia Artificial. El sistema se declara **Hermético**, **Idempotente** y **Autoconsciente**.

---

## ARTÍCULO I: SOBERANÍA NOMINAL (DOCTRINA ZAP 2.0)
1.1 **Prohibición de Siglas**: Se prohíbe cualquier identificador menor a 4 caracteres que no sea una palabra completa. 
    - *Mandato*: `id` → `identification`, `lat` → `latitudeCoordinate`, `err` → `hardwareException`.
1.2 **Narrativa Técnica**: El código debe ser auto-documentado. Un nombre debe expresar **Qué es**, **Para qué sirve** y **De dónde viene**.

---

## ARTÍCULO II: BLINDAJE DE ESTABILIDAD (DOCTRINA BSS)
2.1 **Build Shield Sovereignty**: `npx tsc --noEmit` es el juez supremo. Ningún código con errores de tipo será aceptado.
2.2 **Erradicación de Fugas**: Prohibido el uso de `any`, `@ts-ignore` o casting inseguro. 
2.3 **Aislamiento de Terceros**: Cualquier librería externa debe ser consumida a través de una interfaz de "Aislamiento de Tipo" (Wrapper) para evitar que cambios externos contaminen el Crystal.

---

## ARTÍCULO III: SOBERANÍA HERMÉTICA Y SEGURIDAD
3.1 **Hermeticidad de Recursos**: Queda terminantemente prohibido el uso de URLs, scripts, CDNs o repositorios externos no autorizados explícitamente en `.mcp/mcp-servers.json`.
3.2 **Gestión de Secretos**: Los secretos nunca deben tocar el sistema de archivos de Git. Toda credencial debe ser inyectada exclusivamente vía `process.env`.
3.3 **Zero Trust Infra**: Todo cambio en el Metal (Database) requiere una política de RLS (Row Level Security) explícita y restrictiva.

---

## ARTÍCULO IV: GOBERNANZA DEL BUCLE CERRADO (AUTO-EVOLUCIÓN)
4.1 **Soberanía de Linear (The Brain)**: Ningún commit existe sin un Ticket de Linear. El agente debe mover el ticket a "Done" solo tras el éxito del nodo VISION.
4.2 **Recursividad de Mejora**: Los agentes tienen el deber constitucional de proponer mejoras a sus propios prompts o a esta Constitución mediante tickets en Linear si detectan ineficiencias.
4.3 **Visión de Usuario (Playwright)**: La funcionalidad real prima sobre la sintáctica. Ninguna tarea se considera finalizada sin un reporte exitoso de Playwright.

---

## ARTÍCULO V: RESILIENCIA Y ATOMICIDAD (DIS & DSE)
5.1 **Idempotencia (DIS)**: Toda mutación en el Metal debe ser segura frente a reintentos. Se exige el uso de `ON CONFLICT` y validaciones de unicidad.
5.2 **Blindaje de Efectos Laterales (DSE)**: Una mejora en un módulo no debe afectar a terceros. Si una función `util` es compartida, el agente debe duplicarla y especializarla antes de modificarla si existe riesgo axial.
5.3 **Sincronización Atómica**: Los cambios que afecten al Metal y al Crystal deben realizarse en un único Pull Request para mantener la Integridad Axial.

---

## ARTÍCULO VI: MAYORDOMÍA DE RECURSOS (ANTI-FATIGA)
6.1 **Ley de Batching**: Un agente tiene prohibido modificar más de **5 archivos** en una sola sesión de trabajo.
6.2 **Journaling de Estado**: Todo agente debe dejar una "caja negra" en `.nicepod/[agente].md` explicando el razonamiento lógico de su intervención antes de cerrar la sesión.

---

## PROTOCOLO DE APLICACIÓN (ENFORCEMENT)
1. **Aceptación de Soberanía**: Al iniciar, el agente debe declarar: *"He leído la Constitución v8.0. Entorno Hermético y Bucle Cerrado validados"*.
2. **Pena de Reversión**: Cualquier infracción a los Artículos I, III o VI resultará en la reversión automática de la rama de trabajo.
3. **Rollback Determinista**: Si el nodo ETHER (Vercel) reporta un fallo de build, el agente responsable debe revertir sus cambios localmente antes de intentar una nueva solución.

"La técnica es el fundamento de la libertad. Programa con rigor, construye para la eternidad."