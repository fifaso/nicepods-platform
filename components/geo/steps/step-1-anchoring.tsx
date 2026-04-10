/**
 * ARCHIVO: components/geo/steps/step-1-anchoring.tsx
 * VERSIÓN: 9.0 (NicePod Forge Step 1 - Absolute Nominal Integrity & Industrial UI Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Gestionar el anclaje pericial milimétrico del hito urbano y forzar la 
 * clasificación taxonómica bidimensional (Cuadrante de Misión y Entidad Física).
 * [REFORMA V9.0]: Implementación absoluta de la Zero Abbreviations Policy (ZAP). 
 * Sincronización total con ForgeContext V6.0 y la Constitución V8.6. 
 * Refactorización de la jerarquía taxonómica para erradicar residuos de "id".
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, Target, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, nicepodLog } from "@/lib/utils";

// --- MOTORES CORE Y CONTEXTO V4.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "@/components/geo/forge-context"; 
import { SpatialEngine } from "@/components/geo/SpatialEngine";

// --- SOBERANÍA DE TIPOS (V8.6) ---
import { 
  CategoryEntity, 
  CategoryMission, 
  MapInstanceIdentification 
} from "@/types/geo-sovereignty";

/**
 * TAXONOMÍA SOBERANA: DICCIONARIO DE ENTIDADES TÉCNICAS INDUSTRIALES
 * [SINCRO V9.0]: Renombrado 'identification' a 'entityIdentification' (ZAP Compliance).
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
 * Step1Anchoring: La fase inicial de peritaje y geolocalización industrial de la terminal.
 */
