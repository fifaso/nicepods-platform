// app/(geo-mode)/map/page.tsx
// VERSIÓN: 1.0 (Madrid Resonance - Explorer Mode)

"use client";

import { ImmersiveMap } from "@/components/geo/immersive-map";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MapExplorerPage() {
  return (
    <div className="h-screen w-full relative bg-black overflow-hidden">

      {/* HEADER TÁCTICO */}
      <header className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="bg-black/60 backdrop-blur-md text-white hover:bg-black/80 rounded-full border border-white/10 shadow-2xl">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Madrid Resonance <span className="text-primary">Explorer</span></span>
        </div>
      </header>

      {/* MOTOR DEL MAPA 3D (Consumo de memorias) */}
      <div className="h-full w-full">
        <ImmersiveMap />
      </div>

      {/* CTA FLOTANTE: SALTO AL MODO CRONISTA */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-6"
      >
        <Link href="/geo">
          <Button className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-xs tracking-[0.2em] shadow-[0_0_40px_rgba(var(--primary),0.4)] border border-white/20 hover:scale-105 active:scale-95 transition-all">
            <Sparkles className="mr-3 h-5 w-5 animate-pulse" />
            ANCLAR NUEVA MEMORIA
          </Button>
        </Link>
      </motion.div>

    </div>
  );
}