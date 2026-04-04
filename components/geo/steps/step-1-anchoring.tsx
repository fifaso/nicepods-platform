/**
 * ARCHIVO: components/geo/steps/step-1-anchoring.tsx
 * VERSIÓN: 5.0 (NicePod Forge Step 1 - Precision Anchoring & Neural Taxonomy Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el anclaje milimétrico del nodo urbano y obligar al curador
 * a establecer la clasificación taxonómica bidimensional (Misión/Entidad) del hito.
 * [REFORMA V5.0]: Integración de la Taxonomía Granular de 2 capas para alimentar el Oráculo.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { AlertCircle, Check, MapPin, Target, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";

// --- INFRAESTRUCTURA CORE ---
import { Button } from "@/components/ui/button";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { SpatialEngine } from "../SpatialEngine";
import { useForge } from "../forge-context";

// --- SOBERANÍA DE TIPOS (V7.5) ---
import { CategoryEntity, CategoryMission } from "@/types/geo-sovereignty";

/**
 * TAXONOMÍA SOBERANA: DICCIONARIO DE ENTIDADES
 * Mapeo de la Misión (Nivel 1) con las Entidades (Nivel 2).
 */
const TAXONOMY_MAP: Record<CategoryMission, { id: CategoryEntity; label: string }[]> = {
  infraestructura_vital: [
    { id: 'aseo_premium', label: 'Aseo Premium' },
    { id: 'nodo_hidratacion', label: 'Nodo de Hidratación' },
    { id: 'refugio_climatico', label: 'Refugio Climático' },
    { id: 'terminal_energia', label: 'Terminal de Energía' },
    { id: 'zona_segura', label: 'Zona de Seguridad' }
  ],
  memoria_soberana: [
    { id: 'monumento_nacional', label: 'Monumento' },
    { id: 'arquitectura_epoca', label: 'Edificio Histórico' },
    { id: 'placa_sintonia', label: 'Placa/Inscripción' },
    { id: 'yacimiento_ruina', label: 'Yacimiento/Ruina' },
    { id: 'leyenda_urbana', label: 'Leyenda Urbana' }
  ],
  capital_intelectual: [
    { id: 'museo_sabiduria', label: 'Museo/Pinacoteca' },
    { id: 'atelier_galeria', label: 'Galería/Atelier' },
    { id: 'libreria_autor', label: 'Librería de Autor' },
    { id: 'centro_innovacion', label: 'Centro de Innovación' },
    { id: 'intervencion_plastica', label: 'Intervención Arte' }
  ],
  resonancia_sensorial: [
    { id: 'mirador_estrategico', label: 'Mirador Estratégico' },
    { id: 'paisaje_sonoro', label: 'Paisaje Sonoro' },
    { id: 'pasaje_secreto', label: 'Pasaje/Secreto' },
    { id: 'mercado_origen', label: 'Mercado de Origen' },
    { id: 'obrador_tradicion', label: 'Obrador/Tradición' }
  ]
};

const MISSION_LABELS: Record<CategoryMission, string> = {
  infraestructura_vital: "Infraestructura Vital",
  memoria_soberana: "Memoria Soberana",
  capital_intelectual: "Capital Intelectual",
  resonancia_sensorial: "Resonancia Sensorial"
};

/**
 * Step1Anchoring: La fase inicial del peritaje urbano.
 */
