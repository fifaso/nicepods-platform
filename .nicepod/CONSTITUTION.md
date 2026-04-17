/**
 * ARCHIVO: .nicepod/CONSTITUTION.md
 * VERSIÓN: 6.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: REPOSITORY GOVERNANCE
 * MISIÓN: Establecer las Leyes Inmutables para la Evolución Autónoma de NicePod
 * NIVEL DE INTEGRIDAD: 100% (CRÍTICO)
 */

# ⚖️ CONSTITUCIÓN TÉCNICA DE NICEPOD

## INTRODUCCIÓN Y ALCANCE
Esta Constitución es el documento de autoridad suprema del repositorio `nicepods-platform`. Define los estándares de ingeniería innegociables para cualquier agente (IA o Humano). El incumplimiento de cualquier artículo anula la validez de un Pull Request.

---

## ARTÍCULO I: LA DOCTRINA ZAP (ZERO ABBREVIATIONS POLICY)
*Soberanía Nominal y Claridad Semántica*

1.1 **Prohibición de Abreviaturas**: Queda estrictamente prohibido el uso de nombres de variables, funciones, interfaces o archivos abreviados.
    - *Incorrecto*: `id`, `err`, `ctx`, `props`, `val`, `req`, `res`.
    - *Correcto*: `identification`, `hardwareException`, `executionContent`, `componentProperties`, `sourceValue`, `clientRequest`, `serverResponse`.
1.2 **Narrativa Técnica**: El código debe leerse como literatura técnica. El nombre de un objeto debe describir su propósito y su procedencia.
    - *Ejemplo*: `podcastEpisodeAudioStreamBuffer` en lugar de `audioBuf`.
1.3 **Soberanía del Idioma**: El código fuente (identificadores) será en Inglés Técnico, pero los comentarios de encabezado y documentación de arquitectura se mantendrán en Español (Madrid Resonance Protocol).

---

## ARTÍCULO II: LA DOCTRINA BSS (BUILD SHIELD SOVEREIGNTY)
*Estabilidad Blindada y Tipado Estricto*

2.1 **Cero Tolerancia a Errores**: El comando `npx tsc --noEmit` debe retornar 0 errores. Ningún agente puede ignorar un error de tipo bajo el pretexto de funcionalidad.
2.2 **Erradicación del 'Any'**: El uso del tipo `any` se considera una fractura de seguridad. Si un dato procede de una fuente externa incierta, se debe usar `unknown` seguido de un *Type Guard* defensivo.
2.3 **Contratos Sólidos**: Todas las funciones y Server Actions deben tener tipos de entrada y salida explícitamente definidos. Se prohíbe el tipado implícito en la lógica de negocio.

---

## ARTÍCULO III: INTEGRIDAD AXIAL (THE METAL-CRYSTAL SYNC)
*Sincronización Total de Infraestructura*

3.1 **Sincronización de Ejes**: Un cambio en el Metal (Database/Supabase) exige una actualización inmediata y atómica en el Crystal (Frontend/TypeScript).
3.2 **Mapeo de Transformación**: Los campos en `snake_case` procedentes de PostgreSQL DEBEN ser transformados a `camelCase` mediante una capa de servicio o mapeo antes de llegar a los componentes de la UI.
3.3 **Validación de Realidad (MCP)**: Antes de refactorizar un tipo, el agente está obligado a consultar el esquema real mediante el servidor MCP para asegurar que la "verdad" de la base de datos es la que rige el código.

---

## ARTÍCULO IV: LA DOCTRINA DIS (DETERMINISTIC IDEMPOTENCY)
*Resiliencia ante Reintentos y Consistencia de Datos*

4.1 **Mutaciones Seguras**: Toda operación de escritura (INSERT, UPDATE) debe ser diseñada para ser ejecutada múltiples veces sin alterar el resultado final.
4.2 **Lógica de Conflictos**: Se deben utilizar clausulas `ON CONFLICT` en PostgreSQL y validaciones de "Unique Identification" en el código antes de procesar pagos, crear registros o disparar eventos de IA.
4.3 **Estado Atómico**: Si una operación requiere múltiples cambios (ej: crear podcast + debitar créditos), debe ser tratada como una transacción atómica. Si un paso falla, el sistema debe volver al estado original.

---

## ARTÍCULO V: LA DOCTRINA DSE (ZERO SIDE-EFFECT SHIELDING)
*Blindaje de Módulos y Aislamiento de Efectos*

5.1 **Funciones Puras**: Se dará prioridad a la lógica funcional y pura. Una función no debe modificar datos fuera de su alcance (scope).
5.2 **Especialización por Cambio**: Si un agente necesita modificar una utilidad compartida que afecta a más de un módulo, la regla es: **"Si no puedes probarlo en todos, duplícalo y especialízalo"**. Esto evita que una mejora en el *Player* rompa el *Feed*.
5.3 **Validación Visual (Vision Barrier)**: Todo cambio en componentes críticos debe ser validado visualmente mediante tests de Playwright. Si el test visual falla, la modificación se considera inválida.

---

## PROTOCOLO DE APLICACIÓN (ENFORCEMENT)
1. **Lectura Obligatoria**: Al inicio de cada sesión, el agente debe declarar: *"He leído y acepto la Constitución Técnica de NicePod v6.0"*.
2. **Auditoría de PR**: Cada Pull Request generado por una IA debe autoevaluarse frente a estas 5 leyes en su descripción.
3. **Rollback Automático**: Si tras una ejecución el Build Shield (BSS) se rompe, el agente tiene la orden de revertir inmediatamente los cambios (`git checkout .`).

"La técnica es el fundamento de la soberanía. Programa con rigor, construye para la eternidad."