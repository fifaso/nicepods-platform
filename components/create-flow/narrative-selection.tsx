// components/create-flow/narrative-selection.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NarrativeOption } from "../podcast-creation-form"; // Importamos el tipo

// Ahora solo necesita recibir 'narrativeOptions' como prop.
interface NarrativeSelectionStepProps {
  narrativeOptions: NarrativeOption[];
}

export function NarrativeSelectionStep({ narrativeOptions }: NarrativeSelectionStepProps) {
  const { control, setValue } = useFormContext<PodcastCreationData>();

  return (
    <div className="space-y-6">
      <div className="text-center">
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
                  // Cuando el usuario selecciona una, buscamos el objeto completo y lo guardamos en el formulario.
                  const selectedNarrative = narrativeOptions.find(opt => opt.title === value);
                  setValue("link_selectedNarrative", selectedNarrative || null, { shouldValidate: true });
                }}
                className="flex flex-col space-y-2"
              >
                {narrativeOptions.map((option) => (
                  <FormItem key={option.title} className="flex items-center space-x-3 space-y-0 border p-4 rounded-md has-[[data-state=checked]]:border-primary">
                    <FormControl>
                      <RadioGroupItem value={option.title} />
                    </FormControl>
                    <FormLabel className="font-normal w-full cursor-pointer">
                      <p className="font-semibold">{option.title}</p>
                      <p className="text-sm text-muted-foreground">{option.thesis}</p>
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
  );
}