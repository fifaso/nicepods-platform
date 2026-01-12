// components/create-flow/steps/tone-selection-step.tsx
// VERSIÓN: 3.3 (Aurora Master - Logic Fix & UI Cleanup)

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
import { cn } from "@/lib/utils";

import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCreationContext } from "../shared/context";

// [SISTEMA]: Importación corregida a la ruta relativa del frontend
import { PERSONALITY_PERFECT_SETUPS, PersonalityType } from "../shared/vocal-director-map";

/**
 * TONE_OPTIONS: Definición de personalidades con su semántica visual.
 */
const TONE_OPTIONS = [
  { value: "narrador", label: "El Narrador", desc: "Historias envolventes", icon: Mic2, color: "bg-indigo-500/10 text-indigo-400" },
  { value: "esceptico", label: "El Curioso", desc: "Analítico y agudo", icon: Search, color: "bg-emerald-500/10 text-emerald-400" },
  { value: "mentor", label: "El Sabio", desc: "Autoridad y consejo", icon: Sparkles, color: "bg-amber-500/10 text-amber-400" },
  { value: "amigo", label: "El Amigo", desc: "Cercano y casual", icon: Coffee, color: "bg-rose-500/10 text-rose-400" },
  { value: "rebelde", label: "El Rebelde", desc: "Disruptivo y audaz", icon: Zap, color: "bg-yellow-500/10 text-yellow-400" },
  { value: "minimalista", label: "Esencial", desc: "Sin rodeos", icon: Feather, color: "bg-slate-500/10 text-slate-400" },
];

export function ToneSelectionStep() {
  const { setValue, watch } = useFormContext<PodcastCreationData>();

  // [FIJO]: Usamos getMasterPath y transitionTo para una navegación segura y tipada
  const { transitionTo, getMasterPath } = useCreationContext();
  const selectedTone = watch('selectedTone');

  /**
   * handleSelect
   * Sincroniza la personalidad, auto-calibra el Studio y dispara el avance de flujo.
   */
  const handleSelect = (val: string) => {
    const personality = val as PersonalityType;
    const perfectSetup = PERSONALITY_PERFECT_SETUPS[personality];

    // 1. Sincronización de Identidad
    setValue('selectedTone', val, { shouldValidate: true, shouldDirty: true });
    setValue('agentName', val, { shouldValidate: true, shouldDirty: true });

    // 2. Calibración Automática del Studio
    if (perfectSetup) {
      setValue('voiceStyle', perfectSetup.style, { shouldValidate: true });
      setValue('voicePace', perfectSetup.pace, { shouldValidate: true });
    }

    // 3. [LÓGICA DE NAVEGACIÓN ROBUSTA]
    // Calculamos el siguiente paso basándonos en el mapa de ruta actual
    const path = getMasterPath();
    const currentIndex = path.indexOf('TONE_SELECTION');

    if (currentIndex !== -1 && (currentIndex + 1) < path.length) {
      const nextState = path[currentIndex + 1];
      // Pequeño delay para feedback visual del botón seleccionado
      setTimeout(() => transitionTo(nextState), 300);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-lg md:max-w-4xl mx-auto py-4 px-2 md:px-6 justify-center overflow-hidden">

      {/* HEADER: Identidad Aurora */}
      <header className="text-center mb-6 md:mb-10 pt-2 shrink-0">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-none"
        >
          Personalidad
        </motion.h1>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mt-3 flex items-center justify-center gap-2">
          <Brain size={14} className="text-primary" />
          Define el ADN interpretativo de tu IA
        </p>
      </header>

      {/* STACK DE SELECCIÓN (DUAL LAYOUT) */}
      <div className="flex-1 flex flex-col justify-center">
        <FormField
          name="selectedTone"
          render={() => (
            <FormItem className="space-y-0">
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  {TONE_OPTIONS.map((opt, index) => {
                    const Icon = opt.icon;
                    const isSelected = selectedTone === opt.value;

                    return (
                      <motion.button
                        key={opt.value}
                        type="button"
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          "relative w-full flex items-center p-3.5 md:p-5 rounded-2xl border transition-all duration-300",
                          "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md overflow-hidden",
                          isSelected
                            ? "border-primary ring-1 ring-primary/30 shadow-xl shadow-primary/10"
                            : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 shadow-sm"
                        )}
                      >
                        <div className="flex items-center w-full gap-4 md:gap-6 relative z-10">
                          <div className={cn(
                            "p-2.5 md:p-3.5 rounded-xl transition-all duration-500 shadow-inner",
                            isSelected ? "bg-primary text-white scale-110 shadow-lg" : opt.color
                          )}>
                            <Icon size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className={cn(
                                "font-black text-sm md:text-base uppercase tracking-tight transition-colors leading-none",
                                isSelected ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                              )}>
                                {opt.label}
                              </h3>
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center gap-1 text-[8px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full"
                                >
                                  <Wand2 size={8} /> CALIBRADO
                                </motion.div>
                              )}
                            </div>
                            <p className="text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500 font-medium leading-tight mt-1 truncate">
                              {opt.desc}
                            </p>
                          </div>

                          <ChevronRight
                            className={cn(
                              "transition-all duration-300",
                              isSelected ? "text-primary opacity-100 translate-x-0" : "text-zinc-300 dark:text-zinc-700 opacity-0 -translate-x-2"
                            )}
                            size={20}
                          />
                        </div>

                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/[0.04] pointer-events-none" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage className="text-center mt-6 text-[10px] font-bold uppercase tracking-widest text-destructive" />
            </FormItem>
          )}
        />
      </div>

      {/* EQUILIBRIO ÓPTICO */}
      <div className="h-6 md:h-12 shrink-0" />
    </div>
  );
}