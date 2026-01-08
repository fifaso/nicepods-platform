// components/create-flow/index.tsx
// VERSIÓN: 45.0 (Master Sovereign - Actions & Context Reference Fix)

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useToast } from "@/hooks/use-toast";

// Core Architecture Imports
import { CreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useFlowActions } from "./hooks/use-flow-actions";
import { StepRenderer } from "./step-renderer";
import { LayoutShell } from "./layout-shell";
import { MASTER_FLOW_PATHS } from "./shared/config";

interface InnerOrchestratorProps {
  initialDrafts: any[];
}

function InnerOrchestrator({ initialDrafts }: InnerOrchestratorProps) {
  const { toast } = useToast();
  const { trigger, setValue, getValues, watch } = useFormContext<PodcastCreationData>();

  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  const navigation = useFlowNavigation({ currentPurpose });

  const navActions = useMemo(() => ({
    transitionTo: (state: any) => navigation.transitionTo(state),
    goBack: () => navigation.goBack()
  }), [navigation]);

  // [FIJO]: El hook actions ahora recibe las referencias correctas
  const actions = useFlowActions({
    transitionTo: navActions.transitionTo,
    goBack: navActions.goBack,
    clearDraft: () => { }
  });

  const currentPath = useMemo(() => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  const handleValidatedNext = useCallback(async () => {
    const currentState = navigation.currentFlowState;
    const currentValues = getValues();

    // Bloqueo de calidad
    if (['SOLO_TALK_INPUT', 'QUESTION_INPUT', 'LEGACY_INPUT'].includes(currentState)) {
      const content = currentValues.solo_motivation || currentValues.question_to_answer || "";
      if (content.trim().split(/\s+/).length < 10) {
        toast({ title: "Falta sustancia", description: "Mínimo 10 palabras.", variant: "destructive" });
        return;
      }
    }

    let fields: any[] = [];
    switch (currentState) {
      case 'SOLO_TALK_INPUT': fields = ['solo_topic', 'solo_motivation']; break;
      case 'DETAILS_STEP': fields = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fields = ['agentName']; break;
      case 'SCRIPT_EDITING': fields = ['final_title', 'final_script']; break;
      case 'LINK_POINTS_INPUT': fields = ['link_topicA', 'link_topicB']; break;
    }

    const isValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isValid) {
      if (currentState === 'LINK_POINTS_INPUT') {
        // [FIJO]: Se verifica existencia de generateNarratives antes de llamar
        if ('generateNarratives' in actions) {
          await (actions as any).generateNarratives(setNarrativeOptions);
        }
      } else {
        const currentIndex = currentPath.indexOf(currentState);
        if (currentIndex !== -1 && (currentIndex + 1) < currentPath.length) {
          navigation.transitionTo(currentPath[currentIndex + 1]);
        }
      }
    }
  }, [navigation, getValues, trigger, toast, actions, currentPath]);

  // [FIJO]: Cumplimos con el contrato de CreationContextType (getMasterPath)
  const contextValue = {
    ...navigation,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => { },
    updateFormData: (data: any) => {
      Object.entries(data).forEach(([k, v]) => setValue(k as any, v, { shouldValidate: true, shouldDirty: true }));
    },
    getMasterPath: () => currentPath
  };

  return (
    <CreationContext.Provider value={contextValue}>
      <LayoutShell
        onNext={handleValidatedNext}
        onDraft={actions.generateDraft}
        onProduce={actions.handleSubmitProduction}
        onAnalyzeLocal={(actions as any).analyzeLocalEnvironment} // [FIJO]: Referencia segura
        isGenerating={actions.isGenerating}
        isSubmitting={actions.isSubmitting}
        progress={navigation.progressMetrics}
      >
        <StepRenderer narrativeOptions={narrativeOptions} initialDrafts={initialDrafts} />
      </LayoutShell>
    </CreationContext.Provider>
  );
}

export default function PodcastCreationOrchestrator({ initialDrafts = [] }: { initialDrafts?: any[] }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const formMethods = useForm<PodcastCreationData>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "learn", agentName: 'solo-talk-analyst', creation_mode: 'standard',
      voiceGender: 'Masculino', voiceStyle: 'Profesional', duration: 'short',
      narrativeDepth: 'balanced'
    }
  });

  if (!isMounted) return null;
  return <FormProvider {...formMethods}><InnerOrchestrator initialDrafts={initialDrafts} /></FormProvider>;
}