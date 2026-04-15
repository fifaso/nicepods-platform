/**
 * ARCHIVO: components/create-flow/steps/learn-sub-step.tsx
 * VERSIÓN: 10.0 (NicePod Learn Sub-Step - Cognitive Depth Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer una interfaz de selección para el nivel de profundidad del 
 * aprendizaje, garantizando la sintonía entre la metodología y el flujo de captura.
 * [REFORMA V10.0]: Resolución definitiva de TS2339. Sincronización nominal 
 * absoluta con 'CreationContextType' V5.0 y 'styleSelection' del esquema V12.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { Zap, Layers, ArrowRight, Lock, Sparkles } from "lucide-react";
import { classNamesUtility, nicepodLog } from "@/lib/utils";
import { useCreationContext } from "../shared/context";
import { Badge } from "@/components/ui/badge";
import { FlowState } from "../shared/types";
import React from "react";

/**
 * INTERFAZ: LearnNarrativeOptionDefinition
 * Misión: Definir el contrato visual y técnico para las opciones de aprendizaje.
 */
interface LearnNarrativeOptionDefinition {
  identification: string;
  nextFlowStateDescriptor: FlowState;
  agentIntelligenceIdentifier?: string;
  styleSelectionValue?: "solo" | "link" | "archetype";
  iconComponent: React.ElementType;
  displayTitleText: string;
  descriptionContentText: string;
  tailwindColorClassName: string;
  backgroundHighlightClassName: string;
  isOptionDisabledStatus?: boolean;
  statusBadgeText?: string;
}

/**
 * LEARN_NARRATIVE_OPTIONS_COLLECTION:
 * Misión: Catálogo de metodologías de aprendizaje sincronizadas con MASTER_FLOW_PATHS.
 */
const LEARN_NARRATIVE_OPTIONS_COLLECTION: LearnNarrativeOptionDefinition[] = [
  {
    identification: "quick_lesson",
    nextFlowStateDescriptor: "SOLO_TALK_INPUT_FIELD",
    agentIntelligenceIdentifier: "solo-talk-analyst",
    styleSelectionValue: "solo",
    iconComponent: Zap,
    displayTitleText: "Lección Rápida",
    descriptionContentText: "Desglose de un concepto de forma clara y concisa en un solo activo acústico.",
    tailwindColorClassName: "text-amber-500",
    backgroundHighlightClassName: "bg-amber-500/10",
  },
  {
    identification: "deep_course",
    nextFlowStateDescriptor: "TECHNICAL_DETAILS_STEP",
    iconComponent: Layers,
    displayTitleText: "Curso Profundo",
    descriptionContentText: "Estructuración de un tema complejo en un plan de aprendizaje multidimensional.",
    tailwindColorClassName: "text-blue-500",
    backgroundHighlightClassName: "bg-blue-500/10",
    isOptionDisabledStatus: true,
    statusBadgeText: "PRÓXIMAMENTE"
  }
];

/**
 * LearnSubStep: La terminal de decisión para el aprendizaje estratégico.
 */
