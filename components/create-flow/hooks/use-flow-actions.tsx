// components/create-flow/hooks/use-flow-actions.tsx
// VERSIÓN: 1.6 (Master Actions Engine - Loader Integration & Global Sync)

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

  // --- GENERAR BORRADOR (Incluye Transición al Loader) ---
  const generateDraft = useCallback(async () => {
    // 1. Activar pantalla de carga cognitiva
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
        raw_inputs: {
          ...data,
          topic: data.solo_topic || data.question_to_answer || data.link_topicA,
          motivation: data.solo_motivation || data.legacy_lesson,
        }
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !response?.success) throw new Error(response?.error || "Error en la estación de IA");

      // 2. Inyectar resultados en el formulario
      setValue('final_title', response.draft.suggested_title);
      setValue('final_script', response.draft.script_body);
      if (response.draft.sources) setValue('sources', response.draft.sources);

      // 3. Avanzar al editor
      transitionTo('SCRIPT_EDITING');
    } catch (err: any) {
      toast({ title: "Fallo Creativo", description: err.message, variant: "destructive" });
      goBack(); // Regresar al paso anterior si hay error
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, goBack, toast]);

  const handleSubmitProduction = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast({ title: "Datos incompletos", variant: "destructive" });
      return;
    }

    if (!supabase || !user) return;
    setIsSubmitting(true);
    try {
      const data = getValues();
      const { data: res, error } = await supabase.functions.invoke('queue-podcast-job', { body: { ...data } });
      if (error || !res?.success) throw new Error("Fallo en producción.");

      toast({ title: "¡Éxito!", description: "Generando audio...", action: <CheckCircle2 className="h-5 w-5 text-green-500" /> });
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
    isGenerating,
    isSubmitting
  };
}