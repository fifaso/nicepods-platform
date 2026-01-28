// components/geo/immersive-map.tsx
// VERSIÓN: 6.0 

"use client";

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapCore = dynamic(() => import('./map-inner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 rounded-[2.5rem] border border-white/5">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
        Sincronizando Madrid...
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