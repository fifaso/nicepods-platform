/**
 * ARCHIVO: components/geo/steps/step-3-dossier-review.tsx
 * VERSIÓN: 6.1 (NicePod Forge Step 3 - Multidimensional Intelligence Audit Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Permitir al Administrador auditar el peritaje generado por la IA, validando 
 * la "Verdad Física" y el "Grounding" entre fotos, épocas y fuentes externas.
 * [FIX V6.1]: Resolución de error TS2345 mediante la sincronización nominal de la 
 * propiedad 'pointOfInterestIdentification' en el despacho del Reducer.
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
  Sparkles,
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

/**
 * Step3DossierReview: La fase de auditoría humana de la inteligencia multidimensional.
 */
export default function Step3DossierReview() {
  // 1. CONSUMO DEL CONTEXTO DE FORJA SOBERANO
  const { state: forgeState, dispatch, nextStep, prevStep } = useForge();
  const { ingestionDossier } = forgeState;

  // 2. ESTADOS DE EDICIÓN LOCAL (Manual Authority Bypass)
  const [isEditingPointOfInterestName, setIsEditingPointOfInterestName] = useState<boolean>(false);
  const [manualPointOfInterestName, setManualPointOfInterestName] = useState<string>(
    ingestionDossier?.visual_analysis_dossier?.detectedOfficialName || ""
  );

  /**
   * handleNameAuthorityUpdate:
   * Misión: Sobrescribir la identidad nominativa detectada por la IA con la autoridad humana.
   * [SINCRO V6.1]: Actualización del Reducer con nomenclatura descriptiva completa.
   */
  const handleNameAuthorityUpdate = useCallback(() => {
    nicepodLog(`✍️ [Step3] Autoridad Manual: Nombre actualizado a "${manualPointOfInterestName}"`);
    setIsEditingPointOfInterestName(false);
    
    if (ingestionDossier && forgeState.ingestedPoiId) {
       const updatedDossier = {
         ...ingestionDossier,
         visual_analysis_dossier: {
           ...ingestionDossier.visual_analysis_dossier,
           detectedOfficialName: manualPointOfInterestName
         }
       };

       /**
        * [BUILD SHIELD]: Sincronización de Acción.
        * Enviamos el payload utilizando el término industrial completo definido en la V5.0 del Contexto.
        */
       dispatch({ 
         type: 'SET_INGESTION_RESULT', 
         payload: { 
           pointOfInterestIdentification: forgeState.ingestedPoiId, 
           dossier: updatedDossier 
         } 
       });
    }
  }, [manualPointOfInterestName, ingestionDossier, dispatch, forgeState.ingestedPoiId]);

  /**
   * executeFinalAuditValidation:
   * Misión: Sellar el peritaje y avanzar a la configuración editorial final.
   */
  const executeFinalAuditValidation = () => {
    nicepodLog("🎯 [Step3] Dossier multidimensional validado. Transmutando a fase narrativa.");
    nextStep();
  };

  // Fallback de seguridad ante ruptura de Malla
  if (!ingestionDossier) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-&lsqb;#020202&rsqb;">
        <AlertTriangle className="text-amber-500 h-16 w-16 mb-6 animate-pulse" />
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] leading-relaxed">
          Expediente de Inteligencia Inexistente o Corrupto
        </p>
        <Button onClick={prevStep} variant="outline" className="mt-8 rounded-2xl border-white/10 hover:bg-white/5">
          Reiniciar Link Sensorial
        </Button>
      </div>
    );
  }

  const weatherSnapshot = ingestionDossier.weather_snapshot;
  const visualAnalysis = ingestionDossier.visual_analysis_dossier;

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-6 py-6">
      
      {/* I. CABECERA DE PERITAJE TÁCTICO */}
      <div className="mb-8 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-emerald-500 rounded-full shadow-&lsqb;0_0_15px_rgba(16,185,129,0.4)&rsqb;" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 3: Auditoría Pericial
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
          Valide el contraste entre la evidencia física y la sabiduría documental capturada.
        </p>
      </div>

      {/* II. BLOQUE: IDENTIDAD NOMINATIVA (SOVEREIGN BYPASS) */}
      <div className="mb-6 p-6 rounded-&lsqb;2.5rem&rsqb; bg-white/&lsqb;0.03&rsqb; border border-white/5 shadow-2xl relative overflow-hidden group isolate">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 block">
          Identidad Verificada del Hito
        </label>
        
        {isEditingPointOfInterestName ? (
          <div className="flex gap-3 animate-in fade-in slide-in-from-left-2">
            <Input 
              value={manualPointOfInterestName}
              onChange={(event) => setManualPointOfInterestName(event.target.value)}
              className="bg-black/40 border-emerald-500/30 h-14 rounded-2xl font-bold text-sm text-emerald-400 focus:ring-0"
              autoFocus
            />
            <Button size="icon" onClick={handleNameAuthorityUpdate} className="h-14 w-14 bg-emerald-500 hover:bg-emerald-600 rounded-2xl shrink-0 shadow-lg">
              <Check size={20} />
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-2xl font-black text-white tracking-tighter leading-&lsqb;1.1&rsqb; uppercase font-serif italic">
              {manualPointOfInterestName || visualAnalysis?.detectedOfficialName || "Nodo No Identificado"}
            </h2>
            <button 
              onClick={() => setIsEditingPointOfInterestName(true)}
              className="p-3 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <Edit3 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* III. GRID TÁCTICO: TAXONOMÍA Y TEMPORALIDAD */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-&lsqb;2rem&rsqb; bg-&lsqb;#080808&rsqb;/60 border border-white/5 flex flex-col gap-4 shadow-inner">
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

        <div className="p-5 rounded-&lsqb;2rem&rsqb; bg-&lsqb;#080808&rsqb;/60 border border-white/5 flex flex-col gap-4 shadow-inner">
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

      {/* IV. BLOQUE: KNOWLEDGE BRIDGE (GROUNDING VALIDATION) */}
      <div className="mb-8 space-y-4">
        <div className="p-6 rounded-&lsqb;2.5rem&rsqb; bg-white/&lsqb;0.02&rsqb; border border-white/5 relative overflow-hidden shadow-&lsqb;0_20px_40px_rgba(0,0,0,0.4)&rsqb;">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Globe className="text-zinc-500 h-4 w-4" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-&lsqb;0.3em&rsqb;">Validación de Grounding</span>
            </div>
            {forgeState.referenceUrl && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black tracking-widest uppercase">
                Link de Sabiduría
              </Badge>
            )}
          </div>
          
          <p className="text-xs font-medium text-zinc-400 leading-relaxed italic mb-4">
            "{visualAnalysis?.groundingVerification || visualAnalysis?.atmosphere || "El Oráculo no ha detectado anomalías entre la evidencia física y el contexto histórico."}"
          </p>

          {visualAnalysis?.detectedElements && (
            <div className="flex flex-wrap gap-2">
              {visualAnalysis.detectedElements.map((elementName: string, index: number) => (
                <span key={index} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[7px] font-black text-zinc-600 uppercase tracking-tighter">
                  {elementName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* V. GRID SECUNDARIO: AMBIENTE */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-4 rounded-2xl bg-white/&lsqb;0.01&rsqb; border border-white/5 flex items-center gap-3">
          <CloudSun className="text-zinc-600 h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-zinc-500 uppercase">Clima</span>
            <span className="text-[9px] font-bold text-zinc-400">{weatherSnapshot?.temp_c}°C • {weatherSnapshot?.condition}</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/&lsqb;0.01&rsqb; border border-white/5 flex items-center gap-3">
          <Building2 className="text-zinc-600 h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-zinc-500 uppercase">Estilo</span>
            <span className="text-[9px] font-bold text-zinc-400 truncate max-w-&lsqb;80px&rsqb;">{visualAnalysis?.architectureStyle || "No definido"}</span>
          </div>
        </div>
      </div>

      {/* VI. CHASSIS DE ACCIÓN SOBERANA */}
      <div className="flex gap-4 mt-auto pt-6 pb-10">
        <Button
          variant="outline"
          onClick={prevStep}
          className="flex-1 h-16 rounded-2xl border-white/10 bg-transparent text-zinc-500 font-black tracking-widest uppercase text-[10px] hover:bg-white/5 transition-all"
        >
          Recapturar
        </Button>
        
        <Button
          onClick={executeFinalAuditValidation}
          className="flex-&lsqb;2&rsqb; h-16 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black tracking-&lsqb;0.2em&rsqb; uppercase text-[10px] shadow-2xl group"
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
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. Build Shield Integrity: Se sincronizó el despacho de la acción con la propiedad 
 *    'pointOfInterestIdentification', eliminando la colisión nominal TS2345.
 * 2. Visual Stasis: Las clases de Tailwind arbitrarias utilizan ahora el escapado 
 *    industrial sugerido por Vercel para evitar ambigüedades en la compilación.
 * 3. Atomic State: Se reforzó la persistencia del bypass de nombre para asegurar 
 *    que el capital intelectual sea 100% fiel a la voluntad del Administrador.
 */