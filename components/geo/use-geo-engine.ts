// components/geo/use-geo-engine.ts
// VERSIÓN: 6.1 (Madrid Resonance Standard - Full Integrity & Zero Abbreviations)
// Misión: Gestionar el ciclo de vida sensorial geoespacial y la comunicación con la IA.

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useState } from 'react';

/**
 * GeoState: Define los estados finitos del motor de localización.
 * IDLE: Estado inicial de reposo.
 * SCANNING: Capturando coordenadas GPS, telemetría climática y análisis visual.
 * ANALYZING: Fase de juicio semántico (Witness, Not Diarist).
 * REJECTED: El aporte fue denegado por el Editor Urbano.
 * ACCEPTED: Guion forjado y listo para la fase de grabación.
 */
export type GeoState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'REJECTED' | 'ACCEPTED';

/**
 * GeoContextData: Estructura de datos que almacena el dossier del lugar actual.
 */
export interface GeoContextData {
  weather?: {
    temp_c: number;
    condition: string;
    is_day: boolean
  };
  place?: string;
  draftId?: string;
  rejectionReason?: string;
  script?: string;
  imageAnalysis?: string;
}

/**
 * useGeoEngine: Hook maestro para la interacción situacional de NicePod.
 */
export function useGeoEngine() {
  const { supabase } = useAuth();
  const { toast } = useToast();

  // Estado operativo del motor
  const [status, setStatus] = useState<GeoState>('IDLE');

  // Datos recuperados de la ciudad y la IA
  const [data, setData] = useState<GeoContextData>({});

  /**
   * scanEnvironment
   * Realiza la fusión de sensores físicos y digitales.
   * Invocado automáticamente al entrar o manualmente al capturar una imagen.
   */
  const scanEnvironment = useCallback(async (image_base64?: string) => {
    setStatus('SCANNING');

    // Validación de hardware
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast({
        title: "Error de Sensores",
        description: "El sistema GPS no está disponible en este dispositivo.",
        variant: "destructive"
      });
      setStatus('IDLE');
      return;
    }

    // Captura de coordenadas con alta precisión
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log(`🛰️ [GeoEngine] Capturando contexto en: ${position.coords.latitude}, ${position.coords.longitude}`);

          // Invocación a la Estación 1 del pipeline Geoespacial
          const { data: response, error: invokeError } = await supabase.functions.invoke('geo-ingest-context', {
            body: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              altitude: position.coords.altitude,
              image_base64: image_base64
            }
          });

          if (invokeError) throw invokeError;

          // Actualización atómica de los datos del dossier
          setData({
            weather: response.dossier?.weather,
            place: response.dossier?.detected_place?.name,
            draftId: response.draft_id,
            imageAnalysis: response.dossier?.visual_summary
          });

          setStatus('ANALYZING');

        } catch (err: any) {
          console.error("🔥 [GeoEngine-Fatal]:", err.message);
          toast({
            title: "Fallo de Red",
            description: "No se pudo sincronizar con la Bóveda de Madrid.",
            variant: "destructive"
          });
          setStatus('IDLE');
        }
      },
      (geoError) => {
        console.warn("⚠️ [GeoEngine] GPS denegado:", geoError.message);
        toast({
          title: "Acceso Denegado",
          description: "NicePod requiere permisos de ubicación para animar la ciudad.",
          variant: "destructive"
        });
        setStatus('IDLE');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, [supabase, toast]);

  /**
   * [CONTROL DE INICIO]: Efecto de Handshake Inicial
   * Activa los sensores al cargar el componente siempre que el estado sea IDLE.
   * Se incluyen todas las dependencias para cumplir con el estándar de Next.js 14.
   */
  useEffect(() => {
    let active = true;

    if (active && status === 'IDLE') {
      scanEnvironment();
    }

    return () => {
      active = false;
    };
  }, [scanEnvironment, status]);

  /**
   * submitIntent
   * Envía la intención narrativa del usuario al Juez Semántico y genera el guion.
   */
  const submitIntent = useCallback(async (intentText: string) => {
    if (!data.draftId) {
      toast({
        title: "Sesión Inexistente",
        description: "El borrador geoespacial no se ha inicializado correctamente."
      });
      return;
    }

    setStatus('SCANNING');

    try {
      // 1. Fase de Arbitraje (Router Semántico)
      const { data: routerResponse, error: routerError } = await supabase.functions.invoke('geo-semantic-router', {
        body: {
          draft_id: data.draftId,
          user_intent_text: intentText
        }
      });

      if (routerError) throw routerError;

      if (!routerResponse.success) {
        // El Editor Urbano ha rechazado el contenido por ser personal o irrelevante
        setStatus('REJECTED');
        setData((currentData) => {
          return {
            ...currentData,
            rejectionReason: routerResponse.reason
          };
        });
      } else {
        // 2. Fase de Forja (Generación de Contenido Inmersivo)
        const { data: generationResponse, error: generationError } = await supabase.functions.invoke('geo-generate-content', {
          body: {
            draft_id: data.draftId,
            classification: routerResponse.classification
          }
        });

        if (generationError) throw generationError;

        // Éxito: El guion está listo para la terminal de grabación
        setData((currentData) => {
          return {
            ...currentData,
            script: generationResponse.script
          };
        });
        setStatus('ACCEPTED');
      }
    } catch (err: any) {
      console.error("🔥 [GeoEngine-IA-Error]:", err.message);
      toast({
        title: "Error de Inteligencia",
        description: "La forja narrativa ha sido interrumpida por los servidores de IA.",
        variant: "destructive"
      });
      setStatus('ANALYZING'); // Devolvemos al estado previo para permitir reintento
    }
  }, [data.draftId, supabase, toast]);

  /**
   * reset
   * Limpia el buffer de datos y devuelve el motor al estado inicial.
   */
  const reset = useCallback(() => {
    console.log("🧹 [GeoEngine] Limpiando memoria situacional...");
    setStatus('IDLE');
    setData({});
  }, []);

  // Exposición de la interfaz operativa del motor
  return {
    status,
    data,
    scanEnvironment,
    submitIntent,
    reset
  };
}