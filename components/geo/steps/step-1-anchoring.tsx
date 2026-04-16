/**
 * ARCHIVE: components/geo/steps/step-1-anchoring.tsx
 * VERSION: 13.0 (NicePod Forge Step 1 - Contract Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * MISSION: Gestionar el anclaje pericial milimétrico del hito urbano y obligar a la
 * clasificación taxonómica bidimensional del capital intelectual.
 * [REFORMA V13.0]: Resolución definitiva de errores TS2339 mediante la alineación 
 * nominal absoluta con la Fachada V55.0. Transmutación de 'isManualMode' a 
 * 'isManualModeActive'. Consolidación total de la Zero Abbreviations Policy (ZAP).
 * INTEGRITY LEVEL: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, Target, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { classNamesUtility, nicepodLog } from "@/lib/utils";

// --- MOTORES CORE Y CONTEXTO SOBERANO V4.9 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "@/components/geo/forge-context"; 
import { ForgeSpatialPrecision } from "@/components/geo/forge-spatial-precision";

// --- SOBERANÍA DE TIPOS (CONSTITUCIÓN V9.0) ---
import { 
  CategoryEntity, 
  CategoryMission, 
  MapInstanceIdentification 
} from "@/types/geo-sovereignty";

/**
 * TAXONOMÍA SOBERANA: DICCIONARIO DE ENTIDADES TÉCNICAS INDUSTRIALES
 */
const TAXONOMY_HIERARCHY: Record<CategoryMission, { entityIdentification: CategoryEntity; label: string }[]> = {
  infraestructura_vital: [
    { entityIdentification: 'aseo_premium', label: 'Aseo Premium' },
    { entityIdentification: 'nodo_hidratacion', label: 'Nodo de Hidratación' },
    { entityIdentification: 'refugio_climatico', label: 'Refugio Climático' },
    { entityIdentification: 'terminal_energia', label: 'Terminal de Energía' },
    { entityIdentification: 'zona_segura', label: 'Zona de Seguridad' }
  ],
  memoria_soberana: [
    { entityIdentification: 'monumento_nacional', label: 'Monumento' },
    { entityIdentification: 'arquitectura_epoca', label: 'Edificio Histórico' },
    { entityIdentification: 'placa_sintonia', label: 'Placa/Inscripción' },
    { entityIdentification: 'yacimiento_ruina', label: 'Yacimiento/Ruina' },
    { entityIdentification: 'leyenda_urbana', label: 'Leyenda Urbana' }
  ],
  capital_intelectual: [
    { entityIdentification: 'museo_sabiduria', label: 'Museo/Pinacoteca' },
    { entityIdentification: 'atelier_galeria', label: 'Galería/Atelier' },
    { entityIdentification: 'libreria_autor', label: 'Librería de Autor' },
    { entityIdentification: 'centro_innovacion', label: 'Centro de Innovación' },
    { entityIdentification: 'intervencion_plastica', label: 'Intervención Arte' }
  ],
  resonancia_sensorial: [
    { entityIdentification: 'mirador_estrategico', label: 'Mirador Estratégico' },
    { entityIdentification: 'paisaje_sonoro', label: 'Paisaje Sonoro' },
    { entityIdentification: 'pasaje_secreto', label: 'Pasaje/Secreto' },
    { entityIdentification: 'mercado_origen', label: 'Market de Origen' },
    { entityIdentification: 'obrador_tradicion', label: 'Obrador/Tradición' }
  ]
};

const MISSION_LABELS: Record<CategoryMission, string> = {
  infraestructura_vital: "Infraestructura Vital",
  memoria_soberana: "Memoria Soberana",
  capital_intelectual: "Capital Intelectual",
  resonancia_sensorial: "Resonancia Sensorial"
};

/**
 * Step1Anchoring: La fase inicial de peritaje y geolocalización industrial.
 */
