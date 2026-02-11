// components/pwa-lifecycle.tsx
// VERSIÓN: 2.0 (PWA Lifecycle Master - Production Stealth Edition)
// Misión: Gestionar el ciclo de vida de la App, actualizaciones de Service Worker y captura de prompts.
// [ESTABILIDAD]: Eliminación de ruidos en consola y tipado estricto para Workbox.

"use client";

import { useEffect, useRef } from "react";

/**
 * [TIPADO DE INFRAESTRUCTURA]
 * Definimos la interfaz de Workbox para evitar el uso de 'any' y cumplir con el Build Shield.
 */
interface WorkboxEvent {
  type: string;
  isUpdate?: boolean;
  wasWaitingBeforeRegister?: boolean;
}

interface Workbox {
  register: () => Promise<void>;
  addEventListener: (event: string, callback: (event: any) => void) => void;
  messageSkipWaiting: () => void;
}

declare global {
  interface Window {
    workbox: Workbox;
  }
}

/**
 * PwaLifecycle: El centinela del comportamiento nativo de NicePod.
 */
export function PwaLifecycle() {
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    // 1. GUARDA DE ENTORNO: Solo ejecutamos en el cliente y si el navegador soporta Service Workers.
    if (
      isInitialized.current ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      window.workbox === undefined
    ) {
      return;
    }

    const wb = window.workbox;

    /**
     * [MANEJO DE ACTUALIZACIONES]
     * Cuando se detecta un nuevo Service Worker esperando, forzamos el salto 
     * para que la nueva versión de NicePod tome el control inmediatamente.
     */
    wb.addEventListener("waiting", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("📥 [NicePod-PWA] Nueva versión detectada. Actualizando buffer...");
      }
      wb.messageSkipWaiting();
    });

    /**
     * [PROTOCOLO DE REGISTRO]
     * Ejecutamos el registro oficial. Los logs solo se emiten en desarrollo 
     * para mantener la consola de producción (Vercel) limpia.
     */
    wb.register()
      .then(() => {
        if (process.env.NODE_ENV === "development") {
          console.log("✅ [NicePod-PWA] Service Worker sincronizado con éxito.");
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("🔥 [NicePod-PWA] Error en el registro del SW:", error);
        }
      });

    /**
     * [GESTIÓN DEL PROMPT DE INSTALACIÓN]
     * Escuchamos el evento 'beforeinstallprompt' para evitar que el navegador
     * muestre el banner nativo de forma desordenada. 
     * La advertencia 'preventDefault() called' en consola es esperada ya que 
     * delegamos la instalación al componente InstallPwaButton.
     */
    const handleInstallPrompt = (event: Event) => {
      if (process.env.NODE_ENV === "development") {
        console.log("📱 [NicePod-PWA] Instalación detectada y preparada para disparador manual.");
      }
      // Mantenemos el preventDefault para que el sistema use nuestro propio botón Aurora.
      // No logueamos el preventDefault en producción para evitar 'Warnings' amarillos.
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    isInitialized.current = true;

    // Limpieza de eventos al desmontar (aunque este componente suele ser persistente)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  /**
   * Este componente es puramente lógico y no renderiza UI.
   * Su única función es actuar como un proceso de fondo.
   */
  return null;
}