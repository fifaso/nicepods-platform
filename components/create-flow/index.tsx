// components/create-flow/index.tsx
// VERSIÓN: 40.0 (Master Sovereign - Dependency & Reference Fix)

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

/**
 * InnerOrchestrator
 * Implementa la lógica de control de flujo y validación de campo por paso.
 * Centraliza la comunicación entre la UI y los motores de IA.
 */
function InnerOrchestrator() {
  const { toast } = useToast();
  const { trigger, setValue, getValues, watch } = useFormContext<PodcastCreationData>();

  // Observamos el propósito para reaccionar a cambios de rama
  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // 1. Inicialización de Motores
  const navigation = useFlowNavigation({ currentPurpose });

  // Memorizamos las acciones de navegación para evitar recreaciones innecesarias
  const navActions = useMemo(() => ({
    transitionTo: (state: any) => navigation.transitionTo(state),
    goBack: () => navigation.goBack()
  }), [navigation]);

  const actions = useFlowActions({
    transitionTo: navActions.transitionTo,
    goBack: navActions.goBack,
    clearDraft: () => { }
  });

  // 2. Resolución del Mapa de Ruta Actual
  const currentPath = useMemo(() => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  /**
   * handleValidatedNext
   * Gestiona el botón "SIGUIENTE". Valida la integridad del paso actual
   * antes de ordenar la transición al siguiente estado del mapa.
   */
  const handleValidatedNext = useCallback(async () => {
    const currentState = navigation.currentFlowState;
    const currentValues = getValues();

    // --- BLOQUE A: VALIDACIÓN DE CALIDAD DE CONTENIDO ---
    const textFields = [currentValues.solo_motivation, currentValues.question_to_answer, currentValues.legacy_lesson];
    const activeText = textFields.find(val => val && val.length > 0) || "";
    const wordCount = activeText.trim().split(/\s+/).filter(w => w.length > 0).length;

    if (['SOLO_TALK_INPUT', 'QUESTION_INPUT', 'LEGACY_INPUT'].includes(currentState)) {
      if (wordCount < 10) {
        toast({
          title: "Idea insuficiente",
          description: "Desarrolla tu idea con al menos 10 palabras para que la IA cree un guion de valor.",
          variant: "destructive"
        });
        return;
      }
    }

    // --- BLOQUE B: MAPEO DE CAMPOS PARA ZOD ---
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
      // --- BLOQUE C: TRANSICIÓN DETERMINISTA ---
      if (currentState === 'LINK_POINTS_INPUT') {
        await actions.generateNarratives(setNarrativeOptions);
      } else {
        const currentIndex = currentPath.indexOf(currentState);
        if (currentIndex !== -1 && (currentIndex + 1) < currentPath.length) {
          navigation.transitionTo(currentPath[currentIndex + 1]);
        } else if (currentIndex === -1) {
          console.error(`NicePod Flow Error: State [${currentState}] missing in current path.`);
        }
      }
    } else {
      toast({
        title: "Atención",
        description: "Completa los campos marcados para poder avanzar.",
        variant: "destructive"
      });
    }
  }, [navigation, getValues, trigger, toast, actions, currentPath]);

  /**
   * contextValue
   * Expone el estado y métodos de actualización a los componentes de cada paso.
   */
  const contextValue = {
    ...navigation,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => { },
    updateFormData: (data: any) => {
      Object.entries(data).forEach(([k, v]) => setValue(k as any, v, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
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

/**
 * PodcastCreationOrchestrator
 * Punto de entrada principal. Garantiza que el formulario y sus métodos
 * estén disponibles para todo el árbol de creación.
 */
export default function PodcastCreationOrchestrator() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      <InnerOrchestrator />
    </FormProvider>
  );
}