export default function Step1Anchoring() {
  // 1. CONSUMO DE LA FACHADA SOBERANA
  const { 
    userLocation, 
    recenterCamera, 
    isManualMode,
    status: engineStatus 
  } = useGeoEngine();

  const { state: forgeState, dispatch, nextStep } = useForge();

  // 2. ESTADOS DE CONTROL LOCAL
  const [forceMapVisible, setForceMapVisible] = useState<boolean>(false);

  /**
   * handleManualOverride:
   * Misión: Capturar el desplazamiento manual del marcador y actualizar 
   * el estado de la forja con rigor métrico.
   */
  const handleManualOverride = useCallback((longitudeLatitude: [number, number]) => {
    const [longitude, latitude] = longitudeLatitude;
    
    nicepodLog(`📍 [Forge:Step1] Ajuste de anclaje detectado: [${longitude}, ${latitude}]`);
    
    dispatch({
      type: 'SET_LOCATION',
      payload: {
        lat: latitude,
        lng: longitude,
        acc: 1 // Precisión de autoridad manual (máxima)
      }
    });

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [dispatch]);

  /**
   * PROTOCOLO DE SINCRONIZACIÓN INICIAL:
   * Si es la primera vez que entramos y tenemos GPS, sembramos la ubicación.
   */
  useEffect(() => {
    if (userLocation && forgeState.latitude === null) {
      dispatch({
        type: 'SET_LOCATION',
        payload: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          acc: userLocation.accuracy
        }
      });
    }
    
    // Retardo técnico para asegurar el repinte del contenedor antes de instanciar WebGL
    const timer = setTimeout(() => setForceMapVisible(true), 300);
    return () => clearTimeout(timer);
  }, [userLocation, forgeState.latitude, dispatch]);

  /**
   * isPayloadReady: Validación de integridad antes de saltar al Step 2.
   */
  const isPayloadReady = useMemo(() => {
    return (
      forgeState.latitude !== null &&
      forgeState.longitude !== null &&
      forgeState.categoryMission !== undefined &&
      forgeState.categoryEntity !== undefined &&
      engineStatus !== 'IDLE'
    );
  }, [forgeState.latitude, forgeState.longitude, forgeState.categoryMission, forgeState.categoryEntity, engineStatus]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar">
      
      {/* I. CABECERA TÁCTICA */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-primary rounded-full" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 1: Anclaje y Clasificación
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
          Sintonice la ubicación y clasifique la naturaleza de la evidencia.
        </p>
      </div>

      {/* II. VISOR DE PRECISIÓN (WEBGL) */}
      <div className="shrink-0 relative h-[300px] mx-4 mb-6 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#020202]">
        {forceMapVisible && (
          <SpatialEngine
            mapInstanceId="map-forge" 
            mode="FORGE"
            performanceProfile="TACTICAL_LITE" 
            onManualAnchor={handleManualOverride}
            className="w-full h-full"
          />
        )}

        {/* Controles Flotantes del Visor */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-3 z-10">
          <Button
            size="icon"
            variant={isManualMode ? "resonance" : "glass"}
            className="rounded-2xl shadow-2xl h-10 w-10"
            onClick={recenterCamera}
            title="Recuperar Voyager"
          >
            <Target size={18} className={cn(isManualMode && "animate-pulse")} />
          </Button>
        </div>

        {/* Indicador de Coordenadas Vivas */}
        <div className="absolute top-4 left-4 right-4 pointer-events-none z-10">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <MapPin size={12} className="text-primary" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white tabular-nums tracking-tighter">
                  {forgeState.latitude?.toFixed(6)}°N, {forgeState.longitude?.toFixed(6)}°E
                </span>
              </div>
            </div>
            {isManualMode && (
              <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
                <span className="text-[6px] font-black text-primary uppercase tracking-widest">Manual</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* III. MATRIZ DE TAXONOMÍA (NUEVO V5.0) */}
      <div className="px-6 flex flex-col gap-6 mb-8 flex-1">
        
        {/* Nivel 1: Misión (Cuadrante) */}
        <div>
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 block">
            Cuadrante Funcional (Nivel 1)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TAXONOMY_MAP) as CategoryMission[]).map((mission) => (
              <button
                key={mission}
                onClick={() => {
                  dispatch({ type: 'SET_MISSION', payload: mission });
                  // Al cambiar la misión, limpiamos la entidad para evitar inconsistencias
                  dispatch({ type: 'SET_ENTITY', payload: undefined as any }); 
                }}
                className={cn(
                  "px-3 py-2.5 rounded-xl border transition-all duration-300 text-left flex justify-between items-center",
                  forgeState.categoryMission === mission
                    ? "bg-white text-black border-white shadow-xl"
                    : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <span className="text-[9px] font-black uppercase tracking-tighter truncate">
                  {MISSION_LABELS[mission]}
                </span>
                {forgeState.categoryMission === mission && <ChevronRight size={12} />}
              </button>
            ))}
          </div>
        </div>

        {/* Nivel 2: Entidad (Solo visible si hay Misión seleccionada) */}
        {forgeState.categoryMission && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3 block">
              Entidad Específica (Nivel 2)
            </label>
            <div className="flex flex-wrap gap-2">
              {TAXONOMY_MAP[forgeState.categoryMission].map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => dispatch({ type: 'SET_ENTITY', payload: entity.id })}
                  className={cn(
                    "px-3 py-2 rounded-full border transition-all duration-300",
                    forgeState.categoryEntity === entity.id
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                      : "bg-transparent border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300"
                  )}
                >
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    {entity.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* IV. CHASSIS DE ACCIÓN INFERIOR */}
      <div className="px-6 pb-8 mt-auto shrink-0 bg-gradient-to-t from-[#020202] to-transparent pt-4">
        <Button
          onClick={nextStep}
          disabled={!isPayloadReady}
          className="w-full h-16 rounded-[1.5rem] bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 font-black text-xs tracking-[0.3em] uppercase group"
        >
          <span className="flex items-center gap-3">
            Fijar Coordenadas
            <Check size={18} className="group-hover:scale-110 transition-transform" />
          </span>
        </Button>
        
        {engineStatus === 'IDLE' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-500/80">
            <AlertCircle size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              Esperando Sintonía Satelital
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Multidimensional Injection: El formulario ahora requiere 2 pasos cognitivos 
 *    antes de habilitar el botón "Fijar Coordenadas", garantizando que la Bóveda 
 *    reciba datos periciales altamente segmentados.
 * 2. Visual Hierarchy: Se limitó la altura del mapa a 300px para permitir que 
 *    los selectores de taxonomía respiren visualmente sin obligar al Voyager 
 *    a realizar scroll excesivo en móviles.
 * 3. Contract Anticipation: Este archivo asume que el `forgeReducer` ya ha sido 
 *    actualizado para aceptar 'SET_MISSION' y 'SET_ENTITY', un paso vital para 
 *    el ensamblaje final.
 */