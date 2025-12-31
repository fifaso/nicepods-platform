// components/create-flow/index.tsx
// VERSIÓN: 23.0 (Master Sovereign - Final Assembly with Validation Logic)

"use client";

import { useState, useEffect, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema } from "@/lib/validation/podcast-schema";
import { useToast } from "@/hooks/use-toast";

// Imports Modulares
import { CreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useFlowActions } from "./hooks/use-flow-actions";
import { StepRenderer } from "./step-renderer";
import { LayoutShell } from "./layout-shell";

export default function PodcastCreationOrchestrator() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  // 1. Inicialización de Datos (Fuente de Verdad)
  const formMethods = useForm({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: { 
      purpose: "learn", 
      sources: [], 
      agentName: 'solo-talk-analyst',
      inputs: {} 
    }
  });

  const { watch, setValue, trigger, handleSubmit } = formMethods;
  const currentPurpose = watch("purpose");

  // 2. Inicialización de Navegación
  const navigation = useFlowNavigation({ currentPurpose });

  // 3. Inicialización de Acciones (IA y Red)
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    clearDraft: () => formMethods.reset() 
  });

  /**
   * LÓGICA DE VALIDACIÓN DE PASOS (Crucial para el botón SIGUIENTE)
   */
  const handleValidatedNext = async () => {
    let fields: any[] = [];
    const state = navigation.currentFlowState;

    // Determinamos qué campos validar según el paso actual
    if (state === 'SOLO_TALK_INPUT') fields = ['solo_topic', 'solo_motivation'];
    if (state === 'ARCHETYPE_SELECTION') fields = ['selectedArchetype'];
    if (state === 'DETAILS_STEP') fields = ['duration', 'narrativeDepth'];
    if (state === 'TONE_SELECTION') fields = ['selectedTone'];

    const isValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isValid) {
      // Casos especiales de transición
      if (state === 'LINK_POINTS_INPUT') {
          // Lógica de narrativas para el flujo 'explore'
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          // Navegación automática basada en MASTER_FLOW_PATHS
          const path = navigation.getMasterPath();
          const nextIndex = path.indexOf(state) + 1;
          if (nextIndex < path.length) {
            navigation.transitionTo(path[nextIndex]);
          }
      }
    } else {
      toast({ title: "Información incompleta", variant: "destructive" });
    }
  };

  if (!isMounted) return null;

  return (
    <CreationContext.Provider value={{ 
      ...navigation, 
      isGeneratingScript: actions.isGenerating,
      setIsGeneratingScript: () => {}, 
      updateFormData: (data: any) => {
        Object.entries(data).forEach(([k, v]) => setValue(k as any, v));
      }
    }}>
      <FormProvider {...formMethods}>
        <LayoutShell
          onNext={handleValidatedNext} // <--- VALIDACIÓN INTEGRADA
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