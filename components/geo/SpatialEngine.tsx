// components/geo/SpatialEngine.tsx
// VERSIÓN: 10.0 (NicePod GO-Engine - The Cinematic Smokescreen Edition)
// Misión: Renderizado fotorrealista inmersivo ocultando la compilación WebGL bajo una Cortina de Humo.
// [ESTABILIZACIÓN]: Revelado diferido (onMoveEnd) y erradicación del Jittering móvil.

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// --- MOTOR CARTOGRÁFICO ---
import Map, {
  GeolocateControl,
  Layer,
  NavigationControl,
  Source
} from 'react-map-gl/mapbox';

import { AnimatePresence, motion } from "framer-motion";
import { Compass, ShieldAlert } from "lucide-react";

// --- INFRAESTRUCTURA SOBERANA ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";

// --- COMPONENTES DE MALLA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";
import { UserLocationMarker } from "./user-location-marker";

/**
 * ---------------------------------------------------------------------------
 * [BUILD SHIELD]: CONTRATOS LOCALES ESTRICTOS
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

type MapRefInstance = React.ElementRef<typeof Map>;

interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// [ESTÁNDAR VISUAL GO-EXPERIENCE]
const PHOTOREALISTIC_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
const DARK_IMMERSIVE_STYLE = "mapbox://styles/mapbox/dark-v11";

export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  // 1. REFERENCIAS DE HARDWARE Y CONTEXTOS
  const mapRef = useRef<MapRefInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const geoEngine = useGeoEngine();
  const { userLocation, nearbyPOIs, activePOI, status: engineStatus } = geoEngine;

  // 2. MÁQUINA DE ESTADOS (SMOKESCREEN PROTOCOL)
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

  // Fases de Revelado Cinemático
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(false);

  // Guardia de primer vuelo (impide que la cámara salte si el usuario panea)
  const hasInitialJumpPerformed = useRef<boolean>(false);

  /**
   * PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
   * Asegura que el WebGL no intente compilarse en un div de 0x0.
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
   * CONFIGURACIÓN DE CÁMARA (El Nacimiento en las Sombras)
   * Nacemos con pitch bajo para optimizar CPU mientras la pantalla está negra.
   */
  const [viewState, setViewState] = useState({
    latitude: geoEngine.userLocation?.latitude || 40.4167,
    longitude: geoEngine.userLocation?.longitude || -3.7037,
    zoom: mode === 'FORGE' ? 18.5 : 15.5,
    pitch: mode === 'FORGE' ? 0 : 60,
    bearing: -10,
  });

  // Mantiene la cámara cenital pegada al GPS cuando el Admin forja (Mira Telescópica)
  useEffect(() => {
    if (geoEngine.userLocation && mode === 'FORGE' && isCameraSettled) {
      setViewState(prev => ({
        ...prev,
        latitude: geoEngine.userLocation!.latitude,
        longitude: geoEngine.userLocation!.longitude
      }));
    }
  }, [geoEngine.userLocation, mode, isCameraSettled]);

  /**
   * PROTOCOLOS DE VUELO TÁCTICO (Cinematic Jump)
   */
  const flyToPosition = useCallback((lng: number, lat: number, zoomLevel = 17, targetPitch = 80) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: zoomLevel,
        pitch: mode === 'EXPLORE' ? targetPitch : 0,
        duration: 3500,
        essential: true,
        curve: 1.5,
        easing: (t: number) => t * (2 - t)
      });
    }
  }, [mode]);

  /**
   * [MISIÓN: AUTO-LOCALIZACIÓN INVISIBLE]
   * Una vez que tenemos la coordenada y el mapa está compilado, volamos hacia
   * el Voyager, pero el mapa sigue oculto (Opacity 0).
   */
  useEffect(() => {
    if (userLocation && isMapLoaded && !hasInitialJumpPerformed.current) {
      nicepodLog("🎯 [SpatialEngine] Coordenada detectada. Ejecutando vuelo en la sombra.");

      // Vuelo ciego a alta velocidad y levantamos el horizonte (80°)
      flyToPosition(userLocation.longitude, userLocation.latitude, mode === 'FORGE' ? 18.5 : 16.5, 80);

      hasInitialJumpPerformed.current = true;

      // Plan de Respaldo: Si la animación de Mapbox se traba, revelamos la malla
      // de todos modos a los 4 segundos para evitar que el Voyager quede atrapado.
      const fallbackReveal = setTimeout(() => {
        setIsCameraSettled(true);
      }, 4000);

      return () => clearTimeout(fallbackReveal);
    }
  }, [userLocation, isMapLoaded, flyToPosition, mode]);

  /**
   * EL REVELADO (The Fade-In Trigger)
   * Escuchamos cuándo el vuelo terminó. Es el momento perfecto para levantar el telón.
   */
  const handleMoveEnd = useCallback(() => {
    if (hasInitialJumpPerformed.current && !isCameraSettled) {
      nicepodLog("✨ [SpatialEngine] Vuelo concluido. Revelando Fotorrealismo 3D.");
      setIsCameraSettled(true);
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
    flyToPosition(lngLat[0], lngLat[1], 19, 0); // Zoom cenital para precisión
  }, [mode, onManualAnchor, flyToPosition]);

  const handleSearchResult = useCallback((results: SearchResult[] | null) => {
    if (results && results.length > 0) {
      const topHit = results[0];
      if (topHit.metadata?.lat && topHit.metadata?.lng) {
        flyToPosition(topHit.metadata.lng, topHit.metadata.lat, 17, 75);
      }
    }
  }, [flyToPosition]);

  /**
   * ATMÓSFERA SOBERANA Y CRISTALIZACIÓN ARQUITECTÓNICA
   */
  const fogConfig = useMemo(() => ({
    "range": [0.5, 10],
    "color": "#020202",
    "horizon-blend": 0.2,
    "high-color": "#1e293b",
    "space-color": "#000000",
    "star-intensity": 0.5
  }), []);

  const buildingLayerConfig = useMemo(() => ({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#050505", // Cristal de Obsidiana
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": 0.8,
    },
  }), []);

  /**
   * [PROTOCOLO DE SILENCIO URBANO]
   * Purgamos las etiquetas de tiendas y estaciones en modo Explorador.
   */
  const onMapLoad = useCallback((e: any) => {
    setIsMapLoaded(true);
    const map = e.target;
    if (mode === 'EXPLORE') {
      const layers = map.getStyle().layers;
      layers.forEach((layer: any) => {
        if (layer.type === 'symbol' && (layer.id.includes('poi') || layer.id.includes('transit'))) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
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

      <AnimatePresence mode="wait">
        {/* ESCENARIO A: PERMISSION SHIELD */}
        {engineStatus === 'PERMISSION_DENIED' && (
          <motion.div
            key="shield"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-[150] text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
              <ShieldAlert className="h-10 w-10 text-red-500 relative z-10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400 mb-2">GPS Interceptado</span>
            <p className="text-xs text-zinc-500 max-w-[250px] leading-relaxed">
              NicePod necesita triangular su ubicación. Habilite el acceso al hardware satelital en su dispositivo.
            </p>
          </motion.div>
        )}

        {/* ESCENARIO B: CORTINA DE HUMO CINEMÁTICA */}
        {!isCameraSettled && engineStatus !== 'PERMISSION_DENIED' && (
          <motion.div
            key="smokescreen"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-[#020202] z-[90]"
          >
            <div className="relative">
              <Compass className="h-10 w-10 text-primary/30 animate-spin-slow" />
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">
                Sincronizando Órbita
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-primary/60 italic">
                {!isMapLoaded ? "Cargando Motor WebGL..." :
                  !userLocation ? "Buscando Coordenadas Satelitales..." :
                    "Calibrando Fotorrealismo 3D..."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          EL MOTOR DE RENDERIZADO INMERSIVO
          Siempre se compila de fondo, pero su visibilidad ('opacity') depende de
          que el vuelo táctico haya concluido ('isCameraSettled').
      */}
      {isContainerReady && (
        <motion.div
          animate={{ opacity: isCameraSettled ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <Map
            {...viewState}
            ref={mapRef as any}
            onMove={handleMove as any}
            onMoveEnd={handleMoveEnd} // [NUEVO]: Detonador del Revelado
            onClick={handleMapClick as any}
            onLoad={onMapLoad}
            mapboxAccessToken={MAPBOX_TOKEN}

            // Fotorrealismo para Forge y Explore. La inmersión es absoluta.
            mapStyle={mode === 'FORGE' ? PHOTOREALISTIC_STYLE : DARK_IMMERSIVE_STYLE}
            projection="globe"

            terrain={mode === 'EXPLORE' ? { source: 'mapbox-dem', exaggeration: 1.2 } : undefined}
            fog={mode === 'EXPLORE' ? fogConfig as any : undefined}
            antialias={false} // Desactivado para ahorrar GPU
            reuseMaps={true}
            maxPitch={85}
            attributionControl={false}
          >
            {/* FUENTE DE ELEVACIÓN */}
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

            {/* AVATAR DEL VOYAGER */}
            {userLocation && (
              <UserLocationMarker
                location={userLocation}
                isResonating={!!activePOI?.isWithinRadius}
              />
            )}

            {/* ECOS Y MARCADORES FLOTANTES */}
            {geoEngine.nearbyPOIs?.map((poi: PointOfInterest) => (
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
                    const p = geoEngine.nearbyPOIs.find(item => item.id.toString() === id);
                    if (p) flyToPosition(p.geo_location.coordinates[0], p.geo_location.coordinates[1], 17, 75);
                  }
                }}
              />
            ))}

            {/* EDIFICIOS DE OBSIDIANA */}
            {isMapLoaded && mode === 'EXPLORE' && (
              <Layer {...buildingLayerConfig as any} />
            )}

            {/* CONTROLES DE NAVEGACIÓN */}
            <div className="absolute bottom-10 right-4 flex flex-col gap-4 z-40">
              <NavigationControl showCompass={false} className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-2xl" />
            </div>
          </Map>
        </motion.div>
      )}

      {/* OVERLAYS UI DE NAVEGACIÓN Y BÚSQUEDA */}
      {mode === 'EXPLORE' && (
        <div className={cn(
          "absolute top-6 left-4 right-4 z-[100] md:top-8 md:left-8 md:w-[400px] transition-opacity duration-1000",
          isCameraSettled ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <UnifiedSearchBar
            variant="console"
            onResults={handleSearchResult}
            onLoading={setIsSearchLoading}
            placeholder="Rastrear ecos urbanos..."
            latitude={viewState.latitude}
            longitude={viewState.longitude}
            className="shadow-2xl"
          />
        </div>
      )}

      {/* TARGETA DE DOSSIER (HALLAZGO) */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Smokescreen Protocol: El motor ahora aprovecha el evento 'onMoveEnd' de Mapbox 
 *    (Línea 197). La pantalla de carga ("Sincronizando Órbita") no se quita por un
 *    temporizador arbitrario, sino matemáticamente cuando la cámara llega a su destino.
 * 2. Feedback Informativo: El Loader indica exactamente qué está haciendo el sistema
 *    en cada milisegundo (Cargando Motor -> Buscando GPS -> Calibrando 3D).
 * 3. Economía de GPU: 'antialias=false' en móviles evita que la batería se consuma
 *    intentando suavizar los bordes de los edificios de cristal, mejorando los FPS.
 */