// components/create-flow/steps/pulse-radar-step.tsx
// VERSIÓN: 1.2 (Strategic Radar - Data Mapping Fix & Identity Evolution)

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

export function PulseRadarStep() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const { setValue, watch } = useFormContext();
  const { transitionTo } = useCreationContext();

  // --- ESTADOS ---
  const [signals, setSignals] = useState<PulseMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = watch("pulse_source_ids") || [];

  /**
   * scanRadar: Sincronización con el motor de matching.
   * [FIX]: Se ha robustecido el mapeo para capturar tanto 'signals' como 'is_fallback'.
   */
  const scanRadar = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke('pulse-matcher');

      if (fetchError) throw new Error("Interrupción en la sincronización con los radares.");

      // Validamos la estructura del contrato de datos
      if (data && data.signals && Array.isArray(data.signals)) {
        setSignals(data.signals);

        if (data.is_fallback) {
          toast({
            title: "Radar en modo Global",
            description: "Personaliza tu ADN en el paso anterior para obtener señales prioritarias."
          });
        }
      } else {
        // Si no hay señales, dejamos el array vacío para mostrar el placeholder de búsqueda
        setSignals([]);
      }
    } catch (err: any) {
      const errorMsg = err.message || "No se detectaron señales en el área.";
      setError(errorMsg);
      toast({
        title: "Fallo de Intercepción",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      // Retardo visual para permitir que la animación Aurora respire
      setTimeout(() => setIsLoading(false), 1200);
    }
  }, [supabase, toast]);

  useEffect(() => {
    scanRadar();
  }, [scanRadar]);

  /**
   * toggleSource: Gestión de selección múltiple.
   */
  const toggleSource = (id: string) => {
    const current = [...selectedIds];
    const index = current.indexOf(id);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      if (current.length >= 5) {
        toast({
          title: "Límite de Sintetización",
          description: "Selecciona hasta 5 fuentes para garantizar una píldora de alta densidad.",
        });
        return;
      }
      current.push(id);
    }
    setValue("pulse_source_ids", current, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 md:p-8 overflow-hidden">

      {/* 1. HEADER: Identidad Evolucionada */}
      <header className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
            <Radar size={14} className={cn(isLoading && "animate-spin")} />
            Escáner de Inteligencia Activo
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
            Radar <span className="text-primary italic">Pulse</span>
          </h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest hidden md:block">
            Inteligencia Detectada en Tiempo Real
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Materia Prima</p>
            <p className="text-lg font-bold text-white">{selectedIds.length} <span className="text-white/20">/ 5</span></p>
          </div>
          <Button
            disabled={selectedIds.length === 0 || isLoading}
            onClick={() => transitionTo('TONE_SELECTION')}
            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/20"
          >
            Producir Píldora
          </Button>
        </div>
      </header>

      {/* 2. ÁREA DE RESULTADOS DINÁMICOS */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* ESTADO: ANIMACIÓN DE ESCANEO */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-2 border-primary/20 animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-t-2 border-primary animate-spin" />
                </div>
                <Zap size={40} className="absolute inset-0 m-auto text-primary animate-pulse" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.4em] text-primary animate-pulse text-center">
                Sincronizando con fuentes globales...
              </p>
            </motion.div>
          ) : error || (signals.length === 0 && !isLoading) ? (
            /* ESTADO: NO SE DETECTARON SEÑALES */
            <motion.div key="empty" className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-6 bg-white/5 rounded-full border border-white/10">
                <Search size={40} className="text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Frecuencia Silenciosa</h3>
              <p className="text-muted-foreground max-w-xs text-sm">
                No hemos detectado señales nuevas en tu área de interés. Intenta recalibrar tu ADN.
              </p>
              <Button onClick={scanRadar} variant="outline" className="border-white/10 rounded-xl font-bold uppercase text-[10px]">
                Escaneo Manual
              </Button>
            </motion.div>
          ) : (
            /* ESTADO: SEÑALES LISTAS PARA SELECCIONAR */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 no-scrollbar pb-10"
            >
              {signals.map((signal, idx) => {
                const isSelected = selectedIds.includes(signal.id);

                return (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => toggleSource(signal.id)}
                    className={cn(
                      "group relative p-5 rounded-[2rem] border transition-all cursor-pointer overflow-hidden",
                      isSelected
                        ? "bg-white text-zinc-950 border-white shadow-2xl scale-[1.02]"
                        : "bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10 text-white"
                    )}
                  >
                    {signal.is_high_value && !isSelected && (
                      <div className="absolute top-0 right-0 p-3">
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-black uppercase">Fondo Estratégico</Badge>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          isSelected ? "bg-primary/10 text-primary" : "bg-white/5 text-primary"
                        )}>
                          {signal.content_type === 'paper' ? <FileText size={18} /> : <Globe size={18} />}
                        </div>
                        <div className="flex flex-col">
                          <span className={cn("text-[9px] font-black uppercase tracking-tighter", isSelected ? "text-zinc-500" : "text-white/40")}>
                            {signal.source_name}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase">
                            <TrendingUp size={10} /> {signal.match_percentage}% Resonancia
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm md:text-base leading-tight uppercase tracking-tight line-clamp-2">
                        {signal.title}
                      </h3>

                      <p className={cn(
                        "text-[11px] leading-relaxed line-clamp-3 font-medium",
                        isSelected ? "text-zinc-600" : "text-muted-foreground"
                      )}>
                        {signal.summary}
                      </p>

                      <footer className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {isSelected ? <CheckCircle2 className="text-primary h-5 w-5" /> : <div className="h-5 w-5 rounded-full border-2 border-white/10" />}
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {isSelected ? "Incluida" : "Seleccionar"}
                          </span>
                        </div>
                        <a
                          href={signal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <ExternalLink size={14} className={isSelected ? "text-zinc-400" : "text-white/20"} />
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

      {/* 3. MOBILE OVERLAY CONTADOR */}
      <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <Badge className="bg-zinc-900/90 text-white border-white/20 px-4 py-2 rounded-full backdrop-blur-md shadow-2xl font-black text-[9px] uppercase tracking-widest">
          {selectedIds.length} Señales Interceptadas
        </Badge>
      </div>

    </div>
  );
}