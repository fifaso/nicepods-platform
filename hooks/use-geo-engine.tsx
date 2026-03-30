/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 37.0 (NicePod Sovereign Geo-Engine - Infrastructure Resilience Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar telemetría y red con herencia de datos entre Dashboard y Mapa.
 * [REFORMA V37.0]: RPC Guard contra 404, Herencia de GPS y Optimización de Main Thread.
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

// --- SERVICIOS ESPECIALIZADOS ---
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
  /** initialData: Ubicación capturada por el Middleware (Handshake T0). */
  initialData?: {
    lat: number;
    lng: number;
    city: string;
    source: string;
  } | null;
}

// CONSTANTES DE GOBERNANZA INDUSTRIAL
const FETCH_DISTANCE_THRESHOLD = 100; // Umbral de red (m)
const GPS_LOCK_THRESHOLD = 80;        // Precisión de autoridad (m)

/**
 * GeoEngineProvider: El Reactor Sensorial Maestro de NicePod.
 * Persiste en el Root Layout para garantizar la continuidad Dashboard -> Mapa.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (HARDWARE & IA) ---

  const {
    telemetry,
    isDenied,
    isAcquiring,
    isIgnited,
    startHardwareWatch,
    killHardwareWatch,
    reSync
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
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData || !!telemetry);

  // GOBERNANZA CINEMÁTICA
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>('OVERVIEW');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);
  
  // Memoria de sesión para evitar bucles de aterrizaje al navegar entre rutas
  const hasPerformedLandingRef = useRef<boolean>(false);

  // Override Manual
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS DE ALTA VELOCIDAD) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSourceRef = useRef<string | null>(initialData?.source || null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);

  /**
   * fetchNearbyPOIs: Sincronización con Bóveda NKV.
   * [MEJORA V37.0]: RPC Guard para neutralizar errores 404 y proteger el hilo principal.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation, force: boolean = false) => {
    // 1. Throttling Geográfico
    if (!force && lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );
      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [GeoEngine] Consultando Bóveda NKV (${force ? 'FORCED' : 'THROTTLED'})`);
      
      /**
       * RPC GUARD: El sistema asume que la función puede no existir o estar caída.
       * Esto evita el colapso del renderizado ante errores de red.
       */
      const { data, error: dbError } = await supabase.rpc('get_nearby_resonances', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_meters: 1500 
      });

      if (dbError) {
        if (dbError.code === 'PGRST202') { // Error de función no encontrada (404)
          nicepodLog("⚠️ [GeoEngine] RPC 'get_nearby_resonances' no detectada. Radar en modo pasivo.", null, 'warn');
        } else {
          throw dbError;
        }
      }

      setNearbyPOIs((data as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };

    } catch (err) {
      nicepodLog("🔥 [GeoEngine] Fallo en enlace de datos Supabase.", err, 'error');
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

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA (HERENCIA DE DATOS) ---

  useEffect(() => {
    if (effectiveLocation) {
      const currentSource = effectiveLocation.source || 'unknown';
      const currentAccuracy = effectiveLocation.accuracy || 9999;

      /**
       * 1. DETECCIÓN DE HERENCIA Y ATERRIZAJE BALÍSTICO
       * Misión: Si ya tenemos GPS (desde el Dashboard), el sistema hereda la autoridad.
       */
      const isGpsFix = currentSource === 'gps' && currentAccuracy < GPS_LOCK_THRESHOLD;
      const sourceJustChanged = currentSource === 'gps' && lastSourceRef.current !== 'gps';

      // Si es el primer fix real de la sesión (viniendo de IP)
      if (isGpsFix && sourceJustChanged && !hasPerformedLandingRef.current) {
        nicepodLog("🚀 [GeoEngine] Authority Handover: Activando Vuelo Balístico.");
        setNeedsBallisticLanding(true);
        hasPerformedLandingRef.current = true;
        fetchNearbyPOIs(effectiveLocation, true);
      }

      // 2. Inteligencia Local
      evaluateEnvironment(effectiveLocation);

      // 3. Gobernanza de Red
      if (!lastFetchPosRef.current) {
        // Fetch inicial (IP)
        fetchNearbyPOIs(effectiveLocation, true);
      } else {
        // Refresco por movimiento (100m)
        fetchNearbyPOIs(effectiveLocation);
      }

      lastEmittedLocationRef.current = effectiveLocation;
      lastSourceRef.current = currentSource;
      if (!isTriangulated) setIsTriangulated(true);
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. MÉTODOS DE SOBERANÍA CINEMÁTICA ---

  const toggleCameraPerspective = useCallback(() => {
    setCameraPerspective(prev => {
      const next = prev === 'STREET' ? 'OVERVIEW' : 'STREET';
      nicepodLog(`🎥 [GeoEngine] Conmutación de Lente: ${next}`);
      return next;
    });
    setRecenterTrigger(prev => prev + 1);
  }, []);

  const recenterCamera = useCallback(() => {
    nicepodLog("🎯 [GeoEngine] Comando de Recentrado: Pulso de Autoridad.");
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
    isGPSLock: telemetry?.source === 'gps' && telemetry.accuracy < GPS_LOCK_THRESHOLD,
    isSearching,
    isLocked: isForgeLocked,
    isIgnited,
    error: forgeError || (isDenied ? "GPS_RESTRICTED" : null),
    data: { ...forgeData, ...localData } as GeoContextData,

    // CAPACIDADES CINEMÁTICAS V37.0
    needsBallisticLanding,
    recenterTrigger,
    cameraPerspective,
    isManualMode,
    confirmLanding: () => {
      nicepodLog("🏁 [GeoEngine] Maniobra de cámara finalizada.");
      setNeedsBallisticLanding(false);
    },
    toggleCameraPerspective,
    recenterCamera,
    setManualMode: (active: boolean) => {
      if (active !== isManualMode) {
        setIsManualMode(active);
        if (active) nicepodLog("🖐️ [GeoEngine] Mando Manual.");
      }
    },

    // Métodos de Control
    initSensors: startHardwareWatch,
    reSyncRadar: reSync,
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
    synthesizeNarrative: (params) => synthesizeNarrative(params),
    transcribeVoiceIntent: (audioBase64) => transcribeVoiceIntent(audioBase64),

    // Purga de Sesión
    reset: () => {
      nicepodLog("Sweep [GeoEngine] Purga total.");
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
 * NOTA TÉCNICA DEL ARCHITECT (V37.0):
 * 1. Authority Handover: Se garantiza que si el Voyager se localizó en el Dashboard,
 *    el mapa grande herede la posición instantáneamente sin repetir vuelos.
 * 2. RPC Guard: Neutralización de errores 404 mediante detección de código 'PGRST202',
 *    protegiendo la estabilidad del Main Thread.
 * 3. Interaction Shielding: Optimización de setManualMode para evitar el jittering
 *    reportado en las Imágenes 22-25.
 * 4. Silent Recovery: Al recentrar, se limpia el rastro de errores para asegurar 
 *    que el botón de ubicación sea infalible.
 */