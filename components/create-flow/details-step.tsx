// components/create-flow/details-step.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { AgentOption } from "@/lib/agent-config";
import { cn } from "@/lib/utils";

// --- Importaciones de Componentes de UI ---
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CardDescription, CardTitle } from "@/components/ui/card"; // Solo necesitamos estos para el texto
import { Label } from "@/components/ui/label";

// Definimos los datos para nuestras tarjetas de selección visual.
const durationOptions = [
  { value: "Corta (1-2 minutos)", label: "Corta", description: "1-2 min" },
  { value: "Media (3-5 minutos)", label: "Media", description: "3-5 min" },
  { value: "Larga (5-7 minutos)", label: "Larga", description: "5-7 min" },
];

const depthOptions = [
  { value: "Superficial", label: "Superficial", description: "Introducción clara." },
  { value: "Intermedia", label: "Intermedia", description: "Explora matices." },
  { value: "Profunda", label: "Profunda", description: "Análisis exhaustivo." },
];

export function DetailsStep({ agents }: { agents: AgentOption[] }) {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Detalles Finales</h2>
        <p className="text-muted-foreground">Ajusta los últimos parámetros clave para tu guion.</p>
      </div>
      
      {/* ================== MODIFICACIÓN ESTRATÉGICA: EL MOSAICO 3x3 ================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        
        {/* --- Columna 1: Duración --- */}
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-center block">Duración Deseada *</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                  {durationOptions.map((option, index) => (
                    <FormItem key={`duration-${index}`}>
                      <FormControl>
                        <RadioGroupItem value={option.value} id={`duration-${index}`} className="sr-only" />
                      </FormControl>
                      <Label
                        htmlFor={`duration-${index}`}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200",
                          "border-2 border-transparent bg-muted/50 hover:bg-muted",
                          "data-[state=checked]:bg-primary/10 data-[state=checked]:border-primary"
                        )}
                      >
                        <CardTitle className="text-sm font-semibold">{option.label}</CardTitle>
                        <CardDescription className="text-xs">{option.description}</CardDescription>
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />

        {/* --- Columna 2: Profundidad --- */}
        <FormField
          control={control}
          name="narrativeDepth"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-center block">Profundidad Narrativa *</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                  {depthOptions.map((option, index) => (
                    <FormItem key={`depth-${index}`}>
                      <FormControl>
                        <RadioGroupItem value={option.value} id={`depth-${index}`} className="sr-only" />
                      </FormControl>
                      <Label
                        htmlFor={`depth-${index}`}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200",
                          "border-2 border-transparent bg-muted/50 hover:bg-muted",
                          "data-[state=checked]:bg-primary/10 data-[state=checked]:border-primary"
                        )}
                      >
                        <CardTitle className="text-sm font-semibold">{option.label}</CardTitle>
                        <CardDescription className="text-xs text-center">{option.description}</CardDescription>
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />
        
        {/* --- Columna 3: Agente Especializado --- */}
        <FormField
          control={control}
          name="selectedAgent"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-center block">Agente Especializado *</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                  {agents.map((agent, index) => (
                    <FormItem key={`agent-${index}`}>
                      <FormControl>
                        <RadioGroupItem value={agent.value} id={`agent-${index}`} className="sr-only" />
                      </FormControl>
                      <Label
                        htmlFor={`agent-${index}`}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 text-center",
                          "border-2 border-transparent bg-muted/50 hover:bg-muted",
                          "data-[state=checked]:bg-primary/10 data-[state=checked]:border-primary"
                        )}
                      >
                        <CardTitle className="text-sm font-semibold">{agent.label}</CardTitle>
                        <CardDescription className="text-xs">{agent.description}</CardDescription>
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}