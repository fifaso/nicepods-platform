/**
 * ARCHIVO: components/geo/geo-creator-overlay.tsx
 * VERSIÓN: 16.0 (NicePod Sovereign Orchestrator - Atomic Actuator Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la interfaz táctica y el mando de control visual mediante 
 * un actuador contextual unificado.
 * [REFORMA V16.0]: Sincronización nominal estricta con GeoEngineReturn V9.0. 
 * Resolución definitiva de errores de tipado en la desestructuración del motor. 
 * Purificación absoluta bajo la Zero Abbreviations Policy (ZAP).
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

// --- PROVEEDORES DE ESTADO ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { ForgeProvider, useForge } from "./forge-context";

// --- MOTORES DE VISUALIZACIÓN ---
import { MapInstanceIdentification } from "@/types/geo-sovereignty";
import { MAP_STYLES } from "./map-constants";
import { RadarHUD as RadarHeadsUpDisplay } from "./radar-hud";
import { GeographicScannerUserInterface } from "./scanner-ui";
import { SpatialEngine } from "./SpatialEngine";

interface GeoCreatorOverlayProperties {
  isForgeAuthorityGranted: boolean;
  userIdentification: string;
}

function CreatorOverlayContent({ isForgeAuthorityGranted }: { isForgeAuthorityGranted: boolean }) {

  // 1. CONSUMO DE LA FACHADA SOBERANA (Sincronizada con Constitución V9.0)
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
    executeUnifiedCommandAction
  } = useGeoEngine();

  const { dispatch: forgeStateDispatcher } = useForge();
  const [isForgeTerminalInterfaceOpen, setIsForgeTerminalInterfaceOpen] = useState<boolean>(false);

  const handleManualSyncAction = useCallback(() => {
    nicepodLog("⚡ [Orchestrator] Solicitando refresco de enlace sensorial.");
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
    }
    initializeHardwareSensorsAction();
  }, [initializeHardwareSensorsAction]);

  const handleUnifiedTacticalAction = useCallback(() => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(isManualModeActive ? [15, 35] : 25);
    }
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
      default:
        return {
          iconComponent: <Navigation2 size={22} />,
          visualVariant: "glass" as const,
          accessibilityLabel: "Iniciar Inmersión de Campo"
        };
    }
  }, [isManualModeActive, cameraPerspective]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex flex-col z-[100] isolate">

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

      {engineOperationalStatus === 'PERMISSION_DENIED' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-2xl flex flex-col items-center justify-center p-8 pointer-events-auto"
          >
            <div className="max-w-xs w-full bg-[#080808]/90 border border-red-500/20 rounded-[3.5rem] p-12 flex flex-col items-center text-center shadow-2xl">
              <Lock className="h-16 w-16 text-red-500 mb-10" />
              <h2 className="text-white font-black uppercase tracking-[0.5em] text-[10px] mb-4">Autoridad Denegada</h2>
              <Button onClick={handleManualSyncAction} className="w-full rounded-2xl bg-red-600 text-white hover:bg-red-500">REINTENTAR</Button>
            </div>
          </motion.div>
      )}

      <div className="absolute top-8 right-6 md:right-8 flex flex-col gap-6 z-[200] pointer-events-none">
        {isForgeAuthorityGranted && (
          <Button
            onClick={toggleForgeTerminalInterfaceAction}
            variant={isForgeTerminalInterfaceOpen ? "destructive" : "glass"}
            size="tactical"
            className="shadow-2xl pointer-events-auto rounded-2xl h-14 w-14"
          >
            {isForgeTerminalInterfaceOpen ? <X size={26} /> : <Plus size={26} />}
          </Button>
        )}

        {!isForgeTerminalInterfaceOpen && (
          <Button
            onClick={handleUnifiedTacticalAction}
            variant={smartButtonConfiguration.visualVariant}
            size="icon"
            className="rounded-full shadow-2xl pointer-events-auto h-14 w-14"
            title={smartButtonConfiguration.accessibilityLabel}
          >
            {smartButtonConfiguration.iconComponent}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isForgeTerminalInterfaceOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
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

      <AnimatePresence>
        {isForgeTerminalInterfaceOpen && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="absolute inset-x-0 bottom-0 z-[240] flex flex-col justify-end pointer-events-auto h-[82vh]"
          >
            <div className="w-full h-full bg-[#020202]/98 backdrop-blur-3xl rounded-t-[3.5rem] border-t border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
                <GeographicScannerUserInterface />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GeoCreatorOverlay(properties: GeoCreatorOverlayProperties) {
  return (
    <ForgeProvider>
      <CreatorOverlayContent {...properties} />
    </ForgeProvider>
  );
}