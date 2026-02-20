// app/(marketing)/page.tsx
// VERSIÓN: 2.5 (NicePod Marketing Canvas - Unified Architecture Standard)
// Misión: Proyectar la visión industrial de NicePod eliminando la duplicidad visual y optimizando el LCP.
// [ESTABILIZACIÓN]: Remoción de <Navigation /> para delegar al layout soberano y optimización de assets.

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
  Sparkles,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * LandingPage: El punto de contacto inicial con el ecosistema NicePod V2.5.
 * 
 * Implementa el sistema de diseño Aurora: tipografía monumental, 
 * glassmorphism avanzado y una jerarquía de información orientada a la autoridad técnica.
 */
export default function LandingPage() {

  // Variantes de animación optimizadas para GPU (Hardware Accelerated)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  /**
   * UNIVERSOS DE CONOCIMIENTO (NKV Dimensions)
   * Mapeo de activos visuales optimizados para el descubrimiento.
   */
  const knowledgeUniverses = [
    {
      title: "Pensamiento",
      id: "deep-thought",
      icon: BookOpen,
      desc: "Análisis de papers y filosofía sistémica."
    },
    {
      title: "Práctico",
      id: "practical-tools",
      icon: Zap,
      desc: "Sistemas de optimización y productividad real."
    },
    {
      title: "Tecnología",
      id: "tech",
      icon: BrainCircuit,
      desc: "La frontera de la Inteligencia Artificial y el código."
    },
    {
      title: "Narrativa",
      id: "narrative",
      icon: Globe,
      desc: "Crónicas urbanas y memoria colectiva Madrid Resonance."
    }
  ];

  return (
    <div className="flex flex-col items-center w-full selection:bg-primary/30">

      {/* --- SECCIÓN I: HERO MONUMENTAL (PULSE & RESONANCE) --- */}
      <section className="relative w-full flex flex-col items-center justify-center pt-12 pb-24 px-6 overflow-hidden">
        <motion.div
          className="container mx-auto max-w-7xl text-center space-y-10 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge de Versión (Authority Indicator) */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 fill-current" /> NicePod V2.5: Intelligence Redefined
            </div>
          </motion.div>

          {/* Título de Impacto (Aurora Typography) */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] text-zinc-900 dark:text-white uppercase italic"
          >
            SINTETIZA EL <br />
            <span className="text-gradient not-italic">MUNDO</span>
          </motion.h1>

          {/* Subtítulo Táctico */}
          <motion.p
            variants={itemVariants}
            className="max-w-3xl mx-auto text-base lg:text-xl text-muted-foreground font-medium leading-relaxed px-4"
          >
            NicePod es la Workstation de inteligencia soberana que destila la frontera de la ciencia, la actualidad estratégica y la memoria urbana en una sola experiencia auditiva.
          </motion.p>

          {/* Call to Action (High Conversion) */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-16 px-12 rounded-2xl text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/30 bg-primary text-white hover:scale-105 transition-all group">
                Comenzar Forja <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/podcasts" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-base font-black uppercase tracking-widest backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                Explorar Red
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* --- SECCIÓN II: PORTAL MADRID RESONANCE (TACTICAL BANNER) --- */}
      <section className="w-full max-w-screen-xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-video md:aspect-[21/9] rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-950 shadow-[0_0_100px_-20px_rgba(139,92,246,0.2)] group"
        >
          {/* Capa de Identificación Geoespacial */}
          <div className="absolute top-8 left-8 z-20 hidden md:flex flex-col gap-3">
            <div className="bg-black/60 backdrop-blur-xl px-6 py-2.5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Madrid: Active Resonance Node</span>
            </div>
          </div>

          {/* Motor WebGL (Diferido por el componente interno) */}
          <div className="absolute inset-0 z-0">
            <MapPreviewFrame />
          </div>

          {/* Overlays de Contraste Aurora */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />

          <div className="absolute bottom-10 left-10 right-10 z-20 flex flex-col md:flex-row justify-between items-end gap-6 text-left">
            <div className="space-y-3">
              <h3 className="text-white font-black text-4xl lg:text-5xl uppercase tracking-tighter italic leading-none drop-shadow-2xl">
                La Ciudad es <span className="text-primary">Tu Bóveda</span>
              </h3>
              <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-lg">
                Ancla tus ideas al territorio. Descubre crónicas sonoras situacionales y libera la historia latente de Madrid.
              </p>
            </div>
            <Link href="/map">
              <Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-black px-10 h-12 text-[10px] uppercase tracking-widest shadow-xl">
                ABRIR MAPA 3D
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* --- SECCIÓN III: PILARES DE INTELIGENCIA INDUSTRIAL --- */}
      <section className="w-full py-32 bg-zinc-900/30 border-y border-white/5 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">

            {/* Pilar 1: Pulse Harvester (High Reputation) */}
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
                <ShieldCheck size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Inteligencia de Élite</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  NicePod Pulse recolecta papers científicos de arXiv y fuentes de alta reputación. Accede a conocimiento validado, libre de sesgos comerciales.
                </p>
              </div>
            </div>

            {/* Pilar 2: Synthesis Engine (Gemini 3.0) */}
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                <BrainCircuit size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Síntesis Neuronal</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Transformamos fuentes crudas en monólogos sonoros cinematográficos. Una IA de redacción soberana que entiende tu intención profunda.
                </p>
              </div>
            </div>

            {/* Pilar 3: Knowledge Vault (NKV Economy) */}
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500">
                <Database size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Economía del Saber</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Cada investigación alimenta tu Bóveda (NKV). La economía circular de datos reduce costes y genera un archivo de sabiduría perpetuo.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECCIÓN IV: DIMENSIONES DE SABIDURÍA (VISUAL PREVIEW) --- */}
      <section className="w-full py-32 container mx-auto max-w-7xl px-6 text-center">
        <div className="mb-20 space-y-4">
          <p className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">Cámaras de Aprendizaje</p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-none">
            EXPLORA LAS <span className="text-primary italic">DIMENSIONES</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {knowledgeUniverses.map((uni) => (
            <div key={uni.id} className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900 group shadow-2xl transition-all hover:border-primary/40">
              <Image
                src={`/images/universes/${uni.id}.png`}
                alt={uni.title}
                fill
                className="object-cover opacity-40 group-hover:scale-110 transition-[transform,opacity] duration-&lsqb;2000ms&rsqb; group-hover:opacity-80" sizes="(max-width: 768px) 100vw, 25vw" />
              {/* Overlay de Identidad Dimensional */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-left z-20">
                <uni.icon className="h-8 w-8 text-primary mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h4 className="text-xl font-black uppercase tracking-tighter text-white mb-2 italic">{uni.title}</h4>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-relaxed">
                  {uni.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN V: FOOTER DE CONVERSIÓN SOBERANA --- */}
      <footer className="w-full py-24 border-t border-white/5 bg-black/40 text-center relative overflow-hidden">
        {/* Resplandor de Bóveda */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-6 space-y-16 relative z-10">
          <div className="flex flex-col items-center gap-8">
            <div className="h-20 w-20 relative opacity-90 p-4 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl">
              <Image src="/nicepod-logo.png" alt="NicePod Intelligence" fill className="object-contain" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">
              Sé el <span className="text-primary">Testigo</span> de tu tiempo.
            </h2>
            <Link href="/signup">
              <Button size="lg" className="h-16 px-16 rounded-full font-black text-xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all bg-primary text-white uppercase tracking-tighter">
                UNIRSE A LA RED
              </Button>
            </Link>
          </div>

          {/* Mapa de Navegación de Marca */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.4em]">
            <div className="flex gap-10">
              <Link href="/pricing" className="hover:text-primary transition-colors">Suscripciones</Link>
              <Link href="/podcasts" className="hover:text-primary transition-colors">Bóveda Global</Link>
              <Link href="/geo" className="hover:text-primary transition-colors">Resonancia</Link>
            </div>
            <p className="italic">© 2026 NICEPOD. PROTOCOLO NCIS V1.0. INTELLIGENCE SOVEREIGNTY.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Se ha erradicado el componente <Navigation /> del cuerpo de la página. 
 * El encabezado ahora se sirve exclusivamente a través de app/(marketing)/layout.tsx (v1.1).
 * Esto resuelve la duplicidad visual en dispositivos móviles y garantiza que 
 * la navegación no pestañee durante el intercambio de sesión.
 */