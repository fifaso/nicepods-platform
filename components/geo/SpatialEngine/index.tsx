// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 4.2 (NicePod Spatial Hub - Persistent MESH & Hot-Swap Edition)
// Misión: Orquestar el motor WebGL eliminando la redundancia de carga mediante persistencia de triangulación.
// [ESTABILIZACIÓN]: Integración de isTriangulated, jumpTo instantáneo y desbloqueo de interactividad T0.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { FLY_CONFIG, INITIAL_VIEW_STATE, ZOOM_LEVELS } from "../map-constants";
import { POIPreviewCard } from "../poi-preview-card";
import MapCore from "./map-core";

/**
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: TYPE EXTRACTION
 * ---------------------------------------------------------------------------
 */
type MapProps = ComponentProps<typeof Map>;
type SafeMapMoveEvent = Parameters<NonNullable<MapProps['onMove']>>[0];

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

/**
 * SpatialEngine (Orquestador Maestro):
 * El cerebro táctico que gestiona la persistencia visual y la cámara inmersiva.
 */
export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V16.0)
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors,
    isTriangulated,   // Flag de persistencia global
    setTriangulated   // Método para sellar la localización
  } = useGeoEngine();

  // 2. REFERENCIAS DE HARDWARE
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. MÁQUINA DE ESTADOS (SMOKESCREEN & PERSISTENCIA)
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // [HOT SWAP]: Si ya estamos triangulados, la cámara nace lista.
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  const [searchCenter, setSearchCenter] = useState({
    latitude: INITIAL_VIEW_STATE.latitude,
    longitude: INITIAL_VIEW_STATE.longitude,
  });

  /**
   * 4. PROTOCOLOS DE INICIALIZACIÓN (Safe Mount)
   */
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          observer.disconnect();
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /**
   * 5. PROTOCOLO DE RESCATE (Fail-Safe)
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [Orchestrator] Fail-safe: Revelando por tiempo.");
          setIsCameraSettled(true);
        }
      }, 5000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 6. GESTIÓN DE CÁMARA INTELIGENTE (Pokémon GO Style)
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoom = ZOOM_LEVELS.STREET) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0,
      ...FLY_CONFIG
    });
  }, [mode]);

  const jumpToPosition = useCallback((lng: number, lat: number, zoom = ZOOM_LEVELS.STREET) => {
    mapRef.current?.jumpTo({
      center: [lng, lat],
      zoom,
      pitch: mode === 'EXPLORE' ? 80 : 0
    });
  }, [mode]);

  /**
   * [MISIÓN: SINCRONÍA DE LOCALIZACIÓN PERSISTENTE]
   * Decidimos si volar (primer contacto) o saltar (sesión activa).
   */
  useEffect(() => {
    if (!userLocation || !isMapLoaded) return;

    const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET;

    if (!isTriangulated) {
      // CASO A: Primera triangulación de la sesión (ej: el usuario acaba de entrar)
      nicepodLog("🎯 [Orchestrator] Posición detectada. Ejecutando Salto Táctico.");
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setTriangulated(); // Sellamos la ubicación para toda la plataforma
    } else {
      // CASO B: Hot Swap (ej: viene del dashboard). 
      // Teletransportamos la cámara sin animación para evitar el 'popping' visual.
      nicepodLog("🚀 [Orchestrator] Malla persistente detectada. Hot-Swap activo.");
      jumpToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setIsCameraSettled(true); // Abrimos cortina inmediatamente
    }
  }, [userLocation, isMapLoaded, isTriangulated, flyToPosition, jumpToPosition, mode, setTriangulated]);

  /**
   * 7. MANEJADORES DE EVENTOS
   */
  const handleMapIdle = useCallback(() => {
    // Revelado por datos: Si la GPU dice que terminó de renderizar tiles/edificios
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D renderizada. Fin de cortina.");
    }
  }, [isMapLoaded, isCameraSettled]);

  const handleMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    setSearchCenter({
      latitude: event.viewState.latitude,
      longitude: event.viewState.longitude
    });
  }, []);

  const mappedSelectedPOI = useMemo(() => {
    if (!selectedPOIId || !nearbyPOIs?.length) return null;
    const rawPoi = nearbyPOIs.find(p => p.id.toString() === selectedPOIId);
    return rawPoi ? {
      id: rawPoi.id.toString(),
      name: rawPoi.name,
      category: rawPoi.category_id,
      historical_fact: rawPoi.historical_fact || undefined,
      cover_image_url: rawPoi.gallery_urls?.[0] || undefined
    } : null;
  }, [selectedPOIId, nearbyPOIs]);

  return (
    <div ref={containerRef} className={cn("w-full h-full relative bg-[#010101]", className)}>

      {/* I. CORTINA DE CARGA INTELIGENTE (SMOKESCREEN) */}
      <AnimatePresence mode="wait">
        {!isCameraSettled && (
          <motion.div
            key="smokescreen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10"
          >
            <Compass className="h-16 w-16 text-primary animate-spin-slow" />
            <div className="text-center px-12 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">
                Madrid Resonance
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                {engineStatus === 'IDLE' ? "Esperando Gesto de Ignición..." : "Sincronizando Malla Local..."}
              </p>
              {engineStatus === 'IDLE' && (
                <button
                  onClick={() => initSensors()}
                  className="mt-8 px-8 py-4 bg-primary text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(var(--primary),0.4)]"
                >
                  Activar Sensores
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* II. MOTOR DE RENDERIZADO (INTERACTIVO DESDE T0) */}
      {isContainerReady && (
        <div className="w-full h-full">
          <MapCore
            ref={mapRef}
            mode={mode}
            selectedPOIId={selectedPOIId}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapIdle}
            onMove={() => { }}
            onMoveEnd={handleMoveEnd}
            onMapClick={(e: any) => {
              if (mode === 'FORGE' && onManualAnchor) onManualAnchor([e.lngLat.lng, e.lngLat.lat]);
            }}
            onMarkerClick={(id: string) => {
              if (mode === 'EXPLORE') {
                setSelectedPOIId(id);
                const p = nearbyPOIs.find(item => item.id.toString() === id);
                if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1]);
              }
            }}
          />
        </div>
      )}

      {/* III. INTERFAZ TÁCTICA (Solo en Exploración) */}
      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000">
          <UnifiedSearchBar
            variant="console"
            onResults={() => { }}
            placeholder="Rastrear ecos urbanos..."
            latitude={searchCenter.latitude}
            longitude={searchCenter.longitude}
          />
        </div>
      )}

      <AnimatePresence>
        {mappedSelectedPOI && mode === 'EXPLORE' && (
          <POIPreviewCard
            poi={mappedSelectedPOI}
            distance={activePOI?.id === selectedPOIId ? activePOI?.distance : null}
            isResonating={selectedPOIId === activePOI?.id && activePOI?.isWithinRadius}
            onClose={() => setSelectedPOIId(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.2):
 * 1. Protocolo Hot Swap: Se implementó la lógica de salto condicional. Si 'isTriangulated' 
 *    es true, el mapa usa 'jumpTo' y abre la cortina inmediatamente, eliminando la espera.
 * 2. Persistencia de Sesión: Al usar 'setTriangulated', el primer mapa que localice al 
 *    usuario (Dashboard o Full Map) libera al resto de la aplicación de la carga de GPS inicial.
 * 3. Interactividad Incondicional: Se desacopló el renderizado del mapa de la cortina negra. 
 *    El mapa es interactivo en cuanto 'isMapLoaded' es true, aunque la cortina esté 
 *    haciendo su efecto de fade-out.
 */