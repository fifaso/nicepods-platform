// components/geo/steps/step-3-dossier-review.tsx
// VERSIÓN: 2.6 (NicePod Sovereign Human Filter)
// Misión: Validar la evidencia física capturada por los sensores antes de la síntesis.
// [ESTABILIZACIÓN]: Integración de "Human in the Loop" para evitar alucinaciones.

"use client";

import { ArrowRight, CheckCircle2, ChevronLeft, Cloud, FileText, Landmark } from "lucide-react";

// --- INFRAESTRUCTURA DE ESTADO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function StepDossierReview() {
  const { state, dispatch, prevStep, nextStep } = useForge();
  const { data: engineData } = useGeoEngine();

  const dossier = engineData?.dossier;

  // Sincronizamos el OCR leído por la IA con la intención del usuario para que pueda editarlo
  const handleOcrCorrection = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Si el usuario edita, guardamos esa corrección en el "intentText" 
    // para sobreescribir la alucinación de la IA en el próximo paso.
    dispatch({ type: 'SET_INTENT', payload: e.target.value });
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-700 overflow-y-auto custom-scrollbar pb-24">

      {/* HEADER TÁCTICO */}
      <div className="px-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          className="rounded-full h-10 w-10 p-0 bg-white/5 border border-white/5 text-zinc-500"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 03</p>
          <h2 className="text-xl font-black uppercase text-white italic">Auditoría</h2>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-4">
          <CheckCircle2 className="text-primary shrink-0 mt-1" size={18} />
          <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
            La IA ha procesado los sensores. Valide los datos antes de forjar la crónica.
          </p>
        </div>

        {/* I. LECTURA DE EVIDENCIA (OCR) */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2 flex items-center gap-2">
            <FileText size={12} className="text-blue-500" /> Transcripción de la Placa (Editable)
          </label>
          <Textarea
            defaultValue={dossier?.raw_ocr_text || "No se detectó texto en la imagen."}
            onChange={handleOcrCorrection}
            className="bg-white/[0.02] border-white/10 rounded-2xl p-6 text-sm font-mono text-zinc-300 focus:border-primary/40 min-h-[120px] resize-none"
          />
          <p className="text-[8px] text-zinc-600 uppercase tracking-widest px-2">
            Si la IA omitió una fecha o nombre, corrígelo aquí para el Agente 38.
          </p>
        </div>

        {/* II. LECTURA DE ATMÓSFERA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <Cloud size={14} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Clima Anclado</span>
            <span className="text-sm font-bold text-white">{dossier?.weather_snapshot?.temp_c}°C</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <Landmark size={14} className="text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Estilo</span>
            <span className="text-sm font-bold text-white truncate">{dossier?.visual_analysis_dossier?.architectureStyle || "Desconocido"}</span>
          </div>
        </div>

        {/* BOTÓN DE AVANCE */}
        <Button
          onClick={nextStep}
          className="w-full mt-6 h-16 rounded-[1.5rem] bg-white text-black font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-zinc-200 transition-all group"
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            CONFIRMAR DOSSIER
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </span>
        </Button>
      </div>
    </div>
  );
}