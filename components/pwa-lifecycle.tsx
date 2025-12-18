// components/pwa-lifecycle.tsx
// VERSIÓN: 2.0 (TypeScript Fix: Global Window Extension)

"use client";

import { useEffect } from "react";

// [CORRECCIÓN]: Extendemos la interfaz Window para que TS reconozca 'workbox'
declare global {
  interface Window {
    workbox: any;
  }
}

export function PwaLifecycle() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;
      
      // Forzar actualización si hay una nueva versión del SW esperando
      wb.addEventListener("waiting", () => {
        wb.messageSkipWaiting();
      });

      // Registrar el Service Worker
      wb.register();
    }
  }, []);

  return null;
}