// app/(geo-mode)/geo/page.tsx (V3.0 - Lead Architect Edition)
"use client";

import { GeoScannerUI } from "@/components/geo/scanner-ui";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GeoCreationPage() {
  return (
    <div className="h-[100dvh] w-full relative flex flex-col bg-[#020202] overflow-hidden selection:bg-primary/30">

      {/* HUD DE TELEMETRÍA (Nivel de conexión) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
        <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/60">Enlace Neural Activo</span>
      </div>

      <header className="flex-shrink-0 p-6 flex justify-between items-center z-50">
        <Link href="/map">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/40 hover:text-white hover:bg-primary/10 rounded-full h-12 w-12 transition-all border border-white/0 hover:border-white/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>

        <div className="flex flex-col items-end">
          <div className="text-[10px] font-black tracking-[0.4em] uppercase text-primary/80">
            Nicepod <span className="text-white ml-1">Spatial</span>
          </div>
          <div className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-0.5">
            Madrid Resonance Engine
          </div>
        </div>
      </header>

      {/* ÁREA DE TRABAJO (Con optimización de renderizado) */}
      <main className="flex-1 relative z-10 contain-layout">
        <GeoScannerUI />
      </main>

      {/* EFECTOS DE ATMÓSFERA MEJORADOS */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
    </div>
  );
}