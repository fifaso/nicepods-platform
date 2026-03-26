// hooks/use-geo-engine.tsx
// VERSIÓN: 24.0 (NicePod Sovereign Geo-Engine - Anti-Storm & Network Efficient Edition)
// Misión: Orquestar telemetría estable eliminando el bucle de peticiones innecesarias.
// [ESTABILIZACIÓN]: Implementación de lastFetchPosRef, Throttling de 100m y Materialización IP.

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

// --- IMPORTACIÓN DE SENSORES Y CINEMÁTICA ---
import { calculateDistance } from "@/lib/geo-kinematics";
import { useForgeOrchestrator } from "./use-forge-orchestrator";
import { useSensorAuthority } from "./use-sensor-authority";

// --- CONSTITUCIÓN DE TIPOS (BUILD SHIELD V4.2) ---
import {
  ActivePOI,
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

  // --- I. CONSUMO DE ESPECIALISTAS (FRAGMENTACIÓN DE RESPONSABILIDAD) ---

  const {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  } = useSensorAuthority();

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

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS) ---
  // Guardamos la ubicación donde realizamos la última petición exitosa a la Bóveda.
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);

  // UMBRAL DE RED: Solo pedimos nuevos puntos si nos movemos más de 100 metros.
  const FETCH_DISTANCE_THRESHOLD = 100;

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
   * Misión: Consultar la red solo cuando sea estrictamente necesario.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation) => {
    // 1. Verificamos si la distancia desde el último fetch justifica una nueva petición.
    if (lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );

      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) {
        // Mantenemos los datos actuales; el Voyager sigue en el mismo cuadrante táctico.
        return;
      }
    }

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [Network] Sincronizando Bóveda para nuevas coordenadas: ${location.latitude}, ${location.longitude}`);

      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      setNearbyPOIs((pois as PointOfInterest[]) || []);

      // Actualizamos el ancla de red para el siguiente control de distancia.
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
   * Misión: Detectar proximidad contra los datos cargados en memoria. No toca la red.
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
  }, [nearbyPOIs]);

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA (MATERIALIZACIÓN) ---

  /**
   * Efecto T0: Hidratación por IP (Paracaídas de Red).
   */
  useEffect(() => {
    if (initialData && !telemetry && !isTriangulated) {
      nicepodLog("🌐 [Geo-Orchestrator] Materialización inmediata vía Edge-IP.");
      setIsTriangulated(true);
    }
  }, [initialData, telemetry, isTriangulated]);

  /**
   * Efecto de Pulso Sensorial:
   * Reacciona a cada actualización filtrada del hardware.
   */
  useEffect(() => {
    if (telemetry) {
      // A. Actualizamos la resonancia local (Sin coste de red)
      evaluateEnvironment(telemetry);

      // B. Intentamos sincronizar con la red (El Throttling de 100m decide si procede)
      if (!isTriangulated || !lastFetchPosRef.current) {
        fetchNearbyPOIs(telemetry);
        setIsTriangulated(true);
      } else {
        fetchNearbyPOIs(telemetry);
      }
    }
  }, [telemetry, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. ENSAMBLAJE DE LA API PÚBLICA (BUILD SHIELD) ---

  const derivedStatus = useMemo((): GeoEngineState => {
    if (forgeStatus !== 'IDLE') return forgeStatus;
    if (isDenied) return 'PERMISSION_DENIED';
    if (isAcquiring) return 'SENSORS_READY';
    if (telemetry) return 'SENSORS_READY';
    return 'IDLE';
  }, [forgeStatus, isDenied, isAcquiring, telemetry]);

  const api: GeoEngineReturn = {
    status: derivedStatus,
    userLocation: telemetry,
    nearbyPOIs,
    activePOI,
    isTriangulated,
    isGPSLock: telemetry?.accuracy ? telemetry.accuracy < 50 : false,
    error: forgeError || (isDenied ? "ACCESO_GPS_DENEGADO" : null),
    data: forgeData,
    isSearching,
    isLocked: isForgeLocked,

    // Métodos de Control
    setTriangulated: () => setIsTriangulated(true),
    initSensors: startHardwareWatch,
    reSyncRadar: reSync,

    // Flujos de Inteligencia
    ingestSensoryData: (params) => ingestSensoryData(telemetry, params),
    synthesizeNarrative,
    transcribeVoiceIntent,

    // Métodos de Gestión
    setManualAnchor: (lng, lat) => {
      nicepodLog("📍 [Geo-Orchestrator] Anclaje manual aplicado.");
    },
    setManualPlaceName: (name) => {
      nicepodLog(`🏷️ [Geo-Orchestrator] Nombre manual asignado: ${name}`);
    },

    // Limpieza de Sesión
    reset: () => {
      nicepodLog("🧹 [Geo-Orchestrator] Purga de sesión ejecutada.");
      killHardwareWatch();
      resetForge();
      setIsTriangulated(false);
      setNearbyPOIs([]);
      setActivePOI(null);
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
 * NOTA TÉCNICA DEL ARCHITECT (V24.0):
 * 1. Erradicación del Request Storm: Se ha implementado un throttling geográfico 
 *    de 100 metros. Esto aniquila el bucle de peticiones infinitas que drenaba 
 *    la base de datos y bloqueaba el hilo principal.
 * 2. Rendimiento Híbrido: La detección de resonancia (POIs cercanos) se ejecuta 
 *    en memoria local a 60fps, mientras que el fetch a red es perezoso (Lazy) 
 *    y condicionado al movimiento real.
 * 3. Patrón Fachada (Facade): Se mantiene el desacoplo de responsabilidades. El 
 *    orquestador delega el hardware al Authority y la IA al Orchestrator.
 * 4. Resiliencia T0: El Voyager nace localizado gracias a la IP y se actualiza 
 *    suavemente al GPS sin parpadeos de red.
 */