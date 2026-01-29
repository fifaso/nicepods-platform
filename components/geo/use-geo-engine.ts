// components/geo/use-geo-engine.ts
// VERSIÓN: 4.1 (Full Logic Recovery - Hyphenated & Secure)

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useState } from 'react';

export type GeoState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'REJECTED' | 'ACCEPTED';

export interface GeoContextData {
  weather?: { temp_c: number; condition: string; is_day: boolean };
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

  const scanEnvironment = useCallback(async () => {
    setStatus('SCANNING');

    if (!navigator.geolocation) {
      toast({ title: "Error", description: "GPS no disponible", variant: "destructive" });
      setStatus('IDLE');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data: res, error } = await supabase.functions.invoke('geo-ingest-context', {
            body: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              altitude: pos.coords.altitude,
              heading: pos.coords.heading
            }
          });

          if (error) throw error;

          setData({
            weather: res.dossier?.weather,
            place: res.dossier?.detected_place?.name || "Madrid",
            draftId: res.draft_id
          });

          setStatus('ANALYZING');

        } catch (e: any) {
          console.error("Ingest Fail:", e);
          toast({ title: "Fallo de Sensores", variant: "destructive" });
          setStatus('IDLE');
        }
      },
      () => {
        toast({ title: "Acceso GPS denegado", variant: "destructive" });
        setStatus('IDLE');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [supabase, toast]);

  const submitIntent = useCallback(async (intentText: string) => {
    if (!data.draftId) return;
    setStatus('SCANNING');

    try {
      // 1. Validar con el Semantic Router
      const { data: routerRes, error: routerErr } = await supabase.functions.invoke('geo-semantic-router', {
        body: { draft_id: data.draftId, user_intent_text: intentText }
      });

      if (routerErr) throw routerErr;

      if (!routerRes.success) {
        setStatus('REJECTED');
        setData(prev => ({ ...prev, rejectionReason: routerRes.reason }));
      } else {
        // 2. Si es aceptado, generar el guion final
        const { data: genRes, error: genErr } = await supabase.functions.invoke('geo-generate-content', {
          body: { draft_id: data.draftId, classification: routerRes.classification }
        });

        if (genErr) throw genErr;

        setData(prev => ({
          ...prev,
          script: genRes.script,
          classification: routerRes.classification
        }));
        setStatus('ACCEPTED');
      }
    } catch (e: any) {
      console.error("Pipeline Error:", e);
      toast({ title: "Error de IA", description: "El cerebro urbano no respondió.", variant: "destructive" });
      setStatus('ANALYZING');
    }
  }, [data.draftId, supabase, toast]);

  const reset = useCallback(() => {
    setStatus('IDLE');
    setData({});
  }, []);

  return { status, data, scanEnvironment, submitIntent, reset };
}