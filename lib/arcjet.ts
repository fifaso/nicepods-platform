// lib/arcjet.ts
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