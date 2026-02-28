// hooks/use-geo-engine.ts
// VERSIÓN: 2.0

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";

/**
 * INTERFAZ: UserLocation
 * Registra la posición exacta y la orientación del curador.
 */
interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
}

/**
 * INTERFAZ: ActivePOI
 * Nodo de interés que actualmente resuena con la posición del usuario.
 */
interface ActivePOI {
  id: string;
  name: string;
  distance: number;
  isWithinRadius: boolean;
  historical_fact?: string;
}

/**
 * HOOK: useGeoEngine
 * El motor que otorga conciencia geográfica a la Workstation.
 */
export function useGeoEngine() {
  const supabase = createClient();

  // --- ESTADOS DE TELEMETRÍA ---
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- REFERENCIAS TÁCTICAS ---
  const watchId = useRef<number | null>(null);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);

  /**
   * UTILIDAD: calculateDistance (Fórmula de Haversine)
   * Calcula la distancia en metros entre dos puntos geográficos.
   * Crucial para determinar si el usuario ha entrado en un Círculo de Resonancia.
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  };

  /**
   * ACCIÓN: fetchNearbyPOIs
   * Recupera los nodos de sabiduría activos desde la vista 'vw_map_resonance_active'.
   */
  const fetchNearbyPOIs = useCallback(async (lat: number, lng: number) => {
    setIsSearching(true);
    try {
      // Invocamos la vista optimizada que creamos en el SQL
      const { data, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      setNearbyPOIs(data || []);
      nicepodLog(`🛰️ [GeoEngine] ${data?.length || 0} nodos de sabiduría localizados.`);
    } catch (err: any) {
      console.error("🔥 [GeoEngine-Fatal] Error al sincronizar POIs:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * ACCIÓN: evaluateResonance
   * Compara la posición del usuario contra los POIs para detectar sintonía.
   */
  const evaluateResonance = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    for (const poi of nearbyPOIs) {
      // Nota: geo_location viene como un punto de postgis. 
      // Asumimos formato [lng, lat] o parseamos según el RPC.
      const poiLat = poi.geo_location.coordinates[1];
      const poiLng = poi.geo_location.coordinates[0];

      const distance = calculateDistance(
        location.latitude, 
        location.longitude, 
        poiLat, 
        poiLng
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = {
          id: poi.id,
          name: poi.name,
          distance: Math.round(distance),
          isWithinRadius: distance <= (poi.entrance_radius_meters || 30),
          historical_fact: poi.historical_fact
        };
      }
    }

    setActivePOI(closest);
  }, [nearbyPOIs]);

  /**
   * EFECTO: SISTEMA DE RASTREO (LIFECYCLE)
   * Inicia el hardware del GPS y gestiona la actualización continua.
   */
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_NO_COMPATIBLE: El dispositivo no soporta GPS.");
      return;
    }

    const options = {
      enableHighAccuracy: true, // Priorizamos precisión sobre batería para el Retiro.
      timeout: 15000,
      maximumAge: 0,
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading } = position.coords;
      const newLocation = { latitude, longitude, accuracy, heading };

      setUserLocation(newLocation);
      evaluateResonance(newLocation);

      // Sincronía Inteligente: Solo pedimos nuevos POIs si el usuario se mueve > 50m
      if (!lastSyncLocation.current || 
          calculateDistance(latitude, longitude, lastSyncLocation.current.lat, lastSyncLocation.current.lng) > 50) {
        fetchNearbyPOIs(latitude, longitude);
        lastSyncLocation.current = { lat: latitude, lng: longitude };
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      nicepodLog(`⚠️ [GeoEngine] Error de señal GPS: ${err.message}`);
      setError(err.message);
    };

    // Iniciamos la escucha activa
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [fetchNearbyPOIs, evaluateResonance]);

  return {
    userLocation,   // Posición actual para centrar el mapa
    activePOI,      // El POI que está 'vibrando' actualmente (Resonancia)
    nearbyPOIs,     // Todos los nodos visibles en el radio
    isSearching,    // Estado de carga del radar
    error,          // Alertas de hardware/permisos
    refresh: () => { // Función para forzar re-escaneo manual
      if (userLocation) fetchNearbyPOIs(userLocation.latitude, userLocation.longitude);
    }
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Sincronía con vw_map_resonance_active: El hook consume la vista ligera que 
 *    diseñamos en el SQL, asegurando que la latencia de red sea mínima.
 * 2. Lógica de Umbral: El estado 'activePOI.isWithinRadius' es el disparador 
 *    para que la UI de NicePod 'despierte' al usuario con el Peek Card.
 * 3. Eficiencia Energética: Mediante 'lastSyncLocation', evitamos llamadas 
 *    redundantes a la base de datos si el usuario está quieto contemplando 
 *    un monumento del Retiro.
 */