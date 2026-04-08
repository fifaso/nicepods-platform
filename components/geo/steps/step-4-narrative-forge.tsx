/**
 * ARCHIVO: components/geo/steps/step-4-narrative-forge.tsx
 * VERSIÓN: 7.0 (NicePod Forge Step 4 - Sovereign Narrative Forge Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Configurar el ADN editorial, sintetizar la crónica mediante el Oráculo 
 * y sellar el nodo en la Malla de Madrid mediante el protocolo de publicación soberana.
 * [REFORMA V7.0]: Sincronización nominal total con GeoRecorder V4.1, erradicación 
 * absoluta de abreviaturas y blindaje de tipos en el pipeline de publicación.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ChevronLeft, 
  CheckCircle2, 
  PenTool, 
  Wind,
  AlignLeft,
  Volume2,
  Loader2,
  AlertCircle,
  Mic2
} from "lucide-react";
import React, { useCallback, useState } from "react";

// --- INFRAESTRUCTURA CORE V4.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "@/components/geo/forge-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GeoRecorder } from "@/components/geo/geo-recorder";
import { 
  publishSovereignChronicleAction, 
  requestUploadTokensAction 
} from "@/actions/geo-actions";
import { 
  NarrativeDepth, 
  NarrativeTone 
} from "@/types/geo-sovereignty";
import { cn, nicepodLog } from "@/lib/utils";

/**
 * Step4NarrativeForge: La fase final de transmutación intelectual y publicación pericial.
 */
