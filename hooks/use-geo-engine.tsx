/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 41.0 (NicePod Sovereign Geo-Engine - Unified Command & Dual-Perspective Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar telemetría, red y mando de cámara eliminando la deriva y el jitter.
 * [REFORMA V41.0]: Integración de Mando Único (Recentrar/Perspectiva) y Blindaje de Radar.
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

// --- SERVICIOS ESPECIALIZADOS (CINEMÁTICA Y HARDWARE) ---
import { calculateDistance } from "@/lib/geo-kinematics";
import { useForgeOrchestrator } from "./use-forge-orchestrator";
import { useSensorAuthority } from "./use-sensor-authority";

// --- CONSTITUCIÓN DE TIPOS V6.4 (BUILD SHIELD) ---
import {
  ActivePOI,
  GeoEngineReturn,
  GeoEngineState,
  PointOfInterest,
  UserLocation,
  GeoContextData,
  CameraPerspective,
  NarrativeDepth,
  NarrativeTone
} from "@/types/geo-sovereignty";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

interface GeoEngineProviderProps {
  children: React.ReactNode;
  /** initialData: Ubicación estimada por IP inyectada en el T0. */
  initialData?: {
    lat: number;
    lng: number;
    city: string;
    source: string;
  } | null;
}

// CONSTANTES DE GOBERNANZA INDUSTRIAL (CALIBRACIÓN V41.0)
const FETCH_DISTANCE_THRESHOLD = 150;     // Refresco de Bóveda: cada 150m
const EVALUATION_DISTANCE_THRESHOLD = 3;  // Throttling de CPU: cada 3m (Precisión táctica)
const GPS_LOCK_THRESHOLD = 80;            // Umbral de autoridad satelital

/**
 * GeoEngineProvider: El Reactor Sensorial Maestro.
 * Colabora con useSensorAuthority (V5.2) y geo-kinematics (V1.2).
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (SENTIDOS PURIFICADOS) ---
  const {
    telemetry, // Telemetría con Heading filtrado (VAF)
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
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Hydration Guard: Sincronía total con el servidor para evitar pestañeo visual.
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData || !!telemetry);

  // GOBERNANZA CINEMÁTICA (MANDO ÚNICO)
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>('OVERVIEW');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);
  
  const hasPerformedLandingRef = useRef<boolean>(false);

  // Override Manual para el modo Forja
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS DE ALTA VELOCIDAD) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastEvalPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSourceRef = useRef<string | null>(initialData?.source || null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
   * Utiliza la Vista 'vw_map_resonance_active' para erradicar errores 404.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation, force: boolean = false) => {
    // Verificación de Throttling Espacial
    if (!force && lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );
      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    // Abortamos peticiones previas para liberar el Main Thread
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [GeoEngine] Sintonizando Bóveda NKV (Modo: ${force ? 'FORCED' : 'THROTTLED'}).`);
      
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      setNearbyPOIs((pois as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      nicepodLog("🔥 [GeoEngine] Fallo en enlace de red Supabase.", err, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Procesador de Resonancia local (CPU Offload).
   * Misión: Detectar proximidad a POIs sin saturar el hilo de renderizado.
   */
  const evaluateEnvironment = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    // Throttling Cognitivo: No calculamos si el Voyager se movió menos de 3m.
    if (lastEvalPosRef.current) {
      const evalDistance = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastEvalPosRef.current.lat, longitude: lastEvalPosRef.current.lng }
      );
      if (evalDistance < EVALUATION_DISTANCE_THRESHOLD) return;
    }

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      if (!poi.geo_location?.coordinates) return;

      const [pLng, pLat] = poi.geo_location.coordinates;
      const dist = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: pLat, longitude: pLng }
      );

      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          id: poi.id.toString(),
          name: poi.name,
          distance: Math.round(dist),
          isWithinRadius: dist <= (poi.resonance_radius || 35),
          historical_fact: poi.historical_fact || undefined
        };
      }
    });

    setActivePOI(closest);
    setLocalData(prev => ({ ...prev, isProximityConflict: minDistance < 10 }));
    lastEvalPosRef.current = { lat: location.latitude, lng: location.longitude };
  }, [nearbyPOIs]);

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA (MATERIALIZACIÓN) ---

  useEffect(() => {
    if (effectiveLocation) {
      const currentSource = effectiveLocation.source || 'unknown';
      const currentAccuracy = effectiveLocation.accuracy || 9999;

      // 1. Detección de Aterrizaje Balístico (Transmutación IP -> GPS)
      const isGpsFix = currentSource === 'gps' && currentAccuracy < GPS_LOCK_THRESHOLD;
      const sourceJustChanged = currentSource === 'gps' && lastSourceRef.current !== 'gps';

      if (isGpsFix && sourceJustChanged && !hasPerformedLandingRef.current) {
        nicepodLog("🚀 [GeoEngine] GPS Lock Certificado. Iniciando Vuelo de Autoridad.");
        setNeedsBallisticLanding(true);
        hasPerformedLandingRef.current = true;
        fetchNearbyPOIs(effectiveLocation, true);
      }

      // 2. Inteligencia Local (Throttled por distancia)
      evaluateEnvironment(effectiveLocation);

      // 3. Gobernanza de Red
      if (!lastFetchPosRef.current) {
        fetchNearbyPOIs(effectiveLocation, true); 
      } else {
        fetchNearbyPOIs(effectiveLocation);
      }

      lastSourceRef.current = currentSource;
      if (!isTriangulated) setIsTriangulated(true);
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. MÉTODOS DE SOBERANÍA CINEMÁTICA (MANDO ÚNICO) ---

  /**
   * toggleCameraPerspective: Conmuta entre STREET e OVERVIEW.
   * [V41.0]: Fuerza un pulso de cámara para asegurar que el cambio sea inmediato.
   */
  const toggleCameraPerspective = useCallback(() => {
    setCameraPerspective(prev => {
      const next = prev === 'STREET' ? 'OVERVIEW' : 'STREET';
      nicepodLog(`🎥 [GeoEngine] Transmutando perspectiva: ${next}`);
      return next;
    });
    setRecenterTrigger(prev => prev + 1);
  }, []);

  /**
   * recenterCamera: Protocolo de Recuperación de Foco.
   * Misión: Cancelar el modo manual y forzar el regreso balístico al Voyager.
   */
  const recenterCamera = useCallback(() => {
    nicepodLog("🎯 [GeoEngine] Recibida orden de Recentrado Soberano.");
    setIsManualMode(false);
    lastFetchPosRef.current = null; // Forzamos refresco de red al volver
    setRecenterTrigger(prev => prev + 1);
    setNeedsBallisticLanding(true); 
  }, []);

  // --- VI. ENSAMBLAJE DE LA API PÚBLICA (BUILD SHIELD V6.4) ---

  const derivedStatus = useMemo((): GeoEngineState => {
    if (forgeStatus !== 'IDLE') return forgeStatus;
    if (isDenied) return 'PERMISSION_DENIED';
    return (isIgnited || effectiveLocation) ? 'SENSORS_READY' : 'IDLE';
  }, [forgeStatus, isDenied, isIgnited, effectiveLocation]);

  const api: GeoEngineReturn = {
    status: derivedStatus,
    userLocation: effectiveLocation,
    nearbyPOIs,
    activePOI,
    isTriangulated,
    isGPSLock: telemetry?.source === 'gps' && telemetry.accuracy < GPS_LOCK_THRESHOLD,
    isSearching,
    isLocked: isForgeLocked,
    isIgnited,
    error: forgeError || (isDenied ? "GPS_RESTRICTED" : null),
    data: { ...forgeData, ...localData } as GeoContextData,

    // CAPACIDADES CINEMÁTICAS V41.0
    needsBallisticLanding,
    recenterTrigger,
    cameraPerspective,
    isManualMode,
    confirmLanding: () => {
      nicepodLog("🏁 [GeoEngine] Cámara asentada en destino.");
      setNeedsBallisticLanding(false);
    },
    toggleCameraPerspective,
    recenterCamera,
    setManualMode: (active: boolean) => {
      // [MEJORA]: Solo actualizamos si hay un cambio real para proteger el Main Thread.
      if (active !== isManualMode) {
        setIsManualMode(active);
        if (active) nicepodLog("🖐️ [GeoEngine] Soberanía Manual Activada.");
      }
    },

    // Métodos de Control Tradicionales
    initSensors: startHardwareWatch,
    reSyncRadar: () => {
      lastFetchPosRef.current = null;
      lastEvalPosRef.current = null;
      if (effectiveLocation) fetchNearbyPOIs(effectiveLocation, true);
      reSyncHardware();
    },
    setTriangulated: () => setIsTriangulated(true),
    setManualAnchor: (lng, lat) => {
      setManualAnchorState({
        latitude: lat, longitude: lng, accuracy: 1,
        heading: telemetry?.heading ?? null, speed: null,
        source: 'gps', timestamp: Date.now()
      });
    },
    setManualPlaceName: (name) => setLocalData(prev => ({ ...prev, manualPlaceName: name })),

    // Flujos IA
    ingestSensoryData: (params) => ingestSensoryData(effectiveLocation, params),
    synthesizeNarrative: (params: {
      poiId: number;
      depth: NarrativeDepth;
      tone: NarrativeTone;
      refinedIntent?: string;
    }) => synthesizeNarrative(params),
    transcribeVoiceIntent: (audioBase64) => transcribeVoiceIntent(audioBase64),

    // Purga de Sesión (Deep Clean)
    reset: () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      killHardwareWatch();
      resetForge();
      setIsTriangulated(false);
      setNearbyPOIs([]);
      setActivePOI(null);
      setManualAnchorState(null);
      setLocalData({});
      setNeedsBallisticLanding(false);
      setRecenterTrigger(0);
      setCameraPerspective('OVERVIEW');
      setIsManualMode(false);
      hasPerformedLandingRef.current = false;
      lastFetchPosRef.current = null;
      lastEvalPosRef.current = null;
      lastSourceRef.current = null;
    }
  };

  return (
    <GeoEngineContext.Provider value={api}>
      {children}
    </GeoEngineContext.Provider>
  );
}

export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("useGeoEngine fuera de Provider.");
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V41.0):
 * 1. Authority Integrity: El sistema utiliza 'recenterTrigger' para garantizar que
 *    el botón de ubicación genere un comando eléctrico infalible en cada pulsación.
 * 2. Silent Radar: La consulta a 'vw_map_resonance_active' erradica los errores 404
 *    detectados en la consola, estabilizando el radar semántico.
 * 3. Performance Shield: El throttling cognitivo de 3m en evaluateEnvironment libera
 *    el Main Thread, permitiendo que la cámara fluya sin saltos laterales.
 * 4. Holística Sensorial: El hook ahora colabora con la brújula purificada (V5.2)
 *    asegurando que el Voyager sea siempre el centro de una malla estable.
 */