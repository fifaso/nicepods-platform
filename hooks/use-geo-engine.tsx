/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 42.0 (NicePod Sovereign Geo-Engine - Discrete Emission & Command Authority Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar telemetría y red filtrando el ruido para liberar el renderizado WebGL.
 * [REFORMA V42.0]: Implementación de Emission Throttling (80cm) y Mando Recursivo.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// --- SERVICIOS ESPECIALIZADOS (V1.2 CINEMÁTICA PURIFICADA) ---
import { calculateDistance } from "@/lib/geo-kinematics";
import { useForgeOrchestrator } from "./use-forge-orchestrator";
import { useSensorAuthority } from "./use-sensor-authority";

// --- CONSTITUCIÓN DE TIPOS V6.4 ---
import {
  ActivePOI,
  CameraPerspective,
  GeoContextData,
  GeoEngineReturn,
  GeoEngineState,
  PointOfInterest,
  UserLocation
} from "@/types/geo-sovereignty";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

// CONSTANTES DE GOBERNANZA INDUSTRIAL (CALIBRACIÓN V42.0)
const FETCH_DISTANCE_THRESHOLD = 150;     // Refresco de red: cada 150m
const EVALUATION_DISTANCE_THRESHOLD = 3;  // Throttling de CPU: cada 3m (Anillos de proximidad)
const EMISSION_THRESHOLD_METERS = 0.8;    // [NUEVO] Umbral de Emisión UI: 80cm (Filtro de Jitter)
const GPS_LOCK_THRESHOLD = 80;            // Precisión de autoridad satelital

/**
 * GeoEngineProvider: El Reactor Sensorial Maestro.
 */
export function GeoEngineProvider({ children, initialData }: { children: React.ReactNode, initialData?: any }) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (SENTIDOS PURIFICADOS V5.2) ---
  const {
    telemetry,
    isDenied,
    isAcquiring,
    isIgnited,
    startHardwareWatch,
    killHardwareWatch,
    reSync: reSyncHardware
  } = useSensorAuthority({ initialData });

  const {
    forgeStatus,
    forgeData,
    isForgeLocked,
    forgeError,
    ingestSensoryData,
    synthesizeNarrative,
    transcribeVoiceIntent,
    resetForge
  } = useForgeOrchestrator();

  // --- II. ESTADO DE INTELIGENCIA Y MALLA LOCAL ---
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData);

  // GOBERNANZA CINEMÁTICA (MANDO ÚNICO)
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>('OVERVIEW');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);

  const hasPerformedLandingRef = useRef<boolean>(false);

  // Override Manual y Contexto Local
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  // La ubicación efectiva que fluye hacia el sistema
  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS DE ALTA VELOCIDAD) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastEvalPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);
  const lastSourceRef = useRef<string | null>(initialData?.source || null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation, force: boolean = false) => {
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
      nicepodLog(`🛰️ [GeoEngine] Fetching Bóveda NKV (${force ? 'FORCED' : 'THROTTLED'})`);
      const { data: pois, error: dbError } = await supabase.from('vw_map_resonance_active').select('*');
      if (dbError) throw dbError;

      setNearbyPOIs((pois as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };
    } catch (err: any) {
      if (err.name !== 'AbortError') nicepodLog("🔥 [GeoEngine] Error Supabase", err, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Procesador de Resonancia local (CPU Shield).
   */
  const evaluateEnvironment = useCallback((location: UserLocation) => {
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
        closest = { id: poi.id.toString(), name: poi.name, distance: Math.round(dist), isWithinRadius: dist <= (poi.resonance_radius || 35), historical_fact: poi.historical_fact || undefined };
      }
    });

    setActivePOI(closest);
    setLocalData(prev => ({ ...prev, isProximityConflict: minDistance < 10 }));
    lastEvalPosRef.current = { lat: location.latitude, lng: location.longitude };
  }, [nearbyPOIs]);

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA (EMISIÓN DISCRETA V42.0) ---

  useEffect(() => {
    if (effectiveLocation) {
      const currentSource = effectiveLocation.source || 'unknown';
      const currentAccuracy = effectiveLocation.accuracy || 9999;

      /**
       * PROTOCOLO DE FILTRADO DE EMISIÓN:
       * Misión: No actualizar el estado 'userLocation' si el cambio es ruido de sensor.
       * Esto libera el Main Thread y erradica el bloqueo de Zoom/Pan.
       */
      let shouldEmit = false;
      if (!lastEmittedLocationRef.current) {
        shouldEmit = true;
      } else {
        const movementDelta = calculateDistance(
          { latitude: effectiveLocation.latitude, longitude: effectiveLocation.longitude },
          { latitude: lastEmittedLocationRef.current.latitude, longitude: lastEmittedLocationRef.current.longitude }
        );
        // Solo emitimos si se movió más de 80cm o si cambió el rumbo significativamente
        const headingDelta = Math.abs((effectiveLocation.heading || 0) - (lastEmittedLocationRef.current.heading || 0));
        if (movementDelta > EMISSION_THRESHOLD_METERS || headingDelta > 1.5 || currentSource !== lastSourceRef.current) {
          shouldEmit = true;
        }
      }

      if (shouldEmit) {
        setUserLocation(effectiveLocation);
        lastEmittedLocationRef.current = effectiveLocation;

        // 1. Detección de Aterrizaje Balístico (IP -> GPS)
        const isGpsFix = currentSource === 'gps' && currentAccuracy < GPS_LOCK_THRESHOLD;
        const sourceJustChanged = currentSource === 'gps' && lastSourceRef.current !== 'gps';

        if (isGpsFix && sourceJustChanged && !hasPerformedLandingRef.current) {
          setNeedsBallisticLanding(true);
          hasPerformedLandingRef.current = true;
          fetchNearbyPOIs(effectiveLocation, true);
        }

        // 2. Inteligencia Local y Red
        evaluateEnvironment(effectiveLocation);
        if (!lastFetchPosRef.current) fetchNearbyPOIs(effectiveLocation, true);
        else fetchNearbyPOIs(effectiveLocation);

        lastSourceRef.current = currentSource;
        if (!isTriangulated) setIsTriangulated(true);
      }
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. MÉTODOS DE SOBERANÍA CINEMÁTICA ---

  const toggleCameraPerspective = useCallback(() => {
    setCameraPerspective(prev => prev === 'STREET' ? 'OVERVIEW' : 'STREET');
    setRecenterTrigger(prev => prev + 1);
  }, []);

  const recenterCamera = useCallback(() => {
    nicepodLog("🎯 [GeoEngine] Recentrado Soberano: Disparando Pulso.");
    setIsManualMode(false);
    lastFetchPosRef.current = null; // Forzamos refresco de red
    setRecenterTrigger(prev => prev + 1);
    setNeedsBallisticLanding(true);
  }, []);

  // --- VI. ENSAMBLAJE DE LA API PÚBLICA ---

  const derivedStatus = useMemo((): GeoEngineState => {
    if (forgeStatus !== 'IDLE') return forgeStatus;
    if (isDenied) return 'PERMISSION_DENIED';
    return (isIgnited || effectiveLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forgeStatus, isDenied, isIgnited, effectiveLocation]);

  const api: GeoEngineReturn = {
    status: derivedStatus,
    userLocation, // Emisión purificada
    nearbyPOIs,
    activePOI,
    isTriangulated,
    isGPSLock: telemetry?.source === 'gps' && telemetry.accuracy < GPS_LOCK_THRESHOLD,
    isSearching,
    isLocked: isForgeLocked,
    isIgnited,
    error: forgeError || (isDenied ? "GPS_RESTRICTED" : null),
    data: { ...forgeData, ...localData } as GeoContextData,

    needsBallisticLanding,
    recenterTrigger,
    cameraPerspective,
    isManualMode,
    confirmLanding: () => setNeedsBallisticLanding(false),
    toggleCameraPerspective,
    recenterCamera,
    setManualMode: (active: boolean) => {
      if (active !== isManualMode) setIsManualMode(active);
    },

    initSensors: startHardwareWatch,
    reSyncRadar: () => {
      lastFetchPosRef.current = null;
      lastEvalPosRef.current = null;
      if (effectiveLocation) fetchNearbyPOIs(effectiveLocation, true);
      reSyncHardware();
    },
    setTriangulated: () => setIsTriangulated(true),
    setManualAnchor: (lng, lat) => setManualAnchorState({ latitude: lat, longitude: lng, accuracy: 1, heading: telemetry?.heading ?? null, speed: null, source: 'gps', timestamp: Date.now() }),
    setManualPlaceName: (name) => setLocalData(prev => ({ ...prev, manualPlaceName: name })),
    ingestSensoryData: (params) => ingestSensoryData(effectiveLocation, params),
    synthesizeNarrative: (params) => synthesizeNarrative(params),
    transcribeVoiceIntent: (audioBase64) => transcribeVoiceIntent(audioBase64),
    reset: () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      killHardwareWatch(); resetForge(); setIsTriangulated(false); setNearbyPOIs([]);
      setActivePOI(null); setManualAnchorState(null); setLocalData({});
      setNeedsBallisticLanding(false); setRecenterTrigger(0); setCameraPerspective('OVERVIEW');
      setIsManualMode(false); hasPerformedLandingRef.current = false;
      lastFetchPosRef.current = null; lastEvalPosRef.current = null; lastSourceRef.current = null;
    }
  };

  return <GeoEngineContext.Provider value={api}>{children}</GeoEngineContext.Provider>;
}

export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("useGeoEngine fuera de Provider.");
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V42.0):
 * 1. Discrete UI Emission: Se introdujo EMISSION_THRESHOLD_METERS (80cm) para filtrar
 *    el ruido del GPS. Esto detiene la cascada de re-renders que bloqueaba el Zoom y el Pan.
 * 2. Absolute Command Authority: recenterCamera() ahora es un pulso eléctrico que
 *    anula el throttling, asegurando que el botón responda siempre.
 * 3. Main Thread Sovereignty: Al no actualizar el estado 'userLocation' por micro-variaciones,
 *    el motor WebGL recupera su fluidez natural, erradicando los saltos laterales.
 * 4. Zero-Flicker Persistence: Sincronización atómica entre Senses y Renderer.
 */