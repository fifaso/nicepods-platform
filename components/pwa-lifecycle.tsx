// components/pwa-lifecycle.tsx
// VERSIÓN: 3.1

"use client";

import { nicepodLog } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * [INTERFAZ DE INFRAESTRUCTURA]
 * Definimos contratos estrictos para el ecosistema de aplicaciones web progresivas.
 * Esto asegura el cumplimiento del Build Shield y el rigor tipográfico.
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
  addEventListener: (event: string, callback: (event: Event) => void) => void;
  messageSkipWaiting: () => void;
}

/**
 * [EXTENSIÓN GLOBAL]
 * Registramos las propiedades necesarias en el objeto 'window' para permitir 
 * la comunicación entre este orquestador y los botones de UI (InstallPwaButton).
 */
declare global {
  interface Window {
    workbox: Workbox;
    /**
     * deferredPrompt: Almacén de sistema para el evento de instalación nativa.
     */
    deferredPrompt: BeforeInstallPromptEvent | null;
  }
}

/**
 * COMPONENTE: PwaLifecycle
 * El orquestador del comportamiento nativo y la resiliencia offline.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * Este componente es puramente lógico. No inyecta elementos en el DOM, evitando 
 * re-renderizados innecesarios. Su función es gestionar el ciclo de vida del 
 * trabajador de servicio (Service Worker) y silenciar advertencias de sistema.
 */
export function PwaLifecycle() {
  // Referencia de inicialización para prevenir ejecuciones en modo estricto.
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    // 1. GUARDA DE ENTORNO
    // Validamos que estemos en el cliente y que el navegador soporte Service Workers.
    if (
      isInitialized.current ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    /**
     * 2. GESTIÓN DE INSTALACIÓN SOBERANA (Sovereign Install Protocol)
     * Capturamos el evento de instalación para evitar el banner intrusivo de Chrome.
     */
    const handleInstallPrompt = (event: Event) => {
      // Prevenir la visualización automática del banner nativo.
      event.preventDefault();

      // Almacenamos el evento en el contexto global para su uso posterior.
      window.deferredPrompt = event as BeforeInstallPromptEvent;

      nicepodLog("🛰️ [PWA] Protocolo de instalación capturado. Listo para ejecución manual.");
    };

    /**
     * 3. INICIALIZACIÓN DE WORKBOX (Handshake de Red)
     */
    const initWorkbox = async () => {
      // Verificamos si Workbox ha sido inyectado por el plugin de Next-PWA.
      if (window.workbox === undefined) {
        return;
      }

      const wb = window.workbox;

      /**
       * PROTOCOLO DE ACTUALIZACIÓN:
       * Si se detecta un nuevo SW, forzamos su activación inmediata (skipWaiting).
       * Esto asegura que el usuario siempre opere bajo la última versión de la Bóveda.
       */
      wb.addEventListener("waiting", () => {
        nicepodLog("🔄 [PWA] Sincronizando nueva versión de la infraestructura...");
        wb.messageSkipWaiting();
      });

      // Confirmación de activación y control de frecuencia.
      wb.addEventListener("activated", () => {
        nicepodLog("✅ [PWA] Service Worker activo y operando con normalidad.");
      });

      // Ejecutamos el registro oficial.
      try {
        const registration = await wb.register();
        if (registration) {
          nicepodLog("🛡️ [PWA] Escudo de red establecido bajo el alcance:", { scope: registration.scope });
        }
      } catch (error: any) {
        console.error("🔥 [PWA-Fatal] Error en handshake de registro:", error.message);
      }
    };

    /**
     * 4. EJECUCIÓN DIFERIDA (Performance Priority)
     * Suscribimos los eventos de instalación y diferimos el registro de red 
     * hasta que el navegador haya terminado de procesar el LCP de la aplicación.
     */
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    if (document.readyState === "complete") {
      initWorkbox();
    } else {
      window.addEventListener("load", initWorkbox);
    }

    isInitialized.current = true;

    /**
     * 5. PROTOCOLO DE LIMPIEZA
     * Garantizamos que al desmontar el componente (aunque sea global), 
     * no existan fugas de memoria en los listeners de sistema.
     */
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("load", initWorkbox);
    };
  }, []);

  // Retorno nulo para mantener la higiene del árbol de renderizado de React.
  return null;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Silencio en Consola: El uso de 'e.preventDefault()' resuelve el mensaje 
 *    'Banner not shown' al cumplir con la política de instalación del navegador.
 * 2. Optimización del Hilo Principal: Al anclar el registro de Workbox al 
 *    evento 'window.load', permitimos que el motor JS priorice la visualización 
 *    del Dashboard y el Mapa, eliminando las violaciones de rAF iniciales.
 * 3. Integridad ACiD: El registro se realiza una única vez por sesión de 
 *    hidratación, asegurando que el Service Worker no entre en bucles de 
 *    re-conexión destructivos.
 */