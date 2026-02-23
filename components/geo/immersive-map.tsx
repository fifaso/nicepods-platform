// components/geo/immersive-map.tsx (V7.0 - Lead Architect Edition)
"use client";

import { Globe } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense, memo } from 'react';

// MEMO: Evitamos que el wrapper se re-renderice si el padre muta
const MapCore = dynamic(() => import('./map-inner'), {
  ssr: false,
  loading: () => <MapSkeleton />
});

function MapSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] rounded-[2.5rem] border border-white/5 relative overflow-hidden">
      {/* Efecto de escaneo visual */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent animate-pulse" />
      <Globe className="h-10 w-10 text-primary/40 animate-pulse mb-4" />
      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 animate-pulse">
        Sincronizando Malla Urbana...
      </span>
    </div>
  );
}

export const ImmersiveMap = memo(function ImmersiveMap() {
  return (
    <div className="w-full h-full relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-black shadow-[0_0_50px_-12px_rgba(var(--primary),0.2)] group">
      {/* Overlay de profundidad */}
      <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

      <Suspense fallback={<MapSkeleton />}>
        <MapCore />
      </Suspense>

      {/* Marca de agua técnica - NicePod Standard */}
      <div className="absolute bottom-6 right-8 z-20 opacity-30 group-hover:opacity-60 transition-opacity">
        <div className="text-[8px] font-black tracking-widest uppercase text-white">
          MAD <span className="text-primary">RSS</span> 2.5
        </div>
      </div>
    </div>
  );
});