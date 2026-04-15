/**
 * ARCHIVO: components/create-flow/step-renderer.tsx
 * VERSIÓN: 8.0 (NicePod Master View Orchestrator - Industrial FSM Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la visualización determinista de las fases de creación de capital 
 * intelectual, garantizando la compatibilidad absoluta entre la máquina de estados 
 * finitos (FSM) y la interfaz de hardware.
 * [REFORMA V8.0]: Resolución definitiva de TS2678 y TS2353. Sincronización nominal 
 * absoluta con 'FlowState' V4.0 y 'useFlowNavigation' V3.0. Aplicación integral 
 * de la Zero Abbreviations Policy (ZAP) y Build Shield Sovereignty.
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
import { PodcastCreationData } from "@/lib/validation/podcast-schema";

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
import { DiscoveryResultStep } from "./steps/discovery-result-step";

/**
 * ScriptEditorStep: Carga diferida estratégica para optimizar el presupuesto 
 * de memoria del Hilo Principal (MTI Isolation).
 */
const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((module) => module.ScriptEditorStep),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-12 opacity-30 isolate">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary italic">
          Sincronizando Terminal Editorial...
        </span>
      </div>
    )
  }
);

/**
 * INTERFAZ: StepRendererProperties
 */
interface StepRendererProperties {
  /** narrativeOptionsCollection: Ramificaciones narrativas generadas por el Oráculo. */
  narrativeOptionsCollection: NarrativeOption[];
  /** initialDraftsCollection: Sesiones de inteligencia recuperadas del Metal. */
  initialDraftsCollection: DraftRow[];
}

/**
 * StepRenderer: El Reactor de Vistas Maestro de la forja.
 */
