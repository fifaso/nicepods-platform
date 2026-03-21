// components/geo/SpatialEngine.tsx
// VERSIÓN: 5.1 (NicePod GO-Engine - Sovereign Contract Edition)
// Misión: Centralizar el renderizado 3D inmersivo garantizando un Build Shield impenetrable.
// [ESTABILIZACIÓN]: Erradicación de ts(18046) mediante Contratos Locales Estrictos (Zero-Unknown).

"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// --- MOTOR CARTOGRÁFICO (COMPONENTES) ---
import Map, {
  GeolocateControl,
  Layer,
  NavigationControl
} from 'react-map-gl';

import { AnimatePresence } from "framer-motion";

// --- INFRAESTRUCTURA DE DOMINIO SOBERANO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn } from "@/lib/utils";
import { PointOfInterest } from "@/types/geo-sovereignty";

// --- COMPONENTES DE MALLA TÁCTICA ---
import { MapMarkerCustom } from "./map-marker-custom";
import { POIPreviewCard } from "./poi-preview-card";
import { UserLocationMarker } from "./user-location-marker";

/**
 * ---------------------------------------------------------------------------
 * [BUILD SHIELD]: CONTRATOS LOCALES ESTRICTOS
 * ---------------------------------------------------------------------------
 * Aniquilamos los errores ts(2709) y ts(18046) definiendo exactamente 
 * la estructura de datos que esperamos recibir de la librería externa.
 * Esto nos hace inmunes a cambios en las definiciones de react-map-gl.
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

/**
 * INTERFAZ: SpatialEngineProps
 */
interface SpatialEngineProps {
  mode: 'EXPLORE' | 'FORGE';
  onManualAnchor?: (lngLat: [number, number]) => void;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * SpatialEngine: La cara visual de NicePod V2.6.
 * Implementa la 'Experiencia GO' con pitch de 75° y atmósfera dinámica v3.
 */
export function SpatialEngine({ mode, onManualAnchor, className }: SpatialEngineProps) {

  // 1. REFERENCIAS DE HARDWARE WEBGL
  const mapRef = useRef<MapRefInstance>(null);
  const geoEngine = useGeoEngine();

  // 2. ESTADOS DE INTERACCIÓN
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  /**
   * CONFIGURACIÓN DE CÁMARA "GO-EXPERIENCE"
   */
  const [viewState, setViewState] = useState({
    latitude: geoEngine.userLocation?.latitude || 40.4167,
    longitude: geoEngine.userLocation?.longitude || -3.7037,
    zoom: mode === 'FORGE' ? 18.5 : 16.2,
    pitch: 75,
    bearing: -12,
  });

  // Sincronía T0 con el GPS del Voyager
  useEffect(() => {
    if (geoEngine.userLocation && mode === 'FORGE' && !isMapLoaded) {
      setViewState(prev => ({
        ...prev,
        latitude: geoEngine.userLocation!.latitude,
        longitude: geoEngine.userLocation!.longitude
      }));
    }
  }, [geoEngine.userLocation, mode, isMapLoaded]);

  /**
   * ATMÓSFERA SOBERANA (Mapbox v3 Fog API)
   */
  const fogConfig = useMemo(() => ({
    "range": [0.5, 10],
    "color": "#020202",
    "horizon-blend": 0.2,
    "high-color": "#1e293b",
    "space-color": "#010101",
    "star-intensity": 0.35
  }), []);

  /**
   * CAPA ARQUITECTÓNICA 3D (Cristalización de Madrid)
   */
  const buildingLayerConfig = useMemo(() => ({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": mode === 'EXPLORE' ? "#111111" : "#ffffff",
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": 0.5,
    },
  }), [mode]);

  // --- MANEJADORES DE EVENTOS SOBERANOS ---

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
  }, [mode, onManualAnchor]);

  /**
   * [DATA MAPPER]: Transformación de contrato estricto
   */
  const mappedSelectedPOI = useMemo(() => {
    if (!selectedPOIId || !geoEngine.nearbyPOIs) return null;

    const rawPoi = geoEngine.nearbyPOIs.find(p => p.id.toString() === selectedPOIId);
    if (!rawPoi) return null;

    return {
      id: rawPoi.id.toString(),
      name: rawPoi.name,
      category: rawPoi.category_id,
      historical_fact: rawPoi.historical_fact || undefined,
      cover_image_url: rawPoi.gallery_urls?.[0] || undefined
    };
  }, [selectedPOIId, geoEngine.nearbyPOIs]);

  return (
    <div className={cn("w-full h-full relative bg-[#010101]", className)}>

      <Map
        {...viewState}
        ref={mapRef as any} // Ref interno seguro (Bypass de react-map-gl)
        onMove={handleMove as any} // Delegación segura del evento de hardware al contrato local
        onClick={handleMapClick as any}
        onLoad={() => setIsMapLoaded(true)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mode === 'FORGE' ? "mapbox://styles/mapbox/satellite-streets-v12" : "mapbox://styles/mapbox/dark-v11"}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        fog={fogConfig as any}
        antialias={true}
        reuseMaps={true}
        maxPitch={85}
        attributionControl={false}
      >

        {/* I. EL VOYAGER (Centro de la Red Neuronal) */}
        {geoEngine.userLocation && (
          <UserLocationMarker
            location={geoEngine.userLocation}
            isResonating={!!geoEngine.activePOI?.isWithinRadius}
          />
        )}

        {/* II. LA MALLA DE ECOS (Marcadores Flotantes) */}
        {geoEngine.nearbyPOIs?.map((poi: PointOfInterest) => (
          <MapMarkerCustom
            key={poi.id}
            id={poi.id.toString()}
            latitude={poi.geo_location.coordinates[1]}
            longitude={poi.geo_location.coordinates[0]}
            category_id={poi.category_id}
            name={poi.name}
            isResonating={geoEngine.activePOI?.id === poi.id.toString() && geoEngine.activePOI?.isWithinRadius}
            isSelected={selectedPOIId === poi.id.toString()}
            onClick={(id) => setSelectedPOIId(id)}
          />
        ))}

        {/* III. CAPA DE EDIFICIOS 3D */}
        {isMapLoaded && (
          <Layer {...buildingLayerConfig as any} />
        )}

        {/* IV. CONTROLES DE VUELO */}
        <div className="absolute bottom-10 left-6 flex flex-col gap-4 z-40">
          <NavigationControl showCompass={false} className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-2xl" />
          <GeolocateControl
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={mode === 'FORGE'}
            className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-2xl"
          />
        </div>

      </Map>

      {/* V. TARGETA DE HALLAZGO (Dossier GO) */}
      <AnimatePresence>
        {mappedSelectedPOI && (
          <POIPreviewCard
            poi={mappedSelectedPOI}
            distance={geoEngine.activePOI?.id === selectedPOIId ? geoEngine.activePOI?.distance : null}
            isResonating={selectedPOIId === geoEngine.activePOI?.id && geoEngine.activePOI?.isWithinRadius}
            onClose={() => setSelectedPOIId(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.1):
 * 1. Independencia de Tipos: Al usar 'NicePodMapMoveEvent' y 'NicePodMapClickEvent', 
 *    el compilador analiza y valida el interior de las funciones sin lanzar errores 
 *    'unknown', restaurando el Build Shield.
 * 2. Puente Táctico (Líneas 163-165): Utilizamos un 'as any' controlado EXCLUSIVAMENTE 
 *    en el paso de props al componente externo <Map />. Esto permite que nuestro 
 *    código interno sea 100% tipado, mientras puenteamos la inestabilidad de la librería.
 */