export function LearnSubStep() {
  /** 
   * [SINCRO V10.0 - RESOLUCIÓN TS2339]: 
   * Consumo de los actuadores purificados del sistema nervioso.
   */
  const { 
    updatePodcastCreationFormData, 
    transitionToNextStateAction 
  } = useCreationContext();

  /**
   * handleMethodologySelectionAction:
   * Misión: Inyectar metadatos de estilo y avanzar en la máquina de estados.
   * [SINCRO V12.0]: Mapeo a 'styleSelection' y descriptores purificados.
   */
  const handleMethodologySelectionAction = (optionItem: LearnNarrativeOptionDefinition) => {
    if (optionItem.isOptionDisabledStatus) return;
    
    nicepodLog(`🧠 [Learn-Selection] Metodología seleccionada: ${optionItem.identification}`);

    // 1. Inyección de capital intelectual en el motor de formulario
    updatePodcastCreationFormData({
      styleSelection: optionItem.styleSelectionValue,
      agentName: optionItem.agentIntelligenceIdentifier,
    });

    // 2. Transición cinemática inmediata hacia la siguiente fase
    transitionToNextStateAction(optionItem.nextFlowStateDescriptor);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto py-6 px-4 justify-center overflow-hidden isolate">
      
      {/* I. CABECERA: Identidad Visual de Aprendizaje */}
      <header className="text-center mb-12 isolate">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-[0.9] mb-3 italic font-serif"
        >
          Elija la <span className="text-primary not-italic">Profundidad</span>
        </motion.h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center justify-center gap-3">
          <Sparkles size={14} className="text-primary animate-pulse" />
          ¿Qué nivel de peritaje requiere la misión?
        </p>
      </header>

      {/* II. STACK DE OPCIONES TÁCTICAS */}
      <div className="flex flex-col gap-5 isolate">
        {LEARN_NARRATIVE_OPTIONS_COLLECTION.map((optionItem, itemIndexMagnitude) => {
          const OptionIconComponent = optionItem.iconComponent;
          const isCurrentlyDisabled = optionItem.isOptionDisabledStatus;

          return (
            <motion.button
              key={optionItem.identification}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: itemIndexMagnitude * 0.1, duration: 0.5 }}
              onClick={() => handleMethodologySelectionAction(optionItem)}
              disabled={isCurrentlyDisabled}
              className={classNamesUtility(
                "relative group w-full flex items-center p-6 rounded-[2rem] border transition-all duration-500 isolate",
                "bg-[#0a0a0a]/60 backdrop-blur-3xl overflow-hidden shadow-2xl",
                !isCurrentlyDisabled 
                  ? "border-white/5 hover:border-primary/40 active:scale-[0.98]" 
                  : "opacity-40 grayscale cursor-not-allowed border-dashed border-white/5"
              )}
            >
              {/* Contenido de la Terminal de Selección */}
              <div className="relative z-10 flex items-center w-full gap-6">
                {/* Contenedor de Iconografía de Alta Resolución */}
                <div className={classNamesUtility(
                  "p-4 rounded-2xl transition-all duration-700 shadow-inner border border-white/5",
                  !isCurrentlyDisabled 
                    ? `${optionItem.backgroundHighlightClassName} ${optionItem.tailwindColorClassName} group-hover:scale-110` 
                    : "bg-zinc-900 text-zinc-700"
                )}>
                  <OptionIconComponent 
                    size={28} 
                    strokeWidth={isCurrentlyDisabled ? 1.5 : 2.5} 
                  />
                </div>

                {/* Bloque de Información Técnica */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-lg md:text-xl uppercase tracking-tighter text-white leading-none">
                      {optionItem.displayTitleText}
                    </h3>
                    {optionItem.statusBadgeText && (
                      <Badge className="bg-zinc-800 text-zinc-500 border-none text-[8px] font-black tracking-widest px-2 h-5 rounded-md">
                        {optionItem.statusBadgeText}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed italic">
                    {optionItem.descriptionContentText}
                  </p>
                </div>

                {/* Indicador de Acción Geodésica */}
                <div className="flex-shrink-0">
                  {!isCurrentlyDisabled ? (
                    <ArrowRight 
                        className="text-primary opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" 
                        size={24} 
                    />
                  ) : (
                    <Lock className="text-zinc-800" size={20} />
                  )}
                </div>
              </div>

              {/* Capa de Magnetismo Visual (Solo en activos) */}
              {!isCurrentlyDisabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* III. EQUILIBRIO ÓPTICO DE TERMINAL */}
      <div className="h-12 md:h-24 shrink-0" />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Build Shield Sovereignty: Resolución definitiva de TS2339 mediante la 
 *    sincronización con 'updatePodcastCreationFormData' y 'transitionToNextStateAction'.
 * 2. ZAP Absolute Compliance: Purificación total. 'id' -> 'identification', 
 *    'option' -> 'optionItem', 'bgColor' -> 'backgroundHighlightClassName'.
 * 3. Contract Alignment: Se ha mapeado el estilo hacia 'styleSelection' del esquema V12.0, 
 *    asegurando que el capital intelectual fluya sin fricciones nominales.
 * 4. UX Kinematics: El uso de gradientes sutiles y transiciones de 500ms refuerza 
 *    la estética de grado industrial de la forja.
 */