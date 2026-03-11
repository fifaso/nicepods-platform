// components/create-flow/steps/draft-generation-loader.tsx
// VERSIÓN: 6.0 (NicePod Intelligence Loader - Absolute Hydration Standard)
// Misión: Orquestar la espera asíncrona y garantizar la inyección perfecta de datos antes de la edición.
// [ESTABILIZACIÓN]: Integración del motor 'hydrateDraftData' para erradicar la pérdida de fuentes bibliográficas.

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BrainCircuit,
  Cpu,
  Globe,
  Loader2,
  PenTool,
  SearchCheck,
  Zap
} from "lucide-react";

// --- INFRAESTRUCTURA CORE ---
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";

// --- CONTEXTOS Y ACCIONES ---
import { useCreationContext } from "../shared/context";
import { useFlowActions } from "../hooks/use-flow-actions";

interface DraftLoaderProps {
  formData: PodcastCreationData;
}

/**
 * STATUS_MAP: Diccionario de estados de la base de datos para la cinemática de carga.
 */
const STATUS_MAP: Record<string, number> = {
  'researching': 0,
  'writing': 1,
  'ready': 2,
  'failed': -1
};

/**
 * PHASES: Narrativa visual de la forja cognitiva.
 */
const PHASES = [
  {
    id: 0,
    title: "Investigación",
    status: 'researching',
    desc: (topic: string) => `Analizando señales y fuentes soberanas sobre "${topic}"...`,
    icon: Globe,
    color: "text-blue-400",
    bg: "from-blue-600/20 to-transparent",
    targetProgress: 35,
  },
  {
    id: 1,
    title: "Redacción Pro",
    status: 'writing',
    desc: (agent: string) => `El Agente ${agent} está estructurando tu síntesis estratégica...`,
    icon: BrainCircuit,
    color: "text-purple-400",
    bg: "from-purple-500/20 to-transparent",
    targetProgress: 75,
  },
  {
    id: 2,
    title: "Finalización",
    status: 'ready',
    desc: () => "Validando integridad semántica y preparando el lienzo...",
    icon: SearchCheck,
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-transparent",
    targetProgress: 100,
  }
];

