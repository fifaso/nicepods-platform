// components/create-flow/index.tsx
// VERSIÓN: 27.0 (Master Sovereign - Context Injection Fix)

"use client";

import { useState, useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useToast } from "@/hooks/use-toast";

// Imports Modulares
import { CreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useFlowActions } from "./hooks/use-flow-actions";
import { StepRenderer } from "./step-renderer";
import { LayoutShell } from "./layout-shell";
import { MASTER_FLOW_PATHS } from "./shared/config";

/**
 * InnerOrchestrator
 * Componente interno que YA TIENE ACCESO al FormProvider.
 * Aquí es seguro usar useFlowActions y useFormContext.
 */
function InnerOrchestrator() {
  const { toast } = useToast();
  const { watch, trigger, setValue } = useFormContext<PodcastCreationData>();
  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // 1. Navegación (No depende de RHF, pero la necesitamos aquí)
  const navigation = useFlowNavigation({ currentPurpose });

  // 2. Acciones (AHORA SÍ TIENE CONTEXTO DE RHF)
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    clearDraft: () => {} // Reset manejado por el padre si es necesario o via window location
  });

  const handleValidatedNext = async () => {
    let fields: any[] = [];
    const state = navigation.currentFlowState;

    if (state === 'SOLO_TALK_INPUT') fields = ['solo_topic', 'solo_motivation'];
    if (state === 'ARCHETYPE_SELECTION') fields = ['selectedArchetype'];
    if (state === 'DETAILS_STEP') fields = ['duration', 'narrativeDepth'];
    if (state === 'TONE_SELECTION') fields = ['agentName'];
    if (state === 'LEGACY_INPUT') fields = ['legacy_lesson'];
    if (state === 'QUESTION_INPUT') fields = ['question_to_answer'];

    const isValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isValid) {
      if (state === 'LINK_POINTS_INPUT') {
          // @ts-ignore
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
          const nextIndex = (path as string[]).indexOf(state) + 1;
          if (nextIndex < path.length) {
            navigation.transitionTo(path[nextIndex]);
          }
      }
    } else {
      toast({ title: "Información incompleta", variant: "destructive" });
    }
  };

  // Inyectamos el contexto de navegación y acciones para los hijos (Steps)
  const contextValue = {
    ...navigation,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => {}, 
    updateFormData: (data: any) => {
        Object.entries(data).forEach(([k, v]) => setValue(k as any, v, { shouldValidate: true }));
    }
  };

  return (
    <CreationContext.Provider value={contextValue}>
      <LayoutShell
        onNext={handleValidatedNext}
        onDraft={actions.generateDraft}
        onProduce={actions.handleSubmitProduction} // Usamos la función wrapper del hook
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

/**
 * PodcastCreationOrchestrator (Wrapper Principal)
 * Su única misión es proveer el FormContext y montar el InnerOrchestrator.
 */
export default function PodcastCreationOrchestrator() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const formMethods = useForm({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: { 
      purpose: "learn", 
      sources: [], 
      agentName: 'solo-talk-analyst',
      inputs: {},
      creation_mode: 'standard'
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator />
    </FormProvider>
  );
}