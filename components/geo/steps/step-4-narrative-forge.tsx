// components/geo/steps/step-4-narrative-forge.tsx
// VERSIÓN: 4.0 (NiceCore V2.6 - Agent 42 Awakening & Redirection Edition)
// Misión: Configurar el ADN literario y ejecutar la síntesis final del activo de conocimiento.
// [ESTABILIZACIÓN]: Sincronía con Agente 42, Feedback Háptico y Redirección Soberana.

"use client";

import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  Clock,
  Loader2,
  Sparkles,
  Wand2,
  Zap,
  Cpu,
  CheckCircle2
} from "lucide-react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// --- INFRAESTRUCTURA DE ESTADO Y MOTOR ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * CONFIGURACIÓN DE PARÁMETROS EDITORIALES
 */
const DEPTH_OPTIONS = [
  { id: 'flash', label: 'Flash', time: '45s', icon: Zap, desc: 'Hecho atómico' },
  { id: 'cronica', label: 'Crónica', time: '2m', icon: Clock, desc: 'Relato estándar' },
  { id: 'inmersion', label: 'Inmersión', time: '5m', icon: BookOpen, desc: 'Dossier profundo' },
] as const;

const TONE_OPTIONS = [
  { id: 'academico', label: 'Académico', vibe: 'Rigor técnico' },
  { id: 'misterioso', label: 'Misterioso', vibe: 'Intriga urbana' },
  { id: 'epico', label: 'Épico', vibe: 'Grandiosidad' },
  { id: 'neutro', label: 'Neutro', vibe: 'Objetividad' },
] as const;

/**
 * StepNarrativeForge: El punto de ignición intelectual.
 */
