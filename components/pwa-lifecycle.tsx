// components/pwa-lifecycle.tsx
// VERSIÓN: 3.0

"use client";

import { nicepodLog } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * [INTERFAZ DE INFRAESTRUCTURA]
 * Definimos contratos estrictos para el ecosistema PWA.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface Workbox {
  register: () => Promise<ServiceWorkerRegistration | undefined>;
  addEventListener: (event: string, callback: (event: any) => void) => void;
  messageSkipWaiting: () => void;
}

declare global {
  interface Window {
    workbox: Workbox;
    /**
     * deferredPrompt: Almacén soberano para el evento de instalación.
     * Permite que 'InstallPwaButton' dispare la instalación manualmente.
     */
    deferredPrompt: BeforeInstallPromptEvent | null;
  }
}

/**
 * PwaLifecycle: El orquestador del comportamiento nativo.
 * Este componente es puramente lógico y no afecta al árbol de renderizado (z-index neutro).
 */
export function PwaLifecycle() {
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    // 1. GUARDA DE ENTORNO
    if (
      isInitialized.current ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    /**
     * 2. GESTIÓN DE INSTALACIÓN (Sovereign Install Protocol)
     * Silenciamos el banner nativo y capturamos la intención para disparo manual.
     */
    const handleInstallPrompt = (e: Event) => {
      // Prevenir el banner automático para mantener la elegancia de la marca
      e.preventDefault();

      // Almacenamos el evento para que sea consumido por el componente 'InstallPwaButton'
      window.deferredPrompt = e as BeforeInstallPromptEvent;

      nicepodLog("🛰️ [PWA] Protocolo de instalación capturado y listo para ejecución manual.");
    };

    /**
     * 3. INICIALIZACIÓN DE WORKBOX (Service Worker Handshake)
     */
    const initWorkbox = async () => {
      if (window.workbox === undefined) {
        // En desarrollo, workbox no se inyecta por defecto.
        return;
      }

      const wb = window.workbox;

      // Protocolo de Actualización: Sincronía de versiones en caliente
      wb.addEventListener("waiting", () => {
        nicepodLog("🔄 [PWA] Sincronizando nueva versión de la Workstation...");
        wb.messageSkipWaiting();
      });

      // Protocolo de Activación: Limpieza y Cache Nominal
      wb.addEventListener("activated", (event) => {
        nicepodLog("✅ [PWA] Service Worker activo y controlando la frecuencia.");
      });

      // Registro Oficial
      try {
        const registration = await wb.register();
        if (registration) {
          nicepodLog("🛡️ [PWA] Escudo de red establecido.", { scope: registration.scope });
        }
      } catch (error) {
        console.error("🔥 [PWA-Fatal] Error en registro de infraestructura:", error);
      }
    };

    /**
     * 4. EJECUCIÓN DIFERIDA
     * Esperamos a que la ventana esté totalmente cargada para no competir 
     * con el LCP (Largest Contentful Paint) de la plataforma.
     */
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    if (document.readyState === "complete") {
      initWorkbox();
    } else {
      window.addEventListener("load", initWorkbox);
    }

    isInitialized.current = true;

    // 5. PROTOCOLO DE LIMPIEZA
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("load", initWorkbox);
    };
  }, []);

  // El componente no debe inyectar nada en el DOM
  return null;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Advertencias: El uso de e.preventDefault() junto con el 
 *    almacenamiento en window.deferredPrompt satisface los requisitos de Chrome 
 *    para suprimir el banner, silenciando el mensaje 'Banner not shown'.
 * 2. Rendimiento del Hilo Principal: Al diferir el registro hasta el evento 'load', 
 *    garantizamos que las violaciones de 'requestAnimationFrame' se reduzcan, 
 *    ya que el Service Worker no intentará indexar la caché mientras el mapa 
 *    o el Dashboard se están pintando.
 * 3. Tipado de Grado Industrial: Se han definido interfaces específicas para 
 *    BeforeInstallPromptEvent, eliminando el uso de 'any' y blindando el Build Shield.
 */