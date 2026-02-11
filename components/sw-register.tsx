// components/sw-register.tsx
// VERSIÓN: 1.1 (NicePod PWA Standard - Stealth Registration)
// Misión: Gestionar el registro del Service Worker y precarga de fallback de forma silenciosa.

"use client";

import { nicepodLog } from "@/lib/utils"; // Importamos el logger condicional
import { useEffect } from "react";

/**
 * ServiceWorkerRegister: Se encarga de la persistencia offline de la plataforma.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Solo actuamos en el navegador y si hay soporte de Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {

      const registerSW = async () => {
        try {
          // 1. Registro del trabajador de servicio
          const registration = await navigator.serviceWorker.register("/sw.js");
          nicepodLog("Service Worker sincronizado exitosamente.", { scope: registration.scope });

          // 2. PRECARGA ESTRATÉGICA DE SEGURIDAD
          // Cacheamos la página de fallback para asegurar que NicePod siempre sea accesible.
          const cacheName = "offline-page-cache";
          const offlineUrl = "/offline";

          const cache = await caches.open(cacheName);
          const cachedResponse = await cache.match(offlineUrl);

          if (!cachedResponse) {
            nicepodLog("Iniciando precarga de seguridad para modo Offline.");
            await cache.add(offlineUrl);
          } else {
            nicepodLog("Frecuencia Offline ya presente en caché local.");
          }

        } catch (error: any) {
          // Los errores se registran incluso en producción para depuración real
          console.error("🔥 [NicePod-PWA] Fallo crítico en el registro:", error.message);
        }
      };

      // Escuchamos al evento load para no retrasar el First Contentful Paint (LCP)
      window.addEventListener("load", registerSW);
      return () => window.removeEventListener("load", registerSW);
    }
  }, []);

  // Componente puramente lógico
  return null;
}