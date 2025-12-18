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
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✅ SW registrado:", registration.scope);
            
            // [ESTRATEGIA]: Precarga silenciosa de la página offline
            // Esto asegura que el recurso esté en caché antes de que se pierda la red.
            fetch('/offline').catch(() => {}); 
          })
          .catch((err) => {
            console.error("❌ SW fallo:", err);
          });
      });
    }
  }, []);

  return null;
}