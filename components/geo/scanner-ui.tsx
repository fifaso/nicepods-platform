// components/geo/scanner-ui.tsx
// VERSIÓN: 17.0 (NicePod V2.6 - Sovereign Oracle Master UI & Manual Gate Edition)
// Misión: Orquestar el flujo sensorial devolviendo el control de transición al Curador.
// [ESTABILIZACIÓN]: Erradicación del Auto-Avance para permitir revisión humana pre-salto.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Eye,
  Loader2,
  Lock,
  Power,
  ShieldAlert,
  Zap
} from "lucide-react";
import { useEffect, useMemo } from "react";

// --- INFRAESTRUCTURA DE ESTADO Y MOTOR SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "./forge-context";
import { RadarHUD } from "./radar-hud";

// --- COMPONENTES ESPECIALISTAS (STEPPER V2.6) ---
import { StepAnchoring } from "@/components/geo/steps/step-1-anchoring";
import { StepSensoryCapture } from "@/components/geo/steps/step-2-sensory-capture";
import { StepDossierReview } from "@/components/geo/steps/step-3-dossier-review";
import { StepNarrativeForge } from "@/components/geo/steps/step-4-narrative-forge";

// --- UTILIDADES DE SISTEMA ---
import { nicepodLog } from "@/lib/utils";

/**
 * COMPONENTE: GeoScannerUI
 * El puente de mando central de la Terminal de Captura Urbana.
 */
