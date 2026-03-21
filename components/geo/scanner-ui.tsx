// components/geo/scanner-ui.tsx
// VERSIÓN: 20.0 (NicePod Sovereign Oracle Master UI - Type Integrity Edition)
// Misión: Orquestar el flujo sensorial garantizando sincronía total de tipos y estados.
// [ESTABILIZACIÓN]: Corrección de ts(2367) mediante la unificación de lógica de estados.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Loader2,
  Lock,
  Power,
  ShieldAlert,
  Zap
} from "lucide-react";
import { useEffect } from "react";

// --- INFRAESTRUCTURA DE ESTADO Y MOTOR SOBERANO (V10.0) ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "./forge-context";

// --- COMPONENTES ESPECIALISTAS (STEPPER V2.6) ---
import { StepAnchoring } from "@/components/geo/steps/step-1-anchoring";
import { StepSensoryCapture } from "@/components/geo/steps/step-2-sensory-capture";
import { StepDossierReview } from "@/components/geo/steps/step-3-dossier-review";
import { StepNarrativeForge } from "@/components/geo/steps/step-4-narrative-forge";

// --- UTILIDADES DE SISTEMA ---
import { nicepodLog } from "@/lib/utils";

/**
 * COMPONENTE: GeoScannerUI
 * El centro de control maestro para la siembra de capital intelectual en Madrid.
 * Este componente vive dentro del Drawer generado por GeoCreatorOverlay.
 */
