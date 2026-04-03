/**
 * ARCHIVO: components/geo/steps/step-4-narrative-forge.tsx
 * VERSIÓN: 4.0 (NicePod Forge Step 4 - Narrative Synthesis & Editorial Control)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Configurar los parámetros editoriales (Tono y Profundidad) y disparar 
 * la síntesis final de la crónica urbana mediante el Agente 42.
 * [REFORMA V4.0]: Implementación de exportación por defecto, tipado estricto 
 * de parámetros IA y purificación total de nomenclatura industrial.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  ChevronLeft, 
  CheckCircle2, 
  PenTool, 
  Wind,
  AlignLeft,
  Volume2,
  Loader2,
  AlertCircle
} from "lucide-react";
import React, { useCallback, useState } from "react";

// --- INFRAESTRUCTURA CORE V3.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  NarrativeDepth, 
  NarrativeTone 
} from "@/types/geo-sovereignty";
import { cn, nicepodLog } from "@/lib/utils";

/**
 * Step4NarrativeForge: La fase final de transmutación intelectual.
 */
export default function Step4NarrativeForge() {
  // 1. CONSUMO DE LA FACHADA SOBERANA Y CONTEXTO DE FORJA
  const { 
    synthesizeNarrative, 
    status: engineStatus,
    error: geographicError 
  } = useGeoEngine();

  const { state: forgeState, dispatch, prevStep } = useForge();

  // 2. ESTADOS LOCALES DE PROCESAMIENTO
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  /**
   * handleFinalSynthesis:
   * Misión: Despachar la orden de forja narrativa al orquestador.
   */
  const handleFinalSynthesis = async () => {
    if (!forgeState.ingestedPoiId) {
      nicepodLog("🛑 [Step4] Abortando: No existe un ID de hito validado.", null, 'error');
      return;
    }

    setIsSynthesizing(true);
    nicepodLog(`🧠 [Step4] Solicitando síntesis narrativa para el hito #${forgeState.ingestedPoiId}`);

    try {
      await synthesizeNarrative({
        poiId: forgeState.ingestedPoiId,
        depth: forgeState.depth,
        tone: forgeState.tone,
        refinedIntent: forgeState.intentText
      });

      nicepodLog("✨ [Step4] Crónica sintetizada con éxito. Sintonía final completada.");
      // El orquestador fachada se encargará de actualizar el estado a NARRATIVE_READY
    } catch (error) {
      nicepodLog("🔥 [Step4] Error crítico en la forja narrativa.", error, 'error');
    } finally {
      setIsSynthesizing(false);
    }
  };

  /**
   * OPCIONES DE CONFIGURACIÓN TÁCTICA
   */
  const depthOptions: { value: NarrativeDepth; label: string; desc: string }[] = [
    { value: 'flash', label: 'Flash', desc: 'Sintético / 45s' },
    { value: 'cronica', label: 'Crónica', desc: 'Estándar / 1.5m' },
    { value: 'inmersion', label: 'Inmersión', desc: 'Profundo / 4m' }
  ];

  const toneOptions: { value: NarrativeTone; label: string; icon: any }[] = [
    { value: 'academico', label: 'Académico', icon: <PenTool size={14} /> },
    { value: 'misterioso', label: 'Misterioso', icon: <Wind size={14} /> },
    { value: 'epico', label: 'Épico', icon: <Sparkles size={14} /> },
    { value: 'melancolico', label: 'Elegiaco', icon: <AlignLeft size={14} /> },
    { value: 'neutro', label: 'Informativo', icon: <Volume2 size={14} /> }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-6 py-4">
      
      {/* I. CABECERA EDITORIAL */}
      <div className="mb-8 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 4: Forja Narrativa
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
          Configure el ADN editorial. El Agente 42 transmutará la evidencia en sabiduría anclada.
        </p>
      </div>

      {/* II. SECTOR: PROFUNDIDAD DEL RELATO */}
      <div className="mb-8">
        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">
          Profundidad de Campo
        </label>
        <div className="grid grid-cols-3 gap-3">
          {depthOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => dispatch({ type: 'SET_DEPTH', payload: option.value })}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-500",
                forgeState.depth === option.value
                  ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              )}
            >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                forgeState.depth === option.value ? "text-primary" : "text-zinc-400"
              )}>
                {option.label}
              </span>
              <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-tighter">
                {option.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* III. SECTOR: TONALIDAD COGNITIVA */}
      <div className="mb-8">
        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">
          Tono de Resonancia
        </label>
        <div className="flex flex-wrap gap-2">
          {toneOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => dispatch({ type: 'SET_TONE', payload: option.value })}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-300",
                forgeState.tone === option.value
                  ? "bg-white text-black border-white shadow-xl"
                  : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-white hover:border-white/20"
              )}
            >
              {option.icon}
              <span className="text-[9px] font-black uppercase tracking-widest">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* IV. SECTOR: REFINAMIENTO DE INTENCIÓN */}
      <div className="mb-10">
        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">
          Ajuste Editorial Final (Opcional)
        </label>
        <Textarea 
          placeholder="Especifique matices adicionales para la crónica..."
          className="min-h-[80px] bg-white/[0.03] border-white/10 rounded-2xl p-5 text-sm font-medium placeholder:text-zinc-700 focus:border-primary/40 transition-all resize-none"
          value={forgeState.intentText}
          onChange={(event) => dispatch({ type: 'SET_INTENT', payload: event.target.value })}
        />
      </div>

      {/* V. ACCIÓN DE SÍNTESIS FINAL */}
      <div className="flex gap-4 mt-auto pt-4 pb-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isSynthesizing}
          className="w-16 h-16 rounded-2xl border-white/10 bg-transparent text-zinc-500 hover:bg-white/5"
        >
          <ChevronLeft size={20} />
        </Button>
        
        <Button
          onClick={handleFinalSynthesis}
          disabled={isSynthesizing || engineStatus === 'IDLE'}
          className="flex-1 h-16 rounded-2xl bg-primary text-primary-foreground font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl shadow-primary/20 group overflow-hidden relative"
        >
          {isSynthesizing ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sintetizando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 w-full">
              <span>Forjar Crónica</span>
              <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
            </div>
          )}
          {isSynthesizing && (
            <motion.div 
              className="absolute inset-0 bg-white/10"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </Button>
      </div>

      {geographicError && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="text-red-500 h-4 w-4" />
          <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">
            Fallo de Oráculo: {geographicError}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Default Export Fulfillment: Se ha sellado la exportación por defecto para 
 *    eliminar el error TS2339 en el secuenciador principal (ScannerUI).
 * 2. Editorial State Mapping: El componente mapea las opciones de profundidad 
 *    y tono al contrato literal exigido por la Edge Function del Agente 42.
 * 3. Synthesis UX: Se ha incorporado una barra de progreso infinita (shimmer) 
 *    dentro del botón de forja para proporcionar feedback cinemático durante 
 *    la latencia de inferencia de la IA.
 */