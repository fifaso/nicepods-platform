// components/geo/use-geo-engine.ts
// VERSIÓN: 5.0 (Auto-Sensor Handshake & Vision Support)

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useState } from 'react';

export type GeoState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'REJECTED' | 'ACCEPTED';

export interface GeoContextData {
  weather?: { temp_c: number; condition: string; is_day: boolean };
  place?: string;
  draftId?: string;
  rejectionReason?: string;
  script?: string;
  imageAnalysis?: string;
}

export function useGeoEngine() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<GeoState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});

  // [NUEVO]: Activación automática de sensores al entrar
  useEffect(() => {
    if (status === 'IDLE') {
      scanEnvironment();
    }
  }, []);

  const scanEnvironment = useCallback(async (image_base64?: string) => {
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
              image_base64: image_base64 // Enviamos la imagen si existe
            }
          });

          if (error) throw error;

          setData({
            weather: res.dossier?.weather,
            place: res.dossier?.detected_place?.name,
            draftId: res.draft_id,
            imageAnalysis: res.dossier?.visual_summary
          });

          setStatus('ANALYZING');
        } catch (e: any) {
          console.error("Ingest Fail:", e);
          toast({ title: "Fallo de Sensores", variant: "destructive" });
          setStatus('IDLE');
        }
      },
      () => setStatus('IDLE'),
      { enableHighAccuracy: true }
    );
  }, [supabase, toast]);

  const submitIntent = useCallback(async (intentText: string) => {
    if (!data.draftId) return;
    setStatus('SCANNING');
    try {
      const { data: routerRes, error: routerErr } = await supabase.functions.invoke('geo-semantic-router', {
        body: { draft_id: data.draftId, user_intent_text: intentText }
      });
      if (routerErr) throw routerErr;

      if (!routerRes.success) {
        setStatus('REJECTED');
        setData(prev => ({ ...prev, rejectionReason: routerRes.reason }));
      } else {
        const { data: genRes, error: genErr } = await supabase.functions.invoke('geo-generate-content', {
          body: { draft_id: data.draftId, classification: routerRes.classification }
        });
        if (genErr) throw genErr;
        setData(prev => ({ ...prev, script: genRes.script }));
        setStatus('ACCEPTED');
      }
    } catch (e: any) {
      toast({ title: "Error de IA", variant: "destructive" });
      setStatus('ANALYZING');
    }
  }, [data.draftId, supabase, toast]);

  const reset = useCallback(() => { setStatus('IDLE'); setData({}); }, []);

  return { status, data, scanEnvironment, submitIntent, reset };
}