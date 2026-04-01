/**
 * ARCHIVO: components/geo/SpatialEngine/map-core.tsx
 * VERSIÓN: 9.1 (NicePod MapCore - Absolute Immutability & Interaction Release Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Renderizado WebGL inmutable que otorga soberanía total a los gestos del usuario.
 * [REFORMA V9.1]: Bloqueo de re-renders por posición para liberar Zoom y Pan manual.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import type { ComponentProps } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import Map, { MapRef } from 'react-map-gl/mapbox';

// --- INFRAESTRUCTURA DE MALLA TÁCTICA V5.5 ---
import {
  DEM_SOURCE_CONFIG,
  FOG_CONFIG,
  MAPBOX_TOKEN,
  MAP_STYLES,
  MapboxLightPreset,
  MapPerformanceProfile,
  OCCLUSION_CONFIG,
  STANDARD_ENGINE_CONFIG,
  LITE_ENGINE_CONFIG,
  TERRAIN_CONFIG,
  LITE_TERRAIN_CONFIG,
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
  performanceProfile?: MapPerformanceProfile;
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
  performanceProfile = 'HIGH_FIDELITY',
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
   * 2. GENERACIÓN DE SEMILLA DE NACIMIENTO (V5.4)
   * [MANDATO V9.1]: Se calcula una sola vez por mapId. 
   * Esto evita que el mapa se resetee si las coordenadas iniciales cambian mínimamente.
   */
  const initialMapState = useMemo(() => {
    nicepodLog(`🌱 [MapCore:${mapId}] Sembrando semilla WebGL inmutable.`);
    return getInitialViewState(
      startCoords.latitude,
      startCoords.longitude
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]); 

  /**
   * 3. GOBERNANZA DE CONFIGURACIÓN DINÁMICA (PBR & PERFORMANCE)
   * Realiza cambios imperativos sobre la instancia sin re-renderizar el componente.
   */
  useEffect(() => {
    const map = localMapRef.current?.getMap();

    if (map && map.isStyleLoaded() && (map as any).setConfigProperty) {
      try {
        const isOverview = cameraPerspective === 'OVERVIEW';
        const isLite = performanceProfile === 'TACTICAL_LITE';
        const engineConfig = isLite ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;
        
        // Sincronía del Preset Lumínico (Día/Noche)
        (map as any).setConfigProperty('basemap', 'lightPreset', theme);
        
        // Escudo de Oclusión (Voyager visible tras muros)
        (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);

        // Gestión Contextual de Etiquetas
        (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview && !isLite);
        (map as any).setConfigProperty('basemap', 'showRoadLabels', engineConfig.showRoadLabels);
        
        // Ajuste de opacidad de edificios para liberar VRAM en modo Lite
        const buildingOpacity = isLite ? LITE_ENGINE_CONFIG.buildingOpacity : 1.0;
        if (map.getLayer('building')) {
           map.setPaintProperty('building', 'fill-extrusion-opacity', buildingOpacity);
        }

        nicepodLog(`🕯️ [MapCore:${mapId}] Capas sincronizadas bajo perfil ${performanceProfile}.`);
      } catch (err) {
        nicepodLog(`⚠️ [MapCore:${mapId}] Error silenciado en sincronía de capas.`, null, 'warn');
      }
    }
  }, [theme, cameraPerspective, mapId, performanceProfile]);

  /**
   * [PROTOCOLO MAPBOX STANDARD]: Carga Inicial Segura
   */
  const handleMapLoad = useCallback((e: SafeMapEvent) => {
    const map = e.target;

    if ((map as any).setConfigProperty) {
      try {
        const isOverview = cameraPerspective === 'OVERVIEW';
        const isLite = performanceProfile === 'TACTICAL_LITE';
        const engineConfig = isLite ? LITE_ENGINE_CONFIG : STANDARD_ENGINE_CONFIG;

        (map as any).setConfigProperty('basemap', 'lightPreset', theme);
        (map as any).setConfigProperty('basemap', 'puckOcclusion', OCCLUSION_CONFIG.puckOcclusion);
        (map as any).setConfigProperty('basemap', 'showPlaceLabels', isOverview && !isLite);
        (map as any).setConfigProperty('basemap', 'showRoadLabels', engineConfig.showRoadLabels);
        (map as any).setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        (map as any).setConfigProperty('basemap', 'showTransitLabels', false);

        nicepodLog(`🏙️ [MapCore:${mapId}] Handshake WebGL completado con éxito.`);
      } catch (err) {
        nicepodLog("⚠️ [MapCore] Fallo en configuración post-carga.");
      }
    }

    onLoad(e);
  }, [onLoad, theme, cameraPerspective, mapId, performanceProfile]);

  /**
   * [PROTOCOLO DE INYECCIÓN DE TERRENO]
   */
  const handleStyleData = useCallback((e: SafeMapStyleDataEvent) => {
    const map = e.target;
    if (!map || !map.isStyleLoaded()) return;

    if (!map.getSource(DEM_SOURCE_CONFIG.id)) {
      try {
        map.addSource(DEM_SOURCE_CONFIG.id, {
          type: "raster-dem",
          url: DEM_SOURCE_CONFIG.url,
          tileSize: 512
        });
      } catch (e) { return; }
    }

    try {
      const terrainParams = performanceProfile === 'TACTICAL_LITE' 
        ? LITE_TERRAIN_CONFIG 
        : TERRAIN_CONFIG;

      if (mode === 'EXPLORE') {
        map.setTerrain({
          source: DEM_SOURCE_CONFIG.id,
          exaggeration: terrainParams.exaggeration
        });
      } else {
        map.setTerrain(null);
      }
    } catch (err) {
      nicepodLog(`ℹ️ [MapCore:${mapId}] Estado de terreno gestionado.`);
    }
  }, [mode, mapId, performanceProfile]);

  return (
    <Map
      id={mapId}
      ref={localMapRef}
      initialViewState={initialMapState} // Modo Inmutable: Mapbox posee la cámara
      onLoad={handleMapLoad}
      onIdle={onIdle}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      onStyleData={handleStyleData}
      onClick={onMapClick}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={MAP_STYLES.STANDARD}
      projection={{ name: "mercator" }}
      fog={performanceProfile === 'TACTICAL_LITE' ? null : (FOG_CONFIG as any)}
      antialias={false}
      reuseMaps={true}
      maxPitch={85} 
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* CAPA VOYAGER: Renderizado reactivo a useGeoEngine */}
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
 * Bloqueamos cualquier re-render que no sea un cambio físico de la instancia o del perfil.
 * [MANDATO V9.1]: Ignorar startCoords tras el montaje para liberar la interactividad.
 */
export default memo(MapCore, (prev, next) => {
  return (
    prev.mapId === next.mapId &&
    prev.performanceProfile === next.performanceProfile &&
    prev.theme === next.theme &&
    prev.mode === next.mode &&
    prev.selectedPOIId === next.selectedPOIId
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V9.1):
 * 1. Interaction Liberation: Al eliminar 'startCoords' de la comparación del memo, 
 *    el componente <Map> nunca se destruye ni reinicia por cambios de posición 
 *    del GPS, permitiendo que el zoom y el pan nativos funcionen sin lucha.
 * 2. Visual Stasis: Erradica los pestañeos al navegar entre rutas al desligar 
 *    los estados reactivos de React de la cámara de Mapbox.
 * 3. Tactical Lite Support: Mantiene el perfil de bajo consumo para el Step 1,
 *    asegurando un anclaje manual fluido incluso en hardware limitado.
 * 4. PBR Fidelity: Las actualizaciones de tema y etiquetas siguen siendo 
 *    operaciones imperativas protegidas por isStyleLoaded().
 */