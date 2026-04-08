/**
 * ARCHIVO: app/(marketing)/page.tsx
 * VERSIÓN: 3.0 (NicePod Marketing Canvas - Sovereign Industrial Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar la visión industrial de NicePod, garantizando la carga 
 * instantánea de marca y la inmersión visual en el ecosistema de inteligencia.
 * [REFORMA V3.0]: Sincronización de logo local (Fix Error 400), purificación 
 * nominal absoluta y optimización de jerarquía tipográfica.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
 * LandingPage: El punto de contacto inicial con el ecosistema de inteligencia.
 */
export default function LandingPage() {

  // --- I. CONFIGURACIÓN DE CINEMÁTICA VISUAL (CPU OPTIMIZED) ---
  const containerAnimationVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemAnimationVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  /**
   * knowledgeUniversesCollection:
   * Mapeo de dimensiones de sabiduría con nomenclatura descriptiva completa.
   */
  const knowledgeUniversesCollection = [
    {
      identification: "deep-thought",
      title: "Pensamiento",
      IconComponent: BookOpen,
      descriptionDescription: "Análisis de papers científicos y filosofía de sistemas complejos."
    },
    {
      identification: "practical-tools",
      title: "Práctico",
      IconComponent: Zap,
      descriptionDescription: "Sistemas de optimización y protocolos de productividad real."
    },
    {
      title: "Tecnología",
      identification: "tech",
      IconComponent: BrainCircuit,
      descriptionDescription: "La frontera de la Inteligencia Artificial y la arquitectura de código."
    },
    {
      title: "Narrativa",
      identification: "narrative",
      IconComponent: Globe,
      descriptionDescription: "Crónicas urbanas y memoria colectiva anclada en Madrid Resonance."
    }
  ];

  return (
    <div className="flex flex-col items-center w-full selection:bg-primary/30 antialiased">

      {/* --- SECCIÓN I: HERO MONUMENTAL (PROYECCIÓN DE AUTORIDAD) --- */}
      <section className="relative w-full flex flex-col items-center justify-center pt-16 pb-28 px-6 overflow-hidden">
        <motion.div
          className="container mx-auto max-w-7xl text-center space-y-12 relative z-10"
          variants={containerAnimationVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Indicador de Rango Técnico */}
          <motion.div variants={itemAnimationVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.5em] backdrop-blur-2xl">
              <Sparkles className="h-4 w-4 fill-current animate-pulse" /> 
              NicePod V4.0: Intelligence Sovereign Edition
            </div>
          </motion.div>

          {/* Título Monumental (Aurora Typography) */}
          <motion.h1
            variants={itemAnimationVariants}
            className="text-6xl md:text-8xl lg:text-[11rem] font-black tracking-tighter leading-[0.8] text-white uppercase italic font-serif"
          >
            SINTETIZA EL <br />
            <span className="text-primary not-italic drop-shadow-[0_0_60px_rgba(var(--primary-rgb),0.35)]">MUNDO</span>
          </motion.h1>

          <motion.p
            variants={itemAnimationVariants}
            className="max-w-4xl mx-auto text-base lg:text-2xl text-zinc-500 font-medium leading-relaxed px-8"
          >
            NicePod es la Workstation de inteligencia industrial que destila la frontera del conocimiento y la memoria urbana en una sola frecuencia acústica.
          </motion.p>

          {/* Call to Action (Conversión Táctica) */}
          <motion.div variants={itemAnimationVariants} className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-20 px-16 rounded-[2rem] text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/40 bg-white text-black hover:scale-105 transition-all group">
                Comenzar Forja <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link href="/podcasts" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-20 px-12 rounded-[2rem] text-lg font-black uppercase tracking-widest backdrop-blur-3xl bg-white/5 border-white/10 hover:bg-white/10 transition-all text-white">
                Explorar Red
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* --- SECCIÓN II: PORTAL MADRID RESONANCE (TACTICAL MAP BANNER) --- */}
      <section className="w-full max-w-screen-xl mx-auto px-6 pb-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-video md:aspect-[21/9] rounded-[4rem] overflow-hidden border border-white/10 bg-zinc-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group isolate"
        >
          {/* Motor WebGL (Diferido) */}
          <div className="absolute inset-0 z-0">
            <MapPreviewFrame />
          </div>

          {/* Gradiente de Sellado Aurora */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-transparent to-transparent z-10 pointer-events-none" />

          <div className="absolute bottom-12 left-12 right-12 z-20 flex flex-col md:flex-row justify-between items-end gap-8 text-left">
            <div className="space-y-4">
              <h3 className="text-white font-black text-5xl lg:text-7xl uppercase tracking-tighter italic leading-none drop-shadow-2xl font-serif">
                La Ciudad es <span className="text-primary">Tu Bóveda</span>
              </h3>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em] max-w-xl leading-relaxed">
                Ancla tus ideas al territorio físico. Descubre crónicas sonoras situacionales y libera la historia latente de Madrid.
              </p>
            </div>
            <Link href="/map">
              <Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-black px-12 h-14 text-xs uppercase tracking-widest shadow-2xl transition-transform hover:scale-105">
                ABRIR MAPA 3D
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* --- SECCIÓN III: PILARES DE INTELIGENCIA INDUSTRIAL --- */}
      <section className="w-full py-40 bg-[#050505] border-y border-white/5 backdrop-blur-3xl shadow-inner">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 lg:gap-32">

            <div className="space-y-8 group">
              <div className="h-20 w-20 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-700 shadow-xl">
                <ShieldCheck size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic font-serif leading-none">Inteligencia de Élite</h3>
                <p className="text-zinc-500 text-base leading-relaxed font-medium">
                  NicePod recolecta papers científicos y fuentes de alta reputación. Acceda a conocimiento validado, libre de sesgos comerciales.
                </p>
              </div>
            </div>

            <div className="space-y-8 group">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-700 shadow-xl">
                <BrainCircuit size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic font-serif leading-none">Síntesis Neuronal</h3>
                <p className="text-zinc-500 text-base leading-relaxed font-medium">
                  Transformamos fuentes crudas en monólogos sonoros cinematográficos. Una IA de redacción soberana que entiende su intención profunda.
                </p>
              </div>
            </div>

            <div className="space-y-8 group">
              <div className="h-20 w-20 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-700 shadow-xl">
                <Database size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic font-serif leading-none">Bóveda NKV</h3>
                <p className="text-zinc-500 text-base leading-relaxed font-medium">
                  Cada peritaje alimenta su Bóveda de Capital Intelectual. La economía circular de datos genera un archivo de sabiduría perpetuo.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECCIÓN IV: DIMENSIONES DE SABIDURÍA (PREVISUALIZACIÓN) --- */}
      <section className="w-full py-40 container mx-auto max-w-7xl px-8 text-center isolate">
        <div className="mb-24 space-y-6">
          <p className="text-primary font-black uppercase tracking-[0.5em] text-[11px]">Cámaras de Aprendizaje</p>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none font-serif italic">
            EXPLORA LAS <span className="text-primary">DIMENSIONES</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {knowledgeUniversesCollection.map((universeCategoryItem) => (
            <div key={universeCategoryItem.identification} className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5 bg-zinc-900 group shadow-2xl transition-all hover:border-primary/40">
              <Image
                src={`/images/universes/${universeCategoryItem.identification}.png`}
                alt={universeCategoryItem.title}
                fill
                className="object-cover opacity-40 group-hover:scale-110 transition-all duration-[3000ms] group-hover:opacity-80" 
                sizes="(max-width: 768px) 100vw, 25vw" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-left z-20">
                <universeCategoryItem.IconComponent className="h-10 w-10 text-primary mb-6 opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-y-4 group-hover:translate-y-0" />
                <h4 className="text-2xl font-black uppercase tracking-tighter text-white mb-3 italic font-serif">{universeCategoryItem.title}</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                  {universeCategoryItem.descriptionDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN V: CIERRE DE CONVERSIÓN SOBERANA (FOOTER) --- */}
      <footer className="w-full py-32 border-t border-white/5 bg-black/60 text-center relative overflow-hidden isolate">
        {/* Resplandor de Bóveda Central */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 blur-[180px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-8 space-y-20 relative z-10">
          <div className="flex flex-col items-center gap-10">
            <div className="h-24 w-24 relative p-5 rounded-[2rem] bg-zinc-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform hover:scale-110 duration-700">
              <Image 
                src="/nicepod-logo.png" 
                alt="NicePod Intelligence Isotype" 
                fill 
                className="object-contain p-4" 
                unoptimized
              />
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-[calc(-0.05em)] uppercase italic text-white leading-[0.85] font-serif">
              Sé el <span className="text-primary not-italic">Testigo</span> <br /> de tu tiempo.
            </h2>
            <Link href="/signup">
              <Button size="lg" className="h-20 px-20 rounded-full font-black text-xl shadow-[0_25px_60px_rgba(var(--primary-rgb),0.4)] hover:scale-110 transition-all bg-white text-black uppercase tracking-widest">
                UNIRSE A LA RED
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] pt-12 border-t border-white/5">
            <div className="flex gap-12">
              <Link href="/pricing" className="hover:text-primary transition-colors">Suscripciones</Link>
              <Link href="/podcasts" className="hover:text-primary transition-colors">Bóveda Global</Link>
              <Link href="/geo" className="hover:text-primary transition-colors">Resonancia</Link>
            </div>
            <p className="italic text-[8px] opacity-40">© 2026 NICEPOD. MADRID RESONANCE V4.0. INTELLIGENCE SOVEREIGNTY.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Visual Integrity (Fix Error 400): Se forzó el uso del logo local ('/nicepod-logo.png') 
 *    con el atributo 'unoptimized' en el pie de página, erradicando los fallos de red 
 *    detectados en la consola de Vercel.
 * 2. Zero Abbreviations Policy: Se purificaron las colecciones de datos y sus iteradores, 
 *    elevando la semántica de marketing al estándar industrial (universeCategoryItem).
 * 3. Typography & Branding: Se inyectó la fuente 'serif' para consolidar la autoridad 
 *    de marca y la coherencia visual con la terminal de acceso.
 */