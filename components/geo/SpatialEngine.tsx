// components/geo/SpatialEngine.tsx
// VERSIÓN: 12.0 (NicePod GO-Engine - Immutable Terrain & Deadlock Prevention Edition)
// Misión: Renderizado fotorrealista inmersivo garantizando estabilidad del motor WebGL v3.
// [ESTABILIZACIÓN]: Memoización estricta de Terrain/Fog para aniquilar el error 'mapbox-dem'.

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// --- MOTOR CARTOGRÁFICO (SUB-PATH EXPLÍCITO PARA VERCEL) ---
import Map, {
  GeolocateControl,
  Layer,
  MapRef,
  NavigationControl,
  Source
} from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE ANIMACIÓN Y UI ---
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShieldAlert } from "lucide-react";

// --- INFRAESTRUCTURA DE DOMINIO SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";

// --- COMPONENTES DE MALLA TÁCTICA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";
import { UserLocationMarker } from "./user-location-marker";

/**
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: CONTRATOS LOCALES ESTRICTOS
 * ---------------------------------------------------------------------------
 */
interface NicePodMapMoveEvent {
  viewState: {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
}

interface NicePodMapClickEvent {
  lngLat: {
    lng: number;
    lat: number;
  };
}

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const PHOTOREALISTIC_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
const DARK_IMMERSIVE_STYLE = "mapbox://styles/mapbox/dark-v11";

const FLY_CONFIG = {
  duration: 3500,
  essential: true,
  curve: 1.4,
  easing: (t: number) => t * (2 - t)
};

/**
 * SpatialEngine: El teatro de operaciones visual de NicePod.
 * Optimizado para una carga inicial liviana y un salto a fotorrealismo 3D.
 */
export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  // 1. REFERENCIAS DE HARDWARE Y CONTEXTOS
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const geoEngine = useGeoEngine();
  const { userLocation, nearbyPOIs, activePOI, status: engineStatus } = geoEngine;

  // 2. MÁQUINA DE ESTADOS (SMOKESCREEN PROTOCOL)
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * [FIX CRÍTICO]: MEMOIZACIÓN DE CONFIGURACIÓN
   * Evita que Mapbox intente reinstanciar el motor de terreno en cada re-render.
   * Esto aniquila el error "Source cannot be removed while terrain is using it".
   */
  const terrainConfiguration = useMemo(() => ({
    source: 'mapbox-dem',
    exaggeration: 1.2
  }), []);

  const fogConfiguration = useMemo(() => ({
    "range": [0.2, 8],
    "color": "#020202",
    "horizon-blend": 0.2,
    "high-color": "#1e293b",
    "space-color": "#000000",
    "star-intensity": 0.5
  }), []);

  /**
   * PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   */
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsContainerReady(true);
          resizeObserver.disconnect();
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  /**
   * CONFIGURACIÓN DE CÁMARA INICIAL (MODO AHORRO DE RED)
   * Zoom 14 y Pitch 30 para reducir la carga inicial del satélite.
   */
  const [viewState, setViewState] = useState({
    latitude: geoEngine.userLocation?.latitude || 40.4167,
    longitude: geoEngine.userLocation?.longitude || -3.7037,
    zoom: 14,
    pitch: mode === 'FORGE' ? 0 : 30,
    bearing: 0,
  });

  /**
   * PROTOCOLOS DE VUELO TÁCTICO
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoomLevel = 17, targetPitch = 75) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: zoomLevel,
        pitch: mode === 'EXPLORE' ? targetPitch : 0,
        ...FLY_CONFIG
      });
    }
  }, [mode]);

  /**
   * [MISIÓN: AUTO-LOCALIZACIÓN INVISIBLE]
   */
  useEffect(() => {
    if (userLocation && isMapLoaded && !hasInitialJumpPerformed.current) {
      nicepodLog("🎯 [SpatialEngine] Sintonía establecida. Iniciando salto táctico.");
      flyToPosition(userLocation.longitude, userLocation.latitude, mode === 'FORGE' ? 18.2 : 16.8, 75);
      hasInitialJumpPerformed.current = true;
    }
  }, [userLocation, isMapLoaded, flyToPosition, mode]);

