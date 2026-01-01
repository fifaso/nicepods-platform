// components/create-flow/hooks/use-flow-actions.tsx
// VERSIÓN: 1.5 (Master Actions Engine - Self-Contained Validation & Submission)

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
  clearDraft: () => void;
}

export function useFlowActions({ transitionTo, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  // Al estar dentro del InnerOrchestrator, este hook TIENE acceso seguro al contexto
  const { getValues, setValue, trigger } = useFormContext<PodcastCreationData>();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- 1. ANALIZAR ENTORNO LOCAL ---
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

      toast({ 
        title: "¡Entorno Sincronizado!", 
        description: `Lugar: ${res.poi}`,
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });
      transitionTo('LOCAL_RESULT_STEP');
    } catch (err: any) {
      toast({ title: "Error de Análisis", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, toast]);

  // --- 2. GENERAR NARRATIVAS ---
  const generateNarratives = useCallback(async (callback: (data: any[]) => void) => {
    const { link_topicA, link_topicB, link_catalyst } = getValues();
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: link_topicA, topicB: link_topicB, catalyst: link_catalyst }
      });
      if (error) throw error;
      if (data?.narratives) { callback(data.narratives); transitionTo('NARRATIVE_SELECTION'); }
    } catch {
      toast({ title: "Error", description: "Fallo al conectar ideas.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, transitionTo, toast]);

  // --- 3. GENERAR BORRADOR ---
  const generateDraft = useCallback(async () => {
    setIsGenerating(true);
    try {
      const data = getValues();
      const payload = {
        purpose: data.purpose,
        style: data.style || 'solo',
        duration: data.duration,
        depth: data.narrativeDepth,
        tone: data.agentName || data.selectedTone || 'script-architect-v1',
        raw_inputs: {
          ...data,
          topic: data.solo_topic || data.question_to_answer || data.link_topicA,
          motivation: data.solo_motivation || data.legacy_lesson,
          location: data.location,
          discovery_context: data.discovery_context
        }
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !response?.success) throw new Error(response?.error || "Error IA");

      setValue('final_title', response.draft.suggested_title);
      setValue('final_script', response.draft.script_body);
      if (response.draft.sources) setValue('sources', response.draft.sources);

      transitionTo('SCRIPT_EDITING');
    } catch (err: any) {
      toast({ title: "Fallo Creativo", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, toast]);

  /**
   * 4. ENVÍO A PRODUCCIÓN (Lógica Privada)
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
      if (error || !res?.success) throw new Error("Fallo en producción.");

      toast({ title: "¡Éxito!", description: "Generando audio...", action: <CheckCircle2 className="h-5 w-5 text-green-500" /> });
      clearDraft();
      router.push('/podcasts?tab=library');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, user, getValues, clearDraft, router, toast]);

  /**
   * [NUEVO] Wrapper de Validación y Envío
   * Esta función es la que el Orquestador expondrá al LayoutShell.
   * Se asegura de validar todo el formulario antes de llamar a submitToProduction.
   */
  const handleSubmitProduction = useCallback(async () => {
    const isValid = await trigger(); // Valida todo el formulario con Zod
    if (isValid) {
      await submitToProduction();
    } else {
      toast({ title: "Datos incompletos", description: "Revisa el formulario.", variant: "destructive" });
    }
  }, [trigger, submitToProduction, toast]);

  return {
    generateDraft,
    generateNarratives,
    analyzeLocalEnvironment,
    handleSubmitProduction, // <--- Exportación limpia para el botón PRODUCIR
    isGenerating,
    isSubmitting
  };
}