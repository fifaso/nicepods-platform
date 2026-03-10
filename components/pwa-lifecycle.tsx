// components/pwa-lifecycle.tsx
// VERSIÓN: 4.1 (NicePod PWA Orchestrator - Lifecycle Decoupling Edition)
// Misión: Gestionar el ciclo de vida de la aplicación sin interceptar canales de datos críticos.
// [ESTABILIZACIÓN]: Implementación de registro diferido (Late-Register) para prevenir colisiones con Supabase Realtime.

"use client";

import { nicepodLog } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * INTERFAZ: BeforeInstallPromptEvent
 * Define el contrato de evento nativo para la instalación de PWA en entornos Chrome/Android.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * INTERFAZ: Workbox
 * Define el contrato de la librería de service workers de Google.
 */
interface Workbox {
  register: () => Promise<ServiceWorkerRegistration | undefined>;
  addEventListener: (event: string, callback: (event: Event) => void) => void;
  messageSkipWaiting: () => void;
}

/**
 * [EXTENSIÓN GLOBAL]
 * Registramos las propiedades en 'window' para permitir la comunicación 
 * entre este orquestador y los botones de instalación de la UI.
 */
declare global {
  interface Window {
    workbox: Workbox;
    deferredPrompt: BeforeInstallPromptEvent | null;
  }
}

/**
 * COMPONENTE: PwaLifecycle
 * Orquestador de comportamiento nativo y resiliencia offline.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * 1. Desacoplamiento de Red: Asegura que el Service Worker no intercepte el tráfico 
 *    hacia la API de Supabase o los WebSockets.
 * 2. Priorización de Hilo Principal: Aplica el registro diferido para que el Dashboard 
 *    y los mapas Geoespaciales se rendericen sin interrupciones del hilo de red.
 */
export function PwaLifecycle() {
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    // 1. GUARDA DE ENTORNO: Validamos soporte en cliente.
    if (
      isInitialized.current ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    /**
     * 2. PROTOCOLO DE INSTALACIÓN SOBERANA
     * Prevenimos el banner nativo intrusivo para tomar control manual vía UI.
     */
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.deferredPrompt = event as BeforeInstallPromptEvent;
      nicepodLog("🛰️ [PWA] Protocolo de instalación capturado.");
    };

    /**
     * 3. INICIALIZACIÓN DIFERIDA DE WORKBOX
     * Registro con retardo estratégico para no saturar la hidratación inicial.
     */
    const initWorkbox = async () => {
      // Si el plugin de Next-PWA no inyectó workbox, abortamos silenciosamente.
      if (typeof window.workbox === 'undefined') {
        return;
      }

      const wb = window.workbox;

      // Evento de Sincronización de Versión:
      // Cuando hay una actualización en el Service Worker, forzamos la actualización inmediata.
      wb.addEventListener("waiting", () => {
        nicepodLog("🔄 [PWA] Actualización detectada. Ejecutando Sincronía Inmediata.");
        wb.messageSkipWaiting();
      });

      // Evento de Activación:
      // Confirmación de que el escudo de red está operando.
      wb.addEventListener("activated", () => {
        nicepodLog("✅ [PWA] Escudo de red operativo.");
      });

      try {
        const registration = await wb.register();
        if (registration) {
          nicepodLog("🛡️ [PWA] Escudo de red establecido bajo alcance:", { scope: registration.scope });
        }
      } catch (error: any) {
        console.error("🔥 [PWA-Fatal] Error en handshake de registro:", error.message);
      }
    };

    // 4. PROTOCOLO DE EJECUCIÓN (Prioridad de Carga)
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Priorizamos la renderización del Dashboard y los Mapas antes de registrar el Service Worker
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

  return null;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Sincronía de Carga: Mover el 'initWorkbox' tras el evento 'load' garantiza 
 *    que el hilo principal esté libre para las tareas de renderizado de Mapbox y 
 *    la hidratación del Dashboard, eliminando las 'Violations' que vimos en la consola.
 * 2. Protección WebSocket: Al registrar el SW mediante el plugin Workbox 
 *    después de la carga, y habiendo definido 'runtimeCaching: []' en el config, 
 *    el SW ya no intentará proxyficar las conexiones 'wss://' de Supabase.
 * 3. Integridad de Estado: El 'ref' (isInitialized) previene la ejecución dual 
 *    en entornos de desarrollo (React Strict Mode), manteniendo la sesión limpia.
 */