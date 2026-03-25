// components/geo/SpatialEngine/index.tsx
// VERSIÓN: 4.1 (NicePod Spatial Hub - Rescue & Rapid Reveal Edition)
// Misión: Eliminar el Deadlock de carga y garantizar el acceso visual inmediato.
// [ESTABILIZACIÓN]: Implementación de Fail-Safe Timer y revelado por evento 'idle'.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";

import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { FLY_CONFIG, INITIAL_VIEW_STATE, ZOOM_LEVELS } from "../map-constants";
import { POIPreviewCard } from "../poi-preview-card";
import MapCore from "./map-core";

type MapProps = ComponentProps<typeof Map>;
type SafeMapMoveEvent = Parameters<NonNullable<MapProps['onMove']>>[0];

export function SpatialEngine({ mode, onManualAnchor, className }: { mode: 'EXPLORE' | 'FORGE', onManualAnchor?: (l: [number, number]) => void, className?: string }) {
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { userLocation, nearbyPOIs, activePOI, status: engineStatus, initSensors } = useGeoEngine();

  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  const [searchCenter, setSearchCenter] = useState({
    latitude: INITIAL_VIEW_STATE.latitude,
    longitude: INITIAL_VIEW_STATE.longitude,
  });

  const hasInitialJumpPerformed = useRef<boolean>(false);

  // 1. SAFE MOUNT: Resize Observer
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

  // 2. PROTOCOLO DE RESCATE (Fail-Safe)
  // Si en 5 segundos el mapa no se ha revelado (por falta de GPS), forzamos el revelado.
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [Orchestrator] Fail-safe activado: Revelando mapa sin coordenadas.");
          setIsCameraSettled(true);
        }
      }, 5000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  const flyToPosition = useCallback((lng: number, lat: number, zoom = ZOOM_LEVELS.STREET) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom, pitch: mode === 'EXPLORE' ? 80 : 0, ...FLY_CONFIG });
  }, [mode]);

  // 3. SALTO INICIAL AL DETECTAR VOYAGER
  useEffect(() => {
    if (userLocation && isMapLoaded && !hasInitialJumpPerformed.current) {
      nicepodLog("🎯 [Orchestrator] Posición confirmada. Saltando a Voyager.");
      flyToPosition(userLocation.longitude, userLocation.latitude, mode === 'FORGE' ? ZOOM_LEVELS.FORGE : ZOOM_LEVELS.STREET);
      hasInitialJumpPerformed.current = true;
    }
  }, [userLocation, isMapLoaded, flyToPosition, mode]);

  // 4. EL REVELADO SOBERANO (Data-Driven)
  // Usamos el evento 'onIdle' (el mapa terminó de renderizar todo) como disparador de revelado.
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [Orchestrator] Malla 3D renderizada al 100%. Revelando.");
    }
  }, [isMapLoaded, isCameraSettled]);

  const handleMoveEnd = useCallback((event: SafeMapMoveEvent) => {
    setSearchCenter({ latitude: event.viewState.latitude, longitude: event.viewState.longitude });
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
      <AnimatePresence mode="wait">
        {!isCameraSettled && (
          <motion.div
            key="smokescreen"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-10"
          >
            <Compass className="h-16 w-16 text-primary animate-spin-slow" />
            <div className="text-center px-12 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white">Sincronización Órbital</span>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                {engineStatus === 'IDLE' ? "Esperando Gesto de Ignición..." : "Sintonizando Malla WebGL..."}
              </p>
              {engineStatus === 'IDLE' && (
                <button onClick={() => initSensors()} className="mt-8 px-8 py-4 bg-primary text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-4">
                  Activar Sensores
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isContainerReady && (
        <MapCore
          ref={mapRef}
          mode={mode}
          selectedPOIId={selectedPOIId}
          onLoad={() => setIsMapLoaded(true)}
          onIdle={handleMapIdle} // <--- Nuevo disparador de revelado
          onMove={() => { }}
          onMoveEnd={handleMoveEnd}
          onMapClick={(e: any) => {
            if (mode === 'FORGE' && onManualAnchor) onManualAnchor([e.lngLat.lng, e.lngLat.lat]);
          }}
          onMarkerClick={(id: string) => {
            setSelectedPOIId(id);
            const p = nearbyPOIs.find(item => item.id.toString() === id);
            if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1]);
          }}
        />
      )}

      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px]">
          <UnifiedSearchBar variant="console" onResults={() => { }} placeholder="Rastrear ecos..." latitude={searchCenter.latitude} longitude={searchCenter.longitude} />
        </div>
      )}

      <AnimatePresence>
        {mappedSelectedPOI && mode === 'EXPLORE' && (
          <POIPreviewCard poi={mappedSelectedPOI} distance={null} isResonating={false} onClose={() => setSelectedPOIId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}