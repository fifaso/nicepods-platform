/**
 * ARCHIVO: components/geo/steps/step-4-narrative-forge.tsx
 * VERSIÓN: 4.1 (NicePod Sovereign Narrative Forge - Recursive Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misi ón: Configurar  parámetros editoriales y ejecutar la síntesis final del activo.
 * [REFORMA V4.1]: Unificación taxonómica y protocolo de refresco forzado de malla.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Cpu,
  Loader2,
  Sparkles,
  Wand2,
  Zap,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

// --- INFRAESTRUCTURA DE ESTADO Y MOTOR SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ATÓMICOS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- UTILIDADES DE SISTEMA ---
import { cn, nicepodLog } from "@/lib/utils";

/**
 * CONFIGURACIÓN DE PARÁMETROS EDITORIALES
 * Calibrados para el motor de síntesis del Agente 42.
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

/**
 * StepNarrativeForge: El reactor de transmutación intelectual.
 */
export function StepNarrativeForge() {
  const router = useRouter();
  const { state, dispatch, prevStep } = useForge();
  
  // Consumimos el motor para la síntesis y el refresco final
  const { 
    synthesizeNarrative, 
    status: engineStatus, 
    data: engineData,
    reSyncRadar // Usado para invalidar caché espacial post-publicación
  } = useGeoEngine();

  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const isSynthesizing = engineStatus === 'SYNTHESIZING';

  /**
   * handleForge:
   * Invoca al Oráculo 42 y orquesta el cierre de misión.
   */
  const handleForge = useCallback(async () => {
    // 1. Verificación de integridad referencial
    const poiId = state.ingestedPoiId || engineData?.poiId;

    if (!poiId) {
      nicepodLog("🛑 [Forja] Error Crítico: poiId no localizado.", null, 'error');
      setError("FALLO_INTEGRIDAD: El nodo no está anclado en la Bóveda.");
      return;
    }

    setError(null);
    nicepodLog(`🚀 [Forja] Iniciando transmutación para Nodo #${poiId}`);

    try {
      // 2. Invocación al Borde (Synthesis Engine)
      await synthesizeNarrative({
        poiId: poiId,
        depth: state.depth,
        tone: state.tone,
        refinedIntent: `${state.intentText} . Guía Curatorial: ${state.historicalFact}`
      });

      // 3. Protocolo de Éxito y Háptica
      setIsSuccess(true);
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate([30, 50, 30, 150]); // Secuencia de "Misión Cumplida"
      }

      nicepodLog("🎯 [Forja] Sabiduría sintetizada y anclada.");

      /**
       * 4. PROTOCOLO DE RESONANCIA (REFORMA V4.1)
       * Forzamos al radar a olvidar su posición previa para que el nuevo 
       * nodo aparezca instantáneamente al cargar el mapa.
       */
      reSyncRadar();

      // 5. Redirección con limpieza de stack
      setTimeout(() => {
        router.replace('/map');
      }, 1500); // Pausa táctica para mostrar el estado de éxito

    } catch (err: any) {
      nicepodLog("🔥 [Forja] Error en el Oráculo", err.message, 'error');
      setError(err.message || "La IA ha encontrado una interferencia de red.");
    }
  }, [state, engineData, synthesizeNarrative, router, reSyncRadar]);

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in slide-in-from-right-6 duration-700 pb-32">

      {/* I. CABECERA TÁCTICA */}
      <div className="px-6 flex items-center justify-between">
        <Button
          variant="industrial"
          size="icon"
          onClick={prevStep}
          disabled={isSynthesizing || isSuccess}
          className="rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 04</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">La Forja</h2>
        </div>
      </div>

      <div className="px-8 space-y-12">

        {/* II. DIRECCIÓN DEL CURADOR (MATIZ FINAL) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-40">
            <Wand2 size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Dirección Editorial</h3>
          </div>
          <div className="relative">
            <Input
              value={state.historicalFact}
              onChange={(e) => dispatch({ type: 'SET_HISTORICAL_FACT', payload: e.target.value })}
              placeholder="Instrucción específica para la IA..."
              className="h-16 bg-[#050505] border-white/10 rounded-2xl px-8 text-sm font-medium text-zinc-300 focus:border-primary/40 transition-all placeholder:text-zinc-800 shadow-2xl"
              disabled={isSynthesizing || isSuccess}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
              <Cpu size={20} />
            </div>
          </div>
        </div>

        {/* III. PARÁMETROS DE INTELIGENCIA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* PROFUNDIDAD NARRATIVA */}
          <div className="space-y-5">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 px-2 flex items-center gap-2">
              <Activity size={10} /> Escala de Conocimiento
            </span>
            <div className="grid grid-cols-3 gap-3">
              {DEPTH_OPTIONS.map((opt) => {
                const isActive = state.depth === opt.id;
                return (
                  <button
                    key={opt.id}
                    disabled={isSynthesizing || isSuccess}
                    onClick={() => dispatch({ type: 'SET_DEPTH', payload: opt.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-3xl border transition-all duration-500 group",
                      isActive
                        ? "bg-white text-black border-white shadow-xl scale-105"
                        : "bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/20"
                    )}
                  >
                    <opt.icon size={18} className={cn("mb-2", isActive ? "text-primary" : "text-zinc-700")} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
                    <span className="text-[7px] font-bold opacity-30 mt-1">{opt.time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TONALIDAD DE VOZ */}
          <div className="space-y-5">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 px-2 flex items-center gap-2">
              <Sparkles size={10} /> Frecuencia Cognitiva
            </span>
            <div className="grid grid-cols-2 gap-3">
              {TONE_OPTIONS.map((opt) => {
                const isActive = state.tone === opt.id;
                return (
                  <button
                    key={opt.id}
                    disabled={isSynthesizing || isSuccess}
                    onClick={() => dispatch({ type: 'SET_TONE', payload: opt.id })}
                    className={cn(
                      "h-14 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                      isActive
                        ? "bg-white text-black border-white shadow-xl"
                        : "bg-white/[0.02] border-white/5 text-zinc-600 hover:text-zinc-300"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* IV. PANEL DE CRISIS */}
        {error && (
          <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/20 flex items-start gap-4 text-red-500 animate-in shake duration-500">
            <AlertCircle size={20} className="shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Sincronización Fallida</h4>
              <p className="text-[9px] font-bold uppercase opacity-80 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* V. ACCIÓN SOBERANA (IGNICIÓN FINAL) */}
        <div className="pt-6">
          <Button
            onClick={handleForge}
            disabled={isSynthesizing || isSuccess}
            className={cn(
              "w-full h-24 rounded-[3rem] font-black uppercase tracking-[0.5em] shadow-2xl transition-all duration-700 active:scale-[0.98] group relative overflow-hidden border-2",
              isSuccess 
                ? "bg-emerald-500 border-emerald-500 text-white"
                : isSynthesizing
                ? "bg-zinc-900 border-white/5 text-zinc-700"
                : "bg-primary border-primary text-black hover:brightness-110"
            )}
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <span className="relative z-10 flex items-center justify-center gap-5 text-xl italic">
              {isSuccess ? (
                <>
                  <ShieldCheck size={28} />
                  <span>SABIDURÍA ANCLADA</span>
                </>
              ) : isSynthesizing ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>Sintetizando...</span>
                </>
              ) : (
                <>
                  <Cpu size={28} className="group-hover:rotate-12 transition-transform duration-500" />
                  <span>Despertar Agente 42</span>
                </>
              )}
            </span>
          </Button>

          {/* INDICADOR DE SEGURIDAD SOBERANA */}
          <div className="flex flex-col items-center gap-6 mt-16 pb-10 opacity-30">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-white" />
              <CheckCircle2 size={16} />
              <div className="h-[1px] w-12 bg-white" />
            </div>
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.8em] text-center">
              NicePod Security Protocol • Verified Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Forced Resonance Update: La llamada a reSyncRadar() antes de la redirección 
 *    invalida el throttling geográfico del GeoEngine, asegurando que el nuevo POI 
 *    sea visible instantáneamente en la malla tras el cierre del flujo.
 * 2. Visual Persistence Success: Se introdujo el estado 'isSuccess' para dar 
 *    feedback visual de 1.5s antes de navegar, elevando la calidad percibida.
 * 3. Editorial Consistency: TONE_OPTIONS y DEPTH_OPTIONS están ahora 100% 
 *    alineadas con el contrato de la V3.1 de forge-context.tsx.
 * 4. Zero External Deps: Cumplimiento total con el Dogma NicePod de soberanía.
 */