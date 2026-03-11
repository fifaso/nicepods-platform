// components/create-flow/steps/draft-generation-loader.tsx
// VERSIÓN: 5.1 (NicePod Intelligence Loader - Absolute Hydration Edition)
// Misión: Orquestar la espera asíncrona y garantizar la inyección perfecta de datos antes de la edición.
// [ESTABILIZACIÓN]: Delegación de hidratación a 'useFlowActions' para asegurar la integridad del JSONB.

"use client";

import { Button } from "@/components/ui/button";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { useFlowActions } from "../hooks/use-flow-actions"; // [FIX]: Importamos las acciones para acceder al hidratador
import { useCreationContext } from "../shared/context";

interface DraftLoaderProps {
  formData: PodcastCreationData;
}

const STATUS_MAP: Record<string, number> = {
  'researching': 0,
  'writing': 1,
  'ready': 2,
  'failed': -1
};

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
  const { transitionTo, goBack } = useCreationContext();

  // Instanciamos las acciones para acceder al motor de hidratación
  const { hydrateDraftData } = useFlowActions({
    transitionTo,
    goBack,
    clearDraft: () => { } // Callback vacío ya que no se usa en esta vista
  });

  const [progress, setProgress] = useState(10);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isFinalizing = useRef(false);

  const draftId = formData.draft_id;
  const topic = formData.solo_topic || "tu idea";
  const agentName = formData.agentName || "Especialista NicePod";

  /**
   * [NÚCLEO DE SOBERANÍA]: finalizeIngestion
   * Delega la responsabilidad de inyección al hook especializado para evitar 
   * la corrupción de datos por payloads parciales de WebSocket.
   */
  const finalizeIngestion = useCallback(async () => {
    if (isFinalizing.current) return;
    isFinalizing.current = true;

    console.log("🎯 [Loader] Ingesta final detectada. Invocando hidratación...");
    setProgress(100);

    // Esperamos a que la barra de progreso llegue al 100% visualmente
    await new Promise(resolve => setTimeout(resolve, 800));

    // Ejecutamos la hidratación profunda desde la base de datos
    const isHydrated = await hydrateDraftData();

    if (isHydrated) {
      console.log("✅ [Loader] Hidratación exitosa. Transición a edición.");
      transitionTo("SCRIPT_EDITING");
    } else {
      setIsError(true);
      setErrorMessage("Error de Sincronía: No se pudo recuperar el borrador completo de la base de datos.");
    }
  }, [hydrateDraftData, transitionTo]);

  useEffect(() => {
    if (!draftId) {
      setIsError(true);
      setErrorMessage("Error de sesión: No se encontró el ID del borrador.");
      return;
    }

    console.log(`📡 [Loader] Vigilancia Realtime activa para Borrador #${draftId}`);

    const channel = supabase
      .channel(`draft_vanguard_${draftId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'podcast_drafts',
          filter: `id=eq.${draftId}`
        },
        (payload: any) => {
          const status = payload.new.status;
          console.log(`🔔 [Realtime] Cambio de estado: ${status}`);

          if (status === 'failed') {
            setIsError(true);
            setErrorMessage("La IA encontró un obstáculo crítico en la síntesis.");
            return;
          }

          const mappedIndex = STATUS_MAP[status];
          if (mappedIndex !== undefined && mappedIndex !== -1) {
            setCurrentPhaseIndex(mappedIndex);
          }

          // Si el estado es 'ready', disparamos la finalización
          if (status === 'ready') {
            finalizeIngestion();
          }
        }
      )
      .subscribe();

    const safetyCheck = setInterval(async () => {
      const { data, error } = await supabase
        .from('podcast_drafts')
        .select('*')
        .eq('id', draftId)
        .single();

      if (!error && data) {
        if (data.status === 'ready') {
          clearInterval(safetyCheck);
          finalizeIngestion();
        } else if (data.status === 'failed') {
          setIsError(true);
          setErrorMessage("El proceso de investigación fue interrumpido.");
          clearInterval(safetyCheck);
        } else {
          const mappedIndex = STATUS_MAP[data.status];
          if (mappedIndex !== undefined && mappedIndex !== -1) {
            setCurrentPhaseIndex(mappedIndex);
          }
        }
      }
    }, 5000);

    return () => {
      console.log(`🛑 [Loader] Limpiando vigilancia para Borrador #${draftId}`);
      supabase.removeChannel(channel);
      clearInterval(safetyCheck);
    };
  }, [draftId, supabase, finalizeIngestion]);

  // ANIMACIÓN DE PROGRESO
  useEffect(() => {
    if (isError) return;
    const target = PHASES[currentPhaseIndex]?.targetProgress || 95;
    const interval = setInterval(() => {
      setProgress(prev => (prev < target ? prev + 0.15 : prev));
    }, 100);
    return () => clearInterval(interval);
  }, [currentPhaseIndex, isError]);

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