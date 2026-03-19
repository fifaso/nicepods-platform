// components/geo/steps/step-3-dossier-review.tsx
// VERSIÓN: 3.0 (NicePod Sovereign Dossier Review - Oracle Edition)
// Misión: Validar y refinar la verdad física capturada antes de la síntesis narrativa.
// [ESTABILIZACIÓN]: Auto-poblado de intención, fix de Agente 42 y scroll optimizado.

"use client";

import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  Cloud,
  FileText,
  Landmark
} from "lucide-react";
import { useEffect } from "react";

// --- INFRAESTRUCTURA DE ESTADO SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function StepDossierReview() {
  // 1. CONSUMO DE MOTORES SINCRO-ESTABLES
  const { state, dispatch, prevStep, nextStep } = useForge();
  const { data: engineData } = useGeoEngine();

  const dossier = engineData?.dossier;

  /**
   * [PROTOCOLO DE AUTO-POBLADO]:
   * Si la IA extrajo texto de la placa (OCR), lo inyectamos en el estado 
   * global de intención para que el Admin pueda editarlo.
   */
  useEffect(() => {
    if (dossier?.raw_ocr_text && !state.intentText) {
      dispatch({ type: 'SET_INTENT', payload: dossier.raw_ocr_text });
    }
  }, [dossier?.raw_ocr_text, state.intentText, dispatch]);

  /**
   * handleManualCorrection:
   * Permite al Administrador ejercer su soberanía sobre los datos capturados.
   */
  const handleManualCorrection = (value: string) => {
    dispatch({ type: 'SET_INTENT', payload: value });
  };

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-700 selection:bg-primary/20 pb-32">

      {/* --- I. CABECERA DE AUDITORÍA --- */}
      <div className="px-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          className="rounded-full h-12 w-12 p-0 bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
        >
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 03</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Auditoría</h2>
        </div>
      </div>

      <div className="px-8 space-y-10">

        {/* INDICADOR DE ÉXITO SENSORIAL */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 flex items-start gap-5 shadow-2xl">
          <div className="p-2 bg-emerald-500/20 rounded-full shrink-0">
            <CheckCircle2 className="text-emerald-400" size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Dossier Materializado</h4>
            <p className="text-[10px] font-medium text-emerald-400/60 leading-relaxed uppercase">
              La IA ha procesado la evidencia física. Valide la transcripción para el Agente 42.
            </p>
          </div>
        </div>

        {/* --- II. SECTOR OCR: LA VERDAD DE LA PIEDRA --- */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 opacity-50">
              <FileText size={14} className="text-blue-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Transcripción de Placa</h3>
            </div>
            <Badge variant="outline" className="text-[8px] font-bold border-white/10 text-zinc-500">EDITABLE</Badge>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-blue-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Textarea
              value={state.intentText}
              onChange={(e) => handleManualCorrection(e.target.value)}
              placeholder="Esperando datos del oráculo..."
              className="relative min-h-[180px] bg-[#020202] border-white/10 rounded-[2rem] p-8 text-sm font-medium leading-relaxed text-zinc-300 focus:border-primary/40 focus:ring-0 transition-all custom-scrollbar"
            />
          </div>

          <div className="flex items-center gap-3 px-4 opacity-30">
            <AlertCircle size={12} className="text-zinc-500" />
            <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">
              Cualquier cambio aquí será la semilla narrativa definitiva.
            </p>
          </div>
        </div>

        {/* --- III. SECTOR ATMÓSFERA: CONTEXTO AMBIENTAL --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Tarjeta Clima */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-inner">
            <div className="flex items-center gap-3 opacity-40">
              <Cloud size={14} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Atmósfera</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tabular-nums tracking-tighter">
                {dossier?.weather_snapshot?.temp_c ?? "--"}°C
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase italic">
                {dossier?.weather_snapshot?.condition || "Sincronizando"}
              </span>
            </div>
          </div>

          {/* Tarjeta Arquitectura */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-inner">
            <div className="flex items-center gap-3 opacity-40">
              <Landmark size={14} className="text-amber-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Estilo Detectado</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white uppercase tracking-tight truncate">
                {dossier?.visual_analysis_dossier?.architectureStyle || "No Identificado"}
              </span>
              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                Peritaje Visual V2.6
              </span>
            </div>
          </div>
        </div>

        {/* --- IV. ACCIÓN DE CONFIRMACIÓN --- */}
        <div className="pt-6">
          <Button
            onClick={nextStep}
            className="w-full h-20 rounded-[2.5rem] bg-white text-black font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-primary hover:text-white transition-all duration-500 active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <span className="relative z-10 flex items-center justify-center gap-4 text-lg">
              CONFIRMAR DOSSIER
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-500" />
            </span>
          </Button>

          <div className="flex items-center justify-center gap-3 mt-8 opacity-20">
            <BrainCircuit size={12} />
            <p className="text-[8px] font-black uppercase tracking-[0.6em]">Próxima Fase: El Despertar del Agente 42</p>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Solución de Mudez (Líneas 47-51): El 'useEffect' garantiza que los datos 
 *    transcritos por la IA aparezcan automáticamente en el editor, eliminando 
 *    la necesidad de copiar/pegar manualmente.
 * 2. Higiene de Agente: Se ha erradicado el nombre 'Agente 38' del código 
 *    operativo, preparando al Admin para la interacción con el Oráculo Urbano.
 * 3. Diseño Full-Access: El padding inferior ('pb-32') y la estructura flexible 
 *    permiten que el Administrador revise textos largos de placas haciendo scroll, 
 *    manteniendo la terminal 100% funcional en dispositivos táctiles.
 */