export function DraftGenerationLoader({ formData }: DraftLoaderProps) {
  const supabase = createClient();
  const { transitionTo, goBack } = useCreationContext();
  
  /**
   * [SINCRO DE ACCIONES]:
   * Inyectamos el orquestador de acciones para acceder al método 'hydrateDraftData'.
   */
  const { hydrateDraftData } = useFlowActions({
    transitionTo,
    goBack,
    clearDraft: () => { } 
  });

  // --- ESTADOS DE TELEMETRÍA ---
  const [progress, setProgress] = useState<number>(10);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Referencia de control para evitar colisiones de eventos concurrentes (WebSocket + Polling)
  const isFinalizing = useRef<boolean>(false);

  const draftId = formData.draft_id;
  const topic = formData.solo_topic || "tu idea";
  const agentName = formData.agentName || "Especialista";

  /**
   * finalizeIngestion: PROTOCOLO DE CIERRE DE FORJA
   * Misión: Asegurar que el formulario tenga el 100% de los datos antes de saltar al editor.
   */
  const finalizeIngestion = useCallback(async () => {
    if (isFinalizing.current) return;
    isFinalizing.current = true;

    console.info(`🎯 [Loader] Ingesta final detectada para Borrador #${draftId}. Iniciando hidratación.`);
    setProgress(100);

    // Pausa táctica para completar la animación de la barra
    await new Promise(resolve => setTimeout(resolve, 1000));

    /**
     * [LA SOLDADURA]: 
     * Llamamos al motor de hidratación que consulta directamente la tabla 'podcast_drafts'.
     * Esto garantiza que recuperemos las FUENTES bibliográficas y el guion completo.
     */
    const success = await hydrateDraftData();

    if (success) {
      console.log("✅ [Loader] Hidratación molecular completada. Transicionando a edición.");
      transitionTo("SCRIPT_EDITING");
    } else {
      setIsError(true);
      setErrorMessage("Fallo de Integridad: La IA terminó el trabajo pero el dato no es legible.");
    }
  }, [draftId, hydrateDraftData, transitionTo]);

  useEffect(() => {
    if (!draftId) {
      setIsError(true);
      setErrorMessage("Identificador de sesión perdido.");
      return;
    }

    // 1. VIGILANCIA REALTIME (Suscripción al pulso de la DB)
    const channel = supabase
      .channel(`draft_vanguard_${draftId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'podcast_drafts', filter: `id=eq.${draftId}` },
        (payload: any) => {
          const status = payload.new.status;
          
          if (status === 'failed') {
            setIsError(true);
            setErrorMessage("El agente de IA encontró una anomalía estructural.");
            return;
          }

          const mappedIndex = STATUS_MAP[status];
          if (mappedIndex !== undefined && mappedIndex !== -1) {
            setCurrentPhaseIndex(mappedIndex);
          }

          if (status === 'ready') {
            finalizeIngestion();
          }
        }
      )
      .subscribe();

    // 2. POLLING DE RESILIENCIA (Sondeo cada 5 segundos)
    // Red de seguridad por si el WebSocket falla en condiciones de red inestables.
    const safetyCheck = setInterval(async () => {
      const { data, error } = await supabase
        .from('podcast_drafts')
        .select('status')
        .eq('id', draftId)
        .single();

      if (!error && data) {
        if (data.status === 'ready') {
          clearInterval(safetyCheck);
          finalizeIngestion();
        } else if (data.status === 'failed') {
          setIsError(true);
          setErrorMessage("Misión interrumpida por el servidor.");
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
  }, [draftId, supabase, finalizeIngestion]);

  // ANIMACIÓN DE BARRA DE PROGRESO
  useEffect(() => {
    if (isError) return;
    const target = PHASES[currentPhaseIndex]?.targetProgress || 95;
    const interval = setInterval(() => {
      setProgress(prev => (prev < target ? prev + 0.2 : prev));
    }, 100);
    return () => clearInterval(interval);
  }, [currentPhaseIndex, isError]);

  const phase = PHASES[currentPhaseIndex] || PHASES[0];
  const Icon = phase.icon;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-8 animate-in fade-in">
        <div className="p-8 bg-red-500/10 rounded-full border border-red-500/20 shadow-2xl">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-black uppercase text-white tracking-tighter italic">Disonancia Técnica</h3>
          <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm leading-relaxed">{errorMessage}</p>
        </div>
        <Button
          onClick={() => transitionTo('SELECTING_PURPOSE')}
          variant="outline"
          className="h-12 px-10 border-white/10 rounded-2xl uppercase font-black text-[10px] tracking-[0.3em] hover:bg-white/5 transition-all"
        >
          Reiniciar Ciclo
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-10 text-center relative overflow-hidden">
      
      {/* CAPA ATMOSFÉRICA DINÁMICA */}
      <div className={cn(
        "absolute inset-0 bg-gradient-radial opacity-20 blur-[140px] transition-all duration-1000",
        phase.bg
      )} />

      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* ORBE DE PROCESAMIENTO INDUSTRIAL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase.title}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="mb-12 relative"
          >
            <div className="relative p-12 bg-zinc-900/60 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <Icon className={cn("h-20 w-20 transition-colors duration-1000", phase.color)} strokeWidth={1} />
            </div>
            <div className="absolute -top-4 -right-4 bg-primary rounded-full p-3 shadow-2xl border-[4px] border-[#020202] animate-bounce">
              <Cpu className="h-6 w-6 text-white" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* TEXTOS DE TELEMETRÍA */}
        <div className="space-y-4 mb-14 min-h-[140px]">
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none italic">
            {phase.title}
          </h2>
          <p className="text-lg text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
            {typeof phase.desc === 'function' ? phase.desc(currentPhaseIndex === 0 ? topic : agentName) : phase.desc}
          </p>
        </div>

        {/* BARRA DE PROGRESO DE ALTA PRECISIÓN */}
        <div className="w-full max-w-sm space-y-6">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "linear" }}
            />
          </div>

          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
              <Loader2 size={14} className="animate-spin text-primary" />
              Procesando Malla
            </div>
            <span className="text-xs font-black text-white/50 tabular-nums tracking-widest">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <div className="mt-20 flex items-center gap-4 opacity-10">
          <PenTool size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.6em]">NicePod Intelligence Studio</span>
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Protocolo de Hidratación Obligatoria: Al detectar el estado 'ready', el componente 
 *    no salta inmediatamente al editor. Invoca 'hydrateDraftData', asegurando que el 
 *    Capital Intelectual (fuentes, guion) se descargue físicamente de la base de datos, 
 *    eliminando el bug histórico de 'Sources = 0'.
 * 2. Resiliencia Dual: La combinación de WebSocket (velocidad) y Polling (seguridad) 
 *    garantiza la operatividad en el 100% de los escenarios de red en Madrid.
 * 3. Diseño Inmersivo: Se han ampliado las escalas de los iconos y la tipografía para 
 *    un look industrial de alta fidelidad, manteniendo la coherencia visual Aurora.
 */