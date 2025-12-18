"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV !== "development" // Solo en producción
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✅ SW registrado con éxito:", registration.scope);
          })
          .catch((err) => {
            console.error("❌ SW fallo al registrar:", err);
          });
      });
    }
  }, []);

  return null;
}