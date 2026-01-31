// components/create-flow/hooks/use-flow-actions.ts
// VERSIÓN: 4.6 (Master Action Orchestrator - Redirection Shield & Multi-Flow Integrity)

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
 * Implementa la arquitectura asíncrona y blindaje de navegación.
 */
export function useFlowActions({ transitionTo, goBack, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { getValues, setValue } = useFormContext<PodcastCreationData>();

  // Estados de carga para feedback visual en botones
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
          // Si es modo Pulse, enviamos las fuentes del radar
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
        title: "Fallo en Orquestación",
        description: err.message || "No pudimos conectar con los agentes de inteligencia.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, toast]);

  /**
   * handleSubmitProduction (FASE DE MATERIALIZACIÓN)
   * Orquesta la conversión final en activos multimedia.
   * [FIX]: Implementa Redirection Shield para evitar el crash de 'Invalid URL'.
   */
  const handleSubmitProduction = useCallback(async () => {
    if (!user) return;
    setIsSubmitting(true);

    const values = getValues();
    const isPulseMode = values.purpose === 'pulse';
    const isLocalMode = values.purpose === 'local_soul';

    try {
      // DETERMINACIÓN DINÁMICA DE ENDPOINT
      let endpoint = "queue-podcast-job";
      if (isPulseMode) endpoint = "generate-briefing-pill";
      if (isLocalMode) endpoint = "geo-publish-content";

      console.log(`🎬 [Production] Handover iniciado a: ${endpoint}`);

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: values
      });

      if (error) throw new Error(error.message);

      /**
       * [NORMALIZACIÓN]: Captura de ID polimórfica.
       * Soporta tanto pod_id (RPC SQL) como podcast_id (Pill Generator).
       */
      const finalId = data.pod_id || data.podcast_id;

      if (data.success && finalId) {
        // --- BLINDAJE DE REDIRECCIÓN ---
        const safeId = String(finalId).trim();
        if (!safeId || safeId === "undefined" || safeId === "null") {
          throw new Error("El servidor aceptó la producción pero no devolvió un ID válido.");
        }

        toast({
          title: "Producción en curso",
          description: "Redirigiendo a tu sala de escucha privada."
        });

        // Redirección segura a la página del recurso
        router.push(`/podcast/${safeId}`);

        // Limpiamos el formulario para liberar memoria
        clearDraft();
      } else {
        throw new Error(data.message || "La orden de producción fue rechazada por el servidor.");
      }

    } catch (err: any) {
      console.error("🔥 [Production-Fatal-Error]:", err.message);
      toast({
        title: "Error de Producción",
        description: err.message || "Hubo un fallo en la malla de funciones. Re-intenta en unos minutos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, user, getValues, router, clearDraft, toast]);

  /**
   * deleteDraft
   * Gestión de la Bóveda de Borradores con protección RLS.
   */
  const deleteDraft = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from("podcast_drafts")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({ title: "Borrador eliminado", description: "Espacio liberado en tu bóveda." });

      // Actualizamos datos del servidor para refrescar listas sin recargar
      router.refresh();
    } catch (err: any) {
      console.error("🔥 [Draft-Delete-Error]:", err.message);
      toast({ title: "Error al purgar sesión", variant: "destructive" });
    }
  }, [supabase, user?.id, toast, router]);

  /**
   * analyzeLocalEnvironment
   * Inicia la fase de investigación situacional para Madrid Resonance.
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
      toast({ title: "Error de Visión", description: "No pudimos reconocer el entorno urbano.", variant: "destructive" });
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