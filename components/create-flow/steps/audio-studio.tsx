// components/create-flow/steps/audio-studio.tsx
// VERSIÓN: 2.5 (Ultimate Mobile Optimization - Professional Voice Console)

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
  CheckCircle2,
  Zap,
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
    <div className="flex flex-col h-full w-full max-w-md mx-auto py-2 px-3 justify-start md:justify-center overflow-y-auto no-scrollbar animate-in fade-in duration-700">

      {/* 1. HEADER COMPACTO */}
      <header className="text-center mb-6 shrink-0">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none">
          Estudio de <span className="text-primary italic">Voz</span>
        </h1>

        <div className="flex justify-center mt-3">
          <AnimatePresence mode="wait">
            {isResonancePerfect ? (
              <motion.div
                key="perfect"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
              >
                <Wand2 size={10} className="text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                  Configuración Óptima
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="custom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1 opacity-40"
              >
                <Activity size={10} className="text-white" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">
                  Ajuste Manual
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 2. CONSOLA DE CONFIGURACIÓN */}
      <div className="space-y-5">
        
        {/* FILA 1: REGISTRO (GÉNERO) */}
        <FormField
          control={control}
          name="voiceGender"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
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
                          ? "bg-primary border-primary text-white shadow-lg"
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
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
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
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
                          ? "bg-primary border-primary text-white shadow-lg"
                          : "bg-white/5 border-white/10 text-white/30"
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
        <div className="bg-black/40 backdrop-blur-3xl p-5 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
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
                            ? "bg-white text-black border-white shadow-xl scale-[1.02]"
                            : "bg-white/5 border-white/5 text-white/40"
                        )}>
                          <span className="font-black text-[10px] uppercase tracking-tight mb-1">{opt.value}</span>
                          <span className={cn(
                              "text-[8px] font-medium leading-none line-clamp-2",
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

      {/* FOOTER: Valor Percibido */}
      <footer className="mt-6 shrink-0 flex flex-col items-center opacity-20">
        <div className="h-[1px] w-8 bg-white/50 mb-2" />
        <p className="text-[8px] font-black text-white uppercase tracking-[0.4em]">
          Engine v3.0
        </p>
      </footer>
    </div>
  );
}