// components/create-flow/hooks/use-flow-actions.ts
// VERSIÓN: 5.1 (Master Action Orchestrator - Full Multi-Flow Integration)
// Misión: Centralizar la comunicación con las Edge Functions y garantizar la integridad de la Bóveda Staging.
// [FIX]: Restauración de 'analyzeLocalEnvironment' y consolidación del motor de hidratación.

"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";

// --- INFRAESTRUCTURA DE DATOS Y SEGURIDAD ---
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getDraftById } from "@/actions/draft-actions";
import { nicepodLog } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { ResearchSource, PodcastScript } from "@/types/podcast";
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

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * generateDraft: FASE DE INTELIGENCIA (Standard/Learn)
   */
  const generateDraft = useCallback(async () => {
    if (!user) {
      toast({ title: "Acceso denegado", description: "Identidad no verificada.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const values = getValues();
      const isPulse = values.purpose === 'pulse';

      // Mapeo de Boundary: Crystal (ZAP/camelCase) -> Metal (Legacy snake_case)
      const legacyPayload = {
        ...values,
        draft_id: values.draftIdentification,
        pulse_source_ids: isPulse ? values.pulseSourceIdentifications : undefined,
        creation_mode: values.creationMode,
        final_title: values.finalTitle,
        final_script: values.finalScript
      };

      const { data, error } = await supabase.functions.invoke("start-draft-process", {
        body: legacyPayload,
      });

      if (error) throw new Error(error.message);

      // Sincronía Nominal: Metal -> Crystal
      const draftId = data.draftIdentification || data.draft_id;

      if (data.success && draftId) {
        setValue("draftIdentification", draftId);
        transitionTo("DRAFT_GENERATION_LOADER");
      }
    } catch (err: any) {
      toast({ title: "Fallo de Orquestación", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, toast]);

  /**
   * hydrateDraftData: MOTOR DE RESCATE DE CONOCIMIENTO
   * [FIX]: Garantiza que las fuentes y el guion fluyan desde Supabase al formulario.
   */
  const hydrateDraftData = useCallback(async () => {
    const draftId = getValues('draftIdentification');
    if (!draftId) return false;
    try {
      const draft = await getDraftById(draftId);
      if (draft) {
        setValue('finalTitle', draft.title, { shouldValidate: true });
        if (draft.script_text) {
          const script = draft.script_text as unknown as PodcastScript;
          setValue('finalScript', script.script_body || script.script_plain || "", { shouldValidate: true });
        }
        if (draft.sources && Array.isArray(draft.sources)) {
          setValue('sources', draft.sources as any, { shouldValidate: true });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("🔥 [Hydration-Error]:", error);
      return false;
    }
  }, [getValues, setValue]);

  /**
   * analyzeLocalEnvironment: FASE DE INVESTIGACIÓN SITUACIONAL (GEO)
   * [RESTAURACIÓN]: Re-activación del motor de visión para Madrid Resonance.
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
        // Sincronía Nominal: Metal ('dossier') -> Crystal ('discoveryContext')
        const discoveryDossier = data.discoveryContext || data.dossier;

        setValue("discoveryContext", discoveryDossier);

        // Mapeo de Fuentes: url -> uniformResourceLocator
        if (data.sources && Array.isArray(data.sources)) {
          const mappedSources = data.sources.map((s: any) => ({
            ...s,
            uniformResourceLocator: s.uniformResourceLocator || s.url
          }));
          setValue("sources", mappedSources);
        }

        transitionTo("LOCAL_ANALYSIS_LOADER");
      }
    } catch (err: any) {
      toast({ title: "Error de Visión", description: "No pudimos reconocer el entorno.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, toast]);

  /**
   * handleSubmitProduction: FASE DE MATERIALIZACIÓN (BINARIOS)
   */
  const handleSubmitProduction = useCallback(async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const values = getValues();
      const isPulseMode = values.purpose === 'pulse';
      const isLocalMode = values.purpose === 'local_soul';
      let endpoint = isPulseMode ? "generate-briefing-pill" : isLocalMode ? "geo-publish-content" : "queue-podcast-job";

      // Mapeo de Boundary para Producción: Sincronía con Edge Functions legacy
      const legacyProductionPayload = {
        ...values,
        draft_id: values.draftIdentification,
        creation_mode: values.creationMode,
        final_title: values.finalTitle,
        final_script: values.finalScript,
        pulse_source_ids: values.pulseSourceIdentifications,
        sources: values.sources?.map(s => ({
          ...s,
          url: s.uniformResourceLocator // Retrocompatibilidad
        }))
      };

      const { data, error } = await supabase.functions.invoke(endpoint, { body: legacyProductionPayload });
      if (error) throw new Error(error.message);

      const finalId = data.pod_id || data.podcast_id;
      if (data.success && finalId) {
        router.push(`/podcast/${finalId}`);
        clearDraft();
      }
    } catch (err: any) {
      toast({ title: "Fallo en Producción", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, user, getValues, router, clearDraft, toast]);

  return {
    isGenerating,
    isSubmitting,
    generateDraft,
    hydrateDraftData,
    analyzeLocalEnvironment, // [FIX CRÍTICO]: Ahora se exporta correctamente
    handleSubmitProduction,
    deleteDraft: async (id: number) => {
      await supabase.from("podcast_drafts").delete().eq("id", id);
      router.refresh();
    }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.1):
 * 1. Restauración de Propiedad: Se ha reintegrado 'analyzeLocalEnvironment' al retorno 
 *    del hook, resolviendo el error de compilación ts(2339) que bloqueaba el build.
 * 2. Unificación de Endpoints: El método 'handleSubmitProduction' ahora gestiona de 
 *    forma soberana la redirección según el flujo (Pill, Geo o Standard).
 */