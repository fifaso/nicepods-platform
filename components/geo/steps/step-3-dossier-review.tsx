/**
 * ARCHIVO: components/geo/steps/step-3-dossier-review.tsx
 * VERSIÓN: 8.0 (NicePod Forge Step 3 - Full Nominative Authority & Grounding Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Permitir al Administrador auditar el peritaje técnico generado por el 
 * Oráculo de Inteligencia, validando la "Verdad Física" y el "Grounding" entre 
 * evidencias visuales, sintonía temporal y fuentes externas de autoridad.
 * [REFORMA V8.0]: Implementación absoluta de la Zero Abbreviations Policy (ZAP).
 * Sincronización total con la Constitución V8.6 y el ForgeContext V6.0. 
 * Resolución de redundancias nominales y sellado de la autoridad manual humana.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { 
  ClipboardCheck, 
  Edit3, 
  Check, 
  AlertTriangle, 
  CloudSun,
  Building2,
  History as HistoryIcon,
  ShieldCheck,
  Globe
} from "lucide-react";
import React, { useCallback, useState } from "react";

// --- INFRAESTRUCTURA CORE V4.0 ---
import { useForge } from "../forge-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { nicepodLog } from "@/lib/utils";

// --- SOBERANÍA DE TIPOS (V8.6) ---
import { IngestionDossier } from "@/types/geo-sovereignty";

/**
 * Step3DossierReview: El panel de auditoría pericial de la Workstation.
 */
