/**
 * ARCHIVO: components/create-flow/hooks/use-flow-actions.tsx
 * VERSIÓN: 6.0 (NicePod Master Action Orchestrator - Full ZAP & BSS Compliance Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Centralizar la comunicación con las Edge Functions y garantizar la 
 * integridad de la Bóveda Staging mediante un puente seguro entre el cliente 
 * y el motor de inteligencia.
 * [REFORMA V6.0]: Sincronización nominal absoluta con el AuthProvider V5.2. 
 * Se sustituyen los alias de legado ('user', 'supabase') por descriptores 
 * industriales ('authenticatedUser', 'supabaseSovereignClient'). Purificación 
 * total bajo la Zero Abbreviations Policy (ZAP) y erradicación del tipo 'any'.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

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
 * INTERFAZ: UseFlowActionsProperties
 */
interface UseFlowActionsProperties {
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
  clearDraft: () => void;
}

/**
 * HOOK: useFlowActions
 * El motor de transición y mutación de la terminal de forja.
 */
export function useFlowActions({ transitionTo, goBack, clearDraft }: UseFlowActionsProperties) {
  /**
   * [SINCRO V6.0]: Desestructuración alineada con el contrato soberano de Auth.
   * Se elimina la dependencia de los alias temporales de compatibilidad.
   */
  const { supabaseSovereignClient, authenticatedUser } = useAuth();
  
  const { toast } = useToast();
  const navigationRouter = useRouter();
  const { getValues, setValue } = useFormContext<PodcastCreationData>();

  const [isGeneratingProcessActive, setIsGeneratingProcessActive] = useState<boolean>(false);
  const [isSubmittingProcessActive, setIsSubmittingProcessActive] = useState<boolean>(false);

  /**
   * generateDraftAction: FASE DE INTELIGENCIA (Standard/Learn)
   * Misión: Iniciar la orquestación del Oráculo para la creación de la crónica.
   */
  const generateDraftAction = useCallback(async () => {
    if (!authenticatedUser) {
      toast({ title: "Acceso denegado", description: "Identidad del Voyager no verificada.", variant: "destructive" });
      return;
    }
    
    setIsGeneratingProcessActive(true);
    
    try {
      const currentFormValues = getValues();
      const isPulseMissionActive = currentFormValues.purpose === 'pulse';

      // Mapeo de Frontera (Boundary): Cristal (ZAP/camelCase) -> Metal (Legacy snake_case)
      const legacyEdgeFunctionPayload = {
        ...currentFormValues,
        draft_id: currentFormValues.draftIdentification,
        pulse_source_ids: isPulseMissionActive ? currentFormValues.pulseSourceIdentifications : undefined,
        creation_mode: currentFormValues.creationMode,
        final_title: currentFormValues.finalTitle,
        final_script: currentFormValues.finalScript
      };

      const { data: edgeFunctionResponseData, error: edgeFunctionException } = await supabaseSovereignClient.functions.invoke("start-draft-process", {
        body: legacyEdgeFunctionPayload,
      });

      if (edgeFunctionException) throw new Error(edgeFunctionException.message);

      // Sincronía Nominal: Metal -> Cristal
      const returnedDraftIdentification = edgeFunctionResponseData.draftIdentification || edgeFunctionResponseData.draft_id;

      if (edgeFunctionResponseData.success && returnedDraftIdentification) {
        setValue("draftIdentification", returnedDraftIdentification);
        transitionTo("DRAFT_GENERATION_LOADER");
      }
    } catch (hardwareException: unknown) {
      const exceptionMessage = hardwareException instanceof Error ? hardwareException.message : String(hardwareException);
      toast({ title: "Fallo de Orquestación", description: exceptionMessage, variant: "destructive" });
    } finally {
      setIsGeneratingProcessActive(false);
    }
  }, [supabaseSovereignClient, authenticatedUser, getValues, setValue, transitionTo, toast]);

  /**
   * hydrateDraftDataAction: MOTOR DE RESCATE DE CONOCIMIENTO
   * Misión: Garantizar que las fuentes y el guion fluyan desde Supabase al formulario.
   */
  const hydrateDraftDataAction = useCallback(async () => {
    const currentDraftIdentification = getValues('draftIdentification');
    
    if (!currentDraftIdentification) return false;
    
    try {
      const draftRecordData = await getDraftById(currentDraftIdentification);
      
      if (draftRecordData) {
        setValue('finalTitle', draftRecordData.title, { shouldValidate: true });
        
        if (draftRecordData.script_text) {
          const parsedPodcastScript = draftRecordData.script_text as unknown as PodcastScript;
          setValue('finalScript', parsedPodcastScript.script_body || parsedPodcastScript.script_plain || "", { shouldValidate: true });
        }
        
        if (draftRecordData.sources && Array.isArray(draftRecordData.sources)) {
          // [BSS]: Forzamos el tipado para evitar la filtración del 'any' implícito.
          setValue('sources', draftRecordData.sources as unknown as ResearchSource[], { shouldValidate: true });
        }
        return true;
      }
      return false;
    } catch (databaseOperationException) {
      console.error("🔥 [Hydration-Error]:", databaseOperationException);
      return false;
    }
  }, [getValues, setValue]);

  /**
   * analyzeLocalEnvironmentAction: FASE DE INVESTIGACIÓN SITUACIONAL (GEO)
   */
  const analyzeLocalEnvironmentAction = useCallback(async (base64ImageContext?: string) => {
    if (!authenticatedUser) return;
    
    setIsGeneratingProcessActive(true);
    
    try {
      const currentFormValues = getValues();
      
      const { data: edgeFunctionResponseData, error: edgeFunctionException } = await supabaseSovereignClient.functions.invoke("get-local-discovery", {
        body: {
          latitude: currentFormValues.location?.latitude,
          longitude: currentFormValues.location?.longitude,
          image_base64: base64ImageContext
        }
      });
      
      if (edgeFunctionException) throw new Error(edgeFunctionException.message);
      
      if (edgeFunctionResponseData.success) {
        // Sincronía Nominal: Metal ('dossier') -> Cristal ('discoveryContext')
        const environmentalDiscoveryDossier = edgeFunctionResponseData.discoveryContext || edgeFunctionResponseData.dossier;

        setValue("discoveryContext", environmentalDiscoveryDossier);

        if (edgeFunctionResponseData.sources && Array.isArray(edgeFunctionResponseData.sources)) {
          const purifiedResearchSourcesCollection = edgeFunctionResponseData.sources.map((sourceItem: Record<string, unknown>) => ({
            ...sourceItem,
            uniformResourceLocator: sourceItem.uniformResourceLocator || sourceItem.url
          }));
          setValue("sources", purifiedResearchSourcesCollection as unknown as ResearchSource[]);
        }

        transitionTo("LOCAL_ANALYSIS_LOADER");
      }
    } catch (hardwareException: unknown) {
      toast({ title: "Error de Visión", description: "No pudimos reconocer el entorno urbano.", variant: "destructive" });
    } finally {
      setIsGeneratingProcessActive(false);
    }
  }, [supabaseSovereignClient, authenticatedUser, getValues, setValue, transitionTo, toast]);

  /**
   * handleSubmitProductionAction: FASE DE MATERIALIZACIÓN (BINARIOS)
   */
  const handleSubmitProductionAction = useCallback(async () => {
    if (!authenticatedUser) return;
    
    setIsSubmittingProcessActive(true);
    
    try {
      const currentFormValues = getValues();
      const isPulseMissionActive = currentFormValues.purpose === 'pulse';
      const isLocalSoulMissionActive = currentFormValues.purpose === 'local_soul';
      
      const targetEdgeFunctionEndpoint = isPulseMissionActive 
        ? "generate-briefing-pill" 
        : isLocalSoulMissionActive 
            ? "geo-publish-content" 
            : "queue-podcast-job";

      // Mapeo de Frontera para Producción (Retrocompatibilidad con Edge Functions)
      const legacyProductionPayload = {
        ...currentFormValues,
        draft_id: currentFormValues.draftIdentification,
        creation_mode: currentFormValues.creationMode,
        final_title: currentFormValues.finalTitle,
        final_script: currentFormValues.finalScript,
        pulse_source_ids: currentFormValues.pulseSourceIdentifications,
        sources: currentFormValues.sources?.map(sourceItem => ({
          ...sourceItem,
          url: sourceItem.uniformResourceLocator
        }))
      };

      const { data: edgeFunctionResponseData, error: edgeFunctionException } = await supabaseSovereignClient.functions.invoke(targetEdgeFunctionEndpoint, { 
          body: legacyProductionPayload 
      });
      
      if (edgeFunctionException) throw new Error(edgeFunctionException.message);

      const finalPodcastIdentification = edgeFunctionResponseData.pod_id || edgeFunctionResponseData.podcast_id;
      
      if (edgeFunctionResponseData.success && finalPodcastIdentification) {
        navigationRouter.push(`/podcast/${finalPodcastIdentification}`);
        clearDraft();
      }
    } catch (hardwareException: unknown) {
      const exceptionMessage = hardwareException instanceof Error ? hardwareException.message : String(hardwareException);
      toast({ title: "Fallo en Producción", description: exceptionMessage, variant: "destructive" });
    } finally {
      setIsSubmittingProcessActive(false);
    }
  }, [supabaseSovereignClient, authenticatedUser, getValues, navigationRouter, clearDraft, toast]);

  return {
    isGeneratingProcessActive,
    isSubmittingProcessActive,
    generateDraftAction,
    hydrateDraftDataAction,
    analyzeLocalEnvironmentAction,
    handleSubmitProductionAction,
    deleteDraftAction: async (draftIdentification: number) => {
      await supabaseSovereignClient.from("podcast_drafts").delete().eq("id", draftIdentification);
      navigationRouter.refresh();
    }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Contract Alignment: Se resolvieron los errores de TS al sincronizar 
 *    la desestructuración con los descriptores 'supabaseSovereignClient' y 
 *    'authenticatedUser' del AuthProvider V5.2.
 * 2. Type Sovereignty: Se erradicó el uso de 'any' en los bloques try/catch, 
 *    sustituyéndolo por 'unknown' y aplicando type guarding estricto para extraer 
 *    el mensaje de error, satisfaciendo el Build Shield.
 * 3. ZAP Enforcement: Purificación total de variables locales (values -> 
 *    currentFormValues, err -> hardwareException).
 */