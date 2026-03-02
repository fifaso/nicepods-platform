// components/geo/steps/step-3-intention.tsx
// VERSIÓN: 1.0

"use client";

import {
  AlertCircle,
  BookOpen,
  BrainCircuit,
  ChevronLeft,
  Clock,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import { useState } from "react";

// --- INFRAESTRUCTURA DE ESTADO Y ACCIONES ---
import { uploadGeoEvidence } from "@/actions/geo-actions";
import { createClient } from "@/lib/supabase/client";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * OPCIONES DE PROFUNDIDAD
 */
const DEPTH_OPTIONS = [
  { id: 'flash', label: 'Flash', time: '45s', icon: Zap },
  { id: 'cronica', label: 'Crónica', time: '2m', icon: Clock },
  { id: 'inmersion', label: 'Inmersión', time: '5m', icon: BookOpen },
];

/**
 * OPCIONES DE TONO
 */
const TONE_OPTIONS = [
  { id: 'academico', label: 'Académico' },
  { id: 'misterioso', label: 'Misterioso' },
  { id: 'epico', label: 'Épico' },
  { id: 'neutro', label: 'Neutro' },
];

export function StepIntention() {
  const { state, dispatch, prevStep } = useForge();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  /**
   * handleForge: El Orquestador de Materialización.
   * Ejecuta la subida de evidencia y despierta a la IA en una secuencia atómica.
   */
  const handleForge = async () => {
    if (state.intentText.trim().length < 10) return;

    setError(null);
    dispatch({ type: 'SET_IS_SUBMITTING', payload: true });
    dispatch({ type: 'SET_STEP', payload: 'FORGING' });

    try {
      // 1. FASE DE TRANSPORTE: Subida de imágenes al Storage
      console.info("📦 [Forge] Transfiriendo evidencia visual...");
      const uploadRes = await uploadGeoEvidence(
        state.heroImageBase64!,
        state.ocrImageBase64 || undefined
      );

      if (!uploadRes.success || !uploadRes.urls) {
        throw new Error(uploadRes.message || "Fallo Estructural en el Storage.");
      }

      // 2. FASE DE INGESTA: Creación del Borrador y Análisis OCR
      console.info("🧠 [Forge] Inyectando contexto en el Analista Multimodal...");
      const { data: ingestRes, error: ingestError } = await supabase.functions.invoke('geo-ingest-context', {
        body: {
          heroImageUrl: uploadRes.urls.heroImageUrl,
          ocrImageUrl: uploadRes.urls.ocrImageUrl,
          intentText: state.intentText,
          location: {
            latitude: state.latitude,
            longitude: state.longitude,
            accuracy: state.accuracy
          },
          resonanceRadius: state.resonanceRadius,
          categoryId: state.categoryId
        }
      });

      if (ingestError || !ingestRes.draftId) {
        throw new Error(ingestRes?.error || "La Bóveda rechazó la ingesta inicial.");
      }

      // 3. FASE DE SÍNTESIS: Generación del Guion Final (Agente 38)
      console.info("✍️ [Forge] Despertando al Agente 38 para forja narrativa...");
      const { data: synthRes, error: synthError } = await supabase.functions.invoke('geo-generate-content', {
        body: {
          draftId: ingestRes.draftId,
          finalIntent: state.intentText,
          depth: state.depth,
          tone: state.tone,
          categoryId: state.categoryId,
          historicalFact: state.historicalFact
        }
      });

      if (synthError) throw new Error("Fallo en la síntesis de sabiduría.");

      console.info("✅ [Forge] Nodo materializado correctamente.");

      // Salto final al mapa para ver el nuevo eco
      window.location.href = '/map';

    } catch (err: any) {
      console.error("🔥 [Forge-Fatal]:", err.message);
      setError(err.message);
      // Retrocedemos al paso de intención para que el Admin pueda corregir o reintentar
      dispatch({ type: 'SET_STEP', payload: 'INTENTION' });
      dispatch({ type: 'SET_IS_SUBMITTING', payload: false });
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-24">

      {/* HEADER TÁCTICO */}
      <div className="px-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={state.isSubmitting}
          className="rounded-full h-10 w-10 p-0 bg-white/5 border border-white/5 text-zinc-500"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 03</p>
          <h2 className="text-xl font-black uppercase text-white italic">Intención</h2>
        </div>
      </div>

      <div className="px-6 space-y-8">

        {/* BLOQUE I: SEMILLA NARRATIVA */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2 flex items-center gap-2">
            <BrainCircuit size={12} className="text-primary" /> Intención del Curador
          </label>
          <Textarea
            value={state.intentText}
            onChange={(e) => dispatch({ type: 'SET_INTENT', payload: e.target.value })}
            placeholder="¿Qué historia oculta este lugar? Describe el detalle que la IA debe magnificar..."
            className="bg-white/[0.02] border-white/10 rounded-[2rem] p-8 text-base text-white focus:border-primary/40 min-h-[160px] resize-none"
          />
        </div>

        {/* BLOQUE II: HECHO ATÓMICO (PEEK CARD) */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2">
            Hecho Atómico (Peek Hook)
          </label>
          <Input
            value={state.historicalFact}
            onChange={(e) => dispatch({ type: 'SET_HISTORICAL_FACT', payload: e.target.value })}
            placeholder="Ej: El jardín secreto donde Manuel Azaña escribía..."
            className="bg-white/[0.02] border-white/10 h-14 rounded-xl px-6 text-sm text-zinc-300 italic"
            maxLength={80}
          />
        </div>

        {/* BLOQUE III: CONFIGURACIÓN TÉCNICA (PROFUNDIDAD Y TONO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Selector de Profundidad */}
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2">Profundidad</span>
            <div className="flex flex-wrap gap-2">
              {DEPTH_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => dispatch({ type: 'SET_DEPTH', payload: opt.id as any })}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300",
                    state.depth === opt.id
                      ? "bg-primary text-black border-primary shadow-lg shadow-primary/20"
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

          {/* Selector de Tono */}
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2">Atmósfera de Voz</span>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => dispatch({ type: 'SET_TONE', payload: opt.id as any })}
                  className={cn(
                    "h-12 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                    state.tone === opt.id
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-white"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ERROR FEEDBACK */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
            <AlertCircle size={16} />
            <p className="text-[10px] font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        {/* BOTÓN FINAL DE FORJA */}
        <Button
          onClick={handleForge}
          disabled={state.intentText.trim().length < 10 || state.isSubmitting}
          className="w-full h-20 rounded-[2rem] bg-gradient-to-r from-primary via-indigo-600 to-primary text-white font-black text-xl tracking-[0.4em] shadow-2xl group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          <span className="relative z-10 flex items-center justify-center gap-4">
            <Sparkles size={24} className="fill-current" />
            FORJAR NODO URBANO
          </span>
        </Button>

        {/* STATUS DE SEGURIDAD */}
        <div className="flex items-center justify-center gap-3 py-4 opacity-20">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white">Integridad ACiD Garantizada</span>
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Orquestación Atómica: La función 'handleForge' no es solo un submit. Es un 
 *    pipeline síncrono que garantiza que la IA reciba URLs de imágenes reales 
 *    (vía actions/geo-actions.ts) antes de intentar escribir la crónica.
 * 2. Control de Tono/Profundidad: Al pre-configurar estos parámetros, estamos 
 *    reduciendo la incertidumbre de la IA, asegurando que un audio 'Flash' no 
 *    exceda el tiempo de atención del Voyager.
 * 3. UX Aeroespacial: El botón de forja utiliza un gradiente Aurora animado 
 *    para transmitir la importancia del momento: la creación de un nuevo 
 *    punto de sabiduría en la malla de Madrid.
 */