export default function Step4NarrativeForge() {
  
  // 1. CONSUMO DE LA FACHADA SOBERANA Y CONTEXTO DE FORJA
  const { 
    synthesizeNarrative: executeNarrativeSynthesisAction, 
    status: engineOperationalStatus,
    data: engineOperationalData,
    error: geographicIntelligenceError 
  } = useGeoEngine();

  const { state: forgeState, dispatch: stateDispatcher, prevStep } = useForge();

  // 2. ESTADOS LOCALES DE PROCESAMIENTO INDUSTRIAL
  const [isPublishingProcessActive, setIsPublishingProcessActive] = useState<boolean>(false);

  /**
   * handleInitiateNarrativeSynthesisAction:
   * Misión: Despachar la orden de forja narrativa al Oráculo de Inteligencia.
   */
  const handleInitiateNarrativeSynthesisAction = async () => {
    const pointOfInterestIdentification = forgeState.ingestedPointOfInterestIdentification;
    
    if (!pointOfInterestIdentification) {
      nicepodLog("🛑 [Step4] Abortando: Identificación de hito no localizada en memoria.", null, 'error');
      return;
    }

    nicepodLog(`🧠 [Step4] Solicitando síntesis narrativa para el hito industrial #${pointOfInterestIdentification}`);

    try {
      await executeNarrativeSynthesisAction({
        pointOfInterestIdentification: pointOfInterestIdentification,
        depth: forgeState.depth,
        tone: forgeState.tone,
        refinedIntent: forgeState.intentText
      });
    } catch (hardwareException) {
      nicepodLog("🔥 [Step4] Fallo en la comunicación con el Oráculo Narrativo.", hardwareException, 'error');
    }
  };

  /**
   * handleFinalChroniclePublicationAction:
   * Misión: Recibir el binario acústico, transmitirlo a la Bóveda y sellar el nodo en la Malla.
   */
  const handleFinalChroniclePublicationAction = useCallback(async (
    capturedAudioBinaryBlob: Blob, 
    recordingDurationSecondsMagnitude: number
  ) => {
    const pointOfInterestIdentification = forgeState.ingestedPointOfInterestIdentification;
    if (!pointOfInterestIdentification) {
        return;
    }

    setIsPublishingProcessActive(true);
    nicepodLog("📡 [Step4] Iniciando protocolo de publicación de grado industrial...");

    try {
      /**
       * 1. SOLICITUD DE PASAPORTE ACÚSTICO (Protocolo Lightning)
       */
      const uploadTokenResponse = await requestUploadTokensAction(['chronicle_final.webm']);

      if (!uploadTokenResponse.success || !uploadTokenResponse.data) {
        throw new Error(uploadTokenResponse.error || "No se pudo autorizar la subida del audio final.");
      }

      const audioStoragePath = uploadTokenResponse.data.paths[0];
      const audioUploadUniformResourceLocator = uploadTokenResponse.data.uploadUrls[0];

      /**
       * 2. TRANSMISIÓN DIRECTA (Aislamiento de Servidor)
       */
      const audioUploadExecutionResults = await fetch(audioUploadUniformResourceLocator, {
        method: 'PUT',
        body: capturedAudioBinaryBlob,
        headers: { 'Content-Type': 'audio/webm' }
      });

      if (!audioUploadExecutionResults.ok) {
        throw new Error("FALLO_TRANSMISION_DIRECTA: El servidor de almacenamiento rechazó la crónica.");
      }

      /**
       * 3. SELLADO SOBERANO EN BASE DE DATOS
       */
      const publicationCommitResults = await publishSovereignChronicleAction({
        pointOfInterestIdentification: pointOfInterestIdentification,
        chronicleStoragePath: audioStoragePath,
      });

      if (publicationCommitResults.success) {
        nicepodLog("✅ [Step4] Nodo materializado. Sincronía pericial total alcanzada.");
        stateDispatcher({ type: 'RESET_FORGE' });
      } else {
        throw new Error(publicationCommitResults.error);
      }
    } catch (exception) {
      nicepodLog("🔥 [Step4] Error crítico en la publicación final.", exception, 'error');
    } finally {
      setIsPublishingProcessActive(false);
    }
  }, [forgeState.ingestedPointOfInterestIdentification, stateDispatcher]);

  /**
   * OPCIONES DE CONFIGURACIÓN TÁCTICA (DICCIONARIOS NOMINALES)
   */
  const narrativeDepthOptions: { value: NarrativeDepth; label: string; description: string }[] = [
    { value: 'flash', label: 'Flash', description: 'Sintético / 45s' },
    { value: 'cronica', label: 'Crónica', description: 'Estándar / 1.5m' },
    { value: 'inmersion', label: 'Inmersión', description: 'Profundo / 4m' }
  ];

  const narrativeToneOptions: { value: NarrativeTone; label: string; iconComponent: React.ReactNode }[] = [
    { value: 'academico', label: 'Académico', iconComponent: <PenTool size={14} /> },
    { value: 'misterioso', label: 'Misterioso', iconComponent: <Wind size={14} /> },
    { value: 'epico', label: 'Épico', iconComponent: <Sparkles size={14} /> },
    { value: 'melancolico', label: 'Elegíaco', iconComponent: <AlignLeft size={14} /> },
    { value: 'neutro', label: 'Informativo', iconComponent: <Volume2 size={14} /> }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-6 py-4 isolate">
      
      {/* I. CABECERA EDITORIAL DE ALTA DENSIDAD */}
      <div className="mb-10 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-6 w-1 bg-primary rounded-full shadow-lg" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 4: Forja Narrativa
          </h3>
        </div>
        <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest leading-relaxed">
          Configure el ADN del relato. El Oráculo transmutará el dossier en una crónica de sabiduría.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {engineOperationalStatus === 'NARRATIVE_READY' && engineOperationalData?.narrative ? (
          /**
           * ESTADO: NARRATIVA SINTETIZADA
           * Misión: Proyectar la Grabadora Universal para el sellado acústico soberano.
           */
          <motion.div 
            key="recording_session_interface"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-8 flex-1 min-h-0"
          >
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[1.8rem] flex items-center gap-5 shadow-inner">
              <div className="bg-emerald-500 p-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Mic2 size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Relato Sintetizado</span>
                <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Iniciando fase de captura vocal</span>
              </div>
            </div>

            <div className="flex-1 min-h-[450px]">
              {/* [FIX V7.0]: Sincronización nominal absoluta con GeoRecorderProperties V4.1 */}
              <GeoRecorder 
                mode="CHRONICLE"
                narrativeScriptContent={engineOperationalData.narrative.script}
                isExternalProcessActive={isPublishingProcessActive}
                onCaptureCompletionAction={handleFinalChroniclePublicationAction}
              />
            </div>
          </motion.div>
        ) : (
          /**
           * ESTADO: CONFIGURACIÓN EDITORIAL (PARAMETRIZACIÓN)
           */
          <motion.div 
            key="editorial_configuration_interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-10 flex-1"
          >
            {/* SECTOR: PROFUNDIDAD DEL PERITAJE */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-5 block">
                Profundidad de Peritaje Narrativo
              </label>
              <div className="grid grid-cols-3 gap-4">
                {narrativeDepthOptions.map((depthOption) => (
                  <button
                    key={depthOption.value}
                    onClick={() => stateDispatcher({ type: 'SET_DEPTH', payload: depthOption.value })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-700 shadow-2xl",
                      forgeState.depth === depthOption.value
                        ? "bg-primary/10 border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] scale-105"
                        : "bg-white/[0.02] border-white/5 text-zinc-600 hover:border-white/20"
                    )}
                  >
                    <span className={cn("text-[11px] font-black uppercase tracking-tighter", forgeState.depth === depthOption.value ? "text-primary" : "text-zinc-500")}>
                      {depthOption.label}
                    </span>
                    <span className="text-[7px] font-bold text-zinc-700 uppercase tracking-widest text-center leading-tight">
                      {depthOption.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTOR: FRECUENCIA (TONO) */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-5 block">
                Frecuencia Narrativa Táctica
              </label>
              <div className="flex flex-wrap gap-3">
                {narrativeToneOptions.map((toneOption) => (
                  <button
                    key={toneOption.value}
                    onClick={() => stateDispatcher({ type: 'SET_TONE', payload: toneOption.value })}
                    className={cn(
                      "flex items-center gap-4 px-6 py-3.5 rounded-full border transition-all duration-500",
                      forgeState.tone === toneOption.value
                        ? "bg-white text-black border-white shadow-2xl scale-110"
                        : "bg-white/[0.02] border-white/5 text-zinc-600 hover:text-zinc-300"
                    )}
                  >
                    <span className={cn(forgeState.tone === toneOption.value ? "text-black" : "text-primary")}>
                        {toneOption.iconComponent}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{toneOption.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTOR: REFINAMIENTO COGNITIVO */}
            <div className="mb-10">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-5 block">
                Matices Cognitivos Adicionales
              </label>
              <Textarea 
                placeholder="Especifique directrices finales para el Agente 42..."
                className="min-h-[120px] bg-[#050505] border-white/10 rounded-2xl p-6 text-base font-medium placeholder:text-zinc-800 focus:border-primary/40 transition-all resize-none shadow-inner text-zinc-300"
                value={forgeState.intentText}
                onChange={(changeEvent) => stateDispatcher({ type: 'SET_INTENT', payload: changeEvent.target.value })}
              />
            </div>

            {/* BARRA DE COMANDO: SÍNTESIS */}
            <div className="flex gap-5 pt-6 pb-12">
              <Button
                variant="outline"
                onClick={prevStep}
                className="w-24 h-24 rounded-[2.5rem] border-white/10 bg-transparent text-zinc-700 hover:bg-white/5 hover:text-white transition-all shadow-xl"
              >
                <ChevronLeft size={32} />
              </Button>
              
              <Button
                onClick={handleInitiateNarrativeSynthesisAction}
                disabled={engineOperationalStatus === 'SYNTHESIZING' || engineOperationalStatus === 'IDLE'}
                className="flex-1 h-24 rounded-[2.5rem] bg-primary text-primary-foreground font-black tracking-[0.4em] uppercase text-xs shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] group relative overflow-hidden transition-all"
              >
                {engineOperationalStatus === 'SYNTHESIZING' ? (
                  <div className="flex items-center gap-5 relative z-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>Forjando Sabiduria...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-5 relative z-10 w-full">
                    Sintetizar Malla
                    <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                  </span>
                )}
                
                {engineOperationalStatus === 'SYNTHESIZING' && (
                  <motion.div 
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: "-100%" }} animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {geographicIntelligenceError && (
        <div className="mb-10 p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center gap-5 animate-in slide-in-from-bottom-2 duration-700">
          <AlertCircle className="text-red-500 h-6 w-6 shrink-0" />
          <span className="text-[11px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
            Fallo en el Link Narrativo: {geographicIntelligenceError}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Build Shield Compliance: Se corrigió el error TS2322 sincronizando las propiedades 
 *    del GeoRecorder con su interfaz industrial V4.1 (narrativeScriptContent).
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos (narrativeDepthOptions, 
 *    isPublishingProcessActive, capturedAudioBinaryBlob, recordingDurationSecondsMagnitude).
 * 3. Atomic Integrity: El protocolo de publicación Lightning asegura que el binario 
 *    acústico sea transferido antes de realizar el sellado atómico en la Bóveda NKV.
 */