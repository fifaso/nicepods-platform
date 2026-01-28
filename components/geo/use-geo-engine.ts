// components/geo/use-geo-engine.ts
// VERSIÓN: 1.0 (Bridge to Geo-Suite Edge Functions)

import { useAuth } from '@/hooks/use-auth'; // Tu hook de auth existente
import { useToast } from '@/hooks/use-toast';
import { useCallback, useState } from 'react';

export type GeoState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'REJECTED' | 'ACCEPTED' | 'RECORDING';

export interface GeoContextData {
  weather?: { temp_c: number; condition: string };
  place?: string;
  draftId?: string;
  rejectionReason?: string;
  script?: string;
}

export function useGeoEngine() {
  const { supabase } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<GeoState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});

  // 1. INGESTA: Captura GPS y Sensores
  const scanEnvironment = useCallback(async () => {
    setStatus('SCANNING');

    if (!navigator.geolocation) {
      toast({ title: "Error GPS", description: "Tu dispositivo no soporta geolocalización.", variant: "destructive" });
      setStatus('IDLE');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Llamada a tu nueva función 'ingest-context'
          const { data: res, error } = await supabase.functions.invoke('geo-ingest-context', {
            body: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              altitude: pos.coords.altitude,
              heading: pos.coords.heading,
              // Aquí podrías pasar image_base64 si integras cámara
            }
          });

          if (error) throw error;

          setData(prev => ({
            ...prev,
            weather: res.context.weather,
            place: res.context.place,
            draftId: res.draft_id
          }));

          setStatus('ANALYZING'); // Listo para pedir input al usuario

        } catch (e: any) {
          console.error("Ingest Error:", e);
          toast({ title: "Fallo de Sensores", description: "No pudimos conectar con la Bóveda de Madrid.", variant: "destructive" });
          setStatus('IDLE');
        }
      },
      (err) => {
        toast({ title: "GPS Bloqueado", description: "Necesitamos permiso para ver dónde estás.", variant: "destructive" });
        setStatus('IDLE');
      },
      { enableHighAccuracy: true }
    );
  }, [supabase, toast]);

  // 2. JUICIO: Envía la intención al "Semantic Router"
  const submitIntent = useCallback(async (userIntentText: string) => {
    if (!data.draftId) return;
    setStatus('SCANNING'); // Reusamos estado de carga visual

    try {
      const { data: res, error } = await supabase.functions.invoke('geo-semantic-router', {
        body: {
          draft_id: data.draftId,
          user_intent_text: userIntentText
        }
      });

      if (error) throw error;

      if (!res.success) {
        // EL EDITOR URBANO RECHAZÓ EL CONTENIDO
        setStatus('REJECTED');
        setData(prev => ({ ...prev, rejectionReason: res.reason }));
        toast({ title: "Contenido Rechazado", description: "El Editor Urbano requiere más foco en la ciudad.", variant: "default" });
      } else {
        // APROBADO -> Generamos guion
        await generateFinalScript(data.draftId, res.classification);
      }

    } catch (e) {
      toast({ title: "Error de Juicio", description: "El router semántico no responde.", variant: "destructive" });
      setStatus('ANALYZING');
    }
  }, [data.draftId, supabase, toast]);

  // 3. GENERACIÓN: Crea el guion final
  const generateFinalScript = async (draftId: string, classification: string) => {
    try {
      const { data: res, error } = await supabase.functions.invoke('geo-generate-geo-content', {
        body: { draft_id: draftId, classification }
      });

      if (error) throw error;

      setData(prev => ({ ...prev, script: res.script }));
      setStatus('ACCEPTED'); // Éxito final

    } catch (e) {
      console.error("Gen Error", e);
    }
  };

  const reset = () => {
    setStatus('IDLE');
    setData({});
  };

  return {
    status,
    data,
    scanEnvironment,
    submitIntent,
    reset
  };
}