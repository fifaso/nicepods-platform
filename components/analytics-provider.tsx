// components/analytics-provider.tsx
// VERSIÓN: 2.0 (Fix: Strict Environment Guard)

"use client";

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense, useEffect, useState } from 'react';

export function AnalyticsProvider() {
  const [shouldTrack, setShouldTrack] = useState(false);

  useEffect(() => {
    // LÓGICA DE PROTECCIÓN:
    // 1. Verificamos si estamos en el entorno de Vercel.
    // 2. Verificamos si es 'production'.
    // 3. Opcional: Permitimos 'preview' solo si estás seguro de que lo configuraste.
    
    // Nota: NEXT_PUBLIC_VERCEL_ENV es una variable automática de Vercel.
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
    
    // Solo activamos en Producción real para evitar errores 400 en Alpha/Dev
    if (env === 'production') {
      setShouldTrack(true);
    }
    
    // Debug (Opcional): Si quieres ver por qué no carga en Alpha, descomenta esto:
    // console.log("Analytics Environment:", env);
  }, []);

  if (!shouldTrack) {
    return null; // No renderizamos nada, 0 errores en consola.
  }

  return (
    <>
      <Analytics />
      <Suspense fallback={null}>
        <SpeedInsights />
      </Suspense>
    </>
  );
}