/**
 * ARCHIVO: components/geo/scanner-ui.tsx
 * VERSIÓN: 3.3 (NicePod Sovereign Sequencer - Industrial Nominal Sync & Build Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.8.1
 * 
 * Misión: Orquestar el flujo secuencial de la forja de capital intelectual, 
 * gestionando las transiciones cinemáticas entre las fases de anclaje, 
 * captura, auditoría y síntesis narrativa.
 * [REFORMA V3.3]: Resolución definitiva del error de tipo TS2339 mediante la 
 * sincronización con la propiedad 'isSubmittingProcessActive' del ForgeContext V6.3. 
 * Eliminación absoluta de residuos nominales abreviados y blindaje de la 
 * Máquina de Estados Finita (FSM).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

// --- INFRAESTRUCTURA DE ESTADO SOBERANO ---
import { useForge } from "./forge-context";

// --- COMPONENTES DE FASE (STEPPER INDUSTRIAL V4.8) ---
import Step1Anchoring from "./steps/step-1-anchoring";
import Step2SensoryCapture from "./steps/step-2-sensory-capture";
import Step3DossierReview from "./steps/step-3-dossier-review";
import Step4NarrativeForge from "./steps/step-4-narrative-forge";

/**
 * ANIMACIÓN: stepTransitionCinematicVariants
 * Misión: Definir el comportamiento físico de los paneles al conmutar de fase,
 * utilizando la curva de inercia industrial de NicePod.
 */
const stepTransitionCinematicVariants = {
  initial: { 
    opacity: 0, 
    x: 20,
    filter: "blur(10px)"
  },
  animate: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] // Quint Ease-Out (Estándar Industrial NicePod)
    }
  },
  exit: { 
    opacity: 0, 
    x: -20, 
    filter: "blur(10px)",
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

/**
 * GeographicScannerUserInterface: El Motor de Secuenciación Táctica de la terminal.
 */
export function GeographicScannerUserInterface() {
  
  // 1. CONSUMO DE LA MÁQUINA DE ESTADOS FINITA (FINITE STATE MACHINE)
  const { state: forgeState } = useForge();
  
  /**
   * [SINCRO V3.3]: Mapeo nominal obligatorio.
   * La propiedad 'currentActiveStep' garantiza la correspondencia con la Constitución V8.6.
   */
  const { currentActiveStep } = forgeState;

  /**
   * renderActiveForgeStepAction:
   * Misión: Determinar qué fase del peritaje debe proyectarse en la terminal.
   */
  const renderActiveForgeStepAction = () => {
    switch (currentActiveStep) {
      case 'ANCHORING':
        return <Step1Anchoring />;
      
      case 'SENSORY_CAPTURE':
        return <Step2SensoryCapture />;
      
      case 'DOSSIER_REVIEW':
        return <Step3DossierReview />;
      
      case 'NARRATIVE_FORGE':
        return <Step4NarrativeForge />;
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="h-1 w-12 bg-red-500 rounded-full animate-pulse" />
            <span className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">
              Error: Fase No Identificada
            </span>
          </div>
        );
    }
  };

  return (
    /**
     * [CHASIS DEL SECUENCIADOR]
     * - 'flex-1': Ocupa la totalidad del espacio asignado en el orquestador padre.
     * - 'relative': Punto de anclaje para las capas de transición absoluta.
     */
    <div className="flex-1 relative w-full h-full flex flex-col min-h-0 overflow-hidden isolate">
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentActiveStep}
          variants={stepTransitionCinematicVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full flex flex-col absolute inset-0"
        >
          {renderActiveForgeStepAction()}
        </motion.div>
      </AnimatePresence>

      {/* 
        CAPA DE BLOQUEO DE TRANSACCIÓN (HARDWARE SHIELD):
        Misión: Inmovilizar la terminal durante procesos críticos de red o Inteligencia Artificial.
        [FIX V3.3]: Sincronización con 'isSubmittingProcessActive' del ForgeContext V6.3.
        Este cambio erradica el error de compilación reportado en Vercel.
      */}
      {forgeState.isSubmittingProcessActive && (
        <div className="absolute inset-0 z-[500] bg-black/5 cursor-wait pointer-events-auto backdrop-blur-[1px]" />
      )}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.3):
 * 1. Build Shield Compliance: Se extinguió el error TS2339 al alinear la referencia 
 *    del estado de envío con el nuevo descriptor 'isSubmittingProcessActive'.
 * 2. Nominal Sovereignty: La terminal de secuenciación ahora es 100% coherente con 
 *    el protocolo de unificación geodésica V4.8.1.
 * 3. Atomic State Guard: La capa de bloqueo impide colisiones de estado si el Administrador 
 *    intenta interactuar con la terminal mientras el Oráculo de Inteligencia procesa 
 *    la ingesta sensorial.
 */