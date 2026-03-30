/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 8.6 (NicePod MapCore - Dynamic Identity & Instance Isolation Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Renderizado WebGL de alta fidelidad con identidad de instancia única.
 * [REFORMA V8.6]: Implementación de mapId dinámico para erradicar el Ghosting visual.
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
 * ---------------------------------------------------------------------------
 * I. [BUILD SHIELD]: TYPE EXTRACTION STRATEGY
 * ---------------------------------------------------------------------------
 */
type MapNativeProps = ComponentProps<typeof Map>;
type SafeMapEvent = Parameters<NonNullable<MapNativeProps['onLoad']>>[0];
type SafeMapMoveEvent = Parameters<NonNullable<MapNativeProps['onMove']>>[0];
type SafeMapClickEvent = Parameters<NonNullable<MapNativeProps['onClick']>>[0];
type SafeMapStyleDataEvent = Parameters<NonNullable<MapNativeProps['onStyleData']>>[0];

/**
 * MapCoreProps: Contrato de renderizado soberano.
 * [REFORMA V8.6]: Se añade mapId para aislamiento físico de la instancia.
 */
interface MapCoreProps {
  mapId: MapInstanceId; // <--- Identidad Soberana Obligatoria
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
   */
  const initialMapState = useMemo(() => {
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
  }, [startCoords]);

  /**
   * 3. GOBERNANZA DE CONFIGURACIÓN DINÁMICA (PBR & LABELS)
   * [GUARDIA V8.5]: Blindaje contra el error 'Style not loaded'.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();

    if (map && map.isStyleLoaded() && (map as any).setConfigProperty) {
      const isOverview = cameraPerspective === 'OVERVIEW';
      
      // Preset Lumínico (Día/Noche)
      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      
      // Escudo de Oclusión (Rayos X para el Voyager)
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

      // Gestión Contextual de Etiquetas
      (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
      (map as any).setConfigProperty('basemap', 'showTransitLabels', false);

      nicepodLog(`🕯️ [MapCore:${mapId}] PBR Sync: ${theme} | Perspectiva: ${cameraPerspective}`);
    }
  }, [theme, cameraPerspective, mapId]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial Segura
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    if ((map as any).setConfigProperty) {
      const isOverview = cameraPerspective === 'OVERVIEW';

      (map as any).setConfigProperty('basemap', 'lightPreset', theme);
      (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
      (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showRoadLabels', isOverview);
      (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
      (map as any).setConfigProperty('basemap', 'showTransitLabels', false);

      nicepodLog(`🏙️ [MapCore:${mapId}] WebGL Pintor iniciado.`);
    }

    onLoad(e);
  }, [onLoad, theme, cameraPerspective, mapId]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO]
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    if (!map || !map.isStyleLoaded()) return;

    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      map.addSource(DEM_SOURCE_CONFIG.id, {
        type: DEM_SOURCE_CONFIG.type,
        url: DEM_SOURCE_CONFIG.url,
        tileSize: DEM_SOURCE_CONFIG.tileSize
      });
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
      nicepodLog(`⚠️ [MapCore:${mapId}] Suspensión asíncrona de terreno.`, null, 'warn');
    }
  }, [mode, mapId]);

  return (
    <Map
      id={mapId} // [REFORMA V8.6]: Identidad única inyectada
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
      {/* CAPA: VOYAGER (Soberanía Visual z-9999) */}
      {userLocation && (
        <UserLocationMarker
          location={userLocation}
          isResonating={!!activePOI?.isWithinRadius}
        />
      )}

      {/* CAPA: ECOS (Bóveda NKV) */}
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
 * [BUILD SHIELD]: Exportación con comparador de integridad.
 */
export default memo(MapCore, (prev, next) => {
  return (
    prev.mapId === next.mapId && // Se añade mapId a la comparación de integridad
    prev.mode === next.mode &&
    prev.theme === next.theme &&
    prev.selectedPOIId === next.selectedPOIId &&
    prev.startCoords.latitude === next.startCoords.latitude &&
    prev.startCoords.longitude === next.startCoords.longitude
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.6):
 * 1. Instance Sovereignty: La eliminación del ID estático 'main-mesh-painter' por un
 *    prop 'mapId' dinámico resuelve físicamente la colisión de contextos WebGL.
 * 2. Visual Persistence Fix: Erradica el pestañeo al navegar entre rutas al 
 *    desligar los buffers de renderizado de cada página.
 * 3. Atomic Reliability: Mantiene las guardas isStyleLoaded() para asegurar que 
 *    la inyección de PBR y terreno ocurra solo bajo condiciones nominales.
 * 4. Build Shield Total: Alineación con MapInstanceId V6.2.
 */