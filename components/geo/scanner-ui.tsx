/**
 * ARCHIVO: components/geo/scanner-ui.tsx
 * VERSIÓN: 2.0 (NicePod Sovereign Sequencer - Atomic Step Engine Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Orquestar el flujo secuencial de la forja de capital intelectual, 
 * gestionando las transiciones entre el anclaje físico y la síntesis narrativa.
 * [FIX V2.0]: Resolución de error de importación (Named vs Default) y alineación 
 * con la arquitectura de pasos V4.0.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

// --- INFRAESTRUCTURA DE ESTADO ---
import { useForge } from "./forge-context";

// --- COMPONENTES DE FASE (STEPPER V3.0) ---
// [REFORMA]: Importaciones sintonizadas con los nuevos estándares de exportación.
import Step1Anchoring from "./steps/step-1-anchoring";
import Step2SensoryCapture from "./steps/step-2-sensory-capture";
import Step3DossierReview from "./steps/step-3-dossier-review";
import Step4NarrativeForge from "./steps/step-4-narrative-forge";

/**
 * ANIMACIÓN: stepTransitionVariants
 * Define el comportamiento cinemático de los paneles al conmutar de fase.
 */
const stepTransitionVariants = {
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
      ease: [0.16, 1, 0.3, 1] // Quint Ease-Out (Industrial Standard)
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
 * GeoScannerUI: El Motor de Secuenciación Táctica.
 */
export function GeoScannerUI() {
  // 1. CONSUMO DE LA MÁQUINA DE ESTADOS (FSM)
  const { state: forgeState } = useForge();
  const { currentStep } = forgeState;

  /**
   * renderActiveStep:
   * Misión: Determinar qué fase del peritaje debe proyectarse en la terminal.
   */
  const renderActiveStep = () => {
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
          <div className="flex items-center justify-center h-full text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
            Error: Fase no identificada
          </div>
        );
    }
  };

  return (
    /**
     * [CHASIS DEL SECUENCIADOR]
     * - 'flex-1': Ocupa todo el espacio de la terminal GeoScannerUI.
     * - 'relative': Permite el posicionamiento absoluto de los paneles en transición.
     */
    <div className="flex-1 relative w-full h-full flex flex-col min-h-0 overflow-hidden">
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStep}
          variants={stepTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full flex flex-col absolute inset-0"
        >
          {renderActiveStep()}
        </motion.div>
      </AnimatePresence>

      {/* 
          OVERLAY DE PROTECCIÓN DE DATOS:
          Capa invisible que bloquea interacciones accidentales durante el 
          re-renderizado de pasos pesados.
      */}
      {forgeState.isSubmitting && (
        <div className="absolute inset-0 z-[50] bg-black/5 cursor-wait pointer-events-auto" />
      )}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Build Shield Synchronization: Se corrigieron las importaciones de los pasos 
 *    de la forja, eliminando la desincronización que bloqueaba el despliegue.
 * 2. Visual Stasis: El uso de 'AnimatePresence' con 'popLayout' o 'absolute inset-0' 
 *    dentro del secuenciador garantiza que la terminal no "vibre" ni cambie de 
 *    tamaño bruscamente durante el cambio de fase.
 * 3. Zero Abbreviations: Se ha purificado el código de términos cortos para 
 *    mantener la legibilidad industrial necesaria para el mantenimiento a largo plazo.
 */