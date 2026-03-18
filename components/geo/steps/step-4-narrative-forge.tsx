// components/geo/steps/step-4-narrative-forge.tsx
// VERSIÓN: 3.0 (NicePod Sovereign Narrative Forge - Final Fixed Edition)
// Misión: Configurar parámetros literarios y despertar al Oráculo (Agente 42).
// [ESTABILIZACIÓN]: Fix error TS2305 (Named Export Recovery).

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

// --- INFRAESTRUCTURA DE ESTADO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn } from "@/lib/utils";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

/**
 * [MANDATO]: Esta función debe exportarse NOMINALMENTE para satisfacer a scanner-ui.tsx
 */
export function StepNarrativeForge() {
  const { state, dispatch, prevStep } = useForge();
  const { synthesizeNarrative, status: engineStatus, data: engineData } = useGeoEngine();
  const [error, setError] = useState<string | null>(null);

  const isSynthesizing = engineStatus === 'SYNTHESIZING';

  const handleForge = async () => {
    // Recuperamos el poiId del motor o del contexto
    const poiId = state.ingestedPoiId || engineData?.poiId;

    if (!poiId) {
      setError("CRITICAL_ERROR: El nodo no está anclado en la Bóveda.");
      return;
    }

    setError(null);

    try {
      await synthesizeNarrative({
        poiId: poiId,
        depth: state.depth,
        tone: state.tone,
        refinedIntent: state.intentText
      });

      // Éxito total: Volvemos al mapa táctico
      window.location.href = '/map';
    } catch (err: any) {
      setError(err.message || "Fallo en la síntesis del Oráculo.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in duration-1000 pb-32">

      {/* HEADER TÁCTICO */}
      <div className="px-6 flex items-center justify-between">
        <Button variant="ghost" onClick={prevStep} disabled={isSynthesizing} className="rounded-full h-12 w-12 p-0 bg-white/5 border border-white/10 text-zinc-400">
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 04</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">La Forja</h2>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* DIRECCIÓN EDITORIAL */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-50">
            <Wand2 size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Dirección del Curador</h3>
          </div>
          <Input
            value={state.historicalFact}
            onChange={(e) => dispatch({ type: 'SET_HISTORICAL_FACT', payload: e.target.value })}
            placeholder="[Opcional] Matiz específico para la IA..."
            className="h-14 bg-white/[0.02] border-white/10 rounded-2xl px-6 text-sm text-zinc-300 italic"
            disabled={isSynthesizing}
          />
        </div>

        {/* PARÁMETROS TÉCNICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2">Profundidad</span>
            <div className="flex flex-wrap gap-2">
              {DEPTH_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => dispatch({ type: 'SET_DEPTH', payload: opt.id })}
                  className={cn(
                    "flex-1 flex flex-col items-center p-4 rounded-2xl border transition-all duration-300",
                    state.depth === opt.id ? "bg-primary text-black border-primary shadow-lg" : "bg-white/[0.02] border-white/5 text-zinc-500"
                  )}
                >
                  <opt.icon size={16} className="mb-2" />
                  <span className="text-[10px] font-black uppercase">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2">Voz</span>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => dispatch({ type: 'SET_TONE', payload: opt.id })}
                  className={cn(
                    "h-12 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                    state.tone === opt.id ? "bg-white text-black border-white" : "bg-white/[0.02] border-white/5 text-zinc-500"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
            <AlertCircle size={16} />
            <p className="text-[10px] font-bold uppercase">{error}</p>
          </div>
        )}

        <Button
          onClick={handleForge}
          disabled={isSynthesizing}
          className="w-full h-20 rounded-[2.5rem] bg-primary text-black font-black uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          {isSynthesizing ? (
            <div className="flex items-center gap-4">
              <Loader2 className="animate-spin" size={24} />
              <span>SINTETIZANDO...</span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Sparkles size={24} />
              <span className="text-xl">DESPERTAR AGENTE 42</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}