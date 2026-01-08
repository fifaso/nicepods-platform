// components/create-flow/index.tsx
// VERSIÓN: 44.0 (Master Sovereign - Total Prop Sync)

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

/**
 * InnerOrchestrator
 * Gestiona la lógica de validación y transición asíncrona.
 */
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

    // Validación de calidad mínima de texto
    if (['SOLO_TALK_INPUT', 'QUESTION_INPUT', 'LEGACY_INPUT'].includes(currentState)) {
      const content = currentValues.solo_motivation || currentValues.question_to_answer || currentValues.legacy_lesson || "";
      if (content.trim().split(/\s+/).filter(w => w.length > 0).length < 10) {
        toast({ title: "Idea insuficiente", description: "Desarrolla tu idea con al menos 10 palabras.", variant: "destructive" });
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
      case 'ARCHETYPE_GOAL': fields = ['archetype_topic', 'archetype_goal']; break;
    }

    const isValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isValid) {
      if (currentState === 'LINK_POINTS_INPUT') {
        await actions.generateNarratives(setNarrativeOptions);
      } else {
        const currentIndex = currentPath.indexOf(currentState);
        if (currentIndex !== -1 && (currentIndex + 1) < currentPath.length) {
          navigation.transitionTo(currentPath[currentIndex + 1]);
        }
      }
    } else {
      toast({ title: "Atención", description: "Completa los campos requeridos.", variant: "destructive" });
    }
  }, [navigation, getValues, trigger, toast, actions, currentPath]);

  const contextValue = {
    ...navigation,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => { },
    updateFormData: (data: any) => {
      Object.entries(data).forEach(([k, v]) => setValue(k as any, v, {
        shouldValidate: true, shouldDirty: true, shouldTouch: true
      }));
    }
  };

  return (
    <CreationContext.Provider value={contextValue}>
      <LayoutShell
        onNext={handleValidatedNext}
        onDraft={actions.generateDraft}
        onProduce={actions.handleSubmitProduction}
        onAnalyzeLocal={actions.analyzeLocalEnvironment}
        isGenerating={actions.isGenerating}
        isSubmitting={actions.isSubmitting}
        progress={navigation.progressMetrics}
      >
        {/* [FIJO]: StepRenderer ahora acepta initialDrafts */}
        <StepRenderer
          narrativeOptions={narrativeOptions}
          initialDrafts={initialDrafts}
        />
      </LayoutShell>
    </CreationContext.Provider>
  );
}

/**
 * PodcastCreationOrchestrator
 * Componente principal exportado.
 */
export default function PodcastCreationOrchestrator({ initialDrafts = [] }: { initialDrafts?: any[] }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const formMethods = useForm<PodcastCreationData>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "learn",
      sources: [],
      agentName: 'solo-talk-analyst',
      creation_mode: 'standard',
      voiceGender: 'Masculino',
      voiceStyle: 'Profesional',
      voicePace: 'Moderado',
      speakingRate: 1.0,
      duration: 'short',
      narrativeDepth: 'balanced'
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator initialDrafts={initialDrafts} />
    </FormProvider>
  );
}