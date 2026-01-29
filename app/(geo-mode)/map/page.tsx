// app/(geo-mode)/map/page.tsx
// VERSIÓN: 1.0 (Madrid Resonance - Full Screen Explorer)

"use client";

import { ImmersiveMap } from "@/components/geo/immersive-map";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Navigation2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MapExplorerPage() {
  return (
    <div className="h-screen w-full relative bg-black overflow-hidden flex flex-col">

      {/* CABECERA FLOTANTE SOBRE EL MAPA */}
      <header className="absolute top-6 left-6 z-50 flex items-center gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/60 backdrop-blur-xl text-white hover:bg-black/80 rounded-full border border-white/10 shadow-2xl h-12 w-12"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        <div className="bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
            Madrid Resonance <span className="text-primary ml-1">Live</span>
          </span>
        </div>
      </header>

      {/* MOTOR DEL MAPA 3D (Ocupa todo el viewport) */}
      <div className="flex-1 w-full relative z-0">
        <ImmersiveMap />
      </div>

      {/* ACCIÓN FLOTANTE INFERIOR: SALTO AL MODO CRONISTA */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute bottom-10 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none"
      >
        <div className="w-full max-w-sm pointer-events-auto">
          <Link href="/geo">
            <Button className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-xs tracking-[0.2em] shadow-[0_0_40px_rgba(var(--primary),0.4)] border border-white/20 hover:scale-105 active:scale-95 transition-all">
              <Sparkles className="mr-3 h-5 w-5 animate-pulse" />
              ANCLAR NUEVA MEMORIA
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* CONTADOR DE PROXIMIDAD (SUTIL) */}
      <div className="absolute top-6 right-6 z-50 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
        <Navigation2 size={12} className="text-primary" />
        Radar de proximidad activo
      </div>

    </div>
  );
}