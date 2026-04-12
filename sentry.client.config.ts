/**
 * ARCHIVO: sentry.client.config.ts
 * VERSIÓN: 1.0 (NicePod Client Observability - Industrial Telemetry Aduana Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Configurar el centinela de telemetría para el entorno del navegador, 
 * implementando el Protocolo Silence-Guard para erradicar el desbordamiento de 
 * datos (Error 413) y proteger el rendimiento del hilo principal del Voyager.
 * [DISEÑO SOBERANO]: Implementación de filtrado heurístico de advertencias de 
 * Mapbox Standard v3 y gestión de integridad de reportes de error.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import * as SentryIntelligenceAgency from "@sentry/nextjs";

/**
 * CONFIGURACIÓN DE IDENTIDAD DE TELEMETRÍA (EL METAL)
 */
const SENTRY_DATA_SOURCE_REFERENCE_ADDRESS = "https://a1d8d825d25ed0c617f400734d31c65b@o4510534295945216.ingest.de.sentry.io/4510534297387088";

/**
 * PATRONES DE RUIDO INDUSTRIAL PROHIBIDOS
 * Misión: Identificar cadenas de texto generadas por motores externos que 
 * no aportan valor pericial y saturan el bus de datos.
 */
const PROHIBITED_INDUSTRIAL_NOISE_PATTERNS_COLLECTION = [
  "Ignoring unknown image variable",
  "Cutoff is currently disabled on terrain",
  "Source \"mapbox-dem\" already exists",
  "formatDetection",
  "already exists",
  "requestAnimationFrame",
  "sb-arbojlknwilqcszuqope-auth-token"
];

/**
 * SentryIntelligenceAgency.init:
 * Misión: Despertar el centinela en el cliente con políticas de filtrado agresivas.
 */
SentryIntelligenceAgency.init({
  // Identificador de la Bóveda de Diagnóstico de NicePod
  dsn: SENTRY_DATA_SOURCE_REFERENCE_ADDRESS,

  // Magnitud de muestreo de trazas de rendimiento (0.1 = 10%)
  // [MTI]: Limitamos el rastreo para preservar ciclos de CPU para el motor WebGL.
  tracesSampleRate: 0.1,

  // Configuración de la captura de sesiones para depuración visual
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  /**
   * beforeBreadcrumb:
   * Misión: Interceptar y aniquilar migajas de pan ruidosas antes de ser almacenadas en RAM.
   * [SOLUCIÓN ERROR 413]: Previene el crecimiento descontrolado del payload de Sentry.
   */
  beforeBreadcrumb(breadcrumbData) {
    // Si la migaja proviene de la consola del navegador, auditamos su contenido.
    if (breadcrumbData.category === "console" && breadcrumbData.message) {
      const isNoiseDetected = PROHIBITED_INDUSTRIAL_NOISE_PATTERNS_COLLECTION.some(
        (patternText) => breadcrumbData.message!.includes(patternText)
      );

      // Si se detecta ruido industrial, se descarta la migaja devolviendo null.
      if (isNoiseDetected) {
        return null;
      }
    }
    return breadcrumbData;
  },

  /**
   * beforeSend:
   * Misión: Validación final antes de la transmisión a la red.
   */
  beforeSend(eventData) {
    const eventMessageText = eventData.message || "";
    const isEventContaminatedByNoise = PROHIBITED_INDUSTRIAL_NOISE_PATTERNS_COLLECTION.some(
      (patternText) => eventMessageText.includes(patternText)
    );

    // Abortamos la transmisión si el evento es una advertencia de motor conocida.
    if (isEventContaminatedByNoise) {
      return null;
    }

    return eventData;
  },

  // Habilitar el envío de información de identidad de perito para trazabilidad forense
  sendDefaultPii: true,

  // Integraciones de rendimiento y grabación de sesión
  integrations: [
    SentryIntelligenceAgency.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. Build Shield Sovereignty: Se ha creado este archivo desde cero para sellar la brecha 
 *    de telemetría del cliente que provocaba el fallo 413 en Vercel.
 * 2. Zero Abbreviations Policy (ZAP): Se han purificado todas las variables internas 
 *    y se ha renombrado el alias del SDK a 'SentryIntelligenceAgency'.
 * 3. Main Thread Isolation (MTI): Al descartar activamente miles de advertencias de 
 *    Mapbox v3 en el 'beforeBreadcrumb', reducimos la presión sobre el recolector de 
 *    basura del navegador, ganando milisegundos críticos para el renderizado 3D.
 */