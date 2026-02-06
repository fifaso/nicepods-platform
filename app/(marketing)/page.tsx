// app/(marketing)/page.tsx
// VERSIÓN: 1.0 (The Witness Portal - Brand Foundation)
// Misión: Capturar la atención del usuario mediante una narrativa visual inmersiva y centrada en la visión.

"use client";

import { DiscoveryHub } from "@/components/discovery-hub";
import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Headphones,
  Search,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";

/**
 * LandingPage: El escaparate profesional de NicePod V2.5.
 */
export default function LandingPage() {

  // Variantes de animación para la entrada cinematográfica
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/30">

      {/* 1. SECCIÓN HERO: EL MANIFIESTO */}
      <section className="relative pt-24 pb-16 lg:pt-40 lg:pb-32 overflow-hidden">
        <motion.div
          className="container mx-auto max-w-7xl px-4 text-center space-y-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge de Versión */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
              <Zap className="h-3 w-3 fill-current" /> NicePod Intelligence Activa
            </div>
          </motion.div>

          {/* Título Monumental */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-zinc-900 dark:text-white uppercase italic"
          >
            POTENCIA TU CONOCIMIENTO <br />
            <span className="text-primary not-italic">CON PODCASTS A MEDIDA</span>.
          </motion.h1>

          {/* Subtítulo de Autoridad */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg lg:text-2xl text-muted-foreground font-medium leading-relaxed"
          >
            Transformamos el tiempo de aprendizaje en un sistema nervioso digital. Crea y descubre contenido de valor solo respecto a tus intereses.
          </motion.p>

          {/* Call to Action Primario */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
          >
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-tighter shadow-2xl shadow-primary/20 group">
              <Link href="/login">
                Bóveda de conocimiento
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-tighter backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <Link href="/signup">Unirse</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. EL PORTAL VISUAL: MADRID RESONANCE 3D */}
      <section className="container mx-auto max-w-6xl px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)] group"
        >
          {/* Etiquetas de Interfaz del Mapa */}
          <div className="absolute top-10 left-10 z-20 flex flex-col gap-3">
            <div className="bg-black/60 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Madrid Resonance: Live Map</span>
            </div>
            <div className="hidden md:flex bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-bold text-white/60 uppercase">Protocolo Witness Activo</span>
            </div>
          </div>

          {/* El Motor Gráfico Real */}
          <div className="h-[500px] lg:h-[650px] w-full bg-zinc-950">
            <MapPreviewFrame />
          </div>

          {/* Overlay de Gradiente Táctico */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />

          {/* Info Flotante Inferior */}
          <div className="absolute bottom-10 left-10 right-10 z-20 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
              <h3 className="text-white font-black text-3xl lg:text-4xl uppercase tracking-tighter italic leading-none">
                Ecos en <span className="text-primary">Tiempo Real</span>
              </h3>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest max-w-sm">
                Navega por la ciudad y escucha la historia que el asfalto y la piedra tienen para contarte.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/map">
                <Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-black px-8">
                  EXPLORAR MADRID
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. LOS TRES PILARES DE LA VISIÓN */}
      <section className="py-32 bg-zinc-900/40 border-y border-white/5 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">

            {/* Pilar 1: Animismo Urbano */}
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-primary border border-primary/30 group-hover:scale-110 transition-transform duration-500">
                <Globe className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Animismo Urbano</h3>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  NicePod no es un diario personal. Es la voz de los edificios, monumentos y rincones. Somos el sistema que permite a la ciudad hablar por sí misma.
                </p>
              </div>
            </div>

            {/* Pilar 2: Audio-Realidad Neuronal */}
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-blue-500/20 flex items-center justify-center text-blue-500 border border-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                <Headphones className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Audio-Realidad</h3>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  Sintetizamos guiones de alta autoridad con Gemini 1.5 Pro, transformando datos en monólogos inmersivos con una locución neuronal perfecta.
                </p>
              </div>
            </div>

            {/* Pilar 3: Economía del Conocimiento */}
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-purple-500/20 flex items-center justify-center text-purple-500 border border-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Inteligencia Circular</h3>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  Cada podcast generado alimenta nuestro Knowledge Vault. El sistema aprende de cada cronista, creando una inteligencia colectiva que nunca muere.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SECCIÓN DE DESCUBRIMIENTO: UNIVERSOS SEMÁNTICOS */}
      <section className="py-32 container mx-auto max-w-7xl px-4 text-center space-y-16">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 text-primary mb-2">
            <Search size={20} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.4em]">Exploración Semántica</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white">
            Sintoniza con el <span className="text-primary italic">Mundo</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">
            Navega por las dimensiones del conocimiento. Desde el pensamiento profundo hasta la innovación tecnológica.
          </p>
        </div>

        <div className="w-full">
          <DiscoveryHub showOnlyCategories={true} />
        </div>

        <div className="pt-10">
          <Button asChild variant="link" className="text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-[10px]">
            <Link href="/podcasts">Ver todos los Micro-pods <ArrowRight className="ml-2 h-3 w-3" /></Link>
          </Button>
        </div>
      </section>

      {/* 5. FOOTER FINAL: EL COMPROMISO */}
      <footer className="py-24 border-t border-white/5 bg-black/20 text-center">
        <div className="container mx-auto max-w-4xl px-4 space-y-12">
          <div className="flex flex-col items-center gap-6">
            <div className="h-12 w-12 rounded-xl border border-white/10 p-2">
              <img src="/nicepod-logo.png" alt="NicePod" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">
              Conviértete en el <span className="text-primary">Testigo</span>.
            </h2>
            <Button asChild size="lg" className="h-14 px-12 rounded-full font-black text-lg shadow-xl shadow-primary/10">
              <Link href="/signup">EMPEZAR AHORA</Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
            <Link href="/pricing" className="hover:text-primary transition-colors">Suscripciones</Link>
            <Link href="/podcasts" className="hover:text-primary transition-colors">Biblioteca</Link>
            <span className="opacity-20 text-white">|</span>
            <p>© 2026 NICEPOD PLATFORM. MADRID RESONANCE PROJECT.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}