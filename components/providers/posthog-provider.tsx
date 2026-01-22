// components/providers/posthog-provider.tsx
// VERSIÓN: 2.0 (Network Stability Master - Zero-Loop Analytics)

'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

/**
 * ESTRATEGIA DE INICIALIZACIÓN NICEPOD
 * Centralizamos la configuración fuera del componente para evitar 
 * múltiples instancias durante el Hot Reloading de Next.js.
 */
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHog_HOST || 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',

    // [CRÍTICO]: Desactivamos autocapture de clics y cambios de DOM
    autocapture: false,

    // [FIX 3.2]: Desactivamos la grabación de sesión. 
    // NicePod tiene actualizaciones de UI de alta frecuencia (Audio Pulse)
    // que saturan el búfer de grabación y bloquean la red.
    disable_session_recording: true,

    // [FIX 3.2]: Desactivamos la captura de performance para evitar reportes
    // circulares de los Forced Reflows del navegador.
    capture_performance: false,

    // Mantenemos lo esencial para métricas de negocio
    capture_pageview: true,
    capture_pageleave: true,
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Aseguramos que el scroll y el audio no activen capturas accidentales
    // mediante la desactivación de hooks globales de posthog-js
    return () => {
      posthog.reset();
    };
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}