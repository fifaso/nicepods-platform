// hooks/use-geo-engine.tsx
/**
 * NICEPOD V31.0 - SOVEREIGN GEO-ENGINE (STABILIZED EDITION)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar telemetría y red erradicando errores 404 e hidratación.
 * [ESTABILIZACIÓN]: Fix RPC 404, Hydration Guard y Sincronía Balística.
 * 
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

// --- CONSTITUCIÓN DE TIPOS V5.0 (BUILD SHIELD) ---
import {
  ActivePOI,
  GeoEngineReturn,
  GeoEngineState,
  PointOfInterest,
  UserLocation,
  GeoContextData
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

// CONSTANTES DE GOBERNANZA
const FETCH_DISTANCE_THRESHOLD = 100; // Throttling de red: 100 metros
const GPS_LOCK_ACCURACY = 80;         // Umbral de autoridad satelital (m)

/**
 * GeoEngineProvider: El Reactor Sensorial Maestro de NicePod.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (CEREBRO DUAL) ---

  // A. El Centinela de Hardware (GPS/IP-Fallback)
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
  
  // Hydration Guard: Inicializado estrictamente con la verdad del servidor (initialData)
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData);

  // [SISTEMA BALÍSTICO]: Señal de vuelo cinematográfico
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);
  const hasPerformedLandingRef = useRef<boolean>(false);

  // Override Manual y Contexto Local (Clima/Nombre)
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSourceRef = useRef<string | null>(initialData?.source || null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
   * [FIX V31.0]: Restauración de nombre de función RPC original para evitar 404.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation, force: boolean = false) => {
    // 1. Verificación de Throttling Geográfico (Evita tormenta de peticiones)
    if (!force && lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );

      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [GeoEngine] Consultando Bóveda NKV (${force ? 'FORCED_BY_AUTHORITY' : 'DISTANCE_REFRESH'})`);

      // [RPC]: get_nearby_resonances (Nombre estabilizado en SQL)
      const { data, error: dbError } = await supabase.rpc('get_nearby_resonances', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_meters: 1500 // Radio de peritaje fijo
      });

      if (dbError) throw dbError;

      setNearbyPOIs((data as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      nicepodLog("🔥 [GeoEngine] Error fatal en sintonía de Bóveda", msg, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Procesador de Resonancia local (60fps).
   * Calcula proximidad a puntos ya cargados en memoria.
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
       * 1. DETECCIÓN DE TRANSMUTACIÓN (IP -> GPS)
       * Si pasamos de ubicación estimada a precisión de calle, disparamos vuelo cinematográfico.
       */
      const isGpsFix = currentSource === 'gps' && currentAccuracy < GPS_LOCK_ACCURACY;
      const sourceJustChanged = currentSource === 'gps' && lastSourceRef.current !== 'gps';

      if (isGpsFix && sourceJustChanged && !hasPerformedLandingRef.current) {
        nicepodLog("🚀 [GeoEngine] GPS Lock Certificado. Iniciando Aterrizaje Balístico.");
        setNeedsBallisticLanding(true);
        hasPerformedLandingRef.current = true;
        
        // Forzamos la red al aterrizar para asegurar que el contenido es real
        fetchNearbyPOIs(effectiveLocation, true);
      }

      // 2. Ejecución de Inteligencia Local (Cercanía a POIs)
      evaluateEnvironment(effectiveLocation);

      // 3. Gobernanza de Red Automática
      if (!lastFetchPosRef.current) {
        // Primer fetch (posiblemente IP o Cache)
        fetchNearbyPOIs(effectiveLocation, true);
      } else {
        // Throttling estándar de 100m
        fetchNearbyPOIs(effectiveLocation);
      }

      // Actualizamos referencias de control
      lastEmittedLocationRef.current = effectiveLocation;
      lastSourceRef.current = currentSource;

      // Sello de triangulación (Levanta velos de carga en el UI)
      if (!isTriangulated) {
        setIsTriangulated(true);
      }
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. ENSAMBLAJE DE LA API PÚBLICA (BUILD SHIELD V5.0) ---

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

    // [CAPACIDADES BALÍSTICAS V31.0]
    needsBallisticLanding,
    confirmLanding: () => {
      nicepodLog("🏁 [GeoEngine] Aterrizaje confirmado por el sistema visual.");
      setNeedsBallisticLanding(false);
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

    // Flujos de Inteligencia y Narrativa
    ingestSensoryData: (params) => ingestSensoryData(effectiveLocation, params),
    synthesizeNarrative,
    transcribeVoiceIntent,

    // Purga de Sesión (Deep Clean)
    reset: () => {
      nicepodLog("🧹 [GeoEngine] Ejecutando purga total de telemetría.");
      killHardwareWatch();
      resetForge();
      setIsTriangulated(false);
      setNearbyPOIs([]);
      setActivePOI(null);
      setManualAnchorState(null);
      setLocalData({});
      setNeedsBallisticLanding(false);
      hasPerformedLandingRef.current = false;
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

/**
 * HOOK: useGeoEngine
 * Única vía de acceso para que los componentes consuman la telemetría soberana.
 */
export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) {
    throw new Error("useGeoEngine debe ser invocado dentro de un GeoEngineProvider nominal.");
  }
  return context;
}

/**
 * NOTA TÉCNICA FINAL (V31.0):
 * 1. Estabilidad RPC: Se revirtió el nombre a 'get_nearby_resonances' tras detectar 404.
 * 2. Blindaje de Hidratación: Se sincronizó isTriangulated con el T0 del servidor.
 * 3. Protocolo Balístico: Se selló la comunicación entre el sensor y la cámara.
 */