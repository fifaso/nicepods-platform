/**
 * ARCHIVO: components/create-flow/index.tsx
 * VERSIÓN: 55.0 (NicePod Master Orchestrator - Strict Nominal Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar el flujo de creación de capital intelectual, garantizando la 
 * validación técnica de cada fase y la sincronía absoluta entre el motor de 
 * formularios y la terminal de hardware.
 * [REFORMA V55.0]: Resolución definitiva de TS2339 y TS2551. 
 * Sincronización nominal con 'useFlowActions' V7.0 y 'PodcastCreationSchema' V12.0.
 * Erradicación total de tipos 'any' y cumplimiento absoluto de la ZAP.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData, PodcastCreationSchema } from "@/lib/validation/podcast-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

// --- INFRAESTRUCTURA DE CONTEXTO Y ARQUITECTURA CORE ---
import { DraftRow } from "@/actions/draft-actions";
import { useFlowActions } from "./hooks/use-flow-actions";
import { LayoutShell } from "./layout-shell";
import { MASTER_FLOW_PATHS } from "./shared/config";
import { CreationProvider, useCreationContext } from "./shared/context";
import { NarrativeOption } from "./shared/types";
import { StepRenderer } from "./step-renderer";

/**
 * INTERFAZ: PodcastCreationOrchestratorProperties
 */
interface PodcastCreationOrchestratorProperties {
  /** initialDraftsCollection: Colección de borradores existentes recuperados del Metal. */
  initialDraftsCollection?: DraftRow[];
}

/**
 * InnerOrchestrator: El motor interno de gestión de estados y validación por fase técnica.
 */
function InnerOrchestrator({ 
  initialDraftsCollection = [] 
}: { 
  initialDraftsCollection: DraftRow[] 
}) {
  const { toast } = useToast();
  
  // Extraemos herramientas de gestión de formulario bajo nomenclatura industrial
  const { 
    trigger: triggerFieldValidationAction, 
    watch: watchFormFieldAction, 
    reset: resetFormOrchestrationAction 
  } = useFormContext<PodcastCreationData>();

  const {
    currentFlowState,
    transitionTo: transitionToNextStateAction,
    goBack: navigateToPreviousStateAction,
    progressMetrics,
    isGeneratingScript
  } = useCreationContext();

  const currentSelectionPurposeIdentification = watchFormFieldAction("purpose");
  const [narrativeOptionsCollection, setNarrativeOptionsCollection] = useState<NarrativeOption[]>([]);

  /**
   * flowActionsAuthority:
   * [SINCRO V55.0]: Vinculación con los métodos purificados del hook V7.0.
   */
  const flowActionsAuthority = useFlowActions({
    transitionTo: transitionToNextStateAction,
    goBack: navigateToPreviousStateAction,
    clearDraft: () => resetFormOrchestrationAction()
  });

  /**
   * currentActiveFlowPathCollection:
   * Misión: Determinar la trayectoria lógica basándose en el propósito del curador.
   */
  const currentActiveFlowPathCollection = useMemo(() => {
    return MASTER_FLOW_PATHS[currentSelectionPurposeIdentification] || MASTER_FLOW_PATHS.learn;
  }, [currentSelectionPurposeIdentification]);

  /**
   * handleValidatedNextStepAction:
   * Misión: Ejecutar la validación técnica del paso actual antes de permitir el avance.
   * [SINCRO V55.0]: Se actualizan las claves de campo para coincidir con el esquema ZAP.
   */
  const handleValidatedNextStepAction = useCallback(async () => {
    const currentFlowStateDescriptor = currentFlowState;
    
    let fieldsToValidateCollection: (keyof PodcastCreationData)[] = [];
    
    switch (currentFlowStateDescriptor) {
      case 'SOLO_TALK_INPUT': 
        fieldsToValidateCollection = ['soloTopicSelection', 'soloMotivationContentText'];
        break;
      case 'DETAILS_STEP': 
        fieldsToValidateCollection = ['durationSelection', 'narrativeDepthLevel']; 
        break;
      case 'TONE_SELECTION': 
        fieldsToValidateCollection = ['agentName']; 
        break;
      case 'SCRIPT_EDITING': 
        fieldsToValidateCollection = ['finalTitle', 'finalScriptContent'];
        break;
    }

    const isCurrentStepValidationSuccessful = fieldsToValidateCollection.length > 0 
        ? await triggerFieldValidationAction(fieldsToValidateCollection) 
        : true;

    if (isCurrentStepValidationSuccessful) {
      const currentStepIndexMagnitude = currentActiveFlowPathCollection.indexOf(currentFlowStateDescriptor);
      
      if (currentStepIndexMagnitude !== -1 && (currentStepIndexMagnitude + 1) < currentActiveFlowPathCollection.length) {
        transitionToNextStateAction(currentActiveFlowPathCollection[currentStepIndexMagnitude + 1]);
      }
    } else {
      toast({ 
        title: "Integridad de Datos Insuficiente", 
        description: "Complete los campos obligatorios para continuar con la forja.",
        variant: "destructive" 
      });
    }
  }, [currentFlowState, triggerFieldValidationAction, toast, currentActiveFlowPathCollection, transitionToNextStateAction]);

  return (
    <LayoutShell
      onNext={handleValidatedNextStepAction}
      onDraft={flowActionsAuthority.generateDraft}
      onProduce={flowActionsAuthority.handleSubmitProduction}
      onAnalyzeLocal={flowActionsAuthority.analyzeLocalEnvironment}
      isGenerating={isGeneratingScript || flowActionsAuthority.isGenerating}
      isSubmitting={flowActionsAuthority.isSubmitting}
      progress={progressMetrics}
    >
      {/* 
          [FIX V55.0]: Eliminación de 'any'. 
          Los tipos NarrativeOption[] y DraftRow[] ahora están sincronizados.
      */}
      <StepRenderer
        narrativeOptionsCollection={narrativeOptionsCollection}
        initialDraftsCollection={initialDraftsCollection}
      />
    </LayoutShell>
  );
}

