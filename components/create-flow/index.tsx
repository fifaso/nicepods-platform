// components/create-flow/index.tsx
// VERSIÓN: 50.0 (Ultimate Production Master - Type Sync & Zero Error Deployment)

"use client";

import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData, PodcastCreationSchema } from "@/lib/validation/podcast-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

// Core Architecture & Context
import { useFlowActions } from "./hooks/use-flow-actions";
import { LayoutShell } from "./layout-shell";
import { MASTER_FLOW_PATHS } from "./shared/config";
import { CreationProvider, useCreationContext } from "./shared/context";
import { FlowState } from "./shared/types";
import { StepRenderer } from "./step-renderer";

/**
 * INTERFAZ DE PROPIEDADES (Resolución Error ts2304)
 */
interface OrchestratorProps {
  initialDrafts?: any[];
}

/**
 * InnerOrchestrator
 * Implementa la lógica operativa consumiendo el CreationProvider.
 * Gestiona la validación de pasos y el disparo de acciones de backend.
 */
function InnerOrchestrator({ initialDrafts = [] }: { initialDrafts: any[] }) {
  const { toast } = useToast();
  const { trigger, getValues, watch, reset } = useFormContext<PodcastCreationData>();

  // Consumimos el contexto unificado (Resolución Error ts2339)
  const {
    currentFlowState,
    transitionTo,
    goBack,
    progressMetrics,
    isGeneratingScript
  } = useCreationContext();

  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);

  // Inicialización de Acciones (Borradores, Producción, Geo)
  const actions = useFlowActions({
    transitionTo,
    goBack,
    clearDraft: () => reset()
  });

  // Resolución de la ruta maestra para el flujo actual
  const currentPath = useMemo(() => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  /**
   * handleValidatedNext
   * El guardián del flujo. Valida la integridad del paso actual (Zod)
   * antes de permitir la transición al siguiente hito.
   */
  const handleValidatedNext = useCallback(async () => {
    const currentState = currentFlowState;
    const currentValues = getValues();

    // --- BLOQUE 1: VALIDACIÓN DE DENSIDAD COGNITIVA ---
    const textPhases: FlowState[] = ['SOLO_TALK_INPUT', 'LEGACY_INPUT', 'DNA_CHECK'];
    if (textPhases.includes(currentState)) {
      const content = currentValues.solo_motivation || currentValues.legacy_lesson || currentValues.dna_interview || "";
      const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

      if (wordCount < 10) {
        toast({
          title: "Sustancia insuficiente",
          description: "La IA de NicePod requiere al menos 10 palabras para generar una síntesis de valor estratégico.",
          variant: "destructive"
        });
        return;
      }
    }

    // --- BLOQUE 2: MAPEO DE CAMPOS POR ESTADO (STRICT VALIDATION) ---
    let fieldsToValidate: any[] = [];
    switch (currentState) {
      case 'SOLO_TALK_INPUT':
        fieldsToValidate = ['solo_topic', 'solo_motivation']; break;
      case 'DNA_CHECK':
        fieldsToValidate = ['dna_interview', 'expertise_level']; break;
      case 'PULSE_RADAR':
        fieldsToValidate = ['pulse_source_ids']; break;
      case 'LOCAL_DISCOVERY_STEP':
        fieldsToValidate = ['location']; break;
      case 'DETAILS_STEP':
        fieldsToValidate = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION':
        fieldsToValidate = ['agentName']; break;
      case 'SCRIPT_EDITING':
      case 'BRIEFING_SANITIZATION':
        fieldsToValidate = ['final_title', 'final_script']; break;
      case 'LINK_POINTS_INPUT':
        fieldsToValidate = ['link_topicA', 'link_topicB']; break;
    }

    const isStepValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true;

    if (isStepValid) {
      // --- BLOQUE 3: LÓGICA DE TRANSICIÓN ---
      if (currentState === 'LINK_POINTS_INPUT') {
        // Disparo de inteligencia para flujo Explore
        if ((actions as any).generateNarratives) {
          await (actions as any).generateNarratives(setNarrativeOptions);
        }
      } else {
        const currentIndex = currentPath.indexOf(currentState);
        if (currentIndex !== -1 && (currentIndex + 1) < currentPath.length) {
          transitionTo(currentPath[currentIndex + 1]);
        }
      }
    } else {
      toast({
        title: "Paso Incompleto",
        description: "Asegúrate de completar los campos obligatorios para continuar.",
        variant: "destructive"
      });
    }
  }, [currentFlowState, getValues, trigger, toast, actions, currentPath, transitionTo]);

  return (
    <LayoutShell
      onNext={handleValidatedNext}
      onDraft={actions.generateDraft}
      onProduce={actions.handleSubmitProduction}
      onAnalyzeLocal={actions.analyzeLocalEnvironment}
      isGenerating={isGeneratingScript || actions.isGenerating}
      isSubmitting={actions.isSubmitting}
      progress={progressMetrics}
    >
      <StepRenderer
        narrativeOptions={narrativeOptions}
        initialDrafts={initialDrafts}
      />
    </LayoutShell>
  );
}

/**
 * PodcastCreationOrchestrator
 * Componente raíz que inicializa el formulario y los proveedores de estado.
 */
export default function PodcastCreationOrchestrator({ initialDrafts = [] }: OrchestratorProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Evita problemas de hidratación en Server Components
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
      draft_id: null,
      pulse_source_ids: [],
      is_sovereign_public: false
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <CreationProvider>
        <InnerOrchestrator initialDrafts={initialDrafts} />
      </CreationProvider>
    </FormProvider>
  );
}