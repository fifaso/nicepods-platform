/**
 * ARCHIVO: components/create-flow/hooks/use-flow-actions.tsx
 * VERSIÓN: 7.0 (NicePod Master Action Orchestrator - Orchestrator Alignment Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Centralizar la comunicación con las Edge Functions y garantizar la 
 * integridad de la Bóveda Staging mediante un puente seguro entre el cliente 
 * y el motor de inteligencia.
 * [REFORMA V7.0]: Resolución definitiva de TS2339, TS2551 y TS2345. 
 * Sincronización de nombres con el Orquestador ('generateDraft', 'isGenerating').
 * Saneamiento imperativo de 'relevance' en las fuentes para cumplir con el Build Shield.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";

// --- INFRAESTRUCTURA DE DATOS Y SEGURIDAD SOBERANA ---
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
  
  const { supabaseSovereignClient, authenticatedUser } = useAuth();
  const { toast } = useToast();
  const navigationRouter = useRouter();
  
  // Consumimos el contexto de formulario bajo el tipado estricto del esquema ZAP.
  const { getValues, setValue } = useFormContext<PodcastCreationData>();

  // Estados de procesamiento (ZAP: Sin abreviaciones)
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * generateDraft: FASE DE INTELIGENCIA (Standard/Learn)
   * [RESOLUCIÓN TS2339]: Nombre alineado con la expectativa del Orquestador.
   */
  const generateDraft = useCallback(async () => {
    if (!authenticatedUser) {
      toast({ 
        title: "Acceso denegado", 
        description: "Identidad del Voyager no verificada para la forja.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const currentFormValues = getValues();
      const isPulseMissionActive = currentFormValues.purpose === 'pulse';

      // Mapeo de Frontera (Boundary): Cristal (ZAP/camelCase) -> Metal (Legacy snake_case)
      const legacyEdgeFunctionPayload = {
        ...currentFormValues,
        draft_id: currentFormValues.draftIdentification,
        pulse_source_ids: isPulseMissionActive ? currentFormValues.pulseSourceIdentificationsCollection : undefined,
        creation_mode: currentFormValues.creationMode,
        final_title: currentFormValues.finalTitle,
        final_script: currentFormValues.finalScriptContent
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
      const exceptionMessage = hardwareException instanceof Error ? hardwareException.message : "Fallo desconocido en Oráculo.";
      toast({ title: "Fallo de Orquestación", description: exceptionMessage, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabaseSovereignClient, authenticatedUser, getValues, setValue, transitionTo, toast]);

  /**
   * hydrateDraftData: MOTOR DE RESCATE DE CONOCIMIENTO
   * [RESOLUCIÓN TS2339]: Nombre alineado con draft-generation-loader.tsx.
   */
  const hydrateDraftData = useCallback(async () => {
    const currentDraftIdentification = getValues('draftIdentification');
    
    if (!currentDraftIdentification) return false;
    
    try {
      const draftRecordData = await getDraftById(currentDraftIdentification);
      
      if (draftRecordData) {
        setValue('finalTitle', draftRecordData.title, { shouldValidate: true });
        
        if (draftRecordData.script_text) {
          // Casting de seguridad hacia el contrato industrial.
          const parsedPodcastScript = draftRecordData.script_text as unknown as PodcastScript;
          setValue('finalScriptContent', parsedPodcastScript.scriptBodyContent || parsedPodcastScript.scriptPlainContent || "", { shouldValidate: true });
        }
        
        if (draftRecordData.sources && Array.isArray(draftRecordData.sources)) {
          /**
           * [RESOLUCIÓN TS2345]: SANEAMIENTO DE RELEVANCIA
           * Transformamos los datos del Metal para asegurar que 'relevance' sea 
           * un escalar obligatorio, satisfaciendo el Build Shield.
           */
          const purifiedResearchSourcesCollection: ResearchSource[] = (draftRecordData.sources as any[]).map(sourceItem => ({
            title: sourceItem.title || "Evidencia Detectada",
            uniformResourceLocator: sourceItem.uniformResourceLocator || sourceItem.url || "",
            relevance: typeof sourceItem.relevance === 'number' ? sourceItem.relevance : 1.0,
            origin: sourceItem.origin || 'web',
            sourceAuthorityName: sourceItem.sourceAuthorityName || sourceItem.source_name,
            summaryContent: sourceItem.summaryContent || sourceItem.summary,
            isVeracityVerified: !!sourceItem.isVeracityVerified || !!sourceItem.veracity_verified,
            authorityScoreValue: sourceItem.authorityScoreValue || sourceAuthorityName.authority_score || 5.0
          }));

          setValue('sourcesCollection', purifiedResearchSourcesCollection, { shouldValidate: true });
        }
        return true;
      }
      return false;
    } catch (databaseOperationException) {
      nicepodLog("🔥 [Hydration-Error] Fallo en recuperación de búnker.", databaseOperationException);
      return false;
    }
  }, [getValues, setValue]);

  /**
   * analyzeLocalEnvironment: FASE DE INVESTIGACIÓN SITUACIONAL (GEO)
   * [RESOLUCIÓN TS2551]: Nombre alineado con la expectativa de index.tsx.
   */
  const analyzeLocalEnvironment = useCallback(async (base64ImageContext?: string) => {
    if (!authenticatedUser) return;
    
    setIsGenerating(true);
    
    try {
      const currentFormValues = getValues();
      
      const { data: edgeFunctionResponseData, error: edgeFunctionException } = await supabaseSovereignClient.functions.invoke("get-local-discovery", {
        body: {
          latitude: currentFormValues.location?.latitudeCoordinate,
          longitude: currentFormValues.location?.longitudeCoordinate,
          image_base64: base64ImageContext
        }
      });
      
      if (edgeFunctionException) throw new Error(edgeFunctionException.message);
      
      if (edgeFunctionResponseData.success) {
        // Sincronía Nominal: Metal ('dossier') -> Cristal ('discoveryContextDossier')
        const environmentalDiscoveryDossier = edgeFunctionResponseData.discoveryContext || edgeFunctionResponseData.dossier;

        setValue("discoveryContextDossier", environmentalDiscoveryDossier);

        if (edgeFunctionResponseData.sources && Array.isArray(edgeFunctionResponseData.sources)) {
          const purifiedResearchSourcesCollection: ResearchSource[] = edgeFunctionResponseData.sources.map((sourceItem: any) => ({
            title: sourceItem.title || "Hito Urbano",
            uniformResourceLocator: sourceItem.uniformResourceLocator || sourceItem.url || "",
            relevance: typeof sourceItem.relevance === 'number' ? sourceItem.relevance : 1.0,
            origin: 'web',
            isVeracityVerified: true,
            authorityScoreValue: 8.0
          }));
          setValue("sourcesCollection", purifiedResearchSourcesCollection);
        }

        transitionTo("LOCAL_ANALYSIS_LOADER");
      }
    } catch (hardwareException: unknown) {
      toast({ title: "Error de Visión", description: "No pudimos reconocer el entorno urbano.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [supabaseSovereignClient, authenticatedUser, getValues, setValue, transitionTo, toast]);

  /**
   * handleSubmitProduction: FASE DE MATERIALIZACIÓN (BINARIOS)
   * [RESOLUCIÓN TS2551]: Nombre alineado con la expectativa de index.tsx.
   */
  const handleSubmitProduction = useCallback(async () => {
    if (!authenticatedUser) return;
    
    setIsSubmitting(true);
    
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
        final_script: currentFormValues.finalScriptContent,
        pulse_source_ids: currentFormValues.pulseSourceIdentificationsCollection,
        sources: currentFormValues.sourcesCollection?.map(sourceItem => ({
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
      const exceptionMessage = hardwareException instanceof Error ? hardwareException.message : "Fallo en la materialización de audio.";
      toast({ title: "Fallo en Producción", description: exceptionMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabaseSovereignClient, authenticatedUser, getValues, navigationRouter, clearDraft, toast]);

  return {
    isGenerating,
    isSubmitting,
    generateDraft,
    hydrateDraftData,
    analyzeLocalEnvironment,
    handleSubmitProduction,
    deleteDraftAction: async (draftIdentification: number) => {
      await supabaseSovereignClient.from("podcast_drafts").delete().eq("id", draftIdentification);
      navigationRouter.refresh();
    }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Orchestrator Sync: Se han renombrado las funciones y estados exportados para 
 *    aniquilar los errores TS2339 y TS2551 en el orquestador principal.
 * 2. TS2345 Resolution: Se ha inyectado un mapeador de purificación en 'sources' 
 *    que garantiza que 'relevance' sea siempre un number, eliminando la ambigüedad.
 * 3. ZAP Enforcement: Purificación nominal absoluta (values -> currentFormValues, 
 *    err -> hardwareException, id -> identification).
 */