"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NarrativeOption } from "../podcast-creation-form";
import { BookOpen, Lightbulb, BarChart3 } from "lucide-react";

interface NarrativeSelectionStepProps {
  narrativeOptions: NarrativeOption[];
}

const toneOptions = [
  { value: "Educativo", label: "Educativo", description: "Enfoque claro, informativo y didáctico.", icon: BookOpen },
  { value: "Inspirador", label: "Inspirador", description: "Tono motivacional, optimista y edificante.", icon: Lightbulb },
  { value: "Analítico", label: "Analítico", description: "Profundo, estructurado y basado en datos.", icon: BarChart3 },
];

export function NarrativeSelectionStep({ narrativeOptions }: NarrativeSelectionStepProps) {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Elige una Narrativa</h2>
          <p className="text-muted-foreground">La IA ha generado estas posibles conexiones. Selecciona una.</p>
        </div>
        <FormField
          control={control}
          name="link_selectedNarrative"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    const selectedNarrative = narrativeOptions.find(opt => opt.title === value);
                    field.onChange(selectedNarrative || null);
                  }}
                  defaultValue={field.value?.title}
                  className="flex flex-col space-y-3"
                >
                  {narrativeOptions.map((option) => (
                    <FormItem key={option.title}>
                      <FormControl>
                        <RadioGroupItem value={option.title} className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={`flex flex-col p-4 border rounded-md cursor-pointer transition-all hover:border-primary/80 ${field.value?.title === option.title ? "border-primary ring-2 ring-primary/50" : "border-border"}`}
                      >
                        <p className="font-semibold">{option.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{option.thesis}</p>
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Selecciona un Tono</h2>
          <p className="text-muted-foreground">¿Cómo debería sonar tu micro-podcast?</p>
        </div>
        <FormField
          control={control}
          name="link_selectedTone"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {toneOptions.map((option) => (
                    <FormItem key={option.value}>
                      <FormControl>
                        <RadioGroupItem value={option.value} className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer transition-all hover:border-primary/80 ${field.value === option.value ? "border-primary ring-2 ring-primary/50" : "border-border"}`}
                      >
                        <option.icon className="h-6 w-6 mb-2" />
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-xs text-muted-foreground text-center mt-1">{option.description}</p>
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}