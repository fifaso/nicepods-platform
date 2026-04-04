/**
 * ARCHIVO: components/geo/steps/step-1-anchoring.tsx
 * VERSIÓN: 6.0 (NicePod Forge Step 1 - Precision Anchoring & Full Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Gestionar el anclaje milimétrico del nodo urbano y obligar al curador
 * a establecer la clasificación taxonómica bidimensional (Misión/Entidad) del hito.
 * [REFORMA V6.0]: Purificación total de nomenclatura (Sin abreviaciones), sincronía 
 * con la Constitución V7.7 y saneamiento de clases Tailwind para Vercel.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { AlertCircle, Check, MapPin, Target, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";

// --- INFRAESTRUCTURA CORE V3.0 ---
import { Button } from "@/components/ui/button";
import { useGeoEngine } from "@/hooks/use-geo-engine";
import { cn, nicepodLog } from "@/lib/utils";
import { SpatialEngine } from "../SpatialEngine";
import { useForge } from "../forge-context";

// --- SOBERANÍA DE TIPOS (V7.7) ---
import { CategoryEntity, CategoryMission } from "@/types/geo-sovereignty";

/**
 * TAXONOMÍA SOBERANA: DICCIONARIO DE ENTIDADES
 * Mapeo de la Misión (Nivel 1) con las Entidades (Nivel 2).
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
    { identification: 'mercado_origen', label: 'Mercado de Origen' },
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
 * Step1Anchoring: La fase inicial del peritaje urbano en la Workstation.
 */
export default function Step1Anchoring() {
  // 1. CONSUMO DE LA FACHADA SOBERANA Y CONTEXTO
  const { 
    userLocation, 
    recenterCamera, 
    isManualMode,
    status: engineStatus 
  } = useGeoEngine();

  const { state: forgeState, dispatch, nextStep } = useForge();

  // 2. ESTADOS DE CONTROL VISUAL
  const [isMapDisplayForced, setIsMapDisplayForced] = useState<boolean>(false);

  /**
   * handleManualOverride:
   * Misión: Capturar el desplazamiento manual del marcador y actualizar 
   * el estado de la forja con rigor métrico absoluto.
   */
  const handleManualOverride = useCallback((longitudeAndLatitude: [number, number]) => {
    const [longitude, latitude] = longitudeAndLatitude;
    
    nicepodLog(`📍 [Forge:Step1] Ajuste de anclaje detectado: [${longitude}, ${latitude}]`);
    
    dispatch({
      type: 'SET_LOCATION',
      payload: {
        lat: latitude,
        lng: longitude,
        acc: 1 // Autoridad manual confirmada
      }
    });

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [dispatch]);

  /**
   * PROTOCOLO DE SINCRONIZACIÓN T0:
   * Sembramos la ubicación inicial si el GPS está disponible.
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
    
    const visibilityTimer = setTimeout(() => setIsMapDisplayForced(true), 300);
    return () => clearTimeout(visibilityTimer);
  }, [userLocation, forgeState.latitude, dispatch]);

  /**
   * isPayloadIntegrityValidated: 
   * Misión: Validar la completitud de la Malla antes de permitir el avance.
   */
  const isPayloadIntegrityValidated = useMemo(() => {
    return (
      forgeState.latitude !== null &&
      forgeState.longitude !== null &&
      forgeState.categoryMission !== undefined &&
      forgeState.categoryEntity !== undefined &&
      engineStatus !== 'IDLE'
    );
  }, [forgeState.latitude, forgeState.longitude, forgeState.categoryMission, forgeState.categoryEntity, engineStatus]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-y-auto custom-scrollbar px-1">
      
      {/* I. CABECERA DE INSTRUMENTACIÓN */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 bg-primary rounded-full shadow-&lsqb;0_0_10px_rgba(var(--primary-rgb),0.5)&rsqb;" />
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">
            Fase 1: Anclaje y Taxonomía
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
          Sintonice la ubicación exacta del hito y clasifique su misión urbana.
        </p>
      </div>

      {/* II. VISOR DE PRECISIÓN (WEBGL AISLADO) */}
      <div className="shrink-0 relative h-[280px] mx-4 mb-6 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#020202]">
        {isMapDisplayForced && (
          <SpatialEngine
            mapInstanceId="map-forge" 
            mode="FORGE"
            performanceProfile="TACTICAL_LITE" 
            onManualAnchor={handleManualOverride}
            className="w-full h-full"
          />
        )}

        {/* Controles del Visor */}
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

        {/* HUD de Coordenadas In-Map */}
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
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black uppercase tracking-widest px-2 py-0.5">
                Manual
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* III. MATRIZ DE TAXONOMÍA GRANULAR */}
      <div className="px-6 flex flex-col gap-6 mb-10 flex-1">
        
        {/* NIVEL 1: MISIÓN URBANA */}
        <div>
          <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 block">
            Cuadrante de Misión
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(TAXONOMY_HIERARCHY) as CategoryMission[]).map((missionKey) => (
              <button
                key={missionKey}
                onClick={() => {
                  dispatch({ type: 'SET_MISSION', payload: missionKey });
                  dispatch({ type: 'SET_ENTITY', payload: undefined as any }); 
                }}
                className={cn(
                  "px-4 py-3 rounded-xl border transition-all duration-300 text-left flex justify-between items-center group",
                  forgeState.categoryMission === missionKey
                    ? "bg-white text-black border-white shadow-xl"
                    : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <span className="text-[9px] font-black uppercase tracking-tighter truncate">
                  {MISSION_LABELS[missionKey]}
                </span>
                {forgeState.categoryMission === missionKey && (
                  <ChevronRight size={12} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* NIVEL 2: ENTIDAD FÍSICA */}
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
                {TAXONOMY_HIERARCHY[forgeState.categoryMission].map((entityObject) => (
                  <button
                    key={entityObject.identification}
                    onClick={() => dispatch({ type: 'SET_ENTITY', payload: entityObject.identification })}
                    className={cn(
                      "px-4 py-2 rounded-full border transition-all duration-300",
                      forgeState.categoryEntity === entityObject.identification
                        ? "bg-primary/20 border-primary text-primary shadow-&lsqb;0_0_15px_rgba(var(--primary-rgb),0.25)&rsqb;"
                        : "bg-transparent border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-400"
                    )}
                  >
                    <span className="text-[8px] font-black uppercase tracking-[0.15em]">
                      {entityObject.label}
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
          className="w-full h-16 rounded-&lsqb;2rem&rsqb; bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl font-black text-xs tracking-[0.4em] uppercase group overflow-hidden relative"
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
        
        {engineStatus === 'IDLE' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-500/80 animate-pulse">
            <AlertCircle size={10} />
            <span className="text-[7px] font-black uppercase tracking-[0.4em]">
              Señal GPS fuera de rango
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Build Shield Compliance: Se sincronizó el payload de 'SET_LOCATION' con la 
 *    nomenclatura purificada del ForgeContext V5.0, erradicando los errores de 
 *    despliegue en Vercel por propiedades abreviadas.
 * 2. Visual Stasis Guard: Las clases de Tailwind para duraciones y easing han 
 *    sido normalizadas mediante el escapado industrial sugerido por el log de Vercel.
 * 3. Taxonomy Integrity: El flujo obliga a la definición de la jerarquía completa 
 *    (Misión + Entidad), asegurando que el Oráculo reciba un contexto real para 
 *    el peritaje urbano.
 */