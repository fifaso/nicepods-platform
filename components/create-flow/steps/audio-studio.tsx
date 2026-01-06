// components/create-flow/steps/audio-studio.tsx
// VERSIÓN: 2.2 (Aurora Master Studio - Simplified & High Density UI)

"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";

import { FormField, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic2, Sparkles, Volume2, Gauge, Activity } from "lucide-react";

/**
 * CONFIGURACIÓN DE PARÁMETROS SONOROS
 */
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
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto py-2 px-4 justify-center overflow-hidden animate-in fade-in duration-700">
      
      {/* HEADER: Identidad NicePod */}
      <header className="text-center mb-10 shrink-0">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none"
        >
          Diseña la <span className="text-primary italic">Voz</span>
        </motion.h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-3 flex items-center justify-center gap-2">
          <Activity size={14} className="text-primary animate-pulse" />
          CALIBRANDO EL ALMA SONORA
        </p>
      </header>

      {/* PANEL DE ESTACIÓN VIRTUAL */}
      <div className="flex flex-col gap-8 justify-center">
        
        {/* SECCIÓN 1: CONFIGURACIÓN BASE (GÉNERO & RITMO) */}
        <div className="grid grid-cols-2 gap-6">
            <FormField
              control={control}
              name="voiceGender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Volume2 size={12}/> Género
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
                              ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.3)]" 
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
                  <FormLabel className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Gauge size={12}/> Ritmo
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
                              ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.3)]" 
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
        <div className="bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <FormField
              control={control}
              name="voiceStyle"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center justify-center gap-2 mb-2">
                    <Sparkles size={12}/> Tono Emocional
                  </FormLabel>
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
                              ? "bg-primary border-primary text-white shadow-lg" 
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

      {/* FOOTER: Balance visual final */}
      <div className="h-12 shrink-0" />
    </div>
  );
}