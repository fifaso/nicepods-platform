// hooks/use-pulse-engine.ts
// VERSIÓN: 2.1 (NicePod Pulse Engine - Nominal Sovereignty Edition)
// Misión: Orquestar la captura de inteligencia proactiva y la gestión del ADN cognitivo del curador.

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PulseMatchResult } from "@/types/pulse";
import { useCallback, useState } from "react";

/**
 * INTERFAZ: UsePulseEngineReturn
 * Define el contrato de estado y acciones que este hook entrega a la Workstation.
 */
interface UsePulseEngineReturn {
  isUpdating: boolean;
  isScanning: boolean;
  intelligenceSignals: PulseMatchResult[];
  engineError: string | null;
  updateDNA: (updateParameters: {
    profile_text: string;
    expertise_level?: number;
    negative_interests?: string[];
  }) => Promise<{ success: boolean; functionResponseData?: unknown; errorIdentification?: string }>;
  getRadarSignals: () => Promise<{ success: boolean; intelligenceSignals: PulseMatchResult[]; isFallbackMode: boolean }>;
  clearIntelligenceSignals: () => void;
}

/**
 * HOOK: usePulseEngine
 * El motor central para la gestión de inteligencia personalizada en NicePod V4.0.
 */
export function usePulseEngine(): UsePulseEngineReturn {
  const { supabase, user } = useAuth();
  const { toast } = useToast();

  // --- ESTADOS DE CARGA Y TELEMETRÍA ---
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [intelligenceSignals, setIntelligenceSignals] = useState<PulseMatchResult[]>([]);
  const [engineError, setEngineError] = useState<string | null>(null);

  /**
   * ACCIÓN: updateDNA
   * Misión: Recalcular el vector de interés (768d) del curador.
   * 
   * [PROCESAMIENTO]:
   * Envía la narrativa del usuario a la Edge Function 'update-user-dna'
   * para actualizar la tabla 'user_interest_dna' en PostgreSQL.
   */
  const updateDNA = useCallback(async (updateParameters: {
    profile_text: string;
    expertise_level?: number;
    negative_interests?: string[];
  }) => {
    // Verificación de Soberanía: Solo usuarios autenticados pueden mutar su ADN.
    if (!user || !supabase) {
      return { success: false, errorIdentification: "AUTENTICACIÓN_REQUERIDA" };
    }

    setIsUpdating(true);
    setEngineError(null);

    try {
      console.info("🧠 [Pulse-Engine] Sincronizando ADN Cognitivo...");

      const { data: functionResponseData, error: functionInvokeError } = await supabase.functions.invoke('update-user-dna', {
        body: updateParameters
      });

      if (functionInvokeError) throw new Error(functionInvokeError.message);

      toast({
        title: "Sintonía Exitosa",
        description: "Tu ADN cognitivo ha sido actualizado en la Bóveda.",
      });

      return { success: true, functionResponseData };

    } catch (caughtError: unknown) {
      const errorMessage = caughtError instanceof Error ? caughtError.message : "Fallo al sincronizar ADN.";
      console.error("🔥 [Pulse-Engine-Fatal][DNA]:", errorMessage);
      setEngineError(errorMessage);
      toast({
        title: "Error de Sintonía",
        description: "No se pudo estabilizar la conexión con la matriz cognitiva.",
        variant: "destructive"
      });
      return { success: false, errorIdentification: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  }, [supabase, user, toast]);

  /**
   * ACCIÓN: getRadarSignals
   * Misión: Interceptar señales de conocimiento fresco (noticias/papers) 
   * que resuenen con el ADN del curador.
   */
  const getRadarSignals = useCallback(async () => {
    if (!user || !supabase) {
      return { success: false, errorIdentification: "IDENTIDAD_NO_VERIFICADA", intelligenceSignals: [], isFallbackMode: true };
    }

    setIsScanning(true);
    setEngineError(null);

    try {
      console.info("🛰️ [Pulse-Engine] Iniciando escaneo de radar proactivo...");

      // Llamada al trabajador de emparejamiento (Pulse Matcher)
      const { data: functionResponseData, error: functionInvokeError } = await supabase.functions.invoke('pulse-matcher');

      if (functionInvokeError) throw new Error(functionInvokeError.message);

      if (functionResponseData && functionResponseData.success) {
        const receivedIntelligenceSignals = functionResponseData.signals as PulseMatchResult[];
        setIntelligenceSignals(receivedIntelligenceSignals);

        console.info(`✅ [Pulse-Engine] Escaneo finalizado. Señales captadas: ${receivedIntelligenceSignals.length}`);

        return {
          success: true,
          intelligenceSignals: receivedIntelligenceSignals,
          isFallbackMode: functionResponseData.is_fallback || false
        };
      } else {
        throw new Error("El radar no devolvió señales válidas en este ciclo.");
      }

    } catch (caughtError: unknown) {
      const errorMessage = caughtError instanceof Error ? caughtError.message : "Fallo al interceptar señales del radar.";
      console.error("🔥 [Pulse-Engine-Fatal][Scanner]:", errorMessage);
      setEngineError(errorMessage);
      return { success: false, errorIdentification: errorMessage, intelligenceSignals: [], isFallbackMode: true };
    } finally {
      setIsScanning(false);
    }
  }, [supabase, user]);

  /**
   * ACCIÓN: clearIntelligenceSignals
   * Limpia el búfer de inteligencia local para permitir un re-escaneo limpio.
   */
  const clearIntelligenceSignals = useCallback(() => {
    setIntelligenceSignals([]);
    setEngineError(null);
  }, []);

  return {
    isUpdating,
    isScanning,
    intelligenceSignals,
    engineError,
    updateDNA,
    getRadarSignals,
    clearIntelligenceSignals
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Independencia Semántica: Este hook no depende de la vectorización de query
 *    del cliente (vectorize-query), ya que las Edge Functions invocadas 
 *    realizan su propio procesamiento interno de embeddings.
 * 2. Feedback UX: El estado 'isScanning' permite a componentes como el 
 *    'PulseRadar' mostrar animaciones cinemáticas mientras la IA busca señales.
 * 3. Resiliencia: Se ha implementado un manejo de errores que informa al usuario
 *    mediante Toasts, manteniendo la transparencia técnica de la plataforma.
 * 4. Zero Abbreviations Policy: Se han purificado todas las variables de estado
 *    y parámetros internos (engineError, intelligenceSignals, caughtError, etc.).
 */
