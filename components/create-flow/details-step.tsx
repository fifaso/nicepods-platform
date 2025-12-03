// components/create-flow/details-step.tsx
// VERSIÓN FINAL: Grid de 2 columnas, sin agentes, estilo visual unificado.

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const durationOptions = [
  { value: "Corta", label: "Corta", description: "1-2 min" },
  { value: "Media", label: "Media", description: "3-5 min" },
  { value: "Larga", label: "Larga", description: "5-7 min" },
];

const depthOptions = [
  { value: "Superficial", label: "Básico", description: "Intro clara." },
  { value: "Intermedia", label: "Medio", description: "Matices." },
  { value: "Profunda", label: "Profundo", description: "Análisis." },
];

export function DetailsStep() {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full w-full justify-center animate-fade-in px-2 md:px-6 overflow-y-auto scrollbar-hide pb-2">
      
      {/* CABECERA */}
      <div className="text-center mb-6 flex-shrink-0 w-full">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Configuración
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Define la estructura técnica del episodio.
        </p>
      </div>
      
      {/* GRID 2 COLUMNAS (Centrado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
        
        {/* COLUMNA 1: DURACIÓN */}
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xs font-bold text-muted-foreground text-center block uppercase tracking-widest">
                Duración
              </FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-2">
                  {durationOptions.map((option) => (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`dur-${option.value}`} className="sr-only" />
                      <label
                        htmlFor={`dur-${option.value}`}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border",
                          // ESTILO ADAPTATIVO (Light/Dark)
                          field.value === option.value
                            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/50 shadow-sm"
                            : "bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10"
                        )}
                      >
                        <span className={cn("text-sm font-bold", field.value === option.value ? "text-primary" : "text-foreground")}>
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {option.description}
                        </span>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-center text-xs" />
            </FormItem>
          )}
        />

        {/* COLUMNA 2: PROFUNDIDAD */}
        <FormField
          control={control}
          name="narrativeDepth"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xs font-bold text-muted-foreground text-center block uppercase tracking-widest">
                Profundidad
              </FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-2">
                  {depthOptions.map((option) => (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`depth-${option.value}`} className="sr-only" />
                      <label
                        htmlFor={`depth-${option.value}`}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border",
                          field.value === option.value
                            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/50 shadow-sm"
                            : "bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10"
                        )}
                      >
                        <span className={cn("text-sm font-bold", field.value === option.value ? "text-primary" : "text-foreground")}>
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {option.description}
                        </span>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-center text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}