// components/create-flow/hooks/use-flow-actions.tsx
// VERSIÓN: 1.4 (Master Stable - JSX Enabled & Full Error Handling)

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FlowState } from "../shared/types";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"; 

interface UseFlowActionsProps {
  transitionTo: (state: FlowState) => void;
  clearDraft: () => void;
}

/**
 * useFlowActions
 * Hook especializado en la orquestación de llamadas a la IA y gestión de red.
 * Centraliza la lógica de negocio para mantener los componentes visuales limpios.
 */
export function useFlowActions({ transitionTo, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { getValues, setValue } = useFormContext<PodcastCreationData>();

  // --- ESTADOS DE CARGA ---
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * 1. ANALIZAR ENTORNO LOCAL (VIVIR LO LOCAL)
   * Gatillo de la experiencia situacional. Procesa GPS y Fotos.
   */
  const analyzeLocalEnvironment = useCallback(async () => {
    const data = getValues();
    
    // Validación de entrada sensorial
    if (!data.location && !data.imageContext) {
      toast({ 
        title: "Faltan Sensores", 
        description: "Activa el GPS o sube una foto para analizar el entorno.", 
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log(`[Actions] Iniciando escaneo situacional...`);
      
      const { data: res, error } = await supabase.functions.invoke('get-local-discovery', {
        body: {
          latitude: data.location?.latitude || 0,
          longitude: data.location?.longitude || 0,
          lens: data.selectedTone || 'Tesoros Ocultos',
          image_base64: data.imageContext
        }
      });

      if (error || !res?.success) throw new Error(res?.error || "El motor de descubrimiento no respondió.");

      // CUSTODIA DE DATOS: Inyectamos el Dossier, Fuentes y Tema
      setValue('discovery_context', res.dossier, { shouldValidate: true });
      setValue('sources', res.sources || [], { shouldValidate: true });
      setValue('solo_topic', res.poi || "Descubrimiento Local", { shouldValidate: true });
      setValue('agentName', 'local-concierge-v1', { shouldValidate: true });

      toast({ 
        title: "Entorno Interpretado", 
        description: `Identificado: ${res.poi}`,
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });

      // Transición a la pantalla de resultados del dossier
      transitionTo('LOCAL_RESULT_STEP');

    } catch (err: any) {
      const msg = err.message || "Error desconocido";
      toast({ title: "Fallo de Análisis", description: msg, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, toast]);

  /**
   * 2. GENERAR NARRATIVAS (MODO EXPLORAR)
   * Conecta dos temas dispares para encontrar un hilo conductor.
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
   * Crea el guion preliminar basado en la investigación y configuración.
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
          ...data, // Enviamos todo el contexto
          topic: data.solo_topic || data.question_to_answer || data.link_topicA,
          motivation: data.solo_motivation || data.legacy_lesson,
          location: data.location,
          discovery_context: data.discovery_context
        }
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      
      if (error || !response?.success) throw new Error(response?.error || "La IA no pudo generar el borrador.");

      // CUSTODIA DE DATOS: Guardamos guion y fuentes de Tavily
      setValue('final_title', response.draft.suggested_title);
      setValue('final_script', response.draft.script_body);
      
      if (response.draft.sources) {
        setValue('sources', response.draft.sources);
      }

      transitionTo('SCRIPT_EDITING');

    } catch (err: any) {
      toast({ title: "Fallo Creativo", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, getValues, setValue, transitionTo, toast]);

  /**
   * 4. ENVÍO A PRODUCCIÓN (QUEUE FINAL)
   * Encola el trabajo para la generación asíncrona de audio e imagen.
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

      toast({ 
        title: "¡Éxito!", 
        description: "Tu audio está siendo generado.",
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });

      clearDraft();
      router.push('/podcasts?tab=library');

    } catch (err: any) {
      toast({ title: "Error de Producción", description: err.message, variant: "destructive" });
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
