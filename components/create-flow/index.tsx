// components/create-flow/index.tsx
// VERSIÓN: 33.0 (Master Sovereign - Total Integrity & Navigation Shield)

"use client";

import React, { useState, useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useToast } from "@/hooks/use-toast";

// Imports de Arquitectura Modular
import { CreationContext } from "./shared/context";
import { useFlowNavigation } from "./hooks/use-flow-navigation";
import { useFlowActions } from "./hooks/use-flow-actions";
import { StepRenderer } from "./step-renderer";
import { LayoutShell } from "./layout-shell";
import { MASTER_FLOW_PATHS } from "./shared/config";

/**
 * InnerOrchestrator
 * Componente de lógica de control. Gestiona la transición entre pantallas
 * asegurando que los datos cumplan con el contrato de calidad de NicePod.
 */
function InnerOrchestrator() {
  const { toast } = useToast();
  const { trigger, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  // No usamos 'watch' para el propósito en la lógica de navegación para evitar stale closures
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // Inicialización de Hook de Navegación (currentPurpose se actualiza vía props)
  const navigation = useFlowNavigation({ currentPurpose: getValues("purpose") });
  
  // Inicialización de Hook de Acciones (IA y Backend)
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    goBack: navigation.goBack,
    clearDraft: () => {} 
  });

  /**
   * handleValidatedNext
   * El guardián del flujo. Valida el paso actual y decide el destino exacto.
   */
  const handleValidatedNext = async () => {
    const currentState = navigation.currentFlowState;
    const currentValues = getValues();
    const currentPurpose = currentValues.purpose;
    
    let fieldsToValidate: any[] = [];

    // --- FASE 1: BLOQUEOS DE CALIDAD (BUSINESS LOGIC) ---
    if (currentState === 'SOLO_TALK_INPUT' || currentState === 'QUESTION_INPUT' || currentState === 'LEGACY_INPUT') {
      const content = currentValues.solo_motivation || currentValues.question_to_answer || currentValues.legacy_lesson || "";
      const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
      
      if (wordCount < 10) {
        toast({ 
          title: "Falta sustancia", 
          description: "Desarrolla tu idea con al menos 10 palabras para que la IA cree un guion de valor.", 
          variant: "destructive" 
        });
        return;
      }
    }

    if (currentState === 'SCRIPT_EDITING') {
      if (!currentValues.final_title || currentValues.final_title.length < 5) {
        toast({ title: "Título requerido", description: "El podcast necesita un nombre para ser procesado.", variant: "destructive" });
        return;
      }
    }

    // --- FASE 2: DEFINICIÓN DE CAMPOS PARA ZOD ---
    switch (currentState) {
      case 'SOLO_TALK_INPUT': fieldsToValidate = ['solo_topic', 'solo_motivation']; break;
      case 'LEARN_SUB_SELECTION': fieldsToValidate = ['agentName', 'style']; break;
      case 'DETAILS_STEP': fieldsToValidate = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fieldsToValidate = ['agentName']; break;
      case 'SCRIPT_EDITING': fieldsToValidate = ['final_title', 'final_script']; break;
      case 'AUDIO_STUDIO_STEP': fieldsToValidate = ['voiceGender', 'voiceStyle', 'voicePace', 'speakingRate']; break;
      case 'ARCHETYPE_SELECTION': fieldsToValidate = ['selectedArchetype']; break;
      case 'ARCHETYPE_GOAL': fieldsToValidate = ['archetype_topic', 'archetype_goal']; break;
      default: fieldsToValidate = [];
    }

    // --- FASE 3: VALIDACIÓN Y TRANSICIÓN ---
    const isStepValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true;

    if (isStepValid) {
      // Manejo de estados asíncronos (IA)
      if (currentState === 'LINK_POINTS_INPUT') {
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          // Lógica de navegación determinista basada en Config
          const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
          const currentIndex = path.indexOf(currentState);
          
          if (currentIndex !== -1 && (currentIndex + 1) < path.length) {
            const nextState = path[currentIndex + 1];
            navigation.transitionTo(nextState);
          } else if (currentIndex === -1) {
            console.error(`CRITICAL: State [${currentState}] not found in [${currentPurpose}] path. Reset prevented.`);
            // En lugar de resetear, forzamos la vuelta al paso de Propósito si algo falla gravemente
            // pero NO lo hacemos automáticamente para no arruinar la experiencia del usuario.
          }
      }
    } else {
      toast({ title: "Información incompleta", description: "Revisa los campos marcados antes de continuar.", variant: "destructive" });
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

/**
 * PodcastCreationOrchestrator
 * Wrapper principal. Garantiza la existencia del FormContext.
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