// app/(geo-mode)/map/page.tsx
// VERSIÓN: 2.0 (NicePod Spatial Engine - Dynamic Viewport Edition)
// Misión: Lograr una inmersión geográfica total y responsiva.
// [ESTABILIZACIÓN]: Eliminación de h-screen por h-[100dvh] y protección de safe-area.

"use client";

import { ImmersiveMap } from "@/components/geo/immersive-map";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Navigation2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MapExplorerPage() {
  return (
    // [FIX]: h-[100dvh] asegura que el mapa ocupe el alto real del visor móvil.
    // Usamos 'fixed' e 'inset-0' para asegurar que el mapa sea el bastidor absoluto.
    <div className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden selection:bg-primary/20">

      {/* MOTOR DEL MAPA 3D: Posicionado como capa base */}
      <div className="absolute inset-0 z-0">
        <ImmersiveMap />
      </div>

      {/* CABECERA FLOTANTE: Alineada con seguridad de notch */}
      <header className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/40 backdrop-blur-2xl text-white hover:bg-black/60 rounded-full border border-white/10 shadow-2xl h-12 w-12 transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        <div className="pointer-events-auto bg-black/40 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/5 shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80">
            Madrid <span className="text-primary">Live</span>
          </span>
        </div>
      </header>

      {/* ACCIÓN FLOTANTE INFERIOR: Botón de Anclaje con Safe-Area Support */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        className="absolute bottom-0 left-0 right-0 z-50 flex justify-center p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pointer-events-none"
      >
        <div className="w-full max-w-sm pointer-events-auto">
          <Link href="/geo">
            <Button className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(139,92,246,0.3)] border border-white/10 hover:scale-105 active:scale-95 transition-all">
              <Sparkles className="mr-3 h-5 w-5 animate-pulse" />
              ANCLAR NUEVA MEMORIA
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* CONTADOR DE PROXIMIDAD: Posición táctica */}
      <div className="absolute top-20 right-6 z-40 md:top-6 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
        <Navigation2 size={12} className="text-primary" />
        Radar Activo
      </div>

    </div>
  );
}