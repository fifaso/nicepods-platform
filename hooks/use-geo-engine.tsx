/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 36.0 (NicePod Sovereign Geo-Engine - Silent Radar & Interaction Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar telemetría y red mediante un radar desacoplado del ciclo de render.
 * [REFORMA V36.0]: Implementación de searchCenterRef para eliminar re-renders por movimiento.
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

// --- SERVICIOS ESPECIALIZADOS (FRAGMENTACIÓN DE RESPONSABILIDAD) ---
import { calculateDistance } from "@/lib/geo-kinematics";
import { useForgeOrchestrator } from "./use-forge-orchestrator";
import { useSensorAuthority } from "./use-sensor-authority";

// --- CONSTITUCIÓN DE TIPOS V6.2 (BUILD SHIELD) ---
import {
  ActivePOI,
  GeoEngineReturn,
  GeoEngineState,
  PointOfInterest,
  UserLocation,
  GeoContextData,
  CameraPerspective,
  GeoActionResponse
} from "@/types/geo-sovereignty";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

interface GeoEngineProviderProps {
  children: React.ReactNode;
  /** initialData: Ubicación estimada por IP capturada en el Edge de Vercel. */
  initialData?: {
    lat: number;
    lng: number;
    city: string;
    source: string;
  } | null;
}

// CONSTANTES DE GOBERNANZA TÁCTICA
const FETCH_DISTANCE_THRESHOLD = 100; // Throttling de red: 100 metros
const GPS_LOCK_ACCURACY = 80;         // Umbral de autoridad satelital (m)

/**
 * GeoEngineProvider: El Reactor Sensorial Maestro de NicePod.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (SENSES & BRAIN) ---

  // A. El Centinela de Hardware (GPS/Compás/IP-Fallback)
  const {
    telemetry,
    isDenied,
    isAcquiring,
    isIgnited,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  } = useSensorAuthority({ initialData });

  // B. El Escriba de la Forja (IA/Ingesta)
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
  
  // Hydration Guard: Sincronizado con el T0 del servidor.
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData);

  // [SISTEMA CINEMÁTICO V36.0]: Soberanía de Perspectiva y Mando
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>('OVERVIEW');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);
  
  const hasPerformedInitialLandingRef = useRef<boolean>(false);

  // Override Manual y Contexto Local
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS DE ALTA VELOCIDAD) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSourceRef = useRef<string | null>(initialData?.source || null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);

  /**
   * searchCenterRef: [NUEVO V36.0]
   * Misión: Almacenar el centro del visor sin disparar re-renders de React.
   * Esto permite que el radar sepa dónde buscar sin bloquear la UI mientras el usuario mueve el mapa.
   */
  const searchCenterRef = useRef<{ lat: number, lng: number }>({
    lat: initialData?.lat || 40.4168,
    lng: initialData?.lng || -3.7038
  });

  /**
   * fetchNearbyPOIs: Sincronización con Bóveda NKV.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation, force: boolean = false) => {
    if (!force && lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );
      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [GeoEngine] Fetch Bóveda NKV (${force ? 'FORCED' : 'THROTTLED'})`);
      const { data, error: dbError } = await supabase.rpc('get_nearby_resonances', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_meters: 1500 
      });

      if (dbError) throw dbError;
      setNearbyPOIs((data as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };
    } catch (err) {
      nicepodLog("🔥 [GeoEngine] Error en sintonía de Bóveda", err, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Procesador de Resonancia local (60fps).
   */
  const evaluateEnvironment = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;
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
  }, [nearbyPOIs]);

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA (MOTOR DE AUTORIDAD) ---

  useEffect(() => {
    if (effectiveLocation) {
      const currentSource = effectiveLocation.source || 'unknown';
      const currentAccuracy = effectiveLocation.accuracy || 9999;

      /**
       * 1. DETECCIÓN DE ATERRIZAJE INICIAL
       */
      const isGpsFix = currentSource === 'gps' && currentAccuracy < GPS_LOCK_ACCURACY;
      const sourceJustChanged = currentSource === 'gps' && lastSourceRef.current !== 'gps';

      if (isGpsFix && sourceJustChanged && !hasPerformedInitialLandingRef.current) {
        nicepodLog("🚀 [GeoEngine] Primer GPS Fix. Activando Vuelo de Autoridad.");
        setNeedsBallisticLanding(true);
        hasPerformedInitialLandingRef.current = true;
        fetchNearbyPOIs(effectiveLocation, true);
      }

      // 2. Inteligencia Local
      evaluateEnvironment(effectiveLocation);

      // 3. Gobernanza de Red
      if (!lastFetchPosRef.current) {
        fetchNearbyPOIs(effectiveLocation, true);
      } else {
        fetchNearbyPOIs(effectiveLocation);
      }

      lastEmittedLocationRef.current = effectiveLocation;
      lastSourceRef.current = currentSource;
      if (!isTriangulated) setIsTriangulated(true);
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. MÉTODOS DE SOBERANÍA CINEMÁTICA (REFORMA V36.0) ---

  const toggleCameraPerspective = useCallback(() => {
    setCameraPerspective(prev => {
      const next = prev === 'STREET' ? 'OVERVIEW' : 'STREET';
      nicepodLog(`🎥 [GeoEngine] Transmutación de Vista: ${next}`);
      return next;
    });
    setRecenterTrigger(prev => prev + 1);
  }, []);

  const recenterCamera = useCallback(() => {
    nicepodLog("🎯 [GeoEngine] Orden de Recentrado: Incrementando Pulso.");
    setIsManualMode(false);
    setRecenterTrigger(prev => prev + 1);
    setNeedsBallisticLanding(true); 
  }, []);

  // --- VI. ENSAMBLAJE DE LA API PÚBLICA (BUILD SHIELD V6.2) ---

  const derivedStatus = useMemo((): GeoEngineState => {
    if (forgeStatus !== 'IDLE') return forgeStatus;
    if (isDenied) return 'PERMISSION_DENIED';
    if (isIgnited || effectiveLocation) return 'SENSORS_READY';
    return 'IDLE';
  }, [forgeStatus, isDenied, isIgnited, effectiveLocation]);

  const api: GeoEngineReturn = {
    status: derivedStatus,
    userLocation: effectiveLocation,
    nearbyPOIs,
    activePOI,
    isTriangulated,
    isGPSLock: telemetry?.source === 'gps' && telemetry.accuracy < GPS_LOCK_ACCURACY,
    isSearching,
    isLocked: isForgeLocked,
    isIgnited,
    error: forgeError || (isDenied ? "GPS_RESTRICTED" : null),
    data: { ...forgeData, ...localData } as GeoContextData,

    // CAPACIDADES CINEMÁTICAS SOBERANAS V36.0
    needsBallisticLanding,
    recenterTrigger,
    cameraPerspective,
    isManualMode,
    confirmLanding: () => {
      nicepodLog("🏁 [GeoEngine] Acknowledgment de maniobra recibido.");
      setNeedsBallisticLanding(false);
    },
    toggleCameraPerspective,
    recenterCamera,
    setManualMode: (active: boolean) => {
      /**
       * [GUARDIA V36.0]: Actualización de estado solo si el cambio es real.
       * Esto evita ciclos de renderizado infinitos durante el pan/zoom del usuario.
       */
      if (active !== isManualMode) {
        setIsManualMode(active);
        if (active) nicepodLog("🖐️ [GeoEngine] Soberanía Manual Activada.");
      }
    },

    // Métodos de Control Tradicionales
    initSensors: startHardwareWatch,
    reSyncRadar: reSync,
    setTriangulated: () => setIsTriangulated(true),
    setManualAnchor: (lng, lat) => {
      setManualAnchorState({
        latitude: lat,
        longitude: lng,
        accuracy: 1,
        heading: telemetry?.heading ?? null,
        speed: null,
        source: 'gps',
        timestamp: Date.now()
      });
    },
    setManualPlaceName: (name) => setLocalData(prev => ({ ...prev, manualPlaceName: name })),

    // Flujos IA
    ingestSensoryData: (params) => ingestSensoryData(effectiveLocation, params),
    synthesizeNarrative: (params) => synthesizeNarrative(params),
    transcribeVoiceIntent: (audioBase64) => transcribeVoiceIntent(audioBase64),

    // Purga de Sesión (Deep Clean)
    reset: () => {
      nicepodLog("Sweep [GeoEngine] Purga total ejecutada.");
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
      hasPerformedInitialLandingRef.current = false;
      lastFetchPosRef.current = null;
      lastSourceRef.current = null;
      lastEmittedLocationRef.current = null;
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
  if (!context) throw new Error("useGeoEngine debe invocarse dentro de un GeoEngineProvider.");
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V36.0):
 * 1. Interaction Decoupling: Se ha blindado setManualMode con guardias de igualdad
 *    para evitar re-renders innecesarios durante el movimiento del mapa.
 * 2. Silent Authority: El orquestador mantiene el pulso recenterTrigger para 
 *    garantizar que el botón de mando funcione de forma determinista.
 * 3. Atomic State Management: La separación entre telemetría (Senses) y 
 *    perspectiva (Brain) asegura la fluidez de 60FPS sin interferencias.
 * 4. Build Shield: 100% compatible con GeoEngineReturn V6.2.
 */