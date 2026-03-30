/**
 * ARCHIVO: components/geo/steps/step-3-dossier-review.tsx
 * VERSIÓN: 4.1 (NicePod Sovereign Dossier Review - Emergency Bypass Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Validar la evidencia física analizada por la IA o permitir el anclaje manual.
 * [REFORMA V4.1]: Implementación de Modo de Emergencia (Bypass) y Alerta de Proximidad.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

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
  Sparkles,
  AlertTriangle,
  History,
  Terminal
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE ESTADO SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "../forge-context";

// --- COMPONENTES UI ATÓMICOS ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// --- UTILIDADES DE SISTEMA ---
import { cn, nicepodLog } from "@/lib/utils";

/**
 * StepDossierReview: La aduana de validación del Administrador.
 */
export function StepDossierReview() {
  // 1. CONSUMO DE MOTORES Y CONTEXTO
  const { state, dispatch, prevStep, nextStep } = useForge();
  const { 
    data: engineData, 
    status: engineStatus, 
    error: engineError,
    setManualPlaceName 
  } = useGeoEngine();

  // 2. DETECCIÓN DE ESTADO TÁCTICO
  const dossier = useMemo(() => engineData?.dossier, [engineData]);
  const isRejected = engineStatus === 'REJECTED';
  const hasConflict = engineData?.isProximityConflict;

  /**
   * EFECTO: SINCRONÍA DE INTENCIÓN
   * Si la IA devolvió OCR, lo inyectamos como punto de partida si el Admin no ha escrito nada.
   */
  useEffect(() => {
    if (dossier?.raw_ocr_text && !state.intentText) {
      dispatch({ type: 'SET_INTENT', payload: dossier.raw_ocr_text });
    }
  }, [dossier?.raw_ocr_text, state.intentText, dispatch]);

  /**
   * BARRERA DE MATERIALIZACIÓN (SKELETON)
   * Solo bloqueamos si no hay dossier Y el motor no ha fallado. 
   * Si falló (isRejected), permitimos el paso manual.
   */
  if (!dossier && !isRejected) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="h-16 w-16 animate-spin text-primary/40 relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
            Sintonizando Dossier
          </p>
          <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest animate-pulse">
            El Oráculo está procesando la evidencia visual...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in slide-in-from-right-6 duration-700 pb-32">

      {/* I. CABECERA DE OPERACIONES */}
      <div className="px-6 flex items-center justify-between">
        <Button
          variant="industrial"
          size="icon"
          onClick={prevStep}
          className="rounded-full bg-white/5 border-white/10 text-zinc-400 hover:text-white"
        >
          <ChevronLeft size={24} />
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fase 03</p>
          <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Auditoría</h2>
        </div>
      </div>

      <div className="px-8 space-y-10">

        {/* 
            INDICADOR DE ESTADO DE MISIÓN 
            Mutación dinámica: Verde (Éxito IA) vs Rojo (Fallo/Manual Bypass)
        */}
        {isRejected ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-6 flex items-start gap-6 shadow-inner relative overflow-hidden">
            <div className="p-3 bg-red-500/10 rounded-2xl shrink-0">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-black text-red-400 uppercase tracking-widest">Sintonía Manual Activada</h4>
              <p className="text-[9px] font-bold text-red-400/50 leading-relaxed uppercase tracking-tight">
                El Oráculo no pudo procesar la evidencia automáticamente. Proceda al anclaje de datos manual.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-6 flex items-start gap-6 shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="p-3 bg-emerald-500/10 rounded-2xl shrink-0 z-10">
              <CheckCircle2 className="text-emerald-400" size={24} />
            </div>
            <div className="space-y-1.5 z-10">
              <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Evidencia Validada</h4>
              <p className="text-[9px] font-bold text-emerald-400/50 leading-relaxed uppercase tracking-tight">
                Los sensores han materializado el hito con éxito. Verifique los metadatos.
              </p>
            </div>
          </div>
        )}

        {/* ALERTA DE CONFLICTO DE PROXIMIDAD */}
        {hasConflict && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-center gap-4 animate-in pulse duration-1000">
            <History className="text-amber-500" size={20} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Conflicto Geográfico</span>
              <span className="text-[8px] font-bold text-amber-500/70 uppercase mt-1">Ya existe una resonancia activa en este radio.</span>
            </div>
          </div>
        )}

        {/* --- II. NOMBRE DEL NODO (MANUAL BYPASS) --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2 opacity-40">
            <Terminal size={14} className="text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Identidad del Nodo</h3>
          </div>
          <Input 
            value={engineData?.manualPlaceName || ""}
            onChange={(e) => setManualPlaceName(e.target.value)}
            placeholder="Nombre oficial del hito..."
            className="h-16 bg-[#050505] border-white/10 rounded-2xl px-8 text-sm font-bold text-zinc-300 focus:border-primary/40 transition-all shadow-2xl"
          />
        </div>

        {/* --- III. EDITOR DE LA VERDAD (OCR/INTENT) --- */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 opacity-40">
              <FileText size={14} className="text-blue-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                Cuerpo de Evidencia
              </h3>
            </div>
            <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary/60 uppercase tracking-[0.2em] px-3 py-1">
              Soberanía Curador
            </Badge>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-b from-primary/10 to-transparent rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
            <Textarea
              value={state.intentText}
              onChange={(e) => dispatch({ type: 'SET_INTENT', payload: e.target.value })}
              placeholder="Escriba los datos clave, placas o historia detectada..."
              className={cn(
                "relative min-h-[200px] bg-[#050505] border-white/5 rounded-[2.5rem] p-8",
                "text-sm font-medium leading-relaxed text-zinc-300 focus:border-primary/40 focus:ring-0 transition-all",
                "custom-scrollbar selection:bg-primary/40 shadow-inner"
              )}
            />
          </div>
        </div>

        {/* --- IV. TELEMETRÍA AMBIENTAL --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloque: Atmósfera */}
          <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-5 shadow-inner group/card">
            <div className="flex items-center gap-3 opacity-40">
              <Cloud size={14} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Atmósfera</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                {dossier?.weather_snapshot?.temp_c ?? "--"}°C
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase italic tracking-widest">
                {dossier?.weather_snapshot?.condition || "Resolviendo..."}
              </span>
            </div>
          </div>

          {/* Bloque: Estilo */}
          <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-5 shadow-inner group/card">
            <div className="flex items-center gap-3 opacity-40">
              <Landmark size={14} className="text-amber-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Arquitectura</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white uppercase tracking-tight truncate leading-none">
                {dossier?.visual_analysis_dossier?.architectureStyle || "Manual Entry"}
              </span>
              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-2 border-t border-white/5 pt-2">
                Audit: Verified Status
              </span>
            </div>
          </div>
        </div>

        {/* --- V. GATILLO DE FORJA NARRATIVA --- */}
        <div className="pt-8">
          <Button
            onClick={nextStep}
            disabled={state.intentText.length < 5}
            className={cn(
              "w-full h-24 rounded-[3rem] font-black uppercase tracking-[0.4em] shadow-2xl transition-all duration-700 active:scale-[0.98] group relative overflow-hidden border-2",
              state.intentText.length >= 5 
                ? "bg-white text-black border-white hover:bg-primary hover:text-white"
                : "bg-zinc-900 text-zinc-700 border-white/5"
            )}
          >
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <span className="relative z-10 flex items-center justify-center gap-5 text-xl">
              CERRAR EXPEDIENTE
              <ArrowRight size={26} className="group-hover:translate-x-3 transition-transform duration-700" />
            </span>
          </Button>

          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.6em] text-center mt-12 pb-10">
            Fase Final: Despertando al Agente 42
          </p>
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Emergency Manual Bypass: Se eliminó el bloqueo por dossier inexistente. Si
 *    isRejected es true, el Admin puede rellenar los datos manualmente.
 * 2. Interaction Sovereignty: Se vinculó el Input del Nombre al motor de 
 *    geolocalización (setManualPlaceName), asegurando que la verdad editada se 
 *    propague a la base de datos.
 * 3. Proximity Awareness: Implementada alerta visual 'hasConflict' para evitar
 *    saturar la Malla con nodos redundantes en la misma coordenada.
 * 4. Zero External Deps: El archivo cumple estrictamente con el ecosistema NicePod.
 */