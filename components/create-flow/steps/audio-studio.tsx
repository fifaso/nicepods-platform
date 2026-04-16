/**
 * ARCHIVO: components/create-flow/steps/audio-studio.tsx
 * VERSIÓN: 4.0 (NicePod Audio Studio - Acoustic Direction Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer una consola de alta fidelidad para la calibración de parámetros 
 * de voz neuronal, garantizando la sintonía entre el Agente de Inteligencia 
 * y la preferencia auditiva del Voyager.
 * [REFORMA V4.0]: Resolución definitiva de TS2769, TS2322 y TS2367. 
 * Sincronización nominal absoluta con 'PodcastCreationSchema' V12.0 (voiceStyleSelection, voicePaceSelection).
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { classNamesUtility, nicepodLog } from "@/lib/utils";

import { FormField, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Volume2,
  Gauge,
  Activity,
  Sparkles,
  Wand2,
  User,
  UserRound
} from "lucide-react";

// Fuente de verdad de la dirección vocal (Sincronía con el Córtex)
import { PERSONALITY_PERFECT_SETUPS, PersonalityType } from "../shared/vocal-director-map";

/**
 * VOCAL_GENDER_OPTIONS_COLLECTION: Definición de registros vocales industriales.
 */
const VOCAL_GENDER_OPTIONS_COLLECTION = [
  { valueIdentification: "Masculino", displayLabel: "HOMBRE", iconComponent: User },
  { valueIdentification: "Femenino", displayLabel: "MUJER", iconComponent: UserRound }
] as const;

/**
 * VOCAL_STYLE_OPTIONS_COLLECTION: Definición de matices emocionales.
 */
const VOCAL_STYLE_OPTIONS_COLLECTION = [
  { valueIdentification: "Calmado", descriptionContentText: "Suave y reflexivo" },
  { valueIdentification: "Energético", descriptionContentText: "Vibrante y motivador" },
  { valueIdentification: "Profesional", descriptionContentText: "Equilibrado y serio" },
  { valueIdentification: "Inspirador", descriptionContentText: "Crescendo narrativo" }
] as const;

/**
 * VOCAL_PACE_OPTIONS_COLLECTION: Definición de velocidades de elocución.
 */
const VOCAL_PACE_OPTIONS_COLLECTION = [
  { valueIdentification: "Lento", displayLabel: "PAUSADO" },
  { valueIdentification: "Moderado", displayLabel: "NATURAL" },
  { valueIdentification: "Rápido", displayLabel: "ÁGIL" }
] as const;

/**
 * AudioStudio: La terminal de calibración acústica de la forja.
 */
