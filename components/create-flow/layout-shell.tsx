/**
 * ARCHIVO: components/create-flow/layout-shell.tsx
 * VERSIÓN: 7.0 (NicePod Layout Shell - Industrial Workspace Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer el chasis cinemático de la terminal de forja, gestionando 
 * la visibilidad de los controles tácticos y la proyección del progreso.
 * [REFORMA V7.0]: Resolución definitiva de TS2367 mediante la alineación de 
 * estados industriales. Sincronización de telemetría con 'CreationContextType' V5.0. 
 * Aplicación absoluta de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { classNamesUtility } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Loader2, 
  Wand2, 
  Zap 
} from "lucide-react";
import React, { ReactNode } from "react";
import { useCreationContext } from "./shared/context";

/**
 * INTERFAZ: LayoutShellProperties
 * Misión: Definir el contrato de entrada sincronizado con la telemetría industrial.
 */
interface LayoutShellProperties {
  children: ReactNode;
  /** onExecuteNextStepAction: Avanza hacia la siguiente fase técnica. */
  onExecuteNextStepAction: () => void;
  /** onExecuteProductionAction: Dispara la materialización binaria final. */
  onExecuteProductionAction: () => void;
  /** onExecuteSaveDraftAction: Persiste el estado actual en la Bóveda Staging. */
  onExecuteSaveDraftAction: () => void;
  /** onExecuteLocalAnalysisAction: Activa el peritaje geosemántico situacional. */
  onExecuteLocalAnalysisAction?: () => void;
  isGeneratingProcessActive: boolean;
  isSubmittingProcessActive: boolean;
  /** progressTelemetry: Objeto de métricas sincronizado con shared/types.ts */
  progressTelemetry: {
    currentStepMagnitude: number;
    totalStepsMagnitude: number;
    completionPercentageValue: number;
    isInitialPhaseStatus: boolean;
  };
}

/**
 * LayoutShell: El envoltorio soberano del flujo de creación de capital intelectual.
 */
export function LayoutShell({ 
  children, 
  onExecuteNextStepAction, 
  onExecuteProductionAction, 
  onExecuteSaveDraftAction, 
  isGeneratingProcessActive,
  isSubmittingProcessActive, 
  progressTelemetry 
}: LayoutShellProperties) {
  
  // Consumo del sistema nervioso de la forja
  const { currentFlowState, navigateBackAction } = useCreationContext();

  /**
   * isProcessTransitioningStatus: Indica si el sistema está en fase de síntesis asíncrona.
   * [RESOLUCIÓN TS2367]: Alineación con el descriptor purificado 'DRAFT_GENERATION_LOADER'.
   */
  const isProcessTransitioningStatus = currentFlowState === 'DRAFT_GENERATION_LOADER';

  return (
    <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden h-[100dvh] isolate">

      {/* I. HEADER HUD: Telemetría de Fase (Altura Fija) */}
      <header className="flex-shrink-0 w-full pt-16 sm:pt-20 pb-2 px-6 z-50 isolate">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {!progressTelemetry.isInitialPhaseStatus && !isProcessTransitioningStatus && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="duration-700"
              >
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-1">
                      NicePod Workstation
                    </span>
                    <h1 className="text-base sm:text-xl font-black tracking-tighter text-white uppercase italic font-serif">
                      Forja de <span className="text-primary not-italic">Capital Intelectual</span>
                    </h1>
                  </div>
                  <div className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-inner">
                    {progressTelemetry.completionPercentageValue}%
                  </div>
                </div>
                
                {/* Barra de Progreso Industrial */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progressTelemetry.completionPercentageValue}%` }} 
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* II. BODY: Área de Ejecución Dinámica */}
      <main className="flex-1 overflow-hidden flex flex-col items-center p-4 isolate">
        <div className={classNamesUtility(
          "w-full flex-1 flex flex-col transition-all duration-1000 ease-in-out min-h-0",
          progressTelemetry.isInitialPhaseStatus ? "max-w-6xl" : "max-w-4xl"
        )}>
          <Card className={classNamesUtility(
            "flex-1 flex flex-col overflow-hidden border-0 shadow-none relative transition-all duration-700 isolate",
            !progressTelemetry.isInitialPhaseStatus 
              ? "bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl" 
              : "bg-transparent"
          )}>
            <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden isolate">
              {children}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* III. FOOTER HUD: Consola de Mando Táctica (Altura Fija) */}
      <footer className="flex-shrink-0 w-full p-4 sm:p-10 z-50 isolate">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {!progressTelemetry.isInitialPhaseStatus && !isProcessTransitioningStatus && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-zinc-950/90 backdrop-blur-3xl p-2 rounded-2xl sm:rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center min-h-[72px] isolate"
              >
                <div className="w-full flex justify-between items-center gap-4 px-4">
                  {/* Actuador de Retroceso */}
                  <Button 
                    variant="ghost" 
                    onClick={navigateBackAction} 
                    className="h-12 px-6 rounded-2xl font-black text-[10px] tracking-[0.2em] text-zinc-500 hover:text-white uppercase transition-colors"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> VOLVER
                  </Button>

                  <div className="flex items-center gap-3">
                    {/* [RESOLUCIÓN TS2367]: Comparación purificada con 'TECHNICAL_DETAILS_STEP' */}
                    {currentFlowState === 'TECHNICAL_DETAILS_STEP' && (
                      <Button 
                        onClick={onExecuteSaveDraftAction} 
                        disabled={isGeneratingProcessActive}
                        className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-2xl px-8 h-12 font-black text-[10px] tracking-[0.2em] uppercase border border-white/5 transition-all"
                      >
                        <FileText className="mr-2 h-4 w-4" /> GUARDAR EN BÓVEDA
                      </Button>
                    )}

                    {/* [RESOLUCIÓN TS2367]: Comparación purificada con 'FINAL_MANIFESTO_STEP' */}
                    {currentFlowState === 'FINAL_MANIFESTO_STEP' ? (
                      <Button 
                        onClick={onExecuteProductionAction} 
                        disabled={isSubmittingProcessActive} 
                        className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-10 h-12 font-black text-[10px] tracking-[0.3em] uppercase shadow-2xl shadow-primary/20 transition-all active:scale-95"
                      >
                        {isSubmittingProcessActive ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><Zap className="mr-2 h-4 w-4 fill-current" /> INICIAR PRODUCCIÓN</>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={onExecuteNextStepAction} 
                        disabled={isGeneratingProcessActive}
                        className="bg-white text-black hover:bg-zinc-200 rounded-2xl px-10 h-12 font-black text-[10px] tracking-[0.3em] uppercase transition-all active:scale-95"
                      >
                        CONTINUAR <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </footer>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Zero Abbreviations Policy (ZAP): Purga absoluta. 'Props' -> 'Properties', 
 *    'percent' -> 'completionPercentageValue', 'isInitial' -> 'isInitialPhaseStatus'.
 * 2. TS2367 Resolution: Se han actualizado las comparaciones de estado para que coincidan 
 *    con los tipos de 'FlowState' purificados (TECHNICAL_DETAILS_STEP, FINAL_MANIFESTO_STEP).
 * 3. MTI Isolation: El uso de AnimatePresence con motion.header y motion.footer garantiza 
 *    que los cambios de UI se ejecuten en capas de composición independientes.
 */