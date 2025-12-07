// components/create-flow/draft-generation-loader.tsx
"use client";

import { useEffect, useState } from "react";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Globe, PenTool, Sparkles, Search, LibraryBig } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DraftLoaderProps {
  formData: PodcastCreationData;
}

export function DraftGenerationLoader({ formData }: DraftLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Lógica para extraer el tema principal según el propósito
  const getMainTopic = () => {
    switch (formData.purpose) {
      case 'learn': return formData.solo_topic || "tu tema";
      case 'inspire': return formData.archetype_topic || "la idea";
      case 'explore': return `${formData.link_topicA} y ${formData.link_topicB}`;
      case 'answer': return "la pregunta";
      default: return "tu idea";
    }
  };

  const getAgentName = () => {
    return formData.purpose === 'inspire' ? formData.selectedArchetype : formData.selectedTone;
  };

  // Fases del proceso (Storytelling)
  const phases = [
    {
      icon: <Globe className="h-12 w-12 text-blue-500" />,
      title: "Iniciando Investigación Global",
      desc: `Buscando fuentes verificadas sobre "${getMainTopic()}"...`,
      color: "from-blue-500/20 to-blue-500/5"
    },
    {
      icon: <BrainCircuit className="h-12 w-12 text-purple-500" />,
      title: `Activando Agente: ${getAgentName()}`,
      desc: "Analizando la información con el tono y profundidad seleccionados.",
      color: "from-purple-500/20 to-purple-500/5"
    },
    {
      icon: <LibraryBig className="h-12 w-12 text-amber-500" />,
      title: "Estructurando Narrativa",
      desc: `Organizando los puntos clave para una duración de ${formData.duration}.`,
      color: "from-amber-500/20 to-amber-500/5"
    },
    {
      icon: <PenTool className="h-12 w-12 text-green-500" />,
      title: "Redactando Borrador Final",
      desc: "Escribiendo el guion y citando fuentes científicas...",
      color: "from-green-500/20 to-green-500/5"
    }
  ];

  // Simulación de Progreso (Truco de UX)
  // Avanza rápido al principio, y se ralentiza al final para esperar a la API real.
  useEffect(() => {
    const duration = 35000; // 35 segundos estimados
    const intervalTime = 100;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      
      // Curva logarítmica inversa: Rápido al inicio, lento al final
      // Nunca llega a 100% hasta que la API responda y el componente se desmonte
      const rawProgress = (currentStep / steps) * 100;
      const easedProgress = Math.min(rawProgress * 1.1, 95); 

      setProgress(easedProgress);

      // Cambiar fases basado en el progreso
      if (easedProgress < 25) setPhaseIndex(0);
      else if (easedProgress < 50) setPhaseIndex(1);
      else if (easedProgress < 75) setPhaseIndex(2);
      else setPhaseIndex(3);

    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const currentPhase = phases[phaseIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center animate-in fade-in duration-700">
      
      {/* Círculo de Fondo Animado */}
      <div className={`absolute inset-0 bg-gradient-radial ${currentPhase.color} opacity-50 blur-3xl transition-colors duration-1000`} />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        
        {/* Icono Cambiante */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIndex}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="mb-8 p-6 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl ring-1 ring-white/20"
          >
            {currentPhase.icon}
          </motion.div>
        </AnimatePresence>

        {/* Textos */}
        <div className="space-y-2 mb-8 min-h-[5rem]">
            <h3 className="text-2xl font-bold tracking-tight text-foreground transition-all duration-300">
              {currentPhase.title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed px-4 transition-all duration-300">
              {currentPhase.desc}
            </p>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full space-y-2">
            <Progress value={progress} className="h-2 w-full transition-all duration-300" />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                <span>Procesando</span>
                <span>{Math.round(progress)}%</span>
            </div>
        </div>

        {/* Tip Aleatorio (Opcional, para dar encanto) */}
        <div className="mt-12 p-3 bg-secondary/30 rounded-lg border border-border/50 backdrop-blur-sm max-w-xs">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80 mb-1">
                <Sparkles className="h-3 w-3" />
                <span className="font-bold">IA Trabajando</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60">
                Estamos consultando fuentes en tiempo real para fundamentar tu guion.
            </p>
        </div>

      </div>
    </div>
  );
}