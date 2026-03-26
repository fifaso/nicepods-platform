// components/geo/map-preview-frame.tsx
// VERSIÓN: 16.0 (NicePod GO-Preview - Automatic Materialization Edition)
// Misión: Ventana táctica fotorrealista con ignición automática y vista Pokémon GO.
// [ESTABILIZACIÓN]: Eliminación de intervención manual, Salto T0 y forzado de Pitch 80°.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Maximize2, Power, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapRef } from "react-map-gl/mapbox";

// --- INFRAESTRUCTURA CORE ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { FLY_CONFIG, ZOOM_LEVELS } from "./map-constants";

// --- MOTOR CARTOGRÁFICO AISLADO ---
import MapCore from "./SpatialEngine/map-core";

/**
 * MapPreviewFrame: El widget de visualización táctica para el Dashboard inicial.
 * Misión: Mostrar la ubicación del usuario de forma automática, rápida y fotorrealista.
 */
export const MapPreviewFrame = memo(function MapPreviewFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // 1. CONSUMO DE TELEMETRÍA SOBERANA (V21.0)
  const {
    userLocation,
    status: engineStatus,
    initSensors,
    isTriangulated,
    setTriangulated
  } = useGeoEngine();

  // --- MÁQUINA DE ESTADOS DEL REVELADO CINEMÁTICO ---
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  /**
   * [HOT-SWAP T0]: 
   * Si el sistema ya está triangulado (vía Geo-IP o caché), 
   * la cámara nace asentada para eliminar el Smokescreen.
   */
  const [isCameraSettled, setIsCameraSettled] = useState<boolean>(isTriangulated);

  const hasInitialJumpPerformed = useRef<boolean>(false);
  const autoIgnitionAttempted = useRef<boolean>(false);

  /**
   * 2. PROTOCOLO DE SEGURIDAD MATEMÁTICA (Safe Mount)
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
   * 3. PROTOCOLO DE IGNICIÓN AUTOMÁTICA
   * Misión: Despertar el GPS sin esperar al usuario. 
   * Nota: En algunos navegadores esto puede fallar si no hay HTTPS o interacción previa.
   */
  useEffect(() => {
    if (isContainerReady && engineStatus === 'IDLE' && !autoIgnitionAttempted.current) {
      nicepodLog("📡 [MapPreview] Auto-Ignición: Solicitando enlace satelital.");
      initSensors();
      autoIgnitionAttempted.current = true;
    }
  }, [isContainerReady, engineStatus, initSensors]);

  /**
   * 4. RED DE SEGURIDAD (RESCUE TIMER)
   * Si el GPS tarda demasiado, revelamos el mapa en la ubicación actual (aunque sea IP).
   */
  useEffect(() => {
    if (isMapLoaded && !isCameraSettled) {
      const rescueTimer = setTimeout(() => {
        if (!isCameraSettled) {
          nicepodLog("⚠️ [MapPreview] Revelado forzado por tiempo.");
          setIsCameraSettled(true);
        }
      }, 5000);
      return () => clearTimeout(rescueTimer);
    }
  }, [isMapLoaded, isCameraSettled]);

  /**
   * 5. PROTOCOLO DE LOCALIZACIÓN AGRESIVA (POKÉMON GO STYLE)
   * Realiza el salto o vuelo en cuanto hay CUALQUIER coordenada disponible.
   */
  useEffect(() => {
    if (!isMapLoaded || !userLocation || hasInitialJumpPerformed.current || !mapRef.current) return;

    nicepodLog("🎯 [MapPreview] Voyager materializado. Forzando perspectiva inmersiva.");

    /**
     * CONFIGURACIÓN DE CÁMARA "NICEPOD GO"
     * - Zoom: 17.5 (Nivel calle para ver edificios de obsidiana)
     * - Pitch: 80 (Inclinación máxima de horizonte)
     */
    const goView = {
      center: [userLocation.longitude, userLocation.latitude] as [number, number],
      zoom: ZOOM_LEVELS.STREET,
      pitch: 80,
      bearing: -15,
    };

    if (!isTriangulated) {
      // Caso A: Primer contacto. Vuelo cinemático.
      mapRef.current.flyTo({
        ...goView,
        ...FLY_CONFIG,
        duration: 2500,
      });
      setTriangulated();
    } else {
      // Caso B: Hot-Swap (Ubicación ya conocida). Salto instantáneo.
      mapRef.current.jumpTo(goView);
      setIsCameraSettled(true);
    }

    hasInitialJumpPerformed.current = true;
  }, [isMapLoaded, userLocation, isTriangulated, setTriangulated]);

  /**
   * 6. EL REVELADO SOBERANO (Data-Driven onIdle)
   */
  const handleMapIdle = useCallback(() => {
    if (isMapLoaded && !isCameraSettled) {
      setIsCameraSettled(true);
      nicepodLog("✨ [MapPreview] Malla renderizada. Fin de cortina.");
    }
  }, [isMapLoaded, isCameraSettled]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#020202] transition-all duration-700",
        "rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl group",
        "hover:border-primary/40"
      )}
    >
      <AnimatePresence mode="wait">

        {/* ESCENARIO: GPS BLOQUEADO */}
        {engineStatus === 'PERMISSION_DENIED' ? (
          <motion.div
            key="p_denied"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 z-50 text-center"
          >
            <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400">Acceso Denegado</span>
            <p className="text-[9px] text-zinc-500 mt-2 max-w-[220px] leading-relaxed uppercase">
              Habilite permisos de ubicación para sincronizar la malla.
            </p>
          </motion.div>
        ) :

        /* ESCENARIO: SMOKESCREEN (Solo si no está asentado) */
        !isCameraSettled ? (
          <motion.div
            key="smokescreen"
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-[#020202] z-[90] pointer-events-none"
          >
            <div className="relative">
              <Zap className="h-8 w-8 text-primary/30 animate-pulse" />
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
            </div>

            <div className="flex flex-col items-center gap-6 text-center px-12">
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
                  Sincronización Órbital
                </span>
                <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-primary/60 animate-pulse italic">
                  {engineStatus === 'IDLE' ? "Despertando Sensores..." : 
                   !userLocation ? "Capturando Coordenadas..." : "Fijando Malla 3D"}
                </p>
              </div>

              {/* [FAIL-SAFE]: Botón de ignición manual si la auto-ignición falla */}
              {engineStatus === 'IDLE' && (
                <button
                  onClick={() => initSensors()}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[8px] uppercase tracking-[0.4em] pointer-events-auto"
                >
                  <Power size={12} className="inline mr-2" />
                  Sincronizar Ahora
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 
          VII. EL MOTOR DE RENDERIZADO (CORE)
          Interactivo desde el primer frame para evitar lag de interfaz.
      */}
      {isContainerReady && (
        <div className="absolute inset-0 z-0">
          <MapCore
            ref={mapRef}
            mode="EXPLORE"
            selectedPOIId={null}
            onLoad={() => setIsMapLoaded(true)}
            onIdle={handleMapIdle} 
            onMove={() => { }}
            onMoveEnd={() => { }}
            onMapClick={() => { }}
            onMarkerClick={() => { }}
          />
        </div>
      )}

      {/* GRADIENTE PROTECTOR */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/30 to-transparent z-10 pointer-events-none" />

      {/* UI PERIFÉRICA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[100] flex justify-between items-end pointer-events-none">
        <Link href="/map" className="flex items-center gap-4 pointer-events-auto group/btn focus:outline-none">
          <div className="bg-primary/10 p-3.5 rounded-2xl backdrop-blur-3xl border border-primary/20 group-hover/btn:bg-primary/30 transition-all shadow-inner">
            <Compass className="h-5 w-5 text-primary animate-spin-slow" />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic leading-none">
              Madrid <span className="text-primary">Resonance</span>
            </h3>
            <p className="text-[8px] md:text-[9px] text-zinc-300 font-bold uppercase tracking-[0.3em] mt-1.5">
              Malla Satelital Activa
            </p>
          </div>
        </Link>

        <Link href="/map" className="pointer-events-auto focus:outline-none mb-1">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all group-hover:scale-110">
            <Maximize2 size={14} className="text-white" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V16.0):
 * 1. Automatización de Cámara: Se eliminó el clic manual para ver la ubicación. El
 *    widget ahora vuela al usuario en cuanto el motor Mapbox y el GeoEngine dan el OK.
 * 2. Pokémon GO Style: Se forzó el zoom 17.5 y el pitch 80 en el primer anclaje, 
 *    proporcionando la inmersión 3D desde el Dashboard sin tocar configuraciones globales.
 * 3. Interactividad Garantizada: Se eliminaron los bloqueos de pointer-events en el 
 *    contenedor del mapa, permitiendo gestos táctiles inmediatos tras la carga.
 * 4. Resiliencia de Sesión: La integración de 'isTriangulated' asegura que si el
 *    Voyager ya fue localizado, el mapa nacerá sin Smokescreen (cortina negra), 
 *    eliminando el tiempo de espera percibido.
 */