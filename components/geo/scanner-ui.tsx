// components/geo/scanner-ui.tsx
// VERSIÓN: 16.0 (NicePod V2.6 - Sovereign Oracle Master UI & Phase-Link Edition)
// Misión: Orquestar el flujo sensorial asegurando sincronía automática entre Engine y UI.
// [ESTABILIZACIÓN]: Integración de Sincro-Watcher, liberación de scroll y Agente 42.

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

// --- INFRAESTRUCTURA DE ESTADO Y MOTOR SOBERANO (V8.0) ---
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
  // 1. CONSUMO DEL MOTOR GEOESPACIAL SINGLETON (V8.0)
  const geoEngine = useGeoEngine();
  const {
    status: engineStatus,
    data: engineData,
    userLocation,
    initSensors,
    error: geoError
  } = geoEngine;

  // 2. CONSUMO DE MEMORIA DE FORJA (Navegación)
  const { state: forgeState, dispatch } = useForge();

  /**
   * ---------------------------------------------------------------------------
   * SINCRO-WATCHER (EL CORTAFUEGOS DE TRANSICIÓN)
   * ---------------------------------------------------------------------------
   * Este observador elimina el riesgo de "Pantalla Congelada". 
   * Detecta cuando el motor de fondo ha materializado los datos en Supabase 
   * y ordena a la UI avanzar a la siguiente fase de forma proactiva.
   */
  useEffect(() => {
    // A. Transición Automática: Ingesta -> Revisión de Dossier
    // Ocurre cuando la IA termina de analizar las fotos y el OCR.
    if (engineStatus === 'DOSSIER_READY' && forgeState.currentStep === 'INGESTING') {
      nicepodLog("🎯 [Orchestrator] Dossier materializado. Iniciando Auditoría Humana.");
      dispatch({ type: 'SET_STEP', payload: 'DOSSIER_REVIEW' });
    }

    // B. Transición Automática: Síntesis -> Finalización
    // Ocurre cuando el Agente 42 termina de forjar la crónica.
    if (engineStatus === 'NARRATIVE_READY' && forgeState.currentStep === 'FORGING') {
      nicepodLog("🎯 [Orchestrator] Crónica forjada. Sincronización completa.");
      // El Step 4 gestiona el cierre físico de la ventana hacia /map
    }

    // C. Gestión de Errores: Si el motor es rechazado, devolvemos el control al paso previo.
    if (engineStatus === 'REJECTED' && forgeState.currentStep === 'INGESTING') {
      nicepodLog("🛑 [Orchestrator] Ingesta fallida. Reabriendo terminal sensorial.");
      dispatch({ type: 'SET_STEP', payload: 'SENSORY_CAPTURE' });
    }
  }, [engineStatus, forgeState.currentStep, dispatch]);

  /**
   * RESOLUCIÓN DE IDENTIDAD NOMINATIVA (HUD Master)
   */
  const displayName = useMemo(() => {
    return (
      forgeState.intentText ||
      engineData?.manualPlaceName ||
      engineData?.dossier?.visual_analysis_dossier?.detectedOfficialName ||
      "Analizando Entorno..."
    );
  }, [forgeState.intentText, engineData]);

  /**
   * stepVariants: Curvas de movimiento industrial.
   */
  const stepVariants = {
    initial: { x: 40, opacity: 0, filter: "blur(10px)" },
    animate: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      x: -40,
      opacity: 0,
      filter: "blur(10px)",
      transition: { duration: 0.4 }
    }
  };

  return (
    // [FIX CRÍTICO]: Eliminamos 'overflow-hidden'. 'min-h-0' permite que 
    // el contenedor crezca y el scroll interno de flex-1 tome el control.
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto relative selection:bg-primary/30 min-h-0">

      {/* 
          I. HUD DE TELEMETRÍA (DYNAMIC ISLAND STYLE) 
          Información soberana fijada en el eje superior.
      */}
      <div className="flex-shrink-0 mb-4 px-6 pt-4">
        <RadarHUD
          status={engineStatus}
          weather={engineData?.dossier?.weather_snapshot}
          place={displayName}
          accuracy={userLocation?.accuracy || 0}
        />

        <AnimatePresence>
          {/* ALERTAS DE INTEGRIDAD */}
          {geoError && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 shadow-2xl">
              <Lock size={16} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Fallo Satelital</span>
                <span className="text-[8px] font-bold uppercase opacity-60">{geoError}</span>
              </div>
            </motion.div>
          )}

          {engineData?.isProximityConflict && forgeState.currentStep === 'ANCHORING' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-500 shadow-2xl">
              <AlertTriangle size={16} />
              <p className="text-[9px] font-black uppercase tracking-widest leading-none">
                Conflicto: Nodo detectado a menos de 10 metros.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 
          II. BÓVEDA DE PASOS (SCROLLABLE AREA)
          El único contenedor que permite el desplazamiento vertical.
      */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-12 pt-2">
        <AnimatePresence mode="wait">

          {/* FASE 0: ACTIVACIÓN SENSORIAL */}
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
                  Inicie el enlace con los sensores de Madrid para materializar la sabiduría.
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

          {/* FASE 1: ANCLAJE GPS / MANUAL */}
          {engineStatus !== 'IDLE' && forgeState.currentStep === 'ANCHORING' && (
            <motion.div key="step-1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepAnchoring />
            </motion.div>
          )}

          {/* FASE 2: CAPTURA FÍSICA */}
          {forgeState.currentStep === 'SENSORY_CAPTURE' && (
            <motion.div key="step-2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepSensoryCapture />
            </motion.div>
          )}

          {/* ESTADO INTERMEDIO: INGESTANDO (The Vision Stage) */}
          {forgeState.currentStep === 'INGESTING' && (
            <motion.div key="ingesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[400px] flex flex-col items-center justify-center bg-[#020202] rounded-[3rem] border border-white/5 shadow-2xl mx-4">
              <Eye className="h-16 w-16 text-primary animate-pulse mb-8" />
              <h2 className="text-3xl font-black uppercase tracking-widest text-white italic mb-4">Ingestando</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center px-8">
                El Agente 42 analiza la evidencia física y la atmósfera...
              </p>
            </motion.div>
          )}

          {/* FASE 3: AUDITORÍA HUMANA */}
          {forgeState.currentStep === 'DOSSIER_REVIEW' && (
            <motion.div key="step-3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepDossierReview />
            </motion.div>
          )}

          {/* FASE 4: CONFIGURACIÓN NARRATIVA */}
          {forgeState.currentStep === 'NARRATIVE_FORGE' && (
            <motion.div key="step-4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepNarrativeForge />
            </motion.div>
          )}

          {/* ESTADO FINAL: FORJANDO (The Brain Stage) */}
          {forgeState.currentStep === 'FORGING' && (
            <motion.div key="forging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[400px] flex flex-col items-center justify-center bg-[#020202] rounded-[3rem] border border-white/5 shadow-2xl mx-4">
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
                    Transformando evidencia en sabiduría anclada...
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
 * NOTA TÉCNICA DEL ARCHITECT (V16.0):
 * 1. Sincro-Watcher (Líneas 56-78): Es la solución definitiva al estancamiento de la UI. 
 *    Al monitorizar 'engineStatus', eliminamos la necesidad de callbacks manuales 
 *    en cada botón, logrando un flujo de estados determinista.
 * 2. Liberación de Scroll (Línea 118): El uso de 'flex-1 overflow-y-auto' junto 
 *    con la eliminación de alturas rígidas en las animaciones hijas garantiza 
 *    que el Administrador siempre pueda alcanzar el botón final de cada fase.
 * 3. Identidad Agente 42: Se ha erradicado cualquier mención al Agente 38, 
 *    sintonizando la terminal con el nuevo Oráculo Urbano de Madrid.
 */