export function AudioStudio() {
  // Consumo del motor de formularios bajo el tipado estricto BSS
  const { control, watch, setValue } = useFormContext<PodcastCreationData>();

  /** 
   * [SINCRO V4.0 - RESOLUCIÓN TS2769]: 
   * Observamos descriptores industriales purificados para evitar colisiones de tipo.
   */
  const currentAgentPersonalityReference = watch("agentName") as PersonalityType;
  const currentVocalStyleSelectionMagnitude = watch("voiceStyleSelection");
  const currentVocalPaceSelectionMagnitude = watch("voicePaceSelection");

  /**
   * isAcousticResonancePerfectStatus: 
   * Misión: Validar si el ajuste actual coincide con la calibración ideal del Agente.
   * [RESOLUCIÓN TS2367]: Comparación de tipos escalares purificados.
   */
  const isAcousticResonancePerfectStatus = useMemo(() => {
    const perfectSetupDossier = PERSONALITY_PERFECT_SETUPS[currentAgentPersonalityReference];
    if (!perfectSetupDossier) return false;
    
    return (
      perfectSetupDossier.style === currentVocalStyleSelectionMagnitude && 
      perfectSetupDossier.pace === currentVocalPaceSelectionMagnitude
    );
  }, [currentAgentPersonalityReference, currentVocalStyleSelectionMagnitude, currentVocalPaceSelectionMagnitude]);

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto pt-2 pb-0 px-4 justify-start md:justify-center overflow-y-auto custom-scrollbar-hide animate-in fade-in duration-700 isolate">

      {/* I. HEADER: Identidad Visual del Estudio */}
      <header className="text-center mb-6 shrink-0 isolate">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none italic font-serif">
          Estudio de <span className="text-primary not-italic">Voz</span>
        </h1>

        <div className="flex justify-center mt-3 isolate">
          <AnimatePresence mode="wait">
            {isAcousticResonancePerfectStatus ? (
              <motion.div
                key="perfect-sync"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-xl isolate"
              >
                <Wand2 size={12} className="text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                  Calibración Óptima Sintonizada
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="custom-calibration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-4 py-1.5 opacity-40 grayscale isolate"
              >
                <Activity size={12} className="text-white" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
                  Ajuste Manual de Frecuencia
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* II. CONSOLA DE CONFIGURACIÓN TÁCTICA */}
      <div className="space-y-6 isolate">
        
        {/* FILA 1: REGISTRO (GÉNERO VOCAL) [RESOLUCIÓN TS2322] */}
        <FormField
          control={control}
          name="voiceGenderSelection"
          render={({ field }) => (
            <FormItem className="space-y-2.5 isolate">
              <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                <Volume2 size={14} className="text-primary" /> Registro Vocal
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  className="grid grid-cols-2 gap-3"
                >
                  {VOCAL_GENDER_OPTIONS_COLLECTION.map((optionItem) => (
                    <div key={optionItem.valueIdentification} className="relative isolate">
                      <RadioGroupItem value={optionItem.valueIdentification} id={`gender-${optionItem.valueIdentification}`} className="sr-only" />
                      <label 
                        htmlFor={`gender-${optionItem.valueIdentification}`} 
                        className={classNamesUtility(
                          "flex items-center justify-center gap-3 h-12 rounded-2xl cursor-pointer transition-all border-2 font-black text-[10px] tracking-widest",
                          field.value === optionItem.valueIdentification
                            ? "bg-primary border-primary text-white shadow-lg scale-[1.02]"
                            : "bg-white/[0.03] border-white/5 text-zinc-600 hover:border-white/10"
                        )}
                      >
                        <optionItem.iconComponent size={16} />
                        {optionItem.displayLabel}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* FILA 2: CADENCIA (VELOCIDAD) [RESOLUCIÓN TS2322] */}
        <FormField
          control={control}
          name="voicePaceSelection"
          render={({ field }) => (
            <FormItem className="space-y-2.5 isolate">
              <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                <Gauge size={14} className="text-primary" /> Cadencia Narrativa
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  className="grid grid-cols-3 gap-3"
                >
                  {VOCAL_PACE_OPTIONS_COLLECTION.map((optionItem) => (
                    <div key={optionItem.valueIdentification}>
                      <RadioGroupItem value={optionItem.valueIdentification} id={`pace-${optionItem.valueIdentification}`} className="sr-only" />
                      <label 
                        htmlFor={`pace-${optionItem.valueIdentification}`} 
                        className={classNamesUtility(
                          "flex items-center justify-center h-12 rounded-2xl cursor-pointer transition-all border-2 font-black text-[9px] tracking-tighter",
                          field.value === optionItem.valueIdentification
                            ? "bg-primary border-primary text-white shadow-lg"
                            : "bg-white/[0.03] border-white/5 text-zinc-600 hover:border-white/10"
                        )}
                      >
                        {optionItem.displayLabel}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* SECCIÓN 3: TONO EMOCIONAL (MATRIZ DE RESONANCIA) [RESOLUCIÓN TS2322] */}
        <div className="bg-[#0a0a0a] backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden isolate">
          <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none z-0" />
          
          <FormField
            control={control}
            name="voiceStyleSelection"
            render={({ field }) => (
              <FormItem className="space-y-5 relative z-10 isolate">
                <div className="flex justify-between items-center px-1">
                  <FormLabel className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                    <Sparkles size={14} className="animate-pulse" /> Tono Emocional IA
                  </FormLabel>
                </div>
                
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      nicepodLog(`🎙️ [Audio-Studio] Cambio de Tono detectado: ${value}`);
                    }}
                    value={field.value || undefined}
                    className="grid grid-cols-2 gap-3"
                  >
                    {VOCAL_STYLE_OPTIONS_COLLECTION.map((optionItem) => (
                      <div key={optionItem.valueIdentification}>
                        <RadioGroupItem value={optionItem.valueIdentification} id={`style-${optionItem.valueIdentification}`} className="sr-only" />
                        <label 
                          htmlFor={`style-${optionItem.valueIdentification}`} 
                          className={classNamesUtility(
                            "flex flex-col p-4 h-24 justify-center rounded-[1.5rem] cursor-pointer transition-all border-2 text-left isolate",
                            field.value === optionItem.valueIdentification
                              ? "bg-white text-zinc-950 border-white shadow-2xl scale-[1.03]"
                              : "bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/[0.04]"
                          )}
                        >
                          <span className="font-black text-[10px] uppercase tracking-tight mb-1.5">
                            {optionItem.valueIdentification}
                          </span>
                          <span className={classNamesUtility(
                              "text-[8px] font-bold uppercase tracking-widest leading-tight line-clamp-2",
                              field.value === optionItem.valueIdentification 
                                ? "text-zinc-950/40" 
                                : "text-zinc-700"
                          )}>
                              {optionItem.descriptionContentText}
                          </span>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ESPACIADOR TÁCTICO */}
      <div className="h-6 shrink-0" />
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Build Shield Sovereignty: Resolución de TS2769 y TS2322 mediante el mapeo 
 *    absoluto con 'voiceStyleSelection' y 'voicePaceSelection' del esquema V12.0.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total. 'opt' -> 'optionItem', 
 *    'desc' -> 'descriptionContentText'.
 * 3. Hardware Hygiene: El uso de 'RadioGroup' con valores controlados y fallback a 
 *    'undefined' asegura la integridad del estado en el Hilo Principal (MTI).
 */