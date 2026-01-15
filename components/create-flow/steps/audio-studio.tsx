// components/create-flow/steps/audio-studio.tsx
// VERSIÓN: 2.4 (Aurora Studio - Professional Alignment & Voice Agility Fix)

"use client";

import { cn } from "@/lib/utils";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { AnimatePresence, motion } from "framer-motion";
import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Activity,
  Gauge,
  Mic2,
  Sparkles,
  Volume2,
  Wand2,
  Zap
} from "lucide-react";

// Importamos la fuente de verdad de la dirección vocal
import { PERSONALITY_PERFECT_SETUPS, PersonalityType } from "../shared/vocal-director-map";

const GENDER_OPTS = [
  { value: "Masculino", label: "HOMBRE", icon: Mic2 },
  { value: "Femenino", label: "MUJER", icon: Mic2 }
];

const STYLE_OPTS = [
  { value: "Calmado", desc: "Textura suave y reflexiva" },
  { value: "Energético", desc: "Vibrante y motivador" },
  { value: "Profesional", desc: "Equilibrado y fidedigno" },
  { value: "Inspirador", desc: "Crescendo emocional" }
];

const PACE_OPTS = [
  { value: "Lento", label: "PAUSADO" },
  { value: "Moderado", label: "NATURAL" },
  { value: "Rápido", label: "ÁGIL" }
];

export function AudioStudio() {
  const { control, watch } = useFormContext<PodcastCreationData>();

  // Monitoreamos la performance para el feedback de resonancia
  const currentAgent = watch("agentName") as PersonalityType;
  const currentStyle = watch("voiceStyle");
  const currentPace = watch("voicePace");

  // Validación de configuración áurea
  const isResonancePerfect = (() => {
    const perfect = PERSONALITY_PERFECT_SETUPS[currentAgent];
    if (!perfect) return false;
    return perfect.style === currentStyle && perfect.pace === currentPace;
  })();

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto py-4 md:py-8 px-4 md:px-6 justify-center overflow-y-auto no-scrollbar animate-in fade-in duration-700">

      {/* 1. HEADER: Identidad NicePod */}
      <header className="text-center mb-6 md:mb-10 shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block mb-3"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
            Audio Station v3.0
          </span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none">
          Diseña la <span className="text-primary italic">Voz</span>
        </h1>

        <div className="flex justify-center mt-4">
          <AnimatePresence mode="wait">
            {isResonancePerfect ? (
              <motion.div
                key="perfect"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
              >
                <Wand2 size={14} className="text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
                  Resonancia Calibrada para {currentAgent}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="custom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10"
              >
                <Activity size={14} className="text-white/40" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                  Ajuste Manual Personalizado
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 2. PANEL CENTRAL DE CONFIGURACIÓN */}
      <div className="grid gap-6 md:gap-8">

        {/* SECCIÓN: GÉNERO Y CADENCIA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Registro (Género) */}
          <FormField
            control={control}
            name="voiceGender"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Volume2 size={14} /> Registro Vocal
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-3"
                  >
                    {GENDER_OPTS.map(opt => (
                      <div key={opt.value}>
                        <RadioGroupItem value={opt.value} id={`g-${opt.value}`} className="sr-only" />
                        <label htmlFor={`g-${opt.value}`} className={cn(
                          "flex flex-col items-center justify-center h-16 md:h-20 rounded-2xl cursor-pointer transition-all border-2",
                          field.value === opt.value
                            ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-[1.02]"
                            : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5 hover:border-white/20"
                        )}>
                          <opt.icon size={16} className="mb-2 opacity-50" />
                          <span className="font-black text-xs tracking-widest">{opt.label}</span>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Cadencia (Velocidad) */}
          <FormField
            control={control}
            name="voicePace"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Gauge size={14} /> Cadencia
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col gap-2.5"
                  >
                    {PACE_OPTS.map(opt => (
                      <div key={opt.value}>
                        <RadioGroupItem value={opt.value} id={`p-${opt.value}`} className="sr-only" />
                        <label htmlFor={`p-${opt.value}`} className={cn(
                          "flex items-center justify-between px-6 h-12 md:h-14 rounded-2xl cursor-pointer transition-all border-2",
                          field.value === opt.value
                            ? "bg-primary border-primary text-white shadow-lg"
                            : "bg-black/20 border-white/5 text-white/30 hover:border-white/10"
                        )}>
                          <span className="font-black text-[11px] tracking-widest">{opt.label}</span>
                          {opt.value === 'Rápido' && <Zap size={12} className={cn(field.value === opt.value ? "text-yellow-300" : "text-white/20")} />}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* SECCIÓN: TONO EMOCIONAL (GRID DE PERSONALIDADES) */}
        <div className="relative">
          <div className={cn(
            "absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.8rem] blur opacity-0 transition-opacity duration-1000",
            isResonancePerfect && "opacity-20"
          )} />

          <div className="bg-black/40 backdrop-blur-3xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <FormField
              control={control}
              name="voiceStyle"
              render={({ field }) => (
                <FormItem className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <FormLabel className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Sparkles size={14} /> Tono Emocional
                    </FormLabel>
                    <div className="text-[9px] font-bold text-white/20 tracking-tighter uppercase">
                      Selección Actoral
                    </div>
                  </div>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {STYLE_OPTS.map(opt => (
                        <div key={opt.value}>
                          <RadioGroupItem value={opt.value} id={`s-${opt.value}`} className="sr-only" />
                          <label htmlFor={`s-${opt.value}`} className={cn(
                            "flex flex-col p-5 rounded-[1.5rem] cursor-pointer transition-all border-2 text-left",
                            field.value === opt.value
                              ? "bg-white text-black border-white shadow-xl scale-[1.02]"
                              : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10"
                          )}>
                            <span className="font-black text-xs uppercase tracking-tight mb-1">{opt.value}</span>
                            <span className={cn(
                              "text-[10px] font-medium leading-tight",
                              field.value === opt.value ? "text-black/60" : "text-white/20"
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
      </div>

      {/* 3. FOOTER: Status Engine */}
      <footer className="mt-8 md:mt-12 shrink-0 flex flex-col items-center gap-3">
        <div className="h-[1px] w-12 bg-white/10" />
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
          NicePod High-Fidelity Voice Mesh
        </p>
      </footer>
    </div>
  );
}