/**
 * PodcastCreationOrchestrator: El punto de entrada soberano para la forja de capital intelectual.
 */
export default function PodcastCreationOrchestrator({ 
  initialDraftsCollection = [] 
}: PodcastCreationOrchestratorProperties) {
  
  const [isComponentMounted, setIsComponentMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  /**
   * formOrchestrationMethods:
   * [SINCRO V55.0]: DefaultValues alineados con el esquema PodcastCreationSchema V12.0.
   */
  const formOrchestrationMethods = useForm<PodcastCreationData>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "learn",
      sourcesCollection: [],
      agentName: 'narrador',
      creationMode: 'standard',
      durationSelection: 'Entre 2 y 3 minutos',
      narrativeDepthLevel: 'Intermedia',
      draftIdentification: null,
      pulseSourceIdentificationsCollection: [],
    }
  });

  if (!isComponentMounted) {
    return null;
  }

  return (
    <FormProvider {...formOrchestrationMethods}>
      <CreationProvider>
        <InnerOrchestrator initialDraftsCollection={initialDraftsCollection} />
      </CreationProvider>
    </FormProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V55.0):
 * 1. Build Shield Compliance: Resolución de TS2339 y TS2551 mediante la alineación 
 *    con los nombres industriales 'generateDraft', 'isGenerating', etc.
 * 2. ZAP Alignment: Sincronización de 'defaultValues' y 'fieldsToValidateCollection' 
 *    con los descriptores del esquema purificado (V12.0).
 * 3. Type Safety: Se ha eliminado el uso de 'as any' en el StepRenderer, 
 *    garantizando que el flujo de datos sea íntegro desde el Metal hasta el Cristal.
 */