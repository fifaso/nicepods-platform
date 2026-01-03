// components/create-flow/index.tsx
// VERSIÓN: 30.0 (Master Sovereign - Hard Locking & Word Count Enforcement)

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
 * Gestiona la lógica de bloqueo y transición de la FSM.
 */
function InnerOrchestrator() {
  const { toast } = useToast();
  const { watch, trigger, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  const navigation = useFlowNavigation({ currentPurpose });
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    clearDraft: () => {} 
  });

  /**
   * handleValidatedNext
   * SISTEMA DE BLOQUEO CRÍTICO:
   * Evalúa condiciones de negocio antes de permitir el cambio de estado.
   */
  const handleValidatedNext = async () => {
    const state = navigation.currentFlowState;
    const currentValues = getValues();
    let isValid = false;

    // --- BLOQUE 1: VALIDACIÓN IMPERATIVA POR ESTADO ---
    // Si no se cumple, se lanza el toast y se hace RETURN (bloqueo físico)
    
    if (state === 'SOLO_TALK_INPUT') {
      const motivation = currentValues.solo_motivation || "";
      const wordCount = motivation.trim().split(/\s+/).filter(word => word.length > 0).length;

      if (wordCount < 10) {
        toast({ 
          title: "Idea poco desarrollada", 
          description: "Para un audio de alta calidad, describe tu idea con al menos 10 palabras.", 
          variant: "destructive" 
        });
        return; // BLOQUEO: No avanza
      }
    }

    if (state === 'DETAILS_STEP') {
      // Validamos presencia real de duración y profundidad
      if (!currentValues.duration || !currentValues.narrativeDepth) {
        toast({ 
          title: "Falta Configuración", 
          description: "Define la duración y la profundidad del análisis para continuar.", 
          variant: "destructive" 
        });
        return; // BLOQUEO
      }
    }

    if (state === 'TONE_SELECTION') {
      if (!currentValues.agentName || currentValues.agentName === "") {
        toast({ 
          title: "Selecciona una Personalidad", 
          description: "Elige cómo debe sonar la voz de la IA para este podcast.", 
          variant: "destructive" 
        });
        return; // BLOQUEO
      }
    }

    if (state === 'LINK_POINTS_INPUT') {
      if (!currentValues.link_topicA || !currentValues.link_topicB) {
        toast({ 
          title: "Conceptos Incompletos", 
          description: "Ingresa ambos temas para que la IA pueda establecer una conexión narrativa.", 
          variant: "destructive" 
        });
        return; // BLOQUEO
      }
    }

    if (state === 'QUESTION_INPUT') {
      if (!currentValues.question_to_answer || currentValues.question_to_answer.length < 5) {
        toast({ 
          title: "Pregunta ausente", 
          description: "Escribe la duda o pregunta que el Agente IA debe resolver.", 
          variant: "destructive" 
        });
        return; // BLOQUEO
      }
    }

    if (state === 'LOCAL_DISCOVERY_STEP') {
      if (!currentValues.location && !currentValues.solo_topic) {
        toast({ 
          title: "Sin Contexto Local", 
          description: "Activa el GPS o describe tu ubicación para iniciar el escaneo situacional.", 
          variant: "destructive" 
        });
        return; // BLOQUEO
      }
    }

    // --- BLOQUE 2: VALIDACIÓN DE ESQUEMA (ZOD) ---
    // Mapeo selectivo de campos para el trigger de Zod
    let fieldsToTrigger: any[] = [];
    switch (state) {
        case 'SOLO_TALK_INPUT': fieldsToTrigger = ['solo_topic', 'solo_motivation']; break;
        case 'LEARN_SUB_SELECTION': fieldsToTrigger = ['agentName', 'style']; break;
        case 'ARCHETYPE_SELECTION': fieldsToTrigger = ['selectedArchetype']; break;
        case 'ARCHETYPE_GOAL': fieldsToTrigger = ['archetype_topic', 'archetype_goal']; break;
        case 'DETAILS_STEP': fieldsToTrigger = ['duration', 'narrativeDepth']; break;
        case 'TONE_SELECTION': fieldsToTrigger = ['agentName', 'voiceGender', 'voiceStyle']; break;
        case 'LEGACY_INPUT': fieldsToTrigger = ['legacy_lesson']; break;
    }

    isValid = fieldsToTrigger.length > 0 ? await trigger(fieldsToTrigger as any) : true;

    // --- BLOQUE 3: TRANSICIÓN FINAL ---
    if (isValid) {
      if (state === 'LINK_POINTS_INPUT') {
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
          const nextIndex = (path as string[]).indexOf(state) + 1;
          
          if (nextIndex < path.length) {
            navigation.transitionTo(path[nextIndex]);
          }
      }
    } else {
      toast({ 
        title: "Información Requerida", 
        description: "Revisa los campos marcados antes de continuar.", 
        variant: "destructive" 
      });
    }
  };

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
      inputs: {},
      creation_mode: 'standard',
      voiceGender: 'Masculino',
      voiceStyle: 'Profesional',
      // NOTA: Eliminamos defaults de duration y narrativeDepth 
      // para forzar al usuario a seleccionar y que el bloqueo funcione.
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator />
    </FormProvider>
  );
}