// components/create-flow/index.tsx
// VERSIÓN: 34.0 (Master Sovereign - Determinist Architecture)

"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  const { trigger, setValue, getValues } = useFormContext<PodcastCreationData>();
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // Inicializamos navegación con el propósito actual del formulario
  const navigation = useFlowNavigation({ currentPurpose: getValues("purpose") });
  
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    goBack: navigation.goBack,
    clearDraft: () => {} 
  });

  const handleValidatedNext = async () => {
    const currentState = navigation.currentFlowState;
    const currentValues = getValues();
    const currentPurpose = currentValues.purpose;
    
    // 1. BLOQUEO POR CALIDAD
    if (['SOLO_TALK_INPUT', 'QUESTION_INPUT', 'LEGACY_INPUT'].includes(currentState)) {
      const content = currentValues.solo_motivation || currentValues.question_to_answer || currentValues.legacy_lesson || "";
      const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
      if (wordCount < 10) {
        toast({ title: "Falta sustancia", description: "Describe tu idea con al menos 10 palabras.", variant: "destructive" });
        return;
      }
    }

    if (currentState === 'SCRIPT_EDITING') {
      if (!currentValues.final_title || !currentValues.final_script) {
        toast({ title: "Borrador incompleto", description: "Revisa el título y el guion.", variant: "destructive" });
        return;
      }
    }

    // 2. TRIGGER DE ZOD SEGÚN ESTADO
    let fields: any[] = [];
    switch (currentState) {
      case 'SOLO_TALK_INPUT': fields = ['solo_topic', 'solo_motivation']; break;
      case 'LEARN_SUB_SELECTION': fields = ['agentName', 'style']; break;
      case 'DETAILS_STEP': fields = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fields = ['agentName']; break;
      case 'SCRIPT_EDITING': fields = ['final_title', 'final_script']; break;
      case 'AUDIO_STUDIO_STEP': fields = ['voiceGender', 'voiceStyle', 'voicePace', 'speakingRate']; break;
      default: fields = [];
    }

    const isStepValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isStepValid) {
      // 3. CÁLCULO DE SIGUIENTE PASO (LÓGICA DETERMINISTA)
      if (currentState === 'LINK_POINTS_INPUT') {
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
          const currentIndex = path.indexOf(currentState);
          
          if (currentIndex !== -1 && (currentIndex + 1) < path.length) {
            navigation.transitionTo(path[currentIndex + 1]);
          } else if (currentIndex === -1) {
            toast({ title: "Error de Navegación", description: "Estado no encontrado en la ruta actual.", variant: "destructive" });
          }
      }
    } else {
      toast({ title: "Información Necesaria", description: "Completa los campos marcados.", variant: "destructive" });
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
      voicePace: 'Moderado',
      speakingRate: 1.0
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator />
    </FormProvider>
  );
}