export default function Step1Anchoring() {
  
  /**
   * 1. CONSUMO DE LA FACHADA SOBERANA (Protocolo V55.0)
   * [SINCRO V13.0]: Sincronización nominal con la propiedad 'isManualModeActive'.
   */
  const { 
    userLocation, 
    recenterCamera: recenterVisualCameraAction, 
    isManualModeActive,
    status: engineOperationalStatus 
  } = useGeoEngine();

  const { 
    state: forgeState, 
    dispatch: stateDispatcher, 
    nextStep: navigateToNextStepAction 
  } = useForge();

  // 2. ESTADOS DE CONTROL VISUAL
  const [isMapDisplayEngineForced, setIsMapDisplayEngineForced] = useState<boolean>(false);

  /**
   * executeManualGeographicAnchorSelectionWorkflow:
   * MISSION: Capturar el anclaje manual con precisión industrial.
   */
  const executeManualGeographicAnchorSelectionWorkflow = useCallback((
    longitudeCoordinate: number, 
    latitudeCoordinate: number
  ) => {
    nicepodLog(`📍 [Forge:Step1] Anclaje manual: [${longitudeCoordinate}, ${latitudeCoordinate}]`);
    
    stateDispatcher({
      type: 'SET_LOCATION',
      payload: {
        latitudeCoordinate: latitudeCoordinate,
        longitudeCoordinate: longitudeCoordinate,
        accuracyMeters: 1 
      }
    });

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [stateDispatcher]);

  /**
   * EFECTO: TelemetrySeedSynchronization
   */
  useEffect(() => {
    if (userLocation && forgeState.latitudeCoordinate === null) {
      stateDispatcher({
        type: 'SET_LOCATION',
        payload: {
          latitudeCoordinate: userLocation.latitudeCoordinate,
          longitudeCoordinate: userLocation.longitudeCoordinate,
          accuracyMeters: userLocation.accuracyMeters
        }
      });
    }
    
    const visibilityTimerReference = setTimeout(() => setIsMapDisplayEngineForced(true), 300);
    return () => clearTimeout(visibilityTimerReference);
  }, [userLocation, forgeState.latitudeCoordinate, stateDispatcher]);

  const isPayloadIntegrityValidated = useMemo(() => {
    return (
      forgeState.latitudeCoordinate !== null &&
      forgeState.longitudeCoordinate !== null &&
      forgeState.categoryMission !== undefined &&
      forgeState.categoryEntity !== undefined &&
      engineOperationalStatus !== 'IDLE'
    );
  }, [
    forgeState.latitudeCoordinate, 
    forgeState.longitudeCoordinate, 
    forgeState.categoryMission, 
    forgeState.categoryEntity, 
    engineOperationalStatus
  ]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-1 isolate">
      
      {/* I. CABECERA DE INSTRUMENTACIÓN EDITORIAL */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-primary rounded-full shadow-lg" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 1: Anclaje y Taxonomía
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
          Sintonice la ubicación exacta del hito pericial y clasifique su misión urbana.
        </p>
      </div>

      {/* II. VISOR DE PRECISIÓN GEODÉSICA */}
      <div className="shrink-0 relative h-[340px] mx-6 mb-8 rounded-[3.5rem] overflow-hidden border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.7)] bg-[#020202] self-center w-[calc(100%-3rem)] flex items-center justify-center">
        {isMapDisplayEngineForced && (
          <ForgeSpatialPrecision
            mapInstanceIdentification={"map-forge-precision" as MapInstanceIdentification} 
            initialLatitudeCoordinate={forgeState.latitudeCoordinate}
            initialLongitudeCoordinate={forgeState.longitudeCoordinate}
            onManualAnchorSelectionAction={executeManualGeographicAnchorSelectionWorkflow}
          />
        )}

        <div className="absolute bottom-6 right-6 z-30">
          <Button
            size="icon"
            variant={isManualModeActive ? "resonance" : "glass"}
            className="rounded-2xl shadow-2xl h-12 w-12 border-white/10 transition-all active:scale-90"
            onClick={recenterVisualCameraAction}
          >
            <Target size={20} className={classNamesUtility(isManualModeActive && "animate-pulse text-primary")} />
          </Button>
        </div>

        <div className="absolute top-6 left-6 right-6 pointer-events-none z-30">
          <div className="bg-black/85 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <MapPin size={14} className="text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white tabular-nums tracking-tighter">
                  {forgeState.latitudeCoordinate?.toFixed(6)}°N, {forgeState.longitudeCoordinate?.toFixed(6)}°E
                </span>
              </div>
            </div>
            {isManualModeActive && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black uppercase tracking-widest px-3 py-1 rounded-md animate-in zoom-in duration-500">
                Fijado Manual
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* III. MATRIZ DE TAXONOMÍA GRANULAR */}
      <div className="px-6 flex flex-col gap-8 mb-12 flex-1">
        
        <div>
          <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-5 block">
            Cuadrante de Misión Principal
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(TAXONOMY_HIERARCHY) as CategoryMission[]).map((categoryMissionKey) => (
              <button
                key={categoryMissionKey}
                onClick={() => {
                  stateDispatcher({ type: 'SET_MISSION', payload: categoryMissionKey });
                  stateDispatcher({ type: 'SET_ENTITY', payload: undefined as unknown as CategoryEntity }); 
                }}
                className={classNamesUtility(
                  "px-5 py-4 rounded-xl border transition-all duration-500 text-left flex justify-between items-center group",
                  forgeState.categoryMission === categoryMissionKey
                    ? "bg-white text-black border-white shadow-2xl scale-[1.03] z-10"
                    : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-tighter truncate">
                  {MISSION_LABELS[categoryMissionKey]}
                </span>
                {forgeState.categoryMission === categoryMissionKey && (
                  <ChevronRight size={14} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {forgeState.categoryMission && (
            <motion.div
              key={forgeState.categoryMission}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col"
            >
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-5 block">
                Entidad Pericial Especificada
              </label>
              <div className="flex flex-wrap gap-2.5">
                {TAXONOMY_HIERARCHY[forgeState.categoryMission].map((categoryEntityObject) => (
                  <button
                    key={categoryEntityObject.entityIdentification}
                    onClick={() => stateDispatcher({ type: 'SET_ENTITY', payload: categoryEntityObject.entityIdentification })}
                    className={classNamesUtility(
                      "px-5 py-2.5 rounded-full border transition-all duration-500",
                      forgeState.categoryEntity === categoryEntityObject.entityIdentification
                        ? "bg-primary/20 border-primary text-primary shadow-lg scale-110"
                        : "bg-transparent border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300"
                    )}
                  >
                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">
                      {categoryEntityObject.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* IV. CHASIS DE ACCIÓN SOBERANA */}
      <div className="px-6 pb-12 mt-auto shrink-0 bg-gradient-to-t from-[#020202] via-[#020202] to-transparent pt-10">
        <Button
          onClick={navigateToNextStepAction}
          disabled={!isPayloadIntegrityValidated}
          className="w-full h-20 rounded-[2.5rem] bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl font-black text-[11px] tracking-[0.5em] uppercase group overflow-hidden relative"
        >
          <span className="flex items-center gap-4 relative z-10">
            Fijar coordenadas
            <Check size={20} className="group-hover:scale-125 transition-transform" />
          </span>
          {isPayloadIntegrityValidated && (
             <motion.div 
              className="absolute inset-0 bg-primary/10"
              initial={{ x: "-100%" }} animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             />
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V13.0):
 * 1. Contract Alignment: Resolución definitiva de TS2339 al utilizar 'isManualModeActive'
 *    en lugar del descriptor obsoleto 'isManualMode'.
 * 2. ZAP Compliance: Purificación nominal. Se han eliminado todas las abreviaciones 
 *    residuales en la jerarquía taxonómica y estados locales.
 * 3. Atomic State Feedback: Los indicadores visuales reflejan con fidelidad 
 *    milimétrica el estado del motor cinemático.
 */