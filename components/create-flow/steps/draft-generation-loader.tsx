/**
 * ARCHIVO: components/create-flow/steps/draft-generation-loader.tsx
 * VERSIÓN: 7.0 (NicePod Intelligence Loader - Industrial Hydration Standard)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la espera asíncrona mediante telemetría en tiempo real, 
 * garantizando la inyección perfecta del capital intelectual antes de la edición.
 * [REFORMA V7.0]: Resolución definitiva de TS2339. Sincronización nominal absoluta 
 * con 'CreationContextType' V5.0 y 'PodcastCreationSchema' V12.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP) y Cero 'any'.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

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

// --- INFRAESTRUCTURA DE ARQUITECTURA SOBERANA ---
import { createClient } from "@/lib/supabase/client";
import { classNamesUtility, nicepodLog } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";

// --- CONTEXTOS Y ACTUADORES DE LA FORJA ---
import { useCreationContext } from "../shared/context";
import { useFlowActions } from "../hooks/use-flow-actions";

/**
 * INTERFAZ: DraftGenerationLoaderProperties
 */
interface DraftGenerationLoaderProperties {
  /** creationFormDataSnapshot: El estado actual del capital intelectual en el formulario. */
  formData: PodcastCreationData;
}

/**
 * DATABASE_STATUS_MAPPING_MAGNITUDE: 
 * Diccionario de estados del Metal para la cinemática de carga.
 */
const DATABASE_STATUS_MAPPING_MAGNITUDE: Record<string, number> = {
  'researching': 0,
  'writing': 1,
  'ready': 2,
  'failed': -1
};

/**
 * GENERATION_PHASES_COLLECTION: 
 * Definición de la narrativa visual durante la síntesis asíncrona.
 */
const GENERATION_PHASES_COLLECTION = [
  {
    phaseIdentification: 0,
    titleTextContent: "Investigación",
    databaseStatusKey: 'researching',
    descriptionFunction: (topicText: string) => `Analizando señales y fuentes soberanas sobre "${topicText}"...`,
    iconComponent: Globe,
    tailwindColorClassName: "text-blue-400",
    backgroundGradientClassName: "from-blue-600/20 to-transparent",
    targetProgressMagnitude: 35,
  },
  {
    phaseIdentification: 1,
    titleTextContent: "Redacción Neuronal",
    databaseStatusKey: 'writing',
    descriptionFunction: (agentName: string) => `El Agente ${agentName} está estructurando su síntesis estratégica...`,
    iconComponent: BrainCircuit,
    tailwindColorClassName: "text-purple-400",
    backgroundGradientClassName: "from-purple-500/20 to-transparent",
    targetProgressMagnitude: 75,
  },
  {
    phaseIdentification: 2,
    titleTextContent: "Finalización",
    databaseStatusKey: 'ready',
    descriptionFunction: () => "Validando integridad semántica y preparando el lienzo editorial...",
    iconComponent: SearchCheck,
    tailwindColorClassName: "text-emerald-400",
    backgroundGradientClassName: "from-emerald-500/20 to-transparent",
    targetProgressMagnitude: 100,
  }
];

/**
 * DraftGenerationLoader: El monitor de sincronía asíncrona de la forja NicePod.
 */
