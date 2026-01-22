// hooks/use-pulse-engine.ts
// VERSIÓN: 1.0 (Pulse Engine Orchestrator - Logic Layer)

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PulseMatchResult } from "@/types/pulse";
import { useCallback, useState } from "react";

/**
 * usePulseEngine
 * Hook centralizado para la gestión de inteligencia proactiva NicePod.
 */
export function usePulseEngine() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();

  // --- ESTADOS DE CARGA Y DATOS ---
  const [isUpdating, setIsUpdating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [signals, setSignals] = useState<PulseMatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * updateDNA
   * Envía los resultados de la entrevista híbrida (Tags + Voz) para
   * recalcular el vector de interés del usuario.
   */
  const updateDNA = useCallback(async (params: {
    profile_text: string;
    expertise_level?: number;
    negative_interests?: string[];
  }) => {
    if (!user) return { success: false, error: "No authenticated user" };

    setIsUpdating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('update-user-dna', {
        body: params
      });

      if (functionError) throw new Error(functionError.message);

      toast({
        title: "Sintonía Exitosa",
        description: "Tu ADN cognitivo ha sido actualizado en la matriz.",
      });

      return { success: true, data };
    } catch (err: any) {
      const msg = err.message || "Fallo al sincronizar ADN";
      setError(msg);
      toast({ title: "Error de Sintonía", description: msg, variant: "destructive" });
      return { success: false, error: msg };
    } finally {
      setIsUpdating(false);
    }
  }, [supabase, user, toast]);

  /**
   * getRadarSignals
   * Consulta el 'pulse-matcher' para obtener el Top 20 de noticias/papers
   * personalizados para el ADN actual del usuario.
   */
  const getRadarSignals = useCallback(async () => {
    if (!user) return { success: false, error: "No authenticated user" };

    setIsScanning(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('pulse-matcher');

      if (functionError) throw new Error(functionError.message);

      if (data.success) {
        setSignals(data.signals);
        return {
          success: true,
          signals: data.signals as PulseMatchResult[],
          is_fallback: data.is_fallback
        };
      } else {
        throw new Error("El radar no devolvió señales válidas.");
      }
    } catch (err: any) {
      const msg = err.message || "Fallo al interceptar señales";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsScanning(false);
    }
  }, [supabase, user]);

  /**
   * clearSignals
   * Limpia el búfer local de señales para forzar un nuevo escaneo.
   */
  const clearSignals = useCallback(() => {
    setSignals([]);
    setError(null);
  }, []);

  return {
    // Estados
    isUpdating,
    isScanning,
    signals,
    error,
    // Acciones
    updateDNA,
    getRadarSignals,
    clearSignals
  };
}