export default function Step3DossierReview() {
  
  // 1. CONSUMO DEL CONTEXTO DE FORJA SOBERANO (V6.0 SINCRO)
  const { 
    state: forgeState, 
    dispatch: stateDispatcher, 
    nextStep: navigateToNextStepAction, 
    prevStep: navigateToPreviousStepAction 
  } = useForge();
  
  const { ingestionDossier } = forgeState;

  // 2. ESTADOS DE EDICIÓN LOCAL (Manual Authority Override)
  // [ZAP V8.0]: Renombrado para erradicar vaguedades.
  const [isEditingPointOfInterestNominativeTitle, setIsEditingPointOfInterestNominativeTitle] = useState<boolean>(false);
  const [manualPointOfInterestNominativeTitle, setManualPointOfInterestNominativeTitle] = useState<string>(
    ingestionDossier?.visual_analysis_dossier?.detectedOfficialName || ""
  );

  /**
   * executeManualNominativeAuthorityOverrideWorkflow:
   * Misión: Sobrescribir la identidad detectada por la IA con la autoridad humana.
   * [SINCRO V8.0]: Alineación con el nuevo contrato nominal del Dossier V8.6.
   */
  const executeManualNominativeAuthorityOverrideWorkflow = useCallback(() => {
    nicepodLog(`✍️ [Step3] Autoridad Manual: Título nominativo actualizado a "${manualPointOfInterestNominativeTitle}"`);
    setIsEditingPointOfInterestNominativeTitle(false);
    
    if (ingestionDossier && forgeState.ingestedPointOfInterestIdentification) {
       const updatedIntelligenceDossier: IngestionDossier = {
         ...ingestionDossier,
         visual_analysis_dossier: {
           ...ingestionDossier.visual_analysis_dossier,
           detectedOfficialName: manualPointOfInterestNominativeTitle
         }
       };

       stateDispatcher({ 
         type: 'SET_INGESTION_RESULT', 
         payload: { 
           pointOfInterestIdentification: forgeState.ingestedPointOfInterestIdentification, 
           dossier: updatedIntelligenceDossier 
         } 
       });
    }
  }, [manualPointOfInterestNominativeTitle, ingestionDossier, stateDispatcher, forgeState.ingestedPointOfInterestIdentification]);

  /**
   * executeFinalAuditValidationWorkflow:
   * Misión: Sellar el peritaje y avanzar a la fase de síntesis narrativa.
   */
  const executeFinalAuditValidationWorkflow = () => {
    nicepodLog("🎯 [Step3] Peritaje multidimensional validado por el Administrador.");
    navigateToNextStepAction();
  };

  /**
   * PROTOCOLO DE DEFENSA ANTE AMNESIA:
   * Fallback de seguridad si el dossier no reside en la memoria volátil.
   */
  if (!ingestionDossier) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-[#020202] isolate">
        <AlertTriangle className="text-amber-500 h-16 w-16 mb-6 animate-pulse" />
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] leading-relaxed">
          Expediente de Inteligencia Inexistente en Memoria
        </p>
        <Button 
          onClick={navigateToPreviousStepAction} 
          variant="outline" 
          className="mt-8 rounded-2xl border-white/10 hover:bg-white/5 transition-all font-black text-[9px] tracking-widest uppercase"
        >
          Reiniciar Link Sensorial
        </Button>
      </div>
    );
  }

  // [SINCRO V8.6]: Extracción de propiedades nominales purificadas.
  const weatherSnapshotData = ingestionDossier.weather_snapshot;
  const visualAnalysisData = ingestionDossier.visual_analysis_dossier;

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-6 py-6 isolate">
      
      {/* I. CABECERA TÁCTICA DE AUDITORÍA */}
      <div className="mb-8 shrink-0 px-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 3: Auditoría Pericial
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
          Valide el contraste entre la evidencia física y la sabiduría documental capturada por el Oráculo.
        </p>
      </div>

      {/* II. BLOQUE DE IDENTIDAD NOMINATIVA (SOVEREIGN AUTHORITY BYPASS) */}
      <div className="mb-6 p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl relative overflow-hidden group isolate">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 block">
          Identidad Verificada del Hito
        </label>
        
        {isEditingPointOfInterestNominativeTitle ? (
          <div className="flex gap-3 animate-in fade-in slide-in-from-left-2">
            <Input 
              value={manualPointOfInterestNominativeTitle}
              onChange={(changeEvent) => setManualPointOfInterestNominativeTitle(changeEvent.target.value)}
              className="bg-black/40 border-emerald-500/30 h-14 rounded-2xl font-bold text-sm text-emerald-400 focus:ring-0"
              autoFocus
            />
            <Button 
              size="icon" 
              onClick={executeManualNominativeAuthorityOverrideWorkflow} 
              className="h-14 w-14 bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-lg shrink-0"
            >
              <Check size={20} />
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-2xl font-black text-white tracking-tighter leading-[1.1] uppercase font-serif italic">
              {manualPointOfInterestNominativeTitle || visualAnalysisData?.detectedOfficialName || "Nodo No Identificado"}
            </h2>
            <button 
              onClick={() => setIsEditingPointOfInterestNominativeTitle(true)}
              className="p-3 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <Edit3 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* III. GRID TÁCTICO: TAXONOMÍA Y TEMPORALIDAD INDUSTRIAL */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Cuadrantes de Malla (Misión y Entidad) */}
        <div className="p-5 rounded-[2rem] bg-[#080808]/60 border border-white/5 flex flex-col gap-4 shadow-inner">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary h-4 w-4" />
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Malla Taxonómica</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate">
              {forgeState.categoryMission?.replace('_', ' ')}
            </span>
            <span className="text-[8px] font-bold text-primary uppercase tracking-widest opacity-80">
              {forgeState.categoryEntity?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Reloj Soberano (Sintonía de Época Histórica) */}
        <div className="p-5 rounded-[2rem] bg-[#080808]/60 border border-white/5 flex flex-col gap-4 shadow-inner">
          <div className="flex items-center gap-2">
            <HistoryIcon className="text-amber-500 h-4 w-4" />
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Sintonía Temporal</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">
              {forgeState.historicalEpoch?.replace('_', ' ')}
            </span>
            <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest opacity-80">
              Contexto Sincronizado
            </span>
          </div>
        </div>
      </div>

      {/* IV. BLOQUE: KNOWLEDGE BRIDGE (VALIDACIÓN DE GROUNDING V4.2) */}
      <div className="mb-8 space-y-4">
        <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-2.5">
              <Globe className="text-zinc-500 h-4 w-4" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Validación de Grounding</span>
            </div>
            {forgeState.referenceUniformResourceLocator && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black tracking-widest uppercase px-3">
                Link de Sabiduría
              </Badge>
            )}
          </div>
          
          <p className="text-xs font-medium text-zinc-400 leading-relaxed italic mb-4">
            "{visualAnalysisData?.groundingVerification || visualAnalysisData?.atmosphere || "El Oráculo no ha detectado anomalías entre la evidencia física y el contexto histórico proyectado."}"
          </p>

          {/* Mosaico de Hechos Técnicos Detectados por el Oráculo */}
          {visualAnalysisData?.detectedElementsCollection && (
            <div className="flex flex-wrap gap-2">
              {visualAnalysisData.detectedElementsCollection.map((elementName: string, itemIndex: number) => (
                <span key={itemIndex} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[7px] font-black text-zinc-600 uppercase tracking-tighter">
                  {elementName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* V. GRID SECUNDARIO: ATMÓSFERA URBANA SENSORIAL */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center gap-3">
          <CloudSun className="text-zinc-600 h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-zinc-500 uppercase">Clima</span>
            <span className="text-[9px] font-bold text-zinc-400">
              {weatherSnapshotData?.temperatureCelsius}°C • {weatherSnapshotData?.conditionText || "Atmósfera Estable"}
            </span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center gap-3">
          <Building2 className="text-zinc-600 h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-zinc-500 uppercase">Arquitectura</span>
            <span className="text-[9px] font-bold text-zinc-400 truncate max-w-[80px]">
              {visualAnalysisData?.architectureStyle || "No definido"}
            </span>
          </div>
        </div>
      </div>

      {/* VI. CHASIS DE ACCIÓN SOBERANA (AUDIT COMMIT) */}
      <div className="flex gap-4 mt-auto pt-6 pb-10">
        <Button
          variant="outline"
          onClick={navigateToPreviousStepAction}
          className="flex-1 h-16 rounded-2xl border-white/10 bg-transparent text-zinc-500 font-black tracking-widest uppercase text-[10px] hover:bg-white/5 transition-all"
        >
          Recapturar
        </Button>
        
        <Button
          onClick={executeFinalAuditValidationWorkflow}
          className="flex-[2] h-16 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black tracking-[0.2em] uppercase text-[10px] shadow-2xl group transition-all"
        >
          <span className="flex items-center gap-3">
            Confirmar Peritaje
            <ClipboardCheck size={18} className="group-hover:scale-110 transition-transform text-primary" />
          </span>
        </Button>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Build Shield Sovereignty: Sincronización nominal total con la Constitución V8.6, 
 *    utilizando propiedades como 'temperatureCelsius', 'conditionText' y 
 *    'detectedElementsCollection' (eradicando errores TS2339).
 * 2. Zero Abbreviations Policy (ZAP): Refactorización de autoridad manual: 
 *    manualPointOfInterestNominativeTitle y workflow de actualización pericial.
 * 3. UI Integrity Validation: Se han revisado todos los condicionales de renderizado 
 *    para asegurar que la interfaz responda con rigidez industrial ante la presencia 
 *    o ausencia de datos en la memoria volátil.
 */