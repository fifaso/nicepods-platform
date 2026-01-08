// components/create-flow/hooks/use-flow-actions.tsx
// VERSIÓN: 2.3 (Master Actions - Full Hydration Integration)

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FlowState } from "../shared/types";
import { CheckCircle2 } from "lucide-react";
import { deleteDraftAction } from "@/actions/draft-actions";

interface UseFlowActionsProps {
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
  clearDraft: () => void;
}

export function useFlowActions({ transitionTo, goBack, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { getValues, setValue, trigger, reset } = useFormContext<PodcastCreationData>();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const packageInputs = (data: PodcastCreationData) => {
    return {
      duration: data.duration,
      narrativeDepth: data.narrativeDepth,
      voiceGender: data.voiceGender,
      voiceStyle: data.voiceStyle,
      voicePace: data.voicePace,
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

  /**
   * handleResumeDraft: El "Inyector de Memoria"
   * Transfiere los datos de la DB al estado de React Hook Form.
   */
  const handleResumeDraft = useCallback((draft: any) => {
    try {
      const { purpose, agentName, inputs } = draft.creation_data;

      // Limpiamos y re-hidratamos
      reset();

      // 1. Semilla
      Object.entries(inputs || {}).forEach(([k, v]) => {
        setValue(k as any, v);
      });

      // 2. Identidad
      setValue("purpose", purpose);
      setValue("agentName", agentName);

      // @ts-ignore
      setValue("draft_id", draft.id);

      // 3. Resultado de IA (Si ya existía guion)
      if (draft.script_text) {
        const parsed = typeof draft.script_text === 'string' ? JSON.parse(draft.script_text) : draft.script_text;
        setValue("final_title", draft.title);
        setValue("final_script", parsed.script_body || draft.script_text);
      }

      setValue("sources", draft.sources || []);

      toast({ title: "Borrador recuperado", description: `Continuando: ${draft.title}` });
      transitionTo('SCRIPT_EDITING'); // Salto directo al editor
    } catch (err) {
      toast({ title: "Error de hidratación", description: "El borrador está corrupto.", variant: "destructive" });
    }
  }, [reset, setValue, transitionTo, toast]);

  const generateDraft = useCallback(async () => {
    transitionTo('DRAFT_GENERATION_LOADER');
    setIsGenerating(true);
    try {
      const data = getValues();
      const payload = {
        user_id: user?.id,
        purpose: data.purpose,
        agentName: data.agentName || 'script-architect-v1',
        inputs: packageInputs(data)
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !response?.success) throw new Error(response?.error || "Fallo IA");

      // @ts-ignore
      setValue('draft_id', response.draft_id);
      setValue('final_title', response.draft.suggested_title);
      setValue('final_script', response.draft.script_body);
      if (response.draft.sources) setValue('sources', response.draft.sources);

      transitionTo('SCRIPT_EDITING');
    } catch (err: any) {
      toast({ title: "Fallo Creativo", description: err.message, variant: "destructive" });
      goBack();
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, goBack, toast]);

  const handleSubmitProduction = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) return;
    if (!supabase || !user) return;

    setIsSubmitting(true);
    try {
      const data = getValues();
      const payload = {
        // @ts-ignore
        draft_id: data.draft_id,
        purpose: data.purpose,
        agentName: data.agentName,
        final_title: data.final_title,
        final_script: data.final_script,
        sources: data.sources || [],
        inputs: packageInputs(data)
      };

      const { data: res, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
      if (error || !res?.success) throw new Error("Fallo en producción.");

      toast({ title: "¡Éxito!", description: "Generando audio final...", action: <CheckCircle2 className="h-5 w-5 text-green-500" /> });
      router.push('/podcasts?tab=library');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [trigger, supabase, user, getValues, router, toast]);

  const deleteDraft = useCallback(async (id: number) => {
    const result = await deleteDraftAction(id);
    if (result.success) {
      toast({ title: "Eliminado", description: result.message });
      // El revalidatePath en el action se encargará del resto
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  }, [toast]);

  return {
    generateDraft,
    handleSubmitProduction,
    handleResumeDraft, // Exportación clave
    deleteDraft,      // Exportación clave
    isGenerating,
    isSubmitting
  };
}