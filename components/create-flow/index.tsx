// components/create-flow/index.tsx
// VERSIÓN: 29.0 (Master Sovereign - Contextual Validation & Strategic Feedback)

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
 * Gestiona la lógica de validación y transición de la FSM (Finite State Machine).
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
   * Validador estratégico. Determina requerimientos por paso y lanza feedback específico.
   */
  const handleValidatedNext = async () => {
    let fields: any[] = [];
    let customError: { title: string; description: string } | null = null;
    
    const state = navigation.currentFlowState;
    const currentValues = getValues();

    // 1. CONFIGURACIÓN DE REQUERIMIENTOS Y MENSAJES ESPECÍFICOS
    switch (state) {
      case 'SOLO_TALK_INPUT':
        fields = ['solo_topic', 'solo_motivation'];
        // Validación de densidad de palabras (Mínimo 10 palabras para calidad IA)
        const wordCount = currentValues.solo_motivation?.trim().split(/\s+/).length || 0;
        if (wordCount < 10 && currentValues.solo_motivation !== "") {
            customError = {
                title: "Idea poco desarrollada",
                description: "Para un audio de alta calidad, intenta describir tu idea con al menos 10 palabras."
            };
        }
        break;

      case 'DETAILS_STEP':
        fields = ['duration', 'narrativeDepth'];
        customError = {
            title: "Falta Configuración",
            description: "Define la duración y la profundidad del análisis para continuar."
        };
        break;

      case 'TONE_SELECTION':
        fields = ['agentName'];
        customError = {
            title: "Selecciona una Personalidad",
            description: "Elige cómo debe sonar la voz de la IA para este podcast."
        };
        break;

      case 'LINK_POINTS_INPUT':
        fields = ['link_topicA', 'link_topicB'];
        customError = {
            title: "Conceptos Incompletos",
            description: "Ingresa ambos temas para que la IA pueda establecer una conexión narrativa."
        };
        break;

      case 'QUESTION_INPUT':
        fields = ['question_to_answer'];
        customError = {
            title: "Pregunta ausente",
            description: "Escribe la duda o pregunta que el Agente IA debe resolver."
        };
        break;

      case 'LOCAL_DISCOVERY_STEP':
        fields = ['location', 'solo_topic'];
        customError = {
            title: "Sin Contexto Local",
            description: "Activa el GPS o describe tu ubicación para iniciar el escaneo situacional."
        };
        break;

      default:
        fields = [];
    }

    // 2. EJECUCIÓN DE VALIDACIÓN
    // Si ya detectamos un error personalizado (como el de las 10 palabras), no ejecutamos trigger
    if (customError && state === 'SOLO_TALK_INPUT' && !fields.every(f => !!currentValues[f as keyof PodcastCreationData])) {
        // Dejar que pase al trigger normal si los campos están vacíos
    } else if (customError && state === 'SOLO_TALK_INPUT') {
        const wordCount = currentValues.solo_motivation?.trim().split(/\s+/).length || 0;
        if (wordCount < 10) {
            toast({ title: customError.title, description: customError.description, variant: "destructive" });
            return;
        }
    }

    const isValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isValid) {
      // 3. LÓGICA DE TRANSICIÓN
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
      // 4. FEEDBACK DE ERROR ESTRATÉGICO
      toast({ 
        title: customError?.title || "Información Necesaria", 
        description: customError?.description || "Completa los campos requeridos para avanzar.", 
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
      // No ponemos defaults para duration y depth si queremos obligar al usuario a elegir
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <InnerOrchestrator />
    </FormProvider>
  );
}