// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 5.0 (NicePod Spatial Hub - High-Fidelity & Zero-Latency Edition)
// Misión: Orquestar el motor WebGL eliminando la redundancia de carga y el estancamiento visual.
// [ESTABILIZACIÓN]: Integración de Persistencia V19.0, Hot-Swap Instantáneo y Revelado por Datos GPU.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Power, ShieldAlert } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { SearchResult } from "@/hooks/use-search-radar";
import { cn, nicepodLog } from "@/lib/utils";
import { FLY_CONFIG, INITIAL_VIEW_STATE, ZOOM_LEVELS } from "../map-constants";
import { POIPreviewCard } from "../poi-preview-card";
import MapCore from "./map-core";

/**
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 * Extraemos los contratos de eventos directamente del componente Map.
 * ---------------------------------------------------------------------------
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

/**
 * SpatialEngine: El Cerebro Táctico de la Malla de Madrid.
 */
export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V19.0)
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    initSensors,
    isTriangulated,
    setTriangulated
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL DE HARDWARE
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. MÁQUINA DE ESTADOS (REVELADO & PERSISTENCIA)
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  /**
   * [HOT-SWAP]: Si la sesión ya está triangulada, la cámara nace asentada.
   * Esto elimina la cortina negra (Smokescreen) instantáneamente.
   */
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  // Ancla para el Radar de Búsqueda (Bóveda NKV)
  const [searchCenter, setSearchCenter] = useState({
    latitude: INITIAL_VIEW_STATE.latitude,
    longitude: INITIAL_VIEW_STATE.longitude,
  });

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * 4. PROTOCOLOS DE SEGURIDAD MATEMÁTICA (Safe Mount)
   * Previene el colapso de WebGL por dimensiones de contenedor inválidas.
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
   * 5. PROTOCOLO DE IGNICIÓN (Hardware Handshake)
   */
  useEffect(() => {
    if (isContainerReady) {
      initSensors();
    }
  }, [isContainerReady, initSensors]);

  /**
   * 6. GESTIÓN DE CÁMARA INMERSIVA
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
   * 7. PROTOCOLO DE MATERIALIZACIÓN (T0 Materialization)
   * Reacciona a la primera señal del GPS (o al caché del localStorage).
   */
  useEffect(() => {
    if (!userLocation || !isMapLoaded || hasInitialJumpPerformed.current) return;

    const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET;

    if (!isTriangulated) {
      // CASO A: Inicio en frío. Ejecutamos el vuelo cinemático de descubrimiento.
      nicepodLog("🎯 [Orchestrator] Voyager detectado. Iniciando aproximación aérea.");
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setTriangulated(); // Sellamos la ubicación en la sesión global
    } else {
      // CASO B: Hot-Swap. Teletransportación instantánea.
      nicepodLog("🚀 [Orchestrator] Malla persistente detectada. Hot-Swap activo.");
      jumpToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setIsCameraSettled(true); // Disolvemos la cortina inmediatamente
    }

    hasInitialJumpPerformed.current = true;
  }, [userLocation, isMapLoaded, isTriangulated, flyToPosition, jumpToPosition, mode, setTriangulated]);

  /**
   * 8. MANEJADORES DE EVENTOS SOBERANOS
   */

  // Gatillo de Revelado por Datos: La GPU confirma que el renderizado es estable.
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D estabilizada. Revelado completado.");
    }
  }, [isMapLoaded, isCameraSettled]);

  const handleMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    // Sincronizamos la Bóveda NKV solo al detener la cámara para optimizar red.
    setSearchCenter({
      latitude: event.viewState.latitude,
      longitude: event.viewState.longitude
    });
  }, []);

  const handleMapClick = useCallback((event: SafeMapClickEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;

    // Feedback háptico industrial para anclaje manual.
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }

    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    onManualAnchor(lngLat);
    jumpToPosition(lngLat[0], lngLat[1], ZOOM_LEVELS.FORGE);
  }, [mode, onManualAnchor, jumpToPosition]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, ZOOM_LEVELS.STREET);
      }
    }
  }, [flyToPosition]);

  // Transformador de datos: Convierte PointOfInterest de la DB en props para el Dossier.
  const mappedSelectedPOI = useMemo(() => {
    if (!selectedPOIId || !nearbyPOIs?.length) return null;
    const rawPoi = nearbyPOIs.find(p => p.id.toString() === selectedPOIId);
    if (!rawPoi) return null;
    return {
      id: rawPoi.id.toString(),
      name: rawPoi.name,
      category: rawPoi.category_id,
      historical_fact: rawPoi.historical_fact || undefined,
      cover_image_url: rawPoi.gallery_urls?.[0] || undefined
    };
  }, [selectedPOIId, nearbyPOIs]);

  return (
    <div ref={containerRef} className={cn("w-full h-full relative bg-[#010101]", className)}>

      {/* 
          I. CORTINA DE CARGA INTELIGENTE (SMOKESCREEN)
          Aislada mediante AnimatePresence para purga física del DOM tras el revelado.
      */}
      <AnimatePresence mode="wait">
        {!isCameraSettled && (
          <motion.div
            key="smokescreen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
              />
              <Compass className="h-16 w-16 text-primary relative z-10 animate-spin-slow" />
            </div>

            <div className="flex flex-col items-center gap-6 text-center px-12">
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">
                  Madrid Resonance
                </span>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                  {engineStatus === 'IDLE' ? "Esperando Gesto de Ignición..." :
                    !isMapLoaded ? "Cargando Malla WebGL..." :
                      !userLocation ? "Buscando Coordenadas Satelitales..." :
                        "Estabilizando Horizonte 3D..."}
                </p>
              </div>

              {/* [BYPASS]: Ignición manual para navegadores que bloquean el GPS automático */}
              {engineStatus === 'IDLE' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => initSensors()}
                  className="px-8 py-4 bg-primary text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(var(--primary),0.4)] flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  <Power size={14} />
                  Activar Sensores
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ESCENARIO B: PERMISSION SHIELD (ESTADO DE BLOQUEO GPS) */}
        {engineStatus === 'PERMISSION_DENIED' && (
          <motion.div
            key="p-shield"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[150] bg-[#020202] flex flex-col items-center justify-center p-12 text-center"
          >
            <ShieldAlert className="h-16 w-16 text-red-500 mb-8" />
            <span className="text-sm font-black uppercase tracking-[0.5em] text-red-400">Acceso Interceptado</span>
            <p className="text-xs text-zinc-500 mt-6 max-w-[280px] leading-relaxed uppercase font-bold tracking-widest">
              Habilite los permisos de ubicación en su dispositivo para proyectar la Malla de Madrid.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          II. EL MOTOR DE RENDERIZADO (CORE)
          Totalmente interactivo desde que el contenedor está listo.
      */}
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
            onMapClick={handleMapClick}
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

      {/* --- III. INTERFAZ TÁCTICA SUPERPUESTA --- */}
      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000">
          <UnifiedSearchBar
            variant="console"
            onResults={handleSearchResult}
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Protocolo Hot-Swap Integrado: El mapa ahora nace con 'isCameraSettled' si ya hay 
 *    triangulación previa, logrando una carga visual instantánea.
 * 2. JumpTo vs FlyTo: El sistema diferencia entre la primera localización de la sesión 
 *    (vuelo cinemático) y re-navegaciones (salto instantáneo), respetando la inercia del usuario.
 * 3. Revelado por Datos (GPU Idle): Se eliminaron los timers arbitrarios. La cortina de carga
 *    se levanta solo cuando el 'MapCore' confirma que la GPU ha terminado el renderizado.
 * 4. Zero-Any Build Shield: Implementación de Inferencia de Tipos (ComponentProps) para 
 *    garantizar compatibilidad total con la librería de Mapbox sin errores de Namespace.
 */