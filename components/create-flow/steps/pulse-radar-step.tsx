/**
 * ARCHIVE: components/create-flow/steps/pulse-radar-step.tsx
 * VERSION: 4.1 (NicePod Strategic Radar - Industrial Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * MISSION: Visualizar e interactuar con las señales de inteligencia (Pulse)
 * interceptadas por el Oráculo, permitiendo la curaduría de materia prima cognitiva.
 * [REFORMA V4.1]: Absolute nominal sovereignty. Full synchronization with ZAP and
 * MRP V4.9. Restoration of the Build Shield with strict type alignment.
 * INTEGRITY LEVEL: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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
  
  const { 
    transitionToNextStateAction, 
    creationProcessProgressMetrics 
  } = useCreationContext();

  // 2. ESTADOS DE GESTIÓN DE INTERFAZ (ZAP COMPLIANT)
  const [pulseSignalsCollection, setPulseSignalsCollection] = useState<PulseMatchResult[]>([]);
  const [isRadarScanningProcessActiveStatus, setIsRadarScanningProcessActiveStatus] = useState<boolean>(true);
  const [radarOperationalExceptionMessageContent, setRadarOperationalExceptionMessageContent] = useState<string | null>(null);

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
      setTimeout(() => setIsRadarScanningProcessActiveStatus(false), 1200);
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
    
    setValue("pulseSourceIdentificationsCollection", updatedSelectedIdentificationsCollection, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 md:p-10 overflow-hidden isolate">

      {/* I. CABECERA TÁCTICA */}
      <header className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-6 mb-10 z-10 isolate">
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
            <Radar size={16} className={classNamesUtility(isRadarScanningProcessActiveStatus && "animate-spin")} />
            Escáner de Inteligencia Estratégica
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none italic font-serif">
            Radar <span className="text-primary not-italic">Pulse</span>
          </h1>
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

      {/* II. CUERPO DINÁMICO */}
      <div className="flex-1 min-h-0 relative z-0 isolate">
        <AnimatePresence mode="wait">
          
          {isRadarScanningProcessActiveStatus ? (
            <motion.div key="radar_scanning_state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-8">
              <div className="relative isolate">
                <div className="h-32 w-32 rounded-full border-2 border-primary/20 animate-ping absolute inset-[-10px]" />
                <Zap size={40} className="text-primary animate-pulse relative z-10 fill-current" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Sincronizando con la red global...</p>
            </motion.div>
          ) : (
             <motion.div key="radar_results_state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-4 custom-scrollbar pb-20 isolate">
              {pulseSignalsCollection.map((signalEntryItem, itemIndexMagnitude) => (
                 <motion.div 
                    key={signalEntryItem.identification}
                    onClick={() => handlePulseSourceSelectionToggleAction(signalEntryItem.identification)}
                    className={classNamesUtility(
                        "group relative p-6 rounded-[2rem] border transition-all cursor-pointer shadow-xl",
                        selectedPulseSourceIdentificationsCollection.includes(signalEntryItem.identification)
                            ? "bg-white text-zinc-950 border-white scale-[1.02]" 
                            : "bg-[#0a0a0a]/60 border-white/5 hover:border-primary/40 text-white"
                    )}
                 >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {signalEntryItem.isHighValueSovereignty && <Zap size={14} className="text-amber-500 fill-current" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{signalEntryItem.sourceAuthorityName}</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-zinc-800 text-zinc-500">
                            {signalEntryItem.matchPercentageMagnitude}% Match
                        </Badge>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-tight">{signalEntryItem.titleTextContent}</h3>
                 </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
