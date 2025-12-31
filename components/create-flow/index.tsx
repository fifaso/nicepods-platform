// components/create-flow/index.tsx
// VERSIÓN: 24.0 (The Sovereign Orchestrator - Build Fix & Perfect Context Sync)

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema } from "@/lib/validation/podcast-schema";
import { useToast } from "@/hooks/use-toast";

// Imports del Dominio Modular
import { CreationContext } from "./shared/context";
import { MASTER_FLOW_PATHS } from "./shared/config";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useFlowActions } from "./hooks/use-flow-actions";
import { StepRenderer } from "./step-renderer";
import { LayoutShell } from "./layout-shell";

export default function PodcastCreationOrchestrator() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // Garantía de Hidratación para evitar "Something went wrong" en móviles
  useEffect(() => { setIsMounted(true); }, []);

  // 1. INICIALIZACIÓN DE DATOS (Contrato Zod v3.1)
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

  const { watch, setValue, trigger, handleSubmit, reset } = formMethods;
  const currentPurpose = watch("purpose");

  // 2. INICIALIZACIÓN DEL SISTEMA NERVIOSO (Navegación)
  const navigation = useFlowNavigation({ currentPurpose });

  // 3. INICIALIZACIÓN DEL MÚSCULO (Acciones IA)
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    clearDraft: () => reset() 
  });

  /**
   * handleValidatedNext
   * Lógica profesional de validación paso a paso.
   */
  const handleValidatedNext = async () => {
    let fields: any[] = [];
    const state = navigation.currentFlowState;

    if (state === 'SOLO_TALK_INPUT') fields = ['solo_topic', 'solo_motivation'];
    if (state === 'ARCHETYPE_SELECTION') fields = ['selectedArchetype'];
    if (state === 'DETAILS_STEP') fields = ['duration', 'narrativeDepth'];
    if (state === 'TONE_SELECTION') fields = ['agentName'];

    const isValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isValid) {
      if (state === 'LINK_POINTS_INPUT') {
          // @ts-ignore: Acceso a función de narrativas
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
          const nextIndex = (path as string[]).indexOf(state) + 1;
          if (nextIndex < path.length) {
            navigation.transitionTo(path[nextIndex]);
          }
      }
    } else {
      toast({ title: "Información requerida", description: "Completa los campos marcados para continuar.", variant: "destructive" });
    }
  };

  if (!isMounted) return null;

  // Objeto de Contexto Unificado (NicePod Standard)
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
      <FormProvider {...formMethods}>
        <LayoutShell
          onNext={handleValidatedNext}
          onDraft={actions.generateDraft}
          onProduce={handleSubmit(actions.submitToProduction)}
          isGenerating={actions.isGenerating}
          isSubmitting={actions.isSubmitting}
          progress={navigation.progressMetrics}
        >
          <StepRenderer narrativeOptions={narrativeOptions} />
        </LayoutShell>
      </FormProvider>
    </CreationContext.Provider>
  );
}