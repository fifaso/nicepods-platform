// components/create-flow/steps/draft-generation-loader.tsx
// VERSIÓN: 4.6 (Production Master - Realtime Sync & UI Integrity Fix)

"use client";

import { Button } from "@/components/ui/button"; // [FIX]: Importación restaurada
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BrainCircuit,
  Cpu,
  Globe,
  Loader2,
  PenTool,
  SearchCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";

interface DraftLoaderProps {
  formData: PodcastCreationData;
}

/**
 * STATUS_MAP: Mapeo oficial de estados de la DB a índices de animación.
 */
const STATUS_MAP: Record<string, number> = {
  'researching': 0,
  'writing': 1,
  'ready': 2,
  'failed': -1
};

/**
 * PHASES: Definición de la narrativa visual de carga.
 */
const PHASES = [
  {
    id: 0,
    title: "Investigación",
    status: 'researching',
    desc: (topic: string) => `Analizando papers y señales académicas sobre "${topic}"...`,
    icon: Globe,
    color: "text-blue-400",
    bg: "from-blue-600/20 to-transparent",
    targetProgress: 35,
  },
  {
    id: 1,
    title: "Redacción Pro",
    status: 'writing',
    desc: (agent: string) => `El ${agent} está estructurando tu narrativa estratégica...`,
    icon: BrainCircuit,
    color: "text-purple-400",
    bg: "from-purple-500/20 to-transparent",
    targetProgress: 75,
  },
  {
    id: 2,
    title: "Finalización",
    status: 'ready',
    desc: () => "Validando veracidad y preparando el lienzo de edición...",
    icon: SearchCheck,
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-transparent",
    targetProgress: 100,
  }
];

export function DraftGenerationLoader({ formData }: DraftLoaderProps) {
  const supabase = createClient();
  const { transitionTo } = useCreationContext();
  const { setValue } = useFormContext();

  const [progress, setProgress] = useState(10);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const draftId = formData.draft_id;
  const topic = formData.solo_topic || "tu idea";
  const agentName = formData.agentName || "Especialista NicePod";

  /**
   * finalizeIngestion
   * Inyecta los resultados finales de la IA en el formulario global.
   */
  const finalizeIngestion = (data: any) => {
    setProgress(100);

    // Extracción segura del cuerpo del guion
    const rawScript = data.script_text;
    const scriptBody = rawScript?.script_body || (typeof rawScript === 'string' ? rawScript : "");
    const sources = data.sources || [];
    const title = data.title || topic;

    // Persistencia en el Store de React Hook Form
    setValue("final_title", title, { shouldValidate: true });
    setValue("final_script", scriptBody, { shouldValidate: true });
    setValue("sources", sources, { shouldValidate: true });

    // Transición suave al editor tras la ingesta exitosa
    setTimeout(() => {
      transitionTo("SCRIPT_EDITING");
    }, 1200);
  };

  useEffect(() => {
    if (!draftId) {
      setIsError(true);
      setErrorMessage("Error de sesión: No se encontró el ID del borrador.");
      return;
    }

    console.log(`📡 [Loader] Vigilancia Realtime activa para Borrador #${draftId}`);

    // 1. SUSCRIPCIÓN REALTIME (Escucha directa a la tabla podcast_drafts)
    const channel = supabase
      .channel(`draft_vanguard_${draftId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'podcast_drafts', filter: `id=eq.${draftId}` },
        (payload: any) => {
          const status = payload.new.status;

          if (status === 'failed') {
            setIsError(true);
            setErrorMessage("La IA encontró un obstáculo crítico en la síntesis.");
            return;
          }

          const mappedIndex = STATUS_MAP[status];
          if (mappedIndex !== undefined && mappedIndex !== -1) {
            setCurrentPhaseIndex(mappedIndex);
          }

          if (status === 'ready') {
            finalizeIngestion(payload.new);
          }
        }
      )
      .subscribe();

    // 2. POLLING DE SEGURIDAD (Red de protección asíncrona)
    const safetyCheck = setInterval(async () => {
      const { data, error } = await supabase
        .from('podcast_drafts')
        .select('*')
        .eq('id', draftId)
        .single();

      if (!error && data) {
        if (data.status === 'ready') {
          finalizeIngestion(data);
          clearInterval(safetyCheck);
        } else if (data.status === 'failed') {
          setIsError(true);
          setErrorMessage("El proceso de investigación fue interrumpido.");
          clearInterval(safetyCheck);
        } else {
          const mappedIndex = STATUS_MAP[data.status];
          if (mappedIndex !== undefined) setCurrentPhaseIndex(mappedIndex);
        }
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(safetyCheck);
    };
  }, [draftId, supabase, transitionTo, setValue, topic]);

  // 3. ANIMACIÓN DE PROGRESO "SMOOTH"
  useEffect(() => {
    if (isError) return;
    const target = PHASES[currentPhaseIndex]?.targetProgress || 95;
    const interval = setInterval(() => {
      setProgress(prev => (prev < target ? prev + 0.2 : prev));
    }, 100);
    return () => clearInterval(interval);
  }, [currentPhaseIndex, isError, progress]);

  const phase = PHASES[currentPhaseIndex] || PHASES[0];
  const Icon = phase.icon;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-in fade-in">
        <div className="p-6 bg-red-500/10 rounded-full border border-red-500/20 shadow-xl">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Falla de Sincronía</h3>
          <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm">{errorMessage}</p>
        </div>
        <Button
          onClick={() => transitionTo('SELECTING_PURPOSE')}
          variant="outline"
          className="border-white/10 rounded-xl uppercase font-black text-[10px] tracking-widest hover:bg-white/5"
        >
          Reiniciar Creación
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto p-6 text-center overflow-hidden relative">

      {/* CAPA ATMOSFÉRICA */}
      <div className={cn(
        "absolute inset-0 bg-gradient-radial opacity-30 blur-[120px] transition-all duration-1000",
        phase.bg
      )} />

      <div className="relative z-10 w-full flex flex-col items-center">

        {/* ORBE DE PROCESAMIENTO */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase.title}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="mb-10 relative"
          >
            <div className="relative p-10 bg-zinc-900/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
              <Icon className={cn("h-16 w-16 transition-colors duration-700", phase.color)} strokeWidth={1.5} />
            </div>
            <div className="absolute -top-3 -right-3 bg-primary rounded-full p-2.5 shadow-xl border-2 border-slate-950 animate-bounce">
              <Cpu className="h-5 w-5 text-white" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* TEXTOS DE PROGRESO */}
        <div className="space-y-3 mb-12 min-h-[100px]">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
            {phase.title}
          </h2>
          <p className="text-base text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
            {typeof phase.desc === 'function' ? phase.desc(currentPhaseIndex === 0 ? topic : agentName) : phase.desc}
          </p>
        </div>

        {/* BARRA DE PROGRESO TÉCNICO */}
        <div className="w-full max-w-xs space-y-5">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>

          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              <Loader2 size={12} className="animate-spin text-primary" />
              Malla Generativa Activa
            </div>
            <span className="text-[10px] font-black text-white/60 tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* LOGO DE SISTEMA */}
        <div className="mt-16 flex items-center gap-3 opacity-20">
          <PenTool size={14} />
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">NicePod Intelligence Studio</span>
        </div>

      </div>
    </div>
  );
}