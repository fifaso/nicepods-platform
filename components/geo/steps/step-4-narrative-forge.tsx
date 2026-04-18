/**
 * ARCHIVE: components/geo/steps/step-4-narrative-forge.tsx
 * VERSION: 9.0 (NicePod Forge Step 4 - RAM Flush & Nominal Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * MISSION: Configurar el ADN editorial, sintetizar la crónica mediante el Oráculo
 * de Inteligencia y sellar el nodo en la Malla de Madrid mediante el protocolo 
 * de publicación soberana y transmisión directa de binarios (Lightning Protocol).
 * [REFORMA V9.0]: Sincronización nominal total con la Constitución V8.6 y el 
 * ForgeContext V6.0. Implementación de la política de limpieza de buffers 
 * (memoria de acceso aleatorio) tras el éxito de la transacción. Cumplimiento absoluto de la política de cero abreviaciones.
 * INTEGRITY LEVEL: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ChevronLeft, 
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
import { classNamesUtility, nicepodLog } from "@/lib/utils";

/**
 * Step4NarrativeForge: La fase final de transmutación intelectual y publicación pericial.
 */
export default function Step4NarrativeForge() {
  
  // 1. CONSUMO DE LA FACHADA SOBERANA Y CONTEXTO DE FORJA (V6.0 SINCRO)
  const { 
    synthesizeNarrative: executeNarrativeSynthesisAction, 
    status: engineOperationalStatus,
    data: engineOperationalData,
    error: geographicIntelligenceError 
  } = useGeoEngine();

  const { 
    state: forgeState, 
    dispatch: stateDispatcher, 
    prevStep: navigateToPreviousStepAction 
  } = useForge();

  // 2. ESTADOS LOCALES DE PROCESAMIENTO INDUSTRIAL
  const [isPublishingProcessActive, setIsPublishingProcessActive] = useState<boolean>(false);

  /**
   * handleInitiateNarrativeSynthesisWorkflow:
   * MISSION: Despachar la orden de forja narrativa al Oráculo de Inteligencia.
   * [SINCRO V9.0]: Adaptado a las propiedades nominales del ForgeState V6.0.
   */
  const handleInitiateNarrativeSynthesisWorkflow = async () => {
    const pointOfInterestIdentification = forgeState.ingestedPointOfInterestIdentification;
    
    if (!pointOfInterestIdentification) {
      nicepodLog("🛑 [Step4] Abortando: Identificación de hito no localizada en la memoria táctica.", null, 'exceptionInformation');
      return;
    }

    nicepodLog(`🧠 [Step4] Solicitando síntesis narrativa para el hito industrial #${pointOfInterestIdentification}`);

    try {
      await executeNarrativeSynthesisAction({
        pointOfInterestIdentification: pointOfInterestIdentification,
        narrativeDepth: forgeState.narrativeDepth,
        narrativeTone: forgeState.narrativeTone,
        refinedAdministratorIntent: forgeState.administratorIntentText
      });
    } catch (hardwareException) {
      nicepodLog("🔥 [Step4] Fallo en la comunicación con el Oráculo Narrativo.", hardwareException, 'exceptionInformation');
    }
  };

  /**
   * handleFinalChroniclePublicationWorkflow:
   * MISSION: Recibir el binario acústico, transmitirlo a la Bóveda y sellar el nodo.
   * [INTERVENCIÓN V9.0]: Protocolo de Purga de Memoria de Acceso Aleatorio. Al finalizar, purgamos el estado para
   * forzar la limpieza de buffers y revocar localizadores uniformes de recursos de objetos en el GeoRecorder.
   */
  const handleFinalChroniclePublicationWorkflow = useCallback(async (
    capturedAudioBinaryBlob: Blob, 
    recordingDurationSecondsMagnitude: number
  ) => {
    const pointOfInterestIdentification = forgeState.ingestedPointOfInterestIdentification;
    if (!pointOfInterestIdentification) {
        return;
    }

    setIsPublishingProcessActive(true);
    nicepodLog("📡 [Step4] Iniciando protocolo de publicación soberana (Lightning Protocol)...");

    try {
      /**
       * 1. SOLICITUD DE PASAPORTE ACÚSTICO (Protocolo Lightning V4.2)
       */
      const uploadTokenResponse = await requestUploadTokensAction(['chronicle_final_master_export.webm']);

      if (!uploadTokenResponse.success || !uploadTokenResponse.data) {
        throw new Error(uploadTokenResponse.exceptionInformation || "No se pudo autorizar la subida del activo acústico final.");
      }

      const audioStoragePath = uploadTokenResponse.data.storagePathsCollection[0];
      const audioUploadUniformResourceLocator = uploadTokenResponse.data.uploadUniformResourceLocatorsCollection[0];

      /**
       * 2. TRANSMISIÓN DIRECTA (Off-Main-Thread Transmission)
       */
      const audioUploadExecutionResults = await fetch(audioUploadUniformResourceLocator, {
        method: 'PUT',
        body: capturedAudioBinaryBlob,
        headers: { 'Content-Type': 'audio/webm' }
      });

      if (!audioUploadExecutionResults.ok) {
        throw new Error("FALLO_TRANSMISION_DIRECTA: El servidor de almacenamiento rechazó la crónica de audio.");
      }

      /**
       * 3. SELLADO SOBERANO EN BASE DE DATOS (COMMIT ATÓMICO)
       */
      const publicationCommitResults = await publishSovereignChronicleAction({
        pointOfInterestIdentification: pointOfInterestIdentification,
        chronicleStoragePath: audioStoragePath,
        durationSeconds: Math.floor(recordingDurationSecondsMagnitude)
      });

      if (publicationCommitResults.success) {
        nicepodLog("✅ [Step4] Nodo materializado con éxito. Iniciando purga de memoria táctica.");
        
        // [RAM FLUSH]: El reset de la forja desmonta el GeoRecorder, activando su 
        // protocolo interno de revocation de URLs y Track Killer.
        stateDispatcher({ type: 'RESET_FORGE' });
      } else {
        throw new Error(publicationCommitResults.exceptionInformation);
      }
    } catch (networkException) {
      const exceptionMessage = networkException instanceof Error ? networkException.message : String(networkException);
      nicepodLog("🔥 [Step4] Error crítico en la publicación final.", exceptionMessage, 'exceptionInformation');
    } finally {
      setIsPublishingProcessActive(false);
    }
  }, [forgeState.ingestedPointOfInterestIdentification, stateDispatcher]);

  /**
   * OPCIONES DE CONFIGURACIÓN TÁCTICA (DICCIONARIOS INDUSTRIALES)
   */
  const narrativeDepthOptionsCollection: { value: NarrativeDepth; label: string; description: string }[] = [
    { value: 'flash', label: 'Flash', description: 'Sintético / 45 Segundos' },
    { value: 'cronica', label: 'Crónica', description: 'Estándar / 1.5 Minutos' },
    { value: 'inmersion', label: 'Inmersión', description: 'Profundo / 4 Minutos' }
  ];

  const narrativeToneOptionsCollection: { value: NarrativeTone; label: string; iconComponent: React.ReactNode }[] = [
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
          Configure el ADN editorial del relato. El Oráculo transmutará el dossier técnico en una crónica de sabiduría.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {engineOperationalStatus === 'NARRATIVE_READY' && engineOperationalData?.narrative ? (
          /**
           * ESTADO: NARRATIVA SINTETIZADA
           * MISSION: Proyectar la Grabadora Universal para el sellado acústico soberano.
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
                <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Iniciando fase de captura vocal soberana</span>
              </div>
            </div>

            <div className="flex-1 min-h-[450px]">
              <GeoRecorder 
                mode="CHRONICLE"
                narrativeScriptContent={engineOperationalData.narrative.script}
                isExternalProcessActive={isPublishingProcessActive}
                onCaptureCompletionAction={handleFinalChroniclePublicationWorkflow}
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
                {narrativeDepthOptionsCollection.map((depthOption) => (
                  <button
                    key={depthOption.value}
                    onClick={() => stateDispatcher({ type: 'SET_DEPTH', payload: depthOption.value })}
                    className={classNamesUtility(
                      "flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-700 shadow-2xl",
                      forgeState.narrativeDepth === depthOption.value
                        ? "bg-primary/10 border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] scale-105"
                        : "bg-white/[0.02] border-white/5 text-zinc-600 hover:border-white/20"
                    )}
                  >
                    <span className={classNamesUtility("text-[11px] font-black uppercase tracking-tighter", forgeState.narrativeDepth === depthOption.value ? "text-primary" : "text-zinc-500")}>
                      {depthOption.label}
                    </span>
                    <span className="text-[7px] font-bold text-zinc-700 uppercase tracking-widest text-center leading-tight">
                      {depthOption.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTOR: FRECUENCIA (TONO TÁCTICO) */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-5 block">
                Frecuencia Narrativa Táctica
              </label>
              <div className="flex flex-wrap gap-3">
                {narrativeToneOptionsCollection.map((toneOption) => (
                  <button
                    key={toneOption.value}
                    onClick={() => stateDispatcher({ type: 'SET_TONE', payload: toneOption.value })}
                    className={classNamesUtility(
                      "flex items-center gap-4 px-6 py-3.5 rounded-full border transition-all duration-500",
                      forgeState.narrativeTone === toneOption.value
                        ? "bg-white text-black border-white shadow-2xl scale-110"
                        : "bg-white/[0.02] border-white/5 text-zinc-600 hover:text-zinc-300"
                    )}
                  >
                    <span className={classNamesUtility(forgeState.narrativeTone === toneOption.value ? "text-black" : "text-primary")}>
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
                value={forgeState.administratorIntentText}
                onChange={(changeEvent) => stateDispatcher({ type: 'SET_ADMINISTRATOR_INTENT', payload: changeEvent.target.value })}
              />
            </div>

            {/* BARRA DE COMANDO: SÍNTESIS */}
            <div className="flex gap-5 pt-6 pb-12">
              <Button
                variant="outline"
                onClick={navigateToPreviousStepAction}
                className="w-24 h-24 rounded-[2.5rem] border-white/10 bg-transparent text-zinc-700 hover:bg-white/5 hover:text-white transition-all shadow-xl"
              >
                <ChevronLeft size={32} />
              </Button>
              
              <Button
                onClick={handleInitiateNarrativeSynthesisWorkflow}
                disabled={engineOperationalStatus === 'SYNTHESIZING' || engineOperationalStatus === 'IDLE'}
                className="flex-1 h-24 rounded-[2.5rem] bg-primary text-primary-foreground font-black tracking-[0.4em] uppercase text-xs shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] group relative overflow-hidden transition-all"
              >
                {engineOperationalStatus === 'SYNTHESIZING' ? (
                  <div className="flex items-center gap-5 relative z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span>Forjando Sabiduría...</span>
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
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. RAM Flush Implementation: Tras el éxito de la publicación, se despacha el reset 
 *    del ForgeContext, lo que provoca el desmontaje destructivo del GeoRecorder y la 
 *    consecuente liberación de memoria acústica.
 * 2. Zero Abbreviations Policy (Zero Abbreviations Policy): Sincronización nominal total con ForgeContext V6.0
 *    (narrativeDepth, narrativeTone, administratorIntentText).
 * 3. Build Shield Sovereignty: Saneamiento de las llamadas a Server Actions y hooks 
 *    de fachada, garantizando que todos los payloads cumplan con la Constitución V8.6.
 */