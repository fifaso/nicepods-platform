// app/(geo-mode)/geo/page.tsx
// VERSIÓN: 2.0 (Madrid Resonance - Dedicated Creation Workspace)

"use client";

import { GeoScannerUI } from "@/components/geo/scanner-ui";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GeoCreationPage() {
  return (
    <div className="h-screen w-full relative flex flex-col bg-black overflow-hidden">

      {/* HEADER DE SALIDA HACIA EL EXPLORADOR */}
      <header className="flex-shrink-0 p-6 flex justify-between items-center z-50">
        <Link href="/map">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/40 hover:text-white hover:bg-white/5 rounded-full h-12 w-12 transition-all"
          >
            <ArrowLeft className="h-7 w-7" />
          </Button>
        </Link>

        <div className="flex flex-col items-end">
          <div className="text-[10px] font-black tracking-[0.4em] uppercase text-white/20">
            Nicepod <span className="text-primary/50 ml-1">Spatial Hub</span>
          </div>
          <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
            Vínculo Neural con la Ciudad
          </div>
        </div>
      </header>

      {/* ÁREA DE TRABAJO (Scanner + IA + Grabadora) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar-hide">
        <GeoScannerUI />
      </main>

      {/* DECORACIÓN AMBIENTAL (Glow sutil) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
    </div>
  );
}