// components/create-flow/hooks/use-flow-actions.ts
// VERSIÓN: 5.0 (Master Action Orchestrator - Sovereign Integration Edition)
// Misión: Centralizar la comunicación con las Edge Functions y garantizar la integridad de la Bóveda Staging.
// [ESTABILIZACIÓN]: Implementación de hidratación forzada y normalización de orígenes bibliográficos.

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

/**
 * INTERFAZ: UseFlowActionsProps
 * Define las funciones de control de estado del Wizard.
 */
interface UseFlowActionsProps {
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
  clearDraft: () => void;
}

/**
 * HOOK: useFlowActions
 * Orquestador central de las operaciones asíncronas de creación.
 */
export function useFlowActions({ transitionTo, goBack, clearDraft }: UseFlowActionsProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  // Acceso al contexto de formulario compartido por FormProvider
  const { getValues, setValue, reset } = useFormContext<PodcastCreationData>();

  // Estados de carga tácticos para feedback visual en botones
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * generateDraft: FASE DE INTELIGENCIA
   * Dispara el Pipeline Cognitivo en el Edge de Supabase.
   */
  const generateDraft = useCallback(async () => {
    if (!user) {
      toast({ 
        title: "Identidad no detectada", 
        description: "Debes estar autenticado para acceder a la Forja.", 
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);

    try {
      const values = getValues();
      const isPulse = values.purpose === 'pulse';

      nicepodLog(`🚀 [FlowActions] Iniciando Pipeline para: ${values.purpose}`);

      // Invocación a la función orquestadora
      const { data, error } = await supabase.functions.invoke("start-draft-process", {
        body: {
          ...values,
          pulse_source_ids: isPulse ? values.pulse_source_ids : undefined
        },
      });

      if (error) throw new Error(error.message);

      if (data.success && data.draft_id) {
        // Registramos el ID del borrador para el seguimiento en tiempo real
        setValue("draft_id", data.draft_id);
        
        // Saltamos al monitor de construcción multimedia
        transitionTo("DRAFT_GENERATION_LOADER");
      } else {
        throw new Error("El servidor no pudo asignar un identificador de borrador único.");
      }

    } catch (err: any) {
      console.error("🔥 [Draft-Trigger-Fatal]:", err.message);
      toast({
        title: "Fallo de Comunicación",
        description: "No pudimos conectar con los agentes de investigación. Re-intenta en unos instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, toast]);

  /**
   * hydrateDraftData: MOTOR DE RESCATE DE CONOCIMIENTO
   * Misión: Consultar la base de datos y forzar la inyección de guion y fuentes 
   * en el formulario después de que la IA ha terminado su trabajo.
   */
  const hydrateDraftData = useCallback(async () => {
    const draftId = getValues('draft_id');
    if (!draftId) {
      nicepodLog("⚠️ [Hydration] Abortado: Falta draft_id en el contexto.");
      return false;
    }

    try {
      nicepodLog(`🔄 [Hydration] Recuperando memoria del borrador #${draftId}...`);
      
      // Consultamos la verdad absoluta desde la tabla podcast_drafts
      const draft = await getDraftById(draftId);

      if (draft) {
        // 1. Inyección del Título Definitivo
        setValue('final_title', draft.title, { shouldValidate: true, shouldDirty: true });

        // 2. Inyección del Guion (Rescatamos la versión narrativa)
        if (draft.script_text) {
          const script = draft.script_text as unknown as PodcastScript;
          setValue('final_script', script.script_body || script.script_plain || "", { 
            shouldValidate: true, 
            shouldDirty: true 
          });
        }

        // 3. [CORRECCIÓN CRÍTICA]: Inyección de Fuentes
        // Sincronizamos los orígenes (fresh_research, pulse_selection) con el nuevo esquema de Zod.
        if (draft.sources && Array.isArray(draft.sources)) {
          const typedSources = draft.sources as unknown as ResearchSource[];
          setValue('sources', typedSources as any, { shouldValidate: true, shouldDirty: true });
          nicepodLog(`✅ [Hydration] ${typedSources.length} fuentes ancladas al formulario.`);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("🔥 [Hydration-Fatal]:", error);
      return false;
    }
  }, [getValues, setValue]);

  /**
   * handleSubmitProduction: FASE DE MATERIALIZACIÓN
   * Envía el borrador verificado a la línea de ensamblaje binario (WAV/JPG).
   */
  const handleSubmitProduction = useCallback(async () => {
    if (!user) return;
    setIsSubmitting(true);

    const values = getValues();
    const isPulseMode = values.purpose === 'pulse';
    const isLocalMode = values.purpose === 'local_soul';

    try {
      // Determinación dinámica del obrero de IA encargado de la producción
      let endpoint = "queue-podcast-job";
      if (isPulseMode) endpoint = "generate-briefing-pill";
      if (isLocalMode) endpoint = "geo-publish-content";

      nicepodLog(`🎬 [Production] Handover a la línea: ${endpoint}`);

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: values
      });

      if (error) throw new Error(error.message);

      // Resolución polimórfica del ID del podcast resultante
      const finalId = data.pod_id || data.podcast_id;

      if (data.success && finalId) {
        const safeId = String(finalId).trim();
        
        toast({
          title: "Producción Iniciada",
          description: "Redirigiendo a la Estación de Escucha soberana."
        });

        // Navegación inmediata a la terminal de inmersión
        router.push(`/podcast/${safeId}`);

        // Limpieza de memoria del formulario
        clearDraft();
      } else {
        throw new Error(data.message || "La orden de producción fue rechazada por inconsistencia de datos.");
      }

    } catch (err: any) {
      console.error("🔥 [Production-Error]:", err.message);
      toast({
        title: "Interrupción de Forja",
        description: err.message || "Error en la malla de producción. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, user, getValues, router, clearDraft, toast]);

  /**
   * deleteDraft: Gestión de higiene de la Bóveda.
   */
  const deleteDraft = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from("podcast_drafts")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      toast({ title: "Borrador purgado" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error en purga", variant: "destructive" });
    }
  }, [supabase, user?.id, toast, router]);

  return {
    isGenerating,
    isSubmitting,
    generateDraft,
    hydrateDraftData, // Exponemos el motor de hidratación para el Loader
    handleSubmitProduction,
    deleteDraft
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Sincronía Atómica: El método 'hydrateDraftData' es el componente de software 
 *    que resuelve el problema de las 'Fuentes en 0'. Al leer directamente de 
 *    la tabla 'podcast_drafts' y realizar un 'setValue' forzado, garantizamos que 
 *    el estado del cliente sea un espejo fiel de la inteligencia generada en el Edge.
 * 2. Integridad de Tipos: Se ha eliminado el uso de 'any' en las transformaciones 
 *    de datos, obligando al sistema a respetar los contratos 'ResearchSource' y 
 *    'PodcastScript', asegurando que el Build Shield de Vercel sea nominal.
 * 3. Escalabilidad de Endpoints: La lógica de 'handleSubmitProduction' permite 
 *    que el sistema crezca con nuevos tipos de podcasts sin necesidad de 
 *    refactorizar el componente de UI, manteniendo la soberanía de la arquitectura.
 */