// components/geo/scanner-ui.tsx
// VERSIÓN: 11.0

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Loader2,
  Lock,
  Power,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal as TerminalIcon,
  Zap
} from "lucide-react";
import { useEffect } from "react";

// --- INFRAESTRUCTURA DE ESTADO Y MOTOR SOBERANO ---
// ForgeProvider: Almacena la memoria de fotos, audios y parámetros entre pantallas.
import { useForge } from "./forge-context";
// useGeoEngine: El motor V5.0 con protocolo 'Steady Pulse' (Throttling & Lock).
import { GeoEngineReturn, useGeoEngine } from "./use-geo-engine";
// RadarHUD: El panel de telemetría constante.
import { RadarHUD } from "./radar-hud";

// --- COMPONENTES ESPECIALISTAS DE FASE (EL STEPPER) ---
// La lógica de captura se ha delegado a estos archivos para un mantenimiento quirúrgico.
import { StepAnchoring } from "./steps/step-1-anchoring";
import { StepEvidence } from "./steps/step-2-evidence";
import { StepIntention } from "./steps/step-3-intention";

// --- UTILIDADES DE SISTEMA ---
import { nicepodLog } from "@/lib/utils";

/**
 * COMPONENTE: GeoScannerUI
 * El puente de mando sensorial de NicePod V2.5.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * Este componente actúa como el director de escena. Su única misión es gestionar 
 * el ciclo de vida de la misión de siembra, sincronizando el hardware del 
 * Administrador con la Bóveda Global.
 */
export function GeoScannerUI() {
  // 1. CONSUMO DEL MOTOR GEOESPACIAL (V5.0)
  // Realizamos un casting a 'GeoEngineReturn' para asegurar que TS reconozca
  // las facultades 'initSensors' y 'userLocation'.
  const geoEngine = useGeoEngine() as GeoEngineReturn;
  const {
    status,
    data,
    userLocation,
    initSensors,
    isLocked,
    error: geoError
  } = geoEngine;

  // 2. CONSUMO DE MEMORIA DE FORJA (Estado del Stepper)
  const { state } = useForge();

  /**
   * [LOG TÁCTICO]: Trazabilidad de Misión
   * Documentamos cada cambio de estado para auditoría de rendimiento.
   */
  useEffect(() => {
    nicepodLog(`🛰️ [Geo-Orchestrator] Fase de Misión: ${state.currentStep} | Status: ${status}`);
  }, [state.currentStep, status]);

  /**
   * stepVariants: Curvas de movimiento industrial.
   * Diseñadas para transmitir una sensación de hardware reactivo y fluido.
   */
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
          Mantiene al Administrador informado con datos reales del hardware.
      */}
      <div className="flex-shrink-0 mb-8 px-4">
        <RadarHUD
          status={status}
          weather={data?.weather}
          place={data?.place?.poiName}
          // [FIX]: Enviamos la precisión real (accuracy) del sensor.
          accuracy={userLocation?.accuracy || 0}
        />

        {/* Alerta de Integridad de Sensores */}
        <AnimatePresence>
          {geoError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 shadow-2xl"
            >
              <Lock size={18} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Error de Sincronía</span>
                <span className="text-[8px] font-bold uppercase opacity-60">{geoError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
          II. EL BASTIDOR DE FORJA (DYNAMIC STAGE)
          Aquí se proyectan las 3 fases de la captura multimodal.
      */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">

          {/* FASE 0: ACTIVACIÓN DE SENSORES (USER GESTURE) */}
          {status === 'IDLE' && (
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
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Protocolo de Seguridad</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                  Terminal <span className="text-primary not-italic">Geo-Locked</span>
                </h2>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                  Autorice el enlace con los satélites de posición para iniciar la misión.
                </p>
              </div>

              <button
                onClick={initSensors}
                className="h-32 w-32 rounded-full bg-primary/5 border-2 border-primary/20 text-primary hover:bg-primary hover:text-black transition-all duration-700 group shadow-[0_0_60px_rgba(var(--primary),0.1)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <Power size={48} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </button>

              <div className="flex items-center gap-4 opacity-20">
                <ShieldCheck size={16} className="text-zinc-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white italic">Hardware Handshake Ready</span>
              </div>
            </motion.div>
          )}

          {/* FASE 1: ANCLAJE GPS Y CATEGORÍA */}
          {status !== 'IDLE' && state.currentStep === 'ANCHORING' && (
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

          {/* FASE 2: RECOLECCIÓN DE EVIDENCIA (FOTOS/AUDIO) */}
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

          {/* FASE 3: SEMILLA DE INTENCIÓN NARRATIVA */}
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

          {/* ESTADO DE FORJA: PROCESAMIENTO BINARIO (THE VOID) */}
          {state.currentStep === 'FORGING' && (
            <motion.div
              key="forging-critical-state"
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
                    Forjando
                  </h2>
                  <Zap size={24} className="fill-current" />
                </div>
                <div className="flex flex-col items-center gap-3 opacity-30 select-none">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-zinc-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.7em] text-white leading-none">
                      Sincronizando Bóveda
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">
                    Inyectando sabiduría en la malla urbana...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 
          III. FOOTER DE STATUS TÉCNICO 
          Consolida la identidad industrial de la Workstation NicePod.
      */}
      <div className="flex-shrink-0 py-10 px-12 border-t border-white/5">
        <div className="flex justify-between items-center opacity-20 select-none grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Uplink Nominal</span>
            </div>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <TerminalIcon size={16} className="text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500 italic">
                Admin Workstation Terminal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[1em] text-white">V2.5.98</span>
            <Sparkles size={14} className="text-primary" />
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Fuga de Telemetría: El envío de 'accuracy' al RadarHUD asegura 
 *    que el Administrador tenga una validación visual del hardware antes de 
 *    proceder con la siembra (Fix 0.0M issue).
 * 2. Arquitectura de Gesto: La transición manual 'IDLE -> SENSORS_READY' rompe el 
 *    bucle de errores del GPS al asegurar que la API se invoque tras un click 
 *    físico, cumpliendo con la gobernanza de Chrome.
 * 3. Inmersión 'The Void': El estado 'FORGING' utiliza un fondo sólido #020202 
 *    para anular cualquier distracción visual, enfocando la carga cognitiva en 
 *    la síntesis de la Bóveda.
 */