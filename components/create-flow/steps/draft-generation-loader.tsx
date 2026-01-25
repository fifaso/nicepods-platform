// components/create-flow/steps/draft-generation-loader.tsx
// VERSIÓN: 4.1 (Realtime Monitor - Phase Sync & Data Ingestion)

"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Cpu, Globe, Loader2, SearchCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";

interface DraftLoaderProps {
  formData: PodcastCreationData;
}

// Mapeo preciso entre estado de DB y fase visual del array PHASES
const STATUS_MAP: Record<string, number> = {
  'researching': 0,
  'writing': 1,
  'ready': 2
};

const PHASES = [
  {
    id: 0,
    title: "Investigación",
    desc: (topic: string) => `Extrayendo inteligencia académica sobre "${topic}"...`,
    icon: Globe,
    color: "text-blue-400",
    bg: "from-blue-500/20 to-transparent",
    targetProgress: 35,
  },
  {
    id: 1,
    title: "Redacción",
    desc: (agent: string) => `El ${agent} está estructurando la narrativa estratégica...`,
    icon: BrainCircuit,
    color: "text-purple-400",
    bg: "from-purple-500/20 to-transparent",
    targetProgress: 75,
  },
  {
    id: 2,
    title: "Finalización",
    desc: () => "Integrando fuentes y validando veracidad...",
    icon: SearchCheck,
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-transparent",
    targetProgress: 98,
  }
];

export function DraftGenerationLoader({ formData }: DraftLoaderProps) {
  const supabase = createClient();
  const { transitionTo } = useCreationContext();
  const { setValue } = useFormContext();

  const [progress, setProgress] = useState(10);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  const draftId = formData.draft_id;
  const topic = formData.solo_topic || "tu idea";
  const agentName = formData.agentName || "Especialista NicePod";

  useEffect(() => {
    if (!draftId) return;

    // 1. SUSCRIPCIÓN REALTIME AL BORRADOR (Cerebro de la UI)
    const channel = supabase
      .channel(`draft_monitor_${draftId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'podcast_drafts', filter: `id=eq.${draftId}` },
        (payload: any) => {
          const status = payload.new.creation_data?.status;
          const mappedIndex = STATUS_MAP[status];

          if (mappedIndex !== undefined) {
            setCurrentPhaseIndex(mappedIndex);
          }

          if (status === 'ready') {
            setProgress(100);
            const scriptData = payload.new.script_text;

            // Hidratamos el formulario con los resultados finales de la IA
            setValue("final_title", payload.new.title);
            setValue("final_script", scriptData.script_body || String(scriptData));
            setValue("sources", payload.new.sources || []);

            setTimeout(() => transitionTo("SCRIPT_EDITING"), 1000);
          }
        }
      )
      .subscribe();

    // 2. POLLING DE SEGURIDAD (Red de protección contra micro-cortes)
    const safetyCheck = setInterval(async () => {
      const { data } = await supabase.from('podcast_drafts').select('creation_data, script_text, title, sources').eq('id', draftId).single();
      if (data?.creation_data?.status === 'ready') {
        setValue("final_title", data.title);
        setValue("final_script", data.script_text.script_body || data.script_text);
        setValue("sources", data.sources || []);
        transitionTo("SCRIPT_EDITING");
      }
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(safetyCheck);
    };
  }, [draftId, supabase, transitionTo, setValue]);

  // Animación suave de progreso visual
  useEffect(() => {
    const target = PHASES[currentPhaseIndex].targetProgress;
    const tick = setInterval(() => {
      setProgress(prev => (prev < target ? prev + 0.3 : prev));
    }, 150);
    return () => clearInterval(tick);
  }, [currentPhaseIndex]);

  const phase = PHASES[currentPhaseIndex];
  const Icon = phase.icon;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto p-6 text-center overflow-hidden relative">
      <div className={cn("absolute inset-0 bg-gradient-radial opacity-30 blur-[120px] transition-all duration-1000", phase.bg)} />

      <div className="relative z-10 w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase.title}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="mb-10 relative"
          >
            <div className="relative p-8 bg-zinc-900/50 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl">
              <Icon className={cn("h-16 w-16 transition-colors duration-700", phase.color)} strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 bg-primary rounded-full p-2 shadow-lg animate-bounce">
              <Cpu className="h-4 w-4 text-white" />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-3 mb-10 min-h-[100px]">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
            {phase.title}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xs mx-auto">
            {typeof phase.desc === 'function' ? phase.desc(currentPhaseIndex === 0 ? topic : agentName) : phase.desc}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
            <span className="flex items-center gap-2">
              <Loader2 size={10} className="animate-spin text-primary" />
              Sintonía Asíncrona
            </span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}