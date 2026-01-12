// components/create-flow/index.tsx
// VERSIÓN: 47.0 (Master Sovereign - Total Navigation & Audio Performance Sync)

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
 * PROPS: PodcastCreationOrchestrator
 * Recibe los borradores iniciales desde el servidor para la hidratación.
 */
interface OrchestratorProps {
  initialDrafts?: any[];
}

/**
 * InnerOrchestrator
 * Implementa la lógica de control de flujo, validación de negocio y 
 * distribución de contexto para todos los sub-pasos.
 */
function InnerOrchestrator({ initialDrafts = [] }: { initialDrafts: any[] }) {
  const { toast } = useToast();
  const { trigger, setValue, getValues, watch, reset } = useFormContext<PodcastCreationData>();

  // Observamos el propósito para reaccionar a cambios de rama en tiempo real
  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // 1. INICIALIZACIÓN DE MOTORES
  const navigation = useFlowNavigation({ currentPurpose });

  // Memorizamos las acciones de navegación para evitar recreaciones que rompan el ciclo de vida
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

  // 2. RESOLUCIÓN DEL MAPA DE RUTA ACTUAL
  const currentPath = useMemo(() => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  /**
   * handleValidatedNext
   * El guardián del flujo. Valida la integridad del paso actual y decide 
   * el destino exacto basándose en el mapa de configuración.
   */
  const handleValidatedNext = useCallback(async () => {
    const currentState = navigation.currentFlowState;
    const currentValues = getValues();

    // --- BLOQUE A: VALIDACIÓN DE CALIDAD DE CONTENIDO (Mínimo 10 palabras) ---
    if (['SOLO_TALK_INPUT', 'QUESTION_INPUT', 'LEGACY_INPUT'].includes(currentState)) {
      const content = currentValues.solo_motivation || currentValues.question_to_answer || currentValues.legacy_lesson || "";
      const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

      if (wordCount < 10) {
        toast({
          title: "Desarrolla más tu idea",
          description: "La IA de NicePod requiere al menos 10 palabras para garantizar una síntesis de valor.",
          variant: "destructive"
        });
        return;
      }
    }

    // --- BLOQUE B: MAPEO DE CAMPOS PARA VALIDACIÓN TÉCNICA (ZOD) ---
    let fields: any[] = [];
    switch (currentState) {
      case 'SOLO_TALK_INPUT': fields = ['solo_topic', 'solo_motivation']; break;
      case 'DETAILS_STEP': fields = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fields = ['agentName']; break;
      case 'SCRIPT_EDITING': fields = ['final_title', 'final_script']; break;
      case 'LINK_POINTS_INPUT': fields = ['link_topicA', 'link_topicB']; break;
      case 'ARCHETYPE_GOAL': fields = ['archetype_topic', 'archetype_goal']; break;
    }

    const isStepValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isStepValid) {
      // --- BLOQUE C: TRANSICIÓN DETERMINISTA ---
      if (currentState === 'LINK_POINTS_INPUT') {
        // Disparo asíncrono para generar narrativas de conexión
        await (actions as any).generateNarratives(setNarrativeOptions);
      } else {
        const currentIndex = currentPath.indexOf(currentState);
        if (currentIndex !== -1 && (currentIndex + 1) < currentPath.length) {
          navigation.transitionTo(currentPath[currentIndex + 1]);
        } else if (currentIndex === -1) {
          console.error(`NicePod Logic Error: State [${currentState}] missing in current path.`);
        }
      }
    } else {
      toast({
        title: "Atención",
        description: "Completa los campos requeridos para continuar.",
        variant: "destructive"
      });
    }
  }, [navigation, getValues, trigger, toast, actions, currentPath]);

  /**
   * contextValue
   * Inyectamos las funciones corregidas para cumplir con CreationContextType v1.5
   */
  const contextValue = {
    ...navigation,
    onNext: handleValidatedNext, // Inyectamos el disparador de validación
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => { },
    updateFormData: (data: any) => {
      Object.entries(data).forEach(([k, v]) => setValue(k as any, v, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      }));
    },
    getMasterPath: () => currentPath
  };

  return (
    <CreationContext.Provider value={contextValue}>
      <LayoutShell
        onNext={handleValidatedNext}
        onDraft={actions.generateDraft}
        onProduce={actions.handleSubmitProduction}
        onAnalyzeLocal={(actions as any).analyzeLocalEnvironment}
        isGenerating={actions.isGenerating}
        isSubmitting={actions.isSubmitting}
        progress={navigation.progressMetrics}
      >
        {/* StepRenderer recibe los borradores y las opciones de narrativa */}
        <StepRenderer
          narrativeOptions={narrativeOptions}
          initialDrafts={initialDrafts}
        />
      </LayoutShell>
    </CreationContext.Provider>
  );
}

/**
 * PodcastCreationOrchestrator
 * Componente raíz. Inicializa React Hook Form con PodcastCreationSchema v5.2
 */
export default function PodcastCreationOrchestrator({ initialDrafts = [] }: OrchestratorProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Hidratación segura para Next.js App Router
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      draft_id: null // Inicializado como nulo para trazabilidad de hidratación
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator initialDrafts={initialDrafts} />
    </FormProvider>
  );
}