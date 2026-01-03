// components/create-flow/index.tsx
// VERSIÓN: 28.0 (Master Sovereign - Unabbreviated Production Shield)

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
 * Componente de lógica interna. Consume el FormContext de su padre y gestiona
 * la Máquina de Estados Finitos (FSM) del flujo creativo.
 */
function InnerOrchestrator() {
  const { toast } = useToast();
  const { watch, trigger, setValue } = useFormContext<PodcastCreationData>();
  
  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // 1. Inicialización de Motores (Navegación y Acciones IA)
  const navigation = useFlowNavigation({ currentPurpose });
  const actions = useFlowActions({ 
    transitionTo: navigation.transitionTo, 
    clearDraft: () => {} 
  });

  /**
   * handleValidatedNext
   * Puerta de enlace crítica. Valida quirúrgicamente los campos del paso actual
   * mediante el esquema Zod antes de permitir el tránsito al siguiente estado.
   */
  const handleValidatedNext = async () => {
    let fields: any[] = [];
    const state = navigation.currentFlowState;

    // MAPEO DE INTEGRIDAD POR ESTADO
    switch (state) {
      case 'SOLO_TALK_INPUT':
        fields = ['solo_topic', 'solo_motivation'];
        break;
      case 'LEARN_SUB_SELECTION':
        fields = ['agentName', 'style'];
        break;
      case 'ARCHETYPE_SELECTION':
        fields = ['selectedArchetype'];
        break;
      case 'ARCHETYPE_GOAL':
        fields = ['archetype_topic', 'archetype_goal'];
        break;
      case 'LINK_POINTS_INPUT':
        fields = ['link_topicA', 'link_topicB', 'link_catalyst'];
        break;
      case 'DETAILS_STEP':
        fields = ['duration', 'narrativeDepth'];
        break;
      case 'TONE_SELECTION':
        fields = ['agentName', 'voiceGender', 'voiceStyle'];
        break;
      case 'LEGACY_INPUT':
        fields = ['legacy_lesson'];
        break;
      case 'QUESTION_INPUT':
        fields = ['question_to_answer'];
        break;
      case 'LOCAL_DISCOVERY_STEP':
        // Validamos que exista una semilla para la IA Situacional
        fields = ['location', 'solo_topic'];
        break;
      default:
        // Pasos puramente informativos o de visualización no requieren validación de campos
        fields = [];
    }

    // Ejecución de la validación asíncrona de React Hook Form
    const isValid = fields.length > 0 ? await trigger(fields as any) : true;

    if (isValid) {
      // Caso Especial: Transición asíncrona por Generación de IA
      if (state === 'LINK_POINTS_INPUT') {
          // Si el usuario termina de ingresar sus dos ideas, generamos narrativas antes de avanzar
          // @ts-ignore
          await actions.generateNarratives(setNarrativeOptions);
      } else {
          // Navegación secuencial estándar
          const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
          const nextIndex = (path as string[]).indexOf(state) + 1;
          
          if (nextIndex < path.length) {
            navigation.transitionTo(path[nextIndex]);
          }
      }
    } else {
      // Feedback de alta visibilidad para el usuario
      toast({ 
        title: "Contexto Incompleto", 
        description: "Completa los campos marcados para que la IA pueda procesar tu idea.", 
        variant: "destructive" 
      });
    }
  };

  /**
   * contextValue
   * Objeto de comunicación compartido con todos los 'steps' vía CreationContext.
   */
  const contextValue = {
    ...navigation,
    isGeneratingScript: actions.isGenerating,
    setIsGeneratingScript: () => {}, // Placeholder para extensiones futuras
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
 * Entry Point del flujo de creación. Provee el FormProvider global
 * asegurando la persistencia de datos entre montajes de componentes dinámicos.
 */
export default function PodcastCreationOrchestrator() {
  const [isMounted, setIsMounted] = useState(false);

  // Garantizamos hidratación segura en Next.js App Router
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