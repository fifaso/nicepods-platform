/**
 * ARCHIVO: components/geo/scanner-ui.tsx
 * VERSIÓN: 3.0 (NicePod Sovereign Sequencer - Industrial Nominal Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Orquestar el flujo secuencial de la forja de capital intelectual, 
 * gestionando las transiciones cinemáticas entre las fases de anclaje, 
 * captura, auditoría y síntesis narrativa.
 * [REFORMA V3.0]: Sincronización nominal total con ForgeContext V6.0. Resolución 
 * definitiva del error TS2339 mediante la transición de 'isSubmitting' a 
 * 'isSubmittingProcess'. Implementación estricta de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

// --- INFRAESTRUCTURA DE ESTADO SOBERANO ---
import { useForge } from "./forge-context";

// --- COMPONENTES DE FASE (STEPPER INDUSTRIAL V4.2) ---
import Step1Anchoring from "./steps/step-1-anchoring";
import Step2SensoryCapture from "./steps/step-2-sensory-capture";
import Step3DossierReview from "./steps/step-3-dossier-review";
import Step4NarrativeForge from "./steps/step-4-narrative-forge";

/**
 * ANIMACIÓN: stepTransitionCinematicVariants
 * Misión: Definir el comportamiento físico de los paneles al conmutar de fase,
 * utilizando la curva de inercia industrial NicePod.
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
      ease: [0.16, 1, 0.3, 1] // Curva NicePod (Cubic-Bezier Industrial)
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
  
  // 1. CONSUMO DE LA MÁQUINA DE ESTADOS FINITA (FSM)
  const { state: forgeState } = useForge();
  const { currentStep } = forgeState;

  /**
   * renderActiveForgeStepAction:
   * Misión: Determinar qué fase del peritaje debe proyectarse en la terminal.
   * [SINCRO V3.0]: Asegura que cada componente hijo reciba un entorno purificado.
   */
  const renderActiveForgeStepAction = () => {
    switch (currentStep) {
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
              Fase No Identificada
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
          key={currentStep}
          variants={stepTransitionCinematicVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full flex flex-col absolute inset-0"
        >
          {renderActiveForgeStepAction()}
        </motion.div>
      </AnimatePresence>

      /**
       * CAPA DE BLOQUEO DE TRANSACCIÓN (HARDWARE SHIELD):
       * Misión: Inmovilizar la terminal durante procesos críticos de red o IA.
       * [FIX V3.0]: Sincronización con 'isSubmittingProcess' del ForgeContext V6.0.
       */
      {forgeState.isSubmittingProcess && (
        <div className="absolute inset-0 z-[500] bg-black/5 cursor-wait pointer-events-auto backdrop-blur-[1px]" />
      )}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Build Shield Compliance: Se extinguió el error TS2339 al actualizar la referencia del 
 *    flag de sumisión al nuevo descriptor nominal 'isSubmittingProcess'.
 * 2. Zero Abbreviations Policy (ZAP): El componente ha sido renombrado internamente 
 *    para erradicar el uso del acrónimo 'UI' (User Interface -> UserInterface).
 * 3. Layout Stability: El uso de posicionamiento absoluto en las capas de animación 
 *    previene saltos en el eje vertical (Layout Shifts) durante las transiciones de fase.
 */