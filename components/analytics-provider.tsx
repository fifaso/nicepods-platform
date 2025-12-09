// components/analytics-provider.tsx
"use client";

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';

export function AnalyticsProvider() {
  return (
    <>
      {/* Analytics maneja visitas y eventos personalizados */}
      <Analytics />
      
      {/* 
        CRÍTICO: SpeedInsights debe estar envuelto en Suspense.
        Sin esto, falla al intentar leer useSearchParams() en el servidor 
        o durante la hidratación inicial, causando errores 400.
      */}
      <Suspense fallback={null}>
        <SpeedInsights />
      </Suspense>
    </>
  );
}