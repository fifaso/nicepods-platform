// components/geo/use-geo-engine.ts
// VERSIÓN: 4.0 (Madrid Resonance - Full Synchronization & Stability)

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useState } from 'react';

export type GeoState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'REJECTED' | 'ACCEPTED';

export interface GeoContextData {
  weather?: {
    temp_c: number;
    condition: string;
    is_day: boolean;
  };
  place?: string;
  draftId?: string;
  rejectionReason?: string;
  script?: string;
  classification?: string;
}

export function useGeoEngine() {
  const { supabase } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<GeoState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});

  // 1. ESCANEO Y DETECCIÓN DE CONTEXTO
  const scanEnvironment = useCallback(async () => {
    setStatus('SCANNING');

    if (!navigator.geolocation) {
      toast({
        title: "Sensores no disponibles",
        description: "Tu navegador no soporta geolocalización.",
        variant: "destructive"
      });
      setStatus('IDLE');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Invocación exacta según lista de Supabase CLI
          const { data: response, error } = await supabase.functions.invoke('geo-ingest-context', {
            body: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              altitude: position.coords.altitude,
              heading: position.coords.heading
            }
          });

          if (error) throw error;

          // Mapeo seguro de la respuesta de la Edge Function
          setData({
            weather: response.dossier?.weather,
            place: response.dossier?.detected_place?.name || "Ubicación en Madrid",
            draftId: response.draft_id
          });

          setStatus('ANALYZING');

        } catch (err: any) {
          console.error("Error en Ingesta Geo:", err);
          toast({
            title: "Fallo de Sincronización",
            description: "No pudimos conectar con los sensores de la ciudad.",
            variant: "destructive"
          });
          setStatus('IDLE');
        }
      },
      (err) => {
        const message = err.code === 1 ? "Acceso al GPS denegado." : "No se pudo fijar la señal GPS.";
        toast({ title: "Fallo de GPS", description: message, variant: "destructive" });
        setStatus('IDLE');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [supabase, toast]);

  // 2. ENVÍO DE INTENCIÓN AL EDITOR URBANO
  const submitIntent = useCallback(async (intentText: string) => {
    if (!data.draftId) return;
    setStatus('SCANNING');

    try {
      // Invocación al Router Semántico
      const { data: routerResponse, error: routerError } = await supabase.functions.invoke('geo-semantic-router', {
        body: {
          draft_id: data.draftId,
          user_intent_text: intentText
        }
      });

      if (routerError) throw routerError;

      if (!routerResponse.success) {
        // Manejo de rechazo por contenido personal/irrelevante
        setStatus('REJECTED');
        setData(prev => ({ ...prev, rejectionReason: routerResponse.reason }));
      } else {
        // Aprobado: Procedemos a generar el guion inmersivo
        const { data: genResponse, error: genError } = await supabase.functions.invoke('geo-generate-content', {
          body: {
            draft_id: data.draftId,
            classification: routerResponse.classification
          }
        });

        if (genError) throw genError;

        setData(prev => ({
          ...prev,
          script: genResponse.script,
          classification: routerResponse.classification
        }));
        setStatus('ACCEPTED');
      }
    } catch (err: any) {
      console.error("Error en Proceso Semántico:", err);
      toast({ title: "Error de IA", description: "El Editor Urbano no pudo procesar tu idea.", variant: "destructive" });
      setStatus('ANALYZING');
    }
  }, [data.draftId, supabase, toast]);

  const reset = useCallback(() => {
    setStatus('IDLE');
    setData({});
  }, []);

  return {
    status,
    data,
    scanEnvironment,
    submitIntent,
    reset
  };
}