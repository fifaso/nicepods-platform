// components/create-flow/hooks/use-flow-actions.tsx
// VERSIÓN: 1.3 (Master Actions Engine - JSX Fix & Full Provenance)

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FlowState } from "../shared/types";
import { CheckCircle2, Loader2 } from "lucide-react"; // [FIX]: Importación agregada

interface UseFlowActionsProps {
  transitionTo: (state: FlowState) => void;
  clearDraft: () => void;
}

/**
 * useFlowActions
 * Hook de grado industrial que gestiona las interacciones asíncronas.
 * NOTA: Requiere extensión .tsx para soportar iconos en los Toasts.
 */
export function useFlowActions({ transitionTo, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { getValues, setValue } = useFormContext<PodcastCreationData>();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * 1. ANALIZAR ENTORNO LOCAL
   */
  const analyzeLocalEnvironment = useCallback(async () => {
    const data = getValues();
    
    if (!data.location && !data.imageContext) {
      toast({ 
        title: "Sensores Inactivos", 
        description: "Necesito tu GPS o una fotografía para interpretar el lugar.", 
        variant: "destructive" 
      });
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

      if (error || !res?.success) throw new Error(res?.error || "Fallo en el motor de descubrimiento.");

      setValue('discovery_context', res.dossier, { shouldValidate: true });
      setValue('sources', res.sources || [], { shouldValidate: true });
      setValue('solo_topic', res.poi || "Descubrimiento Local", { shouldValidate: true });
      setValue('agentName', 'local-concierge-v1', { shouldValidate: true });

      toast({ 
        title: "¡Entorno Sincronizado!", 
        description: `Lugar identificado: ${res.poi}`,
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });

      transitionTo('LOCAL_RESULT_STEP');

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Fallo de sensores";
      toast({ title: "Error de Análisis", description: msg, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, toast]);

  /**
   * 2. GENERAR NARRATIVAS (PARA EXPLORAR)
   */
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

  /**
   * 3. GENERAR BORRADOR (IA NARRATIVA)
   */
  const generateDraft = useCallback(async () => {
    setIsGenerating(true);
    try {
      const data = getValues();
      const selectedAgent = data.agentName || data.selectedTone || 'script-architect-v1';

      const payload = {
        purpose: data.purpose,
        style: data.style || 'solo',
        duration: data.duration,
        depth: data.narrativeDepth,
        tone: selectedAgent,
        raw_inputs: {
          ...data,
          topic: data.solo_topic || data.question_to_answer || data.link_topicA,
          motivation: data.solo_motivation || data.legacy_lesson
        }
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      
      if (error || !response?.success) throw new Error(response?.error || "Fallo en la síntesis de IA.");

      setValue('final_title', response.draft.suggested_title);
      setValue('final_script', response.draft.script_body);
      setValue('sources', response.draft.sources || []);

      transitionTo('SCRIPT_EDITING');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast({ title: "Fallo Creativo", description: msg, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, toast]);

  /**
   * 4. ENVÍO A PRODUCCIÓN
   */
  const submitToProduction = useCallback(async () => {
    if (!supabase || !user) return;
    setIsSubmitting(true);

    try {
      const data = getValues();
      const payload = {
        purpose: data.purpose,
        agentName: data.agentName || 'script-architect-v1',
        final_script: data.final_script,
        final_title: data.final_title,
        sources: data.sources || [],
        inputs: { ...data }
      };

      const { data: res, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });

      if (error || !res?.success) throw new Error("No se pudo iniciar la producción.");

      // [FIX IMAGEN 81]: Ahora con la extensión .tsx, este JSX es válido
      toast({ 
        title: "¡Éxito!", 
        description: "Tu audio está siendo generado.",
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });

      clearDraft();
      router.push('/podcasts?tab=library');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Fallo de red";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, user, getValues, clearDraft, router, toast]);

  return {
    generateDraft,
    generateNarratives,
    analyzeLocalEnvironment,
    submitToProduction,
    isGenerating,
    isSubmitting
  };
}