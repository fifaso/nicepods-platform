// components/create-flow/index.tsx
// VERSIÓN: 25.0 (Master Sovereign - Recovery & Full Multi-Flow Integration)

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/contexts/audio-context";
import { useRouter } from "next/navigation";

// Imports del Dominio Modular
import { CreationContext } from "./shared/context";
import { MASTER_FLOW_PATHS } from "./shared/config";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useFlowActions } from "./hooks/use-flow-actions";
import { StepRenderer } from "./step-renderer";
import { LayoutShell } from "./layout-shell";

export default function PodcastCreationOrchestrator() {
  const { toast } = useToast();
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // 1. Garantía de Hidratación (Elimina el error "Something went wrong")
  useEffect(() => { setIsMounted(true); }, []);

  // 2. Inicialización de Datos (Contrato Zod v4.0)
  const formMethods = useForm<PodcastCreationData | any>({
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
  const formData = watch();

  // 3. Inicialización del Motor de Navegación y Acciones
  const navigation = useFlowNavigation({ currentPurpose: formData.purpose });
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    clearDraft: () => reset() 
  });

  /**
   * handleValidatedNext
   * Gestiona la navegación para TODAS las opciones del formulario.
   * Esto repara el error de que solo funcionaba "Vivir lo local".
   */
  const handleValidatedNext = async () => {
    const currentState = navigation.currentFlowState;
    let fieldsToValidate: any[] = [];

    // Mapeo dinámico de validaciones
    if (currentState === 'SOLO_TALK_INPUT') fieldsToValidate = ['solo_topic', 'solo_motivation'];
    if (currentState === 'ARCHETYPE_SELECTION') fieldsToValidate = ['selectedArchetype'];
    if (currentState === 'DETAILS_STEP') fieldsToValidate = ['duration', 'narrativeDepth'];
    if (currentState === 'TONE_SELECTION') fieldsToValidate = ['agentName'];
    if (currentState === 'LEGACY_INPUT') fieldsToValidate = ['legacy_lesson'];
    if (currentState === 'QUESTION_INPUT') fieldsToValidate = ['question_to_answer'];

    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true;

    if (isValid) {
      if (currentState === 'LINK_POINTS_INPUT') {
          // @ts-ignore: Acceso a función compartida
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          // Avance secuencial basado en el config.ts
          const path = MASTER_FLOW_PATHS[formData.purpose] || MASTER_FLOW_PATHS.learn;
          const currentIndex = (path as string[]).indexOf(currentState);
          if (currentIndex !== -1 && currentIndex < path.length - 1) {
            navigation.transitionTo(path[currentIndex + 1]);
          }
      }
    } else {
      toast({ title: "Atención", description: "Completa los campos para continuar.", variant: "destructive" });
    }
  };

  /**
   * handleAnalyzeLocalSurroundings
   * Específico para el hito sensorial de "Vivir lo Local"
   */
  const handleAnalyzeLocalSurroundings = async () => {
    await actions.analyzeLocalEnvironment();
  };

  if (!isMounted) return null;

  // Contexto Unificado
  const contextValue = {
    ...navigation,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => {}, 
    updateFormData: (data: any) => {
        Object.entries(data).forEach(([k, v]) => {
            const finalKey = k === 'selectedAgent' ? 'agentName' : k;
            setValue(finalKey as any, v, { shouldValidate: true });
        });
    }
  };

  return (
    <CreationContext.Provider value={contextValue}>
      <FormProvider {...formMethods}>
        <LayoutShell
          onNext={handleValidatedNext}
          onDraft={actions.generateDraft}
          onProduce={handleSubmit(actions.submitToProduction)}
          onAnalyzeLocal={handleAnalyzeLocalSurroundings}
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