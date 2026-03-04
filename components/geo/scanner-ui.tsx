// components/geo/scanner-ui.tsx
// VERSIÓN: 11.0

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Loader2,
  Lock,
  Power,
  ShieldCheck,
  Sparkles,
  Terminal as TerminalIcon,
  Zap
} from "lucide-react";
import { useEffect } from "react";

// --- INFRAESTRUCTURA DE ESTADO Y MOTOR SOBERANO ---
// ForgeProvider: Almacena la memoria de fotos y audios entre pantallas.
import { useForge } from "./forge-context";
// useGeoEngine: Sintoniza el hardware GPS y resuelve el clima.
import { GeoEngineReturn, useGeoEngine } from "./use-geo-engine";
// RadarHUD: HUD de telemetría constante.
import { RadarHUD } from "./radar-hud";

// --- COMPONENTES DE FASE (STEPPER MODULAR) ---
// Extraemos la complejidad a archivos especialistas para un mantenimiento limpio.
import { StepAnchoring } from "./steps/step-1-anchoring";
import { StepEvidence } from "./steps/step-2-evidence";
import { StepIntention } from "./steps/step-3-intention";

// --- UTILIDADES DE SISTEMA ---
import { nicepodLog } from "@/lib/utils";

/**
 * COMPONENTE: GeoScannerUI
 * El centro de mando sensorial de NicePod V2.5.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * Este componente actúa como el orquestador de alto nivel. Su única función es 
 * gestionar el ciclo de vida de la misión de siembra, delegando la captura 
 * física a los componentes satélites (Steps).
 */
export function GeoScannerUI() {
  // 1. CONSUMO DEL MOTOR GEOESPACIAL (V4.0)
  // [SINCRO]: Casting a GeoEngineReturn para garantizar integridad de tipos.
  const geoEngine = useGeoEngine() as GeoEngineReturn;
  const {
    status,
    data,
    userLocation,
    initSensors,
    error: geoError
  } = geoEngine;

  // 2. CONSUMO DE MEMORIA DE FORJA (Stepper State)
  const { state } = useForge();

  /**
   * [LOG TÁCTICO]: Trazabilidad de Progresión
   * Registramos el avance en la consola industrial para diagnóstico remoto.
   */
  useEffect(() => {
    nicepodLog(`🛰️ [Geo-Orchestrator] Fase Activa: ${state.currentStep}`);
  }, [state.currentStep]);

  /**
   * stepVariants: Curvas cinemáticas para la transición entre fases.
   * Diseñadas para transmitir una sensación de fluidez nativa.
   */
  const stepVariants = {
    initial: { x: 30, opacity: 0, filter: "blur(10px)" },
    animate: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      x: -30,
      opacity: 0,
      filter: "blur(10px)",
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative overflow-hidden selection:bg-primary/30">

      {/* 
          I. HUD DE TELEMETRÍA (CONSTANTE) 
          Mantiene al Administrador informado sin importar en qué paso se encuentre.
      */}
      <div className="flex-shrink-0 mb-6 px-4">
        <RadarHUD
          status={status}
          weather={data?.weather}
          place={data?.place?.poiName}
          accuracy={userLocation?.accuracy || 0}
        />

        {/* Notificación de Error de Sensores */}
        <AnimatePresence>
          {geoError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 shadow-xl"
            >
              <Lock size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                Alerta de Señal: {geoError}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
          II. EL BASTIDOR DINÁMICO (THE FORGE STAGE)
          Aquí es donde se materializan las pantallas del Stepper.
      */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">

          {/* FASE 0: ACTIVACIÓN (USER GESTURE POLICY) */}
          {status === 'IDLE' && (
            <motion.div
              key="idle_init"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
                  Terminal <span className="text-primary not-italic">Geo-Locked</span>
                </h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">
                  Active los sensores para sincronizar la frecuencia con la ciudad.
                </p>
              </div>

              <button
                onClick={initSensors}
                className="h-32 w-32 rounded-full bg-primary/5 border-2 border-primary/20 text-primary hover:bg-primary hover:text-black transition-all duration-700 group shadow-[0_0_50px_rgba(var(--primary),0.1)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <Power size={48} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </button>

              <div className="flex items-center gap-4 opacity-20">
                <ShieldCheck size={16} className="text-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Security Handshake Ready</span>
              </div>
            </motion.div>
          )}

          {/* FASE 1: ANCLAJE GPS (ANCHORING) */}
          {status !== 'IDLE' && state.currentStep === 'ANCHORING' && (
            <motion.div
              key="step-anchoring"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <StepAnchoring />
            </motion.div>
          )}

          {/* FASE 2: EVIDENCIA MULTIMODAL (EVIDENCE) */}
          {state.currentStep === 'EVIDENCE' && (
            <motion.div
              key="step-evidence"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <StepEvidence />
            </motion.div>
          )}

          {/* FASE 3: SEMILLA DE INTENCIÓN NARRATIVA (INTENTION) */}
          {state.currentStep === 'INTENTION' && (
            <motion.div
              key="step-intention"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <StepIntention />
            </motion.div>
          )}

          {/* ESTADO FINAL: FORJANDO (THE VOID PROCESSING) */}
          {state.currentStep === 'FORGING' && (
            <motion.div
              key="forging-processing"
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
                      Sincronizando Bóveda Urbana
                    </span>
                  </div>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                    Consolidando evidencia en la malla semántica...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 
          III. PIE DE TERMINAL (SISTEMA DE STATUS) 
          Branding sutil que refuerza la identidad industrial de la Workstation.
      */}
      <div className="flex-shrink-0 py-8 px-12 border-t border-white/5 opacity-20 select-none">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Uplink Nominal</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <TerminalIcon size={14} className="text-zinc-500" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500 italic">NicePod Spatial Hub</span>
            </div>
          </div>
          <Sparkles size={14} className="text-primary" />
        </div>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Desacoplamiento de Lógica: El orquestador ya no conoce los detalles de la cámara o 
 *    el mapa. Esto permite escalar cada fase de forma independiente sin riesgo 
 *    de colapsar este archivo central.
 * 2. Gestión de Estados: La transición a 'SENSORS_READY' tras el click manual es 
 *    la garantía técnica contra las restricciones de geolocalización de Chrome 2026.
 * 3. Consistencia Visual: Se ha unificado la tipografía 'font-black uppercase' y el 
 *    radio de borde masivo [3rem] para que la terminal se sienta como un hardware 
 *    profesional integrado en NicePod V2.5.
 */