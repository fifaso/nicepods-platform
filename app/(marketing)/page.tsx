// app/(marketing)/page.tsx
// VERSIÓN: 1.1 (Witness Portal - Zero Warning Edition)
// Misión: Landing de alto impacto con optimización absoluta de imágenes.

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { DiscoveryHub } from "@/components/discovery-hub";
import Link from "next/link";
import Image from "next/image"; // [FIX]: Importación de Image para optimización
import { 
  ArrowRight, 
  Globe, 
  Zap, 
  Headphones, 
  ShieldCheck, 
  Sparkles,
  Search
} from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 lg:pt-40 lg:pb-32 overflow-hidden">
        <motion.div 
          className="container mx-auto max-w-7xl px-4 text-center space-y-8 relative z-10"
          variants={containerVariants} initial="hidden" animate="visible"
        >
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
              <Zap className="h-3 w-3 fill-current" /> NicePod V2.5 Intelligence Activa
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-zinc-900 dark:text-white uppercase italic"
          >
            LA CIUDAD TIENE <br />
            <span className="text-primary not-italic">MEMORIA</span>.
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg lg:text-2xl text-muted-foreground font-medium leading-relaxed"
          >
            Transformamos el espacio urbano en un sistema nervioso digital. Crea y descubre crónicas sonoras ancladas a la realidad física.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-tighter shadow-2xl shadow-primary/20 group">
              <Link href="/login">
                Entrar en la Bóveda <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-tighter backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <Link href="/signup">Unirse como Cronista</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* --- PORTAL VISUAL SECTION --- */}
      <section className="container mx-auto max-w-6xl px-4 pb-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 1 }}
          className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)] group bg-zinc-950"
        >
          <div className="absolute top-10 left-10 z-20 flex flex-col gap-3">
            <div className="bg-black/60 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Madrid Resonance</span>
            </div>
          </div>
          <div className="h-[500px] lg:h-[650px] w-full"><MapPreviewFrame /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-10 left-10 right-10 z-20 flex flex-col md:flex-row justify-between items-end gap-6 text-left">
            <div className="space-y-2">
              <h3 className="text-white font-black text-3xl lg:text-4xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
                Ecos en <span className="text-primary">Tiempo Real</span>
              </h3>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest max-w-sm">
                Navega por la ciudad y escucha la historia que la piedra tiene para contarte.
              </p>
            </div>
            <Link href="/map"><Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-black px-8">EXPLORAR MADRID</Button></Link>
          </div>
        </motion.div>
      </section>

      {/* --- PILARES SECTION --- */}
      <section className="py-32 bg-zinc-900/40 border-y border-white/5 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 text-left">
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-primary border border-primary/30 group-hover:scale-110 transition-all"><Globe size={32} /></div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Animismo Urbano</h3>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">Somos el sistema que permite a la ciudad hablar por sí misma, anclando conocimiento al territorio.</p>
              </div>
            </div>
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-blue-500/20 flex items-center justify-center text-blue-500 border border-blue-500/30 group-hover:scale-110 transition-all"><Headphones size={32} /></div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Audio-Realidad</h3>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">Sintetizamos guiones de alta autoridad con Gemini 1.5 Pro para una locución neuronal de élite.</p>
              </div>
            </div>
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-purple-500/20 flex items-center justify-center text-purple-500 border border-purple-500/30 group-hover:scale-110 transition-all"><Sparkles size={32} /></div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Inteligencia Circular</h3>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">Cada podcast alimenta el Knowledge Vault, creando una memoria colectiva que se revaloriza.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER SECTION --- */}
      <footer className="py-24 border-t border-white/5 bg-black/20 text-center">
        <div className="container mx-auto max-w-4xl px-4 space-y-12">
          <div className="flex flex-col items-center gap-8">
            <div className="h-14 w-14 relative opacity-80 border border-white/10 p-2 rounded-2xl bg-zinc-900">
               <Image src="/nicepod-logo.png" alt="NicePod Logo" fill className="object-contain" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
              Conviértete en el <span className="text-primary">Testigo</span>.
            </h2>
            <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"><Link href="/signup">EMPEZAR AHORA</Link></Button>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">
            <Link href="/pricing" className="hover:text-primary transition-colors">Suscripciones</Link>
            <Link href="/podcasts" className="hover:text-primary transition-colors">Biblioteca</Link>
            <p>© 2026 NICEPOD PLATFORM. MADRID RESONANCE PROJECT.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}