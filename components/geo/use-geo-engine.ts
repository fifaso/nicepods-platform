// components/geo/use-geo-engine.ts
// VERSIÓN: 4.2 (Debug Enabled - Production Logic)

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

          console.log("📍 Ingesta exitosa. ID de sesión:", res.draft_id);

          setData({
            weather: res.dossier?.weather,
            place: res.dossier?.detected_place?.name,
            draftId: res.draft_id // <--- Captura el ID del backend
          });
          setStatus('ANALYZING');
        } catch (e: any) {
          console.error("Fallo en sensores:", e);
          toast({ title: "Error de Sincronización", variant: "destructive" });
          setStatus('IDLE');
        }
      },
      () => setStatus('IDLE'),
      { enableHighAccuracy: true }
    );
  }, [supabase, toast]);

  const submitIntent = useCallback(async (intentText: string) => {
    // Si no hay draftId, notificamos para saber qué falló
    if (!data.draftId) {
      console.error("❌ Abortando: No existe draftId en el estado.");
      toast({ title: "Sesión expirada", description: "Por favor, reinicia el escaneo.", variant: "destructive" });
      return;
    }

    setStatus('SCANNING');
    console.log("🧠 Enviando al Editor Urbano...");

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
      console.error("Error en pipeline:", e);
      toast({ title: "Error de IA", variant: "destructive" });
      setStatus('ANALYZING');
    }
  }, [data.draftId, supabase, toast]);

  const reset = useCallback(() => { setStatus('IDLE'); setData({}); }, []);

  return { status, data, scanEnvironment, submitIntent, reset };
}