export default function Step1Anchoring() {
  
  // 1. CONSUMO DE LA FACHADA SOBERANA Y CONTEXTO DE FORJA
  const { 
    userLocation, 
    recenterCamera: recenterVisualCameraAction, 
    isManualMode,
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
   * Misión: Capturar el desplazamiento manual y actualizar el estado nominal del hito.
   * [SINCRO V9.0]: Alineación con el payload de ForgeContext V6.0.
   */
  const executeManualGeographicAnchorSelectionWorkflow = useCallback((
    longitudeCoordinate: number, 
    latitudeCoordinate: number
  ) => {
    nicepodLog(`📍 [Forge:Step1] Ajuste de anclaje pericial: [${longitudeCoordinate}, ${latitudeCoordinate}]`);
    
    stateDispatcher({
      type: 'SET_LOCATION',
      payload: {
        latitudeCoordinate: latitudeCoordinate,
        longitudeCoordinate: longitudeCoordinate,
        accuracyMeters: 1 // Autoridad manual absoluta establecida por el Administrador
      }
    });

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [stateDispatcher]);

  /**
   * EFECTO: TelemetrySeedSynchronization
   * Misión: Sembrar la ubicación inicial del hardware respetando el nuevo contrato purificado.
   * [SINCRO V9.0]: Mapeo de latitudeCoordinate, longitudeCoordinate y accuracyMeters.
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

  /**
   * isPayloadIntegrityValidated: 
   * Misión: Validar la completitud de la Malla de datos antes de permitir el avance de fase.
   */
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

      {/* II. VISOR DE PRECISIÓN (REACTOR WEBGL AISLADO) */}
      <div className="shrink-0 relative h-[280px] mx-4 mb-6 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#020202]">
        {isMapDisplayEngineForced && (
          <SpatialEngine
            mapInstanceIdentification={"map-forge" as MapInstanceIdentification} 
            mode="FORGE"
            performanceProfile="TACTICAL_LITE" 
            onManualAnchorSelectionAction={executeManualGeographicAnchorSelectionWorkflow}
            className="w-full h-full"
          />
        )}

        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="icon"
            variant={isManualMode ? "resonance" : "glass"}
            className="rounded-2xl shadow-2xl h-11 w-11"
            onClick={recenterVisualCameraAction}
          >
            <Target size={18} className={cn(isManualMode && "animate-pulse")} />
          </Button>
        </div>

        <div className="absolute top-4 left-4 right-4 pointer-events-none z-10">
          <div className="bg-black/85 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <MapPin size={12} className="text-primary" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white tabular-nums tracking-tighter">
                  {forgeState.latitudeCoordinate?.toFixed(6)}°N, {forgeState.longitudeCoordinate?.toFixed(6)}°E
                </span>
              </div>
            </div>
            {isManualMode && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                Anclaje Manual
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* III. MATRIZ DE TAXONOMÍA GRANULAR (PILAR 1) */}
      <div className="px-6 flex flex-col gap-6 mb-10 flex-1">
        
        {/* SECTOR: CUADRANTE DE MISIÓN */}
        <div>
          <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 block">
            Cuadrante de Misión Principal
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(TAXONOMY_HIERARCHY) as CategoryMission[]).map((categoryMissionKey) => (
              <button
                key={categoryMissionKey}
                onClick={() => {
                  stateDispatcher({ type: 'SET_MISSION', payload: categoryMissionKey });
                  // [BUILD SHIELD]: Sincronización nominal del reseteo de entidad.
                  stateDispatcher({ type: 'SET_ENTITY', payload: undefined as unknown as CategoryEntity }); 
                }}
                className={cn(
                  "px-4 py-3 rounded-xl border transition-all duration-300 text-left flex justify-between items-center group",
                  forgeState.categoryMission === categoryMissionKey
                    ? "bg-white text-black border-white shadow-xl scale-[1.02]"
                    : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <span className="text-[9px] font-black uppercase tracking-tighter truncate">
                  {MISSION_LABELS[categoryMissionKey]}
                </span>
                {forgeState.categoryMission === categoryMissionKey && (
                  <ChevronRight size={12} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SECTOR: ENTIDAD PERICIAL ESPECÍFICA */}
        <AnimatePresence mode="wait">
          {forgeState.categoryMission && (
            <motion.div
              key={forgeState.categoryMission}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 block">
                Entidad Pericial Especificada
              </label>
              <div className="flex flex-wrap gap-2">
                {TAXONOMY_HIERARCHY[forgeState.categoryMission].map((categoryEntityObject) => (
                  <button
                    key={categoryEntityObject.entityIdentification}
                    onClick={() => stateDispatcher({ type: 'SET_ENTITY', payload: categoryEntityObject.entityIdentification })}
                    className={cn(
                      "px-4 py-2 rounded-full border transition-all duration-300",
                      forgeState.categoryEntity === categoryEntityObject.entityIdentification
                        ? "bg-primary/20 border-primary text-primary shadow-lg scale-105"
                        : "bg-transparent border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-400"
                    )}
                  >
                    <span className="text-[8px] font-black uppercase tracking-[0.15em]">
                      {categoryEntityObject.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* IV. CHASIS DE ACCIÓN SOBERANA DE TRANSICIÓN */}
      <div className="px-6 pb-10 mt-auto shrink-0 bg-gradient-to-t from-[#020202] to-transparent pt-6">
        <Button
          onClick={navigateToNextStepAction}
          disabled={!isPayloadIntegrityValidated}
          className="w-full h-16 rounded-[2rem] bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl font-black text-xs tracking-[0.4em] uppercase group overflow-hidden relative"
        >
          <span className="flex items-center gap-3 relative z-10">
            Fijar Coordenadas Tácticas
            <Check size={18} className="group-hover:scale-125 transition-transform" />
          </span>
          {isPayloadIntegrityValidated && (
             <motion.div 
              className="absolute inset-0 bg-primary/10"
              initial={{ x: "-100%" }} animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
             />
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. Build Shield Compliance: Se sincronizaron las propiedades del payload de 'SET_LOCATION' 
 *    con el ForgeContext V6.0, asegurando que la persistencia use nombres industriales.
 * 2. Zero Abbreviations Policy (ZAP): Erradicación de 'id' en la jerarquía taxonómica, 
 *    sustituido por 'entityIdentification'. Purificación de todos los manejadores internos.
 * 3. UI State Precision: El uso de 'isMapDisplayEngineForced' garantiza una carga 
 *    limpia del Reactor WebGL sin parpadeos de contenedor vacío.
 */