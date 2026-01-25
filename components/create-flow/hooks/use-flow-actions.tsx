// components/create-flow/hooks/use-flow-actions.ts
// VERSIÓN: 4.1 (Async Flow Actions - Handover Stability)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

interface UseFlowActionsProps {
  transitionTo: (state: string) => void;
  goBack: () => void;
  clearDraft: () => void;
}

export function useFlowActions({ transitionTo, goBack, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { getValues, setValue } = useFormContext<PodcastCreationData>();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateDraft = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);

    try {
      const values = getValues();
      const isPulse = values.purpose === 'pulse';

      // Invocamos la malla asíncrona que devuelve un 202 inmediatamente
      const { data, error } = await supabase.functions.invoke("generate-script-draft", {
        body: {
          ...values,
          selected_source_ids: isPulse ? values.pulse_source_ids : undefined
        },
      });

      if (error) throw new Error(error.message);

      if (data.success && data.draft_id) {
        // Establecemos el ID para que el Loader sepa a quién escuchar
        setValue("draft_id", data.draft_id);
        transitionTo("DRAFT_GENERATION_LOADER");
      }
    } catch (err: any) {
      toast({
        title: "Error de Malla",
        description: err.message || "Fallo al iniciar investigación.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, toast]);

  const handleSubmitProduction = useCallback(async () => {
    if (!user) return;
    setIsSubmitting(true);
    const values = getValues();

    try {
      const endpoint = values.purpose === 'pulse' ? "generate-briefing-pill" : "queue-podcast-job";
      const { data, error } = await supabase.functions.invoke(endpoint, { body: values });
      if (error) throw new Error(error.message);

      const finalId = data.podcast_id || data.pod_id;
      if (data.success && finalId) {
        router.push(`/podcast/${finalId}`);
        clearDraft();
      }
    } catch (err: any) {
      toast({ title: "Error en Producción", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, user, getValues, router, clearDraft, toast]);

  return {
    isGenerating,
    isSubmitting,
    generateDraft,
    handleSubmitProduction,
    deleteDraft: async (id: number) => {
      await supabase.from("podcast_drafts").delete().eq("id", id);
      router.refresh();
    }
  };
}