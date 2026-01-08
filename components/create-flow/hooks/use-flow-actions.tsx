// components/create-flow/hooks/use-flow-actions.tsx
// VERSIÓN: 2.1 (Master Actions Engine - Total Feature Restoration)

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FlowState } from "../shared/types";
import { CheckCircle2 } from "lucide-react";

interface UseFlowActionsProps {
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
  clearDraft: () => void;
}

export function useFlowActions({ transitionTo, goBack, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { getValues, setValue, trigger } = useFormContext<PodcastCreationData>();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * packageInputs: Centraliza la materia prima para la IA
   */
  const packageInputs = (data: PodcastCreationData) => {
    return {
      duration: data.duration,
      narrativeDepth: data.narrativeDepth,
      voiceGender: data.voiceGender,
      voiceStyle: data.voiceStyle,
      speakingRate: data.speakingRate,
      location: data.location,
      discovery_context: data.discovery_context,
      imageContext: data.imageContext,
      solo_topic: data.solo_topic,
      solo_motivation: data.solo_motivation,
      link_topicA: data.link_topicA,
      link_topicB: data.link_topicB,
      link_catalyst: data.link_catalyst,
      link_selectedNarrative: data.link_selectedNarrative,
      question_to_answer: data.question_to_answer,
      legacy_lesson: data.legacy_lesson,
      selectedArchetype: data.selectedArchetype,
      archetype_goal: data.archetype_goal
    };
  };

  // --- 1. ANALIZAR ENTORNO LOCAL (Restaurado) ---
  const analyzeLocalEnvironment = useCallback(async () => {
    const data = getValues();
    if (!data.location && !data.imageContext) {
      toast({ title: "Faltan Sensores", description: "GPS o Foto requeridos.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: res, error } = await supabase.functions.invoke('get-local-discovery', {
        body: {
          latitude: data.location?.latitude || 0,
          longitude: data.location?.longitude || 0,
          lens: data.selectedTone || 'Tesoros Ocultos',
          image_base64: data.imageContext
        }
      });

      if (error || !res?.success) throw new Error(res?.error || "Fallo en descubrimiento.");

      setValue('discovery_context', res.dossier, { shouldValidate: true });
      setValue('sources', res.sources || [], { shouldValidate: true });
      setValue('solo_topic', res.poi || "Descubrimiento Local", { shouldValidate: true });
      setValue('agentName', 'local-concierge-v1', { shouldValidate: true });

      toast({ title: "¡Entorno Sincronizado!", description: `Lugar: ${res.poi}` });
      transitionTo('LOCAL_RESULT_STEP');
    } catch (err: any) {
      toast({ title: "Error de Análisis", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, toast]);

  // --- 2. GENERAR NARRATIVAS (Restaurado) ---
  const generateNarratives = useCallback(async (callback: (data: any[]) => void) => {
    const { link_topicA, link_topicB, link_catalyst } = getValues();
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: link_topicA, topicB: link_topicB, catalyst: link_catalyst }
      });
      if (error) throw error;
      if (data?.narratives) {
        callback(data.narratives);
        transitionTo('NARRATIVE_SELECTION');
      }
    } catch {
      toast({ title: "Error", description: "Fallo al conectar ideas.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, transitionTo, toast]);

  // --- 3. GENERAR BORRADOR ---
  const generateDraft = useCallback(async () => {
    transitionTo('DRAFT_GENERATION_LOADER');
    setIsGenerating(true);
    try {
      const data = getValues();
      const payload = {
        purpose: data.purpose,
        agentName: data.agentName || 'script-architect-v1',
        inputs: packageInputs(data)
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !response?.success) throw new Error(response?.error || "IA fuera de servicio.");

      setValue('final_title', response.draft.suggested_title, { shouldValidate: true });
      setValue('final_script', response.draft.script_body, { shouldValidate: true });
      if (response.draft.sources) setValue('sources', response.draft.sources, { shouldValidate: true });

      transitionTo('SCRIPT_EDITING');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      goBack();
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, goBack, toast]);

  // --- 4. ENVÍO A PRODUCCIÓN ---
  const handleSubmitProduction = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) return;
    if (!supabase || !user) return;

    setIsSubmitting(true);
    try {
      const data = getValues();
      const payload = {
        purpose: data.purpose,
        agentName: data.agentName,
        final_title: data.final_title,
        final_script: data.final_script,
        sources: data.sources || [],
        inputs: packageInputs(data)
      };

      const { data: res, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
      if (error || !res?.success) throw new Error("Fallo en cola.");

      router.push('/podcasts?tab=library');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [trigger, supabase, user, getValues, router, toast]);

  return {
    generateDraft,
    handleSubmitProduction,
    analyzeLocalEnvironment,
    generateNarratives,
    isGenerating,
    isSubmitting
  };
}