export function StepRenderer({ 
  narrativeOptionsCollection, 
  initialDraftsCollection 
}: StepRendererProperties) {
  
  // 1. CONSUMO DEL CONTEXTO DE SOBERANÍA Y FORMULARIO
  const creationContextReference = useCreationContext();
  const { currentFlowState } = creationContextReference;
  
  const { watch, setValue } = useFormContext<PodcastCreationData>();
  const creationFormDataSnapshot = watch();

  /**
   * navigationAuthority:
   * [SINCRO V8.0 - RESOLUCIÓN TS2353]: Uso de 'currentMissionPurposeIdentification'.
   */
  const navigationAuthority = useFlowNavigation({
    currentMissionPurposeIdentification: creationFormDataSnapshot.purpose
  });

  const { 
    transitionTo: executeStateTransitionAction, 
    activePath: activeMasterFlowPathCollection 
  } = navigationAuthority;

  // 2. ESTADOS DE PROCESAMIENTO ACÚSTICO
  const [isAcousticCaptureProcessActive, setIsAcousticCaptureProcessActive] = useState<boolean>(false);

  /**
   * navigateToNextPhaseSovereignAction:
   * Misión: Calcular y ejecutar la transición cinemática hacia el siguiente hito.
   */
  const navigateToNextPhaseSovereignAction = useCallback(() => {
    const currentPhaseIndexMagnitude = activeMasterFlowPathCollection.indexOf(currentFlowState);
    
    if (currentPhaseIndexMagnitude !== -1 && currentPhaseIndexMagnitude < activeMasterFlowPathCollection.length - 1) {
      const nextPhaseFlowStateDescriptor = activeMasterFlowPathCollection[currentPhaseIndexMagnitude + 1];
      executeStateTransitionAction(nextPhaseFlowStateDescriptor);
    } else {
      nicepodLog("🚩 [Step-Renderer] Trayectoria finalizada o estado fuera de malla.", null, 'warn');
    }
  }, [activeMasterFlowPathCollection, currentFlowState, executeStateTransitionAction]);

  /**
   * handleAcousticChronicleCaptureAction:
   * Misión: Recibir el binario del hardware y sellar el dossier en el formulario.
   */
  const handleAcousticChronicleCaptureAction = useCallback(async (
    capturedAudioBinaryBlob: Blob, 
    capturedDurationSecondsMagnitude: number
  ) => {
    setIsAcousticCaptureProcessActive(true);
    nicepodLog(`🎙️ [Step-Renderer] Captura completada: ${capturedDurationSecondsMagnitude}s`);
    
    try {
      // Inyección de telemetría acústica en el Cristal
      setValue('userEmotionalReactionContent', `Voz capturada: ${capturedDurationSecondsMagnitude}s`);
      navigateToNextPhaseSovereignAction();
    } catch (hardwareOperationException) {
      nicepodLog("🔥 [Step-Renderer] Fallo al procesar binario acústico.", hardwareOperationException, 'error');
    } finally {
      setIsAcousticCaptureProcessActive(false);
    }
  }, [setValue, navigateToNextPhaseSovereignAction]);

  /**
   * activeStepComponentMarkup:
   * [SINCRO V8.0 - RESOLUCIÓN TS2678]: Mapeo determinista utilizando los 
   * identificadores purificados de la máquina de estados industriales.
   */
  const activeStepComponentMarkup = useMemo(() => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE':
        return <PurposeSelectionStep existingDraftsCollection={initialDraftsCollection} />;

      case 'DEOXYRIBONUCLEIC_ACID_SYNTHTESIS_CHECK':
        return <DnaInterviewStep />;
      
      case 'PULSE_RADAR_SCANNER':
        return <PulseRadarStep />;
      
      case 'BRIEFING_SANITIZATION_REVIEW':
        return <ScriptEditorStep />;

      case 'LOCAL_DISCOVERY_STEP':
        return <LocalDiscoveryStep />;

      case 'LOCAL_ANALYSIS_LOADER':
      case 'LOCAL_RESULT_STEP':
        return <DiscoveryResultStep />;
      
      case 'GEODETIC_ACUSTIC_RECORDER_STEP':
        return (
          <GeoRecorder
            mode="CHRONICLE"
            narrativeScriptContent={creationFormDataSnapshot.finalScriptContent || ""}
            isExternalProcessActive={isAcousticCaptureProcessActive}
            onCaptureCompletionAction={handleAcousticChronicleCaptureAction}
          />
        );

      case 'LEARN_SUB_CATEGORY_SELECTION': return <LearnSubStep />;
      case 'SOLO_TALK_INPUT_FIELD': return <SoloTalkStep />;
      case 'INSPIRE_SUB_CATEGORY_SELECTION': return <InspireSubStep />;
      case 'LINK_POINTS_INPUT_FORM': return <LinkPointsStep />;
      
      case 'NARRATIVE_SELECTION_BRANCHING':
        return <NarrativeSelectionStep narrativeOptions={narrativeOptionsCollection} />;
      
      case 'LEGACY_LESSON_INPUT': return <LegacyStep />;

      case 'TECHNICAL_DETAILS_STEP': return <DetailsStep />;
      case 'AGENT_TONE_SELECTION': return <ToneSelectionStep />;
      
      case 'DRAFT_GENERATION_LOADER':
        return <DraftGenerationLoader formData={creationFormDataSnapshot} />;
        
      case 'SCRIPT_EDITING_CANVAS': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_CALIBRATION': return <AudioStudio />;
      case 'FINAL_MANIFESTO_STEP': return <FinalStep />;

      case 'SPECIFIC_QUESTION_INPUT': return <QuestionStep />;
      case 'FREESTYLE_MODE_SELECTION': return <StyleSelectionStep />;

      default:
        return (
          <div className="h-full flex flex-col items-center justify-center space-y-16 py-40 opacity-30 isolate grayscale">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <div className="h-full w-full border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="font-black uppercase tracking-[1em] text-[10px] text-zinc-600 italic text-center">
              Sincronizando Malla de Inteligencia
            </p>
          </div>
        );
    }
  }, [
    currentFlowState, 
    creationFormDataSnapshot, 
    narrativeOptionsCollection, 
    initialDraftsCollection, 
    isAcousticCaptureProcessActive, 
    handleAcousticChronicleCaptureAction
  ]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden isolate">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentFlowState}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="flex-1 flex flex-col min-h-0 h-full isolate"
        >
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-0 transition-all duration-700 isolate">
            {activeStepComponentMarkup}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Build Shield Sovereignty: Resolución definitiva de TS2678 mediante la 
 *    sincronización con los nuevos estados purificados (ZAP) de 'FlowState'.
 * 2. Contract Restoration: Resolución de TS2353 mediante el uso del parámetro 
 *    'currentMissionPurposeIdentification' en el motor de navegación.
 * 3. Zero Abbreviations Policy (ZAP): Purificación total. 'res' -> 'Markup', 
 *    'step' -> 'phase', 'e' -> 'event', 'data' -> 'snapshot'.
 * 4. UX Kinematics: El incremento del desplazamiento horizontal en motion.div (x: 30) 
 *    proporciona una sensación de avance industrial más definida durante las transiciones.
 */