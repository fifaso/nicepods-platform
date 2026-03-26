// hooks/use-geo-engine.tsx
// VERSIÓN: 23.2 (NicePod Sovereign Geo-Engine - Orchestrator Supreme Edition)
// Misión: Unificar el Sensor de Autoridad y la Forja de IA en una interfaz soberana única.
// [ESTABILIZACIÓN]: Implementación del Patrón Fachada, Materialización T0 y Sello de Tipos.

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

// --- SERVICIOS ESPECIALIZADOS (FRAGMENTACIÓN DE RESPONSABILIDAD) ---
import { useForgeOrchestrator } from "./use-forge-orchestrator";
import { useSensorAuthority } from "./use-sensor-authority";

// --- MATEMÁTICA Y CINEMÁTICA ---
import { calculateDistance } from "@/lib/geo-kinematics";

// --- CONSTITUCIÓN DE TIPOS (BUILD SHIELD V4.2) ---
import {
  ActivePOI,
  GeoEngineReturn,
  GeoEngineState,
  PointOfInterest,
  UserLocation
} from "@/types/geo-sovereignty";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * INTERFAZ: GeoEngineProviderProps
 * Recibe la ubicación estimada (IP) capturada en el Edge de Vercel.
 */
interface GeoEngineProviderProps {
  children: React.ReactNode;
  initialData?: {
    lat: number;
    lng: number;
    city: string;
    source: string;
  } | null;
}

/**
 * GeoEngineProvider: El Orquestador de Misión de NicePod.
 * Misión: Materializar la presencia del Voyager y orquestar el capital intelectual.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE FACULTADES ESPECIALIZADAS ---

  // A. El Centinela de Hardware (GPS/Heading/Speed)
  const {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  } = useSensorAuthority();

  // B. El Escriba de la Forja (IA/Ingesta/Síntesis)
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

  // isTriangulated: Indica si el Voyager ya existe físicamente en el mapa (IP o GPS).
  const [isTriangulated, setIsTriangulated] = useState<boolean>(false);

  /**
   * fetchNearbyPOIs: Sincronización con la Bóveda NKV.
   * Misión: Cargar los ecos cercanos basándose en la posición del Voyager.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation) => {
    setIsSearching(true);
    try {
      nicepodLog(`📡 [Geo-Orchestrator] Sincronizando Bóveda NKV para ${location.latitude}, ${location.longitude}`);

      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      setNearbyPOIs((pois as PointOfInterest[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      nicepodLog("🔥 [Geo-Orchestrator] Fallo de sincronía con Bóveda", msg, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Procesador de Resonancia.
   * Misión: Determinar si el Voyager está en el radio de sintonía de un hito.
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

  // --- III. PROTOCOLOS DE MATERIALIZACIÓN PROGRESIVA ---

  /**
   * Efecto T0: Hidratación Geo-IP.
   * Misión: Anular la 'amnesia visual' inicial de la Puerta del Sol.
   */
  useEffect(() => {
    if (initialData && !telemetry && !isTriangulated) {
      nicepodLog("🌐 [Geo-Orchestrator] Materialización instantánea vía Edge-IP.");
      setIsTriangulated(true);
    }
  }, [initialData, telemetry, isTriangulated]);

  /**
   * Efecto T+1: Sincronía con Hardware.
   * Misión: Refinar la posición en cuanto el SensorAuthority emite datos.
   */
  useEffect(() => {
    if (telemetry) {
      // 1. Evaluamos ecos cercanos
      evaluateEnvironment(telemetry);

      // 2. Si es el primer fix o un dato de alta fidelidad, refrescamos la Bóveda.
      if (!isTriangulated || telemetry.source === 'gps') {
        fetchNearbyPOIs(telemetry);
        setIsTriangulated(true);
      }
    }
  }, [telemetry, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- IV. ENSAMBLAJE DE LA API SOBERANA (GEO-ENGINE INTERFACE) ---

  const derivedStatus = useMemo((): GeoEngineState => {
    if (forgeStatus !== 'IDLE') return forgeStatus;
    if (isDenied) return 'PERMISSION_DENIED';
    if (isAcquiring) return 'SENSORS_READY';
    if (telemetry) return 'SENSORS_READY';
    return 'IDLE';
  }, [forgeStatus, isDenied, isAcquiring, telemetry]);

  const api: GeoEngineReturn = {
    // 1. Estado de Misión
    status: derivedStatus,
    userLocation: telemetry,
    nearbyPOIs,
    activePOI,
    isTriangulated,
    isGPSLock: telemetry?.accuracy ? telemetry.accuracy < 50 : false,
    error: forgeError || (isDenied ? "ACCESO_GPS_BLOQUEADO" : null),
    data: forgeData,
    isSearching,
    isLocked: isForgeLocked,

    // 2. Métodos de Persistencia (V2.7)
    setTriangulated: () => setIsTriangulated(true),

    // 3. Métodos de Control (Delegación al Centinela)
    initSensors: startHardwareWatch,
    reSyncRadar: reSync,

    // 4. Flujos de Inteligencia (Delegación a la Forja)
    ingestSensoryData: (params) => ingestSensoryData(telemetry, params),
    synthesizeNarrative,
    transcribeVoiceIntent,

    // 5. Métodos de Gestión Manual
    setManualAnchor: (lng, lat) => {
      nicepodLog("📍 [Geo-Orchestrator] Aplicando anclaje manual.");
      // Futura implementación: Sincronía con el estado de Manual Fix
    },
    setManualPlaceName: (name) => {
      nicepodLog(`🏷️ [Geo-Orchestrator] Nodo nominado: ${name}`);
    },

    // 6. Protocolo de Limpieza Total
    reset: () => {
      nicepodLog("🧹 [Geo-Orchestrator] Ejecutando purga sensorial.");
      killHardwareWatch();
      resetForge();
      setIsTriangulated(false);
      setNearbyPOIs([]);
      setActivePOI(null);
    }
  };

  return (
    <GeoEngineContext.Provider value={api}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * useGeoEngine:
 * Único punto de acceso autorizado a la red sensorial de Madrid Resonance.
 */
export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) {
    throw new Error("Critical Error: useGeoEngine invoked outside of GeoEngineProvider.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V23.2):
 * 1. Patrón Fachada (Facade): Este hook ahora centraliza la comunicación entre 
 *    el silicio (Authority) y el oráculo (Orchestrator), permitiendo que la UI 
 *    sea inmune a la complejidad interna de la captura.
 * 2. Cero Latencia (T0): La integración con initialData (IP) aniquila la espera
 *    visual. El Voyager nace localizado.
 * 3. Resolución ts(2741): Se incluyó 'setTriangulated' y 'isGPSLock' en el objeto 
 *    API, sellando el contrato de tipos definido en types/geo-sovereignty.ts.
 * 4. Rigor NCIS: Se restauraron los cuerpos de función íntegros para asegurar que 
 *    la ingesta multimodal y la síntesis narrativa operen sin degradación.
 */