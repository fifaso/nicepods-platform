// components/geo/scanner-ui.tsx
// VERSIÓN: 12.0 (NicePod V2.6 - Sovereign Dual Brain UI)
// Misión: Orquestar la captura táctil, el puente de ingesta y la forja narrativa.
// [ESTABILIZACIÓN]: Soporte para DOSSIER_REVIEW y visibilidad de procesamiento asíncrono.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  Loader2,
  Lock,
  Power,
  ShieldAlert,
  Sparkles,
  Terminal as TerminalIcon,
  Zap
} from "lucide-react";
import { useEffect } from "react";

// --- INFRAESTRUCTURA DE ESTADO Y MOTOR SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "./forge-context";
import { RadarHUD } from "./radar-hud";

// --- COMPONENTES ESPECIALISTAS DE FASE (EL STEPPER) ---
import { StepAnchoring } from "./steps/step-1-anchoring";
import { StepSensoryCapture } from "./steps/step-2-sensory-capture"; // Renombrado lógicamente
import { StepDossierReview } from "./steps/step-3-dossier-review"; // NUEVO: Revisión de Verdad
import { StepNarrativeForge } from "./steps/step-4-narrative-forge"; // Antiguo Intention

// --- UTILIDADES DE SISTEMA ---
import { nicepodLog } from "@/lib/utils";

/**
 * COMPONENTE: GeoScannerUI
 * El puente de mando sensorial de NicePod V2.6.
 */
export function GeoScannerUI() {
  const geoEngine = useGeoEngine();
  const {
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    isLocked,
    error: geoError
  } = geoEngine;

  const { state: forgeState } = useForge();

  useEffect(() => {
    nicepodLog(`🛰️ [Geo-Orchestrator] UI Step: ${forgeState.currentStep} | Engine: ${engineStatus}`);
  }, [forgeState.currentStep, engineStatus]);

  const stepVariants = {
    initial: { x: 40, opacity: 0, filter: "blur(12px)" },
    animate: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      x: -40,
      opacity: 0,
      filter: "blur(12px)",
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto relative overflow-hidden selection:bg-primary/30">

      {/* 
          I. HUD DE TELEMETRÍA (CAPA DE CONCIENCIA) 
      */}
      <div className="flex-shrink-0 mb-8 px-4">
        <RadarHUD
          status={engineStatus}
          weather={engineData?.dossier?.weather_snapshot}
          place={engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName || "Madrid Resonance"}
          accuracy={userLocation?.accuracy || 0}
        />

        <AnimatePresence>
          {geoError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 shadow-2xl"
            >
              <Lock size={18} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Alerta Estructural</span>
                <span className="text-[8px] font-bold uppercase opacity-60">{geoError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
          II. EL BASTIDOR DE FORJA (CEREBRO DUAL STAGE)
      */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">

          {/* FASE 0: ACTIVACIÓN (HANDSHAKE) */}
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
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Protocolo Soberano</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                  Terminal <span className="text-primary not-italic">Geo-Locked</span>
                </h2>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                  Autorice el enlace de sensores para inicializar el módulo de captura.
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

          {/* FASE 1: ANCLAJE (GPS o MANUAL) */}
          {engineStatus !== 'IDLE' && forgeState.currentStep === 'ANCHORING' && (
            <motion.div key="step-1-anchoring" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 w-full h-full px-2">
              <StepAnchoring />
            </motion.div>
          )}

          {/* FASE 2: CAPTURA FÍSICA (FOTOS/AUDIO) */}
          {forgeState.currentStep === 'SENSORY_CAPTURE' && (
            <motion.div key="step-2-sensory" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 w-full h-full px-2">
              <StepSensoryCapture />
            </motion.div>
          )}

          {/* ESTADO INTERMEDIO: INGESTANDO (Subida + OCR IA) */}
          {forgeState.currentStep === 'INGESTING' && (
            <motion.div key="ingesting-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020202] rounded-[3rem] border border-white/5">
              <Eye className="h-16 w-16 text-primary animate-pulse mb-8" />
              <h2 className="text-3xl font-black uppercase tracking-widest text-white italic mb-4">Ingestando</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Analizando evidencia visual y atmósfera...</p>
            </motion.div>
          )}

          {/* FASE 3: REVISIÓN DE DOSSIER (NUEVO V2.6) */}
          {forgeState.currentStep === 'DOSSIER_REVIEW' && (
            <motion.div key="step-3-review" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 w-full h-full px-2">
              <StepDossierReview />
            </motion.div>
          )}

          {/* FASE 4: CONFIGURACIÓN NARRATIVA */}
          {forgeState.currentStep === 'NARRATIVE_FORGE' && (
            <motion.div key="step-4-narrative" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 w-full h-full px-2">
              <StepNarrativeForge />
            </motion.div>
          )}

          {/* ESTADO FINAL: FORJANDO EL GUION (Agente 38) */}
          {forgeState.currentStep === 'FORGING' && (
            <motion.div key="forging-critical-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020202] rounded-[3rem] border border-white/5 shadow-2xl">
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
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">El Agente 38 está forjando la crónica...</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 
          III. FOOTER TÉCNICO 
      */}
      <div className="flex-shrink-0 py-10 px-12 border-t border-white/5">
        <div className="flex justify-between items-center opacity-20 select-none grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">
                {isLocked ? 'Anclaje Bloqueado' : 'Sensor Activo'}
              </span>
            </div>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <TerminalIcon size={16} className="text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500 italic">
                NiceCore Engine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[1em] text-white">V2.6</span>
            <Sparkles size={14} className="text-primary" />
          </div>
        </div>
      </div>

    </div>
  );
}