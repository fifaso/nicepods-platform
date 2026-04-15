/**
 * ARCHIVO: components/create-flow/steps/pulse-radar-step.tsx
 * VERSIÓN: 3.0 (NicePod Strategic Radar - Industrial Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Visualizar e interactuar con las señales de inteligencia (Pulse) 
 * interceptadas por el Oráculo, permitiendo la curaduría de materia prima cognitiva.
 * [REFORMA V3.0]: Resolución definitiva de TS2339. Sincronización nominal absoluta 
 * con 'CreationContextType' V5.0 y 'PodcastCreationSchema' V12.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { classNamesUtility, nicepodLog } from "@/lib/utils";
import { PulseMatchResult } from "@/types/pulse";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  Radar,
  Search,
  TrendingUp,
  Zap,
  Loader2
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";

/**
 * PulseRadarStep: La terminal de intercepción de capital intelectual.
 */
export function PulseRadarStep() {
  // 1. CONSUMO DE INFRAESTRUCTURA Y SISTEMA NERVIOSO
  const { supabaseSovereignClient } = useAuth();
  const { toast: userNotificationToast } = useToast();
  
  // Consumo del motor de formularios bajo tipado estricto V12.0
  const { setValue, watch } = useFormContext<PodcastCreationData>();
  
  /** [RESOLUCIÓN TS2339]: Sincronización con los actuadores del Contexto V5.0. */
  const { 
    transitionToNextStateAction, 
    creationProcessProgressMetrics 
  } = useCreationContext();

  // 2. ESTADOS DE GESTIÓN DE INTERFAZ (ZAP COMPLIANT)
  const [pulseSignalsCollection, setPulseSignalsCollection] = useState<PulseMatchResult[]>([]);
  const [isRadarScanningProcessActiveStatus, setIsRadarScanningProcessActiveStatus] = useState<boolean>(true);
  const [radarOperationalExceptionMessageContent, setRadarOperationalExceptionMessageContent] = useState<string | null>(null);

  /** [SINCRO V12.0]: Observación del campo purificado 'pulseSourceIdentificationsCollection'. */
  const selectedPulseSourceIdentificationsCollection: string[] = watch("pulseSourceIdentificationsCollection") || [];

  /**
   * executeRadarScanAction: 
   * Misión: Orquestar la invocación al motor de matching vectorial (Edge Function).
   */
  const executeRadarScanAction = useCallback(async () => {
    setIsRadarScanningProcessActiveStatus(true);
    setRadarOperationalExceptionMessageContent(null);
    nicepodLog("📡 [Pulse-Radar] Iniciando barrido de frecuencias semánticas...");

    try {
      const { data: edgeFunctionResponseSnapshot, error: edgeFunctionHardwareException } = 
        await supabaseSovereignClient.functions.invoke('pulse-matcher');

      if (edgeFunctionHardwareException) {
        throw new Error("Interrupción en la sincronización de red con los radares globales.");
      }

      if (edgeFunctionResponseSnapshot && edgeFunctionResponseSnapshot.signals && Array.isArray(edgeFunctionResponseSnapshot.signals)) {
        setPulseSignalsCollection(edgeFunctionResponseSnapshot.signals as PulseMatchResult[]);

        if (edgeFunctionResponseSnapshot.is_fallback) {
          userNotificationToast({
            title: "Modo Cobertura Global",
            description: "Ajuste su perfil genético digital para interceptar señales locales.",
            variant: "default"
          });
        }
      } else {
        setPulseSignalsCollection([]);
      }
    } catch (hardwareException: unknown) {
      const exceptionMessageContent = hardwareException instanceof Error 
        ? hardwareException.message 
        : "No se detectaron frecuencias útiles en la malla.";
        
      setRadarOperationalExceptionMessageContent(exceptionMessageContent);
      userNotificationToast({
        title: "Fallo de Intercepción",
        description: exceptionMessageContent,
        variant: "destructive"
      });
    } finally {
      // Retardo estético para sincronizar con la cinemática Aurora (MTI Protection).
      setTimeout(() => setIsRadarScanningProcessActiveStatus(false), 1500);
    }
  }, [supabaseSovereignClient, userNotificationToast]);

  useEffect(() => {
    executeRadarScanAction();
  }, [executeRadarScanAction]);

  /**
   * handlePulseSourceSelectionToggleAction:
   * Misión: Gestionar la inclusión de nodos en el expediente de síntesis.
   */
  const handlePulseSourceSelectionToggleAction = (targetSourceIdentificationValue: string) => {
    const updatedSelectedIdentificationsCollection = [...selectedPulseSourceIdentificationsCollection];
    const sourceIndexMagnitudePosition = updatedSelectedIdentificationsCollection.indexOf(targetSourceIdentificationValue);

    if (sourceIndexMagnitudePosition > -1) {
      updatedSelectedIdentificationsCollection.splice(sourceIndexMagnitudePosition, 1);
    } else {
      if (updatedSelectedIdentificationsCollection.length >= 5) {
        userNotificationToast({
          title: "Saturación de Carga",
          description: "Seleccione un máximo de 5 nodos para una síntesis de alta densidad.",
          variant: "destructive"
        });
        return;
      }
      updatedSelectedIdentificationsCollection.push(targetSourceIdentificationValue);
    }
    
    // Inyección de estado hacia el esquema ZAP V12.0.
    setValue("pulseSourceIdentificationsCollection", updatedSelectedIdentificationsCollection, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 md:p-10 overflow-hidden isolate">

      {/* I. CABECERA TÁCTICA: Identidad de Radar */}
      <header className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-8 mb-10 z-10 isolate">
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
            <Radar size={16} className={classNamesUtility(isRadarScanningProcessActiveStatus && "animate-spin")} />
            Escáner de Inteligencia Estratégica
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none italic font-serif">
            Radar <span className="text-primary not-italic">Pulse</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden md:block">
              Capital Intelectual interceptado en tiempo real en la malla global.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#0a0a0a]/60 p-5 rounded-[2rem] border border-white/10 backdrop-blur-3xl shadow-2xl isolate">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1.5">Materia Prima</p>
            <p className="text-xl font-black text-white tabular-nums">
                {selectedPulseSourceIdentificationsCollection.length} <span className="text-white/20">/ 5</span>
            </p>
          </div>
          <Button
            disabled={selectedPulseSourceIdentificationsCollection.length === 0 || isRadarScanningProcessActiveStatus}
            onClick={() => transitionToNextStateAction('AGENT_TONE_SELECTION')}
            className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-95 border-none"
          >
            Sintonizar Píldora
          </Button>
        </div>
      </header>

      {/* II. CUERPO DINÁMICO: Reactor de Señales */}
      <div className="flex-1 min-h-0 relative z-0 isolate">
        <AnimatePresence mode="wait">
          
          {isRadarScanningProcessActiveStatus ? (
            /* ESTADO A: ESCANEO DE FRECUENCIAS */
            <motion.div
              key="radar_scanning_active_state"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative isolate">
                <div className="h-40 w-40 rounded-full border-2 border-primary/20 animate-ping absolute inset-[-20px] z-0" />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="h-28 w-28 rounded-full border-t-2 border-primary animate-spin" />
                </div>
                <Zap size={48} className="text-primary animate-pulse relative z-20 fill-current" />
              </div>
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary animate-pulse text-center">
                  Sincronizando con la red de autoridad global...
              </p>
            </motion.div>

          ) : radarOperationalExceptionMessageContent || (pulseSignalsCollection.length === 0 && !isRadarScanningProcessActiveStatus) ? (
            /* ESTADO B: DISONANCIA O VACÍO DE RED */
            <motion.div 
              key="radar_empty_signal_state" 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6 isolate"
            >
              <div className="p-8 bg-white/[0.02] rounded-full border border-white/5 shadow-inner">
                <Search size={48} className="text-zinc-800" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight italic font-serif">Frecuencia Silenciosa</h3>
              <p className="text-zinc-500 max-w-sm text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                No se detectaron señales de alta prioridad en su malla de interés. Intente recalibrar su ADN cognitivo.
              </p>
              <Button 
                onClick={executeRadarScanAction} 
                variant="outline" 
                className="h-12 px-8 border-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all shadow-xl"
              >
                Disparar Barrido Manual
              </Button>
            </motion.div>

          ) : (
            /* ESTADO C: PROYECCIÓN DE NODOS INTERCEPTADOS */
            <motion.div
              key="radar_active_signals_state"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-4 custom-scrollbar pb-20 isolate"
            >
              {pulseSignalsCollection.map((signalEntryItem, itemIndexMagnitude) => {
                const isNodeSelectedForSynthesisStatus = selectedPulseSourceIdentificationsCollection.includes(signalEntryItem.id);

                return (
                  <motion.div
                    key={signalEntryItem.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: itemIndexMagnitude * 0.06 }}
                    onClick={() => handlePulseSourceSelectionToggleAction(signalEntryItem.id)}
                    className={classNamesUtility(
                      "group relative p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer overflow-hidden isolate shadow-2xl",
                      isNodeSelectedForSynthesisStatus
                        ? "bg-white text-zinc-950 border-white scale-[1.03] z-20 shadow-primary/10"
                        : "bg-[#0a0a0a]/60 border-white/5 hover:border-primary/40 text-white z-0"
                    )}
                  >
                    {/* INDICADOR DE ALTO VALOR ESTRATÉGICO */}
                    {signalEntryItem.is_high_value && !isNodeSelectedForSynthesisStatus && (
                      <div className="absolute top-0 right-0 p-5 z-20">
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-lg">
                          Fondo de Autoridad
                        </Badge>
                      </div>
                    )}

                    <div className="space-y-6 relative z-10 isolate">
                      
                      <div className="flex items-center gap-5">
                        <div className={classNamesUtility(
                          "p-4 rounded-2xl shadow-inner transition-colors duration-500",
                          isNodeSelectedForSynthesisStatus ? "bg-primary/10 text-primary" : "bg-white/5 text-primary"
                        )}>
                          {signalEntryItem.content_type === 'paper' ? <FileText size={24} /> : <Globe size={24} />}
                        </div>
                        <div className="flex flex-col min-w-0 pr-6">
                          <span className={classNamesUtility(
                            "text-[10px] font-black uppercase tracking-[0.2em] truncate", 
                            isNodeSelectedForSynthesisStatus ? "text-zinc-500" : "text-white/40"
                          )}>
                            {signalEntryItem.source_name}
                          </span>
                          <span className="flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest mt-1">
                            <TrendingUp size={14} /> {signalEntryItem.match_percentage}% Resonancia
                          </span>
                        </div>
                      </div>

                      <h3 className="font-black text-base md:text-lg leading-tight uppercase tracking-tight line-clamp-2 italic font-serif">
                        {signalEntryItem.title}
                      </h3>

                      <p className={classNamesUtility(
                        "text-xs leading-relaxed line-clamp-3 font-medium",
                        isNodeSelectedForSynthesisStatus ? "text-zinc-700" : "text-zinc-500"
                      )}>
                        {signalEntryItem.summary}
                      </p>

                      <footer className="pt-6 mt-4 border-t border-current/10 flex items-center justify-between isolate">
                        <div className="flex items-center gap-3">
                          {isNodeSelectedForSynthesisStatus ? (
                              <CheckCircle2 className="text-primary h-6 w-6 animate-pulse" />
                          ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-white/10 transition-all group-hover:border-primary/40 group-hover:scale-110" />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                            {isNodeSelectedForSynthesisStatus ? "Nodo Sintonizado" : "Interceptar"}
                          </span>
                        </div>
                        <a
                          href={signalEntryItem.uniformResourceLocator}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(interactionEvent) => interactionEvent.stopPropagation()}
                          className={classNamesUtility(
                            "p-3 rounded-xl transition-all duration-300 shadow-xl",
                            isNodeSelectedForSynthesisStatus ? "bg-zinc-100 hover:bg-white" : "bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <ExternalLink size={18} className={isNodeSelectedForSynthesisStatus ? "text-zinc-400" : "text-zinc-700"} />
                        </a>
                      </footer>

                    </div>
                    
                    {/* CAPA DE PROFUNDIDAD VISUAL */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0" />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* III. HUD MÓVIL: CONTADOR DE CARGA SOBERANO */}
      <div className="md:hidden fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] pointer-events-none isolate">
        <Badge className="bg-black/95 text-white border-white/10 px-6 py-3 rounded-full backdrop-blur-2xl shadow-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-4">
          <Zap size={14} className="text-primary fill-current" />
          <span>{selectedPulseSourceIdentificationsCollection.length} / 5 <span className="text-zinc-600 ml-1">SEÑALES</span></span>
        </Badge>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Build Shield Final Restoration: Resolución de TS2339 mediante la alineación con 
 *    'transitionToNextStateAction' V5.0 y 'pulseSourceIdentificationsCollection' V12.0.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total. 'signals' -> 'SignalsCollection', 
 *    'err' -> 'HardwareException', 'idx' -> 'ItemIndexMagnitude'.
 * 3. MTI Isolation: El uso de 'AnimatePresence' y barrido de radar animado asegura 
 *    que el procesamiento de red no congele el hilo visual del Voyager.
 * 4. UX Industrial: Se aumentó la densidad de los bordes y el radio (2.5rem) para 
 *    mantener la coherencia con el Dashboard y el Bunker de Identidad.
 */