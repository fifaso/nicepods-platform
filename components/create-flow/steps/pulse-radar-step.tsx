/**
 * ARCHIVO: components/create-flow/steps/pulse-radar-step.tsx
 * VERSIÓN: 2.0 (NicePod Strategic Radar - Sovereign Data Mapping & ZAP Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Visualizar e interactuar con las señales de inteligencia (Pulse) 
 * interceptadas en el entorno geodésico o temático del Voyager.
 * [REFORMA V2.0]: Resolución definitiva del error TS2339. Sincronización nominal 
 * absoluta con el AuthProvider V5.2 ('supabaseSovereignClient'). Erradicación 
 * total de abreviaturas ('signals', 'err', 'idx') y sellado del Build Shield (BSS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
  Zap
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useCreationContext } from "../shared/context";

/**
 * COMPONENTE: PulseRadarStep
 * El terminal de intercepción de señales estratégicas.
 */
export function PulseRadarStep() {
  // [SINCRO V2.0]: Consumo soberano del cliente Supabase.
  const { supabaseSovereignClient } = useAuth();
  const { toast } = useToast();
  const { setValue, watch } = useFormContext();
  const { transitionTo } = useCreationContext();

  // --- I. ESTADOS DE GESTIÓN DE INTERFAZ SOBERANA ---
  const [pulseSignalsCollection, setPulseSignalsCollection] = useState<PulseMatchResult[]>([]);
  const [isRadarScanningProcessActive, setIsRadarScanningProcessActive] = useState<boolean>(true);
  const [radarOperationalExceptionMessage, setRadarOperationalExceptionMessage] = useState<string | null>(null);

  const selectedPulseSourceIdentifications: string[] = watch("pulseSourceIdentifications") || [];

  /**
   * executeRadarScanAction: 
   * Misión: Orquestar la invocación al motor de matching (Edge Function).
   */
  const executeRadarScanAction = useCallback(async () => {
    setIsRadarScanningProcessActive(true);
    setRadarOperationalExceptionMessage(null);

    try {
      const { data: edgeFunctionResponseData, error: edgeFunctionException } = await supabaseSovereignClient.functions.invoke('pulse-matcher');

      if (edgeFunctionException) throw new Error("Interrupción en la sincronización de red con los radares globales.");

      if (edgeFunctionResponseData && edgeFunctionResponseData.signals && Array.isArray(edgeFunctionResponseData.signals)) {
        setPulseSignalsCollection(edgeFunctionResponseData.signals as PulseMatchResult[]);

        if (edgeFunctionResponseData.is_fallback) {
          toast({
            title: "Modo Cobertura Global",
            description: "Ajuste su perfil genético digital para interceptar señales de mayor prioridad local."
          });
        }
      } else {
        setPulseSignalsCollection([]);
      }
    } catch (hardwareException: unknown) {
      const exceptionMessage = hardwareException instanceof Error ? hardwareException.message : "No se detectaron frecuencias útiles en la malla.";
      setRadarOperationalExceptionMessage(exceptionMessage);
      toast({
        title: "Fallo de Intercepción",
        description: exceptionMessage,
        variant: "destructive"
      });
    } finally {
      // Retardo estético para sincronizar con la animación de barrido (Aurora).
      setTimeout(() => setIsRadarScanningProcessActive(false), 1200);
    }
  }, [supabaseSovereignClient, toast]);

  useEffect(() => {
    executeRadarScanAction();
  }, [executeRadarScanAction]);

  /**
   * togglePulseSourceSelectionAction:
   * Misión: Gestionar la inclusión o exclusión de un nodo en la forja de la píldora.
   */
  const togglePulseSourceSelectionAction = (targetSourceIdentification: string) => {
    const currentSelectedIdentificationsCollection = [...selectedPulseSourceIdentifications];
    const sourceIndexPosition = currentSelectedIdentificationsCollection.indexOf(targetSourceIdentification);

    if (sourceIndexPosition > -1) {
      currentSelectedIdentificationsCollection.splice(sourceIndexPosition, 1);
    } else {
      if (currentSelectedIdentificationsCollection.length >= 5) {
        toast({
          title: "Saturación de Carga",
          description: "Seleccione un máximo de 5 nodos fuente para garantizar una síntesis de alta densidad.",
        });
        return;
      }
      currentSelectedIdentificationsCollection.push(targetSourceIdentification);
    }
    
    // Inyección de estado hacia el FormContext central.
    setValue("pulseSourceIdentifications", currentSelectedIdentificationsCollection, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 md:p-8 overflow-hidden isolate">

      {/* I. CABECERA TÁCTICA (COMMAND HEADER) */}
      <header className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 z-10">
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
            <Radar size={14} className={cn(isRadarScanningProcessActive && "animate-spin")} />
            Escáner de Inteligencia Activo
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none font-serif">
            Radar <span className="text-primary italic">Pulse</span>
          </h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest hidden md:block">
            Capital Intelectual detectado en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Materia Prima</p>
            <p className="text-lg font-bold text-white tabular-nums">{selectedPulseSourceIdentifications.length} <span className="text-white/20">/ 5</span></p>
          </div>
          <Button
            disabled={selectedPulseSourceIdentifications.length === 0 || isRadarScanningProcessActive}
            onClick={() => transitionTo('TONE_SELECTION')}
            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-95"
          >
            Producir Píldora
          </Button>
        </div>
      </header>

      {/* II. ÁREA DE RESULTADOS DINÁMICOS (REACTOR VISUAL) */}
      <div className="flex-1 min-h-0 relative z-0">
        <AnimatePresence mode="wait">
          
          {isRadarScanningProcessActive ? (
            /* ESTADO A: BARRIDO DE FRECUENCIA EN CURSO */
            <motion.div
              key="radar_scanning_state"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-2 border-primary/20 animate-ping absolute inset-[-10px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-t-2 border-primary animate-spin" />
                </div>
                <Zap size={40} className="text-primary animate-pulse relative z-10" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary animate-pulse text-center">
                Sincronizando con red global...
              </p>
            </motion.div>

          ) : radarOperationalExceptionMessage || (pulseSignalsCollection.length === 0 && !isRadarScanningProcessActive) ? (
            /* ESTADO B: VACÍO DE RED O FALLO TÉCNICO */
            <motion.div 
              key="radar_empty_state" 
              className="h-full flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="p-6 bg-white/5 rounded-full border border-white/10 shadow-inner">
                <Search size={40} className="text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight italic font-serif">Frecuencia Silenciosa</h3>
              <p className="text-muted-foreground max-w-xs text-[10px] font-medium uppercase tracking-widest leading-relaxed">
                No hemos detectado señales prioritarias en la malla de interés actual. Intente recalibrar el ADN de su perfil.
              </p>
              <Button 
                onClick={executeRadarScanAction} 
                variant="outline" 
                className="mt-4 border-white/10 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/5 hover:text-white transition-colors"
              >
                Forzar Barrido Manual
              </Button>
            </motion.div>

          ) : (
            /* ESTADO C: PROYECCIÓN DE NODOS INTERCEPTADOS */
            <motion.div
              key="radar_results_state"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10"
            >
              {pulseSignalsCollection.map((signalEntry, itemIndex) => {
                const isNodeSelectedForSynthesis = selectedPulseSourceIdentifications.includes(signalEntry.id);

                return (
                  <motion.div
                    key={signalEntry.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: itemIndex * 0.05 }}
                    onClick={() => togglePulseSourceSelectionAction(signalEntry.id)}
                    className={cn(
                      "group relative p-6 rounded-[2.5rem] border transition-all cursor-pointer overflow-hidden isolate",
                      isNodeSelectedForSynthesis
                        ? "bg-white text-zinc-950 border-white shadow-[0_20px_40px_rgba(255,255,255,0.15)] scale-[1.02] z-10"
                        : "bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10 text-white z-0"
                    )}
                  >
                    {signalEntry.is_high_value && !isNodeSelectedForSynthesis && (
                      <div className="absolute top-0 right-0 p-4 z-20">
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-black uppercase tracking-widest px-3 py-1 shadow-inner">
                          Fondo Estratégico
                        </Badge>
                      </div>
                    )}

                    <div className="space-y-5 relative z-10">
                      
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-2xl shadow-inner",
                          isNodeSelectedForSynthesis ? "bg-primary/10 text-primary" : "bg-white/5 text-primary"
                        )}>
                          {signalEntry.content_type === 'paper' ? <FileText size={20} /> : <Globe size={20} />}
                        </div>
                        <div className="flex flex-col min-w-0 pr-4">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-[0.2em] truncate", 
                            isNodeSelectedForSynthesis ? "text-zinc-500" : "text-white/40"
                          )}>
                            {signalEntry.source_name}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">
                            <TrendingUp size={12} /> {signalEntry.match_percentage}% Resonancia
                          </span>
                        </div>
                      </div>

                      <h3 className="font-black text-sm md:text-base leading-tight uppercase tracking-tight line-clamp-2">
                        {signalEntry.title}
                      </h3>

                      <p className={cn(
                        "text-[11px] leading-relaxed line-clamp-3 font-medium",
                        isNodeSelectedForSynthesis ? "text-zinc-600" : "text-muted-foreground"
                      )}>
                        {signalEntry.summary}
                      </p>

                      <footer className="pt-4 mt-2 border-t border-current/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isNodeSelectedForSynthesis ? (
                              <CheckCircle2 className="text-primary h-5 w-5" />
                          ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-white/20 transition-colors group-hover:border-primary/50" />
                          )}
                          <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                            {isNodeSelectedForSynthesis ? "Nodo Incluido" : "Seleccionar"}
                          </span>
                        </div>
                        <a
                          href={signalEntry.uniformResourceLocator}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(interactionEvent) => interactionEvent.stopPropagation()}
                          className={cn(
                            "p-2.5 rounded-xl transition-colors shadow-sm",
                            isNodeSelectedForSynthesis ? "hover:bg-black/5" : "hover:bg-white/10"
                          )}
                          title="Explorar fuente original"
                        >
                          <ExternalLink size={16} className={isNodeSelectedForSynthesis ? "text-zinc-500" : "text-white/40"} />
                        </a>
                      </footer>

                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* III. INDICADOR MÓVIL SOBERANO */}
      <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <Badge className="bg-black/90 text-white border-white/20 px-5 py-2.5 rounded-full backdrop-blur-xl shadow-2xl font-black text-[9px] uppercase tracking-[0.3em]">
          {selectedPulseSourceIdentifications.length} <span className="text-zinc-500 ml-1">Señales Interceptadas</span>
        </Badge>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Contract Alignment: Resolución de TS2339 mediante el uso de 'supabaseSovereignClient' 
 *    inyectado desde el orquestador AuthProvider V5.2.
 * 2. ZAP Absolute Compliance: Purificación total de descriptores técnicos (idx -> 
 *    itemIndex, e -> interactionEvent, current -> currentSelectedIdentificationsCollection).
 * 3. UI Hardening: Se balanceó la estructura DOM y se ajustaron los z-index (isolate) 
 *    para evitar colisiones de eventos táctiles en dispositivos móviles y garantizar 
 *    la accesibilidad (A11y) de los enlaces externos.
 */