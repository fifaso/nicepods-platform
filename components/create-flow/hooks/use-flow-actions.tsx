// components/create-flow/hooks/use-flow-actions.ts
// VERSIÓN: 3.1 (Master Action Orchestrator - Hybrid Pulse & Shielded Production)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

interface UseFlowActionsProps {
  transitionTo: (state: string) => void;
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

  /**
   * generateDraft
   * Fase de inteligencia: Llama al redactor para crear el guion inicial.
   * [PULSE READY]: Si es modo pulse, envía las fuentes seleccionadas como contexto.
   */
  const generateDraft = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);

    try {
      const values = getValues();
      const isPulse = values.purpose === 'pulse';

      console.log(`[FlowActions] Solicitando borrador (${values.purpose})...`);

      const { data, error } = await supabase.functions.invoke("generate-script-draft", {
        body: {
          ...values,
          // En modo Pulse, inyectamos explícitamente los IDs de las fuentes del radar
          selected_source_ids: isPulse ? values.pulse_source_ids : undefined
        },
      });

      if (error) throw new Error(error.message);

      if (data.success) {
        setValue("final_title", data.title);
        setValue("final_script", data.script_body);
        setValue("sources", data.sources || []);

        // Navegamos a la fase de edición (Sanitización)
        transitionTo("SCRIPT_EDITING");
      }
    } catch (err: any) {
      console.error("Draft Generation Error:", err);
      toast({
        title: "Fallo en Redacción",
        description: err.message || "No pudimos conectar con el agente redactor.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, user, getValues, setValue, transitionTo, toast]);

  /**
   * handleSubmitProduction
   * ORQUESTADOR DE PRODUCCIÓN: Gestiona la entrega final del producto.
   */
  const handleSubmitProduction = useCallback(async () => {
    if (!user) return;
    setIsSubmitting(true);

    const values = getValues();
    const isPulseMode = values.purpose === 'pulse';

    try {
      // --- VÍA A: PRODUCCIÓN DE PÍLDORA PULSE (FAST-TRACK) ---
      if (isPulseMode) {
        console.log("🚀 Producción: Pulse Strategic Pill");

        const { data, error } = await supabase.functions.invoke("generate-briefing-pill", {
          body: {
            selected_source_ids: values.pulse_source_ids,
            voice_gender: values.voiceGender,
            user_id: user.id,
            // Enviamos el script editado por el usuario para la síntesis de voz
            final_script: values.final_script,
            final_title: values.final_title
          }
        });

        if (error) throw new Error(error.message);

        if (data.success && data.podcast_id) {
          toast({ title: "Píldora Forjada", description: "Redirigiendo a la pantalla de forja." });
          router.push(`/podcast/${data.podcast_id}`);
        }
      }
      // --- VÍA B: PRODUCCIÓN ESTÁNDAR (LONG-FORM) ---
      else {
        console.log("🎬 Producción: Podcast Narrativo Estándar");

        const { data, error } = await supabase.functions.invoke("queue-podcast-job", {
          body: values,
        });

        if (error) throw new Error(error.message);

        if (data.success && data.pod_id) {
          toast({ title: "Producción Iniciada", description: "Moviendo a fase de activos multimedia." });
          router.push(`/podcast/${data.pod_id}`);
        }
      }

      // Reinicio del formulario tras éxito de envío
      clearDraft();

    } catch (err: any) {
      console.error("Production Submission Error:", err);
      toast({
        title: "Error en Producción",
        description: err.message || "La malla de funciones no respondió correctamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, user, getValues, router, clearDraft, toast]);

  /**
   * deleteDraft
   * Limpieza de la tabla de borradores (Bóveda).
   */
  const deleteDraft = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from("podcast_drafts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Sesión eliminada de la bóveda" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Fallo al purgar borrador", variant: "destructive" });
    }
  }, [supabase, toast, router]);

  /**
   * analyzeLocalEnvironment
   * Módulo de Visión Situacional (Placeholder para coherencia de LayoutShell)
   */
  const analyzeLocalEnvironment = useCallback(async () => {
    console.log("[NicePod-Local] Analizando entorno para Local Soul...");
    // Implementación específica si el flujo lo requiere
  }, []);

  return {
    isGenerating,
    isSubmitting,
    generateDraft,
    handleSubmitProduction,
    deleteDraft,
    analyzeLocalEnvironment
  };
}