export function GeoScannerUI() {
  // 1. CONSUMO DEL MOTOR GEOESPACIAL OMNISCIENTE
  const geoEngine = useGeoEngine();
  const {
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    error: geoError
  } = geoEngine;

  // 2. CONSUMO DE MEMORIA DE FORJA (Navegación Manual)
  const { state: forgeState } = useForge();

  /**
   * RESOLUCIÓN DE IDENTIDAD NOMINATIVA (Cascada de Verdad)
   * Prioridad: Intención Editada > Nombre Manual > Detección IA > Placeholder
   */
  const displayName = useMemo(() => {
    return (
      forgeState.intentText || 
      engineData?.manualPlaceName || 
      engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName || 
      "Sintonizando Coordenadas..."
    );
  }, [forgeState.intentText, engineData]);

  /**
   * [MONITOR DE TELEMETRÍA]:
   * Registramos los cambios de estado del motor y de la UI para auditoría técnica,
   * pero YA NO forzamos el avance automático. El Administrador tiene el mando.
   */
  useEffect(() => {
    nicepodLog(`🛰️ [Geo-Orchestrator] Fase UI: ${forgeState.currentStep} | Motor: ${engineStatus}`);
    
    // Si el motor es rechazado, lo registramos claramente, pero dejamos que 
    // el componente hijo (Step 2) maneje la liberación de sus propios botones.
    if (engineStatus === 'REJECTED') {
      nicepodLog(`🛑 [Geo-Orchestrator] Alerta del Motor: Misión detenida por fallo estructural.`);
    }
  }, [forgeState.currentStep, engineStatus]);

  /**
   * stepVariants: Curvas de movimiento industrial (Aurora Glass).
   */
  const stepVariants = {
    initial: { x: 30, opacity: 0, filter: "blur(10px)" },
    animate: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      x: -30,
      opacity: 0,
      filter: "blur(10px)",
      transition: { duration: 0.3 }
    }
  };

  return (
    // [ARQUITECTURA SOBERANA]: 'min-h-0' y 'flex-col' permiten que el contenedor
    // ceda el control del scroll a sus hijos, erradicando el bloqueo en pantallas pequeñas.
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto relative selection:bg-primary/30 min-h-0">

      {/* 
          I. HUD DE TELEMETRÍA (DYNAMIC ISLAND STYLE) 
          Información vital fijada en el eje superior para conciencia situacional.
      */}
      <div className="flex-shrink-0 mb-4 px-6 pt-4 z-20">
        <RadarHUD
          status={engineStatus}
          weather={engineData?.dossier?.weather_snapshot}
          place={displayName}
          accuracy={userLocation?.accuracy || 0}
        />

        <AnimatePresence>
          {/* ALERTAS DE HARDWARE (Pérdida de Satélite) */}
          {geoError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 shadow-2xl"
            >
              <Lock size={16} className="shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Fallo Satelital</span>
                <span className="text-[8px] font-bold uppercase opacity-60 leading-relaxed">{geoError}</span>
              </div>
            </motion.div>
          )}

          {/* GUARDIA DE PROXIMIDAD (Prevención de Duplicados) */}
          {engineData?.isProximityConflict && forgeState.currentStep === 'ANCHORING' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-500 shadow-2xl"
            >
              <AlertTriangle size={16} className="shrink-0" />
              <p className="text-[9px] font-black uppercase tracking-widest leading-none text-amber-500">
                Conflicto: Un eco histórico resuena a menos de 10 metros.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
          II. BÓVEDA DE PASOS (SCROLLABLE AREA)
          El único contenedor que permite el desplazamiento vertical nativo.
      */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-12 pt-2 relative z-10">
        <AnimatePresence mode="wait">

          {/* FASE 0: IGNICIÓN SENSORIAL (Handshake T0) */}
          {engineStatus === 'IDLE' && (
            <motion.div
              key="idle_activation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-[450px] flex flex-col items-center justify-center gap-14"
            >
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <ShieldAlert size={14} className="text-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Protocolo Soberano</span>
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
                  Terminal <span className="text-primary not-italic">Geo-Locked</span>
                </h2>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed text-center">
                  Inicie el enlace con la Malla de Madrid para materializar la memoria física.
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

          {/* FASE 1: ANCLAJE CARTOGRÁFICO */}
          {engineStatus !== 'IDLE' && forgeState.currentStep === 'ANCHORING' && (
            <motion.div key="step-1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepAnchoring />
            </motion.div>
          )}

          {/* FASE 2: CAPTURA MULTIMODAL (Hero, OCR, Sonido, Semilla) */}
          {forgeState.currentStep === 'SENSORY_CAPTURE' && (
            <motion.div key="step-2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepSensoryCapture />
            </motion.div>
          )}

          {/* 
              [ESTADO DE TRANSICIÓN ELIMINADO]: 
              El estado 'INGESTING' ya no tiene pantalla propia aquí. 
              El feedback visual ('Transmitiendo Activos...') se manejará 
              íntegramente dentro del botón del Step 2. Esto evita parpadeos 
              y cambios bruscos de UI.
          */}

          {/* FASE 3: AUDITORÍA DE DOSSIER (El Filtro Humano) */}
          {forgeState.currentStep === 'DOSSIER_REVIEW' && (
            <motion.div key="step-3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepDossierReview />
            </motion.div>
          )}

          {/* FASE 4: FORJA NARRATIVA (Agente 42) */}
          {forgeState.currentStep === 'NARRATIVE_FORGE' && (
            <motion.div key="step-4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepNarrativeForge />
            </motion.div>
          )}

          {/* ESTADO FINAL: SÍNTESIS Y COMPILACIÓN (The Brain Stage) */}
          {forgeState.currentStep === 'FORGING' && (
            <motion.div 
              key="forging" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="h-[400px] flex flex-col items-center justify-center bg-[#020202] rounded-[3rem] border border-white/5 shadow-2xl mx-4"
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
                <div className="flex flex-col items-center gap-3 opacity-30 select-none">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-zinc-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.7em] text-white">Agente 42 Online</span>
                  </div>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic text-center px-4">
                    Materializando sabiduría anclada en el metal...
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
 * NOTA TÉCNICA DEL ARCHITECT (V17.0):
 * 1. Muerte del Auto-Giro: Al eliminar la lógica de transición automática basada en 
 *    'DOSSIER_READY', el componente respeta la decisión del Administrador de 
 *    permanecer en la pantalla de sensores hasta que él mismo decida avanzar.
 * 2. Purga de Pantalla de Transición: Se ha eliminado el 'motion.div' que 
 *    reemplazaba todo el Step 2 por un ojo gigante ("Ingestando"). Esta pantalla 
 *    intermedia causaba fricción cognitiva. Ahora el feedback de progreso 
 *    vivirá exclusivamente dentro del botón del Step 2.
 * 3. Aislamiento de Errores: Las alertas críticas (geoError o isProximityConflict) 
 *    tienen prioridad absoluta en el eje Z y empujan el contenido hacia abajo de 
 *    forma suave ('height: auto') sin romper el Layout principal.
 */