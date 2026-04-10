/**
 * ARCHIVO: components/create-flow/step-renderer.tsx
 * VERSIÓN: 5.0 (NicePod Master View Orchestrator - Absolute Nominal Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Orquestar la visualización determinista de las fases de creación de capital 
 * intelectual, garantizando la compatibilidad absoluta entre el flujo de datos 
 * procesado y la interfaz de hardware.
 * [REFORMA V5.0]: Resolución definitiva del error TS2305 mediante la sincronización 
 * con GeographicScannerUserInterface V3.0. Erradicación total de abreviaturas 
 * (ZAP) y cumplimiento estricto del Build Shield.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

// --- INFRAESTRUCTURA DE CONTEXTO Y NAVEGACIÓN SOBERANA ---
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useCreationContext } from "./shared/context";

// --- INFRAESTRUCTURA DE HARDWARE Y UTILIDADES INDUSTRIALES ---
import { GeoRecorder } from "@/components/geo/geo-recorder";
import { GeographicScannerUserInterface } from "@/components/geo/scanner-ui";
import { nicepodLog } from "@/lib/utils";

// --- IMPORTACIONES DE PASOS: NÚCLEO (CORE STEPS) ---
import { DnaInterviewStep } from "./steps/dna-interview-step";
import { LocalDiscoveryStep } from "./steps/local-discovery-step";
import { PulseRadarStep } from "./steps/pulse-radar-step";
import { PurposeSelectionStep } from "./steps/purpose-selection-step";

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
 * de memoria del Hilo Principal durante la carga inicial.
 */
const ScriptEditorStep = dynamic(
  () => import('./steps/script-editor-step').then((module) => module.ScriptEditorStep),
  {
    ssr: false, // Server Side Rendering desactivado para este componente editorial
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-10 opacity-40">
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
 */
interface StepRendererProperties {
  narrativeOptionsCollection: any[];
  initialDraftsCollection: any[];
}

/**
 * StepRenderer: El Reactor de Vistas Maestro para la forja de capital intelectual.
 */
export function StepRenderer({
  narrativeOptionsCollection,
  initialDraftsCollection
}: StepRendererProperties) {

  // 1. CONSUMO DEL CONTEXTO DE SOBERANÍA Y FORMULARIO (RHF)
  const creationContext = useCreationContext();
  const { currentFlowState } = creationContext;

  const { watch, setValue } = useFormContext();
  const creationFormData = watch();

  /**
   * navigationAuthority:
   * Unificación del contexto de estado con el propósito seleccionado en el formulario.
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
   * Misión: Calcular y ejecutar la transición hacia el siguiente hito de la trayectoria.
   */
  const navigateToNextStepSovereignAction = useCallback(() => {
    const currentStepIndexMagnitude = activePathCollection.indexOf(currentFlowState);

    if (currentStepIndexMagnitude !== -1 && currentStepIndexMagnitude < activePathCollection.length - 1) {
      const nextStepStateDescriptor = activePathCollection[currentStepIndexMagnitude + 1];
      executeStateTransitionAction(nextStepStateDescriptor);
    } else {
      nicepodLog("🚩 [StepRenderer] Trayectoria finalizada o estado fuera de malla.", null, 'warn');
    }
  }, [activePathCollection, currentFlowState, executeStateTransitionAction]);

  /**
   * handleAcousticChronicleCaptureAction:
   * Misión: Recibir el binario acústico del hardware y disparar el sellado del dossier.
   */
  const handleAcousticChronicleCaptureAction = useCallback(async (
    capturedAudioBinaryBlob: Blob,
    capturedDurationSeconds: number
  ) => {
    setIsAcousticProcessingProcessActive(true);
    nicepodLog(`🎙️ [StepRenderer] Crónica capturada exitosamente: ${capturedDurationSeconds} segundos.`);

    try {
      setValue('final_audio_blob', capturedAudioBinaryBlob);
      setValue('final_audio_duration', capturedDurationSeconds);

      // Ejecución del salto cinemático hacia la siguiente fase de producción.
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
   * [SINCRO V5.0]: Se han validado todos los despliegues de interfaz para cada hito.
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

      /**
       * FASES DE ESCÁNER GEOGRÁFICO:
       * [FIX V5.0]: Uso del componente GeographicScannerUserInterface (V3.0).
       */
      case 'LOCAL_ANALYSIS_LOADER':
      case 'LOCAL_RESULT_STEP':
        return <GeographicScannerUserInterface />;

      case 'GEO_RECORDER_STEP':
        return (
          <GeoRecorder
            mode="CHRONICLE"
            narrativeScriptContent={creationFormData.final_script}
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
          <div className="h-full flex flex-col items-center justify-center space-y-12 py-32 opacity-40">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <div className="h-full w-full border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="font-black uppercase tracking-[0.8em] text-[10px] text-zinc-600 italic">
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
            ease: [0.16, 1, 0.3, 1] // Curva industrial NicePod
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Build Shield Sovereignty: Se resolvió el error TS2305 sincronizando la importación 
 *    con el nuevo estándar nominal de 'GeographicScannerUserInterface'.
 * 2. Zero Abbreviations Policy: Purificación absoluta de todos los manejadores y 
 *    variables locales (executeStateTransitionAction, activePathCollection, etc.).
 * 3. Functional Deployment: Se ha verificado la correspondencia entre los estados de 
 *    la FSM y la proyección de componentes, garantizando que el flujo de creación 
 *    geolocalizada no tenga puntos ciegos.
 */