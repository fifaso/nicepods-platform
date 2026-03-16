// components/geo/steps/step-4-narrative-forge.tsx
// VERSIÓN: 2.7 (NicePod Sovereign Narrative Engine UI)
// Misión: Configurar los parámetros literarios y despertar al Agente 42.
// [ESTABILIZACIÓN]: Corrección de Alias Absoluto (@/hooks) para evitar contaminación de tipos.

"use client";

import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  Clock,
  Loader2,
  Sparkles,
  Wand2,
  Zap
} from "lucide-react";
import { useState } from "react";

// --- INFRAESTRUCTURA DE ESTADO SOBERANO ---
import { useForge } from "../forge-context";
// [FIX CRÍTICO]: Importación absoluta al Hook Global para asegurar lectura de V6.0
import { useGeoEngine } from "@/hooks/use-geo-engine";

// --- COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * CONFIGURACIÓN DE NARRATIVA
 */
const DEPTH_OPTIONS = [
  { id: 'flash', label: 'Flash', time: '45s', icon: Zap },
  { id: 'cronica', label: 'Crónica', time: '2m', icon: Clock },
  { id: 'inmersion', label: 'Inmersión', time: '5m', icon: BookOpen },
] as const;

const TONE_OPTIONS = [
  { id: 'academico', label: 'Académico' },
  { id: 'misterioso', label: 'Misterioso' },
  { id: 'epico', label: 'Épico' },
  { id: 'neutro', label: 'Neutro' },
] as const;

export function StepNarrativeForge() {
  // 1. CONSUMO DE CONTEXTOS
  const { state, dispatch, prevStep } = useForge();

  // Extraemos las utilidades del motor geoespacial global
  const geoEngine = useGeoEngine();
  const {
    synthesizeNarrative,
    status: engineStatus,
    data: engineData
  } = geoEngine;

  // 2. ESTADOS LOCALES
  const [error, setError] = useState<string | null>(null);

  // Verificamos si el motor está operando. Gracias a la importación absoluta, 
  // 'SYNTHESIZING' ahora es reconocido como un estado válido del GeoEngineState.
  const isSynthesizing = engineStatus === 'SYNTHESIZING';

  /**
   * handleForge: Despierta al Agente 42 (El Oráculo Urbano).
   */
  const handleForge = async () => {
    // Acceso seguro al poiId: Garantizado por la nueva interfaz GeoContextData
    const poiId = state.ingestedPoiId || engineData?.poiId;

    if (!poiId) {
      setError("CRITICAL_ERROR: El nodo no ha sido anclado en la Bóveda aún.");
      return;
    }

    setError(null);

    try {
      /**
       * Invocamos la Fase 2 del Cerebro Dual: Síntesis Literaria.
       */
      await synthesizeNarrative({
        poiId: poiId,
        depth: state.depth,
        tone: state.tone,
        refinedIntent: state.intentText // El OCR corregido por el Admin en el Step 3
      });

      // Éxito: Redirigimos al mapa principal para ver el nuevo eco de sabiduría publicado.
      window.location.href = '/map';

    } catch (err: any) {
      console.error("🔥 [Forge-Step-4] Error Fatal:", err.message);
      setError(err.message || "El Agente 42 no pudo establecer sintonía narrativa.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-24 px-6">

      {/* HEADER DE MISIÓN */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={isSynthesizing}
          className="rounded-full h-10 w-10 p-0 bg-white/5 border border-white/5 text-zinc-500 hover:text-white"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 04</p>
          <h2 className="text-xl font-black uppercase text-white italic">La Forja</h2>
        </div>
      </div>

      {/* CUERPO DE CONFIGURACIÓN */}
      <div className="space-y-8">

        {/* BLOQUE I: DIRECCIÓN EDITORIAL */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2 flex items-center gap-2">
            <Wand2 size={12} className="text-primary" /> Dirección del Curador
          </label>
          <Input
            value={state.historicalFact}
            onChange={(e) => dispatch({ type: 'SET_HISTORICAL_FACT', payload: e.target.value })}
            placeholder="[Opcional] Instrucción específica para el Oráculo..."
            className="bg-white/[0.02] border-white/10 h-14 rounded-xl px-6 text-sm text-zinc-300 italic focus:border-primary/40 transition-colors"
            maxLength={100}
            disabled={isSynthesizing}
          />
        </div>

        {/* BLOQUE II: PARÁMETROS TÉCNICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Selector de Profundidad (Duración) */}
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2">Profundidad del Eco</span>
            <div className="flex flex-wrap gap-2">
              {DEPTH_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  disabled={isSynthesizing}
                  onClick={() => dispatch({ type: 'SET_DEPTH', payload: opt.id })}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300",
                    state.depth === opt.id
                      ? "bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-95"
                      : "bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/20"
                  )}
                >
                  <opt.icon size={16} className="mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                  <span className="text-[8px] font-bold opacity-60 mt-1">{opt.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Tono (Atmósfera) */}
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2">Frecuencia Vocal</span>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  disabled={isSynthesizing}
                  onClick={() => dispatch({ type: 'SET_TONE', payload: opt.id })}
                  className={cn(
                    "h-12 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                    state.tone === opt.id
                      ? "bg-white text-black border-white shadow-md scale-95"
                      : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-white"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FEEDBACK DE ERROR */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
            <AlertCircle size={16} />
            <p className="text-[10px] font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        {/* ACCIÓN FINAL: DESPERTAR AL AGENTE 42 */}
        <Button
          onClick={handleForge}
          disabled={isSynthesizing}
          className="w-full h-20 mt-4 rounded-[2rem] bg-gradient-to-r from-primary via-indigo-600 to-primary text-white font-black text-xl tracking-[0.4em] shadow-2xl group relative overflow-hidden active:scale-[0.98] transition-transform"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />

          {isSynthesizing ? (
            <div className="relative z-10 flex items-center justify-center gap-4">
              <Loader2 className="animate-spin" size={24} />
              SINTETIZANDO...
            </div>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-4">
              <Sparkles size={24} className="fill-current" />
              DESPERTAR AGENTE 42
            </span>
          )}
        </Button>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.7):
 * 1. Restauración de Vínculos: Al forzar la importación absoluta '@/' en todos los 
 *    Steps, blindamos la arquitectura contra archivos 'zombies' o 'shadow files' 
 *    que puedan quedar residualmente en el árbol de carpetas durante refactorizaciones.
 * 2. Cero Tolerancia a Fallos: El flujo de datos ahora es verificable estáticamente 
 *    desde la Base de Datos (SQL) hasta el último botón de la Interfaz (JSX).
 */