// components/create-flow/index.tsx
// VERSIÓN: 26.0 (Master Sovereign Orchestrator - Full Multi-Flow & Validation Support)

"use client";

import { useState, useEffect, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Imports Modulares NicePod Engine
import { CreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useFlowActions } from "./hooks/use-flow-actions";
import { StepRenderer } from "./step-renderer";
import { LayoutShell } from "./layout-shell";

/**
 * PodcastCreationOrchestrator
 * Master Component que gobierna el flujo de creación global de NicePod.
 */
export default function PodcastCreationOrchestrator() {
  const { toast } = useToast();
  const { supabase, user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  // Estado para las opciones de narrativa del flujo 'Explore'
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // Garantía de Hidratación para estabilidad en móviles y PWA
  useEffect(() => { setIsMounted(true); }, []);

  // 1. INICIALIZACIÓN DEL CONTRATO DE DATOS (Zod v4.0)
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
  const currentPurpose = watch("purpose");

  // 2. INICIALIZACIÓN DE LA NAVEGACIÓN
  const navigation = useFlowNavigation({ currentPurpose });

  // 3. INICIALIZACIÓN DE LAS ACCIONES IA
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    clearDraft: () => reset() 
  });

  /**
   * handleValidatedNext
   * Gestiona el botón "CONTINUAR" con validación de campos obligatorios 
   * para todos los propósitos de la plataforma.
   */
  const handleValidatedNext = async () => {
    let fieldsToValidate: any[] = [];
    const currentState = navigation.currentFlowState;

    // Mapa dinámico de validaciones por pantalla
    if (currentState === 'SOLO_TALK_INPUT') fieldsToValidate = ['solo_topic', 'solo_motivation'];
    if (currentState === 'ARCHETYPE_SELECTION') fieldsToValidate = ['selectedArchetype'];
    if (currentState === 'DETAILS_STEP') fieldsToValidate = ['duration', 'narrativeDepth'];
    if (currentState === 'TONE_SELECTION') fieldsToValidate = ['agentName'];
    if (currentState === 'LEGACY_INPUT') fieldsToValidate = ['legacy_lesson'];
    if (currentState === 'QUESTION_INPUT') fieldsToValidate = ['question_to_answer'];

    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true;

    if (isValid) {
      // Casos Especiales (Llamadas a funciones antes de cambiar de paso)
      if (currentState === 'LINK_POINTS_INPUT') {
          // @ts-ignore: Acceso a función compartida
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          // Navegación secuencial basada en el mapa maestro de configuración
          const path = navigation.activePath;
          const currentIndex = (path as string[]).indexOf(currentState);
          const nextIndex = currentIndex + 1;
          
          if (nextIndex < path.length) {
            navigation.transitionTo(path[nextIndex]);
          }
      }
    } else {
      toast({ 
        title: "Atención", 
        description: "Completa la información del paso actual para continuar.", 
        variant: "destructive" 
      });
    }
  };

  if (!isMounted) return null;

  /**
   * contextValue
   * Inyectamos el ID de correlación y la normalización de Agentes en el contexto.
   */
  const contextValue = {
    ...navigation,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => {}, // Gestionado internamente por el hook de acciones
    updateFormData: (data: Partial<PodcastCreationData>) => {
        Object.entries(data).forEach(([key, value]) => {
          // Mapeo de compatibilidad: selectedAgent -> agentName
          const targetKey = key === 'selectedAgent' ? 'agentName' : key;
          setValue(targetKey as any, value, { shouldValidate: true });
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
          onAnalyzeLocal={actions.analyzeLocalEnvironment} // <--- Soporte para Vivir lo local
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