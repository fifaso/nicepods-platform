// components/pwa-lifecycle.tsx
// VERSIÓN: 2.1 (NicePod PWA Lifecycle Master - Unified Registration Standard)
// Misión: Único orquestador del Service Worker. Gestiona la sincronía de versiones y el escudo offline.
// [ESTABILIZACIÓN]: Eliminación de colisión de registro y protocolo de activación sin parpadeos.

"use client";

import { nicepodLog } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * [INTERFAZ DE INFRAESTRUCTURA]
 * Definimos el contrato de Workbox para garantizar el cumplimiento del Build Shield
 * y evitar el uso de tipos 'any' que degradan el rigor del proyecto.
 */
interface Workbox {
  register: () => Promise<ServiceWorkerRegistration | undefined>;
  addEventListener: (event: string, callback: (event: any) => void) => void;
  messageSkipWaiting: () => void;
}

declare global {
  interface Window {
    workbox: Workbox;
  }
}

/**
 * PwaLifecycle: El centinela soberano del comportamiento nativo de NicePod V2.5.
 * 
 * Este componente absorbe las responsabilidades de registro y mantenimiento,
 * actuando como un proceso de fondo que no interfiere con el hilo visual.
 */
export function PwaLifecycle() {
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    // 1. GUARDA DE ENTORNO SOBERANA: 
    // Solo ejecutamos si estamos en el navegador, el soporte de SW existe y Workbox está inyectado.
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
     * 2. PROTOCOLO DE ACTUALIZACIÓN (Silent Sincro)
     * Cuando se detecta un nuevo Service Worker en estado 'waiting', 
     * forzamos el salto inmediato para que la nueva versión de la lógica 
     * de red tome el control sin necesidad de un refresco manual disruptivo.
     */
    const handleWaiting = () => {
      nicepodLog("Nueva frecuencia detectada. Sincronizando versión de Bóveda...");
      wb.messageSkipWaiting();
    };

    /**
     * 3. ESCUDO OFF-LINE (Pre-carga de Fallback)
     * Una vez que el Service Worker es el controlador activo, precargamos 
     * la ruta '/offline'. Esto garantiza que si el usuario pierde la conexión, 
     * NicePod no muestre el error genérico del navegador.
     */
    const handleActivated = async () => {
      try {
        const cache = await caches.open("nicepod-offline-shield");
        const cachedResponse = await cache.match("/offline");

        if (!cachedResponse) {
          nicepodLog("Iniciando precarga del Escudo Offline.");
          await cache.add("/offline");
        }
      } catch (error) {
        // Fallo silencioso: la prioridad es no interrumpir la navegación principal.
      }
    };

    // Suscripción a eventos del ciclo de vida
    wb.addEventListener("waiting", handleWaiting);
    wb.addEventListener("activated", handleActivated);

    /**
     * 4. REGISTRO MAESTRO ÚNICO
     * Ejecutamos el registro oficial. En NicePod V2.5, este es el único 
     * punto donde se invoca la activación del trabajador de servicio.
     */
    wb.register()
      .then((registration) => {
        if (registration) {
          nicepodLog("NicePod PWA Sincronizada.", { scope: registration.scope });
        }
      })
      .catch((error) => {
        // Los errores críticos de registro se emiten para diagnóstico forense
        console.error("🔥 [NicePod-PWA-Critical]: Error en handshake de registro:", error);
      });

    /**
     * 5. GESTIÓN DE INSTALACIÓN SOBERANA
     * Escuchamos el evento 'beforeinstallprompt' para permitir que el curador 
     * instale la Workstation mediante nuestro botón de marca 'InstallPwaButton', 
     * evitando banners nativos intrusivos que causan distracciones.
     */
    const handleInstallPrompt = (event: Event) => {
      // El evento es capturado y gestionado globalmente por los listeners de UI.
      nicepodLog("Instalación preparada para disparo manual.");
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Marcamos como inicializado para prevenir re-ejecuciones en modo Strict de React.
    isInitialized.current = true;

    // Limpieza de listeners al desmontar la instancia global.
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  /**
   * Este componente es una pieza de infraestructura lógica.
   * No debe renderizar ningún elemento en el DOM para evitar re-calculos de layout.
   */
  return null;
}