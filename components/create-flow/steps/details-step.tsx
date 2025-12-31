// components/create-flow/steps/details-step.tsx
// VERSIÓN: 1.0 (Modular Standard - Compact Technical Config)

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const durationOptions = [
  { value: "Corta (3-5 min)", label: "Corta", desc: "~600 palabras" },
  { value: "Media (6-9 min)", label: "Media", desc: "~1200 palabras" },
  { value: "Larga (10-14 min)", label: "Larga", desc: "~2000 palabras" },
];

const depthOptions = [
  { value: "Superficial", label: "Básico", desc: "Resumen ejecutivo" },
  { value: "Intermedia", label: "Medio", desc: "Análisis con ejemplos" },
  { value: "Profunda", label: "Profundo", desc: "Visión exhaustiva" },
];

export function DetailsStep() {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full w-full justify-center animate-in fade-in duration-500 px-4 pb-6 overflow-y-auto custom-scrollbar-hide">
      
      <div className="text-center mb-8 flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-black tracking-tight">Configuración</h2>
        <p className="text-xs text-muted-foreground mt-1">Define la extensión y profundidad.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        {/* DURACIÓN */}
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/60 text-center block">Duración Estimada</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid gap-2">
                  {durationOptions.map((opt) => (
                    <label key={opt.value} className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all cursor-pointer",
                      field.value === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-border/40 bg-white/5 hover:bg-white/10"
                    )}>
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <span className="text-sm font-bold">{opt.label}</span>
                      <span className="text-[10px] opacity-40">{opt.desc}</span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* PROFUNDIDAD */}
        <FormField
          control={control}
          name="narrativeDepth"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/60 text-center block">Nivel de Análisis</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid gap-2">
                  {depthOptions.map((opt) => (
                    <label key={opt.value} className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all cursor-pointer",
                      field.value === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-border/40 bg-white/5 hover:bg-white/10"
                    )}>
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      <span className="text-sm font-bold">{opt.label}</span>
                      <span className="text-[10px] opacity-40">{opt.desc}</span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}