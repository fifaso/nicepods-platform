/**
 * ARCHIVO: app/(marketing)/page.tsx
 * VERSIÓN: 6.0 (NicePod Marketing Canvas - Industrial Stability & Theme Sync)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar la visión técnica de NicePod en una interfaz de alto impacto,
 * garantizando la compatibilidad con el motor de temas y la integridad de datos.
 * [REFORMA V6.0]: Restauración de contenido completo, soporte para Modo Claro/Oscuro,
 * título axial y cumplimiento absoluto de la Zero Abbreviations Policy.
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
  Zap,
  LogIn,
  UserPlus,
  Map as MapIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * LandingPage: El orquestador visual del portal de inteligencia.
 */
export default function LandingPage() {

  // --- I. CONFIGURACIÓN DE CINEMÁTICA VISUAL (60 FPS FOCUS) ---
  const containerAnimationVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  };

  const itemAnimationVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  /**
   * knowledgeDimensionsCollection:
   * Mapeo de áreas de análisis con lenguaje técnico y descriptivo.
   */
  const knowledgeDimensionsCollection = [
    {
      identification: "deep-thought",
      title: "Pensamiento",
      IconComponent: BookOpen,
      descriptionDescription: "Análisis técnico de documentos complejos y teoría de sistemas."
    },
    {
      identification: "practical-tools",
      title: "Práctico",
      IconComponent: Zap,
      descriptionDescription: "Protocolos de optimización y herramientas de productividad industrial."
    },
    {
      identification: "tech",
      title: "Tecnología",
      IconComponent: BrainCircuit,
      descriptionDescription: "Arquitectura de software y avances en modelos de Inteligencia Artificial."
    },
    {
      identification: "narrative",
      title: "Narrativa",
      IconComponent: Globe,
      descriptionDescription: "Registro histórico y crónicas de geolocalización urbana en tiempo real."
    }
  ];

  return (
    <div className="flex flex-col items-center w-full bg-background text-foreground transition-colors duration-500 selection:bg-primary/30 antialiased">

      {/* --- SECCIÓN I: TERMINAL HERO (COMPACTA & ZERO-SCROLL READY) --- */}
      <section className="relative w-full flex flex-col items-center justify-center pt-12 pb-10 px-6 overflow-hidden">
        <motion.div
          className="container mx-auto max-w-7xl text-center space-y-6 relative z-10"
          variants={containerAnimationVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Título Monumental Unificado (Fuerza Industrial) */}
          <motion.h1
            variants={itemAnimationVariants}
            className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-[11rem] font-black tracking-tighter uppercase italic leading-none whitespace-nowrap"
          >
            SINTETIZA EL <span className="text-primary not-italic drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">MUNDO</span>
          </motion.h1>

          <motion.p
            variants={itemAnimationVariants}
            className="max-w-2xl mx-auto text-xs sm:text-sm md:text-xl text-muted-foreground font-bold uppercase tracking-[0.3em] leading-relaxed px-4"
          >
            Workstation profesional de captura y organización de conocimiento real mediante inteligencia artificial.
          </motion.p>
        </motion.div>
      </section>

      {/* --- SECCIÓN II: PORTAL GEOGRÁFICO (TACTICAL PREVIEW) --- */}
      <section className="w-full max-w-screen-xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative group cursor-pointer"
        >
          <Link href="/login" className="block relative aspect-video md:aspect-[21/9] rounded-[3rem] overflow-hidden border border-border bg-card shadow-2xl transition-all hover:border-primary/40 isolate">
            <div className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-1000">
              <MapPreviewFrame />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            
            {/* Indicador de Acción Minimalista */}
            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-foreground text-background px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3">
                    <MapIcon size={14} /> Acceder al Mapa
                </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* --- SECCIÓN III: COMANDOS DE ACCESO (AXIAL ALIGNMENT) --- */}
      <section className="w-full max-w-2xl mx-auto flex flex-row items-center justify-center gap-4 px-6 pb-32">
        <Link href="/signup" className="flex-1 max-w-[200px]">
          <Button size="lg" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <UserPlus size={16} className="mr-2" />
            Crear cuenta
          </Button>
        </Link>
        <Link href="/login" className="flex-1 max-w-[200px]">
          <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest border-border bg-card text-foreground hover:bg-accent transition-all active:scale-95">
            <LogIn size={16} className="mr-2" />
            Acceder
          </Button>
        </Link>
      </section>

      {/* --- SECCIÓN IV: PILARES DE INTELIGENCIA (RESTAURADO) --- */}
      <section className="w-full py-40 bg-accent/30 border-y border-border backdrop-blur-3xl">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            
            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-all duration-700 shadow-xl">
                <ShieldCheck size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Datos Verificados</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  NicePod utiliza fuentes técnicas para garantizar información precisa y libre de sesgos comerciales.
                </p>
              </div>
            </div>

            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-all duration-700 shadow-xl">
                <BrainCircuit size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Análisis por IA</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Transformamos grandes volúmenes de datos en crónicas de audio periciales adaptadas a tu nivel.
                </p>
              </div>
            </div>

            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-all duration-700 shadow-xl">
                <Database size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Bóveda de Capital</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Cada peritaje se organiza en tu archivo personal, generando un repositorio de sabiduría perpetuo.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECCIÓN V: DIMENSIONES DE CONOCIMIENTO (RESTAURADO) --- */}
      <section className="w-full py-40 container mx-auto max-w-7xl px-8 text-center isolate">
        <div className="mb-24 space-y-4">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none italic font-serif">
            EXPLORA LAS <span className="text-primary not-italic">DIMENSIONES</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {knowledgeDimensionsCollection.map((dimensionItem) => (
            <div key={dimensionItem.identification} className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-border bg-card group shadow-2xl transition-all hover:border-primary/40">
              <Image
                src={`/images/universes/${dimensionItem.identification}.png`}
                alt={dimensionItem.title}
                fill
                className="object-cover opacity-40 group-hover:scale-110 transition-all duration-[3000ms] group-hover:opacity-70" 
                sizes="(max-width: 768px) 100vw, 25vw" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-left z-20">
                <dimensionItem.IconComponent className="h-10 w-10 text-primary mb-6 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <h4 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-3 italic">{dimensionItem.title}</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-relaxed">
                  {dimensionItem.descriptionDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN VI: CIERRE DE CONVERSIÓN SOBERANA --- */}
      <footer className="w-full py-40 border-t border-border bg-card/60 text-center relative overflow-hidden isolate">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 blur-[180px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-8 space-y-16 relative z-10">
          <div className="flex flex-col items-center gap-10">
            <div className="h-24 w-24 relative p-5 rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl">
              <Image 
                src="/nicepod-logo.png" 
                alt="NicePod Intelligence Isotype" 
                fill 
                className="object-contain p-4" 
                unoptimized
              />
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] font-serif">
              Sé el <span className="text-primary not-italic">Testigo</span> <br /> de tu tiempo.
            </h2>
            <Link href="/signup">
              <Button size="lg" className="h-20 px-20 rounded-full font-black text-xl shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all bg-foreground text-background uppercase tracking-widest">
                Crear cuenta
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] pt-12 border-t border-border">
            <div className="flex gap-12">
              <Link href="/pricing" className="hover:text-primary transition-colors">Suscripciones</Link>
              <Link href="/podcasts" className="hover:text-primary transition-colors">Biblioteca</Link>
              <Link href="/map" className="hover:text-primary transition-colors">Mapa</Link>
            </div>
            <p className="italic opacity-40">© 2026 NICEPOD. MADRID RESONANCE V4.0.1.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Theme Awareness: Se eliminaron los fondos estáticos 'bg-[#010101]' sustituyéndolos 
 *    por la clase 'bg-background'. Esto asegura que el modo claro sea apreciable 
 *    mediante los tokens de diseño globales.
 * 2. Full Content Restoration: Se han re-integrado todas las secciones informativas 
 *    necesarias para proyectar la autoridad de NicePod como herramienta industrial.
 * 3. Zero Abbreviations Policy: Se purificó la nomenclatura de colecciones e 
 *    iconos, erradicando términos como 'uni', 'id', 'desc' y 'props'.
 */