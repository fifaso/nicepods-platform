// components/create-flow/index.tsx
// VERSIÓN: 48.0 (Master Sovereign - Instant Production Redirection & Shield Sync)

"use client";

import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData, PodcastCreationSchema } from "@/lib/validation/podcast-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

// Core Architecture
import { useFlowActions } from "./hooks/use-flow-actions";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { LayoutShell } from "./layout-shell";
import { MASTER_FLOW_PATHS } from "./shared/config";
import { CreationContext } from "./shared/context";
import { StepRenderer } from "./step-renderer";

interface OrchestratorProps {
  initialDrafts?: any[];
}

function InnerOrchestrator({ initialDrafts = [] }: { initialDrafts: any[] }) {
  const { toast } = useToast();
  const { trigger, setValue, getValues, watch, reset } = useFormContext<PodcastCreationData>();

  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // 1. INICIALIZACIÓN DE MOTORES
  const navigation = useFlowNavigation({ currentPurpose });

  const navActions = useMemo(() => ({
    transitionTo: (state: any) => navigation.transitionTo(state),
    goBack: () => navigation.goBack(),
    jumpToStep: (state: any) => navigation.jumpToStep(state)
  }), [navigation]);

  const actions = useFlowActions({
    transitionTo: navActions.transitionTo,
    goBack: navActions.goBack,
    clearDraft: () => reset()
  });

  const currentPath = useMemo(() => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  /**
   * handleValidatedNext
   * Validador de calidad y orquestador de transiciones entre pasos.
   */
  const handleValidatedNext = useCallback(async () => {
    const currentState = navigation.currentFlowState;
    const currentValues = getValues();

    // Validación de densidad cognitiva (Mínimo 10 palabras)
    if (['SOLO_TALK_INPUT', 'QUESTION_INPUT', 'LEGACY_INPUT'].includes(currentState)) {
      const content = currentValues.solo_motivation || currentValues.question_to_answer || currentValues.legacy_lesson || "";
      const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

      if (wordCount < 10) {
        toast({
          title: "Desarrolla más tu idea",
          description: "Requerimos un poco más de sustancia para generar un podcast de alto valor.",
          variant: "destructive"
        });
        return;
      }
    }

    // Mapeo de validación técnica vía Zod
    let fields: any[] = [];
    switch (currentState) {
      case 'SOLO_TALK_INPUT': fields = ['solo_topic', 'solo_motivation']; break;
      case 'DETAILS_STEP': fields = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fields = ['agentName', 'voiceStyle', 'voicePace']; break; // Sincronizado con AudioStudio v2.6
      case 'SCRIPT_EDITING': fields = ['final_title', 'final_script']; break;
      case 'LINK_POINTS_INPUT': fields = ['link_topicA', 'link_topicB']; break;
      case 'ARCHETYPE_GOAL': fields = ['archetype_topic', 'archetype_goal']; break;
    }

    const isStepValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isStepValid) {
      if (currentState === 'LINK_POINTS_INPUT') {
        await (actions as any).generateNarratives(setNarrativeOptions);
      } else {
        const currentIndex = currentPath.indexOf(currentState);
        if (currentIndex !== -1 && (currentIndex + 1) < currentPath.length) {
          navigation.transitionTo(currentPath[currentIndex + 1]);
        }
      }
    } else {
      toast({ title: "Atención", description: "Revisa los campos para continuar.", variant: "destructive" });
    }
  }, [navigation, getValues, trigger, toast, actions, currentPath]);

  // VALOR DE CONTEXTO PARA PASOS HIJOS
  const contextValue = {
    ...navigation,
    onNext: handleValidatedNext,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => { },
    updateFormData: (data: any) => {
      Object.entries(data).forEach(([k, v]) => setValue(k as any, v, {
        shouldValidate: true,
        shouldDirty: true
      }));
    },
    getMasterPath: () => currentPath
  };

  return (
    <CreationContext.Provider value={contextValue}>
      <LayoutShell
        onNext={handleValidatedNext}
        onDraft={actions.generateDraft}
        onProduce={actions.handleSubmitProduction} // [SISTEMA]: Redirige al ID tras éxito
        onAnalyzeLocal={(actions as any).analyzeLocalEnvironment}
        isGenerating={actions.isGenerating}
        isSubmitting={actions.isSubmitting}
        progress={navigation.progressMetrics}
      >
        <StepRenderer
          narrativeOptions={narrativeOptions}
          initialDrafts={initialDrafts}
        />
      </LayoutShell>
    </CreationContext.Provider>
  );
}

export default function PodcastCreationOrchestrator({ initialDrafts = [] }: OrchestratorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const formMethods = useForm<PodcastCreationData>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "learn",
      sources: [],
      agentName: 'narrador',
      creation_mode: 'standard',
      voiceGender: 'Masculino',
      voiceStyle: 'Profesional',
      voicePace: 'Moderado',
      speakingRate: 1.0,
      duration: 'short',
      narrativeDepth: 'balanced',
      draft_id: null
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator initialDrafts={initialDrafts} />
    </FormProvider>
  );
}