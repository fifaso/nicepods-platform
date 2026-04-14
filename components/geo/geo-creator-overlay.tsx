/**
 * ARCHIVO: components/geo/geo-creator-overlay.tsx
 * VERSIÓN: 15.0 (NicePod Sovereign Orchestrator - Final Contract Alignment Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la interfaz táctica y el mando de control visual, permitiendo 
 * una interacción fluida con el reactor WebGL mediante un actuador contextual 
 * que unifica el recentrado y el ciclo de perspectivas inmersivas.
 * [REFORMA V15.0]: Resolución definitiva de errores TS2339. Sincronización nominal 
 * absoluta con la Constitución V9.0 y la Fachada V55.0. Consolidación del 
 * 'Tactical Actuator Protocol' y purificación total bajo la Zero Abbreviations 
 * Policy (ZAP). Sellado del Build Shield Sovereignty (BSS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Layers,
  Lock,
  Navigation2,
  Plus,
  Satellite,
  ShieldCheck,
  Target,
  X
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES DE INTERFAZ ---
import { Button } from "@/components/ui/button";
import { cn, nicepodLog } from "@/lib/utils";

// --- PROVEEDORES DE ESTADO (CEREBROS NEURONALES V4.9) ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { ForgeProvider, useForge } from "./forge-context";

// --- MOTORES DE VISUALIZACIÓN Y ALIASING NOMINAL ---
import { MapInstanceIdentification } from "@/types/geo-sovereignty";
import { MAP_STYLES } from "./map-constants";
import { RadarHUD as RadarHeadsUpDisplay } from "./radar-hud";
import { GeographicScannerUserInterface } from "./scanner-ui";
import { SpatialEngine } from "./SpatialEngine";

/**
 * INTERFAZ: GeoCreatorOverlayProperties
 * Misión: Definir el contrato de acceso para la terminal de mando visual.
 */
interface GeoCreatorOverlayProperties {
  /** isForgeAuthorityGranted: Nivel de acceso para alterar la Bóveda de Sabiduría. */
  isForgeAuthorityGranted: boolean;
  /** userIdentification: Firma única del Voyager en sesión activa. */
  userIdentification: string;
}

/**
 * CreatorOverlayContent: El puente de mando táctico con actuador unificado.
 */
