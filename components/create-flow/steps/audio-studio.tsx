// components/create-flow/steps/audio-studio.tsx
// VERSIÓN: 2.0 (Aurora Studio - High Density & Zero Scroll UI)

"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { FormField, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic2, Sparkles, Volume2, Gauge } from "lucide-react";

const GENDER_OPTS = [{ value: "Masculino", label: "Hombre" }, { value: "Femenino", label: "Mujer" }];
const STYLE_OPTS = [{ value: "Calmado" }, { value: "Energético" }, { value: "Profesional" }, { value: "Inspirador" }];
const PACE_OPTS = [{ value: "Lento" }, { value: "Moderado" }, { value: "Rápido" }];

export function AudioStudio() {
  const { control, watch } = useFormContext<PodcastCreationData>();
  const speakingRate = watch('speakingRate');

  return (
    <div className="flex flex-col h-full w-full max-w-xl mx-auto py-2 px-4 justify-center overflow-hidden">
      
      {/* HEADER AURORA */}
      <header className="text-center mb-8 shrink-0">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none"
        >
          Diseña la <span className="text-primary italic">Voz</span>
        </motion.h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2 flex items-center justify-center gap-2">
          <Mic2 size={12} className="text-primary" />
          Personaliza el alma sonora de tu IA
        </p>
      </header>

      {/* PANEL DE CONTROL (ALTA DENSIDAD) */}
      <div className="flex-1 flex flex-col gap-6 justify-center">
        
        {/* FILA 1: GÉNERO Y RITMO (RECTANGULARES) */}
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="voiceGender"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[9px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2">
                    <Volume2 size={10}/> Género
                  </FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2">
                      {GENDER_OPTS.map(opt => (
                        <div key={opt.value} className="flex-1">
                          <RadioGroupItem value={opt.value} id={`g-${opt.value}`} className="sr-only" />
                          <label htmlFor={`g-${opt.value}`} className={cn(
                            "flex items-center justify-center h-12 rounded-xl cursor-pointer transition-all border font-bold text-xs uppercase tracking-tight",
                            field.value === opt.value ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
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
                <FormItem className="space-y-2">
                  <FormLabel className="text-[9px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2">
                    <Gauge size={10}/> Ritmo
                  </FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2">
                      {PACE_OPTS.map(opt => (
                        <div key={opt.value} className="flex-1">
                          <RadioGroupItem value={opt.value} id={`p-${opt.value}`} className="sr-only" />
                          <label htmlFor={`p-${opt.value}`} className={cn(
                            "flex items-center justify-center h-12 rounded-xl cursor-pointer transition-all border font-bold text-[10px] uppercase",
                            field.value === opt.value ? "bg-primary border-primary text-white shadow-lg" : "bg-white/5 border-white/10 text-white/40"
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

        {/* FILA 2: ESTILO EMOCIONAL */}
        <FormField
          control={control}
          name="voiceStyle"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[9px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={10}/> Tono Emocional
              </FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-2">
                  {STYLE_OPTS.map(opt => (
                    <div key={opt.value}>
                      <RadioGroupItem value={opt.value} id={`s-${opt.value}`} className="sr-only" />
                      <label htmlFor={`s-${opt.value}`} className={cn(
                        "flex items-center justify-center h-12 rounded-xl cursor-pointer transition-all border font-bold text-xs uppercase tracking-tight",
                        field.value === opt.value ? "bg-primary border-primary text-white shadow-lg" : "bg-white/5 border-white/10 text-white/40"
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

        {/* FILA 3: SLIDER DE VELOCIDAD EXACTA */}
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner">
            <FormField
              control={control}
              name="speakingRate"
              render={({ field }) => (
                <FormItem className="space-y-4">
                   <div className="flex justify-between items-center">
                      <FormLabel className="text-[9px] font-black text-white/40 uppercase tracking-widest">Velocidad de Habla</FormLabel>
                      <Badge variant="outline" className="font-mono text-primary border-primary/20 bg-primary/5">{speakingRate?.toFixed(2)}x</Badge>
                   </div>
                  <FormControl>
                    <Slider min={0.75} max={1.25} step={0.05} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} className="py-2" />
                  </FormControl>
                  <div className="flex justify-between text-[9px] font-bold text-white/20 uppercase tracking-tighter">
                      <span>Reflexivo</span>
                      <span>Natural</span>
                      <span>Dinámico</span>
                  </div>
                </FormItem>
              )}
            />
        </div>
      </div>

      {/* EQUILIBRIO ÓPTICO */}
      <div className="h-10 shrink-0" />
    </div>
  );
}