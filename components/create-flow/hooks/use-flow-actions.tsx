// components/create-flow/hooks/use-flow-actions.ts
// VERSIÓN: 4.5 (Master Action Orchestrator - Multi-Flow & Async Handover)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FlowState } from "../shared/types";

/**
 * Propiedades del Hook: Recibe las funciones de navegación del orquestador.
 */
interface UseFlowActionsProps {
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
  clearDraft: () => void;
}

/**
 * useFlowActions
 * Centraliza la comunicación con las Edge Functions de Supabase.
 * Implementa la arquitectura asíncrona para liberar el hilo principal del navegador.
 */
export function useFlowActions({ transitionTo, goBack, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { getValues, setValue } = useFormContext<PodcastCreationData>();

  // Estados de carga para interactividad de botones
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * generateDraft (FASE DE INTELIGENCIA)
   * Dispara el inicio de la investigación profunda o la redacción de píldoras.
   * [ESTRATEGIA]: No espera al guion. Recibe un 'draft_id' y salta al monitor.
   */
  const generateDraft = useCallback(async () => {
    if (!user) {
      toast({ title: "Acceso denegado", description: "Inicia sesión para crear.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);

    try {
      const values = getValues();
      const isPulse = values.purpose === 'pulse';

      console.log(`🚀 [FlowActions] Iniciando Pipeline Asíncrono para: ${values.purpose}`);

      // Invocamos la función orquestadora que inicia la malla de inteligencia
      const { data, error } = await supabase.functions.invoke("start-draft-process", {
        body: {
          ...values,
          // Si es modo Pulse, nos aseguramos de enviar las fuentes marcadas en el radar
          pulse_source_ids: isPulse ? values.pulse_source_ids : undefined
        },
      });

      if (error) throw new Error(error.message);

      if (data.success && data.draft_id) {
        // Vinculamos el borrador al formulario para el seguimiento Realtime
        setValue("draft_id", data.draft_id);

        // Redirección inmediata al monitor de carga cognitiva
        transitionTo("DRAFT_GENERATION_LOADER");
      } else {
        throw new Error("El servidor no devolvió un identificador de sesión válido.");
      }

    } catch (err: any) {
      console.error("🔥 [Draft-Trigger-Error]:", err.message);
      toast({
        title: "Error de Orquestación",
        description: err.message || "No pudimos iniciar el proceso de inteligencia.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, toast]);

  /**
   * handleSubmitProduction (FASE DE MATERIALIZACIÓN)
   * Orquesta la conversión de un borrador validado en un activo de audio e imagen.
   */
  const handleSubmitProduction = useCallback(async () => {
    if (!user) return;
    setIsSubmitting(true);

    const values = getValues();
    const isPulseMode = values.purpose === 'pulse';
    const isLocalMode = values.purpose === 'local_soul';

    try {
      // DETERMINACIÓN DINÁMICA DE ENDPOINT
      let endpoint = "queue-podcast-job"; // Vía estándar
      if (isPulseMode) endpoint = "generate-briefing-pill"; // Vía rápida Pulse
      if (isLocalMode) endpoint = "geo-publish-content"; // Vía geolocalizada

      console.log(`🎬 [Production] Ejecutando Handover a: ${endpoint}`);

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: values
      });

      if (error) throw new Error(error.message);

      // El backend devuelve podcast_id (Pill/Local) o pod_id (Standard)
      const finalId = data.podcast_id || data.pod_id;

      if (data.success && finalId) {
        toast({
          title: "Producción en curso",
          description: "Redirigiendo a tu sala de escucha privada."
        });

        // Redirección inmediata al visor del podcast (Shielded View)
        router.push(`/podcast/${finalId}`);

        // Limpiamos el formulario para la siguiente misión
        clearDraft();
      } else {
        throw new Error("La orden fue aceptada pero no se generó el activo final.");
      }

    } catch (err: any) {
      console.error("🔥 [Production-Fatal-Error]:", err.message);
      toast({
        title: "Fallo en la Malla de Producción",
        description: err.message || "Inténtalo de nuevo en unos minutos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, user, getValues, router, clearDraft, toast]);

  /**
   * deleteDraft
   * Gestión de la Bóveda de Borradores.
   */
  const deleteDraft = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from("podcast_drafts")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({ title: "Sesión eliminada", description: "Espacio liberado en tu bóveda." });

      // Actualizamos la data del servidor para refrescar la lista de borradores
      router.refresh();
    } catch (err: any) {
      console.error("🔥 [Draft-Delete-Error]:", err.message);
      toast({ title: "Error al purgar sesión", variant: "destructive" });
    }
  }, [supabase, user?.id, toast, router]);

  /**
   * analyzeLocalEnvironment
   * Misión: Iniciar la fase de investigación de monumentos o lugares (Madrid Resonance).
   */
  const analyzeLocalEnvironment = useCallback(async (imageContext?: string) => {
    if (!user) return;
    setIsGenerating(true);

    try {
      const values = getValues();
      const { data, error } = await supabase.functions.invoke("get-local-discovery", {
        body: {
          latitude: values.location?.latitude,
          longitude: values.location?.longitude,
          image_base64: imageContext
        }
      });

      if (error) throw new Error(error.message);

      if (data.success) {
        setValue("discovery_context", data.dossier);
        setValue("sources", data.sources);
        transitionTo("LOCAL_ANALYSIS_LOADER");
      }
    } catch (err: any) {
      toast({ title: "Error de Visión", description: "No pudimos reconocer el entorno.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, toast]);

  return {
    isGenerating,
    isSubmitting,
    generateDraft,
    handleSubmitProduction,
    deleteDraft,
    analyzeLocalEnvironment
  };
}