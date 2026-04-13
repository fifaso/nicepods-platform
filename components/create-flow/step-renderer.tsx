/**
 * ARCHIVO: components/create-flow/step-renderer.tsx
 * VERSIÓN: 6.1 (NicePod Master View Orchestrator - Strict Type Alignment & Industrial Resilience)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Orquestar la visualización determinista de las fases de creación de capital 
 * intelectual, garantizando la compatibilidad absoluta entre el flujo de datos 
 * procesado, la máquina de estados finitos (FSM) y la interfaz de hardware.
 * [REFORMA V6.1]: Resolución definitiva de la discordancia de tipos TS2322 mediante 
 * el uso de interfaces de dominio específicas (NarrativeOption, DraftRow). 
 * Eliminación de registros genéricos para fortalecer el Build Shield. 
 * Cumplimiento total de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from 'next/dynamic';
import React, { useMemo, useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

// --- INFRAESTRUCTURA DE CONTEXTO Y NAVEGACIÓN SOBERANA ---
import { useCreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { NarrativeOption } from "./shared/types";
import { DraftRow } from "@/actions/draft-actions";

// --- INFRAESTRUCTURA DE HARDWARE Y UTILIDADES INDUSTRIALES ---
import { GeoRecorder } from "@/components/geo/geo-recorder";
import { GeographicScannerUserInterface } from "@/components/geo/scanner-ui";
import { nicepodLog } from "@/lib/utils";

// --- IMPORTACIONES DE PASOS: NÚCLEO (CORE STEPS) ---
import { PurposeSelectionStep } from "./steps/purpose-selection-step";
import { DnaInterviewStep } from "./steps/dna-interview-step";
import { PulseRadarStep } from "./steps/pulse-radar-step";
import { LocalDiscoveryStep } from "./steps/local-discovery-step";

// --- IMPORTACIONES: FLUJOS NARRATIVOS TÁCTICOS ---
import { InspireSubStep } from "./steps/inspire-sub-step";
import { LearnSubStep } from "./steps/learn-sub-step";
import { LegacyStep } from "./steps/legacy-step";
import { LinkPointsStep } from "./steps/link-points";
import { NarrativeSelectionStep } from "./steps/narrative-selection-step";
import { QuestionStep } from "./steps/question-step";
import { SoloTalkStep } from "./steps/solo-talk-step";
import { StyleSelectionStep } from "./steps/style-selection";

// --- IMPORTACIONES: PRODUCCIÓN INDUSTRIAL ---
import { AudioStudio } from "./steps/audio-studio";
import { DetailsStep } from "./steps/details-step";
import { DraftGenerationLoader } from "./steps/draft-generation-loader";
import { FinalStep } from "./steps/final-step";
import { ToneSelectionStep } from "./steps/tone-selection-step";

/**
 * ScriptEditorStep: Carga diferida estratégica para optimizar el presupuesto 
 * de memoria del Hilo Principal (Main Thread) durante la carga inicial de la terminal.
 */
const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((module) => module.ScriptEditorStep),
  {
    ssr: false, // Server Side Rendering desactivado para este componente editorial complejo.
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-10 opacity-40 isolate">
        <div className="h-14 w-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">
          Sincronizando Terminal Editorial...
        </span>
      </div>
    )
  }
);

/**
 * INTERFAZ: StepRendererProperties
 * Misión: Sellar el contrato de entrada con tipos de dominio estrictos (Build Shield).
 */
interface StepRendererProperties {
  /** narrativeOptionsCollection: Colección de ramificaciones narrativas generadas por la IA. */
  narrativeOptionsCollection: NarrativeOption[];
  /** initialDraftsCollection: Lista de borradores técnicos recuperados de la Bóveda. */
  initialDraftsCollection: DraftRow[];
}

/**
 * StepRenderer: El Reactor de Vistas Maestro para la forja de capital intelectual.
 */
