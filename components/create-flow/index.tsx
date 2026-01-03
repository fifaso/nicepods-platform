// components/create-flow/index.tsx
// VERSIÓN: 31.0 (Master Sovereign - Navigation Index Shield)

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
  const { watch, trigger, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  const navigation = useFlowNavigation({ currentPurpose });
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    goBack: navigation.goBack,
    clearDraft: () => {} 
  });

  const handleValidatedNext = async () => {
    const state = navigation.currentFlowState;
    const currentValues = getValues();
    let fields: any[] = [];

    // 1. VALIDACIÓN IMPERATIVA DE BLOQUEO
    if (state === 'SOLO_TALK_INPUT') {
      const motivation = currentValues.solo_motivation || "";
      const wordCount = motivation.trim().split(/\s+/).filter(w => w.length > 0).length;
      if (wordCount < 10) {
        toast({ title: "Idea insuficiente", description: "Describe tu idea con al menos 10 palabras.", variant: "destructive" });
        return;
      }
    }

    if (state === 'SCRIPT_EDITING') {
      if (!currentValues.final_title || !currentValues.final_script) {
        toast({ title: "Borrador incompleto", description: "El título y el guion son obligatorios.", variant: "destructive" });
        return;
      }
    }

    // 2. MAPEO PARA TRIGGER DE ZOD
    switch (state) {
      case 'SOLO_TALK_INPUT': fields = ['solo_topic', 'solo_motivation']; break;
      case 'DETAILS_STEP': fields = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fields = ['agentName']; break;
      case 'SCRIPT_EDITING': fields = ['final_title', 'final_script']; break;
      default: fields = [];
    }

    const isValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isValid) {
      if (state === 'LINK_POINTS_INPUT') {
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
          const nextIndex = (path as string[]).indexOf(state) + 1;
          
          if (nextIndex > 0 && nextIndex < path.length) {
            navigation.transitionTo(path[nextIndex]);
          } else if (nextIndex === 0) {
            console.error("Critical Path Error: Current state not found in MASTER_FLOW_PATHS", state);
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
      speakingRate: 1.0,
      voicePace: 'Moderado'
    }
  });

  if (!isMounted) return null;
  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator />
    </FormProvider>
  );
}