function CreatorOverlayContent({ isForgeAuthorityGranted }: { isForgeAuthorityGranted: boolean }) {

  /**
   * 1. CONSUMO DE LA FACHADA SOBERANA (Protocolo V55.0)
   * [SINCRO V15.0]: Alineación nominal absoluta con GeoEngineReturn V9.0.
   * Se resuelven los errores TS2339 de desestructuración.
   */
  const {
    status: engineOperationalStatus,
    data: engineOperationalData,
    userLocation,
    initSensors: initializeHardwareSensorsAction,
    isTriangulated: isGeographicallyTriangulated,
    isGPSLock: isGlobalPositioningSystemLocked,
    cameraPerspective,
    activeMapStyle, 
    isManualModeActive, 
    executeUnifiedCommandAction, 
    recenterCamera: recenterVisualCameraAction
  } = useGeoEngine();

  // 2. CONSUMO DEL CONTEXTO DE FORJA
  const { dispatch: forgeStateDispatcher } = useForge();

  // 3. ESTADOS LOCALES DE INTERFAZ DESCRIPTIVOS
  const [isForgeTerminalInterfaceOpen, setIsForgeTerminalInterfaceOpen] = useState<boolean>(false);

  /**
   * handleManualSyncAction:
   * Misión: Forzar un refresco de sintonía satelital mediante hardware.
   */
  const handleManualSyncAction = useCallback(() => {
    nicepodLog("⚡ [Orchestrator] Solicitando refresco de enlace sensorial.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
    }
    initializeHardwareSensorsAction();
  }, [initializeHardwareSensorsAction]);

  /**
   * handleUnifiedTacticalAction:
   * Misión: Ejecutar la respuesta cinemática adecuada delegando al Córtex.
   */
  const handleUnifiedTacticalAction = useCallback(() => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(isManualModeActive ? [15, 35] : 25);
    }
    
    // Delegación soberana de la decisión táctica.
    executeUnifiedCommandAction();
  }, [isManualModeActive, executeUnifiedCommandAction]);

  const toggleForgeTerminalInterfaceAction = useCallback(() => {
    if (isForgeTerminalInterfaceOpen) {
      nicepodLog("🛡️ [Orchestrator] Restaurando malla de exploración activa.");
      forgeStateDispatcher({ type: 'RESET_FORGE' });
      setIsForgeTerminalInterfaceOpen(false);
    } else {
      nicepodLog("⚒️ [Orchestrator] Iniciando terminal de Forja de Sabiduría.");
      setIsForgeTerminalInterfaceOpen(true);
    }
  }, [isForgeTerminalInterfaceOpen, forgeStateDispatcher]);

  const displayCurrentPlaceName =
    engineOperationalData?.manualPlaceName ||
    engineOperationalData?.dossier?.visual_analysis_dossier?.detectedOfficialName ||
    "Sintonía de Malla Activa";

  /**
   * smartButtonConfiguration:
   * Misión: Adaptar la iconografía y el estilo según la fase cinemática actual.
   */
  const smartButtonConfiguration = useMemo(() => {
    if (isManualModeActive) {
      return {
        iconComponent: <Target size={22} className="animate-pulse text-primary" />,
        visualVariant: "default" as const,
        accessibilityLabel: "Recuperar Foco Geodésico"
      };
    }

    switch (cameraPerspective) {
      case 'STREET':
        return {
          iconComponent: <Satellite size={22} />,
          visualVariant: "resonance" as const,
          accessibilityLabel: "Activar Capa Satelital"
        };
      case 'SATELLITE':
        return {
          iconComponent: <Layers size={22} />,
          visualVariant: "glass" as const,
          accessibilityLabel: "Retornar a Vista Estratégica"
        };
      default: // OVERVIEW
        return {
          iconComponent: <Navigation2 size={22} />,
          visualVariant: "glass" as const,
          accessibilityLabel: "Iniciar Inmersión de Campo"
        };
    }
  }, [isManualModeActive, cameraPerspective]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col z-[100] isolate">

      {/* I. REACTOR VISUAL (ACTIVO DESDE T0) */}
      <AnimatePresence mode="popLayout">
        {!isForgeTerminalInterfaceOpen && (
          <motion.div
            key="background-spatial-instance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0 pointer-events-auto"
          >
            <SpatialEngine
              mapInstanceIdentification={"map-full" as MapInstanceIdentification}
              mode="EXPLORE"
              visualTheme={activeMapStyle === MAP_STYLES.PHOTOREALISTIC ? 'day' : 'night'}
              className="w-full h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* II. VELO DE RESTRICCIÓN FÍSICA (PERMISOS DENEGADOS) */}
      <AnimatePresence>
        {engineOperationalStatus === 'PERMISSION_DENIED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-2xl flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="max-w-xs w-full bg-[#080808]/90 border border-red-500/20 rounded-[3.5rem] p-12 flex flex-col items-center text-center shadow-2xl">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl" />
                <Lock className="h-16 w-16 text-red-500 relative z-10" />
              </div>
              <h2 className="text-white font-black uppercase tracking-[0.5em] text-[10px] mb-4">Autoridad Denegada</h2>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.3em] leading-relaxed mb-12">
                Habilite el acceso a los sensores para proyectar la malla geodésica industrial.
              </p>
              <Button
                onClick={handleManualSyncAction}
                size="lg"
                className="w-full rounded-2xl font-black tracking-widest bg-red-600 text-white hover:bg-red-500"
              >
                REINTENTAR ENLACE
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* III. DOCK DE COMANDO TÁCTICO (ACTUADOR CONTEXTUAL) */}
      <div className="absolute top-8 right-6 md:right-8 flex flex-col gap-6 z-[200] pointer-events-none">
        
        {isForgeAuthorityGranted && (
          <Button
            onClick={toggleForgeTerminalInterfaceAction}
            variant={isForgeTerminalInterfaceOpen ? "destructive" : "glass"}
            size="tactical"
            className="shadow-2xl transition-all duration-500 pointer-events-auto rounded-2xl h-14 w-14"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isForgeTerminalInterfaceOpen ? 'close_action' : 'open_action'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                {isForgeTerminalInterfaceOpen ? <X size={26} /> : <Plus size={26} />}
              </motion.div>
            </AnimatePresence>
          </Button>
        )}

        {!isForgeTerminalInterfaceOpen && (
          <Button
            onClick={handleUnifiedTacticalAction}
            variant={smartButtonConfiguration.visualVariant}
            size="icon"
            className="rounded-full shadow-2xl transition-all duration-500 pointer-events-auto h-14 w-14"
            title={smartButtonConfiguration.accessibilityLabel}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isManualModeActive ? 'recenter_indicator' : cameraPerspective}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {smartButtonConfiguration.iconComponent}
              </motion.div>
            </AnimatePresence>
          </Button>
        )}
      </div>

      {/* IV. HEADS-UP DISPLAY (HUD SOBERANO) */}
      <AnimatePresence>
        {isForgeTerminalInterfaceOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-4 right-24 md:left-8 md:right-32 z-[250] pointer-events-auto"
          >
            <RadarHeadsUpDisplay
              status={engineOperationalStatus}
              isTriangulated={isGeographicallyTriangulated}
              isGlobalPositioningSystemLocked={isGlobalPositioningSystemLocked}
              weather={engineOperationalData?.dossier?.weather_snapshot}
              placeName={displayCurrentPlaceName}
              accuracyMeters={userLocation?.accuracyMeters || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* V. TERMINAL DEL ESCÁNER GEOGRÁFICO */}
      <AnimatePresence>
        {isForgeTerminalInterfaceOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 z-[240] flex flex-col justify-end pointer-events-auto h-[82vh]"
          >
            <div className="w-full h-full bg-[#020202]/98 backdrop-blur-3xl rounded-t-[3.5rem] border-t border-white/5 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
              <div className="w-full flex justify-center py-6 shrink-0 z-20">
                <div className="w-16 h-1.5 bg-white/10 rounded-full" />
              </div>
              <div className="w-full flex-1 relative flex flex-col min-h-0">
                <GeographicScannerUserInterface />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VI. BARRA DE ESTADO: SINTONÍA SOBERANA */}
      {!isForgeTerminalInterfaceOpen && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[150] pointer-events-auto">
          <button
            onClick={handleManualSyncAction}
            className={cn(
              "backdrop-blur-3xl px-8 py-4 rounded-full border flex items-center gap-5 shadow-2xl transition-all duration-700 active:scale-95 group",
              isGlobalPositioningSystemLocked ? "bg-emerald-500/10 border-emerald-500/30" : "bg-black/80 border-white/10"
            )}
          >
            <div className="relative">
              <div className={cn("h-3 w-3 rounded-full animate-ping absolute inset-0", isGlobalPositioningSystemLocked ? "bg-emerald-500" : "bg-primary")} />
              <div className={cn("h-3 w-3 rounded-full relative z-10", isGlobalPositioningSystemLocked ? "bg-emerald-400" : "bg-primary")} />
            </div>
            <div className="flex flex-col items-start leading-none gap-1.5 text-left">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.5em]">
                {isGlobalPositioningSystemLocked ? "Malla Sintonizada" : "Sincronizando..."}
              </span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                {isGlobalPositioningSystemLocked ? "Soberanía Geodésica Activa (GPS HD)" : (isGeographicallyTriangulated ? "Estimando Malla (Red/WiFi)" : "Buscando Voyager...")}
              </span>
            </div>
            {isGlobalPositioningSystemLocked && <ShieldCheck size={16} className="text-emerald-500 ml-2 group-hover:scale-110 transition-transform" />}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * GeoCreatorOverlay: El contenedor soberano con contexto de forja.
 */
export function GeoCreatorOverlay(componentProperties: GeoCreatorOverlayProperties) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...componentProperties} />
    </ForgeProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V15.0):
 * 1. Contract Sovereignty: Se resolvieron los errores TS2339 al alinear la 
 *    desestructuración con la Constitución V9.0.
 * 2. Actuator Precision: El botón único ahora delega la inteligencia contextual 
 *    al motor soberano, eliminando movimientos erráticos.
 * 3. ZAP Enforcement: Purificación nominal completa en el 100% del archivo. 
 *    Nombres como 'activeEngineVisualStyle' han sido transmutados a 'activeMapStyle'.
 */