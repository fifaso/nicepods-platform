// components/create-flow/draft-generation-loader.tsx
// VERSIÓN: 2.0 (Calibrated Timing: Weighted Phases Algorithm)

"use client";

import { useEffect, useState, useRef } from "react";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Globe, PenTool, Sparkles, LibraryBig } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DraftLoaderProps {
  formData: PodcastCreationData;
}

// Definición de las Fases con Tiempos Reales Calibrados
const PHASES = [
  {
    id: 0,
    title: "Investigación Global",
    desc: (topic: string) => `Analizando tendencias y datos sobre "${topic}"...`,
    icon: <Globe className="h-12 w-12 text-blue-500" />,
    color: "from-blue-500/20 to-blue-500/5",
    targetProgress: 35, // Llega hasta el 35%
    durationMs: 7000,   // En 7 segundos (Búsqueda suele ser rápida)
  },
  {
    id: 1,
    title: "Alineación de Agente",
    desc: (agent: string) => `Configurando la personalidad del ${agent}...`,
    icon: <BrainCircuit className="h-12 w-12 text-purple-500" />,
    color: "from-purple-500/20 to-purple-500/5",
    targetProgress: 50, // Salta al 50%
    durationMs: 2000,   // Muy rápido (Configuración interna)
  },
  {
    id: 2,
    title: "Arquitectura Narrativa",
    desc: () => "Organizando los puntos clave y el arco dramático...",
    icon: <LibraryBig className="h-12 w-12 text-amber-500" />,
    color: "from-amber-500/20 to-amber-500/5",
    targetProgress: 65, // Llega al 65%
    durationMs: 4000,   // Tiempo de pensamiento
  },
  {
    id: 3,
    title: "Redacción del Guion",
    desc: () => "Generando texto, citando fuentes y puliendo el estilo...",
    icon: <PenTool className="h-12 w-12 text-green-500" />,
    color: "from-green-500/20 to-green-500/5",
    targetProgress: 98, // Llega casi al final
    durationMs: 22000,  // La parte más larga (Generación de tokens)
  }
];

export function DraftGenerationLoader({ formData }: DraftLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  
  // Referencias para el bucle de animación
  const startTimeRef = useRef<number>(Date.now());
  const startProgressRef = useRef<number>(0);
  const rafRef = useRef<number>();

  const getMainTopic = () => {
    switch (formData.purpose) {
      case 'learn': return formData.solo_topic || "tu tema";
      case 'inspire': return formData.archetype_topic || "la idea";
      case 'explore': return "la conexión de temas";
      case 'answer': return "la respuesta";
      default: return "tu idea";
    }
  };

  const getAgentName = () => {
    return formData.purpose === 'inspire' ? formData.selectedArchetype : formData.selectedTone || "Narrador";
  };

  useEffect(() => {
    const activePhase = PHASES[currentPhaseIndex];
    
    // Resetear tiempos al cambiar de fase
    startTimeRef.current = Date.now();
    startProgressRef.current = progress;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const phaseDuration = activePhase.durationMs;
      
      // Cálculo lineal dentro de la fase actual
      const percentComplete = Math.min(elapsed / phaseDuration, 1);
      
      // Interpolación: Desde donde estábamos -> Hasta el objetivo de la fase
      const progressRange = activePhase.targetProgress - startProgressRef.current;
      const currentCalculatedProgress = startProgressRef.current + (progressRange * percentComplete);

      setProgress(currentCalculatedProgress);

      if (percentComplete < 1) {
        // Si no hemos terminado la fase, seguir animando
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Si la fase terminó, pasar a la siguiente (si existe)
        if (currentPhaseIndex < PHASES.length - 1) {
          setCurrentPhaseIndex(prev => prev + 1);
        }
        // Si es la última fase, se queda en 98% esperando a la API
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [currentPhaseIndex]); // Dependencia: Se reinicia el efecto cada vez que cambia la fase

  const phaseData = PHASES[currentPhaseIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center animate-in fade-in duration-700 relative overflow-hidden">
      
      {/* Fondo Ambiental Dinámico */}
      <div className={`absolute inset-0 bg-gradient-radial ${phaseData.color} opacity-40 blur-3xl transition-colors duration-1000 ease-in-out`} />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        
        {/* Icono Pulsante */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseData.id}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8 p-6 bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-full border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] ring-1 ring-white/30"
          >
            {phaseData.icon}
          </motion.div>
        </AnimatePresence>

        {/* Textos con Transición Suave */}
        <div className="space-y-3 mb-10 min-h-[6rem]">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground transition-all duration-500">
              {phaseData.title}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed px-4 transition-all duration-500 animate-pulse">
              {typeof phaseData.desc === 'function' 
                ? phaseData.desc(phaseData.id === 0 ? getMainTopic() : getAgentName()!) 
                : phaseData.desc}
            </p>
        </div>

        {/* Barra de Progreso de Alta Precisión */}
        <div className="w-full space-y-2">
            <Progress 
                value={progress} 
                className="h-2 w-full transition-all duration-100 ease-linear" // ease-linear para fluidez controlada por JS
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-widest px-1">
                <span className={progress > 90 ? "text-primary font-bold transition-colors" : ""}>
                    {progress > 95 ? "Finalizando..." : "Procesando"}
                </span>
                <span>{Math.round(progress)}%</span>
            </div>
        </div>

        {/* Tip Flotante */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-12 p-3 px-5 bg-secondary/40 rounded-full border border-border/50 backdrop-blur-sm"
        >
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/90">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium">Estamos creando algo único para ti</span>
            </div>
        </motion.div>

      </div>
    </div>
  );
}