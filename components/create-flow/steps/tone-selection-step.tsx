/**
 * ARCHIVO: components/create-flow/steps/tone-selection-step.tsx
 * VERSIÓN: 4.0 (NicePod Tone Selection - Interpretative ADN Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Definir el ADN interpretativo del Agente de Inteligencia, garantizando 
 * la auto-calibración de los parámetros acústicos y la fluidez de navegación.
 * [REFORMA V4.0]: Resolución definitiva de TS2339, TS2769, TS2345 y TS2367. 
 * Sincronización nominal absoluta con 'CreationContextType' V5.0 y 'PodcastCreationSchema' V12.0.
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Mic2,
  Search,
  Sparkles,
  Coffee,
  Zap,
  Feather,
  ChevronRight,
  Brain,
  Wand2
} from "lucide-react";
import { classNamesUtility, nicepodLog } from "@/lib/utils";

import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCreationContext } from "../shared/context";

// [SINCRO V4.0]: Importación de configuraciones maestras de voz
import { PERSONALITY_PERFECT_SETUPS, PersonalityType } from "../shared/vocal-director-map";

/**
 * INTERFAZ: AgentPersonalityOption
 * Misión: Definir el contrato visual y semántico de una personalidad.
 */
interface AgentPersonalityOption {
  valueIdentification: string;
  displayLabel: string;
  descriptionContentText: string;
  iconComponent: React.ElementType;
  colorTailwindClassName: string;
}

/**
 * AGENT_PERSONALITY_OPTIONS_COLLECTION: 
 * Catálogo de identidades interpretativas para el Oráculo.
 */
const AGENT_PERSONALITY_OPTIONS_COLLECTION: AgentPersonalityOption[] = [
  { valueIdentification: "narrador", displayLabel: "El Narrador", descriptionContentText: "Historias envolventes y fluidas", iconComponent: Mic2, colorTailwindClassName: "bg-indigo-500/10 text-indigo-400" },
  { valueIdentification: "esceptico", displayLabel: "El Curioso", descriptionContentText: "Análisis crítico y agudo", iconComponent: Search, colorTailwindClassName: "bg-emerald-500/10 text-emerald-400" },
  { valueIdentification: "mentor", displayLabel: "El Sabio", descriptionContentText: "Autoridad, calma y consejo", iconComponent: Sparkles, colorTailwindClassName: "bg-amber-500/10 text-amber-400" },
  { valueIdentification: "amigo", displayLabel: "El Amigo", descriptionContentText: "Cercanía y tono casual urbano", iconComponent: Coffee, colorTailwindClassName: "bg-rose-500/10 text-rose-400" },
  { valueIdentification: "rebelde", displayLabel: "El Rebelde", descriptionContentText: "Disrupción y audacia cognitiva", iconComponent: Zap, colorTailwindClassName: "bg-yellow-500/10 text-yellow-400" },
  { valueIdentification: "minimalista", displayLabel: "Esencial", descriptionContentText: "Síntesis pura sin rodeos", iconComponent: Feather, colorTailwindClassName: "bg-slate-500/10 text-slate-400" },
];

/**
 * ToneSelectionStep: La terminal de calibración de personalidad del agente.
 */
