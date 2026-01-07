// components/create-flow/index.tsx
// VERSIÓN: 35.0 (Master Sovereign - Total Integrity & State Preservation)

"use client";

import React, { useState, useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useToast } from "@/hooks/use-toast";

import { CreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useFlowActions } from "./hooks/use-flow-actions";
import { StepRenderer } from "./step-renderer";
import { LayoutShell } from "./layout-shell";
import { MASTER_FLOW_PATHS } from "./shared/config";

function InnerOrchestrator() {
  const { toast } = useToast();
  const { trigger, setValue, getValues, watch } = useFormContext<PodcastCreationData>();
  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  const navigation = useFlowNavigation({ currentPurpose });
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    goBack: navigation.goBack,
    clearDraft: () => {} 
  });

  const handleValidatedNext = async () => {
    const currentState = navigation.currentFlowState;
    const currentValues = getValues();
    let fields: any[] = [];

    // BLOQUEOS DE CALIDAD (BUSINESS LOGIC)
    if (['SOLO_TALK_INPUT', 'QUESTION_INPUT', 'LEGACY_INPUT'].includes(currentState)) {
      const content = currentValues.solo_motivation || currentValues.question_to_answer || currentValues.legacy_lesson || "";
      const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
      if (wordCount < 10) {
        toast({ title: "Falta sustancia", description: "Mínimo 10 palabras para garantizar calidad.", variant: "destructive" });
        return;
      }
    }

    // MAPEO DE CAMPOS SEGÚN ESTADO PARA ZOD
    switch (currentState) {
      case 'SOLO_TALK_INPUT': fields = ['solo_topic', 'solo_motivation']; break;
      case 'DETAILS_STEP': fields = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fields = ['agentName']; break;
      case 'SCRIPT_EDITING': fields = ['final_title', 'final_script']; break;
      case 'LINK_POINTS_INPUT': fields = ['link_topicA', 'link_topicB']; break;
      case 'ARCHETYPE_GOAL': fields = ['archetype_topic', 'archetype_goal']; break;
      default: fields = [];
    }

    const isStepValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isStepValid) {
      if (currentState === 'LINK_POINTS_INPUT') {
          // @ts-ignore
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
          const currentIndex = path.indexOf(currentState);
          if (currentIndex !== -1 && (currentIndex + 1) < path.length) {
            navigation.transitionTo(path[currentIndex + 1]);
          }
      }
    } else {
      toast({ title: "Atención", description: "Completa los campos requeridos.", variant: "destructive" });
    }
  };

  const contextValue = {
    ...navigation,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => {}, 
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
        <StepRenderer narrativeOptions={narrativeOptions} />
      </LayoutShell>
    </CreationContext.Provider>
  );
}

export default function PodcastCreationOrchestrator() {
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
      duration: 'short',
      narrativeDepth: 'balanced'
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator />
    </FormProvider>
  );
}