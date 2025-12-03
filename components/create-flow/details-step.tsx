// components/create-flow/details-step.tsx
// VERSIÓN FINAL PRO: Duraciones ampliadas, cálculo de palabras y descripciones ricas.

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// [MEJORA ESTRATÉGICA]: Nuevas duraciones con cálculo de palabras (Base 140 wpm)
// El 'value' incluye el tiempo explícito para que la IA lo entienda sin cambios en backend.
const durationOptions = [
  { 
    value: "Corta (3-5 min)", 
    label: "3-5 min", 
    description: "Aprox. 450 - 700 palabras" 
  },
  { 
    value: "Media (6-9 min)", 
    label: "6-9 min", 
    description: "Aprox. 850 - 1250 palabras" 
  },
  { 
    value: "Larga (10-14 min)", 
    label: "10-14 min", 
    description: "Aprox. 1400 - 2000 palabras" 
  },
];

// [MEJORA ESTRATÉGICA]: Descripciones de profundidad enriquecidas
const depthOptions = [
  { 
    value: "Superficial", 
    label: "Básico", 
    description: "Visión general rápida, ideal para introducciones o resúmenes ejecutivos." 
  },
  { 
    value: "Intermedia", 
    label: "Medio", 
    description: "Exploración equilibrada con ejemplos y contexto relevante." 
  },
  { 
    value: "Profunda", 
    label: "Profundo", 
    description: "Análisis exhaustivo, matices complejos y múltiples perspectivas." 
  },
];

export function DetailsStep() {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="flex flex-col h-full w-full justify-center animate-fade-in px-2 md:px-6 overflow-y-auto scrollbar-hide pb-2">
      
      <div className="text-center mb-4 md:mb-8 flex-shrink-0 w-full">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Configuración Técnica
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Define la extensión y el nivel de análisis del episodio.
        </p>
      </div>
      
      {/* GRID 2 COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
        
        {/* COLUMNA 1: DURACIÓN */}
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xs font-bold text-muted-foreground text-center block uppercase tracking-widest">
                Duración del Episodio
              </FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-3">
                  {durationOptions.map((option) => (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={`dur-${option.value}`} className="sr-only" />
                      <label
                        htmlFor={`dur-${option.value}`}
                        className={cn(
                          "flex flex-col justify-center px-5 py-3 rounded-xl cursor-pointer transition-all duration-200 border h-full",
                          field.value === option.value
                            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/50 shadow-sm"
                            : "bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10"
                        )}
                      >
                        <div className="flex justify-between items-center w-full">
                            <span className={cn("text-sm font-bold", field.value === option.value ? "text-primary" : "text-foreground")}>
                            {option.label}
                            </span>
                            {/* Subtítulo de palabras a la derecha/abajo */}
                            <span className="text-[10px] text-muted-foreground font-medium bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md">
                            {option.description}
                            </span>
                        </div>
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
                Nivel de Profundidad
              </FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-3">
                  {depthOptions.map((option) => (
                    <div key={option.value} className="h-full">
                      <RadioGroupItem value={option.value} id={`depth-${option.value}`} className="sr-only" />
                      <label
                        htmlFor={`depth-${option.value}`}
                        className={cn(
                          "flex flex-row items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border h-full gap-3",
                          field.value === option.value
                            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/50 shadow-sm"
                            : "bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10"
                        )}
                      >
                        {/* Etiqueta Principal (Izquierda) */}
                        <span className={cn("text-sm font-bold min-w-[80px]", field.value === option.value ? "text-primary" : "text-foreground")}>
                          {option.label}
                        </span>
                        
                        {/* Descripción Rica (Derecha, multilínea) */}
                        <span className="text-[10px] text-muted-foreground font-medium text-right leading-snug opacity-80">
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