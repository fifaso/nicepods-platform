// components/create-flow/details-step.tsx
// VERSIÓN FINAL ADAPTATIVA: Grid Responsivo, Estética Glass y Cero Scroll.

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { AgentOption } from "@/lib/agent-config";
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

interface DetailsStepProps {
  agents: AgentOption[];
}

export function DetailsStep({ agents }: DetailsStepProps) {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    // CONTENEDOR PRINCIPAL: 
    // - h-full y justify-center para centrar verticalmente en escritorio.
    // - overflow-y-auto para permitir scroll interno en móviles pequeños si es necesario.
    <div className="flex flex-col h-full w-full justify-center animate-fade-in px-2 md:px-6 overflow-y-auto scrollbar-hide pb-2">
      
      {/* CABECERA */}
      <div className="text-center mb-4 md:mb-8 flex-shrink-0 w-full">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
          Detalles Finales
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Ajusta los parámetros clave para tu guion.
        </p>
      </div>
      
      {/* GRID MAESTRO: 
          - Móvil: 1 columna (stack vertical).
          - Escritorio: 3 columnas equidistantes.
          - gap-4: Espacio limpio.
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mx-auto">
        
        {/* --- SECCIÓN 1: DURACIÓN --- */}
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-foreground text-center block uppercase tracking-wider opacity-80">
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
                          // ESTILO ADAPTATIVO (GLASS):
                          field.value === option.value
                            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/50 shadow-md"
                            : "bg-white/40 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
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

        {/* --- SECCIÓN 2: PROFUNDIDAD --- */}
        <FormField
          control={control}
          name="narrativeDepth"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-foreground text-center block uppercase tracking-wider opacity-80">
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
                            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/50 shadow-md"
                            : "bg-white/40 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
                        )}
                      >
                        <span className={cn("text-sm font-bold", field.value === option.value ? "text-primary" : "text-foreground")}>
                          {option.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium max-w-[50%] text-right leading-tight">
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
        
        {/* --- SECCIÓN 3: AGENTE --- */}
        <FormField
          control={control}
          name="selectedAgent"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-foreground text-center block uppercase tracking-wider opacity-80">
                Estilo de IA
              </FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-2">
                  {agents.map((agent, index) => (
                    <div key={`agent-${index}`}>
                      <RadioGroupItem value={agent.value} id={`agent-${index}`} className="sr-only" />
                      <label
                        htmlFor={`agent-${index}`}
                        className={cn(
                          "flex flex-col px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border h-full",
                          field.value === agent.value
                            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/50 shadow-md"
                            : "bg-white/40 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
                        )}
                      >
                        <span className={cn("text-sm font-bold mb-0.5", field.value === agent.value ? "text-primary" : "text-foreground")}>
                          {agent.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                          {agent.description}
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