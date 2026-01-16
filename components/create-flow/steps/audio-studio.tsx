// components/create-flow/steps/audio-studio.tsx
// VERSIÓN: 2.6 (Ultimate Mobile Polish - Zero Scroll & High-Contrast Sync)

"use client";

import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";

import { FormField, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Volume2,
  Gauge,
  Activity,
  Sparkles,
  Wand2,
  Mic2,
  User,
  UserRound
} from "lucide-react";

// Fuente de verdad de la dirección vocal
import { PERSONALITY_PERFECT_SETUPS, PersonalityType } from "../shared/vocal-director-map";

const GENDER_OPTS = [
  { value: "Masculino", label: "HOMBRE", icon: User },
  { value: "Femenino", label: "MUJER", icon: UserRound }
];

const STYLE_OPTS = [
  { value: "Calmado", desc: "Suave y reflexivo" },
  { value: "Energético", desc: "Vibrante y motivador" },
  { value: "Profesional", desc: "Equilibrado y serio" },
  { value: "Inspirador", desc: "Crescendo reflexivo" }
];

const PACE_OPTS = [
  { value: "Lento", label: "PAUSADO" },
  { value: "Moderado", label: "NATURAL" },
  { value: "Rápido", label: "ÁGIL" }
];

export function AudioStudio() {
  const { control, watch } = useFormContext<PodcastCreationData>();

  const currentAgent = watch("agentName") as PersonalityType;
  const currentStyle = watch("voiceStyle");
  const currentPace = watch("voicePace");

  const isResonancePerfect = (() => {
    const perfect = PERSONALITY_PERFECT_SETUPS[currentAgent];
    if (!perfect) return false;
    return perfect.style === currentStyle && perfect.pace === currentPace;
  })();

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto pt-2 pb-0 px-3 justify-start md:justify-center overflow-y-auto no-scrollbar animate-in fade-in duration-700">

      {/* 1. HEADER COMPACTO: Reducción de márgenes para ganar espacio */}
      <header className="text-center mb-5 shrink-0">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-none">
          Estudio de <span className="text-primary italic">Voz</span>
        </h1>

        <div className="flex justify-center mt-2.5">
          <AnimatePresence mode="wait">
            {isResonancePerfect ? (
              <motion.div
                key="perfect"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-sm"
              >
                <Wand2 size={10} className="text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                  Calibración Óptima
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="custom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1 opacity-30 dark:opacity-40"
              >
                <Activity size={10} className="text-zinc-500 dark:text-white" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-white">
                  Ajuste Manual
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 2. CONSOLA DE CONFIGURACIÓN */}
      <div className="space-y-4">
        
        {/* FILA 1: REGISTRO (GÉNERO) */}
        <FormField
          control={control}
          name="voiceGender"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <Volume2 size={12} className="text-primary" /> Registro Vocal
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-2"
                >
                  {GENDER_OPTS.map(opt => (
                    <div key={opt.value} className="relative">
                      <RadioGroupItem value={opt.value} id={`g-${opt.value}`} className="sr-only" />
                      <label htmlFor={`g-${opt.value}`} className={cn(
                        "flex items-center justify-center gap-2 h-11 rounded-xl cursor-pointer transition-all border font-bold text-[10px] tracking-widest",
                        field.value === opt.value
                          ? "bg-primary border-primary text-white shadow-md"
                          : "bg-zinc-100/80 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/40 hover:bg-zinc-200/50 dark:hover:bg-white/10"
                      )}>
                        <opt.icon size={14} />
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* FILA 2: CADENCIA (VELOCIDAD) */}
        <FormField
          control={control}
          name="voicePace"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <Gauge size={12} className="text-primary" /> Cadencia
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-3 gap-2"
                >
                  {PACE_OPTS.map(opt => (
                    <div key={opt.value}>
                      <RadioGroupItem value={opt.value} id={`p-${opt.value}`} className="sr-only" />
                      <label htmlFor={`p-${opt.value}`} className={cn(
                        "flex items-center justify-center h-11 rounded-xl cursor-pointer transition-all border font-black text-[9px] tracking-tighter",
                        field.value === opt.value
                          ? "bg-primary border-primary text-white shadow-md"
                          : "bg-zinc-100/80 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/30"
                      )}>
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* SECCIÓN 3: TONO EMOCIONAL (GRID 2x2) */}
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-4 rounded-[2rem] border border-white/50 dark:border-white/5 shadow-xl relative overflow-hidden">
          <FormField
            control={control}
            name="voiceStyle"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <FormLabel className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles size={12} /> Tono Emocional
                  </FormLabel>
                </div>
                
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-2"
                  >
                    {STYLE_OPTS.map(opt => (
                      <div key={opt.value}>
                        <RadioGroupItem value={opt.value} id={`s-${opt.value}`} className="sr-only" />
                        <label htmlFor={`s-${opt.value}`} className={cn(
                          "flex flex-col p-3 h-20 justify-center rounded-2xl cursor-pointer transition-all border text-left",
                          field.value === opt.value
                            ? "bg-white text-zinc-900 border-white shadow-lg scale-[1.02]"
                            : "bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/5 text-zinc-600 dark:text-white/40"
                        )}>
                          <span className="font-black text-[10px] uppercase tracking-tight mb-1">{opt.value}</span>
                          <span className={cn(
                              "text-[8px] font-medium leading-none line-clamp-2",
                              field.value === opt.value 
                                ? "text-zinc-900/60" 
                                : "text-zinc-500 dark:text-white/20"
                          )}>
                              {opt.desc}
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

      {/* FOOTER ELIMINADO PARA OPTIMIZAR ESPACIO VERTICAL */}
    </div>
  );
}