export function DraftGenerationLoader({ formData: creationFormDataSnapshot }: DraftGenerationLoaderProperties) {
  const supabaseSovereignClient = createClient();
  
  /** [RESOLUCIÓN TS2339]: Sincronización con el sistema nervioso central V5.0. */
  const { 
    transitionToNextStateAction, 
    navigateBackAction 
  } = useCreationContext();
  
  /**
   * flowActionsAuthorityActuator:
   * Inyectamos el orquestador para acceder al protocolo de hidratación física.
   */
  const { hydrateDraftData, isGeneratingProcessActive } = useFlowActions({
    transitionTo: transitionToNextStateAction,
    goBack: navigateBackAction,
    clearDraft: () => { } 
  });

  // --- ESTADOS DE TELEMETRÍA DE PROCESAMIENTO ---
  const [currentProgressPercentage, setCurrentProgressPercentage] = useState<number>(10);
  const [currentPhaseIndexMagnitude, setCurrentPhaseIndexMagnitude] = useState<number>(0);
  const [isOperationalErrorStatus, setIsOperationalErrorStatus] = useState<boolean>(false);
  const [operationalErrorMessageContent, setOperationalErrorMessageContent] = useState<string>("");

  /** isFinalizingProcessReference: Evita colisiones entre WebSocket y Polling (MTI Safety). */
  const isFinalizingProcessReference = useRef<boolean>(false);

  /** [RESOLUCIÓN TS2339]: Acceso a descriptores purificados V12.0. */
  const draftIdentification = creationFormDataSnapshot.draftIdentification;
  const missionTopicText = creationFormDataSnapshot.soloTopicSelection || "su idea";
  const agentIntelligenceName = creationFormDataSnapshot.agentName || "Especialista";

  /**
   * executeFinalIngestionProtocol:
   * Misión: Asegurar la descarga total de datos (fuentes + guion) antes del salto editorial.
   */
  const executeFinalIngestionProtocol = useCallback(async () => {
    if (isFinalizingProcessReference.current) return;
    isFinalizingProcessReference.current = true;

    nicepodLog(`🎯 [Loader] Ingesta final para Borrador #${draftIdentification}. Iniciando hidratación.`);
    setCurrentProgressPercentage(100);

    // Pausa táctica para completar la cinemática de la barra de progreso.
    await new Promise(resolve => setTimeout(resolve, 1000));

    /**
     * [HYDRATION SEAL]: 
     * Consultamos físicamente la base de datos para recuperar el Capital Intelectual.
     */
    const isHydrationSuccessful = await hydrateDraftData();

    if (isHydrationSuccessful) {
      nicepodLog("✅ [Loader] Hidratación molecular completada. Transicionando a lienzo editorial.");
      transitionToNextStateAction("SCRIPT_EDITING_CANVAS");
    } else {
      setIsOperationalErrorStatus(true);
      setOperationalErrorMessageContent("Fallo de Integridad: La IA finalizó el proceso pero el dato no es legible.");
    }
  }, [draftIdentification, hydrateDraftData, transitionToNextStateAction]);

  /**
   * EFECTO: VIGILANCIA DE PULSO (Realtime + Polling)
   * Misión: Mantener la sintonía con el estado de la forja en el servidor.
   */
  useEffect(() => {
    if (!draftIdentification) {
      setIsOperationalErrorStatus(true);
      setOperationalErrorMessageContent("Identificador de sesión perdido en la malla.");
      return;
    }

    // 1. VIGILANCIA POR CANAL WebSocket (Baja Latencia)
    const realtimeChannelInstance = supabaseSovereignClient
      .channel(`draft_vanguard_${draftIdentification}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'podcast_drafts', 
          filter: `id=eq.${draftIdentification}` 
        },
        (changePayload) => {
          /** [BSS]: Tipado manual del payload de base de datos. */
          const newStatusDescriptor = (changePayload.new as { status: string }).status;
          
          if (newStatusDescriptor === 'failed') {
            setIsOperationalErrorStatus(true);
            setOperationalErrorMessageContent("El Agente de IA detectó una anomalía estructural en la síntesis.");
            return;
          }

          const mappedPhaseIndex = DATABASE_STATUS_MAPPING_MAGNITUDE[newStatusDescriptor];
          if (mappedPhaseIndex !== undefined && mappedPhaseIndex !== -1) {
            setCurrentPhaseIndexMagnitude(mappedPhaseIndex);
          }

          if (newStatusDescriptor === 'ready') {
            executeFinalIngestionProtocol();
          }
        }
      )
      .subscribe();

    // 2. POLLING DE SEGURIDAD (Resiliencia ante micro-cortes de red)
    const safetyPollingIntervalIdentification = setInterval(async () => {
      const { data: statusSnapshot, error: networkException } = await supabaseSovereignClient
        .from('podcast_drafts')
        .select('status')
        .eq('id', draftIdentification)
        .single();

      if (!networkException && statusSnapshot) {
        if (statusSnapshot.status === 'ready') {
          clearInterval(safetyPollingIntervalIdentification);
          executeFinalIngestionProtocol();
        } else if (statusSnapshot.status === 'failed') {
          setIsOperationalErrorStatus(true);
          setOperationalErrorMessageContent("Misión interrumpida por el servidor de inteligencia.");
          clearInterval(safetyPollingIntervalIdentification);
        } else {
          const mappedPhaseIndex = DATABASE_STATUS_MAPPING_MAGNITUDE[statusSnapshot.status];
          if (mappedPhaseIndex !== undefined) setCurrentPhaseIndexMagnitude(mappedPhaseIndex);
        }
      }
    }, 5000);

    /** [HARDWARE HYGIENE]: Purga física de canales y temporizadores. */
    return () => {
      supabaseSovereignClient.removeChannel(realtimeChannelInstance);
      clearInterval(safetyPollingIntervalIdentification);
    };
  }, [draftIdentification, supabaseSovereignClient, executeFinalIngestionProtocol]);

  /** 
   * EFECTO: ANIMACIÓN DE BARRA DE PROGRESO ADAPTATIVA
   * Misión: Proyectar avance suave mientras se espera la confirmación del Metal.
   */
  useEffect(() => {
    if (isOperationalErrorStatus) return;
    const targetProgressPercentage = GENERATION_PHASES_COLLECTION[currentPhaseIndexMagnitude]?.targetProgressMagnitude || 95;
    
    const progressIntervalIdentification = setInterval(() => {
      setCurrentProgressPercentage((previousProgress) => 
        (previousProgress < targetProgressPercentage ? previousProgress + 0.25 : previousProgress)
      );
    }, 120);

    return () => clearInterval(progressIntervalIdentification);
  }, [currentPhaseIndexMagnitude, isOperationalErrorStatus]);

  const activePhaseDossier = GENERATION_PHASES_COLLECTION[currentPhaseIndexMagnitude] || GENERATION_PHASES_COLLECTION[0];
  const PhaseIconComponent = activePhaseDossier.iconComponent;

  // --- VISTA DE ESTADO FALLIDO (GEODETIC DISSONANCE) ---
  if (isOperationalErrorStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-10 animate-in fade-in isolate">
        <div className="p-10 bg-red-500/10 rounded-full border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="h-20 w-20 text-red-500 animate-pulse" />
        </div>
        <div className="space-y-4">
          <h3 className="text-4xl font-black uppercase text-white tracking-tighter italic font-serif">Disonancia Técnica</h3>
          <p className="text-zinc-500 font-bold uppercase tracking-widest max-w-sm mx-auto text-sm leading-relaxed">
            {operationalErrorMessageContent}
          </p>
        </div>
        <Button
          onClick={() => transitionToNextStateAction('SELECTING_PURPOSE')}
          variant="outline"
          className="h-14 px-12 border-white/10 rounded-[1.5rem] uppercase font-black text-[10px] tracking-[0.4em] hover:bg-white/5 transition-all shadow-2xl"
        >
          Reiniciar Ciclo de Sincronía
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto p-10 text-center relative overflow-hidden isolate">
      
      {/* CAPA ATMOSFÉRICA CINEMÁTICA */}
      <div className={classNamesUtility(
        "absolute inset-0 bg-gradient-radial opacity-20 blur-[150px] transition-all duration-1000 z-0",
        activePhaseDossier.backgroundGradientClassName
      )} />

      <div className="relative z-10 w-full flex flex-col items-center isolate">
        
        {/* ORBE DE PROCESAMIENTO INDUSTRIAL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhaseDossier.titleTextContent}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-14 relative"
          >
            <div className="relative p-14 bg-zinc-950/60 backdrop-blur-3xl rounded-[4.5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] isolate">
              <PhaseIconComponent 
                className={classNamesUtility("h-24 w-24 transition-colors duration-1000", activePhaseDossier.tailwindColorClassName)} 
                strokeWidth={1} 
              />
            </div>
            <div className="absolute -top-5 -right-5 bg-primary rounded-full p-4 shadow-2xl border-[5px] border-[#020202] animate-bounce isolate">
              <Cpu className="h-7 w-7 text-white" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* TELEMETRÍA NARRATIVA DE FASE */}
        <div className="space-y-5 mb-16 min-h-[160px] isolate">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none italic font-serif">
            {activePhaseDossier.titleTextContent}
          </h2>
          <p className="text-xl text-zinc-500 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            {activePhaseDossier.descriptionFunction(currentPhaseIndexMagnitude === 0 ? missionTopicText : agentIntelligenceName)}
          </p>
        </div>

        {/* BARRA DE PROGRESO DE ALTA PRECISIÓN (BSS SEAL) */}
        <div className="w-full max-w-md space-y-8 isolate">
          <div className="h-2.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
              animate={{ width: `${currentProgressPercentage}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>

          <div className="flex justify-between items-center px-3 isolate">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">
              <Loader2 size={16} className="animate-spin text-primary" />
              Sintonizando Malla de Inteligencia
            </div>
            <span className="text-sm font-black text-white/40 tabular-nums tracking-[0.2em]">
              {Math.round(currentProgressPercentage)}%
            </span>
          </div>
        </div>

        <div className="mt-24 flex items-center gap-5 opacity-10 grayscale isolate">
          <PenTool size={20} />
          <span className="text-[11px] font-black uppercase tracking-[0.8em]">NicePod Intelligence Terminal</span>
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Protocolo de Hidratación Mandatorio: Se resolvió el fallo histórico de 'Fuentes = 0' 
 *    asegurando que 'hydrateDraftData' se complete antes de la transición al lienzo.
 * 2. ZAP Absolute Compliance: Purificación total. 'formData' -> 'creationFormDataSnapshot', 
 *    'draftId' -> 'draftIdentification', 'topic' -> 'missionTopicText', 'prev' -> 'previousProgress'.
 * 3. TS2339 Resolution: Alineación con 'navigateBackAction' y 'transitionToNextStateAction' 
 *    del Contexto V5.0 y 'soloTopicSelection' del esquema V12.0.
 * 4. MTI Safety: El polling y la animación de la barra ocurren de forma asíncrona, 
 *    protegiendo la estabilidad térmica del dispositivo Voyager.
 */