// components/create-flow/steps/draft-generation-loader.tsx
// VERSIÓN: 3.1 (Aurora Standard - High-Contrast Cognitive Loader)

"use client";

import { useEffect, useState, useRef } from "react";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Globe, PenTool, Sparkles, LibraryBig, Cpu } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DraftLoaderProps {
  formData: PodcastCreationData;
}

const PHASES = [
  {
    id: 0,
    title: "Investigación",
    desc: (topic: string) => `Extrayendo datos de resonancia sobre "${topic}"...`,
    icon: Globe,
    color: "text-blue-400",
    bg: "from-blue-500/20 to-transparent",
    targetProgress: 25,
    durationMs: 8000,
  },
  {
    id: 1,
    title: "Alineación",
    desc: (agent: string) => `Sincronizando el tono creativo con el ${agent}...`,
    icon: BrainCircuit,
    color: "text-purple-400",
    bg: "from-purple-500/20 to-transparent",
    targetProgress: 45,
    durationMs: 5000,
  },
  {
    id: 2,
    title: "Estructura",
    desc: () => "Arquitecturando el arco narrativo y puntos de valor...",
    icon: LibraryBig,
    color: "text-amber-400",
    bg: "from-amber-500/20 to-transparent",
    targetProgress: 70,
    durationMs: 10000,
  },
  {
    id: 3,
    title: "Redacción",
    desc: () => "Generando borrador final y validando bibliografía...",
    icon: PenTool,
    color: "text-green-400",
    bg: "from-green-500/20 to-transparent",
    targetProgress: 98,
    durationMs: 20000,
  }
];

export function DraftGenerationLoader({ formData }: DraftLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const startProgressRef = useRef<number>(0);

  const topic = formData.solo_topic || "tu idea";
  const agent = formData.agentName || "Especialista NicePod";

  useEffect(() => {
    const activePhase = PHASES[currentPhaseIndex];
    startTimeRef.current = Date.now();
    startProgressRef.current = progress;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const percentComplete = Math.min(elapsed / activePhase.durationMs, 1);
      const range = activePhase.targetProgress - startProgressRef.current;
      
      setProgress(startProgressRef.current + (range * percentComplete));

      if (percentComplete < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else if (currentPhaseIndex < PHASES.length - 1) {
        setCurrentPhaseIndex(prev => prev + 1);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [currentPhaseIndex]);

  const phase = PHASES[currentPhaseIndex];
  const Icon = phase.icon;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto p-4 text-center overflow-hidden">
      <div className={cn(
        "absolute inset-0 bg-gradient-radial opacity-30 blur-[120px] transition-colors duration-1000 ease-in-out pointer-events-none",
        phase.bg
      )} />

      <div className="relative z-10 w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="mb-12 relative"
          >
            <div className="absolute -inset-4 bg-white/5 rounded-full blur-xl animate-pulse" />
            <div className="relative p-8 bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl ring-1 ring-white/10">
              <Icon className={cn("h-16 w-16 transition-colors duration-500", phase.color)} strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 bg-primary rounded-full p-2 shadow-lg animate-bounce">
              <Cpu className="h-4 w-4 text-white" />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-3 mb-12 min-h-[120px]">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none">
            {phase.title}
          </h2>
          <p className="text-base text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
            {typeof phase.desc === 'function' ? phase.desc(phase.id === 0 ? topic : agent) : phase.desc}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-primary" 
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <span className="flex items-center gap-2">
               <Sparkles size={10} className="animate-pulse text-primary" />
               IA Generativa Activa
            </span>
            <span className="text-white/60">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}