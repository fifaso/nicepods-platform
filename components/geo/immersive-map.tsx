// components/geo/immersive-map.tsx
// VERSIÓN: 5.0 (The Final Standard - SSR Shielding)

"use client";

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

/**
 * [SOLUCIÓN TÉCNICA DEFINITIVA]
 * Cargamos el mapa de forma dinámica con 'ssr: false'.
 * Esto obliga a Next.js y Vercel a ignorar el contenido de 'map-inner' (y sus librerías)
 * durante la fase de compilación, eliminando el error de "Package path . is not exported".
 */
const MapCore = dynamic(() => import('./map-inner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 rounded-[2.5rem]">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
        Iniciando Madrid Resonance...
      </span>
    </div>
  )
});

export function ImmersiveMap() {
  return (
    <div className="w-full h-full relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-black shadow-2xl">
      <MapCore />
    </div>
  );
}