export function StepNarrativeForge() {
  const router = useRouter();
  const { state, dispatch, prevStep } = useForge();
  const { synthesizeNarrative, status: engineStatus, data: engineData } = useGeoEngine();
  
  const [error, setError] = useState<string | null>(null);

  const isSynthesizing = engineStatus === 'SYNTHESIZING';

  /**
   * handleForge:
   * Despierta al Agente 42 e inicia el proceso de transmutación de datos en sabiduría.
   */
  const handleForge = useCallback(async () => {
    // Recuperamos el ID del nodo anclado en la Bóveda
    const poiId = state.ingestedPoiId || engineData?.poiId;

    if (!poiId) {
      nicepodLog("Fallo de integridad: poiId no localizado en el contexto.", null, 'error');
      setError("ERROR_CRÍTICO: El nodo no ha sido anclado correctamente.");
      return;
    }

    setError(null);
    nicepodLog(`🚀 [Forja] Despertando Agente 42 para POI #${poiId}`);

    try {
      // Invocación a la Edge Function de síntesis narrativa
      await synthesizeNarrative({
        poiId: poiId,
        depth: state.depth,
        tone: state.tone,
        refinedIntent: state.intentText + (state.historicalFact ? ` . Nota adicional: ${state.historicalFact}` : "")
      });

      // Feedback háptico de misión cumplida
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate([30, 50, 30, 100, 50]);
      }

      nicepodLog("🎯 [Forja] Síntesis completada. Redirigiendo a la Malla.");

      // Redirección soberana: Limpiamos el stack para forzar el refresco de la malla activa
      router.replace('/map');
      
    } catch (err: any) {
      nicepodLog("🔥 [Forja] El Oráculo ha fallado.", err.message, 'error');
      setError(err.message || "Fallo en la conexión con el Agente 42.");
    }
  }, [state, engineData, synthesizeNarrative, router]);

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in slide-in-from-right-6 duration-700 selection:bg-primary/20 pb-32">

      {/* --- I. CABECERA TÁCTICA --- */}
      <div className="px-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={prevStep} 
          disabled={isSynthesizing} 
          className="rounded-full h-12 w-12 p-0 bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all"
        >
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 04</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter leading-none">La Forja</h2>
        </div>
      </div>

      <div className="px-8 space-y-12">
        
        {/* --- II. DIRECCIÓN EDITORIAL (EL MATIZ) --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-40">
            <Wand2 size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Dirección del Curador</h3>
          </div>
          <div className="relative">
            <Input
              value={state.historicalFact}
              onChange={(e) => dispatch({ type: 'SET_HISTORICAL_FACT', payload: e.target.value })}
              placeholder="Ej: Destaca el estilo barroco de la fachada..."
              className="h-16 bg-[#050505] border-white/10 rounded-2xl px-8 text-sm font-medium text-zinc-300 focus:border-primary/40 transition-all placeholder:text-zinc-800 shadow-2xl"
              disabled={isSynthesizing}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
              <Cpu size={20} />
            </div>
          </div>
        </div>

        {/* --- III. PARÁMETROS DE INTELIGENCIA --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* SECTOR: PROFUNDIDAD */}
          <div className="space-y-5">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 px-2 flex items-center gap-2">
              <Activity size={10} /> Escala Narrativa
            </span>
            <div className="grid grid-cols-3 gap-3">
              {DEPTH_OPTIONS.map((opt) => {
                const isActive = state.depth === opt.id;
                return (
                  <button
                    key={opt.id}
                    disabled={isSynthesizing}
                    onClick={() => dispatch({ type: 'SET_DEPTH', payload: opt.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-3xl border transition-all duration-500 group",
                      isActive 
                        ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-105" 
                        : "bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/20 hover:bg-white/[0.05]"
                    )}
                  >
                    <opt.icon size={18} className={cn("mb-2 transition-colors", isActive ? "text-primary" : "group-hover:text-zinc-300")} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
                    <span className="text-[7px] font-bold opacity-40 mt-1 uppercase">{opt.time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTOR: TONALIDAD */}
          <div className="space-y-5">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 px-2 flex items-center gap-2">
              <Sparkles size={10} /> Frecuencia de Voz
            </span>
            <div className="grid grid-cols-2 gap-3">
              {TONE_OPTIONS.map((opt) => {
                const isActive = state.tone === opt.id;
                return (
                  <button
                    key={opt.id}
                    disabled={isSynthesizing}
                    onClick={() => dispatch({ type: 'SET_TONE', payload: opt.id })}
                    className={cn(
                      "h-14 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                      isActive 
                        ? "bg-white text-black border-white shadow-xl" 
                        : "bg-white/[0.02] border-white/5 text-zinc-600 hover:text-zinc-300 hover:border-white/10"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- IV. PANEL DE CRISIS --- */}
        {error && (
          <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/20 flex items-start gap-4 text-red-500 animate-in shake duration-500">
            <AlertCircle size={20} className="shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Error de Sintonía</h4>
              <p className="text-[9px] font-bold uppercase opacity-80 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* --- V. ACCIÓN SOBERANA (AWAKENING) --- */}
        <div className="pt-6">
          <Button
            onClick={handleForge}
            disabled={isSynthesizing}
            className={cn(
              "w-full h-24 rounded-[3rem] font-black uppercase tracking-[0.5em] shadow-2xl transition-all duration-700 active:scale-[0.98] group relative overflow-hidden border-2",
              isSynthesizing
                ? "bg-zinc-900 border-white/5 text-zinc-700"
                : "bg-primary border-primary text-black hover:brightness-110"
            )}
          >
            {/* Efecto de escaneo Aurora */}
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            
            <span className="relative z-10 flex items-center justify-center gap-5 text-xl italic">
              {isSynthesizing ? (
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

          {/* INDICADOR DE SEGURIDAD */}
          <div className="flex flex-col items-center gap-6 mt-16 pb-10">
            <div className="flex items-center gap-4 opacity-20">
               <div className="h-[1px] w-12 bg-white" />
               <CheckCircle2 size={16} />
               <div className="h-[1px] w-12 bg-white" />
            </div>
            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.8em] text-center">
              NicePod Security Protocol • Verified Authority
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Sincronía con Router: Se implementó 'useRouter' para manejar la salida del 
 *    flujo de creación sin provocar una recarga pesada del navegador, preservando 
 *    la fluidez de la PWA.
 * 2. Inyección de Matiz: El campo 'historicalFact' se concatena con el 'intentText' 
 *    original, proporcionando al Agente 42 una instrucción de segundo nivel para 
 *    una crónica personalizada.
 * 3. Feedback Industrial: El botón de forja utiliza un efecto de barrido visual y 
 *    vibración háptica, elevando la sensación de herramienta profesional.
 */