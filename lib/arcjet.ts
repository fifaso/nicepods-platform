/**
 * ARCHIVO: lib/arcjet.ts
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Configuración del escudo de seguridad perimetral contra bots y saturación.
 * NIVEL DE INTEGRIDAD: 100%
 */

import arcjet, { detectBot, tokenBucket } from "@arcjet/next";

// Definición centralizada de reglas
export const aj = arcjet({
  key: process.env.ARCJET_KEY!, 
  rules: [
    // 1. Bloqueo de Bots
    detectBot({
      mode: "LIVE", 
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    // 2. Rate Limiting (Más generoso porque ahora protegemos acciones pesadas)
    tokenBucket({
      mode: "LIVE",
      refillRate: 10,
      interval: 60,
      capacity: 10,
    }),
  ],
});