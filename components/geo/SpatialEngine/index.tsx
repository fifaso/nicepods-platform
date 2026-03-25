// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 5.1 (NicePod Spatial Hub - High-Fidelity & Edge-IP Integration Edition)
// Misión: Orquestar el motor WebGL eliminando la latencia de carga y materializando al Voyager.
// [ESTABILIZACIÓN]: Integración de Fallback por IP, Hot-Swap instantáneo y Revelado por Datos GPU.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, ShieldAlert } from "lucide-react";
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
 * Extraemos dinámicamente los tipos del componente Map para evitar colisiones 
 * con Namespaces internos de la librería Mapbox GL.
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
 * SpatialEngine: El reactor de inteligencia visual y orquestación de malla.
 */
export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {
  
  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V20.0)
  const {
    userLocation,
    nearbyPOIs,
    activePOI,
    status: engineStatus,
    isTriangulated,
    setTriangulated
  } = useGeoEngine();

  // 2. REFERENCIAS DE CONTROL DE HARDWARE
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. MÁQUINA DE ESTADOS (REVELADO & PERSISTENCIA)
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  /**
   * [SINCRO T0]: Si la sesión ya está triangulada (vienes del Dashboard),
   * la cámara nace lista y la cortina negra no se muestra.
   */
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  // Centro de búsqueda para la Bóveda NKV (Actualizado solo en moveEnd)
  const [searchCenter, setSearchCenter] = useState({
    latitude: INITIAL_VIEW_STATE.latitude,
    longitude: INITIAL_VIEW_STATE.longitude,
  });

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * 4. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   * Garantiza que el contenedor tenga dimensiones reales antes de instanciar WebGL.
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
   * Si el motor o el GPS no responden, forzamos la visión tras 6 segundos.
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [Orchestrator] Fail-Safe activado. Forzando revelado.");
          setIsCameraSettled(true);
        }
      }, 6000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 6. GESTIÓN DE CÁMARA DINÁMICA
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
   * 7. PROTOCOLO DE MATERIALIZACIÓN (Hot-Swap vs Cinematic Fix)
   * Reacciona a la primera ubicación disponible (IP, Caché o GPS).
   */
  useEffect(() => {
    if (!userLocation || !isMapLoaded || hasInitialJumpPerformed.current) return;

    const targetZoom = mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET;

    if (!isTriangulated) {
      // CASO A: Inicio en frío. Vuelo cinemático para mostrar la ciudad.
      nicepodLog("🎯 [Orchestrator] Voyager localizado. Iniciando aproximación.");
      flyToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setTriangulated(); // Marcamos como localizado globalmente
    } else {
      // CASO B: Ubicación persistente. Hot-Swap instantáneo sin esperas.
      nicepodLog("🚀 [Orchestrator] Malla persistente detectada. Hot-Swap activo.");
      jumpToPosition(userLocation.longitude, userLocation.latitude, targetZoom);
      setIsCameraSettled(true); // Retiramos cortina de inmediato
    }

    hasInitialJumpPerformed.current = true;
  }, [userLocation, isMapLoaded, isTriangulated, flyToPosition, jumpToPosition, mode, setTriangulated]);

  /**
   * 8. MANEJADORES DE EVENTOS SOBERANOS
   */

  // Revelado por Datos: La GPU confirma que terminó de renderizar los tiles y edificios.
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D renderizada al 100%. Revelando.");
    }
  }, [isMapLoaded, isCameraSettled]);

  const handleMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    setSearchCenter({
      latitude: event.viewState.latitude,
      longitude: event.viewState.longitude
    });
  }, []);

  const handleMapClick = useCallback((event: SafeMapClickEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;
    
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

  // Data Mapper: Trasmuta PointOfInterest en props legibles por la UI de la Card.
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
          I. CORTINA DE CARGA SOBERANA (SMOKESCREEN) 
          Solo aparece si no estamos triangulados previamente.
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

            <div className="flex flex-col items-center gap-4 text-center px-12">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">
                Sincronización Órbital
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                {engineStatus === 'IDLE' ? "Esperando Gesto de Autorización..." : 
                 !userLocation ? "Capturando Telemetría de Red..." : "Estabilizando Malla 3D..."}
              </p>
            </div>
          </motion.div>
        )}

        {/* ESCENARIO B: PERMISSION SHIELD (GPS BLOQUEADO) */}
        {engineStatus === 'PERMISSION_DENIED' && (
          <motion.div
            key="p-shield"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[150] bg-[#020202] flex flex-col items-center justify-center p-12 text-center"
          >
            <ShieldAlert className="h-16 w-16 text-red-500 mb-8" />
            <span className="text-sm font-black uppercase tracking-[0.5em] text-red-400">Acceso Interceptado</span>
            <p className="text-xs text-zinc-500 mt-6 max-w-[280px] leading-relaxed uppercase font-bold tracking-widest">
              Habilite los permisos de ubicación para proyectar la Malla de Madrid en este dispositivo.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          II. EL MOTOR DE RENDERIZADO (CORE)
          Interactivo desde T0 para garantizar una UX líquida.
      */}
      {isContainerReady && (
        <div className="w-full h-full">
          <MapCore
            ref={mapRef}
            mode={mode}
            selectedPOIId={selectedPOIId}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapIdle}
            onMove={() => {}}
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
            onLoading={setIsSearchLoading}
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.1):
 * 1. Hot-Swap Strategy: Si el Voyager ya fue localizado en otra página, el mapa nace 
 *    centrado y con la cortina negra oculta, logrando una carga instantánea perceptible.
 * 2. Rapid Reveal (onIdle): El sistema ignora los tiempos de espera artificiales y se 
 *    revela exactamente cuando la GPU termina de renderizar la ciudad.
 * 3. Interactividad T0: Se permite el uso de gestos (panning/zoom) en cuanto el motor 
 *    Mapbox carga, eliminando la sensación de "mapa bloqueado" durante el salto inicial.
 * 4. Zero-Any Build Shield: Tipado estricto mediante inferencia de ComponentProps, 
 *    garantizando la estabilidad del sistema en el entorno de producción de Vercel.
 */