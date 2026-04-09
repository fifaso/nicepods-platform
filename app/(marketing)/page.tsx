/**
 * ARCHIVO: app/(marketing)/page.tsx
 * VERSIÓN: 6.1 (NicePod Marketing Canvas - Industrial Desktop Harmony Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar la identidad de la Workstation eliminando las fugas de hidratación
 * (Errores #418/#422) y optimizando el escalado visual para pantallas de alta densidad.
 * [REFORMA V6.1]: Erradicación de anidamiento ilegal de enlaces (Hydration Fix),
 * ajuste de proporciones de título para Desktop y protección de la vista móvil.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { MapPreviewFrame } from "@/components/geo/map-preview-frame";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BookOpen,
  BrainCircuit,
  Database,
  Globe,
  LogIn,
  Map as MapIcon,
  ShieldCheck,
  UserPlus,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * LandingPage: El punto de contacto inicial de alta fidelidad.
 */
export default function LandingPage() {
  const navigationRouter = useRouter();

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
      dimensionDescription: "Análisis técnico de documentos complejos y teoría de sistemas."
    },
    {
      identification: "practical-tools",
      title: "Práctico",
      IconComponent: Zap,
      dimensionDescription: "Protocolos de optimización y herramientas de productividad industrial."
    },
    {
      identification: "tech",
      title: "Tecnología",
      IconComponent: BrainCircuit,
      dimensionDescription: "Arquitectura de software y avances en modelos de Inteligencia Artificial."
    },
    {
      identification: "narrative",
      title: "Narrativa",
      IconComponent: Globe,
      dimensionDescription: "Registro histórico y crónicas de geolocalización urbana en tiempo real."
    }
  ];

  /**
   * handleMapInteractionAction:
   * Misión: Navegación programática para evitar el error de hidratación #418 
   * causado por la anidación de etiquetas <a>.
   */
  const handleMapInteractionAction = () => {
    navigationRouter.push("/login");
  };

  return (
    <div className="flex flex-col items-center w-full bg-background text-foreground transition-colors duration-500 selection:bg-primary/30 antialiased">

      {/* 
          --- SECCIÓN I: TERMINAL HERO (ZERO-SCROLL ARCHITECTURE) ---
          Misión: Forzar que el Título, Descripción, Mapa y Botones convivan en 
          el 100% de la altura del dispositivo sin requerir desplazamiento.
      */}
      <section className="relative w-full h-[100dvh] flex flex-col items-center justify-between pt-16 pb-6 px-4">

        {/* BLOQUE A: TITULAR MONUMENTAL Y DESCRIPCIÓN */}
        <motion.div
          className="shrink-0 text-center space-y-4 relative z-10 w-full max-w-5xl mx-auto px-2"
          variants={containerAnimationVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 
              [FIX V6.1]: Ajuste de tamaño de fuente para Desktop (md:text-7xl lg:text-8xl)
              Esto evita la hipertrofia visual en pantallas grandes mientras mantiene 
              la estética en móviles.
          */}
          <motion.h1
            variants={itemAnimationVariants}
            className="text-[2.5rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-none text-foreground whitespace-nowrap italic"
          >
            SINTETIZA EL <span className="text-primary not-italic drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]">MUNDO</span>
          </motion.h1>

          {/* Descripción Técnica de Alta Densidad */}
          <motion.p
            variants={itemAnimationVariants}
            className="max-w-2xl mx-auto text-[10px] sm:text-sm md:text-base text-muted-foreground font-bold uppercase tracking-[0.3em] leading-relaxed px-4"
          >
            Workstation profesional de captura, análisis y organización de conocimiento real mediante inteligencia artificial y geolocalización.
          </motion.p>
        </motion.div>

        {/* 
            BLOQUE B: REACTOR VISUAL (CLEAN MAP GATEWAY) 
            [FIX V6.1]: Expansión controlada en Desktop (md:max-h-[500px]) para llenar el espacio.
            Se sustituye <Link> por <div> con onClick para aniquilar el error de hidratación.
        */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 w-full max-w-5xl mx-auto min-h-0 py-6 relative group"
        >
          <div
            onClick={handleMapInteractionAction}
            className="block w-full h-full max-h-[380px] md:max-h-[500px] mx-auto relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-border bg-card shadow-2xl transition-all duration-700 hover:border-primary/50 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] isolate cursor-pointer"
            title="Acceder a la Malla Activa"
          >
            {/* Motor WebGL Purificado (Pointer-events-none para delegar el clic al padre) */}
            <div className="absolute inset-0 z-0 opacity-70 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
              <MapPreviewFrame />
            </div>

            {/* Gradiente de Sellado: Funde el mapa con el fondo dinámico del tema */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent z-10 pointer-events-none" />

            {/* Indicador de Acción Minimalista (Solo visible en Hover) */}
            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="bg-foreground text-background px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-2xl flex items-center gap-3">
                <MapIcon size={14} /> Acceder al Mapa
              </div>
            </div>
          </div>
        </motion.div>

        {/* 
            BLOQUE C: COMANDOS DE ACCESO (AXIAL ALIGNMENT) 
            [FIX V6.1]: Uso de 'asChild' en los botones para mantener semántica HTML válida
            y evitar errores de hidratación por anidamiento de <button> en <a>.
        */}
        <motion.div
          variants={itemAnimationVariants}
          initial="hidden"
          animate="visible"
          className="shrink-0 flex flex-row items-center justify-center gap-3 md:gap-5 w-full max-w-lg z-10 pt-2 pb-4"
        >
          <Button asChild size="lg" className="flex-1 w-full h-14 md:h-16 rounded-2xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
            <Link href="/signup">
              <UserPlus size={16} className="mr-2 hidden xs:block" />
              Crear cuenta
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="flex-1 w-full h-14 md:h-16 rounded-2xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest border-border bg-card text-foreground hover:bg-accent transition-all active:scale-95">
            <Link href="/login">
              <LogIn size={16} className="mr-2 hidden xs:block" />
              Acceder
            </Link>
          </Button>
        </motion.div>

      </section>

      {/* --- SECCIÓN II: PILARES DE INTELIGENCIA INDUSTRIAL --- */}
      <section className="w-full py-32 md:py-40 bg-secondary/30 border-y border-border backdrop-blur-3xl transition-colors duration-700">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">

            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-all duration-700 shadow-xl">
                <ShieldCheck size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none text-foreground">Datos Verificados</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  NicePod utiliza fuentes técnicas para garantizar información precisa, validada y libre de sesgos comerciales.
                </p>
              </div>
            </div>

            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-all duration-700 shadow-xl">
                <BrainCircuit size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none text-foreground">Análisis por IA</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Transformamos grandes volúmenes de datos en crónicas de audio periciales adaptadas a su nivel técnico.
                </p>
              </div>
            </div>

            <div className="space-y-6 group">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-all duration-700 shadow-xl">
                <Database size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none text-foreground">Bóveda de Capital</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  Cada peritaje se organiza en su archivo personal, generando un repositorio de sabiduría perpetuo y consultable.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECCIÓN III: DIMENSIONES DE CONOCIMIENTO --- */}
      <section className="w-full py-32 md:py-40 container mx-auto max-w-7xl px-6 md:px-8 text-center isolate">
        <div className="mb-20 md:mb-24 space-y-4">
          <h2 className="text-4xl xs:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none italic text-foreground">
            EXPLORA LAS <span className="text-primary not-italic">DIMENSIONES</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {knowledgeDimensionsCollection.map((dimensionItem) => (
            <div key={dimensionItem.identification} className="relative aspect-[4/5] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-border bg-card group shadow-2xl transition-all hover:border-primary/40">
              <Image
                src={`/images/universes/${dimensionItem.identification}.png`}
                alt={dimensionItem.title}
                fill
                className="object-cover opacity-30 group-hover:scale-110 transition-all duration-[3000ms] group-hover:opacity-60"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />

              <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end text-left z-20">
                <dimensionItem.IconComponent className="h-8 w-8 md:h-10 md:w-10 text-primary mb-4 md:mb-6 opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-y-4 group-hover:translate-y-0" />
                <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-foreground mb-2 md:mb-3 italic">{dimensionItem.title}</h4>
                <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-relaxed">
                  {dimensionItem.dimensionDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN IV: CIERRE DE CONVERSIÓN SOBERANA --- */}
      <footer className="w-full py-40 border-t border-border bg-secondary/20 text-center relative overflow-hidden isolate transition-colors duration-700">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-8 space-y-16 relative z-10">
          <div className="flex flex-col items-center gap-10">
            <div className="h-20 w-20 md:h-24 md:w-24 relative p-4 md:p-5 rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl transition-transform hover:scale-110 duration-700">
              <Image
                src="/nicepod-logo.png"
                alt="NicePod Intelligence Isotype"
                fill
                className="object-contain p-3 md:p-4"
                unoptimized
              />
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter uppercase italic text-foreground leading-[0.85] font-serif">
              Sé el <span className="text-primary not-italic">Testigo</span> <br /> de tu tiempo.
            </h2>
            <Button asChild size="lg" className="h-16 md:h-20 px-12 md:px-20 rounded-full font-black text-sm md:text-xl shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all bg-foreground text-background uppercase tracking-widest">
              <Link href="/signup">
                CREAR CUENTA
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] pt-12 border-t border-border">
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              <Link href="/pricing" className="hover:text-primary transition-colors">Planes</Link>
              <Link href="/podcasts" className="hover:text-primary transition-colors">Biblioteca</Link>
              <Link href="/map" className="hover:text-primary transition-colors">Mapa</Link>
            </div>
            <p className="italic text-[7px] md:text-[8px] opacity-50">
              © 2026 NICEPOD. MADRID RESONANCE V4.0.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}