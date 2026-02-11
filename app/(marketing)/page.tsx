// app/(marketing)/page.tsx
// VERSIÓN: 1.2 (The North Star Portal - Full Platform Value)
// Misión: Escaparate de alta fidelidad que proyecta la visión integral de NicePod.
// [FIX]: Eliminación definitiva de DiscoveryHub y expansión de narrativa técnica (Papers/NKV).

"use client";

import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { Navigation } from "@/components/navigation"; // [NUEVO]: Menú superior integrado
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Database,
  Globe,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * LandingPage: El portal de entrada a la experiencia NicePod.
 */
export default function LandingPage() {

  // Variantes de animación para una entrada cinematográfica
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  /**
   * UNIVERSOS DE CONOCIMIENTO (Representación Estática)
   * Sustituye al DiscoveryHub para explicar la amplitud del sistema.
   */
  const knowledgeUniverses = [
    { title: "Pensamiento Profundo", icon: BookOpen, desc: "Análisis de papers científicos y filosofía." },
    { title: "Herramientas Prácticas", icon: Zap, desc: "Sistemas de optimización y productividad." },
    { title: "Innovación y Tec.", icon: BrainCircuit, desc: "La frontera de la Inteligencia Artificial." },
    { title: "Narrativa e Historias", icon: Globe, desc: "Crónicas urbanas y memoria colectiva." }
  ];

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/30 overflow-x-hidden">

      {/* 1. NAVEGACIÓN SUPERIOR 
          Configurada para que el invitado vea las opciones pero deba loguearse para actuar.
      */}
      <Navigation />

      {/* 2. SECCIÓN HERO: LA VISIÓN INTEGRAL (PULSE + RESONANCE) */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <motion.div
          className="container mx-auto max-w-7xl px-4 text-center space-y-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge de Versión */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
              <Sparkles className="h-3 w-3 fill-current" /> NicePod V2.5: Intelligence Redefined
            </div>
          </motion.div>

          {/* Título de Autoridad Cognitiva */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-zinc-900 dark:text-white uppercase italic"
          >
            SINTETIZA EL <br />
            <span className="text-primary not-italic">MUNDO</span>.
          </motion.h1>

          {/* Subtítulo Expandido (La Misión) */}
          <motion.p
            variants={itemVariants}
            className="max-w-3xl mx-auto text-lg lg:text-2xl text-muted-foreground font-medium leading-relaxed"
          >
            NicePod destila la frontera de la ciencia, la actualidad estratégica y la memoria de las calles en una sola experiencia auditiva personalizada.
          </motion.p>

          {/* Call to Action Directo */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Button asChild size="lg" className="h-16 px-12 rounded-2xl text-lg font-black uppercase tracking-tighter shadow-2xl shadow-primary/20 group">
              <Link href="/login">
                ACCEDER A LA BÓVEDA <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-tighter backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <Link href="/signup">Unirse como Curador</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. PORTAL VISUAL: EL PRIMER NODO (MADRID) */}
      <section className="container mx-auto max-w-6xl px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)] group bg-zinc-950"
        >
          <div className="absolute top-10 left-10 z-20 flex flex-col gap-3">
            <div className="bg-black/70 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-xs font-black text-white uppercase tracking-[0.2em]">MADRID: LIVE RESONANCE NODE</span>
            </div>
          </div>

          <div className="h-[400px] lg:h-[550px] w-full"><MapPreviewFrame /></div>

          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />

          <div className="absolute bottom-10 left-10 right-10 z-20 flex flex-col md:flex-row justify-between items-end gap-6 text-left">
            <div className="space-y-2">
              <h3 className="text-white font-black text-3xl lg:text-4xl uppercase tracking-tighter italic leading-none drop-shadow-lg">
                La Ciudad es <span className="text-primary">Tu Biblioteca</span>
              </h3>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest max-w-md">
                Explora memorias sonoras ancladas al territorio y descubre la historia latente de cada esquina.
              </p>
            </div>
            <Link href="/login"><Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-black px-8">EXPLORAR MAPA</Button></Link>
          </div>
        </motion.div>
      </section>

      {/* 4. LOS PILARES DEL CONOCIMIENTO (PULSE / VAULT / RESONANCE) */}
      <section className="py-32 bg-zinc-900/40 border-y border-white/5 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 text-left">

            {/* Pilar 1: Alta Autoridad (Papers/News) */}
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-blue-500/20 flex items-center justify-center text-blue-500 border border-blue-500/30 group-hover:scale-110 transition-all">
                <ShieldCheck size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Inteligencia de Élite</h3>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  NicePod Pulse escanea arXiv, OpenAlex y fuentes académicas para entregarte briefings de alta densidad cognitiva, filtrando el ruido comercial.
                </p>
              </div>
            </div>

            {/* Pilar 2: Sabiduría Personalizada (Gemini Synthesis) */}
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-primary border border-primary/30 group-hover:scale-110 transition-all">
                <BrainCircuit size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Síntesis Neuronal</h3>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  Transformamos ideas crudas en monólogos sonoros cinematográficos. Una IA que entiende tu intención y la transmuta en sabiduría compartible.
                </p>
              </div>
            </div>

            {/* Pilar 3: Economía del Saber (The Vault) */}
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-purple-500/20 flex items-center justify-center text-purple-500 border border-purple-500/30 group-hover:scale-110 transition-all">
                <Database size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Memoria Perpetua</h3>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  Cada podcast alimenta el Knowledge Vault (NKV). Tu aprendizaje recurrente reduce costes y genera una red de conocimiento soberana.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SECCIÓN DE DIMENSIONES (Sustituye al DiscoveryHub) */}
      <section className="py-32 container mx-auto max-w-7xl px-4 text-center">
        <div className="mb-20 space-y-4">
          <p className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">Ecosistema de Aprendizaje</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none">
            EXPLORA LAS <span className="text-primary italic">DIMENSIONES</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {knowledgeUniverses.map((uni, idx) => (
            <div key={idx} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group text-left shadow-xl">
              <uni.icon className="h-10 w-10 text-primary/40 mb-6 group-hover:scale-110 group-hover:text-primary transition-all" />
              <h4 className="text-xl font-black uppercase tracking-tight text-white mb-2">{uni.title}</h4>
              <p className="text-sm text-muted-foreground font-medium">{uni.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FOOTER: CONVERSIÓN FINAL */}
      <footer className="py-24 border-t border-white/5 bg-black/20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-4xl px-4 space-y-12 relative z-10">
          <div className="flex flex-col items-center gap-8">
            <div className="h-16 w-16 relative opacity-80 border border-white/10 p-3 rounded-2xl bg-zinc-900 shadow-2xl">
              <Image src="/nicepod-logo.png" alt="NicePod Logo" fill className="object-contain" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
              Sé el <span className="text-primary">Testigo</span> de tu tiempo.
            </h2>
            <Button asChild size="lg" className="h-16 px-16 rounded-full font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-transform bg-primary text-white uppercase tracking-tighter">
              <Link href="/login">COMENZAR INVESTIGACIÓN</Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-50">
            <Link href="/login" className="hover:text-primary transition-colors">Suscripciones</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Biblioteca Global</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Mapa de Memoria</Link>
            <p className="md:ml-auto">© 2026 NICEPOD PLATFORM. PROTOCOLO NCIS V1.0.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}