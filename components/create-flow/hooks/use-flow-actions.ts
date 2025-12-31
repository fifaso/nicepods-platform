// components/create-flow/hooks/use-flow-actions.ts
// VERSIÓN: 1.1 (Master Actions - Added Narrative Generation)

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FlowState } from "../shared/types";

interface UseFlowActionsProps {
  transitionTo: (state: FlowState) => void;
  clearDraft: () => void;
}

export function useFlowActions({ transitionTo, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { getValues, setValue } = useFormContext<PodcastCreationData>();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ACCIÓN: GENERAR NARRATIVAS (PARA EXPLORAR) ---
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
      toast({ title: "Error", description: "No se pudieron conectar las ideas.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, transitionTo, toast]);

  // --- ACCIÓN: GENERAR BORRADOR (IA) ---
  const generateDraft = useCallback(async () => {
    setIsGenerating(true);
    try {
      const data = getValues();
      const payload = {
        purpose: data.purpose,
        style: data.style || 'solo',
        duration: data.duration,
        depth: data.narrativeDepth,
        tone: data.agentName || data.selectedTone,
        raw_inputs: { ...data }
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !response?.success) throw new Error(response?.error || "Fallo en IA.");

      setValue('final_title', response.draft.suggested_title);
      setValue('final_script', response.draft.script_body);
      setValue('sources', response.draft.sources || []);
      transitionTo('SCRIPT_EDITING');
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, toast]);

  // --- ACCIÓN: PRODUCIR ---
  const submitToProduction = useCallback(async () => {
    if (!supabase || !user) return;
    setIsSubmitting(true);
    try {
      const data = getValues();
      const payload = { ...data, agentName: data.agentName || 'script-architect-v1' };
      const { data: res, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
      if (error || !res?.success) throw new Error("Fallo en cola.");
      toast({ title: "¡Éxito!", description: "Producción iniciada." });
      clearDraft();
      router.push('/podcasts?tab=library');
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, user, getValues, clearDraft, router, toast]);

  return {
    generateDraft,
    generateNarratives, // <--- FIX IMAGEN 72
    submitToProduction,
    isGenerating,
    isSubmitting
  };
}