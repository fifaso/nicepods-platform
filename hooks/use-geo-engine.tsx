/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 34.0 (NicePod Sovereign Geo-Engine - Tactical Pulse Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar telemetría y soberanía cinematográfica mediante pulsos de autoridad.
 * [REFORMA V34.0]: Implementación de recenterTrigger para habilitar mando infinito.
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

// --- CONSTITUCIÓN DE TIPOS V6.1 (BUILD SHIELD) ---
import {
  ActivePOI,
  GeoEngineReturn,
  GeoEngineState,
  PointOfInterest,
  UserLocation,
  GeoContextData,
  CameraPerspective
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
  
  // Hydration Guard: Inicializado con la verdad del servidor (initialData)
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData);

  // [SISTEMA CINEMÁTICO V34.0]: Soberanía de Perspectiva y Mando
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>('OVERVIEW');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  
  // recenterTrigger: Pulso eléctrico incremental para forzar vuelos de cámara.
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  
  // needsBallisticLanding: Flag para el aterrizaje inicial (IP -> GPS).
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);
  const hasPerformedInitialLandingRef = useRef<boolean>(false);

  // Override Manual y Contexto Local
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSourceRef = useRef<string | null>(initialData?.source || null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
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
      nicepodLog(`🛰️ [GeoEngine] Consultando Bóveda NKV (${force ? 'FORCED' : 'THROTTLED'})`);
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
       * 1. DETECCIÓN DE ATERRIZAJE INICIAL (IP -> GPS)
       */
      const isGpsFix = currentSource === 'gps' && currentAccuracy < GPS_LOCK_ACCURACY;
      const sourceJustChanged = currentSource === 'gps' && lastSourceRef.current !== 'gps';

      if (isGpsFix && sourceJustChanged && !hasPerformedInitialLandingRef.current) {
        nicepodLog("🚀 [GeoEngine] Primer GPS Lock. Disparando Aterrizaje Balístico.");
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

  // --- V. MÉTODOS DE SOBERANÍA CINEMÁTICA (REFORMA V34.0) ---

  /**
   * toggleCameraPerspective: Conmutación de vista.
   * [MEJORA]: Incrementa el trigger para asegurar que el controlador visual reaccione.
   */
  const toggleCameraPerspective = useCallback(() => {
    setCameraPerspective(prev => {
      const next = prev === 'STREET' ? 'OVERVIEW' : 'STREET';
      nicepodLog(`🎥 [GeoEngine] Transmutación de Lente: ${next}`);
      return next;
    });
    setRecenterTrigger(prev => prev + 1);
  }, []);

  /**
   * recenterCamera: Protocolo de Recuperación de Foco.
   * [REFORMA V34.0]: El uso de setRecenterTrigger garantiza que cada click sea efectivo.
   */
  const recenterCamera = useCallback(() => {
    nicepodLog("🎯 [GeoEngine] Pulso de Recentrado: Incrementando Trigger de Autoridad.");
    setIsManualMode(false);
    setRecenterTrigger(prev => prev + 1);
    // Mantenemos needsBallisticLanding como señal de respaldo para transiciones largas
    setNeedsBallisticLanding(true); 
  }, []);

  // --- VI. ENSAMBLAJE DE LA API PÚBLICA (BUILD SHIELD V6.1) ---

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

    // CAPACIDADES CINEMÁTICAS RECURSIVAS V34.0
    needsBallisticLanding,
    recenterTrigger, // Exportamos el pulso para el CameraController
    cameraPerspective,
    isManualMode,
    confirmLanding: () => {
      nicepodLog("🏁 [GeoEngine] Maniobra de vuelo asentada.");
      setNeedsBallisticLanding(false);
    },
    toggleCameraPerspective,
    recenterCamera,
    setManualMode: (active: boolean) => {
      if (active !== isManualMode) {
        setIsManualMode(active);
        if (active) nicepodLog("🖐️ [GeoEngine] Control Manual Detectado.");
      }
    },

    // Métodos de Control
    initSensors: startHardwareWatch,
    reSyncRadar: reSync,
    setTriangulated: () => setIsTriangulated(true),
    setManualAnchor: (lng, lat) => {
      nicepodLog(`📍 [GeoEngine] Anclaje manual en [${lng}, ${lat}].`);
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
    synthesizeNarrative,
    transcribeVoiceIntent,

    // Purga de Sesión (Deep Clean)
    reset: () => {
      nicepodLog("🧹 [GeoEngine] Purga total ejecutada.");
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
 * NOTA TÉCNICA DEL ARCHITECT (V34.0):
 * 1. Infinite Recenter Fix: Se implementó recenterTrigger (number) para sustituir
 *    la lógica de booleano estancado, asegurando respuesta al botón en cada click.
 * 2. High-Frequency Authority: El orquestador emite ahora un pulso detectable por
 *    el compilador de React, rompiendo el bloqueo del useEffect en CameraController.
 * 3. Perspective Sovereignty: Se mantiene el control bi-modal (STREET/OVERVIEW)
 *    alineado con la física industrial de Madrid Resonance.
 * 4. Build Shield Compliance: El contrato GeoEngineReturn V6.1 está 100% satisfecho.
 */