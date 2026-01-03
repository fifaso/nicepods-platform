// components/create-flow/index.tsx
// VERSIÓN: 32.0 (Master Sovereign - Production Ready Journey Orchestrator)

"use client";

import React, { useState, useEffect } from "react";
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
 */
function InnerOrchestrator() {
  const { toast } = useToast();
  const { watch, trigger, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // Motores de navegación y acciones IA
  const navigation = useFlowNavigation({ currentPurpose });
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    goBack: navigation.goBack,
    clearDraft: () => {} 
  });

  /**
   * handleValidatedNext
   * Gestiona el botón "SIGUIENTE" con validación de negocio y técnica.
   */
  const handleValidatedNext = async () => {
    const state = navigation.currentFlowState;
    const currentValues = getValues();
    let fields: any[] = [];

    // --- BLOQUE 1: VALIDACIÓN DE REQUISITOS DE NEGOCIO (HARD LOCK) ---
    
    // Validación de densidad de palabras en ideas
    if (state === 'SOLO_TALK_INPUT' || state === 'QUESTION_INPUT' || state === 'LEGACY_INPUT') {
      const motivation = currentValues.solo_motivation || currentValues.question_to_answer || currentValues.legacy_lesson || "";
      const wordCount = motivation.trim().split(/\s+/).filter(w => w.length > 0).length;
      
      if (wordCount < 10) {
        toast({ 
          title: "Desarrolla más tu idea", 
          description: "La IA necesita al menos 10 palabras para captar la esencia de tu podcast.", 
          variant: "destructive" 
        });
        return; // Detener flujo
      }
    }

    // Validación de edición de guion
    if (state === 'SCRIPT_EDITING') {
      if (!currentValues.final_title || currentValues.final_title.length < 5) {
        toast({ title: "Título necesario", description: "Define un título atractivo para tu pieza.", variant: "destructive" });
        return;
      }
      if (!currentValues.final_script || currentValues.final_script.length < 50) {
        toast({ title: "Guion incompleto", description: "El guion debe tener una estructura mínima para ser procesado.", variant: "destructive" });
        return;
      }
    }

    // --- BLOQUE 2: MAPEO DE CAMPOS PARA VALIDACIÓN TÉCNICA (ZOD) ---
    switch (state) {
      case 'SOLO_TALK_INPUT': fields = ['solo_topic', 'solo_motivation']; break;
      case 'LEARN_SUB_SELECTION': fields = ['agentName', 'style']; break;
      case 'DETAILS_STEP': fields = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fields = ['agentName']; break;
      case 'SCRIPT_EDITING': fields = ['final_title', 'final_script']; break;
      case 'AUDIO_STUDIO_STEP': fields = ['voiceGender', 'voiceStyle', 'voicePace', 'speakingRate']; break;
      default: fields = [];
    }

    // Ejecutamos validación asíncrona de Zod
    const isValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isValid) {
      // --- BLOQUE 3: CÁLCULO DE TRANSICIÓN SEGÚN MAPA ESTRATÉGICO ---
      if (state === 'LINK_POINTS_INPUT') {
          // Caso especial: Disparador de IA antes de avanzar
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
          const currentIndex = (path as string[]).indexOf(state);
          const nextIndex = currentIndex + 1;
          
          if (currentIndex !== -1 && nextIndex < path.length) {
            navigation.transitionTo(path[nextIndex]);
          } else {
            console.error(`NicePod Flow Error: No exit path found for state [${state}] in purpose [${currentPurpose}]`);
          }
      }
    } else {
      toast({ 
        title: "Información Requerida", 
        description: "Completa las opciones marcadas para poder avanzar.", 
        variant: "destructive" 
      });
    }
  };

  /**
   * contextValue
   * Inyección de métodos y estados para todos los componentes hijos (Steps).
   */
  const contextValue = {
    ...navigation,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => {}, 
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
 * Componente raíz que inicializa el estado del formulario y la hidratación.
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
      // No duration ni narrativeDepth para forzar selección en DETAILS_STEP
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator />
    </FormProvider>
  );
}