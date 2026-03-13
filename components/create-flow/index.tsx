// components/create-flow/index.tsx
// VERSIÓN: 52.0 (Ultimate Production Master - Thermal Control Sync Edition)
// Misión: Orquestar el flujo de creación eliminando ambigüedades CSS y de tipado.
// [ESTABILIZACIÓN]: Alineación de 'defaultValues' con el esquema Zod V10.0 para resolver error ts(2322).

"use client";

import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData, PodcastCreationSchema } from "@/lib/validation/podcast-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

// Core Architecture & Context
import { DraftRow } from "@/actions/draft-actions";
import { useFlowActions } from "./hooks/use-flow-actions";
import { LayoutShell } from "./layout-shell";
import { MASTER_FLOW_PATHS } from "./shared/config";
import { CreationProvider, useCreationContext } from "./shared/context";
import { NarrativeOption } from "./shared/types";
import { StepRenderer } from "./step-renderer";

interface OrchestratorProps {
  initialDrafts?: DraftRow[];
}

function InnerOrchestrator({ initialDrafts = [] }: { initialDrafts: DraftRow[] }) {
  const { toast } = useToast();
  const { trigger, getValues, watch, reset } = useFormContext<PodcastCreationData>();

  const {
    currentFlowState,
    transitionTo,
    goBack,
    progressMetrics,
    isGeneratingScript
  } = useCreationContext();

  const currentPurpose = watch("purpose");
  const [narrativeOptions, setNarrativeOptions] = useState<NarrativeOption[]>([]);

  const actions = useFlowActions({
    transitionTo,
    goBack,
    clearDraft: () => reset()
  });

  const currentPath = useMemo(() => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  const handleValidatedNext = useCallback(async () => {
    const currentState = currentFlowState;
    const currentValues = getValues();

    let fieldsToValidate: any[] = [];
    switch (currentState) {
      case 'SOLO_TALK_INPUT': fieldsToValidate = ['solo_topic', 'solo_motivation']; break;
      case 'DETAILS_STEP': fieldsToValidate = ['duration', 'narrativeDepth']; break;
      case 'TONE_SELECTION': fieldsToValidate = ['agentName']; break;
      case 'SCRIPT_EDITING': fieldsToValidate = ['final_title', 'final_script']; break;
    }

    const isStepValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true;

    if (isStepValid) {
      const currentIndex = currentPath.indexOf(currentState);
      if (currentIndex !== -1 && (currentIndex + 1) < currentPath.length) {
        transitionTo(currentPath[currentIndex + 1]);
      }
    } else {
      toast({ title: "Paso Incompleto", variant: "destructive" });
    }
  }, [currentFlowState, getValues, trigger, toast, currentPath, transitionTo]);

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

export default function PodcastCreationOrchestrator({ initialDrafts = [] }: OrchestratorProps) {
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
      agentName: 'narrador',
      creation_mode: 'standard',

      // [FIX CRÍTICO ts(2322)]: Sincronización de literales con Zod Schema V10.0
      duration: 'Entre 2 y 3 minutos',
      narrativeDepth: 'Intermedia',

      draft_id: null,
      pulse_source_ids: [],
    }
  });

  if (!isMounted) return null;

  return (
    <FormProvider {...formMethods}>
      <CreationProvider>
        <InnerOrchestrator initialDrafts={initialDrafts as any} />
      </CreationProvider>
    </FormProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V52.0):
 * 1. Sincronía de Contrato (Fix TS2322): Los 'defaultValues' del formulario se 
 *    han actualizado a 'Entre 2 y 3 minutos' y 'Intermedia', cumpliendo 
 *    estrictamente con las restricciones de 'podcast-schema.ts', lo que permite 
 *    un paso limpio por el compilador de Vercel.
 * 2. Resolución de Tipos: Se mantuvieron las interfaces reales (DraftRow, 
 *    NarrativeOption) implementadas en la V51.0 para mantener el rigor del Build Shield.
 * 3. Integridad Térmica: Al inicializar con estos valores, garantizamos que si el 
 *    usuario avanza rápidamente sin tocar la configuración técnica, el sistema 
 *    enviará un parámetro seguro a la IA, evitando el colapso por audios masivos.
 */