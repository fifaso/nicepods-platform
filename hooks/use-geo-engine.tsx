// hooks/use-geo-engine.tsx
// VERSIÓN: 8.0 (NicePod Sovereign Geo-Engine - Final Singleton Architecture)
// Misión: Orquestar telemetría ubicua, anclaje de autoridad y pipelines de IA multimodal.
// [ESTABILIZACIÓN]: Fusión de Context Provider, Multi-OCR Mosaic y Auto-Resolución Ambiental.

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// --- IMPORTACIÓN DE ACCIONES SOBERANAS (SERVER ACTIONS V6.1) ---
import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  resolveLocationAction,
  synthesizeNarrativeAction
} from "@/actions/geo-actions";

// --- IMPORTACIÓN DE CONTRATOS DE CONSTITUCIÓN (TYPES V2.0) ---
import {
  ActivePOI,
  GeoContextData,
  GeoEngineReturn,
  GeoEngineState,
  IngestionDossier,
  POICreationPayload,
  UserLocation
} from "@/types/geo-sovereignty";

/**
 * UTILIDAD INTERNA: fileToBase64
 * Transmuta archivos binarios en strings para el transporte JIT (Just-In-Time).
 * [OOM PREVENTION]: Mantiene la memoria RAM ligera en dispositivos móviles.
 */
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * ---------------------------------------------------------------------------
 * I. CREACIÓN DEL CONTEXTO (SINGLE SOURCE OF TRUTH)
 * ---------------------------------------------------------------------------
 */
const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * ---------------------------------------------------------------------------
 * II. EL PROVIDER SOBERANO (THE ENGINE CORE)
 * ---------------------------------------------------------------------------
 */
