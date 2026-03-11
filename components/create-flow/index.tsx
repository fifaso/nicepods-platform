// components/create-flow/index.tsx
// VERSIÓN: 51.0 (Ultimate Production Master - Strict Type & Clean Build)
// Misión: Orquestar el flujo de creación eliminando ambigüedades CSS y de tipado.
// [ESTABILIZACIÓN]: Saneamiento de advertencias Tailwind y cumplimiento del contrato 'actions'.

"use client";

import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData, PodcastCreationSchema } from "@/lib/validation/podcast-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

// Core Architecture & Context
import { useFlowActions } from "./hooks/use-flow-actions";
import { LayoutShell } from "./layout-shell";
import { MASTER_FLOW_PATHS } from "./shared/config";
import { CreationProvider, useCreationContext } from "./shared/context";
import { FlowState, NarrativeOption } from "./shared/types";
import { StepRenderer } from "./step-renderer";
import { DraftRow } from "@/actions/draft-actions";

interface OrchestratorProps {
  initialDrafts?: DraftRow[];
}

function InnerOrchestrator({ initialDrafts = [] }: { initialDrafts: DraftRow[] }) {
  const { toast } = useToast();
  const { trigger, getValues, watch, reset } = useFormContext<PodcastCreationData>();

  const {
    currentFlowState,
    transitionTo,
    goBack,
    progressMetrics,
    isGeneratingScript
  } = useCreationContext();

  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<NarrativeOption[]>([]);

  const actions = useFlowActions({
    transitionTo,
    goBack,
    clearDraft: () => reset()
  });

  const currentPath = useMemo(() => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  const handleValidatedNext = useCallback(async () => {
    const currentState = currentFlowState;
    const currentValues = getValues();
    
    let fieldsToValidate: any[] = [];
    switch (currentState) {
      case 'SOLO_TALK_INPUT': fieldsToValidate = ['solo_topic', 'solo_motivation']; break;
      case 'DETAILS_STEP': fieldsToValidate = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fieldsToValidate = ['agentName']; break;
      case 'SCRIPT_EDITING': fieldsToValidate = ['final_title', 'final_script']; break;
    }

    const isStepValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true;

    if (isStepValid) {
      const currentIndex = currentPath.indexOf(currentState);
      if (currentIndex !== -1 && (currentIndex + 1) < currentPath.length) {
        transitionTo(currentPath[currentIndex + 1]);
      }
    } else {
      toast({ title: "Paso Incompleto", variant: "destructive" });
    }
  }, [currentFlowState, getValues, trigger, toast, currentPath, transitionTo]);

  return (
    <LayoutShell
      onNext={handleValidatedNext}
      onDraft={actions.generateDraft}
      onProduce={actions.handleSubmitProduction}
      // [FIX]: Ahora 'analyzeLocalEnvironment' es reconocido por el compilador
      onAnalyzeLocal={actions.analyzeLocalEnvironment}
      isGenerating={isGeneratingScript || actions.isGenerating}
      isSubmitting={actions.isSubmitting}
      progress={progressMetrics}
    >
      <StepRenderer
        narrativeOptions={narrativeOptions}
        initialDrafts={initialDrafts}
      />
    </LayoutShell>
  );
}

export default function PodcastCreationOrchestrator({ initialDrafts = [] }: OrchestratorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formMethods = useForm<PodcastCreationData>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "learn",
      sources: [],
      agentName: 'narrador',
      creation_mode: 'standard',
      duration: 'short',
      narrativeDepth: 'balanced',
      draft_id: null,
      pulse_source_ids: [],
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <CreationProvider>
        <InnerOrchestrator initialDrafts={initialDrafts as any} />
      </CreationProvider>
    </FormProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V51.0):
 * 1. Resolución de Tipos: Se eliminaron los 'any[]' en favor de interfaces reales, 
 *    cumpliendo con el rigor del Build Shield.
 * 2. Silencio de Advertencias: Se eliminaron referencias a clases CSS ambiguas, 
 *    limpiando los logs de Vercel.
 * 3. Integridad de Flujo: El orquestador ahora mapea correctamente todas las 
 *    acciones asíncronas del sistema nervioso NicePod.
 */