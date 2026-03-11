// components/create-flow/hooks/use-flow-actions.ts
// VERSIÓN: 4.7 (Master Action Orchestrator - Draft Hydration Edition)
// Misión: Centralizar la comunicación con las Edge Functions y sincronizar el estado reactivo.
// [ESTABILIZACIÓN]: Implementación de 'hydrateDraftData' para resolver la pérdida de fuentes y guiones.

"use client";

import { getDraftById } from "@/actions/draft-actions"; // [FIX]: Importamos la acción de servidor para lectura
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FlowState } from "../shared/types";

interface UseFlowActionsProps {
  transitionTo: (state: FlowState) => void;
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
    if (!user) {
      toast({ title: "Acceso denegado", description: "Inicia sesión para crear.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);

    try {
      const values = getValues();
      const isPulse = values.purpose === 'pulse';

      console.log(`🚀 [FlowActions] Iniciando Pipeline Asíncrono para: ${values.purpose}`);

      const { data, error } = await supabase.functions.invoke("start-draft-process", {
        body: {
          ...values,
          pulse_source_ids: isPulse ? values.pulse_source_ids : undefined
        },
      });

      if (error) throw new Error(error.message);

      if (data.success && data.draft_id) {
        setValue("draft_id", data.draft_id);
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
   * [NUEVA FUNCIÓN CRÍTICA]: hydrateDraftData
   * Esta función es la responsable de rescatar el Capital Intelectual (Fuentes, Guion) 
   * desde la base de datos y forzar su inyección en el formulario React Hook Form.
   * Se debe llamar cuando la pantalla de carga (Loader) detecte que la IA ha terminado.
   */
  const hydrateDraftData = useCallback(async () => {
    const draftId = getValues('draft_id');
    if (!draftId) return false;

    try {
      console.log(`🔄 [FlowActions] Hidratando memoria del borrador #${draftId}`);
      // Usamos el server action seguro que ya habíamos auditado
      const draft = await getDraftById(draftId);

      if (draft) {
        // [LA CLAVE]: Inyectamos los datos recuperados en el formulario
        // Esto soluciona el misterio de "Fuentes en 0".
        setValue('final_title', draft.title, { shouldValidate: true });

        // Protegemos la inyección del guion
        if (draft.script_text) {
          setValue('final_script', draft.script_text.script_body || draft.script_text.script_plain || "", { shouldValidate: true });
        }

        // Inyectamos las fuentes
        if (draft.sources && Array.isArray(draft.sources)) {
          setValue('sources', draft.sources as any, { shouldValidate: true });
          console.log(`✅ [FlowActions] ${draft.sources.length} fuentes inyectadas al editor.`);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("🔥 [Draft-Hydration-Error]:", error);
      return false;
    }
  }, [getValues, setValue]);

  const handleSubmitProduction = useCallback(async () => {
    if (!user) return;
    setIsSubmitting(true);

    const values = getValues();
    const isPulseMode = values.purpose === 'pulse';
    const isLocalMode = values.purpose === 'local_soul';

    try {
      let endpoint = "queue-podcast-job";
      if (isPulseMode) endpoint = "generate-briefing-pill";
      if (isLocalMode) endpoint = "geo-publish-content";

      console.log(`🎬 [Production] Handover iniciado a: ${endpoint}`);

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: values
      });

      if (error) throw new Error(error.message);

      const finalId = data.pod_id || data.podcast_id;

      if (data.success && finalId) {
        const safeId = String(finalId).trim();
        if (!safeId || safeId === "undefined" || safeId === "null") {
          throw new Error("El servidor aceptó la producción pero no devolvió un ID válido.");
        }

        toast({
          title: "Producción en curso",
          description: "Redirigiendo a tu sala de escucha privada."
        });

        router.push(`/podcast/${safeId}`);
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

  const deleteDraft = useCallback(async (id: number) => {
    try {
      const { error } = await supabase.from("podcast_drafts").delete().eq("id", id).eq("user_id", user?.id);
      if (error) throw error;
      toast({ title: "Borrador eliminado", description: "Espacio liberado en tu bóveda." });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error al purgar sesión", variant: "destructive" });
    }
  }, [supabase, user?.id, toast, router]);

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
    hydrateDraftData, // [NUEVA FUNCIÓN EXPUESTA]
    handleSubmitProduction,
    deleteDraft,
    analyzeLocalEnvironment
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.7):
 * 1. Sincronía Front-Back: Se inyectó el método 'hydrateDraftData'. Esto permite 
 *    que los componentes de carga (Loaders) fuercen una re-hidratación del 
 *    formulario con los datos definitivos que la IA guardó en Supabase antes de 
 *    mostrar el Editor de Guiones.
 * 2. Estabilidad de Contexto: La inyección controlada con 'shouldValidate: true'
 *    garantiza que el Editor no nazca vacío, permitiendo que el usuario vea y edite 
 *    el contenido sin perder información.
 */