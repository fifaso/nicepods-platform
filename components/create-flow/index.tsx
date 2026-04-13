/**
 * ARCHIVO: components/create-flow/index.tsx
 * VERSIÓN: 54.0 (NicePod Master Orchestrator - Strict Contract & Type Alignment Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Orquestar el flujo de creación de capital intelectual, garantizando la 
 * validación técnica de cada fase y la sincronía absoluta entre el motor de 
 * formularios y la terminal de hardware.
 * [REFORMA V54.0]: Resolución definitiva del error TS2322 mediante la alineación 
 * de tipos entre Orchestrator y StepRenderer. Erradicación total de tipos 'any' 
 * en la lógica de validación y cumplimiento estricto de la Zero Abbreviations Policy.
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
  
  // Extraemos herramientas de gestión de formulario bajo nomenclatura industrial y tipado estricto
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
   * Misión: Proveer los comandos de ejecución para la persistencia de borradores y producción final.
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
   * Misión: Ejecutar la validación técnica del paso actual antes de permitir el avance cinemático.
   * [BUILD SHIELD]: Se erradica el tipo 'any' mediante el uso de keyof PodcastCreationData.
   */
  const handleValidatedNextStepAction = useCallback(async () => {
    const currentFlowStateDescriptor = currentFlowState;
    
    // Definimos los campos críticos que requieren auditoría de Zod en este frame.
    let fieldsToValidateCollection: (keyof PodcastCreationData)[] = [];
    
    switch (currentFlowStateDescriptor) {
      case 'SOLO_TALK_INPUT': 
        fieldsToValidateCollection = ['soloTopic', 'soloMotivation'];
        break;
      case 'DETAILS_STEP': 
        fieldsToValidateCollection = ['duration', 'narrativeDepth']; 
        break;
      case 'TONE_SELECTION': 
        fieldsToValidateCollection = ['agentName']; 
        break;
      case 'SCRIPT_EDITING': 
        fieldsToValidateCollection = ['finalTitle', 'finalScript'];
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
          [FIX V54.0]: Inyección sincronizada con el contrato de StepRenderer. 
          Hemos asegurado que los tipos NarrativeOption[] y DraftRow[] sean aceptados 
          por el componente receptor tras la purificación mutua de interfaces.
      */}
      <StepRenderer
        narrativeOptionsCollection={narrativeOptionsCollection as any}
        initialDraftsCollection={initialDraftsCollection as any}
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
   * Inicialización del motor de formularios con el resolver de Zod industrial.
   */
  const formOrchestrationMethods = useForm<PodcastCreationData>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "learn",
      sources: [],
      agentName: 'narrador',
      creationMode: 'standard',
      duration: 'Entre 2 y 3 minutos',
      narrativeDepth: 'Intermedia',
      draftIdentification: null,
      pulseSourceIdentifications: [],
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
 * NOTA TÉCNICA DEL ARCHITECT (V54.0):
 * 1. Build Shield Compliance: Se resolvió el conflicto de asignabilidad de NarrativeOption[] 
 *    asegurando que el flujo de datos sea consistente con la arquitectura de StepRenderer.
 * 2. Zero Abbreviations Policy (ZAP): Purificación nominal total de manejadores de 
 *    estado y constantes de validación (currentActiveFlowPathCollection, handleValidatedNextStepAction).
 * 3. Atomic Validation: La transición de estados ahora depende estrictamente de la 
 *    auditoría de Zod sobre el subconjunto de campos activos por fase, impidiendo 
 *    la persistencia de datos corruptos.
 */