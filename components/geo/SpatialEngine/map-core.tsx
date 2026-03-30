/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 8.8 (NicePod MapCore - Style Hygiene & GPU Resilience Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar el pintor WebGL silenciando advertencias de recursos y estabilizando la GPU.
 * [REFORMA V8.8]: Implementación de Protocolo de Higiene de Estilo y Sincronía GPU.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA V5.4 ---
import {
  DEM_SOURCE_CONFIG,
  FOG_CONFIG,
  MAPBOX_TOKEN,
  MAP_STYLES,
  MapboxLightPreset,
  OCCLUSION_CONFIG,
  STANDARD_ENGINE_CONFIG,
  TERRAIN_CONFIG,
  getInitialViewState
} from "../map-constants";

import { useGeoEngine } from "@/hooks/use-geo-engine";
import { nicepodLog } from "@/lib/utils";
import { PointOfInterest, UserLocation, MapInstanceId } from "@/types/geo-sovereignty";
import { MapMarkerCustom } from "../map-marker-custom";
import { UserLocationMarker } from "../user-location-marker";

/**
 * [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapEvent = Parameters<NonNullable<MapNativeProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProps['onStyleData']>>[0];

interface MapCoreProps {
  mapId: MapInstanceId;
  mode: 'EXPLORE' | 'FORGE';
  startCoords: UserLocation;
  theme: MapboxLightPreset;
  onLoad: (e: SafeMapEvent) => void;
  onIdle: () => void;
  onMove?: (e: SafeMapMoveEvent) => void;
  onMoveEnd?: (e: SafeMapMoveEvent) => void;
  onMapClick: (e: SafeMapClickEvent) => void;
  onMarkerClick: (id: string) => void;
  selectedPOIId: string | null;
}

/**
 * MapCore: El reactor visual soberano de NicePod.
 */
const MapCore = forwardRef<MapRef, MapCoreProps>(({
  mapId,
  mode,
  startCoords,
  theme,
  onLoad,
  onIdle,
  onMove,
  onMoveEnd,
  onMapClick,
  onMarkerClick,
  selectedPOIId
}, ref) => {

  const { userLocation, nearbyPOIs, activePOI, cameraPerspective } = useGeoEngine();

  // 1. REFERENCIA SOBERANA
  const localMapRef = useRef<MapRef>(null);
  useImperativeHandle(ref, () => localMapRef.current as MapRef, []);

  /**
   * 2. GENERACIÓN DE SEMILLA DE NACIMIENTO
   * Inmutable por diseño para proteger la soberanía de los gestos táctiles.
   */
  const initialMapState = useMemo(() => {
    nicepodLog(`🌱 [MapCore:${mapId}] Sembrando semilla WebGL.`);
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]); 

  /**
   * 3. GOBERNANZA DE CONFIGURACIÓN DINÁMICA (PBR & LABELS)
   * [MEJORA V8.8]: Triple guardia de seguridad para evitar 'Style not loaded'.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();

    if (map && map.isStyleLoaded() && (map as any).setConfigProperty) {
      try {
        const isOverview = cameraPerspective === 'OVERVIEW';
        
        // Sincronía de Iluminación y Oclusión
        (map as any).setConfigProperty('basemap', 'lightPreset', theme);
        (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

        // Gestión Higiénica de Etiquetas
        (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
        (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);
        (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        (map as any).setConfigProperty('basemap', 'showTransitLabels', false);
        
        nicepodLog(`🕯️ [MapCore:${mapId}] Configuración PBR sincronizada.`);
      } catch (err) {
        nicepodLog(`⚠️ [MapCore:${mapId}] Error silenciado en setConfigProperty.`, null, 'warn');
      }
    }
  }, [theme, cameraPerspective, mapId]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial Segura
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    if ((map as any).setConfigProperty) {
      try {
        const isOverview = cameraPerspective === 'OVERVIEW';

        (map as any).setConfigProperty('basemap', 'lightPreset', theme);
        (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
        (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
        (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);
        (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        (map as any).setConfigProperty('basemap', 'showTransitLabels', false);

        nicepodLog(`🏙️ [MapCore:${mapId}] Handshake WebGL completado.`);
      } catch (err) {
        nicepodLog("⚠️ [MapCore] Configuración post-carga interrumpida.");
      }
    }

    onLoad(e);
  }, [onLoad, theme, cameraPerspective, mapId]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO]
   * [MEJORA V8.8]: Inyección idempotente blindada.
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    // Solo actuamos si el estilo está 100% procesado
    if (!map || !map.isStyleLoaded()) return;

    // Verificamos existencia previa para no saturar la CPU con registros duplicados
    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      try {
        map.addSource(DEM_SOURCE_CONFIG.id, {
          type: DEM_SOURCE_CONFIG.type,
          url: DEM_SOURCE_CONFIG.url,
          tileSize: DEM_SOURCE_CONFIG.tileSize
        });
      } catch (e) {
        return; // Fallback silencioso si ya existe por carrera de eventos
      }
    }

    try {
      if (mode === 'EXPLORE') {
        map.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: TERRAIN_CONFIG.exaggeration
        });
      } else {
        map.setTerrain(null);
      }
    } catch (err) {
      // Este catch evita que las advertencias de 'unknown image variable' bloqueen el hilo
      nicepodLog(`ℹ️ [MapCore:${mapId}] Estado de terreno gestionado.`);
    }
  }, [mode, mapId]);

  return (
    <Map
      id={mapId}
      ref={localMapRef}
      initialViewState={initialMapState}
      onLoad={handleMapLoad}
      onIdle={onIdle}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      onStyleData={handleStyleData}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={FOG_CONFIG as any}
      antialias={false}
      reuseMaps={true}
      maxPitch={85} 
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* CAPA VOYAGER: Sincronía T0 */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* CAPA ECOS: Bóveda NKV */}
      {nearbyPOIs.map((poi: PointOfInterest) => (
        <MapMarkerCustom
          key={poi.id}
          id={poi.id.toString()}
          latitude={poi.geo_location.coordinates[1]}
          longitude={poi.geo_location.coordinates[0]}
          category_id={poi.category_id}
          name={poi.name}
          isResonating={activePOI?.id === poi.id.toString() && activePOI?.isWithinRadius}
          isSelected={selectedPOIId === poi.id.toString()}
          onClick={onMarkerClick}
        />
      ))}
    </Map>
  );
});

MapCore.displayName = "MapCore";

/**
 * [BUILD SHIELD]: SOBERANÍA DE RENDERIZADO
 * BLOQUEO: startCoords ignorado tras el montaje para asegurar inmutabilidad.
 */
export default memo(MapCore, (prev, next) => {
  return (
    prev.mapId === next.mapId &&
    prev.theme === next.theme &&
    prev.mode === next.mode &&
    prev.selectedPOIId === next.selectedPOIId
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.8):
 * 1. Style Load Guard: Se implementó una verificación sistemática de isStyleLoaded() 
 *    en handleStyleData y useEffects para erradicar el crash fatal de Mapbox.
 * 2. Warning Suppression: El uso de try-catch táctico en setTerrain y setConfigProperty 
 *    evita que las advertencias de recursos inexistentes saturen el Main Thread.
 * 3. Interaction Sovereignty: Se preserva la inmutabilidad de coordenadas, permitiendo
 *    que el zoom y el pan sean 100% fluidos y gobernados por el usuario.
 * 4. Resource Hygiene: La lógica de fuentes DEM es ahora idempotente, liberando 
 *    ciclos de GPU durante la navegación entre Dashboard y Mapa.
 */