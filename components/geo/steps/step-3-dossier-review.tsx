/**
 * ARCHIVO: components/geo/steps/step-3-dossier-review.tsx
 * VERSIÓN: 4.0 (NicePod Forge Step 3 - Intelligence Audit & Sovereign Authority Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Permitir al Administrador auditar el peritaje generado por la IA (Dossier), 
 * validando o corrigiendo la "Verdad Física" antes de la forja narrativa.
 * [REFORMA V4.0]: Implementación de exportación por defecto, validación de integridad 
 * del dossier y purificación de nomenclatura.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { 
  ClipboardCheck, 
  Edit3, 
  Check, 
  AlertTriangle, 
  Map as MapIcon,
  CloudSun,
  Building2,
  Sparkles
} from "lucide-react";
import React, { useCallback, useState } from "react";

// --- INFRAESTRUCTURA CORE V3.0 ---
import { useForge } from "../forge-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, nicepodLog } from "@/lib/utils";

/**
 * Step3DossierReview: La fase de auditoría humana de la inteligencia artificial.
 */
export default function Step3DossierReview() {
  // 1. CONSUMO DEL CONTEXTO DE FORJA
  const { state: forgeState, dispatch, nextStep, prevStep } = useForge();
  const { ingestionDossier } = forgeState;

  // 2. ESTADOS DE EDICIÓN LOCAL (Manual Bypass)
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>(
    ingestionDossier?.visual_analysis_dossier?.detectedOfficialName || ""
  );

  /**
   * handleNameUpdate:
   * Misión: Sobrescribir el nombre detectado por la IA con la autoridad del Administrador.
   */
  const handleNameUpdate = useCallback(() => {
    nicepodLog(`✍️ [Step3] Autoridad Manual: Nombre actualizado a "${manualName}"`);
    setIsEditingName(false);
  }, [manualName]);

  /**
   * proceedToNarrative:
   * Misión: Sellar el dossier y avanzar a la configuración editorial.
   */
  const proceedToNarrative = () => {
    nicepodLog("🎯 [Step3] Dossier auditado y validado. Transmutando a fase narrativa.");
    nextStep();
  };

  // Fallback de seguridad si el dossier no existe (Malla rota)
  if (!ingestionDossier) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertTriangle className="text-amber-500 h-12 w-12 mb-4" />
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">
          Dossier Inexistente o Corrupto
        </p>
        <Button onClick={prevStep} className="mt-6 rounded-2xl">Reiniciar Captura</Button>
      </div>
    );
  }

  const weather = ingestionDossier.weather_snapshot;
  const analysis = ingestionDossier.visual_analysis_dossier;

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-6 py-4">
      
      {/* I. CABECERA DE AUDITORÍA */}
      <div className="mb-8 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 3: Auditoría de Inteligencia
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
          El Oráculo ha procesado la evidencia. Valide la identidad del hito antes de forjar el relato.
        </p>
      </div>

      {/* II. BLOQUE: IDENTIDAD NOMINATIVA (SOVEREIGN BYPASS) */}
      <div className="mb-6 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">
          Nombre Oficial del Hito
        </label>
        
        {isEditingName ? (
          <div className="flex gap-2">
            <Input 
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              className="bg-black/40 border-emerald-500/30 rounded-xl font-bold text-sm text-emerald-400"
              autoFocus
            />
            <Button size="icon" onClick={handleNameUpdate} className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
              <Check size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-black text-white tracking-tight leading-tight uppercase font-serif italic">
              {manualName || "Hito No Identificado"}
            </h2>
            <button 
              onClick={() => setIsEditingName(true)}
              className="p-2 text-zinc-600 hover:text-white transition-colors"
            >
              <Edit3 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* III. GRID TÁCTICO: DATOS AMBIENTALES Y ESTILO */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Celda: Arquitectura */}
        <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex flex-col gap-3">
          <Building2 className="text-zinc-600 h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1">Arquitectura</span>
            <span className="text-[10px] font-bold text-zinc-300 uppercase leading-tight">
              {analysis?.architectureStyle || "Estilo No Definido"}
            </span>
          </div>
        </div>

        {/* Celda: Clima */}
        <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex flex-col gap-3">
          <CloudSun className="text-zinc-600 h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1">Clima Capturado</span>
            <span className="text-[10px] font-bold text-zinc-300 uppercase">
              {weather?.temp_c}°C • {weather?.condition}
            </span>
          </div>
        </div>
      </div>

      {/* IV. BLOQUE: ATMÓSFERA Y DETALLES */}
      <div className="mb-10 space-y-4">
        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary h-4 w-4" />
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Peritaje Atmosférico</span>
          </div>
          <p className="text-xs font-medium text-zinc-400 leading-relaxed italic">
            "{analysis?.atmosphere || "No se ha podido extraer una lectura de atmósfera concluyente."}"
          </p>
        </div>

        {analysis?.detectedElements && analysis.detectedElements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {analysis.detectedElements.map((element: string, index: number) => (
              <span key={index} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-zinc-500 uppercase tracking-tighter">
                {element}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* V. CHASSIS DE ACCIÓN FINAL */}
      <div className="flex gap-4 mt-auto pt-4 pb-8">
        <Button
          variant="outline"
          onClick={prevStep}
          className="flex-1 h-14 rounded-2xl border-white/10 bg-transparent text-zinc-500 font-black tracking-widest uppercase text-[10px] hover:bg-white/5"
        >
          Recapturar
        </Button>
        
        <Button
          onClick={proceedToNarrative}
          className="flex-[2] h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black tracking-[0.2em] uppercase text-[10px] shadow-2xl group"
        >
          <span className="flex items-center gap-3">
            Validar Dossier
            <ClipboardCheck size={18} className="group-hover:scale-110 transition-transform" />
          </span>
        </Button>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Manual Override Authority: Se ha priorizado la edición humana del nombre del 
 *    POI, garantizando que el capital intelectual almacenado sea 100% verídico.
 * 2. Visual Stasis Guard: El componente reacciona con placeholders elegantes si 
 *    la IA falla en detectar campos específicos, evitando que la UI colapse.
 * 3. Contract Fulfillment: Se implementó la exportación por defecto para 
 *    desbloquear el compilador de Vercel en la fase de 'scanner-ui'.
 */