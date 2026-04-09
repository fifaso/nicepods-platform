/**
 * ARCHIVO: app/(marketing)/page.tsx
 * VERSIÓN: 4.0 (NicePod Marketing Canvas - Industrial Grade Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar NicePod como una herramienta técnica de peritaje y análisis,
 * eliminando la ambigüedad narrativa y optimizando el flujo de conversión.
 * [REFORMA V4.0]: Unificación tipográfica, simplificación de vocabulario, 
 * re-ordenación del Hero y mapa como disparador de autenticación.
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
  Map as MapIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * LandingPage: El punto de contacto inicial con la Workstation.
 */
export default function LandingPage() {

  // --- I. CONFIGURACIÓN DE ANIMACIÓN (PERFORMANCE FOCUS) ---
  const containerAnimationVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 }
    }
  };

  const itemAnimationVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  /**
   * knowledgeDimensionsCollection:
   * Mapeo de áreas de análisis con lenguaje técnico directo.
   */
  const knowledgeDimensionsCollection = [
    {
      identification: "deep-thought",
      title: "Pensamiento",
      IconComponent: BookOpen,
      descriptionDescription: "Análisis técnico de documentos y teoría de sistemas."
    },
    {
      identification: "practical-tools",
      title: "Práctico",
      IconComponent: Zap,
      descriptionDescription: "Protocolos de optimización y herramientas de productividad."
    },
    {
      identification: "tech",
      title: "Tecnología",
      IconComponent: BrainCircuit,
      descriptionDescription: "Desarrollo de software y avances en Inteligencia Artificial."
    },
    {
      identification: "narrative",
      title: "Narrativa",
      IconComponent: Globe,
      descriptionDescription: "Registro histórico y crónicas de geolocalización urbana."
    }
  ];

  return (
    <div className="flex flex-col items-center w-full selection:bg-primary/30 antialiased">

      {/* --- SECCIÓN I: TERMINAL DE ENTRADA (HERO) --- */}
      <section className="relative w-full flex flex-col items-center justify-center pt-20 pb-16 px-6">
        <motion.div
          className="container mx-auto max-w-5xl text-center space-y-8 relative z-10"
          variants={containerAnimationVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Título de Impacto: Unificado con estilo Login */}
          <motion.h1
            variants={itemAnimationVariants}
            className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-[calc(-0.06em)] leading-[0.85] text-white uppercase italic"
          >
            SINTETIZA EL <br />
            <span className="text-primary not-italic drop-shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)]">MUNDO</span>
          </motion.h1>

          {/* Descripción Industrial Simple */}
          <motion.p
            variants={itemAnimationVariants}
            className="max-w-3xl mx-auto text-base lg:text-xl text-zinc-500 font-bold uppercase tracking-widest leading-relaxed px-6"
          >
            La Workstation profesional para capturar, analizar y organizar el conocimiento del mundo real mediante inteligencia artificial y geolocalización.
          </motion.p>
        </motion.div>
      </section>

      {/* --- SECCIÓN II: VISOR GEOGRÁFICO (TACTICAL GATEWAY) --- */}
      <section className="w-full max-w-screen-xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative group cursor-pointer"
        >
          <Link href="/login" className="block relative aspect-video md:aspect-[21/9] rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl transition-all hover:border-primary/40 isolate">
            {/* Motor WebGL en estado de previsualización */}
            <div className="absolute inset-0 z-0 opacity-60 group-hover:opacity-80 transition-opacity duration-1000">
              <MapPreviewFrame />
            </div>

            {/* Overlay Táctico de Acceso */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-transparent to-transparent z-10" />
            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-white text-black px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3">
                    <MapIcon size={14} /> Acceder al Mapa
                </div>
            </div>

            <div className="absolute bottom-10 left-10 z-20 text-left">
                <p className="text-white font-black text-2xl uppercase tracking-tighter italic leading-none">
                    Malla de Contexto Activa
                </p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mt-2">
                    Madrid: Registro de Inteligencia Industrial
                </p>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* --- SECCIÓN III: ACCIONES DE REGISTRO (AUTH) --- */}
      <section className="pb-32 w-full flex flex-col sm:flex-row items-center justify-center gap-6 px-6">
        <Link href="/signup" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto h-16 px-16 rounded-2xl text-base font-black uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl shadow-primary/20">
            Crear cuenta
          </Button>
        </Link>
        <Link href="/login" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-16 rounded-2xl text-base font-black uppercase tracking-widest border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all">
            Acceder
          </Button>
        </Link>
      </section>

      {/* --- SECCIÓN IV: CAPACIDADES TÉCNICAS (PILLARS) --- */}
      <section className="w-full py-40 bg-[#050505] border-y border-white/5 backdrop-blur-3xl">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            
            <div className="space-y-6">
              <ShieldCheck size={40} className="text-primary" />
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic leading-none">Análisis de Datos</h3>
              <p className="text-zinc-500 text-base leading-relaxed font-medium">
                NicePod utiliza fuentes técnicas y documentos científicos para garantizar información verificada y libre de opiniones.
              </p>
            </div>

            <div className="space-y-6">
              <BrainCircuit size={40} className="text-primary" />
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic leading-none">Resumen Inteligente</h3>
              <p className="text-zinc-500 text-base leading-relaxed font-medium">
                Procesamos grandes volúmenes de datos para generar crónicas de audio precisas, adaptadas a tu nivel de análisis.
              </p>
            </div>

            <div className="space-y-6">
              <Database size={40} className="text-primary" />
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic leading-none">Bóveda de Sabiduría</h3>
              <p className="text-zinc-500 text-base leading-relaxed font-medium">
                Cada captura se organiza en una base de datos personal, creando un archivo de conocimiento disponible en cualquier momento.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECCIÓN V: DIMENSIONES DE APRENDIZAJE --- */}
      <section className="w-full py-40 container mx-auto max-w-7xl px-8 text-center">
        <div className="mb-24 space-y-4">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none italic">
            EXPLORA LAS <span className="text-primary not-italic">DIMENSIONES</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {knowledgeDimensionsCollection.map((dimensionItem) => (
            <div key={dimensionItem.identification} className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5 bg-zinc-900 group shadow-2xl transition-all hover:border-primary/40">
              <Image
                src={`/images/universes/${dimensionItem.identification}.png`}
                alt={dimensionItem.title}
                fill
                className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-[3000ms] group-hover:opacity-60" 
                sizes="(max-width: 768px) 100vw, 25vw" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-[#010101]/20 to-transparent z-10" />
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-left z-20">
                <dimensionItem.IconComponent className="h-10 w-10 text-primary mb-6" />
                <h4 className="text-2xl font-black uppercase tracking-tighter text-white mb-3 italic">{dimensionItem.title}</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                  {dimensionItem.descriptionDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN VI: CIERRE DE CONVERSIÓN --- */}
      <footer className="w-full py-40 border-t border-white/5 bg-black/60 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 blur-[180px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-8 space-y-16 relative z-10">
          <div className="flex flex-col items-center gap-12">
            <div className="h-24 w-24 relative p-5 rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl">
              <Image src="/nicepod-logo.png" alt="NicePod" fill className="object-contain p-4" unoptimized />
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white leading-[0.85]">
              Sé el <span className="text-primary">Testigo</span> <br /> de tu tiempo.
            </h2>
            <Link href="/signup">
              <Button size="lg" className="h-20 px-20 rounded-full font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all bg-white text-black uppercase tracking-widest">
                Crear cuenta
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] pt-12 border-t border-white/5">
            <div className="flex gap-12">
              <Link href="/pricing" className="hover:text-primary transition-colors">Suscripciones</Link>
              <Link href="/podcasts" className="hover:text-primary transition-colors">Biblioteca</Link>
              <Link href="/map" className="hover:text-primary transition-colors">Mapa</Link>
            </div>
            <p className="italic opacity-40">© 2026 NICEPOD. PROTOCOLO NCIS V4.0. MADRID RESONANCE.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Industrial Typography: Se eliminó el uso de fuentes serif secundarias para 
 *    unificar el lenguaje de diseño con la terminal de acceso (Login).
 * 2. Lexical Normalization: Se simplificaron los textos de marketing, eliminando 
 *    vocabulario rebuscado para proyectar claridad técnica.
 * 3. Conversion Gateway: El mapa actúa ahora como un punto de interés interactivo 
 *    que dirige al login, eliminando botones redundantes sobre el visor WebGL.
 * 4. Zero Abbreviations Policy: Purificación absoluta de la nomenclatura interna 
 *    del componente (knowledgeDimensionsCollection, IconComponent).
 */