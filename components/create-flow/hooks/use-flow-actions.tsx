// components/create-flow/hooks/use-flow-actions.tsx
// VERSIÓN: 2.4 (Master Actions - Vocal Performance & Metadata Integrity)

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FlowState } from "../shared/types";
import { CheckCircle2, Trash2 } from "lucide-react";
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

  /**
   * packageInputs: El núcleo de la Custodia de Datos.
   * Empaqueta la "Materia Prima" y los "Metadatos de Performance" 
   * para que el motor de audio nativo interprete correctamente.
   */
  const packageInputs = useCallback((data: PodcastCreationData) => {
    return {
      // --- CAPA 1: PARÁMETROS DE PERFORMANCE (NUEVO V3.0) ---
      // Estos alimentan al vocal-director-map.ts en el backend
      voiceGender: data.voiceGender,
      voiceStyle: data.voiceStyle,
      voicePace: data.voicePace,
      speakingRate: data.speakingRate,
      agentName: data.agentName, // La personalidad elegida (ej. 'mentor')

      // --- CAPA 2: MATERIA PRIMA (SEMILLA) ---
      duration: data.duration,
      narrativeDepth: data.narrativeDepth,
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
  }, []);

  /**
   * handleResumeDraft: Inyector de Memoria de alta fidelidad.
   */
  const handleResumeDraft = useCallback((draft: any) => {
    try {
      const { purpose, agentName, inputs } = draft.creation_data;

      // Limpieza preventiva para evitar colisión de estados
      reset();

      // 1. Hidratación de la Semilla y Parámetros Vocales
      Object.entries(inputs || {}).forEach(([k, v]) => {
        setValue(k as any, v, { shouldValidate: true });
      });

      // 2. Sincronización de Identidad de Agente
      setValue("purpose", purpose);
      setValue("agentName", agentName || inputs.agentName);

      // @ts-ignore - ID de persistencia
      setValue("draft_id", draft.id);

      // 3. Restauración de Resultados de IA
      if (draft.script_text) {
        const parsed = typeof draft.script_text === 'string' ? JSON.parse(draft.script_text) : draft.script_text;
        setValue("final_title", draft.title);
        setValue("final_script", parsed.script_body || draft.script_text);
      }

      setValue("sources", draft.sources || []);

      toast({
        title: "Sesión Restaurada",
        description: `Retomando: ${draft.title}`,
        action: <CheckCircle2 className="h-5 w-5 text-primary" />
      });

      // El orquestador index.tsx usa jumpToStep para reconstruir el historial
    } catch (err) {
      toast({ title: "Error de hidratación", description: "Datos del borrador corruptos.", variant: "destructive" });
    }
  }, [reset, setValue, toast]);

  /**
   * generateDraft: Disparador de Inteligencia Híbrida (NKV + Gemini)
   */
  const generateDraft = useCallback(async () => {
    transitionTo('DRAFT_GENERATION_LOADER');
    setIsGenerating(true);

    try {
      const data = getValues();
      const payload = {
        user_id: user?.id,
        purpose: data.purpose,
        agentName: data.agentName || 'script-architect-v1',
        inputs: packageInputs(data) // Estructura jerárquica para el Backend
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !response?.success) throw new Error(response?.error || "Fallo en la síntesis de borrador.");

      // @ts-ignore - Guardamos el ID para la promoción final
      setValue('draft_id', response.draft_id);
      setValue('final_title', response.draft.suggested_title, { shouldValidate: true });
      setValue('final_script', response.draft.script_body, { shouldValidate: true });
      if (response.draft.sources) setValue('sources', response.draft.sources);

      transitionTo('SCRIPT_EDITING');
    } catch (err: any) {
      toast({ title: "Fallo en Estación IA", description: err.message, variant: "destructive" });
      goBack();
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, goBack, toast, packageInputs]);

  /**
   * handleSubmitProduction: Promoción Final de Borrador a Podcast
   */
  const handleSubmitProduction = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast({ title: "Datos incompletos", description: "Revisa la configuración y el guion.", variant: "destructive" });
      return;
    }

    if (!supabase || !user) return;
    setIsSubmitting(true);

    try {
      const data = getValues();
      const payload = {
        // @ts-ignore - ID para evitar duplicados en la DB
        draft_id: data.draft_id,
        purpose: data.purpose,
        agentName: data.agentName,
        final_title: data.final_title,
        final_script: data.final_script,
        sources: data.sources || [],
        inputs: packageInputs(data) // Incluye la Dirección Vocal V3.0
      };

      const { data: res, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
      if (error || !res?.success) throw new Error(res?.error || "Error al encolar producción.");

      toast({
        title: "¡Sinfonía en Proceso!",
        description: "Tu podcast se está interpretando nativamente.",
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });

      router.push('/podcasts?tab=library');
    } catch (err: any) {
      toast({ title: "Fallo de Producción", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [trigger, supabase, user, getValues, router, toast, packageInputs]);

  /**
   * deleteDraft: Gestión de cuota desde la Bóveda
   */
  const deleteDraft = useCallback(async (id: number) => {
    const result = await deleteDraftAction(id);
    if (result.success) {
      toast({ title: "Bóveda Actualizada", description: result.message });
    } else {
      toast({ title: "Error al purgar", description: result.message, variant: "destructive" });
    }
    return result;
  }, [toast]);

  return {
    generateDraft,
    handleSubmitProduction,
    handleResumeDraft,
    deleteDraft,
    isGenerating,
    isSubmitting
  };
}