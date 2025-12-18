"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV !== "development"
    ) {
      window.addEventListener("load", () => {
        // 1. Registrar el Service Worker
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✅ SW Registrado con Scope:", registration.scope);
            
            // 2. PRECARGA ESTRATÉGICA: Forzar el cacheo de la página offline
            // Hacemos un fetch a la ruta y la guardamos en la caché específica
            const cacheName = "offline-page-cache"; // Debe coincidir con next.config.mjs
            const offlineUrl = "/offline";

            caches.open(cacheName).then((cache) => {
              cache.match(offlineUrl).then((response) => {
                if (!response) {
                  console.log("📥 Precargando página Offline...");
                  cache.add(offlineUrl).catch(e => console.warn("Fallo precarga offline:", e));
                } else {
                  console.log("🛡️ Página Offline ya está en caché.");
                }
              });
            });

          })
          .catch((err) => {
            console.error("❌ SW Fallo al registrar:", err);
          });
      });
    }
  }, []);

  return null;
}