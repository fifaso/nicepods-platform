// components/create-flow/hooks/use-flow-actions.tsx
// VERSIÓN: 1.8 (Atomic Transition Logic - Production Ready)

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

  const generateDraft = useCallback(async () => {
    // 1. Salto visual inmediato al Loader (Evita el modo híbrido)
    transitionTo('DRAFT_GENERATION_LOADER');
    setIsGenerating(true);

    try {
      const data = getValues();
      const payload = {
        purpose: data.purpose,
        style: data.style || 'solo',
        duration: data.duration,
        depth: data.narrativeDepth,
        tone: data.agentName || 'script-architect-v1',
        raw_inputs: { ...data }
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !response?.success) throw new Error(response?.error || "Error de red IA.");

      // 2. Hidratación de resultados
      setValue('final_title', response.draft.suggested_title, { shouldValidate: true });
      setValue('final_script', response.draft.script_body, { shouldValidate: true });
      if (response.draft.sources) setValue('sources', response.draft.sources);

      // 3. Transición al editor tras el éxito
      transitionTo('SCRIPT_EDITING');
    } catch (err: any) {
      toast({ title: "Fallo Creativo", description: err.message, variant: "destructive" });
      goBack(); // Retorno seguro para corregir
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, goBack, toast]);

  const handleSubmitProduction = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const data = getValues();
      const { data: res, error } = await supabase.functions.invoke('queue-podcast-job', { body: { ...data } });
      if (error || !res?.success) throw new Error("Fallo en cola.");
      router.push('/podcasts?tab=library');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [trigger, supabase, getValues, router, toast]);

  return { generateDraft, handleSubmitProduction, isGenerating, isSubmitting };
}