export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // --- ESTADOS REACTIVOS ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- REFERENCIAS TÁCTICAS (PERSISTENCIA SIN RE-RENDER) ---
  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);

  // Constantes de Misión V2.6
  const RESOLUTION_THRESHOLD = 100; // Umbral relajado para identificar lugar (PC/Móvil)
  const CONFLICT_LIMIT = 10;        // Metros para alertar colisión de siembra
  const NETWORK_COOLDOWN = 4000;

  /**
   * calculateDistance: Fórmula de Haversine para telemetría local.
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  /**
   * fetchNearbyPOIs: Sincroniza la malla urbana activa desde la Bóveda SQL.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    setIsSearching(true);
    try {
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;
      setNearbyPOIs(pois || []);
    } catch (err: any) {
      console.error("🔥 [GeoEngine] Sync Fail:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * resolveContext: Identificación Automática (Fase 0).
   * Resuelve nombre del lugar y clima para el HUD.
   */
  const resolveContext = useCallback(async (lat: number, lng: number) => {
    if (isSearching) return;
    setIsSearching(true);
    nicepodLog("📡 [GeoEngine] Radar activado. Consultando coordenadas...");

    try {
      const result = await resolveLocationAction(lat, lng);
      if (result.success && result.data) {
        setData((prev: GeoContextData) => ({
          ...prev,
          manualPlaceName: result.data.place.poiName,
          dossier: {
            ...(prev.dossier as any),
            weather_snapshot: result.data.weather
          }
        }));
        hasResolvedContextRef.current = true;
        nicepodLog(`✅ [GeoEngine] Nodo identificado: ${result.data.place.poiName}`);
      }
    } catch (err: any) {
      console.error("🔥 [GeoEngine] Radar Error:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  /**
   * evaluateEnvironment: Analiza colisiones y proximidad de nodos.
   */
  const evaluateEnvironment = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      if (!poi.geo_location?.coordinates) return;
      const [pLng, pLat] = poi.geo_location.coordinates;
      const dist = calculateDistance(location.latitude, location.longitude, pLat, pLng);

      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          id: poi.id.toString(),
          name: poi.name,
          distance: Math.round(dist),
          isWithinRadius: dist <= (poi.resonance_radius || 35),
          historical_fact: poi.historical_fact
        };
      }
    });

    setActivePOI(closest);
    setData((prev: GeoContextData) => ({ ...prev, isProximityConflict: minDistance < CONFLICT_LIMIT }));
  }, [nearbyPOIs, calculateDistance]);

  /**
   * autoResolveEffect: Gatillo autónomo de resolución.
   */
  useEffect(() => {
    async function autoTrigger() {
      if (!userLocation || hasResolvedContextRef.current) return;
      if (userLocation.accuracy <= RESOLUTION_THRESHOLD || isLocked) {
        hasResolvedContextRef.current = true;
        await resolveContext(userLocation.latitude, userLocation.longitude);
      }
    }
    autoTrigger();
  }, [userLocation, isLocked, resolveContext]);

  /**
   * ---------------------------------------------------------------------------
   * III. PROTOCOLOS DE CONTROL HARDWARE
   * ---------------------------------------------------------------------------
   */

  /**
   * initSensors: Encendido de hardware (Triangulación Híbrida).
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    if (isLocked) return;
    setStatus('SENSORS_READY');
    hasResolvedContextRef.current = false;

    // 1. Captura Fast-Track (WiFi/IP)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: null, speed: null
        };
        setUserLocation(loc);
        fetchNearbyPOIs();
      },
      (err) => nicepodLog(`🟡 [GeoEngine] WiFi/IP no disponible: ${err.message}`),
      { enableHighAccuracy: false, timeout: 5000 }
    );

    // 2. Seguimiento de Alta Precisión (Satélite)
    const handleSuccess = (position: GeolocationPosition) => {
      if (isLocked) return;
      const loc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      };
      setUserLocation(loc);
      evaluateEnvironment(loc);
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, (err) => {
      setError(`Hardware Sync Error: ${err.message}`);
    }, {
      enableHighAccuracy: true, timeout: 15000, maximumAge: 0
    });

  }, [fetchNearbyPOIs, isLocked, evaluateEnvironment]);

  /**
   * setManualAnchor: Sobreescritura de autoridad del Administrador.
   */
  const setManualAnchor = useCallback((lng: number, lat: number) => {
    nicepodLog(`📍 [GeoEngine] Autoridad Admin: Anclaje Manual`);
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([10, 50, 10]);

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    const manualLocation: UserLocation = { latitude: lat, longitude: lng, accuracy: 1, heading: null, speed: null };
    setUserLocation(manualLocation);
    evaluateEnvironment(manualLocation);
    setIsLocked(true);
    hasResolvedContextRef.current = false;
    resolveContext(lat, lng);
    fetchNearbyPOIs();
  }, [fetchNearbyPOIs, evaluateEnvironment, resolveContext]);

  /**
   * setManualPlaceName: Soberanía nominativa sobre el hito.
   */
  const setManualPlaceName = useCallback((name: string) => {
    setData((prev: GeoContextData) => ({ ...prev, manualPlaceName: name }));
  }, []);

  /**
   * reSyncRadar: Forzar identificación si el GPS se estabiliza.
   */
  const reSyncRadar = useCallback(() => {
    if (userLocation) {
      hasResolvedContextRef.current = false;
      resolveContext(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation, resolveContext]);

  /**
   * ---------------------------------------------------------------------------
   * IV. PIPELINES DE SOBERANÍA (CEREBRO DUAL)
   * ---------------------------------------------------------------------------
   */

  /**
   * ingestSensoryData: Fase 1 (SENSES).
   * Misión: Transporte de binarios (Mosaico OCR + Audio) e Ingesta IA.
   */
  const ingestSensoryData = async (params: {
    heroImage: File;
    ocrImages: File[];
    ambientAudio?: Blob | null;
    intent: string;
    categoryId: string;
    radius: number;
  }) => {
    if (!userLocation) return;
    setIsLocked(true);
    setStatus('INGESTING');
    setError(null);

    try {
      nicepodLog("📦 [GeoEngine] Codificando expediente multimodal...");

      // Conversión JIT paralela para reducir latencia
      const [heroBase64, ...ocrBase64Array] = await Promise.all([
        fileToBase64(params.heroImage),
        ...params.ocrImages.map(file => fileToBase64(file))
      ]);

      const payload: POICreationPayload = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImage: heroBase64,
        ocrImages: ocrBase64Array,
        categoryId: params.categoryId,
        resonanceRadius: params.radius,
        adminIntent: params.intent
      };

      // 1. Ingesta Visual y OCR
      const result = await ingestPhysicalEvidenceAction(payload);
      if (!result.success || !result.data) throw new Error(result.error || result.message);

      const { poiId, analysis } = result.data;

      // 2. Anclaje Acústico (Si existe audio ambiente)
      if (params.ambientAudio) {
        nicepodLog("🔊 [GeoEngine] Sincronizando Resonancia Ambiental...");
        const audioBase64 = await fileToBase64(params.ambientAudio);
        await attachAmbientAudioAction({ poiId, audioBase64 });
      }

      // 3. Consolidación de Dossier para Revisión
      const newDossier: IngestionDossier = {
        poi_id: poiId,
        raw_ocr_text: analysis.ocrText || null,
        weather_snapshot: data.dossier?.weather_snapshot || { temp_c: 0, condition: "Sincronizado", is_day: true },
        visual_analysis_dossier: {
          architectureStyle: analysis.architectureStyle,
          atmosphere: analysis.atmosphere,
          detectedElements: analysis.detectedElements,
          detectedOfficialName: analysis.detectedOfficialName || analysis.officialName
        },
        sensor_accuracy: userLocation.accuracy,
        ingested_at: new Date().toISOString()
      };

      setData((prev: GeoContextData) => ({ ...prev, poiId, dossier: newDossier }));
      setStatus('DOSSIER_READY');
      nicepodLog(`✅ [GeoEngine] Expediente nominal: POI #${poiId}`);

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Ingest Fail: ${e.message}`);
      setStatus('REJECTED');
      setError(e.message);
      setData((prev: GeoContextData) => ({ ...prev, rejectionReason: e.message }));
      setIsLocked(false);
      throw e; // Lanzamos para que la UI libere el botón
    }
  };

  /**
   * synthesizeNarrative: Fase 2 (THE ORACLE).
   */
  const synthesizeNarrative = async (params: {
    poiId: number;
    depth: 'flash' | 'cronica' | 'inmersion';
    tone: string;
    refinedIntent?: string;
  }) => {
    setStatus('SYNTHESIZING');

    try {
      nicepodLog(`🧠 [GeoEngine] Despertando Oráculo para POI #${params.poiId}`);
      const result = await synthesizeNarrativeAction(params);

      if (!result.success || !result.data) throw new Error(result.error);

      setData((prev: GeoContextData) => ({
        ...prev,
        narrative: result.data
      }));

      setStatus('NARRATIVE_READY');

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Fallo en Agente 42: ${e.message}`);
      setStatus('REJECTED');
      setError(e.message);
      setData((prev: GeoContextData) => ({ ...prev, rejectionReason: e.message }));
      throw e;
    }
  };

  const reset = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    setStatus('IDLE');
    setData({});
    setIsLocked(false);
    setUserLocation(null);
    hasResolvedContextRef.current = false;
    nicepodLog("🧹 [GeoEngine] Terminal Sensorial Purificada.");
  };

  useEffect(() => {
    return () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  return (
    <GeoEngineContext.Provider value={{
      status, data, userLocation, activePOI, nearbyPOIs, isSearching, isLocked, error,
      initSensors, setManualAnchor, setManualPlaceName, reSyncRadar, ingestSensoryData, synthesizeNarrative, reset
    }}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * ---------------------------------------------------------------------------
 * IV. HOOK DE CONSUMO (THE CLIENT)
 * ---------------------------------------------------------------------------
 */
export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (context === undefined) {
    throw new Error("useGeoEngine debe usarse dentro de un GeoEngineProvider.");
  }
  return context;
}