// hooks/use-pulse-engine.ts
// VERSIÓN: 2.0

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
  signals: PulseMatchResult[];
  error: string | null;
  updateDNA: (params: {
    profile_text: string;
    expertise_level?: number;
    negative_interests?: string[];
  }) => Promise<{ success: boolean; data?: any; error?: string }>;
  getRadarSignals: () => Promise<{ success: boolean; signals: PulseMatchResult[]; is_fallback: boolean }>;
  clearSignals: () => void;
}

/**
 * HOOK: usePulseEngine
 * El motor central para la gestión de inteligencia personalizada en NicePod V2.5.
 */
export function usePulseEngine(): UsePulseEngineReturn {
  const { supabase, user } = useAuth();
  const { toast } = useToast();

  // --- ESTADOS DE CARGA Y TELEMETRÍA ---
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [signals, setSignals] = useState<PulseMatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * ACCIÓN: updateDNA
   * Misión: Recalcular el vector de interés (768d) del curador.
   * 
   * [PROCESAMIENTO]:
   * Envía la narrativa del usuario a la Edge Function 'update-user-dna'
   * para actualizar la tabla 'user_interest_dna' en PostgreSQL.
   */
  const updateDNA = useCallback(async (params: {
    profile_text: string;
    expertise_level?: number;
    negative_interests?: string[];
  }) => {
    // Verificación de Soberanía: Solo usuarios autenticados pueden mutar su ADN.
    if (!user || !supabase) {
      return { success: false, error: "AUTENTICACIÓN_REQUERIDA" };
    }

    setIsUpdating(true);
    setError(null);

    try {
      console.info("🧠 [Pulse-Engine] Sincronizando ADN Cognitivo...");

      const { data, error: functionError } = await supabase.functions.invoke('update-user-dna', {
        body: params
      });

      if (functionError) throw new Error(functionError.message);

      toast({
        title: "Sintonía Exitosa",
        description: "Tu ADN cognitivo ha sido actualizado en la Bóveda.",
      });

      return { success: true, data };

    } catch (err: any) {
      const msg = err.message || "Fallo al sincronizar ADN.";
      console.error("🔥 [Pulse-Engine-Fatal][DNA]:", msg);
      setError(msg);
      toast({
        title: "Error de Sintonía",
        description: "No se pudo estabilizar la conexión con la matriz cognitiva.",
        variant: "destructive"
      });
      return { success: false, error: msg };
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
      return { success: false, error: "IDENTIDAD_NO_VERIFICADA", signals: [], is_fallback: true };
    }

    setIsScanning(true);
    setError(null);

    try {
      console.info("🛰️ [Pulse-Engine] Iniciando escaneo de radar proactivo...");

      // Llamada al trabajador de emparejamiento (Pulse Matcher)
      const { data, error: functionError } = await supabase.functions.invoke('pulse-matcher');

      if (functionError) throw new Error(functionError.message);

      if (data && data.success) {
        const receivedSignals = data.signals as PulseMatchResult[];
        setSignals(receivedSignals);

        console.info(`✅ [Pulse-Engine] Escaneo finalizado. Señales captadas: ${receivedSignals.length}`);

        return {
          success: true,
          signals: receivedSignals,
          is_fallback: data.is_fallback || false
        };
      } else {
        throw new Error("El radar no devolvió señales válidas en este ciclo.");
      }

    } catch (err: any) {
      const msg = err.message || "Fallo al interceptar señales del radar.";
      console.error("🔥 [Pulse-Engine-Fatal][Scanner]:", msg);
      setError(msg);
      return { success: false, error: msg, signals: [], is_fallback: true };
    } finally {
      setIsScanning(false);
    }
  }, [supabase, user]);

  /**
   * ACCIÓN: clearSignals
   * Limpia el búfer de inteligencia local para permitir un re-escaneo limpio.
   */
  const clearSignals = useCallback(() => {
    setSignals([]);
    setError(null);
  }, []);

  return {
    isUpdating,
    isScanning,
    signals,
    error,
    updateDNA,
    getRadarSignals,
    clearSignals
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
 */