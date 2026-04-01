/**
 * ARCHIVO: hooks/geo-engine/radar-core.tsx
 * VERSIÓN: 1.0 (NicePod V3.0 - Triple-Core Architecture)
 * Misión: Evaluar el entorno geográfico y sincronizar con Supabase (NKV) independientemente de la UI.
 */

"use client";

import { calculateDistance } from "@/lib/geo-kinematics";
import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { ActivePOI, PointOfInterest, UserLocation } from "@/types/geo-sovereignty";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";

const FETCH_DISTANCE_THRESHOLD = 150;
const EVALUATION_DISTANCE_THRESHOLD = 3;

interface RadarCoreReturn {
  nearbyPOIs: PointOfInterest[];
  activePOI: ActivePOI | null;
  isSearching: boolean;
  localData: { isProximityConflict?: boolean; manualPlaceName?: string };
  fetchRadar: (location: UserLocation, force?: boolean) => Promise<void>;
  evaluateProximity: (location: UserLocation) => void;
  setManualPlaceName: (name: string) => void;
  clearRadar: () => void;
}

const RadarContext = createContext<RadarCoreReturn | undefined>(undefined);

export function RadarProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastEvalPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRadar = useCallback(async (location: UserLocation, force: boolean = false) => {
    if (!force && lastFetchPosRef.current) {
      const dist = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );
      if (dist < FETCH_DISTANCE_THRESHOLD) return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [RadarCore] Sincronizando Bóveda NKV (${force ? 'FORCED' : 'THROTTLED'})`);
      const { data: pois, error } = await supabase.from('vw_map_resonance_active').select('*');
      if (error) throw error;

      setNearbyPOIs((pois as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };
    } catch (err: any) {
      if (err.name !== 'AbortError') nicepodLog("🔥 [RadarCore] Error Supabase", err, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  const evaluateProximity = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    if (lastEvalPosRef.current) {
      const dist = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastEvalPosRef.current.lat, longitude: lastEvalPosRef.current.lng }
      );
      if (dist < EVALUATION_DISTANCE_THRESHOLD) return;
    }

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      const [pLng, pLat] = poi.geo_location.coordinates;
      const dist = calculateDistance({ latitude: location.latitude, longitude: location.longitude }, { latitude: pLat, longitude: pLng });
      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          id: poi.id.toString(), name: poi.name, distance: Math.round(dist),
          isWithinRadius: dist <= (poi.resonance_radius || 35),
          historical_fact: poi.historical_fact || undefined
        };
      }
    });

    setActivePOI(closest);
    setLocalData(prev => ({ ...prev, isProximityConflict: minDistance < 10 }));
    lastEvalPosRef.current = { lat: location.latitude, lng: location.longitude };
  }, [nearbyPOIs]);

  const clearRadar = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setNearbyPOIs([]);
    setActivePOI(null);
    setLocalData({});
    lastFetchPosRef.current = null;
    lastEvalPosRef.current = null;
  }, []);

  const api: RadarCoreReturn = {
    nearbyPOIs, activePOI, isSearching, localData,
    fetchRadar, evaluateProximity, clearRadar,
    setManualPlaceName: (name) => setLocalData(prev => ({ ...prev, manualPlaceName: name }))
  };

  return <RadarContext.Provider value={api}>{children}</RadarContext.Provider>;
}

export const useGeoRadar = () => {
  const ctx = useContext(RadarContext);
  if (!ctx) throw new Error("useGeoRadar debe usarse dentro de RadarProvider");
  return ctx;
};