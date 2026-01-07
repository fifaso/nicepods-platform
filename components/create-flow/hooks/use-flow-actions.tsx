// components/create-flow/hooks/use-flow-actions.tsx
// VERSIÓN: 1.9 (Data Provenance Engine - Structured Packaging)

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
   * [NUEVO] Motor de Empaquetado: packageInputs
   * Centraliza la lógica de "qué datos son semilla" según el flujo.
   */
  const packageInputs = (data: PodcastCreationData) => {
    return {
      // Datos transversales
      duration: data.duration,
      narrativeDepth: data.narrativeDepth,
      voiceGender: data.voiceGender,
      voiceStyle: data.voiceStyle,
      speakingRate: data.speakingRate,
      // Datos situacionales (si existen)
      location: data.location,
      discovery_context: data.discovery_context,
      imageContext: data.imageContext,
      // Datos específicos de rama
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

  // --- GENERAR BORRADOR ---
  const generateDraft = useCallback(async () => {
    transitionTo('DRAFT_GENERATION_LOADER');
    setIsGenerating(true);

    try {
      const data = getValues();
      const payload = {
        purpose: data.purpose,
        agentName: data.agentName || 'script-architect-v1',
        inputs: packageInputs(data) // <--- EMPAQUETADO ESTRUCTURADO
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !response?.success) throw new Error(response?.error || "Error de red IA.");

      setValue('final_title', response.draft.suggested_title, { shouldValidate: true });
      setValue('final_script', response.draft.script_body, { shouldValidate: true });
      if (response.draft.sources) setValue('sources', response.draft.sources, { shouldValidate: true });

      transitionTo('SCRIPT_EDITING');
    } catch (err: any) {
      toast({ title: "Fallo Creativo", description: err.message, variant: "destructive" });
      goBack();
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, goBack, toast]);

  // --- ENVÍO A PRODUCCIÓN ---
  const handleSubmitProduction = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) {
        toast({ title: "Datos incompletos", description: "Revisa los campos antes de producir.", variant: "destructive" });
        return;
    }

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
        inputs: packageInputs(data) // <--- GARANTÍA DE CUSTODIA DE DATOS
      };

      const { data: res, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
      if (error || !res?.success) throw new Error(res?.error || "Fallo en la cola de producción.");

      toast({ 
        title: "¡Producción Iniciada!", 
        description: "Tu audio estará listo en unos segundos.", 
        action: <CheckCircle2 className="h-5 w-5 text-green-500" /> 
      });
      
      router.push('/podcasts?tab=library');
    } catch (err: any) {
      toast({ title: "Error Crítico", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [trigger, supabase, user, getValues, router, toast]);

  return { generateDraft, handleSubmitProduction, isGenerating, isSubmitting };
}