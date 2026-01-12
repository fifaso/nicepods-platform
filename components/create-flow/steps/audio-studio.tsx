// components/create-flow/steps/audio-studio.tsx
// VERSIÓN: 2.3 (Aurora Studio - Resonance Validation & Smart Sync)

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
  CheckCircle2
} from "lucide-react";

// [SISTEMA]: Importamos la fuente de verdad de la dirección vocal
import { PERSONALITY_PERFECT_SETUPS, PersonalityType } from "../shared/vocal-director-map";

const GENDER_OPTS = [
  { value: "Masculino", label: "HOMBRE" },
  { value: "Femenino", label: "MUJER" }
];

const STYLE_OPTS = [
  { value: "Calmado" },
  { value: "Energético" },
  { value: "Profesional" },
  { value: "Inspirador" }
];

const PACE_OPTS = [
  { value: "Lento" },
  { value: "Moderado" },
  { value: "Rápido" }
];

export function AudioStudio() {
  const { control, watch } = useFormContext<PodcastCreationData>();

  // OBSERVADORES: Monitoreamos la tríada de la performance
  const currentAgent = watch("agentName") as PersonalityType;
  const currentStyle = watch("voiceStyle");
  const currentPace = watch("voicePace");

  /**
   * isResonancePerfect
   * Lógica de validación cruzada con el vocal-director-map.
   */
  const isResonancePerfect = (() => {
    const perfect = PERSONALITY_PERFECT_SETUPS[currentAgent];
    if (!perfect) return false;
    return perfect.style === currentStyle && perfect.pace === currentPace;
  })();

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto py-2 px-4 justify-center overflow-hidden animate-in fade-in duration-700">

      {/* HEADER: Identidad NicePod con Feedback de Resonancia */}
      <header className="text-center mb-8 shrink-0 relative">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none"
        >
          Diseña la <span className="text-primary italic">Voz</span>
        </motion.h1>

        <div className="flex justify-center mt-3">
          <AnimatePresence mode="wait">
            {isResonancePerfect ? (
              <motion.div
                key="perfect"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.2)]"
              >
                <Wand2 size={12} className="text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Resonancia Calibrada
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="custom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-4 py-1.5 opacity-40"
              >
                <Activity size={12} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  Ajuste Personalizado
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* PANEL DE ESTACIÓN VIRTUAL */}
      <div className="flex flex-col gap-6 justify-center">

        {/* SECCIÓN 1: CONFIGURACIÓN BASE (GÉNERO & RITMO) */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="voiceGender"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Volume2 size={12} /> Registro
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col gap-2"
                  >
                    {GENDER_OPTS.map(opt => (
                      <div key={opt.value}>
                        <RadioGroupItem value={opt.value} id={`g-${opt.value}`} className="sr-only" />
                        <label htmlFor={`g-${opt.value}`} className={cn(
                          "flex items-center justify-center h-12 rounded-xl cursor-pointer transition-all border font-black text-[10px] tracking-widest",
                          field.value === opt.value
                            ? "bg-primary border-primary text-white shadow-lg"
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
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

          <FormField
            control={control}
            name="voicePace"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Gauge size={12} /> Cadencia
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col gap-2"
                  >
                    {PACE_OPTS.map(opt => (
                      <div key={opt.value}>
                        <RadioGroupItem value={opt.value} id={`p-${opt.value}`} className="sr-only" />
                        <label htmlFor={`p-${opt.value}`} className={cn(
                          "flex items-center justify-center h-12 rounded-xl cursor-pointer transition-all border font-black text-[10px] tracking-widest",
                          field.value === opt.value
                            ? "bg-primary border-primary text-white shadow-lg"
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        )}>
                          {opt.value.toUpperCase()}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* SECCIÓN 2: PERSONALIDAD (TONO EMOCIONAL) */}
        <div className="bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          {/* Brillo de fondo cuando la resonancia es perfecta */}
          <div className={cn(
            "absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-1000",
            isResonancePerfect && "opacity-100"
          )} />

          <FormField
            control={control}
            name="voiceStyle"
            render={({ field }) => (
              <FormItem className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles size={12} /> Tono Emocional
                  </FormLabel>
                  {isResonancePerfect && (
                    <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                      <CheckCircle2 size={10} /> Óptimo para {currentAgent}
                    </div>
                  )}
                </div>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-3"
                  >
                    {STYLE_OPTS.map(opt => (
                      <div key={opt.value}>
                        <RadioGroupItem value={opt.value} id={`s-${opt.value}`} className="sr-only" />
                        <label htmlFor={`s-${opt.value}`} className={cn(
                          "flex items-center justify-center h-14 rounded-2xl cursor-pointer transition-all border font-bold text-xs uppercase tracking-tight",
                          field.value === opt.value
                            ? "bg-primary border-primary text-white shadow-lg scale-[1.02]"
                            : "bg-black/40 border-white/5 text-white/30 hover:bg-black/60"
                        )}>
                          {opt.value}
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

      {/* FOOTER: Valor Percibido */}
      <footer className="mt-8 shrink-0 flex flex-col items-center gap-2">
        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
          NicePod Audio Engine v3.0
        </p>
      </footer>
    </div>
  );
}