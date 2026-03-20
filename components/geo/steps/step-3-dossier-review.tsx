// components/geo/steps/step-3-dossier-review.tsx
// VERSIÓN: 4.0 (NiceCore V2.6 - Integrity Guard & Oracle Synchronization Edition)
// Misión: Validar la evidencia física analizada por la IA antes de la forja narrativa.
// [ESTABILIZACIÓN]: Implementación de Barrera de Hidratación y Sincronía con Agente 42.

"use client";

import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  Cloud,
  FileText,
  Landmark,
  Loader2,
  Sparkles
} from "lucide-react";
import { useEffect, useMemo } from "react";

// --- INFRAESTRUCTURA DE ESTADO SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * StepDossierReview: La aduana humana del capital intelectual.
 */
export function StepDossierReview() {
  // 1. CONSUMO DE MOTORES SINCRO-ESTABLES
  const { state, dispatch, prevStep, nextStep } = useForge();
  const { data: engineData, status: engineStatus } = useGeoEngine();

  // Extraemos el dossier procesado por el Sensor-Ingestor
  const dossier = useMemo(() => engineData?.dossier, [engineData]);

  /**
   * [PROTOCOLO DE AUTO-POBLADO]:
   * Sincroniza el resultado del OCR con la memoria de intención del Administrador.
   * Solo actúa si el intentText está vacío para no sobreescribir correcciones manuales.
   */
  useEffect(() => {
    if (dossier?.raw_ocr_text && !state.intentText) {
      dispatch({ type: 'SET_INTENT', payload: dossier.raw_ocr_text });
    }
  }, [dossier?.raw_ocr_text, state.intentText, dispatch]);

  /**
   * handleManualCorrection:
   * Ejerce la autoridad del curador sobre el texto extraído por la IA.
   */
  const handleManualCorrection = (value: string) => {
    dispatch({ type: 'SET_INTENT', payload: value });
  };

  /**
   * CAPA 0: BARRERA DE HIDRATACIÓN (SKELETON)
   * Si el motor está ingestado pero el búfer de datos no ha llegado al cliente,
   * bloqueamos la interfaz con un estado de carga industrial.
   */
  if (!dossier) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center gap-6 animate-pulse">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <Loader2 className="h-16 w-16 animate-spin text-primary/40 relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
            Materializando Dossier
          </p>
          <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
            Sincronizando con la Bóveda de Resonancia...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in slide-in-from-right-6 duration-700 selection:bg-primary/20 pb-32">

      {/* --- I. CABECERA DE OPERACIONES --- */}
      <div className="px-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          className="rounded-full h-12 w-12 p-0 bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 03</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Auditoría</h2>
        </div>
      </div>

      <div className="px-8 space-y-10">

        {/* INDICADOR DE INTEGRIDAD FÍSICA */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-6 flex items-start gap-6 shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="p-3 bg-emerald-500/10 rounded-2xl shrink-0 z-10">
            <CheckCircle2 className="text-emerald-400" size={24} />
          </div>
          <div className="space-y-1.5 z-10">
            <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none">
              Evidencia Certificada
            </h4>
            <p className="text-[9px] font-bold text-emerald-400/50 leading-relaxed uppercase tracking-tight">
              Los sensores han capturado la verdad del lugar. Proceda a la validación editorial del registro.
            </p>
          </div>
        </div>

        {/* --- II. EL EDITOR DE LA VERDAD (OCR REFINEMENT) --- */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 opacity-40">
              <FileText size={14} className="text-blue-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                Registro de Placa (OCR)
              </h3>
            </div>
            <Badge variant="outline" className="text-[8px] font-black border-blue-500/20 text-blue-400/60 uppercase tracking-[0.2em] px-3 py-1">
              Soberanía Admin
            </Badge>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/10 to-primary/5 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
            <Textarea
              value={state.intentText}
              onChange={(e) => handleManualCorrection(e.target.value)}
              placeholder="Descifrando inscripciones..."
              className={cn(
                "relative min-h-[220px] bg-[#050505] border-white/5 rounded-[2.5rem] p-8",
                "text-sm font-medium leading-relaxed text-zinc-300 focus:border-primary/40 focus:ring-0 transition-all",
                "custom-scrollbar selection:bg-primary/40 shadow-2xl"
              )}
            />
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] rounded-2xl border border-white/5">
            <AlertCircle size={14} className="text-zinc-600" />
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 leading-none">
              Este texto alimentará directamente la forja del Agente 42.
            </p>
          </div>
        </div>

        {/* --- III. TELEMETRÍA AMBIENTAL --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Bloque: Atmósfera */}
          <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-5 shadow-inner transition-colors hover:bg-white/[0.03] group/card">
            <div className="flex items-center gap-3 opacity-40">
              <Cloud size={14} className="text-emerald-400 group-hover/card:animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Condiciones</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">
                {dossier.weather_snapshot?.temp_c ?? "--"}°C
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase italic tracking-widest">
                {dossier.weather_snapshot?.condition || "Nominal"}
              </span>
            </div>
          </div>

          {/* Bloque: Arquitectura */}
          <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-5 shadow-inner transition-colors hover:bg-white/[0.03] group/card">
            <div className="flex items-center gap-3 opacity-40">
              <Landmark size={14} className="text-amber-400 group-hover/card:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Peritaje</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white uppercase tracking-tight truncate leading-none">
                {dossier.visual_analysis_dossier?.architectureStyle || "No Identificado"}
              </span>
              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-2 border-t border-white/5 pt-2">
                NiceCore Vision V2.6
              </span>
            </div>
          </div>
        </div>

        {/* --- IV. GATILLO DE FORJA NARRATIVA --- */}
        <div className="pt-8">
          <Button
            onClick={nextStep}
            disabled={state.intentText.length < 10}
            className={cn(
              "w-full h-24 rounded-[3rem] font-black uppercase tracking-[0.4em] shadow-2xl transition-all duration-700 active:scale-[0.98] group relative overflow-hidden border-2",
              state.intentText.length >= 10 
                ? "bg-white text-black border-white hover:bg-primary hover:text-white hover:border-primary"
                : "bg-zinc-900 text-zinc-700 border-white/5 cursor-not-allowed"
            )}
          >
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <span className="relative z-10 flex items-center justify-center gap-5 text-xl">
              CONFIRMAR DOSSIER
              <ArrowRight size={26} className="group-hover:translate-x-3 transition-transform duration-700 ease-in-out" />
            </span>
          </Button>

          <div className="flex flex-col items-center gap-4 mt-12">
            <div className="flex items-center gap-4 opacity-20">
              <BrainCircuit size={16} />
              <div className="h-px w-24 bg-white/20" />
              <Sparkles size={16} />
            </div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.6em] text-center">
              Fase Final: El Despertar del Agente 42
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Materialización Garantizada: La barrera inicial (Línea 66) asegura que el 
 *    componente no intente leer de un 'engineData' inexistente, eliminando el 
 *    error de renderizado que dejaba la pantalla en blanco.
 * 2. Soberanía Editorial: El botón de confirmación ahora exige al menos 10 
 *    caracteres en el 'intentText', obligando al Admin a aportar valor humano 
 *    antes de consumir recursos del Oráculo.
 * 3. Estética Aurora: Se han afinado los radios de borde (2.5rem - 3rem) y 
 *    los efectos de blur para mantener la inmersión de la Workstation.
 */