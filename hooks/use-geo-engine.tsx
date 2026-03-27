// hooks/use-geo-engine.tsx
// VERSIÓN: 26.0 (NicePod Sovereign Geo-Engine - Relaxed Authority & T0 Fast-Fix Edition)
// Misión: Orquestar el Cerebro Dual (Sensor + IA) con Throttling de Red y Overrides Manuales.
// [ESTABILIZACIÓN]: Ampliación de Umbral isGPSLock a 80m y consolidación de Sincronía T0.

"use client";

import React, { 
  createContext, 
  useCallback, 
  useContext, 
  useEffect, 
  useMemo, 
  useRef, 
  useState 
} from "react";
import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";

// --- IMPORTACIÓN DE SENSORES Y CINEMÁTICA ---
import { useSensorAuthority } from "./use-sensor-authority";
import { useForgeOrchestrator } from "./use-forge-orchestrator";
import { calculateDistance } from "@/lib/geo-kinematics";

// --- CONSTITUCIÓN DE TIPOS (BUILD SHIELD V4.2) ---
import { 
  ActivePOI, 
  GeoContextData, 
  GeoEngineReturn, 
  GeoEngineState, 
  PointOfInterest, 
  UserLocation 
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

/**
 * GeoEngineProvider: El Orquestador de Misión de NicePod.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (CEREBRO DUAL) ---
  
  // Delegación de captura de hardware (Con inyección de Paracaídas Geo-IP)
  const { 
    telemetry, 
    isDenied, 
    isAcquiring, 
    startHardwareWatch, 
    killHardwareWatch,
    reSync 
  } = useSensorAuthority({ initialData });

  // Delegación de procesamiento pesado (Pipeline de Inteligencia)
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
  const [isTriangulated, setIsTriangulated] = useState<boolean>(false);

  // Override Manual y Contexto Local
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  // La "Verdad Efectiva" es el anclaje manual (si existe) o la telemetría del hardware.
  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS) ---
  const lastFetchPosRef = useRef<{lat: number, lng: number} | null>(null);
  const FETCH_DISTANCE_THRESHOLD = 100; // Throttling de Red: 100 metros.

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation) => {
    if (lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );
      
      // Si nos movemos menos de 100m, anulamos la petición para salvar red y CPU.
      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [Network] Sincronizando Bóveda para el cuadrante: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      setNearbyPOIs((pois as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      nicepodLog("🔥 [Network] Error al consultar la Bóveda NKV", msg, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Procesador de Resonancia local (60fps).
   * Detecta proximidad contra memoria RAM. Cero coste de red.
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

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA ---

  /**
   * Efecto de Pulso Sensorial y Anclaje Manual:
   * Reacciona a cada actualización de 'effectiveLocation' asegurando que 
   * el entorno se re-evalúe instantáneamente.
   */
  useEffect(() => {
    if (effectiveLocation) {
      evaluateEnvironment(effectiveLocation);
      
      // Intentamos sincronizar con la red (El Throttling de 100m protegerá la base de datos)
      fetchNearbyPOIs(effectiveLocation);
      
      if (!isTriangulated) {
        setIsTriangulated(true);
      }
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. ENSAMBLAJE DE LA API PÚBLICA (BUILD SHIELD) ---

  const derivedStatus = useMemo((): GeoEngineState => {
    if (forgeStatus !== 'IDLE') return forgeStatus;
    if (isDenied) return 'PERMISSION_DENIED';
    if (isAcquiring) return 'SENSORS_READY';
    if (effectiveLocation) return 'SENSORS_READY';
    return 'IDLE';
  }, [forgeStatus, isDenied, isAcquiring, effectiveLocation]);

  const api: GeoEngineReturn = {
    status: derivedStatus,
    userLocation: effectiveLocation, 
    nearbyPOIs,
    activePOI,
    isTriangulated,
    
    /**
     * [MANDATO V26.0 - RELAJACIÓN DE AUTORIDAD]:
     * Se amplía el umbral de GPS Lock de 50m a 80m. 
     * Esto permite que la cámara ejecute el vuelo de refinamiento cinemático 
     * mucho antes, evitando que el usuario se sienta atascado en la "Ciudad" 
     * si su hardware móvil tarda en bajar de los 50 metros en zonas densas.
     */
    isGPSLock: effectiveLocation?.accuracy ? effectiveLocation.accuracy < 80 : false,
    
    error: forgeError || (isDenied ? "ACCESO_GPS_DENEGADO" : null),
    data: { ...forgeData, ...localData },
    isSearching,
    isLocked: isForgeLocked,

    // Métodos de Control Global
    setTriangulated: () => setIsTriangulated(true),
    initSensors: startHardwareWatch,
    reSyncRadar: reSync,

    // Flujos de Inteligencia
    ingestSensoryData: (params) => ingestSensoryData(effectiveLocation, params),
    synthesizeNarrative,
    transcribeVoiceIntent,
    
    // Métodos de Gestión Manual
    setManualAnchor: (lng, lat) => {
      nicepodLog(`📍 [Geo-Orchestrator] Anclaje manual aplicado: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setManualAnchorState({
        latitude: lat,
        longitude: lng,
        accuracy: 1, // Precisión máxima al ser intencional (Fuerza isGPSLock a true)
        heading: telemetry?.heading ?? null, 
        speed: null
      });
    },
    setManualPlaceName: (name) => {
      nicepodLog(`🏷️ [Geo-Orchestrator] Nombre manual asignado: ${name}`);
      setLocalData(prev => ({ ...prev, manualPlaceName: name }));
    },

    // Limpieza Atómica
    reset: () => {
      nicepodLog("🧹 [Geo-Orchestrator] Purga de sesión ejecutada.");
      killHardwareWatch();
      resetForge();
      setIsTriangulated(false);
      setNearbyPOIs([]);
      setActivePOI(null);
      setManualAnchorState(null);
      setLocalData({});
      lastFetchPosRef.current = null;
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
  if (!context) {
    throw new Error("useGeoEngine debe ser invocado dentro de un GeoEngineProvider nominal.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V26.0):
 * 1. Protocolo de Confianza Urbana: Se aumentó el 'isGPSLock' a 80 metros. En 
 *    ciudades como Madrid, el rebote satelital en edificios de obsidiana retrasa 
 *    el fix perfecto. Esta relajación asegura que el Voyager vea su avatar 
 *    en su calle en segundos, sin bloqueos visuales.
 * 2. Solidificación de Override: Al asignar 'accuracy: 1' al 'setManualAnchor', 
 *    engañamos positivamente al sistema para que active el GPS Lock y el 
 *    mapa salte automáticamente a la posición elegida por el curador.
 */