export function StepRenderer({ 
  narrativeOptionsCollection, 
  initialDraftsCollection 
}: StepRendererProperties) {
  
  // 1. CONSUMO DEL CONTEXTO DE SOBERANÍA Y FORMULARIO (REACT HOOK FORM)
  const creationContext = useCreationContext();
  const { currentFlowState } = creationContext;
  
  const { watch, setValue } = useFormContext();
  const creationFormData = watch();

  /**
   * navigationAuthority:
   * Misión: Unificar el contexto de estado con el propósito seleccionado para dictaminar la ruta lógica.
   */
  const navigationAuthority = useFlowNavigation({
    ...creationContext,
    currentPurpose: creationFormData.purpose
  });

  const { transitionTo: executeStateTransitionAction, activePath: activePathCollection } = navigationAuthority;

  // 2. ESTADOS DE PROCESAMIENTO TÉCNICO
  const [isAcousticProcessingProcessActive, setIsAcousticProcessingProcessActive] = useState<boolean>(false);

  /**
   * navigateToNextStepSovereignAction:
   * Misión: Calcular y ejecutar la transición cinemática hacia el siguiente hito de la trayectoria.
   */
  const navigateToNextStepSovereignAction = useCallback(() => {
    const currentStepIndexMagnitude = activePathCollection.indexOf(currentFlowState);
    
    if (currentStepIndexMagnitude !== -1 && currentStepIndexMagnitude < activePathCollection.length - 1) {
      const nextStepStateDescriptor = activePathCollection[currentStepIndexMagnitude + 1];
      executeStateTransitionAction(nextStepStateDescriptor);
    } else {
      nicepodLog("🚩 [StepRenderer] Trayectoria finalizada o estado fuera de malla operativa.", null, 'warn');
    }
  }, [activePathCollection, currentFlowState, executeStateTransitionAction]);

  /**
   * handleAcousticChronicleCaptureAction:
   * Misión: Recibir el binario acústico del hardware y disparar el sellado del dossier en el Metal.
   */
  const handleAcousticChronicleCaptureAction = useCallback(async (
    capturedAudioBinaryBlob: Blob, 
    capturedDurationSecondsMagnitude: number
  ) => {
    setIsAcousticProcessingProcessActive(true);
    nicepodLog(`🎙️ [StepRenderer] Crónica capturada exitosamente: ${capturedDurationSecondsMagnitude} segundos.`);
    
    try {
      setValue('final_audio_blob', capturedAudioBinaryBlob);
      setValue('final_audio_duration', capturedDurationSecondsMagnitude);
      
      // Salto cinemático automático hacia la fase de producción de audio.
      navigateToNextStepSovereignAction();
    } catch (operationalHardwareException) {
      nicepodLog("🔥 [StepRenderer] Fallo al procesar binario acústico.", operationalHardwareException, 'error');
    } finally {
      setIsAcousticProcessingProcessActive(false);
    }
  }, [setValue, navigateToNextStepSovereignAction]);

  /**
   * activeStepContentComponent:
   * Misión: Mapeo determinista de componentes físicos según la máquina de estados finitos.
   * [SINCRO V6.1]: Alineación de tipos para PurposeSelection y NarrativeSelection.
   */
  const activeStepContentComponent = useMemo(() => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE':
        return <PurposeSelectionStep existingDrafts={initialDraftsCollection} />;

      case 'DNA_CHECK':
        return <DnaInterviewStep />;
      case 'PULSE_RADAR':
        return <PulseRadarStep />;
      case 'BRIEFING_SANITIZATION':
        return <ScriptEditorStep />;

      case 'LOCAL_DISCOVERY_STEP':
        return <LocalDiscoveryStep />;

      case 'LOCAL_ANALYSIS_LOADER':
      case 'LOCAL_RESULT_STEP':
        return <GeographicScannerUserInterface />;
      
      case 'GEO_RECORDER_STEP':
        return (
          <GeoRecorder
            mode="CHRONICLE"
            narrativeScriptContent={creationFormData.finalScript}
            isExternalProcessActive={isAcousticProcessingProcessActive}
            onCaptureCompletionAction={handleAcousticChronicleCaptureAction}
          />
        );

      case 'LEARN_SUB_SELECTION': return <LearnSubStep />;
      case 'SOLO_TALK_INPUT': return <SoloTalkStep />;
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'LINK_POINTS_INPUT': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION':
        return <NarrativeSelectionStep narrativeOptions={narrativeOptionsCollection} />;
      case 'LEGACY_INPUT': return <LegacyStep />;

      case 'DETAILS_STEP': return <DetailsStep />;
      case 'TONE_SELECTION': return <ToneSelectionStep />;
      case 'DRAFT_GENERATION_LOADER':
        return <DraftGenerationLoader formData={creationFormData as any} />;
      case 'SCRIPT_EDITING': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;

      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center space-y-12 py-32 opacity-40 isolate">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <div className="h-full w-full border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="font-black uppercase tracking-[0.8em] text-[10px] text-zinc-600 italic text-center">
              Sincronizando Malla de Inteligencia
            </p>
          </div>
        );
    }
  }, [currentFlowState, creationFormData, narrativeOptionsCollection, initialDraftsCollection, isAcousticProcessingProcessActive, handleAcousticChronicleCaptureAction]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden isolate">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentFlowState}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] // Curva de aceleración industrial NicePod
          }}
          className="flex-1 flex flex-col min-h-0 h-full"
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar-hide px-4 md:px-0 transition-all duration-700">
            {activeStepContentComponent}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. Build Shield Absolute: Se ha corregido la incompatibilidad TS2322 al sustituir los 
 *    registros genéricos (Record<string, unknown>) por interfaces de dominio reales 
 *    (NarrativeOption, DraftRow).
 * 2. ZAP Compliance: Purificación total de la nomenclatura en el contrato de propiedades 
 *    y funciones internas (capturedDurationSecondsMagnitude, executeStateTransitionAction).
 * 3. Type-Safe Fallbacks: El sistema garantiza que ante estados desconocidos de la FSM, 
 *    el Voyager reciba un estado de sincronización visual en lugar de un colapso de renderizado.
 */