// components/geo/scanner-ui.tsx
// VERSIÓN: 13.0 (NicePod V2.6 - Sovereign Oracle UI)
// Misión: Orquestar el flujo de ingesta y narrativa bajo el mando del Agente 42.
// [ESTABILIZACIÓN]: Sincronía de nombres manuales, gestión de conflictos y purga de ruido.

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

// --- COMPONENTES ESPECIALISTAS DE FASE (STEPPER V2.6) ---
import { StepAnchoring } from "./steps/step-1-anchoring";
import { StepSensoryCapture } from "./steps/step-2-sensory-capture";
import { StepDossierReview } from "./steps/step-3-dossier-review";
import { StepNarrativeForge } from "./steps/step-4-narrative-forge";

// --- UTILIDADES DE SISTEMA ---
import { nicepodLog } from "@/lib/utils";

/**
 * COMPONENTE: GeoScannerUI
 * El puente de mando central de la Terminal de Captura Urbana.
 */
export function GeoScannerUI() {
  // 1. CONSUMO DEL MOTOR GEOESPACIAL OMNISCIENTE (V6.4)
  const geoEngine = useGeoEngine();
  const {
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    isLocked,
    error: geoError
  } = geoEngine;

  // 2. CONSUMO DE MEMORIA DE FORJA
  const { state: forgeState } = useForge();

  /**
   * RESOLUCIÓN DE IDENTIDAD NOMINATIVA:
   * Determina el nombre que debe mostrar el HUD basándose en la jerarquía de verdad:
   * 1. Nombre Manual (Admin) > 2. Nombre Detectado (IA) > 3. Placeholder
   */
  const displayName = useMemo(() => {
    return (
      forgeState.intentText || // Si el Admin lo corrigió en el Step 3
      engineData?.manualPlaceName || // Si el Admin lo forzó en el Step 1
      engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName ||
      "Anclaje en Curso..."
    );
  }, [forgeState.intentText, engineData]);

  /**
   * Trazabilidad de Misión
   */
  useEffect(() => {
    nicepodLog(`🛰️ [Geo-Orchestrator] Fase: ${forgeState.currentStep} | Hardware: ${engineStatus}`);
  }, [forgeState.currentStep, engineStatus]);

  /**
   * stepVariants: Curvas de movimiento industrial.
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
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto relative overflow-hidden selection:bg-primary/30">

      {/* 
          I. HUD DE TELEMETRÍA (DYNAMIC ISLAND STYLE) 
          Muestra la verdad de los sensores en tiempo real.
      */}
      <div className="flex-shrink-0 mb-6 px-6 pt-2">
        <RadarHUD
          status={engineStatus}
          weather={engineData?.dossier?.weather_snapshot}
          place={displayName}
          accuracy={userLocation?.accuracy || 0}
        />

        {/* ALERTA DE ERROR DE HARDWARE */}
        <AnimatePresence>
          {geoError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 shadow-2xl"
            >
              <Lock size={16} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Fallo de Enlace Satelital</span>
                <span className="text-[8px] font-bold uppercase opacity-60">{geoError}</span>
              </div>
            </motion.div>
          )}

          {/* ALERTA DE CONFLICTO DE PROXIMIDAD (NUEVO V2.6) */}
          {engineData?.isProximityConflict && forgeState.currentStep === 'ANCHORING' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-500 shadow-2xl"
            >
              <AlertTriangle size={16} />
              <p className="text-[9px] font-black uppercase tracking-widest leading-none">
                Conflicto: Existe un eco activo a menos de 10 metros.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
          II. EL BASTIDOR DE FORJA (DYNAMIC STAGE)
      */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">

          {/* FASE 0: ACTIVACIÓN SENSORIAL */}
          {engineStatus === 'IDLE' && (
            <motion.div
              key="idle_activation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-14"
            >
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <ShieldAlert size={14} className="text-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Protocolo de Autoridad</span>
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
                  Terminal <span className="text-primary not-italic">Geo-Locked</span>
                </h2>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed text-center">
                  Inicie el enlace con la Malla de Madrid para materializar memoria.
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

          {/* FASE 1: ANCLAJE */}
          {engineStatus !== 'IDLE' && forgeState.currentStep === 'ANCHORING' && (
            <motion.div key="step-1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 w-full h-full px-2">
              <StepAnchoring />
            </motion.div>
          )}

          {/* FASE 2: CAPTURA MULTIMODAL */}
          {forgeState.currentStep === 'SENSORY_CAPTURE' && (
            <motion.div key="step-2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 w-full h-full px-2">
              <StepSensoryCapture />
            </motion.div>
          )}

          {/* ESTADO INTERMEDIO: INGESTANDO */}
          {forgeState.currentStep === 'INGESTING' && (
            <motion.div key="ingesting-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020202] rounded-[3rem] border border-white/5">
              <Eye className="h-16 w-16 text-primary animate-pulse mb-8" />
              <h2 className="text-3xl font-black uppercase tracking-widest text-white italic mb-4">Ingestando</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">El Oráculo analiza la evidencia física...</p>
            </motion.div>
          )}

          {/* FASE 3: AUDITORÍA DE DOSSIER */}
          {forgeState.currentStep === 'DOSSIER_REVIEW' && (
            <motion.div key="step-3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 w-full h-full px-2">
              <StepDossierReview />
            </motion.div>
          )}

          {/* FASE 4: CONFIGURACIÓN NARRATIVA */}
          {forgeState.currentStep === 'NARRATIVE_FORGE' && (
            <motion.div key="step-4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 w-full h-full px-2">
              <StepNarrativeForge />
            </motion.div>
          )}

          {/* ESTADO FINAL: SÍNTESIS NARRATIVA (Agente 42) */}
          {forgeState.currentStep === 'FORGING' && (
            <motion.div
              key="forging-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 w-full h-full z-50 flex flex-col items-center justify-center bg-[#020202] rounded-[3rem] border border-white/5 shadow-2xl"
            >
              <div className="relative mb-14">
                <div className="absolute inset-0 bg-primary/40 blur-[100px] animate-pulse rounded-full" />
                <Loader2 className="h-24 w-24 animate-spin text-primary relative z-10" />
              </div>

              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-4 text-primary animate-pulse">
                  <Zap size={24} className="fill-current" />
                  <h2 className="text-5xl font-black uppercase tracking-[0.4em] text-white italic">
                    Sintetizando
                  </h2>
                  <Zap size={24} className="fill-current" />
                </div>
                <div className="flex flex-col items-center gap-3 opacity-30 select-none">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-zinc-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.7em] text-white leading-none">
                      Agente 42 en Línea
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">
                    Materializando sabiduría anclada en el metal...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 
          III. FOOTER TÉCNICO MINIMALISTA 
          Eliminamos el banner redundante y dejamos solo la marca de autoridad.
      */}
      <div className="flex-shrink-0 py-6 px-12 border-t border-white/5 bg-[#020202]/50">
        <div className="flex justify-center items-center opacity-10 select-none">
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-black uppercase tracking-[1em] text-white">NiceCore</span>
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[8px] font-black uppercase tracking-[1em] text-white">V2.6</span>
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V13.0):
 * 1. Especialización de Agente: Se ha erradicado cualquier referencia al 
 *    Agente 38. El 'Agente 42' es ahora el dueño oficial de la narrativa urbana.
 * 2. Visualización de Conflictos: La inyección de 'isProximityConflict' permite 
 *    que el Admin sepa que está sembrando en una zona saturada ANTES de 
 *    confirmar el anclaje, protegiendo la calidad de la Bóveda.
 * 3. Optimización Táctil: Al simplificar el footer, garantizamos que el 
 *    botón principal de cada Step siempre esté en la zona de pulsación ideal 
 *    del pulgar (Thumb-Zone), vital para el uso en exteriores.
 */