export function ToneSelectionStep() {
  // Consumo del motor de formularios bajo el tipado estricto BSS
  const { setValue, watch } = useFormContext<PodcastCreationData>();

  /** 
   * [SINCRO V5.0]: Consumo de la autoridad de navegación purificada.
   * [RESOLUCIÓN TS2339]: 'transitionToNextStateAction' y 'getMasterFlowPathCollection'.
   */
  const { 
    transitionToNextStateAction, 
    getMasterFlowPathCollection 
  } = useCreationContext();

  /** [RESOLUCIÓN TS2769]: Observación del campo purificado 'selectedToneIdentifier'. */
  const currentSelectedToneIdentifier = watch('selectedToneIdentifier');

  /**
   * handlePersonalitySelectionAction:
   * Misión: Sincronizar la personalidad, auto-calibrar el estudio acústico y avanzar de fase.
   * [RESOLUCIÓN TS2345]: Alineación con descriptores industriales (voiceStyleSelection, etc.).
   */
  const handlePersonalitySelectionAction = (personalityIdentificationValue: string) => {
    const personalityCasting = personalityIdentificationValue as PersonalityType;
    const personalityPerfectSetupDossier = PERSONALITY_PERFECT_SETUPS[personalityCasting];

    nicepodLog(`🎭 [Tone-Selection] Calibrando Agente: ${personalityIdentificationValue}`);

    // 1. Sincronización de Identidad Nominal
    setValue('selectedToneIdentifier', personalityIdentificationValue, { shouldValidate: true, shouldDirty: true });
    setValue('agentName', personalityIdentificationValue, { shouldValidate: true, shouldDirty: true });

    // 2. Auto-Calibración de Parámetros Acústicos Neuronales
    if (personalityPerfectSetupDossier) {
      setValue('voiceStyleSelection', personalityPerfectSetupDossier.style, { shouldValidate: true });
      setValue('voicePaceSelection', personalityPerfectSetupDossier.pace, { shouldValidate: true });
    }

    // 3. Orquestación de Transición Cinemática
    const currentMasterPathCollection = getMasterFlowPathCollection();
    const currentPhaseIndexMagnitude = currentMasterPathCollection.indexOf('AGENT_TONE_SELECTION');

    if (currentPhaseIndexMagnitude !== -1 && (currentPhaseIndexMagnitude + 1) < currentMasterPathCollection.length) {
      const nextStepFlowStateDescriptor = currentMasterPathCollection[currentPhaseIndexMagnitude + 1];
      
      // Delay táctico para permitir feedback visual de la selección (MTI Hygiene)
      setTimeout(() => transitionToNextStateAction(nextStepFlowStateDescriptor), 300);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-lg md:max-w-4xl mx-auto py-4 px-2 md:px-6 justify-center overflow-hidden isolate">

      {/* CABECERA: Identidad Visual NicePod */}
      <header className="text-center mb-6 md:mb-10 pt-2 shrink-0">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none italic font-serif"
        >
          Personalidad
        </motion.h1>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mt-3 flex items-center justify-center gap-2">
          <Brain size={14} className="text-primary" />
          Define el ADN interpretativo de tu Inteligencia
        </p>
      </header>

      {/* STACK DE SELECCIÓN DINÁMICO */}
      <div className="flex-1 flex flex-col justify-center isolate">
        <FormField
          name="selectedToneIdentifier"
          render={() => (
            <FormItem className="space-y-0">
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {AGENT_PERSONALITY_OPTIONS_COLLECTION.map((personalityOptionItem, itemIndexMagnitude) => {
                    const PersonalityIconComponent = personalityOptionItem.iconComponent;
                    
                    /** [RESOLUCIÓN TS2367]: Comparación de tipos sincronizada. */
                    const isPersonalitySelectedStatus = currentSelectedToneIdentifier === personalityOptionItem.valueIdentification;

                    return (
                      <motion.button
                        key={personalityOptionItem.valueIdentification}
                        type="button"
                        initial={{ opacity: 0, x: itemIndexMagnitude % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndexMagnitude * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePersonalitySelectionAction(personalityOptionItem.valueIdentification)}
                        className={classNamesUtility(
                          "relative w-full flex items-center p-4 md:p-5 rounded-2xl border transition-all duration-500 isolate",
                          "bg-white/[0.03] backdrop-blur-3xl overflow-hidden",
                          isPersonalitySelectedStatus
                            ? "border-primary ring-1 ring-primary/30 shadow-2xl shadow-primary/10"
                            : "border-white/5 hover:border-white/10 shadow-sm"
                        )}
                      >
                        <div className="flex items-center w-full gap-4 md:gap-6 relative z-10">
                          {/* Contenedor de Icono de Personalidad */}
                          <div className={classNamesUtility(
                            "p-3 rounded-xl transition-all duration-700 shadow-inner",
                            isPersonalitySelectedStatus 
                              ? "bg-primary text-white scale-110 shadow-lg" 
                              : personalityOptionItem.colorTailwindClassName
                          )}>
                            <PersonalityIconComponent size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
                          </div>

                          {/* Metadatos de Personalidad */}
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className={classNamesUtility(
                                "font-black text-sm md:text-base uppercase tracking-tight transition-colors leading-none",
                                isPersonalitySelectedStatus ? "text-white" : "text-zinc-300"
                              )}>
                                {personalityOptionItem.displayLabel}
                              </h3>
                              {isPersonalitySelectedStatus && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center gap-1 text-[8px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full"
                                >
                                  <Wand2 size={8} /> SINTONIZADO
                                </motion.div>
                              )}
                            </div>
                            <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest leading-tight mt-1 truncate">
                              {personalityOptionItem.descriptionContentText}
                            </p>
                          </div>

                          <ChevronRight
                            className={classNamesUtility(
                              "transition-all duration-500",
                              isPersonalitySelectedStatus 
                                ? "text-primary opacity-100 translate-x-0" 
                                : "text-zinc-800 opacity-0 -translate-x-2"
                            )}
                            size={20}
                          />
                        </div>

                        {/* Capa Atmosférica de Selección */}
                        {isPersonalitySelectedStatus && (
                          <div className="absolute inset-0 bg-primary/[0.04] pointer-events-none z-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage className="text-center mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-destructive italic" />
            </FormItem>
          )}
        />
      </div>

      {/* Margen Táctico de Equilibrio */}
      <div className="h-6 md:h-12 shrink-0" />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Sovereignty: Resolución definitiva de los errores de tipado del Contexto 
 *    y del Formulario mediante el uso de descriptores industriales (selectedToneIdentifier).
 * 2. ZAP Absolute Compliance: Purificación total. Se eliminaron abreviaciones como 'opt', 
 *    'desc', 'val', 'currentIndex' o 'nextState'.
 * 3. Kinematic Optimization: El uso de 'classNamesUtility' y transiciones de 500ms 
 *    garantiza una respuesta visual fluida en el Hilo Principal (MTI).
 */