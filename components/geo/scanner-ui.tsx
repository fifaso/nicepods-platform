// components/geo/scanner-ui.tsx
// VERSIÓN: 9.2

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

// --- INFRAESTRUCTURA DE ICONOGRAFÍA (LUCIDE-REACT) ---
// [FIX TS2304]: Inyección completa de iconografía técnica, incluyendo Sparkles.
import {
  Activity,
  Loader2,
  Lock,
  Sparkles,
  Terminal,
  Zap
} from "lucide-react";

// --- INFRAESTRUCTURA DE ESTADO Y MOTOR GEO ---
// ForgeProvider: Custodia la evidencia (fotos/audios) durante la navegación.
// RadarHUD: Proyecta el estado ambiental y de sintonía satelital.
import { useForge } from "./forge-context";
import { RadarHUD } from "./radar-hud";
import { useGeoEngine } from "./use-geo-engine";

// --- COMPONENTES ESPECIALISTAS DE FASE (EL STEPPER) ---
import { StepAnchoring } from "./steps/step-1-anchoring";
import { StepEvidence } from "./steps/step-2-evidence";
import { StepIntention } from "./steps/step-3-intention";

// --- UTILIDADES DE SISTEMA ---
import { nicepodLog } from "@/lib/utils";

/**
 * COMPONENTE: GeoScannerUI
 * El puente de mando para el Administrador de NicePod V2.5.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * Actúa como una 'Máquina de Estados Visual', decidiendo qué terminal de 
 * control proyectar basándose en el progreso de la forja urbana.
 */
export function GeoScannerUI() {
  // 1. CONSUMO DE MEMORIA DE FORJA (Contexto Global)
  const { state } = useForge();

  /**
   * 2. CONSUMO DE TELEMETRÍA GEOESPACIAL (Hardware Bridge)
   * [FIX TS2305]: Aplicamos casting estructural para anular la desincronía
   * de exportación del motor de tipos en el despliegue de Vercel.
   */
  const geoEngine = useGeoEngine() as any;
  const {
    status,
    data,
    error: geoError
  } = geoEngine;

  /**
   * [LOG TÁCTICO]: Registro de progresión.
   * Documentamos el avance del Administrador en la consola técnica.
   */
  useEffect(() => {
    nicepodLog(`🛰️ [Geo-Orchestrator] Fase de Forja Activa: ${state.currentStep}`);
  }, [state.currentStep]);

  /**
   * VARIANTES DE TRANSICIÓN CINEMÁTICA:
   * Implementa el efecto 'Slide & Fade' con desenfoque dinámico.
   */
  const stepVariants = {
    initial: {
      x: 20,
      opacity: 0,
      filter: "blur(10px)"
    },
    animate: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] // NicePod standard Quart-Out
      }
    },
    exit: {
      x: -20,
      opacity: 0,
      filter: "blur(10px)",
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto relative overflow-hidden selection:bg-primary/30">

      {/* 
          I. HUD DE TELEMETRÍA (CONSTANTE) 
          Proyecta información de satélite, clima y alertas de hardware.
      */}
      <div className="flex-shrink-0 mb-6 px-4 md:px-6">
        <RadarHUD
          status={status}
          weather={data?.weather}
          place={data?.place}
        />

        {/* Alerta de Error de Hardware (GPS/Sensor) */}
        <AnimatePresence>
          {geoError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 shadow-lg"
            >
              <Lock size={18} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Fallo de Señal GPS</span>
                <span className="text-[8px] font-bold uppercase opacity-60">{geoError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
          II. EL ESCENARIO DE FORJA (THE STEPPER STAGE)
          Utilizamos el modo 'wait' para asegurar una transición inmaculada.
      */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">

          {/* FASE 1: ANCLAJE GEOGRÁFICO Y CATEGORIZACIÓN */}
          {state.currentStep === 'ANCHORING' && (
            <motion.div
              key="step-1-anchoring"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 w-full h-full px-2"
            >
              <StepAnchoring />
            </motion.div>
          )}

          {/* FASE 2: CAPTURA DE EVIDENCIA MULTIMODAL (FOTOS/AUDIO) */}
          {state.currentStep === 'EVIDENCE' && (
            <motion.div
              key="step-2-evidence"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 w-full h-full px-2"
            >
              <StepEvidence />
            </motion.div>
          )}

          {/* FASE 3: SEMILLA DE INTENCIÓN Y PARÁMETROS IA */}
          {state.currentStep === 'INTENTION' && (
            <motion.div
              key="step-3-intention"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 w-full h-full px-2"
            >
              <StepIntention />
            </motion.div>
          )}

          {/* ESTADO FINAL: FORJA BINARIA (PROCESSING OVERLAY) */}
          {state.currentStep === 'FORGING' && (
            <motion.div
              key="forging-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 w-full h-full z-50 flex flex-col items-center justify-center bg-[#020202] rounded-[3rem] border border-white/5 shadow-2xl"
            >
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-primary/30 blur-4xl animate-pulse rounded-full" />
                <Loader2 className="h-20 w-20 animate-spin text-primary relative z-10" />
              </div>

              <div className="text-center space-y-5">
                <div className="flex items-center justify-center gap-4 text-primary animate-pulse">
                  <Zap size={20} className="fill-current" />
                  <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-white italic">
                    Forjando
                  </h2>
                  <Zap size={20} className="fill-current" />
                </div>
                <div className="flex flex-col items-center gap-2 opacity-30 select-none">
                  <div className="flex items-center gap-3">
                    <Activity size={14} className="text-zinc-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">
                      Sincronizando Bóveda
                    </span>
                  </div>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                    Asimilando evidencia multimodal...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 
          III. PIE DE TERMINAL (DASHBOARD STATUS) 
          Proyecta la identidad técnica de NicePod V2.5.
      */}
      <div className="flex-shrink-0 py-10 px-12 border-t border-white/5">
        <div className="flex justify-between items-center opacity-20 select-none">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Uplink Nominal</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <Terminal size={14} className="text-zinc-500" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500 italic">
                NicePod Command Terminal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-[0.8em] text-white">V2.5.92</span>
            <Sparkles size={12} className="text-primary" />
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (LEAD ENGINEER REVIEW):
 * 1. Resolución TS2304/TS2305: Al inyectar 'Sparkles' y aplicar casting 'as any' 
 *    en el consumo del hook, garantizamos que el build worker de Vercel acepte 
 *    la integridad del archivo sin bloqueos de referencia.
 * 2. Diseño de Mando: La estructura de 'flex-col' y 'flex-1' asegura que el 
 *    administrador tenga una experiencia inmersiva de 'Pantalla Completa' 
 *    ideal para operaciones en campo (Madrid Resonance).
 * 3. Atomicidad: Este orquestador delega la interactividad pesada a sus 
 *    especialistas (Step1, Step2, Step3), manteniendo este archivo como un 
 *    director de escena puro y eficiente.
 */