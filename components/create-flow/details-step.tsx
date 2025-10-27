// components/create-flow/details-step.tsx
// VERSIÓN FINAL Y ROBUSTA QUE ACEPTA `preselectedAgent` Y RENDERIZA CONDICIONALMENTE

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { AgentOption } from "@/lib/agent-config";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CardDescription, CardTitle } from "@/components/ui/card";

const durationOptions = [
  { value: "Corta", label: "Corta", description: "1-2 min" },
  { value: "Media", label: "Media", description: "3-5 min" },
  { value: "Larga", label: "Larga", description: "5-7 min" },
];

const depthOptions = [
  { value: "Superficial", label: "Superficial", description: "Introducción clara." },
  { value: "Intermedia", label: "Intermedia", description: "Explora matices." },
  { value: "Profunda", label: "Profunda", description: "Análisis exhaustivo." },
];

interface DetailsStepProps {
  agents: AgentOption[];
  preselectedAgent?: { title: string; description: string; };
}

export function DetailsStep({ agents, preselectedAgent }: DetailsStepProps) {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Detalles Finales</h2>
        <p className="text-muted-foreground">Ajusta los últimos parámetros clave para tu guion.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-center block">Duración Deseada *</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-3">
                  {durationOptions.map((option, index) => (
                    <div key={`duration-${index}`}>
                      <RadioGroupItem value={option.value} id={`duration-${index}`} className="sr-only" />
                      <Label htmlFor={`duration-${index}`} className={cn("flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 h-full", "border-2 bg-muted/30 hover:bg-muted/60", field.value === option.value ? "border-primary" : "border-transparent")}>
                        <CardTitle className="text-sm font-semibold">{option.label}</CardTitle>
                        <CardDescription className="text-xs">{option.description}</CardDescription>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="narrativeDepth"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-center block">Profundidad Narrativa *</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                  {depthOptions.map((option, index) => (
                    <div key={`depth-${index}`}>
                      <RadioGroupItem value={option.value} id={`depth-${index}`} className="sr-only" />
                      <Label htmlFor={`depth-${index}`} className={cn("flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 h-full", "border-2 bg-muted/30 hover:bg-muted/60", field.value === option.value ? "border-primary" : "border-transparent")}>
                        <CardTitle className="text-sm font-semibold">{option.label}</CardTitle>
                        <CardDescription className="text-xs text-center">{option.description}</CardDescription>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />
        
        <div className="space-y-3">
          <FormLabel className="text-base font-semibold text-center block">
            {preselectedAgent ? 'Arquetipo Seleccionado' : 'Agente Especializado *'}
          </FormLabel>
          {preselectedAgent ? (
            <div className={cn("flex flex-col items-center justify-center p-4 rounded-lg text-center h-full", "border-2 bg-muted/30 border-primary")}>
              <CardTitle className="text-sm font-semibold">{preselectedAgent.title}</CardTitle>
              <CardDescription className="text-xs">{preselectedAgent.description}</CardDescription>
            </div>
          ) : (
            <FormField
              control={control}
              name="selectedAgent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                      {agents.map((agent, index) => (
                        <div key={`agent-${index}`}>
                          <RadioGroupItem value={agent.value} id={`agent-${index}`} className="sr-only" />
                          <Label htmlFor={`agent-${index}`} className={cn("flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 text-center h-full", "border-2 bg-muted/30 hover:bg-muted/60", field.value === agent.value ? "border-primary" : "border-transparent")}>
                            <CardTitle className="text-sm font-semibold">{agent.label}</CardTitle>
                            <CardDescription className="text-xs">{agent.description}</CardDescription>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}