export function GeoScannerUI() {
  // 1. CONSUMO DEL MOTOR GEOESPACIAL (Hardware & Network)
  const {
    status: engineStatus,
    initSensors,
    error: geoError
  } = useGeoEngine();

  // 2. CONSUMO DE MEMORIA DE FORJA (Human Intent)
  const { state: forgeState, dispatch } = useForge();

  /**
   * [MONITOR DE TELEMETRÍA]:
   * Vigilamos la máquina de estados para asegurar la resiliencia del flujo.
   */
  useEffect(() => {
    nicepodLog(`🛰️ [Orchestrator] UI Step: ${forgeState.currentStep} | Engine Status: ${engineStatus}`);

    /**
     * [GESTIÓN DE RECHAZO]:
     * Si el motor entra en estado REJECTED (ej. fallo de red o Circuit Breaker),
     * aseguramos que la terminal esté en el paso sensorial para que el Admin
     * pueda pulsar 'Reintentar' sin perder sus datos.
     */
    if (engineStatus === 'REJECTED') {
      nicepodLog("🛑 [Orchestrator] Anomalía detectada. Restaurando terminal sensorial.", null, 'error');

      // Solo despachamos si no estamos ya en SENSORY_CAPTURE para evitar loops
      if (forgeState.currentStep !== 'SENSORY_CAPTURE') {
        dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
      }
    }

    /**
     * [TRANSICIÓN FINAL]:
     * Una vez que la narrativa está lista, confirmamos el fin de la misión.
     */
    if (engineStatus === 'NARRATIVE_READY') {
      nicepodLog("🎯 [Orchestrator] Crónica forjada exitosamente.");
    }
  }, [engineStatus, forgeState.currentStep, dispatch]);

  /**
   * stepVariants: Coreografía de transición industrial.
   * Diseñada para mantener la fluidez a 60fps durante el cambio de fases.
   */
  const stepVariants = {
    initial: { x: 30, opacity: 0, filter: "blur(8px)" },
    animate: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      x: -30,
      opacity: 0,
      filter: "blur(8px)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto relative selection:bg-primary/30 min-h-0">

      {/* 
          I. GESTIÓN DE ALERTAS DE HARDWARE Y CONFLICTOS
          Estas alertas flotan sobre los pasos si el GPS falla o si hay un nodo muy cerca.
      */}
      <div className="flex-shrink-0 px-6 z-20">
        <AnimatePresence>
          {geoError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 shadow-2xl"
            >
              <Lock size={16} className="shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Señal Bloqueada</span>
                <span className="text-[8px] font-bold uppercase opacity-60 leading-relaxed">{geoError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
          II. BÓVEDA DE PASOS (SCROLLABLE AREA)
          El contenedor maestro que alberga las fases de creación de la Bóveda NKV.
      */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-12 pt-2 relative z-10">
        <AnimatePresence mode="wait">

          {/* FASE 0: IGNICIÓN DE SENSORES */}
          {engineStatus === 'IDLE' && (
            <motion.div
              key="idle_activation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full min-h-[450px] flex flex-col items-center justify-center gap-14"
            >
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <ShieldAlert size={14} className="text-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Auth: Sovereign Admin</span>
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
                  Terminal <span className="text-primary not-italic">Inactive</span>
                </h2>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed text-center">
                  Enlace con el territorio para iniciar la captura de capital intelectual.
                </p>
              </div>

              <button
                onClick={initSensors}
                className="h-32 w-32 rounded-full bg-primary/5 border-2 border-primary/20 text-primary hover:bg-primary hover:text-black transition-all duration-700 group shadow-[0_0_60px_rgba(var(--primary),0.1)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <Power size={48} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </button>
            </motion.div>
          )}

          {/* FASE 1: ANCLAJE TÁCTICO */}
          {engineStatus !== 'IDLE' && forgeState.currentStep === 'ANCHORING' && (
            <motion.div key="st1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepAnchoring />
            </motion.div>
          )}

          {/* FASE 2: CAPTURA MULTIMODAL */}
          {forgeState.currentStep === 'SENSORY_CAPTURE' && (
            <motion.div key="st2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepSensoryCapture />
            </motion.div>
          )}

          {/* FASE 3: AUDITORÍA DE DOSSIER */}
          {forgeState.currentStep === 'DOSSIER_REVIEW' && (
            <motion.div key="st3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepDossierReview />
            </motion.div>
          )}

          {/* FASE 4: FORJA EDITORIAL */}
          {forgeState.currentStep === 'NARRATIVE_FORGE' && (
            <motion.div key="st4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepNarrativeForge />
            </motion.div>
          )}

        </AnimatePresence>

        {/* 
            III. OVERLAY DE SÍNTESIS GLOBAL (AGENT 42 WORKING)
            Este estado bloquea la UI mientras la IA orquesta la sabiduría en el Edge.
        */}
        <AnimatePresence>
          {engineStatus === 'SYNTHESIZING' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#020202]/90 backdrop-blur-xl flex flex-col items-center justify-center rounded-[3rem] border border-white/10 mx-2"
            >
              <div className="relative mb-14">
                <div className="absolute inset-0 bg-primary/40 blur-[100px] animate-pulse rounded-full" />
                <Loader2 className="h-24 w-24 animate-spin text-primary relative z-10" />
              </div>
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-4 text-primary animate-pulse">
                  <Zap size={24} className="fill-current" />
                  <h2 className="text-5xl font-black uppercase tracking-[0.4em] text-white italic">Sintetizando</h2>
                  <Zap size={24} className="fill-current" />
                </div>
                <div className="flex flex-col items-center gap-3 opacity-50">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-zinc-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.7em] text-white">Agente 42 Online</span>
                  </div>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic text-center px-12 leading-relaxed">
                    Transformando evidencia física en sabiduría anclada...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V20.0):
 * 1. Resolución de ts(2367): Se eliminó la comparación ilegal de 'currentStep' 
 *    con 'INGESTING'. La lógica de error ahora es puramente basada en la 
 *    identificación de fallos en el motor y la restauración del paso de captura.
 * 2. Integridad de Tipos: El componente ahora respeta estrictamente el contrato 
 *    de 'ForgeStep', asegurando que el Build Shield de Vercel sea impenetrable.
 * 3. Experiencia Inmersiva: Se mantiene el Overlay de Síntesis para el Agente 42, 
 *    proporcionando feedback cinemático durante la forja en el Borde.
 */