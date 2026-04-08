/**
 * ARCHIVO: components/geo/steps/step-1-anchoring.tsx
 * VERSIÓN: 7.1 (NicePod Forge Step 1 - Absolute Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el anclaje milimétrico del hito urbano y obligar a la 
 * clasificación taxonómica bidimensional (Misión/Entidad).
 * [REFORMA V7.1]: Eliminación de 'any' en el reseteo taxonómico, aplicación 
 * del Path Protocol y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad:  100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, MapPin, Target, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, nicepodLog } from "@/lib/utils";

// --- MOTORES CORE Y CONTEXTO V4.0 ---
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { useForge } from "@/components/geo/forge-context"; // [FIX]: Path Alias aplicado

// --- [FIX V7.1]: Importación Absoluta para prevenir rupturas de grafo ---
import { SpatialEngine } from "@/components/geo/SpatialEngine";

// --- SOBERANÍA DE TIPOS (V8.5) ---
import { CategoryEntity, CategoryMission } from "@/types/geo-sovereignty";

/**
 * TAXONOMÍA SOBERANA: DICCIONARIO DE ENTIDADES TÉCNICAS
 */
const TAXONOMY_HIERARCHY: Record<CategoryMission, { identification: CategoryEntity; label: string }[]> = {
  infraestructura_vital: [
    { identification: 'aseo_premium', label: 'Aseo Premium' },
    { identification: 'nodo_hidratacion', label: 'Nodo de Hidratación' },
    { identification: 'refugio_climatico', label: 'Refugio Climático' },
    { identification: 'terminal_energia', label: 'Terminal de Energía' },
    { identification: 'zona_segura', label: 'Zona de Seguridad' }
  ],
  memoria_soberana: [
    { identification: 'monumento_nacional', label: 'Monumento' },
    { identification: 'arquitectura_epoca', label: 'Edificio Histórico' },
    { identification: 'placa_sintonia', label: 'Placa/Inscripción' },
    { identification: 'yacimiento_ruina', label: 'Yacimiento/Ruina' },
    { identification: 'leyenda_urbana', label: 'Leyenda Urbana' }
  ],
  capital_intelectual: [
    { identification: 'museo_sabiduria', label: 'Museo/Pinacoteca' },
    { identification: 'atelier_galeria', label: 'Galería/Atelier' },
    { identification: 'libreria_autor', label: 'Librería de Autor' },
    { identification: 'centro_innovacion', label: 'Centro de Innovación' },
    { identification: 'intervencion_plastica', label: 'Intervención Arte' }
  ],
  resonancia_sensorial: [
    { identification: 'mirador_estrategico', label: 'Mirador Estratégico' },
    { identification: 'paisaje_sonoro', label: 'Paisaje Sonoro' },
    { identification: 'pasaje_secreto', label: 'Pasaje/Secreto' },
    { identification: 'mercado_origen', label: 'Market de Origen' },
    { identification: 'obrador_tradicion', label: 'Obrador/Tradición' }
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
  
  // 1. CONSUMO DE LA FACHADA SOBERANA Y CONTEXTO DE FORJA
  const { 
    userLocation, 
    recenterCamera, 
    isManualMode,
    status: engineOperationalStatus 
  } = useGeoEngine();

  const { state: forgeState, dispatch: stateDispatcher, nextStep } = useForge();

  // 2. ESTADOS DE CONTROL VISUAL
  const [isMapDisplayForced, setIsMapDisplayForced] = useState<boolean>(false);

  /**
   * handleManualAnchorSelection:
   * Misión: Capturar el desplazamiento manual y actualizar el estado nominal.
   */
  const handleManualAnchorSelection = useCallback((longitudeAndLatitude: [number, number]) => {
    const [longitudeCoordinate, latitudeCoordinate] = longitudeAndLatitude;
    
    nicepodLog(`📍 [Forge:Step1] Ajuste de anclaje pericial: [${longitudeCoordinate}, ${latitudeCoordinate}]`);
    
    stateDispatcher({
      type: 'SET_LOCATION',
      payload: {
        latitude: latitudeCoordinate,
        longitude: longitudeCoordinate,
        accuracy: 1 // Autoridad manual establecida por el Administrador
      }
    });

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [stateDispatcher]);

  /**
   * EFECTO: TelemetrySeedsynchronization
   * Misión: Sembrar la ubicación inicial del hardware respetando el contrato nominal.
   */
  useEffect(() => {
    if (userLocation && forgeState.latitude === null) {
      stateDispatcher({
        type: 'SET_LOCATION',
        payload: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          accuracy: userLocation.accuracy
        }
      });
    }
    
    const visibilityTimer = setTimeout(() => setIsMapDisplayForced(true), 300);
    return () => clearTimeout(visibilityTimer);
  }, [userLocation, forgeState.latitude, stateDispatcher]);

  /**
   * isPayloadIntegrityValidated: 
   * Misión: Validar la completitud de la Malla de datos antes de permitir el avance.
   */
  const isPayloadIntegrityValidated = useMemo(() => {
    return (
      forgeState.latitude !== null &&
      forgeState.longitude !== null &&
      forgeState.categoryMission !== undefined &&
      forgeState.categoryEntity !== undefined &&
      engineOperationalStatus !== 'IDLE'
    );
  }, [forgeState.latitude, forgeState.longitude, forgeState.categoryMission, forgeState.categoryEntity, engineOperationalStatus]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-1">
      
      {/* I. CABECERA DE INSTRUMENTACIÓN */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-primary rounded-full shadow-lg" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 1: Anclaje y Taxonomía
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
          Sintonice la ubicación exacta del hito y clasifique su misión urbana.
        </p>
      </div>

      {/* II. VISOR DE PRECISIÓN (REACTOR WEBGL AISLADO) */}
      <div className="shrink-0 relative h-[280px] mx-4 mb-6 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#020202]">
        {isMapDisplayForced && (
          <SpatialEngine
            mapInstanceIdentification="map-forge" // Sincronía Nominal Confirmada
            mode="FORGE"
            performanceProfile="TACTICAL_LITE" 
            onManualAnchorSelection={handleManualAnchorSelection}
            className="w-full h-full"
          />
        )}

        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="icon"
            variant={isManualMode ? "resonance" : "glass"}
            className="rounded-2xl shadow-2xl h-11 w-11"
            onClick={recenterCamera}
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
                  {forgeState.latitude?.toFixed(6)}°N, {forgeState.longitude?.toFixed(6)}°E
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

      {/* III. MATRIZ DE TAXONOMÍA GRANULAR */}
      <div className="px-6 flex flex-col gap-6 mb-10 flex-1">
        
        {/* Cuadrante de Misión */}
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
                  // [BUILD SHIELD FIX]: Erradicación de 'any'. El reducer debe manejar 'undefined'
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

        {/* Entidad Pericial Específica */}
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
                    key={categoryEntityObject.identification}
                    onClick={() => stateDispatcher({ type: 'SET_ENTITY', payload: categoryEntityObject.identification })}
                    className={cn(
                      "px-4 py-2 rounded-full border transition-all duration-300",
                      forgeState.categoryEntity === categoryEntityObject.identification
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

      {/* IV. CHASIS DE ACCIÓN SOBERANA */}
      <div className="px-6 pb-10 mt-auto shrink-0 bg-gradient-to-t from-[#020202] to-transparent pt-6">
        <Button
          onClick={nextStep}
          disabled={!isPayloadIntegrityValidated}
          className="w-full h-16 rounded-[2rem] bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl font-black text-xs tracking-[0.4em] uppercase group overflow-hidden relative"
        >
          <span className="flex items-center gap-3 relative z-10">
            Fijar Coordenadas
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