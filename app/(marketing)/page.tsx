/**
 * ARCHIVO: app/(marketing)/page.tsx
 * VERSIÓN: 5.0 (NicePod Marketing Canvas - Zero-Scroll Industrial Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar la identidad de la Workstation en una sola pantalla (T0),
 * eliminando la fricción de desplazamiento y purificando la interfaz visual.
 * [REFORMA V5.0]: Título en una línea, botones en fila, mapa purificado sin texto 
 * y cumplimiento absoluto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Database,
  Globe,
  ShieldCheck,
  Zap,
  LogIn,
  UserPlus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * LandingPage: El punto de contacto inicial de alta fidelidad.
 */
export default function LandingPage() {

  // --- I. CONFIGURACIÓN DE CINEMÁTICA DE ALTA VELOCIDAD ---
  const containerAnimationVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 }
    }
  };

  const itemAnimationVariants = {
    hidden: { y: 8, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-start bg-[#010101] overflow-hidden selection:bg-primary/30 antialiased">

      {/* --- SECCIÓN I: TERMINAL HERO (COMPACTA) --- */}
      <section className="w-full flex flex-col items-center pt-10 pb-4 px-6 shrink-0">
        <motion.div
          className="container mx-auto max-w-5xl text-center space-y-4"
          variants={containerAnimationVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Título Monumental en una sola línea (Industrial Refinement) */}
          <motion.h1
            variants={itemAnimationVariants}
            className="text-3xl xs:text-4xl sm:text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white uppercase italic whitespace-nowrap leading-none"
          >
            SINTETIZA EL <span className="text-primary not-italic">MUNDO</span>
          </motion.h1>

          {/* Descripción Técnica de Alta Densidad */}
          <motion.p
            variants={itemAnimationVariants}
            className="max-w-2xl mx-auto text-[10px] sm:text-sm md:text-lg text-zinc-500 font-bold uppercase tracking-[0.3em] leading-relaxed px-4"
          >
            Workstation profesional de captura, análisis y organización de conocimiento real mediante IA y geolocalización.
          </motion.p>
        </motion.div>
      </section>

      {/* --- SECCIÓN II: REACTOR VISUAL (CLEAN MAP GATEWAY) --- */}
      <section className="w-full max-w-4xl mx-auto px-6 py-2 flex-1 min-h-0 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group cursor-pointer h-full max-h-[380px] w-full"
        >
          <Link href="/login" className="block relative h-full w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl transition-all hover:border-primary/40 isolate">
            {/* Motor WebGL Purificado (Sin Overlays de texto) */}
            <div className="absolute inset-0 z-0">
              <MapPreviewFrame />
            </div>

            {/* Gradiente de Sellado Atmosférico */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#010101]/60 via-transparent to-transparent z-10 pointer-events-none" />
            
            {/* Indicador de Acción Minimalista (Solo visible en Hover) */}
            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-white text-black px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-2xl">
                    Sincronizar Malla
                </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* --- SECCIÓN III: COMANDOS DE ACCESO (AXIAL ALIGNMENT) --- */}
      <section className="w-full max-w-2xl mx-auto flex flex-row items-center justify-center gap-3 px-6 pt-4 pb-8 shrink-0">
        <Link href="/signup" className="flex-1 max-w-[180px]">
          <Button size="lg" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-zinc-200 shadow-xl transition-all active:scale-95">
            <UserPlus size={14} className="mr-2" />
            Crear cuenta
          </Button>
        </Link>
        <Link href="/login" className="flex-1 max-w-[180px]">
          <Button variant="outline" size="lg" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95">
            <LogIn size={14} className="mr-2" />
            Acceder
          </Button>
        </Link>
      </section>

      {/* --- SECCIÓN IV: IDENTIFICADOR DE INFRAESTRUCTURA (FOOTER) --- */}
      <footer className="w-full py-4 border-t border-white/5 bg-black/40 text-center shrink-0">
          <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.6em]">
            NicePod Platform V4.0 • Madrid Resonance Node • Intelligence Sovereignty
          </p>
      </footer>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Single-Viewport Optimization: Se implementó 'h-[100dvh]' y un layout de flex-col 
 *    con 'flex-1' en el mapa para garantizar que todos los elementos críticos 
 *    residan en la primera vista sin scroll.
 * 2. Visual Purity: Se eliminaron los textos redundantes sobre el MapPreviewFrame, 
 *    transformando el mapa en un activo táctico limpio.
 * 3. Axial Button Alignment: Los comandos de acceso ahora conviven en una sola línea 
 *    para reducir la ocupación de espacio vertical en terminales móviles.
 * 4. Zero Abbreviations Policy: Purificación absoluta de la lógica de componentes.
 */