  /**
   * EL REVELADO (The Fade-In Trigger)
   */
  const handleMoveEnd = useCallback(() => {
    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [SpatialEngine] Malla 3D lista para el Voyager.");
    }
  }, [isCameraSettled]);

  const handleMove = useCallback((event: NicePodMapMoveEvent) => {
    setViewState(event.viewState);
  }, []);

  const handleMapClick = useCallback((event: NicePodMapClickEvent) => {
    if (mode !== 'FORGE' || !onManualAnchor) return;
    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
    onManualAnchor(lngLat);
    flyToPosition(lngLat[0], lngLat[1], 19, 0);
  }, [mode, onManualAnchor, flyToPosition]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, 17.5, 75);
      }
    }
  }, [flyToPosition]);

  /**
   * CAPA ARQUITECTÓNICA 3D
   */
  const buildingLayerConfig = useMemo(() => ({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": mode === 'EXPLORE' ? "#050505" : "#ffffff",
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": 0.7,
    },
  }), [mode]);

  const onMapLoad = useCallback((e: any) => {
    setIsMapLoaded(true);
    const map = e.target;
    if (mode === 'EXPLORE') {
      const style = map.getStyle();
      if (style && style.layers) {
        style.layers.forEach((layer: any) => {
          if (layer.type === 'symbol' && (layer.id.includes('poi') || layer.id.includes('transit'))) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });
      }
    }
  }, [mode]);

  const mappedSelectedPOI = useMemo(() => {
    if (!selectedPOIId || !nearbyPOIs || nearbyPOIs.length === 0) return null;
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

      <AnimatePresence>
        {!isCameraSettled && engineStatus !== 'PERMISSION_DENIED' && (
          <motion.div
            key="smokescreen"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 z-[110] bg-[#020202] flex flex-col items-center justify-center space-y-5"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="flex flex-col items-center gap-2 text-center px-8">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white">Sincronizando Órbita</span>
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                {!isMapLoaded ? "Iniciando Motor WebGL..." :
                  !userLocation ? "Buscando coordenadas satelitales..." :
                    "Calibrando Malla Fotorrealista 3D..."}
              </span>
            </div>
          </motion.div>
        )}

        {engineStatus === 'PERMISSION_DENIED' && (
          <motion.div
            key="p-shield"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-[150] bg-zinc-950 flex flex-col items-center justify-center p-8 text-center"
          >
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">GPS Bloqueado</span>
            <p className="text-xs text-zinc-500 mt-4 max-w-[200px] leading-relaxed">
              Habilite el acceso a la ubicación para proyectar la Malla de Madrid Resonance.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {isContainerReady && (
        <motion.div
          animate={{ opacity: isCameraSettled ? 1 : 0 }}
          className="w-full h-full"
        >
          <Map
            {...viewState}
            ref={mapRef}
            onMove={handleMove as any}
            onMoveEnd={handleMoveEnd}
            onClick={handleMapClick as any}
            onLoad={onMapLoad}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle={mode === 'FORGE' ? PHOTOREALISTIC_STYLE : DARK_IMMERSIVE_STYLE}
            projection="mercator"

            // [MEJORA]: Referencia memoizada para evitar Deadlocks
            terrain={mode === 'EXPLORE' ? terrainConfiguration : undefined}
            fog={mode === 'EXPLORE' ? fogConfiguration as any : undefined}

            antialias={false}
            reuseMaps={true}
            maxPitch={82}
            attributionControl={false}
          >
            {/* [MEJORA]: La fuente de datos DEM es síncrona con el objeto de terreno */}
            {mode === 'EXPLORE' && (
              <Source
                id="mapbox-dem"
                type="raster-dem"
                url="mapbox://mapbox.mapbox-terrain-dem-v1"
                tileSize={512}
                maxzoom={14}
              />
            )}

            <GeolocateControl showUserLocation={false} className="hidden" />

            {/* AVATAR Y MARCADORES */}
            {userLocation && (
              <UserLocationMarker
                location={userLocation}
                isResonating={!!activePOI?.isWithinRadius}
              />
            )}

            {nearbyPOIs?.map((poi: PointOfInterest) => (
              <MapMarkerCustom
                key={poi.id}
                id={poi.id.toString()}
                latitude={poi.geo_location.coordinates[1]}
                longitude={poi.geo_location.coordinates[0]}
                category_id={poi.category_id}
                name={poi.name}
                isResonating={activePOI?.id === poi.id.toString() && activePOI?.isWithinRadius}
                isSelected={selectedPOIId === poi.id.toString()}
                onClick={(id: string) => {
                  if (mode === 'EXPLORE') {
                    setSelectedPOIId(id);
                    const p = nearbyPOIs.find(item => item.id.toString() === id);
                    if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1], 17.5, 75);
                  }
                }}
              />
            ))}

            {isMapLoaded && mode === 'EXPLORE' && (
              <Layer {...buildingLayerConfig as any} />
            )}

            <div className="absolute bottom-10 right-4 flex flex-col gap-4 z-40">
              <NavigationControl showCompass={false} className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-2xl" />
            </div>
          </Map>
        </motion.div>
      )}

      {/* OVERLAY DE BÚSQUEDA */}
      {mode === 'EXPLORE' && isCameraSettled && (
        <div className="absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] animate-in fade-in duration-1000">
          <UnifiedSearchBar
            variant="console"
            onResults={handleSearchResult}
            onLoading={setIsSearchLoading}
            placeholder="Rastrear ecos urbanos..."
            latitude={viewState.latitude}
            longitude={viewState.longitude}
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