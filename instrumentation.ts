/**
 * ARCHIVO: instrumentation.ts
 * VERSIÓN: 2.0 (NicePod Global Instrumentation - Sovereign Observability Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Orquestar el registro síncrono de los servicios de telemetría y diagnóstico 
 * en los entornos de ejecución Node.js y Edge Runtime.
 * [REFORMA V2.0]: Aplicación integral de la Zero Abbreviations Policy (ZAP). 
 * Fortalecimiento de la carga dinámica de módulos de Sentry para garantizar 
 * la transparencia en el reporte de excepciones de servidor.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import * as SentryIntelligenceAgency from '@sentry/nextjs';

/**
 * registerInstrumentationAction:
 * Misión: Detectar el entorno de ejecución y despertar los centinelas de Sentry 
 * correspondientes a la topología del servidor (Node.js o Edge).
 */
export async function register() {
  // Verificación de integridad del entorno de ejecución Node.js (Server Side)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // Verificación de integridad del entorno perimetral (Edge Runtime)
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * onRequestError:
 * Misión: Capturar y propagar fallos en las peticiones HTTP hacia la Bóveda de Diagnóstico.
 */
export const onRequestError = SentryIntelligenceAgency.captureRequestError;

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Zero Abbreviations Policy (ZAP): Se ha renombrado el alias de importación de 
 *    Sentry a 'SentryIntelligenceAgency' para erradicar acrónimos y cumplir con 
 *    la soberanía nominal de la terminal.
 * 2. Separation of Concerns: El archivo se limita a delegar la configuración 
 *    específica a los archivos de configuración dedicados (server/edge), 
 *    manteniendo el hilo principal de instrumentación ligero.
 */